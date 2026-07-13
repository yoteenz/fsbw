import { describe, expect, it } from 'vitest';
import { fixtureReceptionConstructionPlan } from '../blueprint-author/fixtures';
import {
  buildApprovedFounderRenderHandoff,
  validateApprovedFounderRenderHandoff,
  CREATIVE_DIRECTOR_STUDIO_REQUIRES_APPROVED_HANDOFF,
  EXPERIENCE_LAB_MANUFACTURES_PRODUCTION_ASSETS,
} from './approved-founder-render-handoff';
import { buildRoomManufacturingGraph } from './room-manufacturing-graph';

function receptionPlan(org = 'studio-os') {
  return fixtureReceptionConstructionPlan({
    organizationId: org,
    buildingId: 'b1',
    floorId: 'f1',
    roomId: 'reception',
    requestId: 'req-pipeline',
    founderIntent: 'Reception manufacturing pipeline test',
    styleProfile: {
      styleId: 'luxury',
      version: '1',
      organizationStyle: 'frontal-slayer',
      visualLanguage: 'warm marble',
    },
  });
}

describe('Experience Lab → CDS manufacturing pipeline contract', () => {
  it('declares Experience Lab does not manufacture production assets', () => {
    expect(EXPERIENCE_LAB_MANUFACTURES_PRODUCTION_ASSETS).toBe(false);
    expect(CREATIVE_DIRECTOR_STUDIO_REQUIRES_APPROVED_HANDOFF).toBe(true);
  });

  it('builds approved founder render handoff from plan + approval record', () => {
    const plan = receptionPlan();
    const handoff = buildApprovedFounderRenderHandoff({
      plan,
      source: 'experience-lab',
      stationId: 'xelab-studio-os-a',
      projectId: 'experience-lab',
      founderRenderJobId: 'frj-test',
      previewArtifactUrl: 'https://cdn.example/founder-render.png',
      approvedBy: 'founder@example.com',
      approvalRecord: {
        previewArtifactId: 'frj-test',
        previewArtifactUrl: 'https://cdn.example/founder-render.png',
        blueprintId: plan.planId,
        blueprintRevision: plan.metadata.revision,
        constructionPlanId: plan.planId,
        founderId: 'founder@example.com',
        approvedAt: new Date().toISOString(),
        model: 'fal-ai/nano-banana-pro/edit',
        promptVersion: 'founder-full-room-preview-prompt.v1',
        materialSet: plan.materialSet.materialSetId,
        lightingProfile: plan.lightingProfile.profileId,
        cameraProfile: 'Hero',
      },
    });
    expect(handoff.blueprintRevision).toBe(plan.metadata.revision);
    expect(handoff.stationId).toBe('xelab-studio-os-a');
    expect(validateApprovedFounderRenderHandoff(handoff).ok).toBe(true);
  });

  it('rejects CDS manufacturing when handoff is missing or stale', () => {
    expect(validateApprovedFounderRenderHandoff(null).ok).toBe(false);
    const plan = receptionPlan();
    const handoff = buildApprovedFounderRenderHandoff({
      plan,
      source: 'experience-lab',
      stationId: 'xelab-studio-os-a',
      projectId: 'experience-lab',
      founderRenderJobId: 'frj-test',
      previewArtifactUrl: 'https://cdn.example/founder-render.png',
      approvedBy: 'founder@example.com',
      approvalRecord: {
        previewArtifactId: 'frj-test',
        previewArtifactUrl: 'https://cdn.example/founder-render.png',
        blueprintId: plan.planId,
        blueprintRevision: plan.metadata.revision,
        constructionPlanId: plan.planId,
        founderId: 'founder@example.com',
        approvedAt: new Date().toISOString(),
        model: 'fal-ai/nano-banana-pro/edit',
        promptVersion: 'founder-full-room-preview-prompt.v1',
        materialSet: plan.materialSet.materialSetId,
        lightingProfile: plan.lightingProfile.profileId,
        cameraProfile: 'Hero',
      },
    });
    const stale = validateApprovedFounderRenderHandoff(handoff, { currentBlueprintRevision: plan.metadata.revision + 1 });
    expect(stale.ok).toBe(false);
    if (!stale.ok) expect(stale.code).toBe('HANDOFF_STALE');
  });

  it('decomposes reception construction plan into manufacturing graph nodes', () => {
    const plan = receptionPlan();
    const graph = buildRoomManufacturingGraph({
      plan,
      masterReferenceUrl: 'https://cdn.example/founder-render.png',
    });
    expect(graph.roomDisplayName).toBeTruthy();
    expect(graph.masterReferenceUrl).toContain('founder-render');
    const labels = graph.nodes.map((n) => n.label);
    expect(labels).toContain('Floor');
    expect(labels).toContain('Lighting');
    expect(labels.some((l) => l.toLowerCase().includes('desk'))).toBe(true);
    const desk = graph.nodes.find((n) => n.assetClass === 'reception-desk');
    expect(desk?.selectable).toBe(true);
    expect(desk?.regeneratesIndependently).toBe(true);
  });
});
