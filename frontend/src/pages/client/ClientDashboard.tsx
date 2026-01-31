/**
 * Client Dashboard - Premium Builder Dashboard
 * 
 * Main dashboard for wedding clients after login.
 * Features: Overview, Wedding Builder, Photo Gallery, Guests, Timeline
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Heart, LogOut, Users, Image, Calendar, Gift, Camera, Star,
    MessageCircle, Settings, Eye, Share2, Edit3, Palette, Music,
    Clock, MapPin, Phone, Mail, ExternalLink, Copy, QrCode, Plus,
    Check, Sparkles, Layout, Bell, Crown
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const ClientDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [weddingData, setWeddingData] = useState({
        coupleName: 'John & Jane',
        weddingDate: '2026-03-15',
        venue: 'Grand Hotel Ballroom',
        guestCount: 150,
        photosCount: 0,
        wishesCount: 0,
        galleryViews: 0,
        theme: 'Modern Elegance',
        shareUrl: 'weddingweb.co.in/w/john-jane-2026'
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        coupleName: weddingData.coupleName,
        weddingDate: weddingData.weddingDate,
        venue: weddingData.venue,
        guestCount: weddingData.guestCount
    });

    // Mock user from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleSignOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/company/login');
        showSuccess('Signed out successfully');
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`https://${weddingData.shareUrl}`);
        showSuccess('Link copied to clipboard!');
    };

    const handleSaveChanges = () => {
        setWeddingData(prev => ({
            ...prev,
            ...editForm
        }));
        setIsEditing(false);
        showSuccess('Changes saved successfully!');
    };

    // Premium features list
    const premiumFeatures = [
        { icon: Camera, name: 'Photo Gallery', desc: 'Unlimited uploads with face recognition', active: true },
        { icon: Music, name: 'Music Player', desc: 'Custom playlist for your wedding', active: false },
        { icon: Palette, name: 'Custom Theme', desc: 'Premium themes and customization', active: true },
        { icon: Gift, name: 'Digital RSVP', desc: 'Track guest responses in real-time', active: false },
        { icon: Bell, name: 'Notifications', desc: 'Send reminders to guests', active: false },
        { icon: QrCode, name: 'QR Invites', desc: 'Scannable invitation codes', active: true }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-rose-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
                                <Heart className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                                    Premium Builder
                                </h1>
                                <p className="text-xs text-gray-500">Wedding Dashboard</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="hidden sm:flex items-center gap-1 border-amber-300 text-amber-700 bg-amber-50">
                                <Crown className="w-3 h-3" />
                                Premium
                            </Badge>
                            <span className="text-sm text-gray-600 hidden md:block">
                                {user.username || 'Client'}
                            </span>
                            <Button
                                onClick={handleSignOut}
                                variant="ghost"
                                size="sm"
                                className="text-gray-600 hover:text-rose-600"
                            >
                                <LogOut className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Welcome Banner */}
                <Card className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white border-0 shadow-xl mb-8 overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10"></div>
                    <CardContent className="p-6 sm:p-8 relative">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold mb-2">{weddingData.coupleName}</h2>
                                <div className="flex flex-wrap items-center gap-3 text-pink-100">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(weddingData.weddingDate).toLocaleDateString('en-US', {
                                            month: 'long', day: 'numeric', year: 'numeric'
                                        })}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {weddingData.venue}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="bg-white/20 hover:bg-white/30 text-white border-0"
                                    onClick={() => window.open(`https://${weddingData.shareUrl}`, '_blank')}
                                >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Preview
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="bg-white/20 hover:bg-white/30 text-white border-0"
                                    onClick={handleCopyLink}
                                >
                                    <Share2 className="w-4 h-4 mr-1" />
                                    Share
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {[
                        { icon: Users, value: weddingData.guestCount, label: 'Guests', color: 'text-blue-500' },
                        { icon: Image, value: weddingData.photosCount, label: 'Photos', color: 'text-green-500' },
                        { icon: MessageCircle, value: weddingData.wishesCount, label: 'Wishes', color: 'text-pink-500' },
                        { icon: Eye, value: weddingData.galleryViews, label: 'Views', color: 'text-purple-500' }
                    ].map((stat) => (
                        <Card key={stat.label} className="bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-4 text-center">
                                <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                <p className="text-sm text-gray-500">{stat.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full bg-white/80 backdrop-blur-sm rounded-xl p-1">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                            <Layout className="w-4 h-4" />
                            <span className="hidden sm:inline">Overview</span>
                        </TabsTrigger>
                        <TabsTrigger value="builder" className="flex items-center gap-2">
                            <Edit3 className="w-4 h-4" />
                            <span className="hidden sm:inline">Builder</span>
                        </TabsTrigger>
                        <TabsTrigger value="gallery" className="flex items-center gap-2">
                            <Camera className="w-4 h-4" />
                            <span className="hidden sm:inline">Gallery</span>
                        </TabsTrigger>
                        <TabsTrigger value="guests" className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span className="hidden sm:inline">Guests</span>
                        </TabsTrigger>
                        <TabsTrigger value="timeline" className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="hidden sm:inline">Timeline</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Quick Actions */}
                            <Card className="bg-white/80 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-amber-500" />
                                        Quick Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-3">
                                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setActiveTab('builder')}>
                                        <Edit3 className="w-5 h-5 text-rose-500" />
                                        <span className="text-sm">Edit Website</span>
                                    </Button>
                                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setActiveTab('gallery')}>
                                        <Camera className="w-5 h-5 text-green-500" />
                                        <span className="text-sm">Upload Photos</span>
                                    </Button>
                                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setActiveTab('guests')}>
                                        <Users className="w-5 h-5 text-blue-500" />
                                        <span className="text-sm">Manage Guests</span>
                                    </Button>
                                    <Button variant="outline" className="h-20 flex-col gap-2" onClick={handleCopyLink}>
                                        <Share2 className="w-5 h-5 text-purple-500" />
                                        <span className="text-sm">Share Invite</span>
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Premium Features */}
                            <Card className="bg-white/80 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Crown className="w-5 h-5 text-amber-500" />
                                        Premium Features
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {premiumFeatures.map((feature) => (
                                        <div key={feature.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <feature.icon className="w-5 h-5 text-gray-600" />
                                                <div>
                                                    <p className="font-medium text-sm">{feature.name}</p>
                                                    <p className="text-xs text-gray-500">{feature.desc}</p>
                                                </div>
                                            </div>
                                            {feature.active ? (
                                                <Badge className="bg-green-100 text-green-700">Active</Badge>
                                            ) : (
                                                <Button size="sm" variant="outline" className="text-xs">
                                                    Unlock
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Share URL Card */}
                        <Card className="bg-white/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ExternalLink className="w-5 h-5 text-blue-500" />
                                    Your Wedding Website
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Input
                                        value={`https://${weddingData.shareUrl}`}
                                        readOnly
                                        className="bg-white font-mono text-sm"
                                    />
                                    <Button onClick={handleCopyLink} variant="outline" size="icon">
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                    <Button onClick={() => window.open(`https://${weddingData.shareUrl}`, '_blank')} variant="outline" size="icon">
                                        <ExternalLink className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Builder Tab */}
                    <TabsContent value="builder" className="space-y-6">
                        <Card className="bg-white/80 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Wedding Details</CardTitle>
                                    <CardDescription>Customize your wedding website content</CardDescription>
                                </div>
                                {!isEditing ? (
                                    <Button onClick={() => setIsEditing(true)} variant="outline">
                                        <Edit3 className="w-4 h-4 mr-2" />
                                        Edit
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button onClick={() => setIsEditing(false)} variant="ghost" size="sm">Cancel</Button>
                                        <Button onClick={handleSaveChanges} size="sm">
                                            <Check className="w-4 h-4 mr-1" />
                                            Save
                                        </Button>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Couple Names</Label>
                                        <Input
                                            value={isEditing ? editForm.coupleName : weddingData.coupleName}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, coupleName: e.target.value }))}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Wedding Date</Label>
                                        <Input
                                            type="date"
                                            value={isEditing ? editForm.weddingDate : weddingData.weddingDate}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, weddingDate: e.target.value }))}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Venue</Label>
                                        <Input
                                            value={isEditing ? editForm.venue : weddingData.venue}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, venue: e.target.value }))}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Expected Guests</Label>
                                        <Input
                                            type="number"
                                            value={isEditing ? editForm.guestCount : weddingData.guestCount}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, guestCount: parseInt(e.target.value) }))}
                                            disabled={!isEditing}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Theme Selector */}
                        <Card className="bg-white/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Palette className="w-5 h-5 text-purple-500" />
                                    Theme Selection
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {['Modern Elegance', 'Classic Romance', 'Rustic Charm', 'Minimalist'].map((theme) => (
                                        <div
                                            key={theme}
                                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${weddingData.theme === theme
                                                    ? 'border-rose-500 bg-rose-50'
                                                    : 'border-gray-200 hover:border-rose-300'
                                                }`}
                                            onClick={() => setWeddingData(prev => ({ ...prev, theme }))}
                                        >
                                            <div className="h-20 rounded bg-gradient-to-br from-rose-100 to-pink-200 mb-2"></div>
                                            <p className="text-sm font-medium text-center">{theme}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Gallery Tab */}
                    <TabsContent value="gallery" className="space-y-6">
                        <Card className="bg-white/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Camera className="w-5 h-5 text-green-500" />
                                    Photo Gallery
                                </CardTitle>
                                <CardDescription>Upload and manage your wedding photos</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-rose-400 transition-colors cursor-pointer">
                                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-700 mb-2">Upload Photos</h3>
                                    <p className="text-sm text-gray-500 mb-4">Drag and drop or click to select photos</p>
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Select Photos
                                    </Button>
                                </div>

                                {weddingData.photosCount === 0 && (
                                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-blue-700">
                                            <strong>Pro Tip:</strong> Upload photos and we'll automatically detect faces for easy tagging and guest photo finding!
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Guests Tab */}
                    <TabsContent value="guests" className="space-y-6">
                        <Card className="bg-white/80 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-blue-500" />
                                        Guest Management
                                    </CardTitle>
                                    <CardDescription>Manage your guest list and track RSVPs</CardDescription>
                                </div>
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Guest
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12">
                                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-700 mb-2">No Guests Yet</h3>
                                    <p className="text-sm text-gray-500 mb-4">Start by adding your first guest or importing a list</p>
                                    <div className="flex gap-3 justify-center">
                                        <Button variant="outline">
                                            Import CSV
                                        </Button>
                                        <Button>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Guest
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Timeline Tab */}
                    <TabsContent value="timeline" className="space-y-6">
                        <Card className="bg-white/80 backdrop-blur-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-amber-500" />
                                        Event Timeline
                                    </CardTitle>
                                    <CardDescription>Plan your wedding day schedule</CardDescription>
                                </div>
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Event
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { time: '10:00 AM', event: 'Guest Arrival', desc: 'Welcome drinks and registration' },
                                        { time: '11:00 AM', event: 'Ceremony', desc: 'Main wedding ceremony' },
                                        { time: '1:00 PM', event: 'Lunch Reception', desc: 'Formal dining and speeches' },
                                        { time: '4:00 PM', event: 'Party Time', desc: 'Music, dancing, and celebration' }
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex gap-4 items-start p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <div className="text-center min-w-[80px]">
                                                <p className="font-bold text-rose-600">{item.time}</p>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{item.event}</p>
                                                <p className="text-sm text-gray-500">{item.desc}</p>
                                            </div>
                                            <Button variant="ghost" size="icon">
                                                <Edit3 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>

            {/* Footer */}
            <footer className="bg-white/80 border-t border-gray-200 py-6 mt-12">
                <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
                    <p>© 2026 WeddingWeb Premium. Need help? <a href="/company/contact" className="text-rose-600 hover:underline">Contact Support</a></p>
                </div>
            </footer>
        </div>
    );
};

export default ClientDashboard;
