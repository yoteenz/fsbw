import type { CreateProductionTaskInput, ProductionBoardTask, ProductionPackage } from './types';
import {
  buildProductionCompletionChecklist,
  formatCompletionSummary,
} from '../production-completion-system';

const defaultArchitectureOutput =
  'Waiting for GPT-5.5 architecture output. Paste or sync the completed architecture response to unlock implementation handoff generation.';

function splitRequirements(text: string): string[] {
  return text
    .split(/\n|\. |; /)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export function generateArchitecturePrompt(input: CreateProductionTaskInput): string {
  const dependencyLine = input.dependencies?.length ? input.dependencies.join(', ') : 'None declared';
  return [
    'GPT-5.5 ARCHITECTURE REQUEST — Studio Production Orchestrator™',
    '',
    `Feature: ${input.featureName}`,
    `Founder Intent™: ${input.founderIntent}`,
    `Dependencies: ${dependencyLine}`,
    '',
    'Return architecture with:',
    '1. Experience goal and Studio World fit.',
    '2. Required React/TypeScript modules, routing, state, and data contracts.',
    '3. Supabase/API requirements if needed.',
    '4. Asset requirements for OpenArt/FAL.',
    '5. Motion requirements for Kling.',
    '6. Testing checklist.',
    '7. Knowledge Core references.',
    '8. ADR requirements and decision record title.',
    '9. Conflicts, missing inputs, or blockers.',
    '',
    '10. Production Completion Checklist™ scope (routing, database, API, constitutional, visual-only, assets, motion).',
  ].join('\n');
}

export function generateComposerPrompt(task: Pick<ProductionBoardTask, 'featureName' | 'founderIntent' | 'dependencies'>, architectureOutput: string): string {
  const extracted = splitRequirements(architectureOutput);
  return [
    'COMPOSER 2.5 IMPLEMENTATION HANDOFF — Studio Production Orchestrator™',
    '',
    `Feature: ${task.featureName}`,
    `Founder Intent™: ${task.founderIntent}`,
    `Dependencies: ${task.dependencies.length ? task.dependencies.join(', ') : 'None declared'}`,
    '',
    'Architecture attached:',
    architectureOutput,
    '',
    'Implementation requirements extracted:',
    ...(extracted.length ? extracted.map((line, index) => `${index + 1}. ${line}`) : ['1. Architecture output did not include extractable requirements.']),
    '',
    'Composer must:',
    '- Implement in React/TypeScript using existing Studio OS patterns.',
    '- Respect routing, state, and design contracts from the architecture.',
    '- Add focused tests or build verification appropriate to the change.',
    '- Update Knowledge Core and ADR notes listed in the Production Package.',
    '- Stop and mark blocked if architecture is incomplete or conflicting.',
    '- Complete every required Production Completion Checklist™ checkpoint before marking done.',
  ].join('\n');
}

function buildCompletionForPackage(
  input: CreateProductionTaskInput,
  architectureOutput: string,
  assignedModel = 'composer-2.5',
  existingPassed?: Record<string, boolean>
) {
  return buildProductionCompletionChecklist(
    {
      featureName: input.featureName,
      founderIntent: input.founderIntent,
      architectureOutput,
      requiresAssets: input.requiresAssets,
      requiresMotion: input.requiresMotion,
      scopeOverrides: input.scopeOverrides,
      owner: input.owner,
      assignedModel,
    },
    { existingPassed }
  );
}

export function generateProductionPackage(input: CreateProductionTaskInput, architectureOutput = ''): ProductionPackage {
  const safeArchitectureOutput = architectureOutput || defaultArchitectureOutput;
  const architecturePrompt = generateArchitecturePrompt(input);
  const composerPrompt = generateComposerPrompt(
    {
      featureName: input.featureName,
      founderIntent: input.founderIntent,
      dependencies: input.dependencies ?? [],
    },
    safeArchitectureOutput
  );
  const completion = buildCompletionForPackage(input, safeArchitectureOutput);

  return {
    architecturePrompt,
    architectureOutput: safeArchitectureOutput,
    composerPrompt,
    assetPrompts: input.requiresAssets
      ? [
          `OpenArt/FAL asset brief for ${input.featureName}: generate environment assets, 3D icons, room materials, and visual-system elements that support this founder intent: ${input.founderIntent}`,
        ]
      : [],
    motionPrompts: input.requiresMotion
      ? [
          `Kling motion brief for ${input.featureName}: produce transitions, cinematic camera movement, and interaction motion that makes the implementation feel like Studio World production infrastructure.`,
        ]
      : [],
    testingChecklist: [
      'Verify architecture output is saved before implementation begins.',
      'Verify dependencies are resolved or explicitly blocked.',
      'Verify Composer prompt includes architecture, Knowledge Core references, ADR requirements, and integration checklist.',
      'Complete required Production Completion Checklist™ checkpoints for current Quality Gate™.',
      'Run build/typecheck after implementation.',
      'Founder reviews final package before approval unless auto-approval is allowed.',
    ],
    knowledgeCoreUpdates: [
      'Record the production workflow intent, chosen architecture, implementation outcome, and review decision.',
      'Link related Studio OS modules: Model Orchestrator™, Workflow Engine™, Prompt Registry™, Knowledge Registry™, Decision Audit™.',
      'Update ARTICLE-K24 Production Completion System™ checkpoint status when feature ships.',
    ],
    adrUpdates: [
      `ADR: ${input.featureName} — architecture-to-implementation handoff decision.`,
      'Capture model role assignments, approval gate, dependencies, and rejected alternatives.',
    ],
    integrationChecklist: [
      'Founder Intent™ captured once.',
      'Architecture Prompt Queue™ populated.',
      'GPT Architecture Output™ saved.',
      'Architecture Completion Detection™ passed.',
      'Production Completion Checklist™ generated for feature scope.',
      'Implementation Handoff Package™ generated.',
      'Composer Implementation Queue™ gated by approval and dependencies.',
      'Asset Generation Queue™ populated when visual assets are needed.',
      'Motion Queue™ populated when motion is needed.',
      'Review Queue™ prepared.',
      'Knowledge Core / ADR Update™ prepared.',
    ],
    completionChecklistSummary: formatCompletionSummary(completion),
  };
}

export function buildTaskCompletionChecklist(
  input: CreateProductionTaskInput,
  architectureOutput = '',
  assignedModel = 'composer-2.5',
  existingPassed?: Record<string, boolean>
) {
  return buildCompletionForPackage(input, architectureOutput, assignedModel, existingPassed);
}

export function isArchitectureOutputComplete(output: string): boolean {
  const normalized = output.toLowerCase();
  if (normalized.length < 180) return false;
  const hasImplementation = normalized.includes('implementation') || normalized.includes('react') || normalized.includes('typescript');
  const hasTesting = normalized.includes('test') || normalized.includes('verification') || normalized.includes('checklist');
  const hasDecision = normalized.includes('adr') || normalized.includes('decision') || normalized.includes('knowledge');
  const hasNoConflict = !normalized.includes('conflict: unresolved') && !normalized.includes('blocked: unresolved');
  return hasImplementation && hasTesting && hasDecision && hasNoConflict;
}
