import type { ConstructionPlan } from '../../blueprint-author/construction-plan-schema';
import type { ArchitecturalDnaProfile } from '../../architectural-dna/schemas/dna-profile';
import { STUDIO_WORLD_STYLE_BIBLE } from '../style-bible/registry';
import { UNIVERSAL_COMMAND_DOCK } from '../command-dock/command-dock-system';
import { UNIVERSAL_WORKBENCH } from '../workbench/workbench-system';
import { STUDIO_WORLD_DESIGN_TOKENS } from '../design-tokens/export';

export const WORLD_COHESION_VALIDATOR_VERSION = 'world-cohesion-validator.v1' as const;

export type WorldCohesionViolation = {
  code: 'WORLD_STYLE_VIOLATION';
  field: string;
  message: string;
};

export type WorldCohesionResult =
  | { ok: true; bibleVersion: string; bibleRevision: number }
  | { ok: false; code: 'WORLD_STYLE_VIOLATION'; violations: WorldCohesionViolation[] };

function violation(field: string, message: string): WorldCohesionViolation {
  return { code: 'WORLD_STYLE_VIOLATION', field, message };
}

export function validateWorldCohesion(input: {
  plan: ConstructionPlan;
  dna?: ArchitecturalDnaProfile;
  effectivePrompt?: string;
}): WorldCohesionResult {
  const violations: WorldCohesionViolation[] = [];
  const bible = STUDIO_WORLD_STYLE_BIBLE;

  const hasCommandDock = input.plan.heroAssets.some(
    (a) => a.assetClass === 'command-dock-shell' || a.socketId === 'CommandDockSocket'
  ) || input.plan.furnitureSet.assets.some((a) => a.assetClass === 'command-dock-shell');
  const hasWorkbench = input.plan.furnitureSet.assets.some(
    (a) => a.assetClass === 'workbench-shell' || a.socketId === 'WorkbenchSocket'
  );

  if (!hasCommandDock) {
    violations.push(violation('commandDock', 'Department plan missing Universal Command Dock™'));
  }
  if (!hasWorkbench) {
    violations.push(violation('workbench', 'Department plan missing Universal Workbench™'));
  }

  if (input.effectivePrompt) {
    const instructionSections = input.effectivePrompt
      .split(/\n\n/)
      .filter((s) =>
        s.startsWith('STUDIO WORLD STYLE BIBLE') ||
        s.startsWith('UNIVERSAL COMMAND DOCK') ||
        s.startsWith('UNIVERSAL WORKBENCH') ||
        s.startsWith('DESIGN TOKENS') ||
        s.startsWith('TYPOGRAPHY:') ||
        s.startsWith('Forbidden:')
      );
    const generativeSections = input.effectivePrompt
      .split(/\n\n/)
      .filter((s) => !instructionSections.some((i) => s.startsWith(i.split(':')[0] ?? '')))
      .join('\n\n');
    const lower = generativeSections.toLowerCase();
    for (const forbidden of bible.lightingPhilosophy.forbidden) {
      if (lower.includes(forbidden.toLowerCase())) {
        violations.push(violation('lighting', `Prompt references forbidden lighting: ${forbidden}`));
      }
    }
    if (/\b(render|generate|show|display)\s+(readable\s+)?text\b/i.test(generativeSections) ||
        /\b(render|generate)\s+(menu|button)\s+labels?\b/i.test(generativeSections)) {
      violations.push(violation('typography', 'Prompt requests AI-rendered typography — violates Style Bible'));
    }
  }

  if (input.dna) {
    for (const forbidden of bible.materialPhilosophy.forbidden) {
      const matStr = JSON.stringify(input.dna.materials).toLowerCase();
      if (matStr.includes(forbidden.toLowerCase())) {
        violations.push(violation('materials', `DNA contains forbidden material: ${forbidden}`));
      }
    }
  }

  if (!input.plan.uiMountSockets?.sockets?.some((s) => s.socketId === 'COMMAND_DOCK')) {
    violations.push(violation('navigation', 'Plan missing COMMAND_DOCK UI mount socket'));
  }
  if (!input.plan.uiMountSockets?.sockets?.some((s) => s.socketId === 'WORKBENCH')) {
    violations.push(violation('navigation', 'Plan missing WORKBENCH UI mount socket'));
  }

  if (violations.length > 0) {
    return { ok: false, code: 'WORLD_STYLE_VIOLATION', violations };
  }

  return {
    ok: true,
    bibleVersion: bible.authority.bibleVersion,
    bibleRevision: bible.authority.bibleRevision,
  };
}

export function validateStyleBibleIntegrity(): WorldCohesionResult {
  const violations: WorldCohesionViolation[] = [];

  if (!UNIVERSAL_COMMAND_DOCK.rules.includes('no baked AI text')) {
    violations.push(violation('commandDock', 'Command Dock spec missing no-baked-text rule'));
  }
  if (!UNIVERSAL_WORKBENCH.rules.includes('no generated words')) {
    violations.push(violation('workbench', 'Workbench spec missing no-generated-words rule'));
  }
  if (!STUDIO_WORLD_STYLE_BIBLE.typographyPlaceholders.aiNeverRendersText) {
    violations.push(violation('typography', 'Style Bible must enforce aiNeverRendersText'));
  }
  if (STUDIO_WORLD_DESIGN_TOKENS.radius['radius-panel'] !== STUDIO_WORLD_STYLE_BIBLE.panelSystem.cornerRadius) {
    violations.push(violation('panelSystem', 'Design token radius-panel must match Style Bible panel radius'));
  }

  if (violations.length > 0) {
    return { ok: false, code: 'WORLD_STYLE_VIOLATION', violations };
  }
  return { ok: true, bibleVersion: STUDIO_WORLD_STYLE_BIBLE.authority.bibleVersion, bibleRevision: 1 };
}
