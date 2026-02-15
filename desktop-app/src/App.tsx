/**
 * Desktop App Main UI
 * Premium Redesign: Glassmorphism, Sophisticated Typography, Brand Alignment
 */

import { useState, useEffect } from 'react';
import {
  Camera,
  FolderOpen,
  Play,
  Square,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trash2,
  Wifi,
  WifiOff,
  Settings,
  Upload,
  Clock,
  Shield,
  ChevronRight,
  ExternalLink,
  Info
} from 'lucide-react';
import logo from './assets/logo.png';

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
    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
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
        const filtered = prev.filter(item => item.id !== data.item.id);
        return [data.item, ...filtered].slice(0, 15);
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
    if (!config?.watchedFolder) return;
    if (!config?.apiKey) return;
    const result = await window.electronAPI.startWatching(config.watchedFolder);
    if (result.success) {
      setIsWatching(true);
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
      <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Premium Header */}
      <header className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between no-drag" style={{ WebkitAppRegion: 'drag' } as any}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0a0a14] ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight accent-text">WeddingWeb</h1>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold italic">Photographer Studio</span>
              <span className="px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-500 text-[10px] font-bold">LIVE SYNC</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 no-drag" style={{ WebkitAppRegion: 'no-drag' } as any}>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <StatusIndicator label="Network" active={isConnected} icon={isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />} color={isConnected ? 'green' : 'red'} />
            <div className="w-px h-8 bg-white/10" />
            <StatusIndicator label="Watcher" active={isWatching} icon={<Camera className="w-4 h-4" />} color={isWatching ? 'pink' : 'gray'} pulse={isWatching} />
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2.5 rounded-xl transition-all duration-300 ${showSettings ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/20' : 'bg-white/5 hover:bg-white/10 text-gray-400'}`}
          >
            <Settings className={`w-5 h-5 ${showSettings ? 'rotate-90' : ''} transition-transform duration-500`} />
          </button>
        </div>
      </header>

      <main className="px-8 py-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatModule label="Total Photos" value={queueStats.total} icon={<Upload className="w-6 h-6" />} trend="+Syncing" />
          <StatModule label="Remaining" value={queueStats.pending + queueStats.uploading} icon={<Clock className="w-6 h-6" />} color="yellow" />
          <StatModule label="Successful" value={queueStats.completed} icon={<CheckCircle className="w-6 h-6" />} color="green" />
          <StatModule label="Issues" value={queueStats.failed} icon={<XCircle className="w-6 h-6" />} color="red" alert={queueStats.failed > 0} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Controls Area */}
          <div className="lg:col-span-8 space-y-8">
            {/* Folder Configuration */}
            <section className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <FolderOpen className="w-32 h-32" />
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-500">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Active Source Folder</h2>
              </div>

              <div className="flex gap-4 items-center">
                <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-gray-300 font-medium overflow-hidden">
                  <span className="opacity-50 text-sm block mb-1">SELECTED DIRECTORY</span>
                  <p className="truncate text-sm font-mono tracking-tight underline decoration-pink-500/30 underline-offset-4">
                    {config.watchedFolder || 'No folder active...'}
                  </p>
                </div>
                <button
                  onClick={selectFolder}
                  className="px-6 py-5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all duration-300 flex items-center gap-2 group/btn border border-white/5"
                >
                  <span className="font-semibold text-sm">Browse</span>
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                {!isWatching ? (
                  <button
                    onClick={startWatching}
                    disabled={!config.watchedFolder || !config.apiKey}
                    className="flex-1 min-w-[200px] flex items-center justify-center gap-3 px-8 py-4 accent-gradient rounded-2xl font-bold text-lg shadow-xl shadow-pink-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale disabled:scale-100"
                  >
                    <Play className="w-6 h-6 fill-current" />
                    <span>Engage Live Sync</span>
                  </button>
                ) : (
                  <button
                    onClick={stopWatching}
                    className="flex-1 min-w-[200px] flex items-center justify-center gap-3 px-8 py-4 bg-white/5 hover:bg-red-500 rounded-2xl font-bold text-lg transition-all hover:scale-[1.02] border border-white/10"
                  >
                    <Square className="w-6 h-6 fill-current" />
                    <span>Halt Synchronization</span>
                  </button>
                )}

                <div className="flex gap-4">
                  {queueStats.failed > 0 && (
                    <button onClick={retryFailed} className="p-4 bg-yellow-500 text-black rounded-2xl hover:scale-[1.05] transition-all">
                      <RefreshCw className="w-6 h-6" />
                    </button>
                  )}
                  {queueStats.completed > 0 && (
                    <button onClick={clearCompleted} className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all">
                      <Trash2 className="w-6 h-6 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* Queue Visibility */}
            <section className="glass-panel p-8 rounded-3xl min-h-[400px]">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">Transmission Stream</h2>
                </div>
                <div className="text-xs text-gray-500 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  LATEST {recentUploads.length} ACTIONS
                </div>
              </div>

              {recentUploads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-white/[0.02] flex items-center justify-center">
                    <Upload className="w-10 h-10 text-gray-600 opacity-20" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-500 tracking-tight">Awaiting Activity</p>
                    <p className="text-sm text-gray-600">Sync with a Hot Folder to see real-time updates</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {recentUploads.map((item) => (
                    <div key={item.id} className="glass-card p-4 rounded-xl flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <StatusIcon status={item.status} />
                        <div>
                          <p className="text-sm font-semibold tracking-tight text-gray-200">{item.fileName}</p>
                          <p className={`text-[10px] uppercase font-bold tracking-widest ${item.status === 'completed' ? 'text-green-500' : 'text-gray-500'}`}>
                            {item.status === 'uploading' ? 'Transmitting Data...' : item.status}
                          </p>
                        </div>
                      </div>
                      {item.error && <span className="text-[10px] bg-red-500/10 text-red-500 px-3 py-1 rounded-full font-bold">{item.error}</span>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar / Configuration Area */}
          <div className="lg:col-span-4 space-y-8">
            {/* Profile / Context Card */}
            <section className="glass-panel p-8 rounded-3xl accent-gradient relative overflow-hidden group">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Shield className="w-40 h-40" />
              </div>
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">Authenticated Session</h3>
                <p className="text-sm text-white/70 leading-relaxed mb-6">Your hardware is securely linked to the cloud cluster. All transmissions are encrypted.</p>
                <div className="px-4 py-3 bg-white/10 rounded-xl backdrop-blur-md flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <code className="text-xs font-mono font-bold">SYSLINK_RECON_ACTIVE</code>
                </div>
              </div>
            </section>

            {/* Settings Management */}
            {(showSettings || weddings.length > 0) && (
              <section className="glass-panel p-8 rounded-3xl space-y-6 animate-in slide-in-from-right duration-500">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-bold">Identity Module</h2>
                </div>

                <div className="space-y-4">
                  <InputGroup label="Network Endpoint" value={config.apiBaseUrl} onUpdate={(val) => saveConfig({ apiBaseUrl: val })} />
                  <InputGroup label="Access Signature" value={config.apiKey || ''} isPassword onUpdate={(val) => saveConfig({ apiKey: val })} valid={apiKeyValid} />

                  {weddings.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">TARGET WEDDING</label>
                      <select
                        value={config.eventId || ''}
                        onChange={(e) => saveConfig({ eventId: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold text-gray-100 focus:outline-none focus:border-pink-500/50 appearance-none"
                      >
                        <option value="" className="bg-gray-900 italic">Select Assignment...</option>
                        {weddings.map((wedding) => (
                          <option key={wedding.id} value={wedding.id} className="bg-gray-900">
                            {wedding.bride_name} & {wedding.groom_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Quick Actions / Integration */}
            <section className="glass-panel p-6 rounded-3xl border-pink-500/10">
              <div className="flex flex-col gap-3">
                <a href="https://weddingweb-beta.vercel.app/photographer/dashboard" target="_blank" className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 group transition-all">
                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-5 h-5 text-pink-500" />
                    <span className="text-sm font-bold">Portal Direct</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:translate-x-1 transition-transform" />
                </a>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-3">
                  <Info className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                  <p className="text-[10px] leading-relaxed text-gray-500 font-medium">
                    Live synching automatically manages image compression and deduplication before transmission.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="px-8 py-6 text-center text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">
        © {new Date().getFullYear()} WeddingWeb Intelligence Systems • Version 2.0.4-PRO
      </footer>
    </div>
  );
}

function StatusIndicator({ label, active, icon, color, pulse }: { label: string; active: boolean; icon: React.ReactNode; color: 'green' | 'red' | 'pink' | 'gray'; pulse?: boolean }) {
  const colors = {
    green: 'text-green-500',
    red: 'text-red-500',
    pink: 'text-pink-500',
    gray: 'text-gray-500'
  };

  return (
    <div className="flex flex-col">
      <span className="text-[9px] uppercase tracking-widest text-gray-500 mb-0.5">{label}</span>
      <div className={`flex items-center gap-2 font-bold text-xs ${colors[color]} ${pulse ? 'status-pulse' : ''}`}>
        {icon}
        <span>{active ? 'ACTIVE' : 'IDLE'}</span>
      </div>
    </div>
  );
}

function StatModule({ label, value, icon, color = 'pink', alert, trend }: { label: string; value: number; icon: React.ReactNode; color?: string; alert?: boolean; trend?: string }) {
  const colors = {
    pink: 'from-pink-500/20 to-pink-600/5 text-pink-500 border-pink-500/20',
    yellow: 'from-yellow-500/20 to-yellow-600/5 text-yellow-500 border-yellow-500/20',
    green: 'from-green-500/20 to-green-600/5 text-green-500 border-green-500/20',
    red: 'from-red-500/20 to-red-600/5 text-red-500 border-red-500/20',
  };

  return (
    <div className={`glass-panel bg-gradient-to-br ${colors[color as keyof typeof colors]} p-6 rounded-3xl relative overflow-hidden group border-2 ${alert ? 'animate-pulse' : ''}`}>
      <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <h4 className="text-4xl font-black text-white">{value}</h4>
        {trend && <span className="text-[8px] font-bold text-gray-500 italic">{trend}</span>}
      </div>
    </div>
  );
}

function InputGroup({ label, value, onUpdate, isPassword, valid }: { label: string; value: string; onUpdate: (val: string) => void; isPassword?: boolean; valid?: boolean | null }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</label>
        {valid !== undefined && valid !== null && (
          <span className={`text-[9px] font-black uppercase ${valid ? 'text-green-500' : 'text-red-500'}`}>
            {valid ? 'Authorized' : 'Refused'}
          </span>
        )}
      </div>
      <input
        type={isPassword ? 'password' : 'text'}
        value={value}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder={`Set ${label.toLowerCase()}...`}
        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm font-semibold tracking-tight text-gray-100 placeholder:text-gray-700 focus:outline-none focus:border-pink-500/50 transition-all"
      />
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'completed': return <div className="p-2 rounded-lg bg-green-500/10 text-green-500 shadow-sm shadow-green-500/20"><CheckCircle className="w-5 h-5" /></div>;
    case 'failed': return <div className="p-2 rounded-lg bg-red-500/10 text-red-500 shadow-sm shadow-red-500/20"><XCircle className="w-5 h-5" /></div>;
    case 'uploading': return <div className="p-2 rounded-lg bg-pink-500/10 text-pink-500"><div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div>;
    default: return <div className="p-2 rounded-lg bg-white/5 text-yellow-500"><Clock className="w-5 h-5" /></div>;
  }
}
