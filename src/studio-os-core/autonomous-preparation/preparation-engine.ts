import { getOrganizationAnticipationProfile } from '../anticipation-engine/store';
import { getOrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/store';
import { getOrganizationPredictiveProfile } from '../predictive-organization/store';
import { getOrganizationRelationshipMemoryProfile } from '../relationship-memory/store';
import { APPROVAL_ACTIONS, PREPARATION_TYPE_LABELS } from './constants';
import type { PendingPreparation, PreparationType } from './types';

function prepId(orgId: string, type: string, index: number): string {
  return `autoprep-${orgId}-${type}-${index}`;
}

function buildPrep(
  organizationId: string,
  type: PreparationType,
  index: number,
  title: string,
  summary: string,
  whyPrepared: string,
  trigger: string,
  expectedBenefit: string,
  confidencePct: number
): PendingPreparation {
  return {
    id: prepId(organizationId, type, index),
    type,
    title,
    summary,
    whyPrepared,
    trigger,
    expectedBenefit,
    confidencePct,
    status: 'pending',
    preparedAt: new Date().toISOString(),
    availableActions: [...APPROVAL_ACTIONS],
  };
}

export function buildPendingPreparationQueue(organizationId: string, companyName: string): PendingPreparation[] {
  const predictive = getOrganizationPredictiveProfile(organizationId);
  const anticipation = getOrganizationAnticipationProfile(organizationId);
  const blueprint = getOrganizationDiscoveryBlueprint(organizationId);
  const relationship = getOrganizationRelationshipMemoryProfile(organizationId);
  const queue: PendingPreparation[] = [];

  queue.push(
    buildPrep(
      organizationId,
      'meeting-agenda',
      0,
      "Tomorrow's executive meeting agenda",
      `Draft agenda covering priorities, decisions, and department updates for ${companyName}.`,
      'Calendar pattern shows executive sync tomorrow — agenda reduces meeting friction.',
      'Anticipation Engine deadline signal · recurring executive meeting rhythm.',
      'Founder enters meeting prepared — no last-minute scrambling.',
      86
    )
  );

  const quarterly = anticipation?.anticipationItems.find((a) => a.category === 'annual-events');
  if (quarterly || predictive?.executiveForecasts.find((f) => f.horizon === '90-day')) {
    queue.push(
      buildPrep(
        organizationId,
        'presentation',
        0,
        'Quarterly review presentation draft',
        'Slide deck with executive summary, KPI trends, and department highlights — editable before delivery.',
        'Your quarterly review is approaching — supporting materials assembled quietly.',
        quarterly?.summary ?? '90-day forecast · quarterly review cycle detected.',
        'Review-ready deck saves hours of assembly time before the board meeting.',
        84
      )
    );
  }

  const revenue = predictive?.predictions.find((p) => p.category === 'cash-flow' || p.category === 'busy-season');
  queue.push(
    buildPrep(
      organizationId,
      'report',
      0,
      'Executive performance report',
      'Compiled revenue, customer, and department metrics with trend commentary — nothing sends without approval.',
      revenue
        ? `Predictive signal: ${revenue.prediction.slice(0, 60)}…`
        : 'Monthly reporting cycle — historical pattern indicates report due this week.',
      revenue?.reasoning ?? 'Organization pulse · company health index · historical reporting cadence.',
      'Decision-ready report without manual data gathering.',
      revenue?.confidencePct ?? 78
    )
  );

  const launch = anticipation?.anticipationItems.find((a) => a.category === 'upcoming-launches');
  if (launch || (blueprint && blueprint.overallProgressPct >= 65)) {
    queue.push(
      buildPrep(
        organizationId,
        'launch-checklist',
        0,
        'Launch week checklist',
        'Department-by-department launch checklist with owners, deadlines, and approval gates.',
        "I noticed you're nearing launch week — operational readiness mapped before you ask.",
        launch?.summary ?? `Blueprint ${blueprint?.overallProgressPct ?? 0}% complete · launch window predicted.`,
        'Prevents launch-day surprises — every department accountable before go-live.',
        launch?.confidencePct ?? 80
      )
    );
  }

  queue.push(
    buildPrep(
      organizationId,
      'research',
      0,
      'Competitive and market research brief',
      'Organized research on industry trends, competitor moves, and customer sentiment — sourced from intelligence stack.',
      'Strategic planning session likely — research compiled before founder request.',
      'Predictive Organization industry trends · cross-org intelligence signals.',
      'Informed decisions without hours of manual research.',
      74
    )
  );

  const hiring = predictive?.predictions.find((p) => p.category === 'hiring');
  if (hiring) {
    queue.push(
      buildPrep(
        organizationId,
        'contract',
        0,
        'Employment contract template draft',
        'Role-specific contract draft with standard terms — legal review required before use.',
        'Hiring predicted within 60 days — contract template ready when decision is made.',
        hiring.reasoning,
        'Accelerates hiring once approved — no blank-page delay.',
        hiring.confidencePct
      )
    );
  }

  const marketing = anticipation?.anticipationItems.find((a) => a.category === 'marketing-opportunities');
  if (marketing) {
    queue.push(
      buildPrep(
        organizationId,
        'email-campaign',
        0,
        'Email campaign draft — three concepts',
        'Three email campaign concepts with subject lines, body copy, and send-time recommendations.',
        'Marketing opportunity window detected — campaigns drafted for review, never auto-sent.',
        marketing.summary,
        'Launch-ready campaigns awaiting founder approval only.',
        marketing.confidencePct
      )
    );
  }

  if (launch || marketing) {
    queue.push(
      buildPrep(
        organizationId,
        'social-calendar',
        0,
        'Social media calendar — launch week',
        'Two-week social content calendar with captions, hashtags, and posting schedule — no posts publish automatically.',
        'Launch or promotional window approaching — social calendar prepared quietly.',
        launch?.summary ?? marketing?.summary ?? 'Promotional cycle detected.',
        'Consistent launch presence without daily content scrambling.',
        77
      )
    );
  }

  queue.push(
    buildPrep(
      organizationId,
      'executive-summary',
      0,
      "Tomorrow's executive briefing",
      "One-page executive summary: priorities, risks, approvals needed, and department highlights.",
      "I've prepared tomorrow's executive briefing — matches your preferred summary-first review style.",
      relationship?.adaptationInsights.find((i) => i.id.includes('exec-summary'))?.insight ??
        'Relationship Memory: executive summary preference observed.',
      'Founder starts the day oriented — no inbox archaeology required.',
      relationship ? 88 : 82
    )
  );

  if (hiring) {
    queue.push(
      buildPrep(
        organizationId,
        'onboarding-doc',
        0,
        'New hire onboarding documentation',
        'First-week onboarding guide, role expectations, and team introduction checklist.',
        'Hiring signal active — onboarding pack ready before offer is extended.',
        hiring.prediction,
        'Smooth first week for new hires — professional impression from day one.',
        75
      )
    );
  }

  queue.push(
    buildPrep(
      organizationId,
      'proposal-template',
      0,
      'Client proposal template',
      `Branded proposal template for ${companyName} — scope, pricing structure, and terms placeholders.`,
      'Recurring client requests tracked — proposal template eliminates repetitive formatting.',
      'Relationship Memory organizational patterns · customer success cadence.',
      'Faster client proposals with consistent brand and pricing structure.',
      73
    )
  );

  return queue.slice(0, 11).map((p) => ({
    ...p,
    summary: `${p.summary} (${PREPARATION_TYPE_LABELS[p.type]})`,
  }));
}

export function summarizePendingQueue(preparations: PendingPreparation[]): string {
  const pending = preparations.filter((p) => p.status === 'pending');
  if (!pending.length) return 'Pending queue empty — Autonomous Preparation monitoring for next leverage moment.';
  return `${pending.length} preparation(s) awaiting approval — ${pending
    .slice(0, 3)
    .map((p) => p.title)
    .join(' · ')}. Nothing executes automatically.`;
}
