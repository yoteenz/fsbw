import type { TechnicalArtGate } from './types';
import { resolveProductionProfile } from './production-profiles';
import type { AssetPackageManifest } from './asset-package';
import { packageCompletenessSummary } from './asset-package';

export type TechnicalGateEvaluation = {
  gate: TechnicalArtGate;
  applicable: boolean;
  satisfied: boolean;
  reason: string;
};

const GATE_DELIVERABLE_MAP: Partial<Record<TechnicalArtGate, import('./types').DeliverableSlotId[]>> = {
  GEOMETRY_READY: ['source_blend', 'runtime_glb'],
  UV_READY: ['uv_layout'],
  TEXTURES_READY: ['pbr_texture_set'],
  MATERIALS_READY: ['material_definitions'],
  RUNTIME_MESH_READY: ['runtime_glb', 'runtime_fbx'],
  COLLISION_READY: ['collision_mesh'],
  RIG_READY: ['skeleton', 'skin_weights'],
  ANIMATION_READY: ['animation_clips'],
  ENGINE_IMPORT_READY: ['engine_import_config'],
  SPATIAL_VALIDATION_READY: ['navigation_metadata', 'interaction_anchors'],
};

export function evaluateTechnicalQualityGates(
  profileId: string,
  pkg: AssetPackageManifest,
  founderVisualApproved: boolean,
  founderExperienceApproved: boolean
): TechnicalGateEvaluation[] {
  const profile = resolveProductionProfile(profileId);
  if (!profile) return [];

  const { ready } = packageCompletenessSummary(pkg);
  const results: TechnicalGateEvaluation[] = [];

  for (const gate of profile.qualityGates) {
    if (gate === 'FOUNDER_VISUAL_APPROVAL') {
      results.push({
        gate,
        applicable: true,
        satisfied: founderVisualApproved,
        reason: founderVisualApproved ? 'Founder visual approval recorded' : 'Pending founder visual approval',
      });
      continue;
    }
    if (gate === 'FOUNDER_EXPERIENCE_APPROVAL') {
      results.push({
        gate,
        applicable: true,
        satisfied: founderExperienceApproved,
        reason: founderExperienceApproved
          ? 'Founder experience approval recorded'
          : 'Pending founder experience approval',
      });
      continue;
    }

    const slots = GATE_DELIVERABLE_MAP[gate] ?? [];
    const applicable = profile.qualityGates.includes(gate);
    if (slots.length === 0) {
      results.push({
        gate,
        applicable,
        satisfied: ready,
        reason: ready ? 'Package completeness OK' : 'Package incomplete',
      });
      continue;
    }

    const relevant = slots.filter((s) => {
      const c = profile.requiredDeliverables.includes(s);
      const o = profile.optionalDeliverables.includes(s);
      const na = profile.notApplicableDeliverables.includes(s);
      return c || o || !na;
    });

    const satisfied = relevant.every((slot) => {
      const state = pkg.deliverableCompleteness[slot];
      if (profile.notApplicableDeliverables.includes(slot)) return true;
      if (profile.optionalDeliverables.includes(slot)) return true;
      return state === 'PRESENT' || state === 'UNVERIFIED';
    });

    results.push({
      gate,
      applicable: true,
      satisfied,
      reason: satisfied ? `${gate} deliverables satisfied at contract level` : `${gate} blocked by missing deliverables`,
    });
  }

  return results;
}

export function allRequiredGatesPass(evaluations: TechnicalGateEvaluation[]): boolean {
  return evaluations.filter((e) => e.applicable).every((e) => e.satisfied);
}
