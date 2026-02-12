/**
 * Desktop App Main UI
 * Complete implementation with wedding selection, queue, and statistics
 */

import { useState, useEffect, useCallback } from 'react';
import { Camera, FolderOpen, Play, Square, CheckCircle, XCircle, RefreshCw, Trash2, Wifi, WifiOff, Settings, Upload, Clock } from 'lucide-react';

interface Config {
  apiKey?: string;
  apiBaseUrl: string;
  eventId?: string;
  watchedFolder?: string;
  compressImages: boolean;
  maxRetries: number;
}

interface QueueItem {
  id: string;
  fileName: string;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
}

interface QueueStats {
  total: number;
  pending: number;
  uploading: number;
  completed: number;
  failed: number;
}

interface Wedding {
  id: string;
  wedding_code: string;
  bride_name: string;
  groom_name: string;
}

export default function App() {
  const [config, setConfig] = useState<Config | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [queueStats, setQueueStats] = useState<QueueStats>({ total: 0, pending: 0, uploading: 0, completed: 0, failed: 0 });
  const [recentUploads, setRecentUploads] = useState<QueueItem[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  // Load initial data
  useEffect(() => {
    loadConfig();
    checkWatchingStatus();
    loadQueueStats();
    const cleanup = setupListeners();
    return () => cleanup();
  }, []);

  // Check connection when config changes
  useEffect(() => {
    if (config?.apiBaseUrl) {
      checkConnectionStatus();
    }
  }, [config?.apiBaseUrl]);

  // Validate API key when it changes
  useEffect(() => {
    if (config?.apiKey && config?.apiBaseUrl) {
      validateKey();
    }
  }, [config?.apiKey, config?.apiBaseUrl]);

  const loadConfig = async () => {
    const cfg = await window.electronAPI.getConfig();
    setConfig(cfg);
  };

  const saveConfig = async (updates: Partial<Config>) => {
    const newConfig = { ...config, ...updates } as Config;
    await window.electronAPI.saveConfig(newConfig);
    setConfig(newConfig);
  };

  const checkConnectionStatus = async () => {
    if (!config?.apiBaseUrl) return;
    const connected = await window.electronAPI.checkConnection(config.apiBaseUrl);
    setIsConnected(connected);
  };

  const validateKey = async () => {
    if (!config?.apiKey || !config?.apiBaseUrl) return;
    const result = await window.electronAPI.validateApiKey(config.apiBaseUrl, config.apiKey);
    setApiKeyValid(result.valid);
    if (result.valid) {
      loadWeddings();
    }
  };

  const loadWeddings = async () => {
    if (!config?.apiKey || !config?.apiBaseUrl) return;
    const weds = await window.electronAPI.fetchWeddings(config.apiBaseUrl, config.apiKey);
    setWeddings(weds);
  };

  const checkWatchingStatus = async () => {
    const watching = await window.electronAPI.isWatching();
    setIsWatching(watching);
  };

  const loadQueueStats = async () => {
    const stats = await window.electronAPI.getQueueStats();
    setQueueStats(stats);
  };

  const setupListeners = () => {
    return window.electronAPI.onQueueUpdate((data) => {
      setQueueStats(data.stats);
      setRecentUploads(prev => {
        // Filter out existing version of this item to avoid duplicate keys
        const filtered = prev.filter(item => item.id !== data.item.id);
        return [data.item, ...filtered].slice(0, 10);
      });
    });
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
    if (!config?.apiKey) {
      alert('Please enter an API key first');
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

  const retryFailed = async () => {
    await window.electronAPI.retryFailed();
    loadQueueStats();
  };

  const clearCompleted = async () => {
    await window.electronAPI.clearCompleted();
    loadQueueStats();
    setRecentUploads([]);
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur border-b border-white/10 p-4 flex items-center justify-between" style={{ WebkitAppRegion: 'drag' } as any}>
        <div className="flex items-center gap-3">
          <Camera className="w-8 h-8 text-pink-500" />
          <div>
            <h1 className="text-xl font-bold">WeddingWeb Desktop</h1>
            <p className="text-xs text-gray-400">Live Photo Sync</p>
          </div>
        </div>
        <div className="flex items-center gap-4" style={{ WebkitAppRegion: 'no-drag' } as any}>
          {/* Connection Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            {isConnected ? 'Connected' : 'Offline'}
          </div>
          {/* Watching Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${isWatching ? 'bg-pink-500/20 text-pink-400' : 'bg-gray-500/20 text-gray-400'}`}>
            <div className={`w-2 h-2 rounded-full ${isWatching ? 'bg-pink-500 animate-pulse' : 'bg-gray-500'}`} />
            {isWatching ? 'Watching' : 'Stopped'}
          </div>
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-white/10 rounded-lg">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Total" value={queueStats.total} icon={<Upload className="w-5 h-5" />} color="blue" />
          <StatCard title="Pending" value={queueStats.pending} icon={<Clock className="w-5 h-5" />} color="yellow" />
          <StatCard title="Completed" value={queueStats.completed} icon={<CheckCircle className="w-5 h-5" />} color="green" />
          <StatCard title="Failed" value={queueStats.failed} icon={<XCircle className="w-5 h-5" />} color="red" />
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white/5 backdrop-blur rounded-xl border border-white/10 p-6 space-y-4">
            <h2 className="text-lg font-semibold">Settings</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">API Base URL</label>
                <input
                  type="text"
                  value={config.apiBaseUrl}
                  onChange={(e) => saveConfig({ apiBaseUrl: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  API Key
                  {apiKeyValid !== null && (
                    <span className={`ml-2 ${apiKeyValid ? 'text-green-400' : 'text-red-400'}`}>
                      {apiKeyValid ? '✓ Valid' : '✗ Invalid'}
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  value={config.apiKey || ''}
                  onChange={(e) => saveConfig({ apiKey: e.target.value })}
                  placeholder="Enter API key from Photographer Portal"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            {weddings.length > 0 && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Select Wedding</label>
                <select
                  value={config.eventId || ''}
                  onChange={(e) => saveConfig({ eventId: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="">Select a wedding...</option>
                  {weddings.map((wedding) => (
                    <option key={wedding.id} value={wedding.id}>
                      {wedding.bride_name} & {wedding.groom_name} ({wedding.wedding_code})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Folder Watcher */}
        <div className="bg-white/5 backdrop-blur rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold mb-4">Hot Folder</h2>

          <div className="flex gap-3 items-center mb-4">
            <input
              type="text"
              value={config.watchedFolder || ''}
              readOnly
              placeholder="No folder selected"
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white"
            />
            <button
              onClick={selectFolder}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
            >
              <FolderOpen className="w-4 h-4" />
              Browse
            </button>
          </div>

          <div className="flex gap-3">
            {!isWatching ? (
              <button
                onClick={startWatching}
                disabled={!config.watchedFolder || !config.apiKey}
                className="flex items-center gap-2 px-6 py-2.5 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition"
              >
                <Play className="w-4 h-4" />
                Start Watching
              </button>
            ) : (
              <button
                onClick={stopWatching}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition"
              >
                <Square className="w-4 h-4" />
                Stop Watching
              </button>
            )}

            {queueStats.failed > 0 && (
              <button onClick={retryFailed} className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition">
                <RefreshCw className="w-4 h-4" />
                Retry Failed ({queueStats.failed})
              </button>
            )}

            {queueStats.completed > 0 && (
              <button onClick={clearCompleted} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition">
                <Trash2 className="w-4 h-4" />
                Clear Completed
              </button>
            )}
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="bg-white/5 backdrop-blur rounded-xl border border-white/10 p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Uploads</h2>

          {recentUploads.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Upload className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No uploads yet</p>
              <p className="text-sm">Photos will appear here as they are uploaded</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {recentUploads.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    {item.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {item.status === 'failed' && <XCircle className="w-5 h-5 text-red-500" />}
                    {item.status === 'uploading' && <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />}
                    {item.status === 'pending' && <Clock className="w-5 h-5 text-yellow-500" />}
                    <span className="font-mono text-sm truncate max-w-xs">{item.fileName}</span>
                  </div>
                  {item.error && <span className="text-sm text-red-400">{item.error}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30',
    red: 'from-red-500/20 to-red-600/10 border-red-500/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} border rounded-xl p-4`}>
      <div className="flex items-center gap-2 text-gray-400 mb-1">
        {icon}
        <span className="text-sm">{title}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}
