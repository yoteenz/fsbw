import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { ensureAuthRestoredFromBackup, persistAuthBackup, enableAuthDebugFromUrl, authDebugLogIfEnabled } from './utils/adminAuth'
import { restoreSupabaseSessionFromCookie, getSupabase } from './utils/supabase'

// Enable auth debug from URL (e.g. ?auth_debug=1) so logs persist and show in the on-page panel
enableAuthDebugFromUrl()

// Restore app auth from backup if something (e.g. Supabase token refresh) cleared isSignedIn/currentUser
ensureAuthRestoredFromBackup()

// Restore Supabase session from cookies into localStorage so Safari (which may clear localStorage on close) keeps the user signed in
restoreSupabaseSessionFromCookie()
// Initialize Supabase client so it picks up the rehydrated session and fires auth state
getSupabase()

// Persist auth to backup so it survives close+reopen (beforeunload/pagehide are unreliable when closing browser)
if (typeof window !== 'undefined') {
  const saveAuth = () => { persistAuthBackup(); };
  window.addEventListener('beforeunload', saveAuth);
  window.addEventListener('pagehide', saveAuth);
  // When tab/window becomes hidden (switch tab, minimize, or start closing), persist immediately
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveAuth();
  });
  // When page is shown again (reopen browser, switch back to tab, bfcache restore), restore from cookies then backup
  window.addEventListener('pageshow', () => {
    authDebugLogIfEnabled('pageshow → restoring from backup');
    restoreSupabaseSessionFromCookie();
    ensureAuthRestoredFromBackup();
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)


