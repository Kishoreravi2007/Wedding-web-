import React, { useState, useEffect } from 'react';
import AdminLayout from './Layout';
import { adminService } from '../../services/adminService';
import { useToast } from '../../components/ui/use-toast';

const AdminSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await adminService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminService.updateSettings(settings);
      toast({
        title: "Settings saved",
        description: "Your changes have been successfully saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <AdminLayout title="Settings">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-6 shrink-0">
        <div className="max-w-5xl mx-auto flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Platform Settings</h2>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-32 bg-slate-50 dark:bg-background-dark">
        <div className="max-w-5xl mx-auto p-8 space-y-8">
          {/* General Information Section */}
          <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">General Information</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Platform Brand Name</label>
                <input
                  className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 dark:text-white"
                  type="text"
                  value={settings.brand_name || ''}
                  onChange={(e) => handleChange('brand_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">Support Contact Email</label>
                <input
                  className="w-full h-12 px-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 dark:text-white"
                  type="email"
                  value={settings.support_email || ''}
                  onChange={(e) => handleChange('support_email', e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Feature Toggles Section */}
          <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Feature Toggles</h3>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              <ToggleItem
                icon="photo_camera"
                title="Photo Booth Mode"
                description="Enable automated capture stations for events."
                checked={settings.enable_photo_booth === 'true' || settings.enable_photo_booth === true}
                onChange={(checked: boolean) => handleChange('enable_photo_booth', checked)}
              />
              <ToggleItem
                icon="face"
                title="Face Match AI"
                description="Utilize neural networks to match faces."
                checked={settings.enable_face_match === 'true' || settings.enable_face_match === true}
                onChange={(checked: boolean) => handleChange('enable_face_match', checked)}
              />
            </div>
          </section>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <footer className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-8 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-end gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </footer>
    </AdminLayout>
  );
};

const ToggleItem = ({ icon, title, description, checked, onChange }: any) => (
  <div className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
    <div className="flex gap-4">
      <span className="material-symbols-outlined text-slate-500">{icon}</span>
      <div>
        <p className="font-bold text-slate-900 dark:text-white">{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </div>
    <label className="relative inline-flex items-center cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
    </label>
  </div>
);

export default AdminSettings;
