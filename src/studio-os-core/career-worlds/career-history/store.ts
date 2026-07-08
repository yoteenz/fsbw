import type { CareerHistoryEntry, CareerPlayerProfile, CareerPromotionRecord } from '../core/schemas';

export function appendCareerHistoryEntry(
  history: CareerHistoryEntry[],
  entry: Omit<CareerHistoryEntry, 'id'>
): CareerHistoryEntry[] {
  return [{ ...entry, id: `history-${entry.day}-${history.length}` }, ...history].slice(0, 100);
}

export function recordPromotion(
  profile: CareerPlayerProfile,
  toTitle: string,
  day: number,
  reason: string
): { profile: CareerPlayerProfile; history: CareerPromotionRecord } {
  const promotion: CareerPromotionRecord = {
    id: `promo-${day}`,
    fromTitle: profile.careerTitle,
    toTitle,
    day,
    reason,
  };

  return {
    profile: {
      ...profile,
      careerTitle: toTitle,
      promotionHistory: [promotion, ...profile.promotionHistory].slice(0, 30),
      experience: profile.experience + 10,
      updatedAt: new Date().toISOString(),
    },
    history: promotion,
  };
}

export function buildHistoryFromProfile(profile: CareerPlayerProfile): CareerHistoryEntry[] {
  const entries: CareerHistoryEntry[] = [];

  for (const promo of profile.promotionHistory) {
    entries.push({
      id: promo.id,
      day: promo.day,
      type: 'role-change',
      title: promo.toTitle,
      summary: promo.reason,
    });
  }

  for (const cert of profile.certifications) {
    entries.push({
      id: cert.id,
      day: cert.issuedDay,
      type: 'certification',
      title: cert.name,
      summary: `Issued by ${cert.issuer}`,
    });
  }

  for (const work of profile.publishedWork) {
    entries.push({
      id: work.id,
      day: work.publishedDay,
      type: 'publication',
      title: work.title,
      summary: work.type,
    });
  }

  return entries.sort((a, b) => b.day - a.day);
}
