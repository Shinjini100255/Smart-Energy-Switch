import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { getSettings, applySettings } from './lib/settings';

// Apply settings (like dark mode) immediately on startup
applySettings(getSettings());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
