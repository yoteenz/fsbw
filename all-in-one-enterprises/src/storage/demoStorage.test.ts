import { afterEach, describe, expect, it, vi } from 'vitest';
import { writeStorage, storageWriteErrorMessage } from './demoStorage';

describe('demoStorage write handling', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('surfaces quota exceeded without throwing', () => {
    const setItem = vi.fn(() => {
      const err = new DOMException('quota', 'QuotaExceededError');
      throw err;
    });
    vi.stubGlobal('window', {
      localStorage: { setItem, getItem: () => null, removeItem: () => {} },
    });

    const result = writeStorage('aio_debug_store', { version: 26, documents: [] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe('quota_exceeded');
      expect(storageWriteErrorMessage(result.error)).toContain('full');
    }
  });
});
