const express = require('express');
const router = express.Router();
const axios = require('axios');
const querystring = require('querystring');
const { supabase } = require('../lib/supabase'); // Or your DB adapter

// Environment variables
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:5005/api/auth/spotify/callback';

// Mock Data for demonstration
const MOCK_PLAYLISTS = [
    { id: '37i9dQZF1DX2XmsLLafkO9', name: 'Wedding Impressions', images: [{ url: 'https://i.scdn.co/image/ab67706f00000003b8e72a44e6bf7f872583840e' }], external_urls: { spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX2XmsLLafkO9' } },
    { id: '37i9dQZF1DX4sWSpwq3LiO', name: 'Peaceful Piano', images: [{ url: 'https://i.scdn.co/image/ab67706f00000003caec09a3df69df6584dc7e5c' }], external_urls: { spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO' } },
    { id: '37i9dQZF1DXbTxeAdrVG2l', name: 'All Out 90s', images: [{ url: 'https://i.scdn.co/image/ab67706f000000037a505bdf993922c262102146' }], external_urls: { spotify: 'https://open.spotify.com/playlist/37i9dQZF1DXbTxeAdrVG2l' } },
    { id: '37i9dQZF1DX4DyDY8odYu0', name: 'Romantic Ballads', images: [{ url: 'https://i.scdn.co/image/ab67706f00000003882772719602434529f7961f' }], external_urls: { spotify: 'https://open.spotify.com/playlist/37i9dQZF1DX4DyDY8odYu0' } }
];

// Helper to check if we are in Mock Mode
const isMockMode = () => !CLIENT_ID || !CLIENT_SECRET;

/**
 * Initiates Spotify OAuth flow
 * GET /api/auth/spotify/login
 */
router.get('/login', (req, res) => {
    if (isMockMode()) {
        console.log('⚠️ Spotify credentials missing. Using MOCK MODE.');
        // In mock mode, skip straight to callback with a fake code
        return res.redirect(`${REDIRECT_URI}?code=mock_auth_code_123`);
    }

    const scope = 'playlist-read-private playlist-read-collaborative';
    const queryParams = querystring.stringify({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: scope,
        redirect_uri: REDIRECT_URI,
    });

    res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

/**
 * Callback handler
 * GET /api/auth/spotify/callback
 */
router.get('/callback', async (req, res) => {
    const code = req.query.code || null;
    const error = req.query.error || null;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';

    if (error) {
        return res.redirect(`${frontendUrl}/client?error=spotify_denied`);
    }

    if (isMockMode()) {
        // Mock success
        return res.redirect(`${frontendUrl}/client?spotify_connected=true&mock=true`);
    }

    try {
        const response = await axios({
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            data: querystring.stringify({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI,
            }),
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
            },
        });

        const { access_token, refresh_token } = response.data;

        // In a real app, you'd associate this access_token with the logged-in user session 
        // OR return a temporary token to the frontend to fetch playlists immediately.
        // For security, we'll redirect with a flag and let the frontend request playlists using a session cookie or similar.
        // Simplified: We'll attach a short-lived query param (Not production secure, but suitable for this prototype phase)
        // Better: Set an HttpOnly cookie 'spotify_access_token'

        res.cookie('spotify_token', access_token, { httpOnly: true, maxAge: 3600000 }); // 1 hour
        res.redirect(`${frontendUrl}/client?spotify_connected=true`);

    } catch (err) {
        console.error('Spotify Auth Error:', err.response?.data || err.message);
        res.redirect(`${frontendUrl}/client?error=spotify_failed`);
    }
});

/**
 * Fetch User Playlists
 * GET /api/auth/spotify/playlists
 */
router.get('/playlists', async (req, res) => {
    // If Mock Mode
    if (isMockMode() || req.query.mock === 'true') {
        return res.json({ success: true, items: MOCK_PLAYLISTS });
    }

    // Get token from cookie (or header if you prefer)
    // Note: requires cookie-parser middleware in server.js
    const accessToken = req.cookies?.spotify_token;

    if (!accessToken) {
        return res.status(401).json({ success: false, message: 'Not authenticated with Spotify' });
    }

    try {
        const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        res.json({ success: true, items: response.data.items });
    } catch (error) {
        console.error('Error fetching playlists:', error.response?.data || error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch playlists' });
    }
});

module.exports = router;
