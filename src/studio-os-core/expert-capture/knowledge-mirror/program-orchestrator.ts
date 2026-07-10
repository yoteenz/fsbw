import type { KnowledgeProgram } from './types';
import { syncSessionToProgram } from './sync-from-session';
import { rebuildTrainingPackets, detectConflicts } from './training-packets';
import { rebuildCompetencies, rebuildAuthorizationsFromPackets } from './competency-core';
import type { ExpertCaptureSession } from '../types';

export function refreshProgramFromSession(
  program: KnowledgeProgram,
  session: ExpertCaptureSession,
  industryContext: string
): KnowledgeProgram {
  let next = syncSessionToProgram(program, session, industryContext);
  next = rebuildTrainingPackets(next);
  next = rebuildCompetencies(next);
  next = rebuildAuthorizationsFromPackets(next);
  next = detectConflicts(next);
  return next;
}
