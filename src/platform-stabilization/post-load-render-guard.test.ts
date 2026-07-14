import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));

describe('post-load-render-guard', () => {
  it('defers early forced recovery while bootstrap is still running', () => {
    const src = readFileSync(resolve(DIR, 'post-load-render-guard.ts'), 'utf8');
    expect(src).toContain("reason === '4s-post-load'");
    expect(src).toContain('live?.started && !live.complete');
  });
});

describe('StudioDebugRoutes app shell', () => {
  it('uses lightweight Studio route suspense fallback instead of LoadingScreen watchdog', () => {
    const src = readFileSync(resolve(DIR, '../routes/StudioDebugRoutes.tsx'), 'utf8');
    expect(src).toContain('StudioRouteSuspenseFallback');
    expect(src).toContain('lazyWithRetry');
    expect(src).not.toContain('LoadingScreen source="App.lazy"');
  });
});
