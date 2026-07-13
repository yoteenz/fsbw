/**
 * Founder Review™ — Construction Timeline ("build movie").
 */
import type { ManufacturingQueue } from '../manufacturing-engine/manufacturing-queue';
import type { LiveConstructionView } from '../construction-mode/live-construction';

export const CONSTRUCTION_TIMELINE_VERSION = 'construction-timeline.v1';

export type ConstructionTimelineStepId =
  | 'blueprint-approved'
  | 'jobs-generated'
  | 'workers-assigned'
  | 'materials-loaded'
  | 'architecture-verified'
  | 'generating-desk'
  | 'generating-sculpture'
  | 'generating-seating'
  | 'generating-lighting'
  | 'room-assembly'
  | 'lighting-bake'
  | 'quality-validation'
  | 'immune-validation'
  | 'founder-review';

export type ConstructionTimelineStep = {
  stepId: ConstructionTimelineStepId;
  label: string;
  status: 'pending' | 'active' | 'complete';
};

export type ConstructionTimeline = {
  timelineVersion: typeof CONSTRUCTION_TIMELINE_VERSION;
  planId: string;
  steps: ConstructionTimelineStep[];
  activeStepId: ConstructionTimelineStepId | null;
  progressPercent: number;
};

const TIMELINE_DEFS: Array<{ stepId: ConstructionTimelineStepId; label: string }> = [
  { stepId: 'blueprint-approved', label: 'Blueprint Approved' },
  { stepId: 'jobs-generated', label: 'Construction Jobs Generated' },
  { stepId: 'workers-assigned', label: 'Workers Assigned' },
  { stepId: 'materials-loaded', label: 'Materials Loaded' },
  { stepId: 'architecture-verified', label: 'Architecture Verified' },
  { stepId: 'generating-desk', label: 'Generating Desk' },
  { stepId: 'generating-sculpture', label: 'Generating Sculpture' },
  { stepId: 'generating-seating', label: 'Generating Seating' },
  { stepId: 'generating-lighting', label: 'Generating Lighting' },
  { stepId: 'room-assembly', label: 'Room Assembly' },
  { stepId: 'lighting-bake', label: 'Lighting Bake' },
  { stepId: 'quality-validation', label: 'Quality Validation' },
  { stepId: 'immune-validation', label: 'Immune Validation' },
  { stepId: 'founder-review', label: 'Founder Review' },
];

function mapJobToStep(assetId: string): ConstructionTimelineStepId | null {
  const lower = assetId.toLowerCase();
  if (lower.includes('desk') || lower.includes('reception')) return 'generating-desk';
  if (lower.includes('landmark') || lower.includes('sculpture') || lower.includes('crystal')) return 'generating-sculpture';
  if (lower.includes('seat') || lower.includes('chair') || lower.includes('lounge')) return 'generating-seating';
  if (lower.includes('light')) return 'generating-lighting';
  return null;
}

export function buildConstructionTimeline(input: {
  planId: string;
  queue: ManufacturingQueue;
  phase: 'pre-approval' | 'manufacturing' | 'complete';
  liveView?: LiveConstructionView | null;
}): ConstructionTimeline {
  const { phase, queue, liveView } = input;

  let completeThrough = -1;
  let activeIdx = 0;

  if (phase === 'pre-approval') {
    completeThrough = -1;
    activeIdx = 0;
  } else if (phase === 'manufacturing') {
    completeThrough = 4;
    activeIdx = 5;
    if (liveView) {
      for (const stage of liveView.stages) {
        const mapped = mapJobToStep(stage.label);
        if (!mapped) continue;
        const idx = TIMELINE_DEFS.findIndex((d) => d.stepId === mapped);
        if (stage.status === 'completed') {
          completeThrough = Math.max(completeThrough, idx);
        } else if (stage.status === 'rendering' || stage.status === 'inspecting') {
          activeIdx = idx;
        }
      }
      if (liveView.overallProgressPercent >= 50) {
        completeThrough = Math.max(completeThrough, TIMELINE_DEFS.findIndex((d) => d.stepId === 'room-assembly') - 1);
        activeIdx = TIMELINE_DEFS.findIndex((d) => d.stepId === 'room-assembly');
      }
      if (liveView.overallProgressPercent >= 85) {
        activeIdx = TIMELINE_DEFS.findIndex((d) => d.stepId === 'lighting-bake');
      }
    } else if (queue.jobs.length > 0) {
      activeIdx = 5;
    }
  } else {
    completeThrough = TIMELINE_DEFS.length - 1;
    activeIdx = TIMELINE_DEFS.length - 1;
  }

  const steps: ConstructionTimelineStep[] = TIMELINE_DEFS.map((def, i) => {
    if (i <= completeThrough) return { ...def, status: 'complete' };
    if (i === activeIdx && phase !== 'pre-approval') return { ...def, status: 'active' };
    if (phase === 'complete') return { ...def, status: 'complete' };
    return { ...def, status: 'pending' };
  });

  const completedCount = steps.filter((s) => s.status === 'complete').length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return {
    timelineVersion: CONSTRUCTION_TIMELINE_VERSION,
    planId: input.planId,
    steps,
    activeStepId: steps.find((s) => s.status === 'active')?.stepId ?? null,
    progressPercent,
  };
}
