import type { OrganizationalPattern } from './types';

function currentMonth(): number {
  return new Date().getMonth();
}

function currentDayOfWeek(): number {
  return new Date().getDay();
}

export function buildOrganizationalPatterns(organizationId: string): OrganizationalPattern[] {
  const month = currentMonth();
  const day = currentDayOfWeek();
  const patterns: OrganizationalPattern[] = [];

  if (month === 1) {
    patterns.push({
      id: `pattern-${organizationId}-feb-busy`,
      pattern: 'Every February is busy',
      insight: 'Historical rhythm shows elevated workload in February — plan capacity early.',
      preparationAction: 'Pre-stage campaign assets and delegate operational reviews before February peak.',
      confidencePct: 82,
    });
  }

  if (month >= 10 || month <= 1) {
    patterns.push({
      id: `pattern-${organizationId}-holiday-season`,
      pattern: 'Q4 holiday season intensity',
      insight: 'Annual events and revenue push converge — customer follow-ups spike.',
      preparationAction: 'Queue content and prepare customer follow-up drafts awaiting approval.',
      confidencePct: 78,
    });
  }

  patterns.push({
    id: `pattern-${organizationId}-founder-late-night`,
    pattern: 'Founder edits content late at night',
    insight: 'Content revisions cluster after 9 PM — morning reviews benefit from overnight drafts.',
    preparationAction: 'Prepare draft edits and publishing queue before evening sessions.',
    confidencePct: 74,
  });

  if (day === 4 || day === 5) {
    patterns.push({
      id: `pattern-${organizationId}-thursday-marketing`,
      pattern: 'Marketing campaigns perform better on Thursdays',
      insight: 'Engagement signals historically peak mid-week — Thursday launches outperform.',
      preparationAction: 'Generate three promotional concepts and queue for Thursday approval.',
      confidencePct: 76,
    });
  }

  patterns.push({
    id: `pattern-${organizationId}-payroll-workload`,
    pattern: 'Payroll always creates additional workload',
    insight: 'Finance cycles add operational bottlenecks — schedule buffers around payroll windows.',
    preparationAction: 'Prepare payroll checklist SOP draft and meeting agenda for finance review.',
    confidencePct: 80,
  });

  if (month === 2 || month === 5 || month === 8 || month === 11) {
    patterns.push({
      id: `pattern-${organizationId}-quarterly-review`,
      pattern: 'Quarterly review cycle approaching',
      insight: 'Executive rhythm includes quarterly performance synthesis.',
      preparationAction: 'Generate quarterly review report draft — awaiting founder approval.',
      confidencePct: 85,
    });
  }

  return patterns.slice(0, 6);
}
