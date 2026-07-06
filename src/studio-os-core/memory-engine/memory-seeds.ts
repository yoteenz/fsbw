import { getOrganizationDiscoveryBlueprint } from '../business-discovery-blueprint/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import type { MemoryRecord, MemoryRecordType } from './types';

function answer(promptId: string, blueprint: ReturnType<typeof getOrganizationDiscoveryBlueprint>): string {
  return blueprint?.responses.find((r) => r.promptId === promptId)?.answer.trim() ?? '';
}

function record(
  id: string,
  type: MemoryRecordType,
  title: string,
  summary: string,
  outcome: MemoryRecord['outcome'],
  occurredAt: string,
  tags: string[],
  extra?: Partial<MemoryRecord>
): MemoryRecord {
  return { id, type, title, summary, outcome, occurredAt, tags, ...extra };
}

export function seedMemoryRecordsFromSources(
  organizationId: string,
  companyName: string
): MemoryRecord[] {
  const records: MemoryRecord[] = [];
  const blueprint = getOrganizationDiscoveryBlueprint(organizationId);
  const brainProfile = getOrganizationProfessionBrainProfile(organizationId);
  const now = new Date().toISOString();
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();
  const quarterAgo = new Date(Date.now() - 90 * 86400000).toISOString();

  if (answer('wisdom-wrong', blueprint)) {
    records.push(
      record(
        'mem-wisdom-wrong',
        'failure',
        'Documented past mistake',
        answer('wisdom-wrong', blueprint),
        'failure',
        quarterAgo,
        ['wisdom', 'blueprint'],
        { sourceModule: 'business-discovery-blueprint', wouldRepeat: false }
      )
    );
  }

  if (answer('wisdom-years', blueprint)) {
    records.push(
      record(
        'mem-wisdom-years',
        'lesson',
        'Years of experience captured',
        answer('wisdom-years', blueprint),
        'success',
        quarterAgo,
        ['wisdom', 'experience'],
        { sourceModule: 'business-discovery-blueprint', wouldRepeat: true }
      )
    );
  }

  if (answer('decision-mistakes', blueprint)) {
    records.push(
      record(
        'mem-decision-mistakes',
        'decision',
        'How we correct course',
        answer('decision-mistakes', blueprint),
        'partial',
        monthAgo,
        ['decision', 'correction'],
        { sourceModule: 'business-discovery-blueprint' }
      )
    );
  }

  if (brainProfile) {
    for (const brain of brainProfile.brains) {
      for (const pattern of brain.judgmentPatterns.slice(0, 2)) {
        records.push(
          record(
            `mem-judgment-${pattern.id}`,
            'professional-insight',
            `${brain.label}: ${pattern.situation}`,
            `${pattern.reasoning} — ${pattern.professionalResponse}`,
            'success',
            brainProfile.updatedAt,
            [brain.label.toLowerCase(), 'judgment'],
            { brainId: brain.id, sourceModule: 'profession-brain', wouldRepeat: true }
          )
        );
      }

      for (const signal of brainProfile.livingSignals.slice(0, 2)) {
        records.push(
          record(
            `mem-living-${signal.id}`,
            'workflow-improvement',
            `Living update: ${signal.phrase.slice(0, 60)}`,
            signal.phrase,
            signal.resolved ? 'success' : 'ongoing',
            signal.detectedAt,
            [brain.label.toLowerCase(), 'living-knowledge'],
            { brainId: brain.id, sourceModule: 'profession-brain' }
          )
        );
      }
    }

    for (const hk of brainProfile.humanKnowledge.slice(0, 3)) {
      records.push(
        record(
          `mem-hk-${hk.id}`,
          'lesson',
          hk.title,
          hk.content.slice(0, 160),
          'success',
          brainProfile.updatedAt,
          ['training', hk.type],
          { sourceModule: 'profession-brain', wouldRepeat: true }
        )
      );
    }
  }

  records.push(
    record(
      'mem-demo-campaign-q2',
      'campaign',
      `${companyName} Q2 awareness campaign`,
      'Multi-channel campaign with concierge-assisted scheduling. Measured engagement lift and documented channel mix.',
      'success',
      monthAgo,
      ['campaign', 'marketing'],
      {
        sourceModule: 'campaign-engine',
        wouldRepeat: true,
        metrics: [
          { label: 'Engagement lift', value: '+18%' },
          { label: 'Channels', value: '3' },
        ],
      }
    ),
    record(
      'mem-demo-experiment-pricing',
      'experiment',
      'Pricing page A/B test',
      'Tested premium positioning vs value-first headline. Value-first won on conversion; premium won on average order value.',
      'partial',
      monthAgo,
      ['experiment', 'pricing'],
      { sourceModule: 'simulation-engine', wouldRepeat: true }
    ),
    record(
      'mem-demo-customer-onboard',
      'customer-history',
      'Enterprise onboarding — Acme Corp pattern',
      'Extended discovery session before automation. Reduced rework when Profession Brain scope was reviewed first.',
      'success',
      quarterAgo,
      ['customer', 'onboarding'],
      { wouldRepeat: true }
    ),
    record(
      'mem-demo-meeting-strategy',
      'meeting-outcome',
      'Quarterly strategy review',
      'Aligned expansion priorities with monetization architecture. Deferred two packs until Blueprint identity chapter complete.',
      'success',
      quarterAgo,
      ['meeting', 'strategy'],
      { sourceModule: 'executive-timeline' }
    ),
    record(
      'mem-demo-metric-retention',
      'historical-metric',
      'Customer retention baseline',
      'Rolling 90-day retention tracked against Genome service promise. Used for Memory Engine compounding recommendations.',
      'ongoing',
      now,
      ['metrics', 'retention'],
      { metrics: [{ label: '90-day retention', value: '92%' }] }
    )
  );

  return records;
}
