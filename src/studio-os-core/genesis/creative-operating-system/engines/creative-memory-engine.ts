import { getNarrativeBlueprint } from '../../narrative-intelligence/engines/narrative-blueprint-generator';
import { getProductionGenomeForBrand } from '../../narrative-intelligence/engines/production-genome-registry';
import type { XpsProductionPackage } from '../../studio-production-system/types';
import { mutateCreativeOperatingSystemStore, readCreativeOperatingSystemStore } from '../persistence';
import type { XcosBoardMeeting, XcosCreativeMemoryRecord } from '../types';

function memoryId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function appendMemory(record: Omit<XcosCreativeMemoryRecord, 'recordId' | 'createdAt' | 'instituteLinked' | 'searchableText'>): XcosCreativeMemoryRecord {
  const full: XcosCreativeMemoryRecord = {
    ...record,
    recordId: memoryId('mem'),
    instituteLinked: true,
    searchableText: [record.summary, record.reasoning, ...record.tags, ...record.evidenceRefs].join(' '),
    createdAt: new Date().toISOString(),
  };

  mutateCreativeOperatingSystemStore((store) => ({
    ...store,
    memoryRecords: [full, ...store.memoryRecords].slice(0, 200),
  }));

  return full;
}

/** Creative Memory Engine™ — institutional searchable memory */
export function archiveBoardMeetingToMemory(meeting: XcosBoardMeeting): XcosCreativeMemoryRecord {
  return appendMemory({
    memoryType: 'board-meeting',
    brandId: meeting.brandId,
    packageId: meeting.packageId,
    blueprintId: meeting.blueprintId,
    meetingId: meeting.meetingId,
    summary: `Board Meeting: ${meeting.topic} — ${meeting.founderDecision}`,
    reasoning: meeting.unifiedRecommendation,
    evidenceRefs: meeting.evidence,
    tags: ['board-meeting', meeting.founderDecision, meeting.brandId],
  });
}

export function recordProductionToMemory(pkg: XpsProductionPackage): XcosCreativeMemoryRecord[] {
  const blueprint = getNarrativeBlueprint(pkg.blueprintId);
  const genome = getProductionGenomeForBrand(pkg.brandId);
  const records: XcosCreativeMemoryRecord[] = [];

  if (blueprint) {
    records.push(
      appendMemory({
        memoryType: 'narrative-discovery',
        brandId: pkg.brandId,
        packageId: pkg.packageId,
        blueprintId: pkg.blueprintId,
        summary: `Narrative Blueprint™: ${blueprint.topic}`,
        reasoning: `Type ${blueprint.narrativeType} · Status ${blueprint.status} · Emotion ${blueprint.desiredEmotion ?? pkg.desiredEmotion}`,
        evidenceRefs: [blueprint.blueprintId],
        tags: ['narrative-blueprint', blueprint.narrativeType, blueprint.status],
      })
    );
  }

  if (genome) {
    records.push(
      appendMemory({
        memoryType: 'production-discovery',
        brandId: pkg.brandId,
        packageId: pkg.packageId,
        blueprintId: pkg.blueprintId,
        summary: `Production Genome™: ${genome.genomeId}`,
        reasoning: genome.themeMusic ?? 'Production genome linked to package',
        evidenceRefs: [genome.genomeId],
        tags: ['production-genome', pkg.brandId],
      })
    );
  }

  pkg.approvals.forEach((approval) => {
    if (approval.status === 'approved' || approval.status === 'rejected') {
      records.push(
        appendMemory({
          memoryType: approval.status === 'approved' ? 'approval' : 'rejection',
          brandId: pkg.brandId,
          packageId: pkg.packageId,
          blueprintId: pkg.blueprintId,
          summary: `${approval.label}: ${approval.status}`,
          reasoning: approval.note ?? 'Gate decision recorded',
          evidenceRefs: [approval.gateId],
          tags: ['approval-gate', approval.gateId, approval.status],
        })
      );
    }
  });

  return records;
}

export function searchCreativeMemory(query: string, brandId?: string): XcosCreativeMemoryRecord[] {
  const q = query.toLowerCase();
  const records = readCreativeOperatingSystemStore().memoryRecords;
  return records.filter((r) => {
    if (brandId && r.brandId !== brandId) return false;
    return r.searchableText.toLowerCase().includes(q) || r.summary.toLowerCase().includes(q);
  });
}

export function listCreativeMemory(brandId?: string): XcosCreativeMemoryRecord[] {
  const records = readCreativeOperatingSystemStore().memoryRecords;
  return brandId ? records.filter((r) => r.brandId === brandId) : records;
}

export function recordLessonLearned(
  brandId: XcosCreativeMemoryRecord['brandId'],
  summary: string,
  reasoning: string,
  packageId?: string
): XcosCreativeMemoryRecord {
  return appendMemory({
    memoryType: 'lesson-learned',
    brandId,
    packageId,
    summary,
    reasoning,
    evidenceRefs: [],
    tags: ['lesson-learned', brandId],
  });
}

export function recordPerformanceMemory(
  pkg: XpsProductionPackage,
  notes: string[]
): XcosCreativeMemoryRecord {
  return appendMemory({
    memoryType: 'performance',
    brandId: pkg.brandId,
    packageId: pkg.packageId,
    blueprintId: pkg.blueprintId,
    summary: `Performance review: ${pkg.topic}`,
    reasoning: notes.join(' · ') || 'Performance snapshot recorded',
    evidenceRefs: [pkg.packageId],
    tags: ['performance', pkg.platform],
  });
}
