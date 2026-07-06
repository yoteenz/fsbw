import { BLUEPRINT_OUTPUT_CATEGORIES } from './constants';
import { getChapterDefinition } from './chapters';
import { computeAllChapterProgress, parseServiceList } from './progress';
import type {
  BlueprintGeneratedOutput,
  DiscoveryChapterId,
  OrganizationDiscoveryBlueprint,
} from './types';

function findAnswer(blueprint: OrganizationDiscoveryBlueprint, promptId: string): string {
  return blueprint.responses.find((r) => r.promptId === promptId)?.answer.trim() ?? '';
}

function buildOutput(
  category: string,
  title: string,
  summary: string,
  sourceChapterIds: DiscoveryChapterId[]
): BlueprintGeneratedOutput {
  return {
    id: `${category}-${title}`.replace(/\s+/g, '-').toLowerCase().slice(0, 64),
    category,
    title,
    summary,
    generatedAt: new Date().toISOString(),
    sourceChapterIds,
  };
}

export function regenerateBlueprintOutputs(
  blueprint: OrganizationDiscoveryBlueprint
): BlueprintGeneratedOutput[] {
  const outputs: BlueprintGeneratedOutput[] = [];
  const company = findAnswer(blueprint, 'identity-company-name') || blueprint.companyName;
  const mission = findAnswer(blueprint, 'identity-mission');
  const vision = findAnswer(blueprint, 'identity-vision');
  const services = findAnswer(blueprint, 'identity-core-services');
  const uvp = findAnswer(blueprint, 'identity-uvp');
  const founderStress = findAnswer(blueprint, 'founder-stress');
  const unwritten = findAnswer(blueprint, 'decision-unwritten');
  const wisdom = findAnswer(blueprint, 'wisdom-years');
  const growthVision = findAnswer(blueprint, 'growth-vision');
  const automation = findAnswer(blueprint, 'growth-automation');
  const customerJourney = findAnswer(blueprint, 'customers-journey');

  if (company || mission) {
    outputs.push(
      buildOutput(
        'Organization Headquarters',
        `${company || 'Organization'} Headquarters Profile`,
        [mission && `Mission: ${mission}`, vision && `Vision: ${vision}`, uvp && `Value: ${uvp}`]
          .filter(Boolean)
          .join(' · ') || 'Identity chapter in progress — Headquarters adapts as discovery continues.',
        ['organization-identity']
      )
    );
  }

  if (mission || founderStress) {
    outputs.push(
      buildOutput(
        'Mission Control',
        'Executive Priority Context',
        founderStress
          ? `Founder focus areas: ${founderStress}. Mission: ${mission || 'pending discovery'}.`
          : `Mission-driven priorities from: ${mission || 'identity chapter'}.`,
        ['organization-identity', 'founder-brain']
      )
    );
  }

  const serviceNames = parseServiceList(services);
  if (serviceNames.length > 0) {
    outputs.push(
      buildOutput(
        'Department Packs',
        'Recommended Department Alignment',
        `Core offerings (${serviceNames.join(', ')}) inform which Headquarters wings to expand first.`,
        ['organization-identity', 'services']
      )
    );
  }

  if (services || blueprint.serviceSessions.length > 0) {
    outputs.push(
      buildOutput(
        'Profession Brain foundation',
        'Service Intelligence Seeds',
        `${blueprint.serviceSessions.filter((s) => s.status === 'complete').length} service(s) deeply documented. Each completed session trains Profession Brains.`,
        ['services']
      )
    );
  }

  if (customerJourney || findAnswer(blueprint, 'customers-faq')) {
    outputs.push(
      buildOutput(
        'Digital Concierge recommendations',
        'Customer Experience Concierge Brief',
        customerJourney || 'Customer chapter in progress — concierges will adapt as journey is captured.',
        ['customers']
      )
    );
  }

  outputs.push(
    buildOutput(
      'Command Dock context',
      'Discovery-Aware Command Context',
      `Blueprint ${blueprint.overallProgressPct}% complete · ${getChapterDefinition(blueprint.recommendedNextChapterId).title} recommended next.`,
      ['organization-identity']
    )
  );

  if (wisdom || unwritten) {
    outputs.push(
      buildOutput(
        'Organization Knowledge Base',
        'Institutional Memory Seeds',
        [wisdom && `Wisdom: ${wisdom.slice(0, 120)}…`, unwritten && `Unwritten rules captured.`]
          .filter(Boolean)
          .join(' '),
        ['knowledge-wisdom', 'decision-intelligence']
      )
    );
  }

  if (blueprint.serviceSessions.some((s) => s.status === 'complete')) {
    outputs.push(
      buildOutput(
        'Standard Operating Procedures',
        'Service Workflow SOP Drafts',
        'Completed service discovery sessions generate SOP foundations for human employees and AI.',
        ['services']
      )
    );
  }

  if (findAnswer(blueprint, 'wisdom-new-employee')) {
    outputs.push(
      buildOutput(
        'Employee Handbook foundation',
        'New Hire Orientation Chapter',
        findAnswer(blueprint, 'wisdom-new-employee'),
        ['knowledge-wisdom', 'people']
      )
    );
  }

  if (automation) {
    outputs.push(
      buildOutput(
        'Automation opportunities',
        'Human vs Automation Boundary Map',
        automation,
        ['growth', 'decision-intelligence']
      )
    );
  }

  outputs.push(
    buildOutput(
      'Organization Intelligence',
      'Discovery Confidence Layer',
      `Overall blueprint progress ${blueprint.overallProgressPct}%. Chapters complete: ${computeAllChapterProgress(blueprint).filter((c) => c.status === 'complete').length} of 9.`,
      ['organization-identity', 'founder-brain', 'decision-intelligence']
    )
  );

  if (findAnswer(blueprint, 'identity-goals')) {
    outputs.push(
      buildOutput(
        'Recommended KPIs',
        'Goal-Aligned Metrics',
        findAnswer(blueprint, 'identity-goals'),
        ['organization-identity', 'growth']
      )
    );
  }

  if (blueprint.serviceSessions.length > 0) {
    outputs.push(
      buildOutput(
        'Workflow Maps',
        'Service Workflow Visualizations',
        'Each documented service produces workflow maps for operations and training.',
        ['services']
      )
    );
  }

  const complianceAnswer = blueprint.serviceSessions
    .flatMap((s) => s.responses)
    .find((r) => r.promptId === 'service-compliance')?.answer;
  if (complianceAnswer) {
    outputs.push(
      buildOutput(
        'Compliance tracking',
        'Regulatory Requirements Registry',
        complianceAnswer,
        ['services']
      )
    );
  }

  if (wisdom) {
    outputs.push(
      buildOutput(
        'Training Academy foundation',
        'Studio Institute Curriculum Seeds',
        wisdom,
        ['knowledge-wisdom']
      )
    );
  }

  outputs.push(
    buildOutput(
      'Design recommendations',
      'Brand & Experience Alignment',
      uvp ? `Experience design should reinforce: ${uvp}` : 'Complete Organization Identity for design recommendations.',
      ['organization-identity']
    )
  );

  if (growthVision || findAnswer(blueprint, 'growth-expansion')) {
    outputs.push(
      buildOutput(
        'Future Expansion recommendations',
        'Headquarters Growth Roadmap',
        [growthVision, findAnswer(blueprint, 'growth-expansion')].filter(Boolean).join(' · '),
        ['growth']
      )
    );
  }

  // Ensure all categories represented at least as placeholders when progress > 0
  if (blueprint.overallProgressPct > 0) {
    for (const category of BLUEPRINT_OUTPUT_CATEGORIES) {
      if (!outputs.some((o) => o.category === category)) {
        outputs.push(
          buildOutput(
            category,
            `${category} — Pending Discovery`,
            'Continue the Business Discovery Blueprint to unlock this output.',
            [blueprint.recommendedNextChapterId]
          )
        );
      }
    }
  }

  return outputs;
}
