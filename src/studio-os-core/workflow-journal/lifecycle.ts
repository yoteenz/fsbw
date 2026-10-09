import type { KnowledgeLifecycleStatus } from '../expert-capture/knowledge-mirror/types';
import { canEnterWorkerTraining } from '../expert-capture/knowledge-mirror/lifecycle';
import type { JournalLifecycle } from './types';

/** Map journal language onto Studio Institute knowledge states. Do not invent a second system. */
export function toKnowledgeMirrorStatus(status: JournalLifecycle): KnowledgeLifecycleStatus {
  switch (status) {
    case 'researched':
    case 'draft':
      return 'draft';
    case 'expert_review':
      return 'interpreted';
    case 'needs_correction':
      return 'needs_clarification';
    case 'expert_confirmed':
      return 'expert_reviewed';
    case 'owner_approved':
      return 'owner_visible';
    case 'available_for_authorized_use':
      return 'approved_for_training';
    case 'superseded':
      return 'superseded';
    case 'retired':
      return 'archived';
    default:
      return 'draft';
  }
}

export function journalStatusLabel(status: JournalLifecycle): string {
  const labels: Record<JournalLifecycle, string> = {
    researched: 'Researched',
    draft: 'Draft',
    expert_review: 'Expert review',
    needs_correction: 'Needs correction',
    expert_confirmed: 'Expert confirmed',
    owner_approved: 'Owner approved',
    available_for_authorized_use: 'Available for authorized use',
    superseded: 'Superseded',
    retired: 'Retired',
  };
  return labels[status];
}

/**
 * Owner approval makes knowledge visible to the owner.
 * It does not enter worker training. Authorized use still requires a separate grant,
 * and this pilot never sets active_knowledge.
 */
export function mirrorAllowsWorkerTraining(status: JournalLifecycle, workerUseGranted: boolean): boolean {
  if (!workerUseGranted) return false;
  return canEnterWorkerTraining(toKnowledgeMirrorStatus(status));
}
