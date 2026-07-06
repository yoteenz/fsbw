/** Guard localStorage writes — Studio OS bootstrap must not crash when quota is full. */

export function isQuotaExceededError(error: unknown): boolean {
  if (error instanceof DOMException) {
    return error.name === 'QuotaExceededError' || error.code === 22;
  }
  if (error instanceof Error) {
    return /quota/i.test(error.message);
  }
  return false;
}

export function safeLocalStorageSetItem(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (isQuotaExceededError(error)) {
      console.warn(`[safeLocalStorage] quota exceeded — skipped write: ${key}`);
      return false;
    }
    throw error;
  }
}

export function safeLocalStorageGetItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeLocalStorageRemoveItem(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
