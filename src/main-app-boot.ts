/**
 * Heavy main-app boot — skipped on TEMPORARY public debug routes (/__studio-health, etc.).
 */
import { ensureAuthRestoredFromBackup, persistAuthBackup, isSignedIn } from './utils/adminAuth'
import { bootstrapCreativePreviewMode, isCreativePreviewMode } from './utils/creativePreviewMode'
import { bootstrapDesktopPreviewModes } from './utils/desktopPreview'
import { sanitizeStoredAuthPasswords } from './utils/authPasswordSanitize'
import { restoreSupabaseSessionFromCookie, getSupabase, signOutIfSessionEmailUnconfirmed } from './utils/supabase'
import { tryServerSessionRestore } from './utils/sessionRestore'
import { flushQueuedProfilePatch } from './utils/profileSyncQueue'
import { buildMinimalUserFromSupabaseSession, applyMinimalUserToStorage } from './utils/syncFromApi'
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

async function bootstrapAuthBeforeRender(): Promise<void> {
  if (typeof window === 'undefined') return
  if (isCreativePreviewMode()) return
  if (isSignedIn()) return
  const supabase = getSupabase()
  if (!supabase) return
  try {
    const sessionResult = await withAuthTimeout(supabase.auth.getSession())
    if (!sessionResult) return
    const {
      data: { session },
    } = sessionResult
    if (await signOutIfSessionEmailUnconfirmed(supabase, session)) return
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

export function runMainAppBoot(): void {
  void preloadPsaNudgeAssets()
  bootstrapFrontalSlayerVisionEngine()
  purgeStaleVisionSessionOnBoot()
  sanitizeStoredAuthPasswords()
  bootstrapCreativePreviewMode()
  bootstrapDesktopPreviewModes()

  if (!isCreativePreviewMode()) {
    ensureAuthRestoredFromBackup()
  }

  restoreSupabaseSessionFromCookie()
  getSupabase()

  if (typeof window !== 'undefined') {
    const saveAuth = () => {
      persistAuthBackup()
    }
    window.addEventListener('beforeunload', saveAuth)
    window.addEventListener('pagehide', saveAuth)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        saveAuth()
        void flushQueuedProfilePatch().catch(() => {})
      }
    })
    window.addEventListener('pageshow', () => {
      restoreSupabaseSessionFromCookie()
      ensureAuthRestoredFromBackup()
    })
  }

  void bootstrapAuthBeforeRender()
}
