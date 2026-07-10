import type { KnowledgeProgram, OwnerMirrorSnapshot } from './types';
import { isOwnerVisible } from './lifecycle';

export function buildOwnerMirrorSnapshot(program: KnowledgeProgram): OwnerMirrorSnapshot {
  const ownerVisibleEntries = program.entries.filter((e) => isOwnerVisible(e.visibility, e.lifecycleStatus));
  const totalAreas = new Set(program.entries.map((e) => e.knowledgeArea)).size;
  const completedAreas = new Set(ownerVisibleEntries.map((e) => e.knowledgeArea)).size;
  const trainingProgressPercent = totalAreas ? Math.round((completedAreas / totalAreas) * 100) : 0;

  const recentEntries = [...program.entries]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 12);

  const readyForReview = program.entries.filter(
    (e) => e.lifecycleStatus === 'owner_visible' || e.lifecycleStatus === 'expert_reviewed'
  );

  const activePackets = program.packets.filter((p) => p.status === 'active' || p.status === 'passed');
  const pendingPackets = program.packets.filter(
    (p) => p.status === 'expert_approved' || p.status === 'ready_for_scenario_testing' || p.status === 'owner_approved'
  );

  const outdatedEntries = program.entries.filter(
    (e) => e.freshnessStatus === 'potentially_outdated' || e.freshnessStatus === 'review_due' || e.lifecycleStatus === 'outdated'
  );

  const knowledgeGaps = program.packets
    .filter((p) => p.unansweredQuestions.length)
    .flatMap((p) => p.unansweredQuestions);

  return {
    program,
    trainingProgressPercent,
    recentEntries,
    readyForReview,
    activePackets,
    pendingPackets,
    competencySummary: program.competencies,
    authorizationSummary: program.authorizations,
    knowledgeGaps,
    conflicts: program.conflicts.filter((c) => !c.resolved),
    outdatedEntries,
    continuingEducation: program.continuingEducation,
    unreadNotifications: program.notifications.filter((n) => !n.read),
  };
}

export function sandboxAnswerFromApprovedKnowledge(program: KnowledgeProgram, question: string): string {
  const q = question.toLowerCase();
  const active = program.entries.filter((e) => e.lifecycleStatus === 'active_knowledge' || e.lifecycleStatus === 'approved_for_training');

  if (q.includes('not learned') || q.includes('not authorized') || q.includes('cannot')) {
    const restricted = program.authorizations.filter((a) => !a.granted);
    if (!restricted.length) return 'Based on approved training, I have no explicit restrictions on record yet — the owner should confirm authorizations.';
    return `I am not authorized to: ${restricted.map((a) => a.capability.replace(/_/g, ' ')).join('; ')}.`;
  }

  if (q.includes('learned so far') || q.includes('what have you')) {
    if (!active.length) return 'I have not yet been trained on any active knowledge packets. Approved training is pending owner review.';
    return `From approved expert knowledge, I have learned: ${active.slice(0, 5).map((e) => e.statement).join(' ')}`;
  }

  if (q.includes('escalat')) {
    const rules = active.filter((e) => e.knowledgeArea.includes('Escalation') || e.entryType === 'exception');
    return rules.length
      ? rules.map((e) => e.statement).join(' ')
      : 'Escalation training is not yet active. I must defer to the human expert.';
  }

  if (q.includes('expert instruction') || q.includes('supports')) {
    const match = active.find((e) => q.split(' ').some((w) => e.statement.toLowerCase().includes(w) && w.length > 4));
    if (match) {
      return `This follows expert instruction from ${match.expertName} (${match.source.questionText}, session ${match.source.sessionId.slice(0, 8)}…): ${match.statement}`;
    }
    return 'I cannot attribute an active approved rule to that question yet.';
  }

  const relevant = active.filter((e) => q.split(' ').some((word) => word.length > 4 && e.statement.toLowerCase().includes(word)));
  if (relevant.length) return relevant.map((e) => e.statement).join('\n\n');
  return 'I have not been trained on that topic from approved knowledge packets yet.';
}
