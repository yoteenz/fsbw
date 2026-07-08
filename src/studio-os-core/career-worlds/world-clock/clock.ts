import type { WorldClockScheduleEntry, WorldClockState } from '../core/schemas';
import type { CareerWorldEventCategory } from '../core/schemas';

export function createInitialWorldClock(now = new Date()): WorldClockState {
  return {
    currentDay: 1,
    currentWeek: 1,
    currentMonth: 1,
    currentYear: 1,
    season: 'spring',
    scheduledEvents: buildDefaultSchedule(),
    lastAdvancedAt: now.toISOString(),
  };
}

function buildDefaultSchedule(): WorldClockScheduleEntry[] {
  const entries: Array<{ day: number; title: string; category: CareerWorldEventCategory }> = [
    { day: 7, title: 'Weekly industry briefing', category: 'trend-change' },
    { day: 14, title: 'Professional certification window', category: 'certification-exam' },
    { day: 21, title: 'Community collaboration sprint', category: 'community-collaboration' },
    { day: 28, title: 'Industry conference season', category: 'industry-conference' },
    { day: 45, title: 'Technology shift announcement', category: 'technology-change' },
    { day: 60, title: 'Regional competition', category: 'competition' },
    { day: 90, title: 'Annual professional summit', category: 'industry-conference' },
  ];

  return entries.map((entry, index) => ({
    id: `clock-schedule-${index + 1}`,
    title: entry.title,
    granularity: entry.day <= 7 ? 'weekly' : entry.day <= 30 ? 'monthly' : 'yearly',
    scheduledDay: entry.day,
    category: entry.category,
    recurring: entry.day <= 28,
  }));
}

export function advanceWorldClock(clock: WorldClockState, simulatedDays: number): WorldClockState {
  let day = clock.currentDay + simulatedDays;
  let week = clock.currentWeek;
  let month = clock.currentMonth;
  let year = clock.currentYear;

  while (day > 7) {
    day -= 7;
    week += 1;
  }
  while (week > 4) {
    week -= 4;
    month += 1;
  }
  while (month > 12) {
    month -= 12;
    year += 1;
  }

  const season =
    month <= 3 ? 'spring' : month <= 6 ? 'summer' : month <= 9 ? 'autumn' : 'winter';

  return {
    ...clock,
    currentDay: day,
    currentWeek: week,
    currentMonth: month,
    currentYear: year,
    season,
    lastAdvancedAt: new Date().toISOString(),
  };
}

export function dueScheduleEntries(
  clock: WorldClockState,
  totalSimulatedDays: number
): WorldClockScheduleEntry[] {
  return clock.scheduledEvents.filter(
    (entry) => entry.scheduledDay <= totalSimulatedDays && entry.scheduledDay > totalSimulatedDays - 7
  );
}
