import type {
  AiCreativeSuggestion,
  CreativeCommandResult,
  CreativeDirectionBranch,
  CreativeDirectionProject,
} from './types';
import { analyzeDirectionChangeImpact } from './impactAnalysis';

function matchCommand(text: string): { intent: string; branchName?: string } {
  const t = text.toLowerCase();
  if (/start over|reset direction/.test(t)) return { intent: 'start-over', branchName: 'Fresh Direction' };
  if (/apple|vision pro/.test(t)) return { intent: 'apple-launch', branchName: 'Apple Launch' };
  if (/luxury|luxurious|editorial/.test(t)) return { intent: 'luxury-editorial', branchName: 'Luxury Editorial' };
  if (/futuristic|future/.test(t)) return { intent: 'futuristic', branchName: 'Futuristic' };
  if (/high energy|social/.test(t)) return { intent: 'high-energy', branchName: 'High Energy Social' };
  if (/minimal/.test(t)) return { intent: 'minimal', branchName: 'Minimal Luxury' };
  if (/fashion/.test(t)) return { intent: 'fashion', branchName: 'Fashion Campaign' };
  if (/change the direction|change direction|new direction/.test(t)) return { intent: 'change-direction' };
  if (/find better inspiration|show luxury references|generate three/.test(t)) return { intent: 'inspiration' };
  if (/less corporate|more editorial/.test(t)) return { intent: 'editorial-shift' };
  if (/isn't luxurious|not luxurious/.test(t)) return { intent: 'luxury-boost' };
  if (/keep only the typography/.test(t)) return { intent: 'keep-typography' };
  if (/copy the pacing/.test(t)) return { intent: 'pacing-only' };
  if (/merge these two/.test(t)) return { intent: 'merge' };
  if (/use this instagram|use this reel|use this packaging/.test(t)) return { intent: 'add-reference' };
  return { intent: 'general' };
}

function buildConcepts(intent: string): string[] {
  switch (intent) {
    case 'apple-launch':
      return [
        'Single hero frame · whisper typography · product-as-philosophy',
        'Slow zoom · material close-ups · no clutter',
        'Voiceover-led · minimal captions · premium silence',
      ];
    case 'luxury-editorial':
      return [
        'Editorial crop · serif accent · restrained palette',
        'Full-bleed photography · thin rules · calm pacing',
        'Founder-as-editor · authoritative facts · no hype',
      ];
    case 'high-energy':
      return [
        '1.5s hook · kinetic type · saturated accent',
        'Pattern interrupt · quick proof · save-worthy CTA',
        'Native reel grammar · loop-friendly end card',
      ];
    default:
      return [
        'Refined ndxbook index voice · calm authority',
        'Instagram-first educational carousel · indigo frame',
        'Credit literacy without panic · save-driven CTA',
      ];
  }
}

export function executeCreativeCommand(
  project: CreativeDirectionProject,
  command: string,
  currentDepartment?: string
): CreativeCommandResult {
  const { intent, branchName } = matchCommand(command);
  const active = project.branches.find((b) => b.id === project.activeBranchId)!;
  const actions: string[] = [];
  let impact = analyzeDirectionChangeImpact(command, currentDepartment);

  const suggestion: AiCreativeSuggestion = {
    id: `ai-${Date.now()}`,
    branchId: active.id,
    createdAt: new Date().toISOString(),
    prompt: command,
    summary: `Studio Orb interpreted: ${intent.replace(/-/g, ' ')}`,
    concepts: buildConcepts(intent),
  };

  if (intent === 'start-over' || branchName) {
    actions.push(`Create parallel branch · ${branchName ?? 'New Direction'}`);
    actions.push('Preserve existing branches for comparison');
    return {
      understood: command,
      actions,
      suggestions: suggestion,
      impact,
    };
  }

  if (intent === 'change-direction' || intent === 'luxury-boost' || intent === 'editorial-shift') {
    actions.push('Update Creative Brief tone and north star');
    actions.push('Flag downstream departments for review');
    impact = analyzeDirectionChangeImpact(command, currentDepartment);
  }

  if (intent === 'inspiration') {
    actions.push('Surface luxury references from Inspiration Library');
    actions.push('Refresh Living Mood Board sections');
  }

  if (intent === 'keep-typography') {
    actions.push('Lock typography direction · release other visual constraints');
    impact.affectedArtifacts = ['Typography', 'Caption styling'];
    impact.affectedDepartments = ['Production', 'Expansion'];
  }

  if (intent === 'pacing-only') {
    actions.push('Apply motion/pacing from reference · preserve visual palette');
  }

  if (intent === 'add-reference') {
    actions.push('Add reference to Inspiration Library · run Studio Intelligence extraction');
    actions.push('Auto-update Living Mood Board');
  }

  if (intent === 'merge') {
    actions.push('Propose merged branch from active timelines');
    impact.options = impact.options.filter((o) => o.id === 'parallel-branch' || o.id === 'update-downstream');
  }

  if (actions.length === 0) {
    actions.push('Studio Orb queued creative interpretation');
    actions.push('Concierge recommendations updated');
  }

  return {
    understood: command,
    actions,
    suggestions: suggestion,
    impact,
  };
}

export function branchPresetFromIntent(intent: string, name: string): Partial<CreativeDirectionBranch> {
  const luxury = /luxury|apple|editorial|minimal|fashion/.test(intent);
  return {
    name,
    vision: luxury
      ? 'Premium editorial education — luxury restraint with ndxbook authority.'
      : 'High-clarity credit education — Instagram-first, calm and factual.',
    northStar: luxury
      ? 'Feel like a luxury brand introducing a philosophy, not a corporate explainer.'
      : 'Help adults rebuild credit without panic — save-worthy, trustworthy, precise.',
    brief: {
      objective: 'Project 001 · Truth Tuesday pilot · credit score after debt payoff',
      audience: 'Adults rebuilding credit after debt payoff',
      tone: luxury ? ['authoritative', 'editorial', 'calm luxury'] : ['factual', 'approachable', 'ndxbook index'],
      constraints: ['Instagram-first', 'Educational only', 'No panic framing'],
      updatedAt: new Date().toISOString(),
    },
  };
}
