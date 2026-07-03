import { getSupabaseAdmin } from '../supabase.js';
import {
  coerceEmailLayoutDebugStore,
  EMAIL_LAYOUT_DEBUG_CONFIG_KEY,
  type EmailLayoutDebugStore,
} from './emailLayoutConfig.js';

let cachedStore: EmailLayoutDebugStore | null = null;
let cacheLoadedAt = 0;
const CACHE_TTL_MS = 60_000;

export async function loadEmailLayoutDebugStore(): Promise<EmailLayoutDebugStore | null> {
  const now = Date.now();
  if (cachedStore && now - cacheLoadedAt < CACHE_TTL_MS) return cachedStore;
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', EMAIL_LAYOUT_DEBUG_CONFIG_KEY)
      .maybeSingle();
    if (error) {
      console.warn('[loadEmailLayoutDebugStore]', error.message);
      return cachedStore;
    }
    const value = data?.value;
    if (value == null) {
      cachedStore = null;
      cacheLoadedAt = now;
      return null;
    }
    cachedStore = coerceEmailLayoutDebugStore(value);
    cacheLoadedAt = now;
    return cachedStore;
  } catch (e) {
    console.warn('[loadEmailLayoutDebugStore]', e);
    return cachedStore;
  }
}

export function invalidateEmailLayoutDebugCache(): void {
  cachedStore = null;
  cacheLoadedAt = 0;
}
