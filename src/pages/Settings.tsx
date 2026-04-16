import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Button, Select } from '../components/ui';
import { getSettings, saveSettings, AppSettings } from '../lib/settings';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Moon, Bell, Trash2, Globe } from 'lucide-react';

export const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettingsState] = useState<AppSettings>({
    language: 'English',
    darkMode: false,
    notifications: true,
  });

  useEffect(() => {
    setSettingsState(getSettings());
  }, []);

  const handleSave = (newSettings: AppSettings) => {
    const oldLanguage = settings.language;
    const oldDarkMode = settings.darkMode;
    setSettingsState(newSettings);
    saveSettings(newSettings);
    
    if (oldLanguage !== newSettings.language) {
      // Force a re-render/reload to apply language changes across the app
      window.location.reload();
    }

    if (oldDarkMode !== newSettings.darkMode) {
      // Apply dark mode immediately
      if (newSettings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to clear all data? This will log you out and delete your profile and chat history.")) {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto space-y-10"
    >
      <div className="px-2">
        <h2 className="font-serif text-4xl font-bold text-ink dark:text-[#E4E3DA]">Settings</h2>
        <p className="text-muted dark:text-muted mt-3 text-lg">Manage your preferences and application data.</p>
      </div>

      <Card className="overflow-hidden border-none shadow-xl">
        <CardHeader className="p-8 border-b border-sand/10 bg-white dark:bg-[#1A1C18]">
          <CardTitle className="text-2xl font-bold text-ink dark:text-[#E4E3DA]">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="p-0 bg-bg-card dark:bg-[#242622]">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between p-10 border-b border-sand/10 group">
            <div className="flex items-center gap-6 mb-6 md:mb-0">
              <div className="p-4 bg-white dark:bg-[#1A1C18] text-olive-dark dark:text-sand rounded-2xl group-hover:bg-olive-dark group-hover:text-white transition-all duration-300 border border-sand/10 shadow-sm">
                <Globe className="h-7 w-7" />
              </div>
              <div>
                <h4 className="font-bold text-xl text-ink dark:text-[#E4E3DA]">App Language</h4>
                <p className="text-base text-muted dark:text-muted font-medium mt-1">Change the language of the entire application and AI.</p>
              </div>
            </div>
            <div className="w-full md:w-80">
              <Select
                value={settings.language}
                onChange={(e) => handleSave({ ...settings, language: e.target.value })}
                className="h-16 rounded-2xl bg-white dark:bg-[#1A1C18] border-2 border-sand/10 px-8 font-bold text-ink dark:text-[#E4E3DA] focus:border-sand"
                options={[
                  { value: 'English', label: 'English' },
                  { value: 'Hindi', label: 'Hindi (हिंदी)' },
                  { value: 'Marathi', label: 'Marathi (मराठी)' },
                  { value: 'Tamil', label: 'Tamil (தமிழ்)' },
                  { value: 'Bengali', label: 'Bengali (বাংলা)' },
                  { value: 'Gujarati', label: 'Gujarati (ગુજરાती)' },
                ]}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-10 border-b border-sand/10 group">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white dark:bg-[#1A1C18] text-olive-dark dark:text-sand rounded-2xl group-hover:bg-olive-dark group-hover:text-white transition-all duration-300 border border-sand/10 shadow-sm">
                <Moon className="h-7 w-7" />
              </div>
              <div>
                <h4 className="font-bold text-xl text-ink dark:text-[#E4E3DA]">Dark Mode</h4>
                <p className="text-base text-muted dark:text-muted font-medium mt-1">Toggle dark theme for the application.</p>
              </div>
            </div>
            <Button 
              variant={settings.darkMode ? 'primary' : 'outline'}
              className={`h-14 px-10 rounded-2xl font-bold transition-all text-base ${settings.darkMode ? 'bg-olive-dark text-white' : 'bg-white dark:bg-[#1A1C18] border-2 border-sand/10 text-ink dark:text-[#E4E3DA]'}`}
              onClick={() => handleSave({ ...settings, darkMode: !settings.darkMode })}
            >
              {settings.darkMode ? 'Enabled' : 'Disabled'}
            </Button>
          </div>

          <div className="flex items-center justify-between p-10 border-b border-sand/10 group">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white dark:bg-[#1A1C18] text-terracotta rounded-2xl group-hover:bg-terracotta group-hover:text-white transition-all duration-300 border border-sand/10 shadow-sm">
                <Bell className="h-7 w-7" />
              </div>
              <div>
                <h4 className="font-bold text-xl text-ink dark:text-[#E4E3DA]">Notifications</h4>
                <p className="text-base text-muted dark:text-muted font-medium mt-1">Receive alerts for LPG shortages and news.</p>
              </div>
            </div>
            <Button 
              variant={settings.notifications ? 'primary' : 'outline'}
              className={`h-14 px-10 rounded-2xl font-bold transition-all text-base ${settings.notifications ? 'bg-olive-dark text-white' : 'bg-white dark:bg-[#1A1C18] border-2 border-sand/10 text-ink dark:text-[#E4E3DA]'}`}
              onClick={() => handleSave({ ...settings, notifications: !settings.notifications })}
            >
              {settings.notifications ? 'On' : 'Off'}
            </Button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between p-10 group">
            <div className="flex items-center gap-6 mb-6 md:mb-0">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl group-hover:bg-red-600 group-hover:text-white transition-all duration-300 border border-red-100 dark:border-red-900/10 shadow-sm">
                <Trash2 className="h-7 w-7" />
              </div>
              <div>
                <h4 className="font-bold text-xl text-ink dark:text-[#E4E3DA]">Clear Data</h4>
                <p className="text-base text-muted dark:text-muted font-medium mt-1">Delete all local data, profile, and chat history.</p>
              </div>
            </div>
            <Button 
              variant="outline"
              className="h-14 px-10 rounded-2xl font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border-2 border-red-100 dark:border-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all text-base"
              onClick={handleClearData}
            >
              Clear All Data
            </Button>
          </div>

        </CardContent>
      </Card>
    </motion.div>
  );
};
