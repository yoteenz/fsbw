import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { ensureAuthRestoredFromBackup, persistAuthBackup, enableAuthDebugFromUrl, authDebugLogIfEnabled, isSignedIn } from './utils/adminAuth'
import { restoreSupabaseSessionFromCookie, getSupabase } from './utils/supabase'
import { sendAuthDiagnostic } from './utils/authDiagnostic'
import { tryServerSessionRestore } from './utils/sessionRestore'

// Enable auth debug from URL (e.g. ?auth_debug=1) so logs persist and show in the on-page panel
enableAuthDebugFromUrl()

// When auth_debug=1: send diagnostic on load BEFORE restore so server logs show what Safari left (check Vercel → Logs)
if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('auth_debug') === '1') {
  sendAuthDiagnostic('load')
}

// Restore app auth from backup if something (e.g. Supabase token refresh) cleared isSignedIn/currentUser
ensureAuthRestoredFromBackup()

// Restore Supabase session from cookies into localStorage so Safari (which may clear localStorage on close) keeps the user signed in
restoreSupabaseSessionFromCookie()
// When client storage is empty (e.g. Safari cleared everything), try server HttpOnly cookie restore — if 200 we reload signed in
if (typeof window !== 'undefined' && !isSignedIn()) tryServerSessionRestore()
// Initialize Supabase client so it picks up the rehydrated session and fires auth state
getSupabase()

// Persist auth to backup so it survives close+reopen (beforeunload/pagehide are unreliable when closing browser)
if (typeof window !== 'undefined') {
  const saveAuth = () => { persistAuthBackup(); };
  window.addEventListener('beforeunload', saveAuth);
  window.addEventListener('pagehide', saveAuth);
  // When tab/window becomes hidden (switch tab, minimize, or start closing), persist immediately and send diagnostic if debug on
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      saveAuth();
      if (new URLSearchParams(window.location.search).get('auth_debug') === '1' || (typeof localStorage !== 'undefined' && localStorage.getItem('baw_auth_debug') === 'true')) {
        sendAuthDiagnostic('visibility_hidden');
      }
    }
  });
  // When page is shown again (reopen browser, switch back to tab, bfcache restore), send load diagnostic then restore
  window.addEventListener('pageshow', () => {
    if (new URLSearchParams(window.location.search).get('auth_debug') === '1') sendAuthDiagnostic('load');
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


