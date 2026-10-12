import { describe, expect, it } from 'vitest';
import { dedupeVisitorsFromRows } from './livePresenceQuery.js';

describe('dedupeVisitorsFromRows', () => {
  it('keeps latest created_at per visitor_id', () => {
    const rows = [
      {
        visitor_id: 'visitor-a',
        path: '/old',
        created_at: '2026-01-01T00:00:00.000Z',
        meta: { lat: 1, lng: 2, city: 'A' },
      },
      {
        visitor_id: 'visitor-a',
        path: '/new',
        created_at: '2026-01-02T00:00:00.000Z',
        meta: { lat: 3, lng: 4, city: 'B' },
      },
    ];
    const out = dedupeVisitorsFromRows(rows);
    expect(out).toHaveLength(1);
    expect(out[0]?.path).toBe('/new');
    expect(out[0]?.lat).toBe(3);
  });

  it('skips rows without geo', () => {
    const out = dedupeVisitorsFromRows([
      { visitor_id: 'x', path: '/', created_at: '2026-01-01T00:00:00.000Z', meta: {} },
    ]);
    expect(out).toHaveLength(0);
  });
});
