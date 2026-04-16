import { getSettings } from './settings';

const translations: Record<string, Record<string, string>> = {
  English: {
    dashboard: 'DASHBOARD',
    switch_expert: 'AI SWITCH ADVISOR',
    community: 'COMMUNITY INSIGHTS',
    marketplace: 'VENDOR SEARCH',
    kitchen: 'GAS-FREE KITCHEN',
    profile: 'ENERGY PROFILE',
    settings: 'SETTINGS',
    logout: 'Logout',
    welcome: 'Welcome',
    good_morning: 'Good Morning',
    good_afternoon: 'Good Afternoon',
    good_evening: 'Good Evening',
    good_night: 'Good Night',
    emergency: 'Emergency Solution',
    need_now: 'Need Solution NOW',
  },
  Hindi: {
    dashboard: 'डैशबोर्ड',
    switch_expert: 'स्विच एक्सपर्ट',
    community: 'कम्युनिटी इनसाइट्स',
    marketplace: 'मार्केटप्लेस',
    kitchen: 'गैस-मुक्त रसोई',
    profile: 'एनर्जी प्रोफाइल',
    settings: 'सेटिंग्स',
    logout: 'लॉगआउट',
    welcome: 'स्वागत है',
    good_morning: 'शुभ प्रभात',
    good_afternoon: 'नमस्कार',
    good_evening: 'शुभ संध्या',
    good_night: 'शुभ रात्रि',
    emergency: 'आपातकालीन समाधान',
    need_now: 'अभी समाधान चाहिए',
  },
  Marathi: {
    dashboard: 'डॅशबोर्ड',
    switch_expert: 'स्विच एक्सपर्ट',
    community: 'कम्युनिटी इनसाइट्स',
    marketplace: 'मार्केटप्लेस',
    kitchen: 'गॅस-मुक्त स्वयंपाकघर',
    profile: 'एनर्जी प्रोफाइल',
    settings: 'सेटिंग्स',
    logout: 'लॉगआउट',
    welcome: 'स्वागत आहे',
    good_morning: 'शुभ प्रभात',
    good_afternoon: 'नमस्कार',
    good_evening: 'शुभ संध्या',
    good_night: 'शुभ रात्री',
    emergency: 'आणीबाणीचे समाधान',
    need_now: 'आत्ताच समाधान हवे',
  },
  // Add more as needed
};

export const t = (key: string): string => {
  const { language } = getSettings();
  return translations[language]?.[key] || translations['English'][key] || key;
};
