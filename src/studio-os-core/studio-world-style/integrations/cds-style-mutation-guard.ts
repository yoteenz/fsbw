import { STUDIO_WORLD_STYLE_BIBLE } from '../style-bible/registry';
import { UNIVERSAL_COMMAND_DOCK } from '../command-dock/command-dock-system';
import { UNIVERSAL_WORKBENCH } from '../workbench/workbench-system';
import { STUDIO_WORLD_DESIGN_TOKENS } from '../design-tokens/export';

export const CDS_STYLE_MUTATION_GUARD_VERSION = 'cds-style-mutation-guard.v1' as const;

/** Canonical surfaces Creative Director Studio may NOT mutate. */
export const CDS_IMMUTABLE_STYLE_SURFACES = [
  'Studio World Style Bible',
  'Command Dock geometry',
  'Workbench geometry',
  'Panel system',
  'World navigation language',
  'Typography placeholder system',
  'Design token spacing/radius/blur',
] as const;

/** Surfaces CDS may customize (assets/props only — not world language). */
export const CDS_MUTABLE_SURFACES = [
  'assets',
  'props',
  'department materials (within Company DNA)',
  'lighting accents (within philosophy)',
  'brand identity overlays',
  'company overlays',
] as const;

export type CdsMutationAttempt = {
  surface: string;
  mutation: string;
};

export type CdsMutationGuardResult =
  | { ok: true; allowed: true }
  | { ok: false; code: 'STYLE_BIBLE_MUTATION_FORBIDDEN'; surface: string; message: string };

export function guardCdsStyleMutation(attempt: CdsMutationAttempt): CdsMutationGuardResult {
  const immutable = CDS_IMMUTABLE_STYLE_SURFACES as readonly string[];
  const surfaceLower = attempt.surface.toLowerCase();
  const mutationLower = attempt.mutation.toLowerCase();
  for (const surface of immutable) {
    const canon = surface.toLowerCase();
    if (surfaceLower.includes(canon) || canon.includes(surfaceLower) ||
        mutationLower.includes(canon) || canon.includes(mutationLower)) {
      return {
        ok: false,
        code: 'STYLE_BIBLE_MUTATION_FORBIDDEN',
        surface,
        message: `Creative Director Studio cannot mutate canonical ${surface}`,
      };
    }
  }
  return { ok: true, allowed: true };
}

export function validateCdsMutationBoundaries(): CdsMutationGuardResult[] {
  const tests: CdsMutationAttempt[] = [
    { surface: 'Command Dock geometry', mutation: 'resize dock width to 50%' },
    { surface: 'Panel system', mutation: 'change corner radius to 24px' },
    { surface: 'Typography placeholder system', mutation: 'render text in founder render' },
    { surface: 'assets', mutation: 'customize hero prop material' },
    { surface: 'brand identity', mutation: 'apply company logo overlay' },
  ];

  return tests.map((t) => guardCdsStyleMutation(t));
}

export function assertCdsCannotMutateStyleBible(): boolean {
  const results = validateCdsMutationBoundaries();
  const blocked = results.filter((r) => !r.ok);
  const allowed = results.filter((r) => r.ok);
  return blocked.length === 3 && allowed.length === 2 &&
    blocked.every((r) => r.code === 'STYLE_BIBLE_MUTATION_FORBIDDEN') &&
    STUDIO_WORLD_STYLE_BIBLE.authority.authority === 'highest-visual-authority' &&
    UNIVERSAL_COMMAND_DOCK.objectId === 'StudioWorldCommandDock' &&
    UNIVERSAL_WORKBENCH.objectId === 'StudioWorldWorkbench' &&
    STUDIO_WORLD_DESIGN_TOKENS.tokenVersion === 'studio-world-design-tokens.v1';
}
