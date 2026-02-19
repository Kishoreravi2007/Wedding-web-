const express = require('express');
const router = express.Router();
const { query } = require('../lib/db-gcp');
const { authMiddleware } = require('../lib/secure-auth');

/**
 * GET /api/coupons/validate/:code - Publicly validate a coupon code
 */
router.get('/validate/:code', async (req, res) => {
    const { code } = req.params;
    try {
        const { rows } = await query(
            'SELECT * FROM coupons WHERE LOWER(code) = LOWER($1) AND status = \'active\'',
            [code]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Coupon not found or inactive' });
        }

        const coupon = rows[0];

        // Check expiry
        if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
            return res.status(400).json({ message: 'Coupon has expired' });
        }

        // Check usage limit
        if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
            return res.status(400).json({ message: 'Coupon usage limit reached' });
        }

        res.json({
            valid: true,
            code: coupon.code,
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
            min_purchase: coupon.min_purchase
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Apply admin protection to all OTHER coupon routes (CRUD)
router.use(authMiddleware.verifyToken);
router.use((req, res, next) => {
    if (req.user && req.user.role === 'admin') return next();
    res.status(403).json({ message: 'Admin access required' });
});

/**
 * GET /api/coupons - List all coupons
 */
router.get('/', async (req, res) => {
    try {
        const { rows } = await query('SELECT * FROM coupons ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/coupons - Create a new coupon
 */
router.post('/', async (req, res) => {
    const { code, discount_type, discount_value, usage_limit, expiry_date, min_purchase } = req.body;
    if (!code || !discount_type || !discount_value) {
        return res.status(400).json({ message: 'Code, type and value are required' });
    }

    try {
        const { rows } = await query(
            `INSERT INTO coupons (code, discount_type, discount_value, usage_limit, expiry_date, min_purchase)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
            [code, discount_type, discount_value, usage_limit || 100, expiry_date, min_purchase || 0]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * PATCH /api/coupons/:id - Update coupon status or details
 */
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const { status, usage_limit } = req.body;

    try {
        const { rows } = await query(
            'UPDATE coupons SET status = COALESCE($1, status), usage_limit = COALESCE($2, usage_limit), updated_at = NOW() WHERE id = $3 RETURNING *',
            [status, usage_limit, id]
        );
        if (rows.length === 0) return res.status(404).json({ message: 'Coupon not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * DELETE /api/coupons/:id - Delete a coupon
 */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await query('DELETE FROM coupons WHERE id = $1', [id]);
        res.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
