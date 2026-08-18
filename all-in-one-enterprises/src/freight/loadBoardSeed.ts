import { isoNow, daysAgo } from '../demo/dateHelpers';
import type { LoadBoardPublication } from './freightTypes';

/** Seed publications for brokerage loads available on AIO Load Board (demo). */
export function createLoadBoardSeedPublications(loadIds: string[]): LoadBoardPublication[] {
  const now = isoNow();
  return loadIds.map((loadId, i) => ({
    loadId,
    sourceType: 'aio_shipper_freight' as const,
    visibility: 'published' as const,
    bookingMode: (i % 3 === 0 ? 'instant_book' : 'submit_offer') as LoadBoardPublication['bookingMode'],
    publishedAt: daysAgo(Math.min(i + 1, 72)),
    publishedByStaffId: 'staff-7',
    trailerLengthFt: 53,
    fullPartial: 'full' as const,
    maxWeightLbs: 45000,
    dropAndHook: i % 2 === 0,
    liveLoad: true,
    hazmat: false,
    teamRequired: false,
    createdAt: now,
    updatedAt: now,
  }));
}

/** Default brokerage load ids from seed that should appear on carrier load board. */
export const DEMO_LOAD_BOARD_LOAD_IDS = ['br-load-a', 'br-load-b', 'br-load-c'];
