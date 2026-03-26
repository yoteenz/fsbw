import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { ensureAuthRestoredFromBackup, persistAuthBackup, enableAuthDebugFromUrl, authDebugLogIfEnabled, isSignedIn } from './utils/adminAuth'
import { restoreSupabaseSessionFromCookie, getSupabase } from './utils/supabase'
import { sendAuthDiagnostic } from './utils/authDiagnostic'
import { tryServerSessionRestore } from './utils/sessionRestore'
import { flushQueuedProfilePatch } from './utils/profileSyncQueue'
import { buildMinimalUserFromSupabaseSession, applyMinimalUserToStorage } from './utils/syncFromApi'

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
// Initialize Supabase client so it picks up rehydrated session/auth storage.
getSupabase()

async function bootstrapAuthBeforeRender(): Promise<void> {
  if (typeof window === 'undefined') return;
  authDebugLogIfEnabled('boot:start');
  if (isSignedIn()) {
    authDebugLogIfEnabled('boot: app already signed in');
    return;
  }
  const supabase = getSupabase();
  if (!supabase) {
    authDebugLogIfEnabled('boot: no supabase client');
    return;
  }
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const minimal = buildMinimalUserFromSupabaseSession(session.user);
      applyMinimalUserToStorage(minimal);
      authDebugLogIfEnabled('boot: promoted existing Supabase session into app auth');
      // Pull profile/orders/cart/wishlist from API so users are not stuck on minimal local state after refresh.
      try {
        const { syncAllFromApi } = await import('./utils/syncFromApi');
        await syncAllFromApi();
        authDebugLogIfEnabled('boot: syncAllFromApi after session promote');
      } catch (e) {
        authDebugLogIfEnabled(`boot: syncAllFromApi failed ${e instanceof Error ? e.message : String(e)}`);
      }
      window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
      return;
    }
    authDebugLogIfEnabled('boot: no session from getSession, trying server restore');
  } catch (e) {
    authDebugLogIfEnabled(`boot: getSession failed ${e instanceof Error ? e.message : String(e)}`);
  }

  try {
    const restored = await tryServerSessionRestore();
    authDebugLogIfEnabled(`boot: tryServerSessionRestore=${restored ? 'ok' : 'miss'}`);
  } catch (e) {
    authDebugLogIfEnabled(`boot: tryServerSessionRestore error ${e instanceof Error ? e.message : String(e)}`);
  }
}

// Persist auth to backup so it survives close+reopen (beforeunload/pagehide are unreliable when closing browser)
if (typeof window !== 'undefined') {
  const saveAuth = () => { persistAuthBackup(); };
  window.addEventListener('beforeunload', saveAuth);
  window.addEventListener('pagehide', saveAuth);
  // When tab/window becomes hidden (switch tab, minimize, or start closing), persist immediately and send diagnostic if debug on
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      saveAuth();
      void flushQueuedProfilePatch().catch(() => {});
      authDebugLogIfEnabled('visibility_hidden → flushQueuedProfilePatch attempted');
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

bootstrapAuthBeforeRender().finally(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  )
})


