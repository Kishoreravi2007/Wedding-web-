import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Mail, Settings as SettingsIcon, LogOut, Home, Save, RefreshCcw, Loader2, MessageSquare } from 'lucide-react';

const defaultGeneralSettings = {
  companyName: 'Wedding Website',
  supportEmail: 'support@weddingweb.com',
  contactNumber: '+91 79071 77841',
  brandTagline: 'Capturing every magical moment.',
  aboutCompany: 'Tell couples why your studio is special. This text appears across the admin experience for context.'
};

const defaultFeatureSettings = {
  enablePhotoBooth: true,
  enableFaceRecognition: true,
  enableWishes: true,
  enableLiveStream: false,
  autoArchiveCompleted: true,
  weeklyReports: false
};

const AdminSettings: React.FC = () => {
  const [generalSettings, setGeneralSettings] = useState(defaultGeneralSettings);
  const [featureSettings, setFeatureSettings] = useState(defaultFeatureSettings);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

  const parseBoolean = (value: unknown, fallback: boolean) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return ['true', '1', 'yes'].includes(value.toLowerCase());
    }
    return fallback;
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_BASE_URL}/api/settings`);

      if (!response.ok) {
        throw new Error('Failed to load settings');
      }

      const data = await response.json();

      setGeneralSettings({
        companyName: data.company_name || defaultGeneralSettings.companyName,
        supportEmail: data.support_email || defaultGeneralSettings.supportEmail,
        contactNumber: data.contact_number || defaultGeneralSettings.contactNumber,
        brandTagline: data.brand_tagline || defaultGeneralSettings.brandTagline,
        aboutCompany: data.about_company || defaultGeneralSettings.aboutCompany
      });

      setFeatureSettings({
        enablePhotoBooth: parseBoolean(data.enable_photo_booth, defaultFeatureSettings.enablePhotoBooth),
        enableFaceRecognition: parseBoolean(data.enable_face_recognition, defaultFeatureSettings.enableFaceRecognition),
        enableWishes: parseBoolean(data.enable_guest_wishes ?? data.enable_wishes, defaultFeatureSettings.enableWishes),
        enableLiveStream: parseBoolean(data.enable_live_stream, defaultFeatureSettings.enableLiveStream),
        autoArchiveCompleted: parseBoolean(data.auto_archive_completed, defaultFeatureSettings.autoArchiveCompleted),
        weeklyReports: parseBoolean(data.weekly_reports_enabled, defaultFeatureSettings.weeklyReports)
      });
    } catch (err) {
      console.error('Error loading settings', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const buildPayload = () => ({
    company_name: generalSettings.companyName,
    support_email: generalSettings.supportEmail,
    contact_number: generalSettings.contactNumber,
    brand_tagline: generalSettings.brandTagline,
    about_company: generalSettings.aboutCompany,
    enable_photo_booth: featureSettings.enablePhotoBooth,
    enable_face_recognition: featureSettings.enableFaceRecognition,
    enable_guest_wishes: featureSettings.enableWishes,
    enable_live_stream: featureSettings.enableLiveStream,
    auto_archive_completed: featureSettings.autoArchiveCompleted,
    weekly_reports_enabled: featureSettings.weeklyReports
  });

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('Please log in again to update settings.');
      }

      const response = await fetch(`${API_BASE_URL}/api/settings/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(buildPayload())
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || 'Failed to save settings');
      }

      setSuccess('Settings updated successfully.');
    } catch (err) {
      console.error('Error saving settings', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSuccess('');
    fetchSettings();
  };

  const handleGeneralChange = (field: keyof typeof generalSettings, value: string) => {
    setGeneralSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleFeatureToggle = (field: keyof typeof featureSettings, value: boolean) => {
    setFeatureSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Wedding Website Admin
              </h1>
              <nav className="flex gap-4 ml-8">
                <Link to="/admin/dashboard">
                  <Button variant="ghost" size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    Weddings
                  </Button>
                </Link>
                <Link to="/admin/contact-messages">
                  <Button variant="ghost" size="sm">
                    <Mail className="mr-2 h-4 w-4" />
                    Messages
                  </Button>
                </Link>
                <Link to="/admin/feedback">
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Feedbacks
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="ghost" size="sm">
                    <Home className="mr-2 h-4 w-4" />
                    View Site
                  </Button>
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleReset} disabled={loading}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Reload
              </Button>
              <Button 
                size="sm" 
                className="bg-pink-600 hover:bg-pink-700 text-white"
                onClick={handleSave}
                disabled={saving || loading}
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="ghost" size="sm" className="bg-gray-100">
                <SettingsIcon className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button variant="ghost" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        <div className="container mx-auto px-6 space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Settings</h2>
            <p className="text-gray-600">
              Configure branding, communication details, and feature access for each wedding experience.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex items-center gap-3 text-gray-600">
              <Loader2 className="animate-spin" />
              Loading settings from Supabase...
            </div>
          ) : (
            <>

          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>These values appear across the admin portal and client-facing pages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Brand Name</Label>
                  <Input
                    id="companyName"
                    value={generalSettings.companyName}
                    onChange={(e) => handleGeneralChange('companyName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={generalSettings.supportEmail}
                    onChange={(e) => handleGeneralChange('supportEmail', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    value={generalSettings.contactNumber}
                    onChange={(e) => handleGeneralChange('contactNumber', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="brandTagline">Brand Tagline</Label>
                  <Input
                    id="brandTagline"
                    value={generalSettings.brandTagline}
                    onChange={(e) => handleGeneralChange('brandTagline', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="aboutCompany">About Company</Label>
                <Textarea
                  id="aboutCompany"
                  rows={4}
                  value={generalSettings.aboutCompany}
                  onChange={(e) => handleGeneralChange('aboutCompany', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
              <CardDescription>Enable or disable platform functionality per wedding.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { field: 'enablePhotoBooth', label: 'Photo Booth & Face Match' },
                { field: 'enableFaceRecognition', label: 'Face Recognition Search' },
                { field: 'enableWishes', label: 'Digital Wishes Wall' },
                { field: 'enableLiveStream', label: 'Live Stream Module' },
                { field: 'autoArchiveCompleted', label: 'Auto-archive completed weddings' },
                { field: 'weeklyReports', label: 'Send weekly performance report' }
              ].map(item => (
                <div key={item.field} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">
                      {item.field === 'autoArchiveCompleted'
                        ? 'Automatically moves weddings to archive 30 days after completion.'
                        : item.field === 'weeklyReports'
                          ? 'Email summary of gallery views, downloads and wishes.'
                          : 'Toggle availability for every new wedding you create.'}
                    </p>
                  </div>
                  <Switch
                    checked={featureSettings[item.field as keyof typeof featureSettings]}
                    onCheckedChange={(checked) => handleFeatureToggle(item.field as keyof typeof featureSettings, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data & Maintenance</CardTitle>
              <CardDescription>Quick utilities to keep your Supabase data healthy.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg bg-white">
                <h3 className="font-semibold mb-2">Data Backups</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Export wedding, people, and photo metadata for safekeeping.
                </p>
                <Button variant="outline" className="w-full">Download CSV Export</Button>
              </div>
              <div className="p-4 border rounded-lg bg-white">
                <h3 className="font-semibold mb-2">Storage Cleanup</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Find orphan files in Supabase Storage and reclaim space.
                </p>
                <Button variant="outline" className="w-full">Run Cleanup Scan</Button>
              </div>
            </CardContent>
          </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;


