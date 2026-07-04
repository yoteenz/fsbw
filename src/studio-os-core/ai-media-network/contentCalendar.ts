/**
 * Network programming calendar — daily, weekly, monthly, season planning.
 */

import type { CalendarSlot, NetworkShowId, SeasonPlan } from './types';
import { SHOW_LABELS } from './constants';

export function groupCalendarByWeek(slots: CalendarSlot[]): Map<string, CalendarSlot[]> {
  const byWeek = new Map<string, CalendarSlot[]>();
  for (const slot of slots) {
    const d = new Date(slot.date);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().slice(0, 10);
    if (!byWeek.has(key)) byWeek.set(key, []);
    byWeek.get(key)!.push(slot);
  }
  return byWeek;
}

export function groupCalendarByMonth(slots: CalendarSlot[]): Map<string, CalendarSlot[]> {
  const byMonth = new Map<string, CalendarSlot[]>();
  for (const slot of slots) {
    const key = slot.date.slice(0, 7);
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(slot);
  }
  return byMonth;
}

export function weeklyLineup(slots: CalendarSlot[]): CalendarSlot[] {
  const showOrder: NetworkShowId[] = [
    'money-monday',
    'truth-tuesday',
    'workflow-wednesday',
    'smart-living-thursday',
    'future-friday',
  ];
  return [...slots].sort((a, b) => showOrder.indexOf(a.showId) - showOrder.indexOf(b.showId));
}

export function formatSeasonLabel(plan: SeasonPlan): string {
  return `${SHOW_LABELS[plan.showId]} · SEASON ${plan.seasonNumber} · ${plan.theme}`;
}
