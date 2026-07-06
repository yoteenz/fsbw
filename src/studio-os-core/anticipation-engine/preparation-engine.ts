import { PREPARATION_TYPE_LABELS } from './constants';
import type { AnticipationItem, ProactivePreparation } from './types';

function prepId(orgId: string, type: string, index: number): string {
  return `prep-${orgId}-${type}-${index}`;
}

export function buildProactivePreparations(
  organizationId: string,
  anticipations: AnticipationItem[]
): ProactivePreparation[] {
  const now = new Date().toISOString();
  const preparations: ProactivePreparation[] = [];

  const launch = anticipations.find((a) => a.category === 'upcoming-launches');
  if (launch) {
    preparations.push({
      id: prepId(organizationId, 'launch-assets', 0),
      type: 'launch-assets',
      title: 'Launch asset bundle prepared',
      description: `Draft launch assets for "${launch.summary.slice(0, 60)}" — creative, copy, and scheduling outline ready for approval.`,
      status: 'awaiting-approval',
      preparedAt: now,
      relatedAnticipationId: launch.id,
    });
  }

  const deadline = anticipations.find((a) => a.category === 'deadlines');
  if (deadline) {
    preparations.push({
      id: prepId(organizationId, 'meetings', 0),
      type: 'meetings',
      title: "Tomorrow's meeting agenda prepared",
      description: `I've already prepared tomorrow's meeting agenda covering ${deadline.label.toLowerCase()} — review and approve before send.`,
      status: 'awaiting-approval',
      preparedAt: now,
      relatedAnticipationId: deadline.id,
    });
  }

  const marketing = anticipations.find((a) => a.category === 'marketing-opportunities');
  if (marketing) {
    preparations.push({
      id: prepId(organizationId, 'content-queue', 0),
      type: 'content-queue',
      title: 'Three promotional concepts generated',
      description: "I've generated three promotional concepts aligned with current pulse signals — queued for your review.",
      status: 'awaiting-approval',
      preparedAt: now,
      relatedAnticipationId: marketing.id,
    });
  }

  const customer = anticipations.find((a) => a.category === 'customer-follow-ups');
  if (customer) {
    preparations.push({
      id: prepId(organizationId, 'draft-emails', 0),
      type: 'draft-emails',
      title: 'Customer follow-up emails drafted',
      description: 'Draft follow-up emails prepared for priority customers — nothing sends without approval.',
      status: 'awaiting-approval',
      preparedAt: now,
      relatedAnticipationId: customer.id,
    });
  }

  const knowledge = anticipations.find((a) => a.category === 'knowledge-gaps' || a.category === 'training-opportunities');
  if (knowledge) {
    preparations.push({
      id: prepId(organizationId, 'SOPs', 0),
      type: 'SOPs',
      title: 'SOP draft prepared for knowledge gap',
      description: `Draft SOP covering ${knowledge.label.toLowerCase()} — update Profession Brain after approval.`,
      status: 'awaiting-approval',
      preparedAt: now,
      relatedAnticipationId: knowledge.id,
    });
  }

  const revenue = anticipations.find((a) => a.category === 'revenue-opportunities');
  if (revenue) {
    preparations.push({
      id: prepId(organizationId, 'reports', 0),
      type: 'reports',
      title: 'Revenue opportunity report generated',
      description: 'Executive revenue opportunity report compiled from pulse and health signals — awaiting approval.',
      status: 'awaiting-approval',
      preparedAt: now,
      relatedAnticipationId: revenue.id,
    });
  }

  const hiring = anticipations.find((a) => a.category === 'hiring-needs');
  if (hiring) {
    preparations.push({
      id: prepId(organizationId, 'onboarding', 0),
      type: 'onboarding',
      title: 'Onboarding materials prepared',
      description: 'Role onboarding packet and first-week agenda drafted — ready when hiring decision is approved.',
      status: 'awaiting-approval',
      preparedAt: now,
      relatedAnticipationId: hiring.id,
    });
  }

  const quarterly = anticipations.find((a) => a.category === 'annual-events');
  if (quarterly) {
    preparations.push({
      id: prepId(organizationId, 'presentations', 0),
      type: 'presentations',
      title: 'Quarterly review presentation prepared',
      description: 'Your quarterly review is next week — presentation deck draft ready for founder edits.',
      status: 'awaiting-approval',
      preparedAt: now,
      relatedAnticipationId: quarterly.id,
    });
  }

  if (preparations.length < 4) {
    preparations.push({
      id: prepId(organizationId, 'research', preparations.length),
      type: 'research',
      title: 'Compiled research brief',
      description: `Organizational research brief on ${PREPARATION_TYPE_LABELS.research.toLowerCase()} topics — compiled quietly, awaiting approval.`,
      status: 'awaiting-approval',
      preparedAt: now,
    });
  }

  return preparations.slice(0, 8);
}

export function summarizePreparations(preparations: ProactivePreparation[]): string {
  if (preparations.length === 0) return 'Anticipation Engine monitoring — preparations will appear as needs are predicted.';
  const titles = preparations.slice(0, 3).map((p) => p.title);
  return `${preparations.length} preparation(s) ready — ${titles.join(' · ')}. Everything waits for approval.`;
}
