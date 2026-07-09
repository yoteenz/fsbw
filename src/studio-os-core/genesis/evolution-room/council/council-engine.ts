import { buildGenesisProposalQueue } from '../genesis-queue/proposal-queue-engine';
import { listFutureOpportunities } from '../future-wall/future-engine';
import { buildEvolutionLaunchStackProgress } from '../launch-stack/launch-stack-engine';
import type { ErCouncilAgendaItem } from '../types';

function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function buildEvolutionCouncilAgenda(): ErCouncilAgendaItem[] {
  const proposals = buildGenesisProposalQueue().slice(0, 3);
  const blocked = buildEvolutionLaunchStackProgress().filter((m) => m.status === 'blocked');
  const futureHigh = listFutureOpportunities().filter((f) => f.priority === 'high').slice(0, 2);

  const agenda: ErCouncilAgendaItem[] = [];

  if (blocked.length > 0) {
    agenda.push({
      agendaId: id('council'),
      topic: 'Launch Stack blockers',
      orbPosition: `${blocked.length} systems remain blocked — council recommends focused validation sprint.`,
      evidence: blocked.map((b) => `${b.officialName}: ${b.blockedReason ?? b.status}`),
      recommendation: 'Defer non-critical work; assign validation missions to unblock graduation.',
      status: 'pending',
    });
  }

  for (const p of proposals) {
    agenda.push({
      agendaId: id('council'),
      topic: p.title,
      orbPosition: `Genesis proposal (${p.evidenceQuality} evidence): ${p.signalSummary}`,
      evidence: [p.proposedGenesisChange],
      recommendation: 'Review evidence, then accept, defer, or reject — never auto-canonize.',
      status: 'pending',
    });
  }

  for (const f of futureHigh) {
    agenda.push({
      agendaId: id('council'),
      topic: f.title,
      orbPosition: f.description,
      evidence: f.evidence,
      recommendation: `Consider for ${f.suggestedMonth ?? 'next month'} priorities (${Math.round(f.confidence * 100)}% confidence).`,
      status: 'pending',
    });
  }

  if (agenda.length === 0) {
    agenda.push({
      agendaId: id('council'),
      topic: 'Monthly evolution check-in',
      orbPosition: 'No critical blockers — council recommends celebrating progress and setting next-month focus.',
      evidence: ['Platform health stable', 'Genesis queue clear'],
      recommendation: 'Preserve one milestone on Legacy Wall; select one Future Wall priority.',
      status: 'pending',
    });
  }

  return agenda;
}

export function updateCouncilAgendaStatus(
  agendaId: string,
  status: ErCouncilAgendaItem['status'],
  founderNotes?: string
): void {
  // Applied via session mutator in meeting-flow-engine
  void agendaId;
  void status;
  void founderNotes;
}
