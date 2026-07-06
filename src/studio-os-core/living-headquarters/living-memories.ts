type MilestoneLike = { id: string; label: string; description: string; recordedAt: string };

function yearsSince(from: Date, to: Date): number {
  let years = to.getFullYear() - from.getFullYear();
  const anniversary = new Date(from);
  anniversary.setFullYear(to.getFullYear());
  if (to < anniversary) years -= 1;
  return Math.max(0, years);
}

function isSameMonthDay(a: Date, b: Date): boolean {
  return a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatYears(n: number): string {
  if (n === 1) return 'one year';
  if (n === 2) return 'two years';
  if (n === 3) return 'three years';
  return `${n} years`;
}

/** Studio Intelligence™ living memory — acknowledges meaningful anniversaries. */
export function resolveLivingMemory(
  milestones: MilestoneLike[],
  organizationFoundedAt: string | null | undefined,
  now = new Date()
): string | null {
  const candidates: Array<{ priority: number; message: string }> = [];

  if (organizationFoundedAt) {
    const founded = new Date(organizationFoundedAt);
    if (isSameMonthDay(founded, now)) {
      const age = yearsSince(founded, now);
      if (age >= 1) {
        candidates.push({
          priority: 100,
          message: `Today marks ${formatYears(age)} since this organization was founded.`,
        });
      } else {
        candidates.push({
          priority: 90,
          message: 'Today is the founding day of this organization.',
        });
      }
    }
  }

  for (const m of milestones) {
    const recorded = new Date(m.recordedAt);
    if (!isSameMonthDay(recorded, now)) continue;
    const age = yearsSince(recorded, now);
    if (age < 1) continue;

    const lower = m.label.toLowerCase();
    if (/revenue|invoice|first customer|first client/i.test(lower)) {
      candidates.push({
        priority: 85,
        message: `Today marks ${formatYears(age)} since your ${m.label.toLowerCase()}.`,
      });
    } else if (/profession brain|brain complete/i.test(lower)) {
      candidates.push({
        priority: 80,
        message: `${formatYears(age)} ago today, your Profession Brain™ was completed.`,
      });
    } else if (/publish|knowledge|page/i.test(lower)) {
      candidates.push({
        priority: 70,
        message: `Your organization published its first knowledge asset on this date — ${formatYears(age)} ago.`,
      });
    } else {
      candidates.push({
        priority: 60,
        message: `Today marks ${formatYears(age)} since ${m.label}.`,
      });
    }
  }

  candidates.sort((a, b) => b.priority - a.priority);
  return candidates[0]?.message ?? null;
}

/** Recent major milestone celebration (within 7 days) — quiet pride, not fireworks. */
export function resolveCelebrationMessage(milestones: MilestoneLike[], now = new Date()): string | null {
  const majorIds = new Set([
    'first-revenue',
    'first-100-pages',
    'first-1000-followers',
    'first-publish',
    'organization-created',
  ]);

  for (const m of milestones) {
    if (!majorIds.has(m.id)) continue;
    const recorded = new Date(m.recordedAt);
    const days = (now.getTime() - recorded.getTime()) / 86_400_000;
    if (days < 0 || days > 7) continue;

    switch (m.id) {
      case 'first-revenue':
        return 'The Executive Lobby quietly congratulates you — first revenue recorded.';
      case 'first-100-pages':
        return 'One hundred knowledge assets. The Legacy Wall expands with pride.';
      case 'first-1000-followers':
        return 'One thousand customers. A commemorative crystal installation appears.';
      case 'first-publish':
        return 'First knowledge published — the headquarters remembers this moment.';
      case 'organization-created':
        return 'A new headquarters opens its doors. Your story begins here.';
      default:
        return `${m.label} — permanently remembered.`;
    }
  }

  return null;
}
