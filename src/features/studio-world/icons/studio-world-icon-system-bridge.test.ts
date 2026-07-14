import { describe, expect, it, beforeEach } from 'vitest';
import {
  ensureStudioWorldIconSystemBridge,
  resetStudioWorldIconSystemBridge,
} from './studio-world-icon-system-bridge';
import {
  getIcon,
  searchIcons,
  resolveWorkbenchIcon,
  EXPERIENCE_LAB_ICON_NAMES,
} from './index';

describe('Studio World Icon System Bridge', () => {
  beforeEach(() => {
    resetStudioWorldIconSystemBridge();
  });

  it('seeds all Experience Lab icons without modifying count', () => {
    const { registered } = ensureStudioWorldIconSystemBridge();
    expect(registered).toBe(EXPERIENCE_LAB_ICON_NAMES.length);
    expect(getIcon('blueprint')).not.toBeNull();
  });

  it('registers workbench aliases', () => {
    ensureStudioWorldIconSystemBridge();
    const resolved = resolveWorkbenchIcon({ toolId: 'architectural-tools' });
    expect(resolved?.iconId).toBe('workbench.architectural-tools');
  });

  it('icons remain searchable by department tag', () => {
    ensureStudioWorldIconSystemBridge();
    const results = searchIcons({ department: 'experience-lab' });
    expect(results.length).toBeGreaterThan(0);
  });

  it('bridge is idempotent', () => {
    ensureStudioWorldIconSystemBridge();
    const second = ensureStudioWorldIconSystemBridge();
    expect(second.registered).toBe(EXPERIENCE_LAB_ICON_NAMES.length);
  });
});
