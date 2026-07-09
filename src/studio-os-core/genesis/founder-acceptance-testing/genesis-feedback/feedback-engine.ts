import type { FatGenesisFeedbackPacket, FatGenesisLearning } from '../types';
import { getValidationRecord, listLaunchStackValidationRecords } from '../validation/registry';

const FEEDBACK_SEED: Record<
  string,
  Omit<FatGenesisFeedbackPacket, 'packetId' | 'systemId'>
> = {
  'executive-headquarters': {
    assumptionsChanged: [
      'Spatial room navigation beats flat module lists for founder daily use.',
      'Orb dock must stay visible from every HQ room.',
    ],
    genesisUpdates: [
      'Document room-class taxonomy in Executive Headquarters article.',
      'Add projection boundary notes for company context.',
    ],
    promote: false,
    revise: true,
    block: false,
    learningSummary:
      'Executive HQ architecture is validated; founder acceptance needs repeat operating sessions before graduation.',
  },
  orb: {
    assumptionsChanged: [
      'Executive Workspace panel is the right first surface — not a separate app.',
      'Recommendations must cite source systems explicitly.',
    ],
    genesisUpdates: [
      'Expand Orb memory tier documentation.',
      'Wire attention engine to Founder Cognitive Load when available.',
    ],
    promote: false,
    revise: true,
    block: false,
    learningSummary:
      'Orb implementation passes; founder habit formation and withdrawal proof remain in progress.',
  },
  'identity-engine': {
    assumptionsChanged: ['Identity graph must precede marketplace and Orb permissions.'],
    genesisUpdates: ['Mark identity-engine as Launch Stack dependency gate in Build Order.'],
    promote: true,
    revise: false,
    block: false,
    learningSummary: 'Identity Engine implementation verified — company validation pending.',
  },
  'build-order': {
    assumptionsChanged: ['Topological build order must sync with validation registry.'],
    genesisUpdates: ['Link Build Order status updates to FAT graduation events.'],
    promote: true,
    revise: false,
    block: false,
    learningSummary: 'Build Order is operational — feeds Launch Stack progress projections.',
  },
  'founder-acceptance-testing': {
    assumptionsChanged: [
      'Validation must be continuous, not a one-time checklist.',
      'Every Launch Stack milestone accumulates evidence before platform canon.',
    ],
    genesisUpdates: [
      'Add Genesis §9B.8 Founder Acceptance Testing rule enforcement.',
      'Wire validation pipeline to Build Order graduation.',
    ],
    promote: true,
    revise: false,
    block: false,
    learningSummary:
      'FAT runtime establishes the reusable validation framework for all future milestones.',
  },
};

/** Genesis Feedback Engine™ — learning packets for Genesis updates */
export function buildGenesisFeedbackPacket(systemId: string): FatGenesisFeedbackPacket {
  const record = getValidationRecord(systemId);
  if (record?.genesisFeedback.submittedAt) {
    return record.genesisFeedback;
  }

  const seed = FEEDBACK_SEED[systemId] ?? {
    assumptionsChanged: ['Operating evidence still accumulating.'],
    genesisUpdates: ['Complete founder acceptance sessions before Genesis promotion.'],
    promote: false,
    revise: true,
    block: false,
    learningSummary: 'Genesis feedback pending — founder validation incomplete.',
  };

  return {
    packetId: `genesis-feedback-${systemId}`,
    systemId,
    ...seed,
    submittedAt: record?.gates.some((g) => g.level === 'implementation' && g.status === 'accepted')
      ? record.updatedAt
      : undefined,
  };
}

export function listGenesisLearnings(): FatGenesisLearning[] {
  return listLaunchStackValidationRecords()
    .map((record) => {
      const packet = buildGenesisFeedbackPacket(record.systemId);
      if (!packet.learningSummary) return null;
      return {
        learningId: packet.packetId,
        systemId: record.systemId,
        systemName: record.officialName,
        summary: packet.learningSummary,
        assumptionsChanged: packet.assumptionsChanged,
        genesisUpdates: packet.genesisUpdates,
        recordedAt: packet.submittedAt ?? record.updatedAt,
      };
    })
    .filter((l): l is FatGenesisLearning => l !== null)
    .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
}

export function isGenesisFeedbackComplete(systemId: string): boolean {
  const packet = buildGenesisFeedbackPacket(systemId);
  return Boolean(packet.submittedAt && packet.learningSummary.length > 0);
}
