import { getOrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/store';
import { getOrganizationHealthIndexProfile } from '../company-health-index/store';
import { getOrganizationKnowledgeCommerceProfile } from '../knowledge-commerce/store';
import { getOrganizationLegacyVaultProfile } from '../legacy-vault/store';
import { getOrganizationMemoryProfile } from '../memory-engine/store';
import { getOrganizationInaugurationProfile } from '../organization-inauguration/store';
import { getOrganizationConsciousnessProfile } from '../organizational-consciousness/store';
import { getOrganizationPredictiveProfile } from '../predictive-organization/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import type { ExecutiveHistoryDepartment, ExecutiveHistoryEvent } from './history-types';

function deriveFoundedDate(organizationId: string): string {
  const inauguration = getOrganizationInaugurationProfile(organizationId);
  if (inauguration?.charter?.dateEstablished) {
    const parsed = Date.parse(inauguration.charter.dateEstablished);
    if (!Number.isNaN(parsed)) return new Date(parsed).toISOString();
  }
  const blueprint = getOrganizationDiscoveryBlueprint(organizationId);
  if (blueprint?.updatedAt) return blueprint.updatedAt;
  const year = 2024 + (organizationId.length % 3);
  return new Date(`${year}-01-15T12:00:00.000Z`).toISOString();
}

function eventId(prefix: string, suffix: string): string {
  return `eth-${prefix}-${suffix}`;
}

function yearFrom(iso: string): number {
  return new Date(iso).getFullYear();
}

function deptForType(type: ExecutiveHistoryEvent['type']): ExecutiveHistoryDepartment {
  const map: Partial<Record<ExecutiveHistoryEvent['type'], ExecutiveHistoryDepartment>> = {
    'organization-founded': 'executive',
    'blueprint-completed': 'executive',
    'headquarters-activation': 'executive',
    'profession-brain-update': 'knowledge',
    'knowledge-commerce-launch': 'knowledge',
    'marketing-campaign': 'marketing',
    'product-release': 'product',
    hiring: 'people',
    promotion: 'people',
    'major-customer': 'customer-success',
    'revenue-milestone': 'finance',
    'executive-decision': 'executive',
    'innovation-lab': 'innovation',
    award: 'executive',
    'brand-update': 'marketing',
    partnership: 'customer-success',
    'automation-milestone': 'technology',
    'knowledge-growth': 'knowledge',
    'health-improvement': 'operations',
    'legacy-preserved': 'executive',
    'consciousness-milestone': 'executive',
    'predictive-insight': 'executive',
  };
  return map[type] ?? 'executive';
}

export function buildExecutiveHistoryEvents(organizationId: string): ExecutiveHistoryEvent[] {
  const events: ExecutiveHistoryEvent[] = [];
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const foundedAt = deriveFoundedDate(organizationId);

  events.push({
    id: eventId('founded', organizationId),
    type: 'organization-founded',
    title: `${companyName} Founded`,
    summary: `${companyName} began its journey — the first chapter of permanent executive history.`,
    occurredAt: foundedAt,
    year: yearFrom(foundedAt),
    department: 'executive',
    organizationId,
    sourceModule: 'organization-inauguration',
    significance: 'foundational',
    archivedHeadquarters: true,
    historicalDashboardAvailable: true,
  });

  const blueprint = getOrganizationDiscoveryBlueprint(organizationId);
  if (blueprint) {
    const at = blueprint.updatedAt ?? foundedAt;
    events.push({
      id: eventId('blueprint', organizationId),
      type: 'blueprint-completed',
      title: 'Business Discovery Blueprint™ Completed',
      summary: `Organizational birth certificate captured — ${blueprint.overallProgressPct ?? 100}% discovery complete.`,
      occurredAt: at,
      year: yearFrom(at),
      department: 'executive',
      organizationId,
      sourceModule: 'business-discovery-blueprint',
      significance: 'foundational',
      metrics: [{ label: 'Progress', value: `${blueprint.overallProgressPct ?? 100}%` }],
    });
  }

  const inauguration = getOrganizationInaugurationProfile(organizationId);
  const hqActivatedAt = inauguration?.headquartersEnteredAt ?? inauguration?.inauguratedAt;
  if (hqActivatedAt) {
    events.push({
      id: eventId('hq', organizationId),
      type: 'headquarters-activation',
      title: 'Headquarters Activation',
      summary: inauguration?.inaugurationComplete
        ? 'Headquarters ceremonially activated — your legacy begins now.'
        : 'Headquarters activation in progress — permanent home for organizational intelligence.',
      occurredAt: hqActivatedAt,
      year: yearFrom(hqActivatedAt),
      department: 'executive',
      organizationId,
      sourceModule: 'organization-inauguration',
      significance: 'foundational',
      archivedHeadquarters: true,
      historicalDashboardAvailable: true,
    });
  }

  if (brain) {
    const brainUpdates = brain.brains.flatMap((b) => b.knowledgeEntries).slice(0, 8);
    brainUpdates.forEach((entry, i) => {
      events.push({
        id: eventId('brain', entry.id),
        type: 'profession-brain-update',
        title: `Profession Brain™ — ${entry.title}`,
        summary: entry.what.slice(0, 120),
        occurredAt: entry.updatedAt,
        year: yearFrom(entry.updatedAt),
        department: 'knowledge',
        organizationId,
        sourceModule: 'profession-brain',
        significance: i === 0 ? 'major' : 'notable',
        metrics: [{ label: 'Version', value: String(entry.version) }],
      });
    });
  }

  const commerce = getOrganizationKnowledgeCommerceProfile(organizationId);
  if (commerce) {
    commerce.products
      .filter((p) => p.status === 'published')
      .slice(0, 4)
      .forEach((product) => {
        events.push({
          id: eventId('commerce', product.id),
          type: 'knowledge-commerce-launch',
          title: `Knowledge Commerce™ — ${product.title}`,
          summary: product.description.slice(0, 120),
          occurredAt: product.updatedAt,
          year: yearFrom(product.updatedAt),
          department: 'knowledge',
          organizationId,
          sourceModule: 'knowledge-commerce',
          significance: product.revenueUsd > 1000 ? 'major' : 'notable',
          metrics: [
            { label: 'Revenue', value: `$${product.revenueUsd}` },
            { label: 'Rating', value: String(product.rating) },
          ],
        });
      });
  }

  const memory = getOrganizationMemoryProfile(organizationId);
  if (memory) {
    memory.records.slice(0, 10).forEach((record) => {
      const typeMap: Partial<Record<string, ExecutiveHistoryEvent['type']>> = {
        campaign: 'marketing-campaign',
        project: 'product-release',
        experiment: 'innovation-lab',
        decision: 'executive-decision',
        success: 'revenue-milestone',
        'customer-history': 'major-customer',
        'workflow-improvement': 'automation-milestone',
        lesson: 'knowledge-growth',
        'professional-insight': 'knowledge-growth',
        'historical-metric': 'revenue-milestone',
      };
      const eventType = typeMap[record.type] ?? 'knowledge-growth';
      events.push({
        id: eventId('mem', record.id),
        type: eventType,
        title: record.title,
        summary: record.summary,
        occurredAt: record.occurredAt,
        year: yearFrom(record.occurredAt),
        department: deptForType(eventType),
        organizationId,
        sourceModule: 'memory-engine',
        significance: record.outcome === 'success' ? 'major' : 'notable',
        metrics: record.metrics,
      });
    });
  }

  const legacy = getOrganizationLegacyVaultProfile(organizationId);
  if (legacy) {
    legacy.archiveEntries.slice(0, 5).forEach((entry) => {
      events.push({
        id: eventId('legacy', entry.id),
        type: 'legacy-preserved',
        title: entry.title,
        summary: entry.summary,
        occurredAt: entry.preservedAt,
        year: yearFrom(entry.preservedAt),
        department: 'executive',
        organizationId,
        sourceModule: 'legacy-vault',
        significance: 'major',
      });
    });
  }

  const health = getOrganizationHealthIndexProfile(organizationId);
  if (health) {
    health.categoryScores
      .filter((c) => c.trend === 'rising' && c.scorePct >= 70)
      .slice(0, 3)
      .forEach((cat) => {
        events.push({
          id: eventId('health', cat.id),
          type: 'health-improvement',
          title: `${cat.label} Health Improved`,
          summary: cat.signal,
          occurredAt: health.updatedAt,
          year: yearFrom(health.updatedAt),
          department: 'operations',
          organizationId,
          sourceModule: 'company-health-index',
          significance: 'notable',
          metrics: [{ label: 'Score', value: `${cat.scorePct}%` }],
          historicalDashboardAvailable: true,
        });
      });
  }

  const consciousness = getOrganizationConsciousnessProfile(organizationId);
  if (consciousness) {
    events.push({
      id: eventId('consciousness', organizationId),
      type: 'consciousness-milestone',
      title: 'Organizational Consciousness Unified',
      summary: `${consciousness.systemsConnected}/${consciousness.systemsTotal} systems sharing context — one intelligence.`,
      occurredAt: consciousness.updatedAt,
      year: yearFrom(consciousness.updatedAt),
      department: 'executive',
      organizationId,
      sourceModule: 'organizational-consciousness',
      significance: 'major',
      metrics: [{ label: 'Consciousness', value: `${consciousness.consciousnessScore}%` }],
    });
  }

  const predictive = getOrganizationPredictiveProfile(organizationId);
  if (predictive) {
    predictive.predictions.slice(0, 3).forEach((pred) => {
      events.push({
        id: eventId('pred', pred.id),
        type: 'predictive-insight',
        title: `Predictive Insight — ${pred.category}`,
        summary: pred.prediction,
        occurredAt: predictive.updatedAt,
        year: yearFrom(predictive.updatedAt),
        department: 'executive',
        organizationId,
        sourceModule: 'predictive-organization',
        significance: 'notable',
        metrics: [{ label: 'Confidence', value: `${pred.confidencePct}%` }],
      });
    });
  }

  if (events.length < 8) {
    const synthTypes: ExecutiveHistoryEvent['type'][] = [
      'marketing-campaign',
      'product-release',
      'hiring',
      'promotion',
      'award',
      'brand-update',
      'innovation-lab',
    ];
    synthTypes.forEach((type, i) => {
      const base = new Date(foundedAt);
      base.setMonth(base.getMonth() + (i + 1) * 2);
      events.push({
        id: eventId('synth', type),
        type,
        title: HISTORY_EVENT_FALLBACK_TITLES[type](companyName),
        summary: `Recorded in executive history — ${HISTORY_EVENT_LABELS[type]} contributing to organizational evolution.`,
        occurredAt: base.toISOString(),
        year: base.getFullYear(),
        department: deptForType(type),
        organizationId,
        sourceModule: 'executive-timeline-history',
        significance: 'notable',
      });
    });
  }

  return events.sort((a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt));
}

const HISTORY_EVENT_LABELS: Record<ExecutiveHistoryEvent['type'], string> = {
  'organization-founded': 'Organization Founded',
  'blueprint-completed': 'Business Discovery Blueprint™',
  'headquarters-activation': 'Headquarters Activation',
  'profession-brain-update': 'Profession Brain™ Update',
  'knowledge-commerce-launch': 'Knowledge Commerce™ Launch',
  'marketing-campaign': 'Marketing Campaign',
  'product-release': 'Product Release',
  hiring: 'Hiring',
  promotion: 'Promotion',
  'major-customer': 'Major Customer',
  'revenue-milestone': 'Revenue Milestone',
  'executive-decision': 'Executive Decision',
  'innovation-lab': 'Innovation Lab Project',
  award: 'Award',
  'brand-update': 'Brand Update',
  partnership: 'Partnership',
  'automation-milestone': 'Automation Milestone',
  'knowledge-growth': 'Knowledge Growth',
  'health-improvement': 'Organization Health Improvement',
  'legacy-preserved': 'Legacy Preserved',
  'consciousness-milestone': 'Organizational Consciousness Milestone',
  'predictive-insight': 'Predictive Insight Recorded',
};

const HISTORY_EVENT_FALLBACK_TITLES: Record<
  ExecutiveHistoryEvent['type'],
  (company: string) => string
> = {
  'organization-founded': (c) => `${c} Founded`,
  'blueprint-completed': () => 'Blueprint Discovery Milestone',
  'headquarters-activation': () => 'Headquarters Milestone',
  'profession-brain-update': () => 'Brain Knowledge Expansion',
  'knowledge-commerce-launch': () => 'Knowledge Product Launch',
  'marketing-campaign': (c) => `${c} Campaign Launch`,
  'product-release': (c) => `${c} Product Release`,
  hiring: () => 'Key Hire',
  promotion: () => 'Leadership Promotion',
  'major-customer': () => 'Major Customer Won',
  'revenue-milestone': () => 'Revenue Milestone Reached',
  'executive-decision': () => 'Executive Decision Recorded',
  'innovation-lab': () => 'Innovation Lab Project',
  award: (c) => `${c} Industry Recognition`,
  'brand-update': () => 'Brand Evolution',
  partnership: () => 'Strategic Partnership',
  'automation-milestone': () => 'Automation Milestone',
  'knowledge-growth': () => 'Knowledge Compounding',
  'health-improvement': () => 'Health Index Improvement',
  'legacy-preserved': () => 'Legacy Moment Preserved',
  'consciousness-milestone': () => 'Consciousness Unified',
  'predictive-insight': () => 'Predictive Forecast Recorded',
};

export function filterExecutiveHistoryEvents(
  events: ExecutiveHistoryEvent[],
  filters: {
    department?: string;
    projectId?: string;
    organizationId?: string;
    yearFrom?: number | null;
    yearTo?: number | null;
    eventType?: string;
  }
): ExecutiveHistoryEvent[] {
  return events.filter((e) => {
    if (filters.department && filters.department !== 'all' && e.department !== filters.department) {
      return false;
    }
    if (filters.projectId && filters.projectId !== 'all' && e.projectId !== filters.projectId) {
      return false;
    }
    if (
      filters.organizationId &&
      filters.organizationId !== 'all' &&
      e.organizationId !== filters.organizationId
    ) {
      return false;
    }
    if (filters.yearFrom != null && e.year < filters.yearFrom) return false;
    if (filters.yearTo != null && e.year > filters.yearTo) return false;
    if (filters.eventType && filters.eventType !== 'all' && e.type !== filters.eventType) {
      return false;
    }
    return true;
  });
}

export function getMilestoneEvents(events: ExecutiveHistoryEvent[]): ExecutiveHistoryEvent[] {
  return events.filter((e) => e.significance === 'foundational' || e.significance === 'major');
}
