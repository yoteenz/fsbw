import type { ExecutiveAssistanceAction, IntelligentFilterSnapshot, LoadState } from './types';

export function buildExecutiveAssistance(
  organizationId: string,
  loadState: LoadState,
  filters: IntelligentFilterSnapshot[],
  pendingApprovals: number
): ExecutiveAssistanceAction[] {
  const now = new Date().toISOString();
  const highLoad = loadState === 'elevated' || loadState === 'critical';
  const actions: ExecutiveAssistanceAction[] = [];

  if (highLoad && pendingApprovals > 0) {
    actions.push({
      id: `assist-${organizationId}-postponed`,
      message: "I've postponed low-priority approvals until tomorrow — urgent items remain visible.",
      category: 'postponed',
      appliedAt: now,
    });
  }

  if (filters.find((f) => f.action === 'summarize-information')?.active) {
    actions.push({
      id: `assist-${organizationId}-batched`,
      message: "I've combined twelve notifications into one briefing — better prioritization, not more noise.",
      category: 'batched',
      appliedAt: now,
    });
  }

  if (highLoad) {
    actions.push({
      id: `assist-${organizationId}-delegated`,
      message: "I've delegated routine tasks to Operations — founder attention reserved for decisions only you can make.",
      category: 'delegated',
      appliedAt: now,
    });
  }

  if (filters.find((f) => f.action === 'protect-focus')?.active) {
    actions.push({
      id: `assist-${organizationId}-hidden`,
      message: "I've hidden non-essential activity while you finish your presentation — focus protected.",
      category: 'hidden',
      appliedAt: now,
    });
  }

  if (loadState === 'moderate' || highLoad) {
    actions.push({
      id: `assist-${organizationId}-summarized`,
      message: 'Executive summary prepared — full detail available on request, not by default.',
      category: 'summarized',
      appliedAt: now,
    });
  }

  return actions.slice(0, 5);
}

export function buildDockHeadline(assistance: ExecutiveAssistanceAction[], loadState: LoadState): string {
  if (assistance[0]) return assistance[0].message;
  if (loadState === 'light') return 'Cognitive load light — full information available with minimal filtering.';
  if (loadState === 'moderate') return 'Attention protected — prioritization active, interruptions minimized.';
  return 'Focus protection engaged — only urgent matters will interrupt.';
}

export function summarizeCognitiveLoadProfile(profile: {
  cognitiveDemandPct: number;
  focusProtectionPct: number;
  loadState: LoadState;
  dockHeadline: string;
  executiveAssistance: ExecutiveAssistanceAction[];
  activeAttentionMode: string;
}): string {
  const assist = profile.executiveAssistance.slice(0, 2).map((a) => a.message);
  return [
    profile.dockHeadline,
    `Cognitive demand ${profile.cognitiveDemandPct}% · Focus protection ${profile.focusProtectionPct}% · ${profile.loadState} load.`,
    `Attention mode: ${profile.activeAttentionMode.replace(/-/g, ' ')}.`,
    assist.length ? assist.join(' ') : 'Monitoring mental workload continuously.',
  ].join(' ');
}
