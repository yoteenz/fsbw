import { listInstitutePublications } from '../publications/engine';
import { listPendingSubmissions } from '../review/pipeline';

/** Profession Brain™ knowledge bridge — proposals flow through Institute review. */
export function listProfessionLinkedPublications(professionId?: string) {
  const pubs = listInstitutePublications().filter((p) => p.professionIds.length > 0);
  if (!professionId) return pubs;
  return pubs.filter((p) => p.professionIds.includes(professionId));
}

export function listProfessionBrainSubmissions(professionId?: string) {
  const subs = listPendingSubmissions().filter((s) => s.source === 'profession-brain');
  if (!professionId) return subs;
  return subs.filter((s) => s.sourceRef === professionId);
}

export function getProfessionKnowledgeBridgeStats() {
  const linked = listProfessionLinkedPublications();
  const pending = listProfessionBrainSubmissions();
  return {
    linkedPublications: linked.length,
    pendingProposals: pending.length,
    professionsRepresented: new Set(linked.flatMap((p) => p.professionIds)).size,
  };
}
