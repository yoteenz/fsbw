import { EXPIRATION_WINDOWS_DAYS } from './roadReadyConfig';
import type { ExpirationState, RoadReadyItem, RoadReadyScores } from './roadReadyTypes';

export function computeExpirationState(expiresAt?: string, now = new Date()): ExpirationState {
  if (!expiresAt) return 'unknown';
  const exp = new Date(expiresAt);
  if (Number.isNaN(exp.getTime())) return 'unknown';
  const days = Math.ceil((exp.getTime() - now.getTime()) / 86400000);
  if (days < 0) return 'expired';
  if (days <= EXPIRATION_WINDOWS_DAYS[EXPIRATION_WINDOWS_DAYS.length - 1]) return 'expiring_soon';
  return 'active';
}

export function expirationLabel(expiresAt?: string): string | null {
  if (!expiresAt) return null;
  const state = computeExpirationState(expiresAt);
  const exp = new Date(expiresAt);
  const days = Math.ceil((exp.getTime() - Date.now()) / 86400000);
  if (state === 'expired') return 'ACTION REQUIRED';
  if (state === 'expiring_soon') return `EXPIRES IN ${days} DAYS`;
  return 'ACTIVE';
}

/** Centralized Road Ready scoring — single source of truth */
export function computeRoadReadyScores(items: RoadReadyItem[]): RoadReadyScores {
  let setupWeight = 0;
  let setupEarned = 0;
  let verifiedWeight = 0;
  let verifiedEarned = 0;

  let verifiedCount = 0;
  let selfReportedCount = 0;
  let needsAttentionCount = 0;
  let inProgressCount = 0;
  let optionalCount = 0;

  for (const item of items) {
    if (item.status === 'optional' || !item.applicable) {
      if (item.status === 'optional') optionalCount++;
      continue;
    }

    if (!item.requiredForProgress) continue;

    const w = item.weight || 1;
    setupWeight += w;

    if (item.status === 'completed') {
      if (item.verificationStatus === 'verified') {
        setupEarned += w;
        verifiedEarned += w;
        verifiedCount++;
      } else if (item.verificationStatus === 'self_reported') {
        setupEarned += w * 0.85;
        selfReportedCount++;
      } else if (item.verificationStatus === 'pending_review') {
        setupEarned += w * 0.7;
      } else {
        setupEarned += w;
      }
    } else if (item.status === 'in_progress') {
      setupEarned += w * 0.5;
      inProgressCount++;
    } else if (item.status === 'needs_review' || item.status === 'action_needed') {
      needsAttentionCount++;
    }

    verifiedWeight += w;
  }

  const setupProgress = setupWeight > 0 ? Math.round((setupEarned / setupWeight) * 100) : 0;
  const verifiedProgress = verifiedWeight > 0 ? Math.round((verifiedEarned / verifiedWeight) * 100) : 0;

  return {
    setupProgress,
    verifiedProgress,
    verifiedCount,
    selfReportedCount,
    needsAttentionCount,
    inProgressCount,
    optionalCount,
  };
}

export function maskVin(vin?: string): string {
  if (!vin || vin.length < 6) return '••••••';
  return `••••••${vin.slice(-6)}`;
}
