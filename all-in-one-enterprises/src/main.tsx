import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { validateAioEnvironment } from './config/env';
import { initI18n } from './i18n';

initI18n();

const validation = validateAioEnvironment();
if (!validation.ok && import.meta.env.VITE_AIO_DATA_MODE === 'supabase') {
  console.error('ALL IN ONE CONFIGURATION ERROR:', validation.errors.join('; '));
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
