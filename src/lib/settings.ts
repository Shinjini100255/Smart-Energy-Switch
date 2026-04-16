export interface AppSettings {
  language: string;
  darkMode: boolean;
  notifications: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  language: 'English',
  darkMode: false,
  notifications: true,
};

export const getSettings = (): AppSettings => {
  const stored = localStorage.getItem('ses_settings');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }
  return DEFAULT_SETTINGS;
};

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem('ses_settings', JSON.stringify(settings));
  applySettings(settings);
};

export const applySettings = (settings: AppSettings) => {
  if (settings.darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};
