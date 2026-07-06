import { AUTO_TAGS } from './constants';
import type {
  CapturedStructure,
  DesignAnalysis,
  DesignGenomeScopeId,
  DesignGenomeTag,
  DesignReasoning,
  PromotionLevelId,
} from './types';

type AnalyzeInput = {
  route: string;
  pageLabel: string;
  level: PromotionLevelId;
  scope: DesignGenomeScopeId;
  founderPhrase: string;
  componentPath?: string;
};

export function inferTags(input: Pick<AnalyzeInput, 'route' | 'pageLabel' | 'level' | 'scope'>): DesignGenomeTag[] {
  const tags = new Set<DesignGenomeTag>();
  const hay = `${input.route} ${input.pageLabel} ${input.level} ${input.scope}`.toLowerCase();

  for (const tag of AUTO_TAGS) {
    if (hay.includes(tag.replace(/-/g, ' ')) || hay.includes(tag)) tags.add(tag);
  }

  if (input.level === 'hero') tags.add('hero');
  if (input.level === 'timeline') tags.add('timeline');
  if (input.level === 'graph') tags.add('charts');
  if (input.level === 'card') tags.add('cards');
  if (input.scope === 'admin-dashboard') tags.add('admin');
  if (input.scope === 'customer-website') tags.add('customer-experience');
  if (input.scope === 'studio-os-hq') tags.add('headquarters');
  if (input.scope === 'ndxbook') tags.add('editorial');
  if (hay.includes('dashboard')) tags.add('dashboard');
  if (hay.includes('analytics')) tags.add('analytics');
  if (hay.includes('glass')) tags.add('glass-panels');
  if (hay.includes('executive') || hay.includes('mission')) tags.add('executive-summary');
  if (hay.includes('luxury') || hay.includes('marble')) tags.add('luxury-layout');

  return [...tags];
}

export function analyzePromotedDesign(input: AnalyzeInput): DesignAnalysis {
  const sectionType = input.level.replace(/-/g, ' ').toUpperCase();
  return {
    purpose: `Approved ${sectionType} on ${input.pageLabel} — organizational visual DNA for ${input.scope.replace(/-/g, ' ')}.`,
    pageType: input.scope.replace(/-/g, ' ').toUpperCase(),
    sectionType,
    informationHierarchy: [
      'Primary focal element leads attention',
      'Supporting details recede without competing',
      'Executive summary readable at a glance',
    ],
    componentRelationships: [
      'Parent section anchors child components',
      'Glass panels float above marble calm',
      'Red accent directs action without clutter',
    ],
    visualRhythm: [
      'Large visual · small summary · breathing room',
      'Editorial alternation — not identical card stacks',
      'Optical balance over mathematical grid',
    ],
    interactionStyle: [
      'Soft transitions · glass expansion · layered reveals',
      'Intentional motion — never abrupt or flashy',
    ],
    layoutPhilosophy:
      'Coherence without uniformity — handcrafted composition that feels intentional.',
    luxuryCharacteristics: [
      'Negative space creates calm',
      'Restraint over density',
      'Handwritten grace accents guide attention',
    ],
    organizationalPurpose: `Teaches future ${input.scope} interfaces how to inherit approved taste.`,
  };
}

export function buildDesignReasoning(input: AnalyzeInput): DesignReasoning {
  const avoidReuse = /don't reuse|do not reuse|never reuse/i.test(input.founderPhrase);
  return {
    summary: avoidReuse
      ? `Founder marked ${input.pageLabel} pattern as deprecated — do not reuse.`
      : `Founder approved ${input.pageLabel} ${input.level} — visual DNA captured for inheritance.`,
    approvedBecause: avoidReuse
      ? ['Pattern explicitly rejected by founder']
      : [
          'Excellent visual hierarchy',
          'Luxury breathing room',
          'Strong typography rhythm',
          'Balanced spacing · calm information density',
          'Clear executive summary when applicable',
        ],
    avoidReuse,
  };
}

export function captureStructure(input: AnalyzeInput): CapturedStructure {
  const componentPath =
    input.componentPath ??
    `${input.pageLabel} › ${input.level.replace(/-/g, ' ')} › ${input.route}`;

  return {
    route: input.route,
    pageLabel: input.pageLabel,
    componentPath,
    structureSummary: `Internal capture — structure · relationships · hierarchy recorded without screenshot.`,
    typography: ['Futura PT labels · Covered By Your Grace accents · uppercase CTAs'],
    spacingRhythm: ['Editorial pauses · optical alignment · generous hero breathing room'],
    animationBehavior: ['Glass panel expansion · soft panel transitions · reduced-motion safe'],
    visualHierarchy: ['Hero dominates · secondary recedes · tertiary collapsed by default'],
    interactionPatterns: ['Hover depth · intentional click targets · no abrupt modals'],
    metadata: {
      scope: input.scope,
      level: input.level,
      capturedBy: 'studio-os-automatic-capture',
      founderPhrase: input.founderPhrase.slice(0, 120),
    },
  };
}

export function parseFounderPromotionPhrase(phrase: string): {
  level: PromotionLevelId;
  deprecate: boolean;
} {
  const normalized = phrase.trim();
  for (const rule of [
    { pattern: /don't reuse|do not reuse|never reuse/i, level: 'entire-page' as const, deprecate: true },
    { pattern: /this page is now canon|promote this page|love this page/i, level: 'entire-page' as const, deprecate: false },
    { pattern: /promote this hero|keep this hero|love this hero/i, level: 'hero' as const, deprecate: false },
    { pattern: /keep this card|this card style|promote this card/i, level: 'card' as const, deprecate: false },
    { pattern: /this timeline|promote this timeline|benchmark timeline/i, level: 'timeline' as const, deprecate: false },
    { pattern: /this graph|graph style everywhere|promote this graph/i, level: 'graph' as const, deprecate: false },
    { pattern: /this interaction|love this interaction/i, level: 'interaction-pattern' as const, deprecate: false },
    { pattern: /use this spacing|spacing going forward/i, level: 'spacing-pattern' as const, deprecate: false },
    { pattern: /keep this|promote this|use this/i, level: 'section' as const, deprecate: false },
  ]) {
    if (rule.pattern.test(normalized)) {
      return { level: rule.level, deprecate: rule.deprecate };
    }
  }
  return { level: 'section', deprecate: false };
}

export function inferScopeFromRoute(route: string, orgId: string): DesignGenomeScopeId {
  if (route.startsWith('/admin/studio')) return 'studio-os-hq';
  if (route.startsWith('/admin/')) return 'admin-dashboard';
  if (orgId === 'ndxbook' || route.includes('ndxbook')) return 'ndxbook';
  if (orgId === 'portfolio' || route.includes('vxd')) return 'vxd';
  if (route.startsWith('/account') || route.startsWith('/build-a-wig') || route.startsWith('/home')) {
    return 'customer-website';
  }
  return 'organization';
}
