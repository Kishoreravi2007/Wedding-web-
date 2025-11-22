/**
 * Desktop App Main UI
 */

import { useState, useEffect } from 'react';
import './types/electron';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Badge } from './components/ui/badge';
import { Camera, FolderOpen, Play, Square, CheckCircle, XCircle, Settings } from 'lucide-react';

interface Config {
  apiKey?: string;
  apiBaseUrl: string;
  eventId?: string;
  sister?: 'sister-a' | 'sister-b';
  watchedFolder?: string;
  compressImages: boolean;
  maxRetries: number;
  cameraMode?: 'sdk' | 'hot-folder';
  selectedCameraId?: string;
}

interface UploadStatus {
  file: string;
  status: 'success' | 'error' | 'uploading';
  error?: string;
  result?: any;
}

export default function App() {
  const [config, setConfig] = useState<Config | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([]);
  const [cameras, setCameras] = useState<any[]>([]);

  useEffect(() => {
    loadConfig();
    detectCameras();
    setupUploadListener();
  }, []);

  const loadConfig = async () => {
    const config = await window.electronAPI.getConfig();
    setConfig(config);
  };

  const saveConfig = async (updates: Partial<Config>) => {
    const newConfig = { ...config, ...updates } as Config;
    await window.electronAPI.saveConfig(newConfig);
    setConfig(newConfig);
  };

  const detectCameras = async () => {
    const detected = await window.electronAPI.detectCameras();
    setCameras(detected);
  };

  const selectFolder = async () => {
    const folder = await window.electronAPI.selectFolder();
    if (folder) {
      await saveConfig({ watchedFolder: folder });
    }
  };

  const startWatching = async () => {
    if (!config?.watchedFolder) {
      alert('Please select a folder first');
      return;
    }
    const result = await window.electronAPI.startWatching(config.watchedFolder);
    if (result.success) {
      setIsWatching(true);
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const stopWatching = async () => {
    await window.electronAPI.stopWatching();
    setIsWatching(false);
  };

  const setupUploadListener = () => {
    window.electronAPI.onUploadProgress((data: UploadStatus) => {
      setUploadStatuses((prev) => [data, ...prev].slice(0, 20)); // Keep last 20
    });
  };

  if (!config) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Camera className="w-8 h-8" />
            WeddingWeb Desktop
          </h1>
          <Badge variant={isWatching ? 'default' : 'secondary'}>
            {isWatching ? 'Watching' : 'Stopped'}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={config.apiKey || ''}
                onChange={(e) => saveConfig({ apiKey: e.target.value })}
                placeholder="Enter your API key from Photographer Portal"
              />
            </div>

            <div>
              <Label htmlFor="apiBaseUrl">API Base URL</Label>
              <Input
                id="apiBaseUrl"
                value={config.apiBaseUrl}
                onChange={(e) => saveConfig({ apiBaseUrl: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sister">Sister</Label>
                <select
                  id="sister"
                  value={config.sister || ''}
                  onChange={(e) => saveConfig({ sister: e.target.value as 'sister-a' | 'sister-b' })}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select...</option>
                  <option value="sister-a">Sister A (Parvathy)</option>
                  <option value="sister-b">Sister B (Sreedevi)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hot Folder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Watched Folder</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={config.watchedFolder || ''}
                  readOnly
                  placeholder="No folder selected"
                />
                <Button onClick={selectFolder}>
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Browse
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              {!isWatching ? (
                <Button onClick={startWatching} disabled={!config.watchedFolder}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Watching
                </Button>
              ) : (
                <Button onClick={stopWatching} variant="destructive">
                  <Square className="w-4 h-4 mr-2" />
                  Stop Watching
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {cameras.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Detected Cameras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {cameras.map((camera) => (
                  <div key={camera.id} className="p-3 border rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{camera.name}</p>
                        <p className="text-sm text-gray-600">{camera.brand} - {camera.model}</p>
                      </div>
                      {camera.sdkAvailable ? (
                        <Badge>SDK Available</Badge>
                      ) : (
                        <Badge variant="secondary">No SDK</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Upload Status</CardTitle>
          </CardHeader>
          <CardContent>
            {uploadStatuses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No uploads yet</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {uploadStatuses.map((status, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      {status.status === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : status.status === 'error' ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      )}
                      <span className="font-mono text-sm">{status.file}</span>
                    </div>
                    {status.error && (
                      <span className="text-sm text-red-600">{status.error}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

