import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { ensureAuthRestoredFromBackup, persistAuthBackup, isSignedIn } from './utils/adminAuth'
import { bootstrapCreativePreviewMode, isCreativePreviewMode } from './utils/creativePreviewMode'
import { bootstrapDesktopPreviewModes } from './utils/desktopPreview'
import { sanitizeStoredAuthPasswords } from './utils/authPasswordSanitize'
import { restoreSupabaseSessionFromCookie, getSupabase, signOutIfSessionEmailUnconfirmed } from './utils/supabase'
import { tryServerSessionRestore } from './utils/sessionRestore'
import { flushQueuedProfilePatch } from './utils/profileSyncQueue'
import { buildMinimalUserFromSupabaseSession, applyMinimalUserToStorage } from './utils/syncFromApi'
import { registerGlobalChunkLoadRecovery } from './utils/chunkLoadRecovery'
import { preloadPsaNudgeAssets } from './utils/psaNudgeAssetPreload'
import { bootstrapFrontalSlayerVisionEngine } from './workspaces/frontal-slayer/vision-engine'
import { purgeStaleVisionSessionOnBoot } from './utils/visionSessionBootGuard'

const AUTH_BOOT_TIMEOUT_MS = 6000

function withAuthTimeout<T>(promise: Promise<T>): Promise<T | undefined> {
  return Promise.race([
    promise,
    new Promise<undefined>((resolve) => window.setTimeout(() => resolve(undefined), AUTH_BOOT_TIMEOUT_MS)),
  ])
}

registerGlobalChunkLoadRecovery()
void preloadPsaNudgeAssets()

// Vision Engine workspace manifest — required before Vision Share / presentations on public routes.
bootstrapFrontalSlayerVisionEngine()
purgeStaleVisionSessionOnBoot()

// Strip any legacy plaintext passwords from browser storage (one-time migration).
sanitizeStoredAuthPasswords()

// Designer creative preview (preview deployments only) — before auth backup restore.
bootstrapCreativePreviewMode()

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
    const sessionResult = await withAuthTimeout(supabase.auth.getSession())
    if (!sessionResult) return
    const { data: { session } } = sessionResult
    if (await signOutIfSessionEmailUnconfirmed(supabase, session)) {
      return
    }
    if (session?.user) {
      const minimal = buildMinimalUserFromSupabaseSession(session.user)
      applyMinimalUserToStorage(minimal)
      try {
        const { syncAllFromApi } = await import('./utils/syncFromApi')
        await withAuthTimeout(syncAllFromApi())
      } catch {
        // ignore
      }
      window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }))
      return
    }
  } catch {
    // ignore
  }

  try {
    await withAuthTimeout(tryServerSessionRestore())
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

const rootEl = document.getElementById('root')
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  )
}

// Auth restore runs after first paint — never block React mount (fixes blank white screen if getSession/sync hangs).
void bootstrapAuthBeforeRender()
