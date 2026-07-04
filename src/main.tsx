import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { ensureAuthRestoredFromBackup, persistAuthBackup, isSignedIn } from './utils/adminAuth'
import { bootstrapCreativePreviewMode, isCreativePreviewMode } from './utils/creativePreviewMode'
import { bootstrapVisionShareFromPath } from './studio-os-core/vision-engine/shareBootstrap'
import { bootstrapDesktopPreviewModes } from './utils/desktopPreview'
import { sanitizeStoredAuthPasswords } from './utils/authPasswordSanitize'
import { restoreSupabaseSessionFromCookie, getSupabase, signOutIfSessionEmailUnconfirmed } from './utils/supabase'
import { tryServerSessionRestore } from './utils/sessionRestore'
import { flushQueuedProfilePatch } from './utils/profileSyncQueue'
import { buildMinimalUserFromSupabaseSession, applyMinimalUserToStorage } from './utils/syncFromApi'
import { registerGlobalChunkLoadRecovery } from './utils/chunkLoadRecovery'
import { preloadPsaNudgeAssets } from './utils/psaNudgeAssetPreload'

registerGlobalChunkLoadRecovery()
void preloadPsaNudgeAssets()

// Strip any legacy plaintext passwords from browser storage (one-time migration).
sanitizeStoredAuthPasswords()

// Designer creative preview (preview deployments only) — before auth backup restore.
bootstrapCreativePreviewMode()

// Vision Share™ bootstrap for /vision/:slug links (internal presentation layer — not public nav)
bootstrapVisionShareFromPath(window.location.pathname)

// Staging: `?mobileDesktop=1` on `/desktop/*` — 1920px viewport before first paint.
bootstrapDesktopPreviewModes()

// Restore app auth from backup if something (e.g. Supabase token refresh) cleared isSignedIn/currentUser
if (!isCreativePreviewMode()) {
  ensureAuthRestoredFromBackup()
}

// Restore Supabase session from cookies into localStorage so Safari (which may clear localStorage on close) keeps the user signed in
restoreSupabaseSessionFromCookie()
// Initialize Supabase client so it picks up rehydrated session/auth storage.
getSupabase()

async function bootstrapAuthBeforeRender(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (isCreativePreviewMode()) {
    return;
  }
  if (isSignedIn()) {
    return;
  }
  const supabase = getSupabase();
  if (!supabase) {
    return;
  }
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (await signOutIfSessionEmailUnconfirmed(supabase, session)) {
      return;
    }
    if (session?.user) {
      const minimal = buildMinimalUserFromSupabaseSession(session.user);
      applyMinimalUserToStorage(minimal);
      // Pull profile/orders/cart/wishlist from API so users are not stuck on minimal local state after refresh.
      try {
        const { syncAllFromApi } = await import('./utils/syncFromApi');
        await syncAllFromApi();
      } catch {
        // ignore
      }
      window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
      return;
    }
  } catch {
    // ignore
  }

  try {
    await tryServerSessionRestore();
  } catch {
    // ignore
  }
}

// Persist auth to backup so it survives close+reopen (beforeunload/pagehide are unreliable when closing browser)
if (typeof window !== 'undefined') {
  const saveAuth = () => { persistAuthBackup(); };
  window.addEventListener('beforeunload', saveAuth);
  window.addEventListener('pagehide', saveAuth);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      saveAuth();
      void flushQueuedProfilePatch().catch(() => {});
    }
  });
  window.addEventListener('pageshow', () => {
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
