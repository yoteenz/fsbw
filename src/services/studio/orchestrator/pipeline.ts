import {
  CONTENT_PACK_ASSET_SLOTS,
  ORCHESTRATOR_PIPELINE_STEPS,
  DEMO_ORCHESTRATOR_PACK_ID,
} from '../../../utils/adminStudioOrchestratorDemo';
import type { OrchestratorRunInput, OrchestratedContentPack, GenerationStepResult } from './types';

export function createEmptyPack(packId: string, topic: string): OrchestratedContentPack {
  return {
    packId,
    topic,
    pipelineStep: 'topic',
    approvalStatus: 'draft',
    assets: CONTENT_PACK_ASSET_SLOTS.map((slot) => ({
      slotId: slot.id,
      label: slot.label,
      providerId: slot.defaultProvider,
      status: 'empty',
      preview: '',
    })),
    versions: [],
    promptHistory: [],
    providerUsed: [],
    generationTimestamp: null,
    steps: [],
  };
}

/** Simulates pipeline planning without calling providers — all steps NOT_CONNECTED. */
export function planOrchestratorRun(input: OrchestratorRunInput): OrchestratedContentPack {
  const steps: GenerationStepResult[] = CONTENT_PACK_ASSET_SLOTS.map((slot) => {
    const adapter = input.adapterStates[slot.defaultProvider];
    const blocked = !adapter?.enabled || !adapter?.connected;
    return {
      stepId: slot.id,
      providerId: slot.defaultProvider,
      status: blocked ? 'skipped' : 'pending',
      errorCode: blocked ? 'NOT_CONNECTED' : undefined,
      errorMessage: blocked
        ? `${slot.defaultProvider.toUpperCase()} ADAPTER NOT CONNECTED — NO GENERATION`
        : undefined,
      outputPreview: blocked ? '' : `[PENDING] ${slot.label} FOR: ${input.topic}`,
    };
  });

  const pack: OrchestratedContentPack = {
    packId: input.packId,
    topic: input.topic,
    pipelineStep: 'ai-orchestrator',
    approvalStatus: 'draft',
    assets: CONTENT_PACK_ASSET_SLOTS.map((slot, i) => ({
      slotId: slot.id,
      label: slot.label,
      providerId: slot.defaultProvider,
      status: steps[i].status === 'skipped' ? 'empty' : 'draft',
      preview: steps[i].outputPreview ?? '',
    })),
    versions: [
      {
        versionNumber: 1,
        promptUsed: input.masterPrompt.slice(0, 200) + (input.masterPrompt.length > 200 ? '…' : ''),
        providerId: 'openai',
        editorNotes: 'INITIAL PLAN — PROVIDERS NOT CALLED',
        approvalHistory: ['CREATED AS DRAFT'],
        generatedAt: new Date().toISOString(),
        rollbackAvailable: false,
      },
    ],
    promptHistory: [input.masterPrompt],
    providerUsed: [],
    generationTimestamp: null,
    steps,
  };

  return pack;
}

export function simulateDemoPackaging(topic: string): OrchestratedContentPack {
  const pack = createEmptyPack(DEMO_ORCHESTRATOR_PACK_ID, topic);
  pack.pipelineStep = 'draft-package';
  pack.assets = pack.assets.map((a) => ({
    ...a,
    status: 'draft',
    preview: `DRAFT ${a.label} — PACKAGED · NOT AI-GENERATED`,
  }));
  pack.promptHistory = ['[DEMO] MASTER PROMPT ASSEMBLED BY CREATIVE DIRECTOR'];
  pack.generationTimestamp = new Date().toISOString();
  return pack;
}

export function getPipelineProgress(step: OrchestratedContentPack['pipelineStep']): number {
  const idx = ORCHESTRATOR_PIPELINE_STEPS.findIndex((s) => s.id === step);
  return idx < 0 ? 0 : Math.round(((idx + 1) / ORCHESTRATOR_PIPELINE_STEPS.length) * 100);
}

export function retryStep(pack: OrchestratedContentPack, stepId: string): OrchestratedContentPack {
  return {
    ...pack,
    steps: pack.steps.map((s) =>
      s.stepId === stepId
        ? { ...s, status: 'pending', errorCode: undefined, errorMessage: 'RETRY QUEUED — STILL NOT CONNECTED' }
        : s
    ),
  };
}

export function advanceApproval(
  pack: OrchestratedContentPack,
  status: OrchestratedContentPack['approvalStatus']
): OrchestratedContentPack {
  const history = pack.versions[0]
    ? {
        ...pack.versions[0],
        approvalHistory: [...pack.versions[0].approvalHistory, status.toUpperCase()],
      }
    : undefined;
  const versions = history ? [history, ...pack.versions.slice(1)] : pack.versions;
  let pipelineStep = pack.pipelineStep;
  if (status === 'approved') pipelineStep = 'scheduling';
  if (status === 'scheduled') pipelineStep = 'scheduling';
  if (status === 'published') pipelineStep = 'publishing';
  if (status === 'archived') pipelineStep = 'analytics' as typeof pipelineStep;

  return { ...pack, approvalStatus: status, versions, pipelineStep };
}

/** Never auto-publish. */
export function canPublish(pack: OrchestratedContentPack): { allowed: boolean; reason: string } {
  if (pack.approvalStatus !== 'approved' && pack.approvalStatus !== 'scheduled') {
    return { allowed: false, reason: 'PUBLISHING BLOCKED — REQUIRES APPROVED OR SCHEDULED STATUS' };
  }
  return { allowed: false, reason: 'AUTO-PUBLISH DISABLED — MANUAL PUBLISH VIA PUBLISHING QUEUE IN PHASE 2' };
}
