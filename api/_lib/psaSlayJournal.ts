/**
 * Slay Journal + Hall of Slay — member timeline and commemorative milestones.
 */
export type SlayJournalEventType =
  | 'joined_premium'
  | 'completed_consult'
  | 'ordered_unit'
  | 'hair_profile_set'
  | 'black_status'
  | 'one_year_premium'
  | 'purchase_context';

export type SlayJournalEntry = {
  id: string;
  type: SlayJournalEventType;
  title: string;
  monthLabel: string;
  occurredAt: string;
  meta?: Record<string, string>;
};

export type HallOfSlayMilestoneId =
  | 'first_custom_unit'
  | 'first_consult'
  | 'fifth_order'
  | 'one_year_premium'
  | 'black_status'
  | 'first_order';

export type HallOfSlayMilestone = {
  id: HallOfSlayMilestoneId;
  title: string;
  subtitle: string;
};

export const HALL_OF_SLAY_MILESTONES: Record<HallOfSlayMilestoneId, HallOfSlayMilestone> = {
  first_order: {
    id: 'first_order',
    title: 'FIRST ORDER',
    subtitle: 'Your Frontal Slayer journey started here.',
  },
  first_custom_unit: {
    id: 'first_custom_unit',
    title: 'FIRST CUSTOM UNIT',
    subtitle: 'Your first fully customized unit order.',
  },
  first_consult: {
    id: 'first_consult',
    title: 'FIRST CONSULT',
    subtitle: 'You booked your first consult with the team.',
  },
  fifth_order: {
    id: 'fifth_order',
    title: 'FIFTH ORDER',
    subtitle: 'A true rotation Slayer.',
  },
  one_year_premium: {
    id: 'one_year_premium',
    title: 'FIRST YEAR PREMIUM',
    subtitle: 'One year in the premium circle.',
  },
  black_status: {
    id: 'black_status',
    title: 'BLACK STATUS',
    subtitle: 'Top tier spend and access unlocked.',
  },
};

export type PsaPurchaseContextNote = {
  id: string;
  occasion: string;
  monthYear?: string;
  orderNumber?: string;
  unitName?: string;
  unitId?: string;
  createdAt: string;
};

export function formatMonthLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-US', { month: 'long' }).toUpperCase();
}

export function formatPsaSlayJournalBlock(input: {
  recentEntries?: SlayJournalEntry[];
  hallMilestones?: HallOfSlayMilestoneId[];
  purchaseContexts?: PsaPurchaseContextNote[];
  pendingMilestone?: HallOfSlayMilestoneId | null;
}): string {
  const lines: string[] = [];

  if (input.pendingMilestone) {
    const m = HALL_OF_SLAY_MILESTONES[input.pendingMilestone];
    lines.push(
      `- **Pending Hall of Slay milestone:** ${m.title} — commemorate once in this thread if natural, then move to next step.`
    );
  }

  const hall = input.hallMilestones ?? [];
  if (hall.length) {
    lines.push('- Hall of Slay (already earned):');
    for (const id of hall.slice(0, 8)) {
      const m = HALL_OF_SLAY_MILESTONES[id];
      lines.push(`  - ${m.title}`);
    }
  }

  const journal = input.recentEntries ?? [];
  if (journal.length) {
    lines.push('- Slay Journal (recent — reference naturally):');
    for (const e of journal.slice(0, 8)) {
      lines.push(`  - ${e.monthLabel}: ${e.title}`);
    }
  }

  const purchases = input.purchaseContexts ?? [];
  if (purchases.length) {
    lines.push('- Purchase context (follow up when timing fits):');
    for (const p of purchases.slice(0, 5)) {
      const when = p.monthYear ? ` (${p.monthYear})` : '';
      const ord = p.orderNumber ? ` — ${p.orderNumber}` : '';
      const unit = p.unitName ? ` for ${p.unitName}` : '';
      lines.push(`  - ${p.occasion}${unit}${when}${ord}`);
    }
    lines.push(
      '- **Don\'t Forget Why:** months later, proactively reference why they bought when relevant. Example: "YOU ORIGINALLY CHOSE THIS UNIT FOR YOUR BIRTHDAY TRIP TO ATLANTA." One line max, then helpful next step.'
    );
  }

  if (!lines.length) return '';
  return `\n## Slay Journal + Hall of Slay\n${lines.join('\n')}\n`;
}

export function normalizePurchaseOccasion(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, 120);
}
