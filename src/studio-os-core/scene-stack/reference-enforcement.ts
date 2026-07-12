import { FAL_PLACEMENT_REFERENCE_LAYER, isForbiddenFalReferenceLayer } from './assembly-law';
import { isIsolatedObjectLayer } from './isolated-layer-contract';
import { isBlendCompositeLayer } from './reference-chain';
import { getSceneStackLayerRecord, listSceneStackLayersForStation } from './store';
import type { SceneStackLayerId } from './types';

export type ReferenceEnforcementResult = {
  ok: boolean;
  sanitizedUrls: string[];
  violations: string[];
};

/**
 * Enforce Scene Assembly™ reference law before any FAL call.
 * Allowed: environment shell only (+ optional non-generative guides supplied explicitly).
 * Forbidden: any approved prior generative layer URL.
 */
export function enforceFalReferenceLaw(input: {
  departmentId: string;
  projectId: string;
  stationId: string;
  targetLayerId: SceneStackLayerId;
  requestedUrls: string[];
}): ReferenceEnforcementResult {
  const violations: string[] = [];
  const approvedLayers = listSceneStackLayersForStation(
    input.departmentId,
    input.projectId,
    input.stationId
  );

  const forbiddenUrls = new Set<string>();
  for (const rec of approvedLayers) {
    if (rec.publicUrl && isForbiddenFalReferenceLayer(rec.layerId)) {
      forbiddenUrls.add(rec.publicUrl);
    }
  }

  for (const url of input.requestedUrls) {
    if (forbiddenUrls.has(url)) {
      violations.push(
        `Forbidden reference: URL belongs to approved generative layer — prior layers are immutable and must not re-enter FAL.`
      );
    }
  }

  if (input.requestedUrls.length > 1) {
    violations.push(
      `Forbidden reference: multiple image URLs requested — only single shell placement reference allowed.`
    );
  }

  const shell = getSceneStackLayerRecord(
    input.departmentId,
    input.projectId,
    input.stationId,
    FAL_PLACEMENT_REFERENCE_LAYER
  );

  let sanitizedUrls: string[] = [];

  if (input.targetLayerId === FAL_PLACEMENT_REFERENCE_LAYER) {
    sanitizedUrls = [];
  } else if (shell?.publicUrl) {
    // Isolated object layers must NOT receive shell as img2img input — perspective encoded in prompt only.
    if (isIsolatedObjectLayer(input.targetLayerId) || isBlendCompositeLayer(input.targetLayerId)) {
      sanitizedUrls = [];
      if (input.requestedUrls.length > 0) {
        violations.push(
          `Stripped shell reference for isolated layer — shell must not be dominant img2img source.`
        );
      }
    } else {
      const shellOnly = input.requestedUrls.filter((u) => u === shell.publicUrl);
      sanitizedUrls = shellOnly.length ? [shell.publicUrl] : [shell.publicUrl];

      for (const url of input.requestedUrls) {
        if (url !== shell.publicUrl) {
          violations.push(
            `Stripped non-shell reference URL — only environment-shell may anchor placement.`
          );
        }
      }
    }
  } else {
    sanitizedUrls = [];
    if (input.requestedUrls.length > 0) {
      violations.push(
        `No approved shell — stripped all references. Generate environment-shell first.`
      );
    }
  }

  const blockingViolations = violations.filter(
    (v) => v.includes('Forbidden reference: URL belongs') || v.includes('multiple image URLs')
  );

  return {
    ok: blockingViolations.length === 0,
    sanitizedUrls,
    violations,
  };
}
