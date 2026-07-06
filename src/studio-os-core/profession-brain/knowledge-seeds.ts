import { getOrganizationDiscoveryBlueprint, parseServiceList } from '../business-discovery-blueprint';
import { getOrganizationInaugurationProfile } from '../organization-inauguration/store';
import {
  getBrainDefinition,
  resolveBrainForServiceName,
  resolveBrainsForIndustry,
} from './brain-catalog';
import { buildJudgmentPatternsFromBrain } from './decision-intelligence';
import type {
  BrainKnowledgeEntry,
  OrganizationProfessionBrain,
  OrganizationProfessionBrainProfile,
} from './types';

function answer(blueprint: NonNullable<ReturnType<typeof getOrganizationDiscoveryBlueprint>>, promptId: string): string {
  return blueprint.responses.find((r) => r.promptId === promptId)?.answer.trim() ?? '';
}

function entry(
  brainId: string,
  kind: BrainKnowledgeEntry['kind'],
  title: string,
  what: string,
  why: string,
  source: BrainKnowledgeEntry['source']
): BrainKnowledgeEntry {
  return {
    id: `${brainId}-${kind}-${title}`.replace(/\s+/g, '-').toLowerCase().slice(0, 48),
    brainId,
    kind,
    title,
    what,
    why,
    source,
    updatedAt: new Date().toISOString(),
    version: 1,
  };
}

export function seedBrainFromBlueprint(
  organizationId: string,
  industryId: string,
  companyName: string
): OrganizationProfessionBrain[] {
  const blueprint = getOrganizationDiscoveryBlueprint(organizationId);
  const inauguration = getOrganizationInaugurationProfile(organizationId);
  const brains: OrganizationProfessionBrain[] = [];
  const now = new Date().toISOString();

  const industryBrains = resolveBrainsForIndustry(industryId);
  const serviceNames = blueprint ? parseServiceList(answer(blueprint, 'identity-core-services')) : [];

  const brainDefs = new Map<string, ReturnType<typeof getBrainDefinition>>();

  for (const def of industryBrains.slice(0, 3)) {
    brainDefs.set(def!.id, def);
  }
  for (const svc of serviceNames) {
    const matched = resolveBrainForServiceName(svc);
    if (matched) brainDefs.set(matched.id, matched);
  }
  if (brainDefs.size === 0) {
    const marketing = getBrainDefinition('marketing');
    if (marketing) brainDefs.set(marketing.id, marketing);
  }

  for (const [defId, def] of brainDefs) {
    if (!def) continue;
    const knowledgeEntries: BrainKnowledgeEntry[] = [];

    if (blueprint) {
      knowledgeEntries.push(
        entry(
          defId,
          'philosophy',
          'Organizational mission',
          answer(blueprint, 'identity-mission') || companyName,
          answer(blueprint, 'identity-uvp') || 'This is why we exist — preserved from Business Discovery Blueprint™.',
          'blueprint'
        ),
        entry(
          defId,
          'judgment',
          'Decision intelligence',
          answer(blueprint, 'decision-how'),
          answer(blueprint, 'decision-unwritten') ||
            'When judgment is required, I reference how the founder decides — not generic policy.',
          'blueprint'
        ),
        entry(
          defId,
          'lesson',
          'Institutional wisdom',
          answer(blueprint, 'wisdom-years'),
          answer(blueprint, 'wisdom-stories') || 'Stories explain why we operate the way we do.',
          'blueprint'
        )
      );

      for (const session of blueprint.serviceSessions.filter((s) => s.status === 'complete')) {
        const matched = resolveBrainForServiceName(session.serviceName);
        if (matched?.id !== defId) continue;
        const workflow = session.responses.find((r) => r.promptId === 'service-workflow')?.answer;
        const mistakes = session.responses.find((r) => r.promptId === 'service-mistakes')?.answer;
        const completion = session.responses.find((r) => r.promptId === 'service-completion')?.answer;
        if (workflow) {
          knowledgeEntries.push(
            entry(defId, 'best-practice', `${session.serviceName} workflow`, workflow, 'Documented step-by-step from founder discovery.', 'service-discovery')
          );
        }
        if (mistakes) {
          knowledgeEntries.push(
            entry(
              defId,
              'mistake',
              `Common mistakes · ${session.serviceName}`,
              mistakes,
              'I reject shortcuts that repeat these mistakes because they erode trust and compliance.',
              'service-discovery'
            )
          );
        }
        if (completion) {
          knowledgeEntries.push(
            entry(defId, 'business-rule', `Completion criteria · ${session.serviceName}`, completion, 'We know work is truly complete when these standards are met.', 'service-discovery')
          );
        }
      }
    }

    if (inauguration) {
      knowledgeEntries.push(
        entry(
          defId,
          'policy',
          'Organization Charter',
          inauguration.charter.mission,
          `Founded ${inauguration.charter.dateEstablished} · ${inauguration.charter.growthObjectives}`,
          'inauguration'
        )
      );
    }

    const maturityPct = Math.min(95, 20 + knowledgeEntries.length * 8);

    brains.push({
      id: defId,
      definitionId: defId,
      label: def.label,
      maturityPct,
      knowledgeEntries,
      judgmentPatterns: [],
      conciergeId: def.conciergeId,
      lastEvolvedAt: now,
    });
  }

  return brains;
}

export function buildInitialProfile(
  organizationId: string,
  industryId: string,
  companyName: string
): OrganizationProfessionBrainProfile {
  const now = new Date().toISOString();
  const brains = seedBrainFromBlueprint(organizationId, industryId, companyName);

  for (const brain of brains) {
    brain.judgmentPatterns = buildJudgmentPatternsFromBrain(brain);
  }

  const overallMaturityPct =
    brains.length === 0 ? 0 : Math.round(brains.reduce((s, b) => s + b.maturityPct, 0) / brains.length);

  const profile: OrganizationProfessionBrainProfile = {
    organizationId,
    companyName,
    industryId,
    initializedAt: now,
    updatedAt: now,
    overallMaturityPct,
    brains,
    memoryGraph: { nodes: [], edges: [] },
    humanKnowledge: [],
    academyModules: [],
    publicSurfaces: [],
    ownership: {
      versionLabel: 'v1.0.0-founding',
      archived: false,
      protected: true,
    },
    livingSignals: [],
    legacyNote:
      'Profession Brain preserves knowledge across generations — future owners, employees, and leadership inherit institutional memory.',
  };

  return profile;
}
