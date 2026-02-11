/**
 * Live Camera Sync Dashboard
 * 
 * Allows photographers to:
 * - Generate API keys for desktop app
 * - View upload status
 * - Configure live sync settings
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LiveGallery } from '@/components/LiveGallery';
import { API_BASE_URL, getAuthHeaders, getAccessToken } from '@/lib/api';
import axios from 'axios';
import {
  Camera,
  Key,
  Copy,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Wifi,
  WifiOff,
  Settings,
  FolderOpen,
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

interface ApiKey {
  id: string;
  key_name: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
  expires_at: string | null;
}

export default function LiveSyncDashboard() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPhotographer, setIsLoadingPhotographer] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [photographerId, setPhotographerId] = useState<string | null>(null);
  const [selectedSister, setSelectedSister] = useState<'sister-a' | 'sister-b' | 'none'>('none');
  const [timelineEvents, setTimelineEvents] = useState<string[]>([]);
  const [currentWedding, setCurrentWedding] = useState<any>(null);

  useEffect(() => {
    loadPhotographerInfo();
    loadWeddingEvents();
  }, []);

  useEffect(() => {
    if (photographerId) {
      loadApiKeys();
    }
  }, [photographerId]);

  const loadPhotographerInfo = async () => {
    try {
      setIsLoadingPhotographer(true);
      // Get photographer ID from token or user context
      const token = getAccessToken();
      if (token) {
        // Decode JWT to get user ID (simplified - in production use proper JWT library)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const id = payload.id || payload.userId || payload.user?.id || null;
          setPhotographerId(id);
        } catch {
          // Fallback: try to get from API
          try {
            const response = await axios.get(`${API_BASE_URL}/api/users/me`, {
              headers: getAuthHeaders(),
            });
            setPhotographerId(response.data.id || response.data.user?.id);
          } catch (apiErr) {
            console.error('Error fetching user from API:', apiErr);
            // Last resort: try to get from auth endpoint
            const authResponse = await axios.get(`${API_BASE_URL}/api/auth/me`, {
              headers: getAuthHeaders(),
            });
            setPhotographerId(authResponse.data.id || authResponse.data.user?.id);
          }
        }
      }
    } catch (err) {
      console.error('Error loading photographer info:', err);
    } finally {
      setIsLoadingPhotographer(false);
    }
  };

  const loadWeddingEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/photographer/wedding`, {
        headers: getAuthHeaders(),
      });
      if (response.data.success) {
        setTimelineEvents(response.data.wedding.events || []);
        setCurrentWedding(response.data.wedding);
      }
    } catch (err) {
      console.error('Error loading wedding events:', err);
    }
  };

  const loadApiKeys = async () => {
    if (!photographerId) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/api/live/api-keys`, {
        params: { photographerId },
        headers: getAuthHeaders(),
      });
      setApiKeys(response.data.keys || []);
    } catch (err: any) {
      console.error('Error loading API keys:', err);
      showError(err.response?.data?.message || 'Failed to load API keys');
    }
  };

  const generateApiKey = async () => {
    if (!photographerId) {
      showError('Photographer ID not found. Please log in again.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/live/api-keys`,
        {
          photographerId,
          keyName: newKeyName || 'Desktop App',
        },
        { headers: getAuthHeaders() }
      );

      setGeneratedKey(response.data.apiKey);
      setNewKeyName('');
      showSuccess('API key generated successfully! Copy it now - it won\'t be shown again.');
      loadApiKeys();
    } catch (err: any) {
      console.error('Error generating API key:', err);
      showError(err.response?.data?.message || 'Failed to generate API key');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess('Copied to clipboard!');
  };

  const revokeApiKey = async (keyId: string) => {
    if (!photographerId) return;
    if (!confirm('Are you sure you want to revoke this API key?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/live/api-keys/${keyId}`, {
        params: { photographerId },
        headers: getAuthHeaders(),
      });
      showSuccess('API key revoked successfully');
      loadApiKeys();
    } catch (err: any) {
      console.error('Error revoking API key:', err);
      showError(err.response?.data?.message || 'Failed to revoke API key');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  if (isLoadingPhotographer) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 min-h-[400px]">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Camera className="w-6 h-6" />
          Live Camera Sync
        </h2>
        <p className="text-gray-600 mt-1">
          Connect your camera to upload photos instantly to WeddingWeb
        </p>
      </div>

      {!photographerId && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load photographer information. Please try logging out and logging back in.
            <br />
            <small className="text-xs text-gray-500 mt-2 block">
              Debug: Token valid: {getAccessToken() ? 'Yes' : 'No'}
            </small>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="gallery">Live Gallery</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Desktop App Setup</CardTitle>
              <CardDescription>
                Generate an API key to connect your desktop app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keyName">Key Name (optional)</Label>
                <Input
                  id="keyName"
                  placeholder="e.g., Canon Camera, Laptop App"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>

              <Button onClick={generateApiKey} disabled={isLoading || !photographerId}>
                <Key className="w-4 h-4 mr-2" />
                Generate API Key
              </Button>

              {generatedKey && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-semibold">⚠️ Copy this API key now!</p>
                      <p className="text-sm">It won't be shown again after you close this page.</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-2 bg-gray-100 rounded text-sm break-all">
                          {generatedKey}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(generatedKey)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="pt-4 border-t space-y-2">
                <h3 className="font-semibold">Next Steps:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  <li>Download and install the WeddingWeb Desktop App</li>
                  <li>Open the app and enter your API key</li>
                  <li>Select your camera or hot folder</li>
                  <li>Choose the event to upload to</li>
                  <li>Start shooting - photos will upload automatically!</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Camera Support</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Canon</h4>
                  <p className="text-sm text-gray-600">
                    Canon EDSDK integration (requires Canon SDK)
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Nikon</h4>
                  <p className="text-sm text-gray-600">
                    Nikon MAID SDK integration (requires Nikon SDK)
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Sony</h4>
                  <p className="text-sm text-gray-600">
                    Sony Camera Remote SDK (requires Sony SDK)
                  </p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm">
                  <strong>Universal Mode:</strong> If SDK integration is not available, use the
                  Hot Folder mode. Configure your camera software (e.g., Lightroom) to save photos
                  to a watched folder, and the desktop app will auto-upload them.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your API Keys</CardTitle>
              <CardDescription>Manage API keys for your desktop apps</CardDescription>
            </CardHeader>
            <CardContent>
              {apiKeys.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No API keys yet</p>
              ) : (
                <div className="space-y-3">
                  {apiKeys.map((key) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{key.key_name}</span>
                          {key.is_active ? (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <XCircle className="w-3 h-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Created: {formatDate(key.created_at)}</p>
                          <p>Last used: {formatDate(key.last_used_at)}</p>
                          {key.expires_at && (
                            <p>Expires: {formatDate(key.expires_at)}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => revokeApiKey(key.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Photo Gallery</CardTitle>
              <CardDescription>
                View photos as they are uploaded in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label>Select Event (Gallery Filter)</Label>
                <select
                  className="w-full mt-2 p-2 border rounded"
                  value={selectedSister}
                  onChange={(e) => setSelectedSister(e.target.value as any)}
                >
                  <option value="none">All Live Photos</option>
                  <option value="sister-a">Stream A</option>
                  <option value="sister-b">Stream B</option>
                  {timelineEvents.map((event) => (
                    <option key={event} value={event}>
                      {event}
                    </option>
                  ))}
                </select>
                {currentWedding && (
                  <p className="text-xs text-gray-500 mt-2 italic">
                    Showing photos for: {currentWedding.bride_name} & {currentWedding.groom_name}'s Wedding
                  </p>
                )}
              </div>

              <LiveGallery sister={selectedSister} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

