import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import QueueView from './components/QueueView';
import SettingsView from './components/SettingsView';

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
  const [activeView, setActiveView] = useState<'dashboard' | 'queue' | 'settings'>('dashboard');

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
    if (window.electronAPI && typeof window.electronAPI.onQueueUpdate === 'function') {
      return window.electronAPI.onQueueUpdate((data: any) => {
        setQueueStats(data.stats);
        setRecentUploads(prev => {
          const filtered = prev.filter(item => item.id !== data.item.id);
          return [data.item, ...filtered].slice(0, 50);
        });
      });
    }
  };


  const selectFolder = async () => {
    const folder = await window.electronAPI.selectFolder();
    if (folder) {
      await saveConfig({ watchedFolder: folder });
    }
  };

  const startWatching = async () => {
    if (!config?.watchedFolder || !config?.apiKey) return;
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
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-accent-gold/30 border-t-accent-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-dark-bg font-sans select-none overflow-hidden">
      {/* OS TitleBar Placeholder (Drag Region) */}
      <header
        className="drag-region h-10 flex items-center justify-between px-4 glass-panel border-b border-glass-border z-50 shrink-0"
        style={{ WebkitAppRegion: 'drag' } as any}
      >
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-accent-gold shadow-[0_0_8px_rgba(212,175,55,0.4)]"></div>
          <span className="text-[10px] font-bold tracking-[0.2em] text-gray-400">WEDDINGWEB SYNC PRO</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />

        <div className="flex-1 flex flex-col overflow-hidden relative">
          {activeView === 'dashboard' && (
            <DashboardView
              config={config}
              isWatching={isWatching}
              isConnected={isConnected}
              queueStats={queueStats}
              recentUploads={recentUploads}
              onSelectFolder={selectFolder}
              onStartWatching={startWatching}
              onStopWatching={stopWatching}
              onRetryFailed={retryFailed}
              onClearCompleted={clearCompleted}
            />
          )}

          {activeView === 'queue' && (
            <QueueView
              queueStats={queueStats}
              recentUploads={recentUploads}
              onRetryFailed={retryFailed}
              onClearCompleted={clearCompleted}
            />
          )}

          {activeView === 'settings' && (
            <SettingsView
              config={config}
              apiKeyValid={apiKeyValid}
              weddings={weddings}
              onSaveConfig={saveConfig}
              onSelectFolder={selectFolder}
            />
          )}
        </div>
      </div>

      {/* Footer Status Bar */}
      <footer className="h-8 glass-panel border-t border-glass-border px-8 flex items-center justify-between text-[9px] tracking-[0.15em] text-gray-500 z-50 shrink-0 font-bold uppercase">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-success-green' : 'bg-red-500'}`}></div>
            <span>NETWORK: {isConnected ? 'SECURE' : 'DISCONNECTED'}</span>
          </div>
          <span>API: v2.0.4-LATEST</span>
        </div>
        <div className="flex items-center gap-6">
          <span>{isWatching ? 'WATCHER ACTIVE' : 'WATCHER STANDBY'}</span>
          <span className="text-gray-400">© {new Date().getFullYear()} WEDDINGWEB INTELLIGENCE</span>
        </div>
      </footer>
    </div>
  );
}

