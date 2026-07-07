import type { NdxbookPage } from '../types';
import type {
  FounderNote,
  FounderNoteRevision,
  FounderNoteRevisionField,
  ProductionConciergeId,
} from './types';

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function pickField(concierge: ProductionConciergeId, body: string): FounderNoteRevisionField {
  const text = body.toLowerCase();
  if (concierge === 'visual-design' || text.includes('visual') || text.includes('thumbnail')) return 'visual';
  if (text.includes('hook')) return 'hook';
  if (text.includes('caption')) return 'caption';
  if (concierge === 'editorial' || text.includes('script') || text.includes('rewrite')) return 'script';
  return 'general';
}

function suggestHook(page: NdxbookPage | null, body: string): { original: string; suggested: string; reason: string } {
  const original = page?.hook ?? 'Why paying off debt can still affect your credit score.';
  if (/authoritative|generic/i.test(body)) {
    return {
      original,
      suggested:
        'Your score can dip after payoff — here is the utilization lag credit bureaus still report.',
      reason: 'Strengthen authority with a precise mechanism, not a vague warning.',
    };
  }
  return {
    original,
    suggested: 'Paid off a card and your score dipped? Utilization updates slowly — that is normal.',
    reason: 'Editorial Concierge tightened hook clarity for NDXBook calm voice.',
  };
}

function suggestScript(page: NdxbookPage | null, body: string): { original: string; suggested: string; reason: string } {
  const original = page?.script?.slice(0, 280) ?? 'You paid off a card. Your score dipped…';
  const suffix = page?.script && page.script.length > 280 ? '…' : '';
  if (/alarmist|panic/i.test(body)) {
    return {
      original: original + suffix,
      suggested:
        'You paid off a card and saw a dip — that is common. Utilization can lag a billing cycle. Closed accounts can shorten average age. Plan the timing; do not panic.',
      reason: 'Reduce alarmist framing while preserving educational facts.',
    };
  }
  return {
    original: original + suffix,
    suggested:
      'Payoff can move utilization faster than bureaus update — and closing a card can shift average age. Here is how to read the dip without overreacting.',
    reason: 'Editorial Concierge refined script flow for authoritative calm tone.',
  };
}

function suggestCaption(page: NdxbookPage | null): { original: string; suggested: string; reason: string } {
  const original = page?.caption?.slice(0, 200) ?? 'Credit score update after debt payoff…';
  return {
    original: original + (page?.caption && page.caption.length > 200 ? '…' : ''),
    suggested:
      'Paid off debt and your score dipped? Utilization reporting lags — not a mistake. Save this before your next payoff. #ndxbook #creditscore',
    reason: 'Social-friendly caption with less alarm, clearer CTA.',
  };
}

function suggestVisual(): { original: string; suggested: string; reason: string } {
  return {
    original: 'NDXBook indigo frame · educational square · pilot thumbnail v1',
    suggested: 'Indigo frame · tighter type hierarchy · less text on thumbnail · carousel-safe margins',
    reason: 'Visual Design Concierge aligned frame with NDXBook Creative DNA.',
  };
}

export function generateRevisionProposal(
  note: FounderNote,
  page: NdxbookPage | null
): FounderNoteRevision {
  const field = pickField(note.assignedConcierge, note.body);
  let pack: { original: string; suggested: string; reason: string };

  switch (field) {
    case 'hook':
      pack = suggestHook(page, note.body);
      break;
    case 'script':
      pack = suggestScript(page, note.body);
      break;
    case 'caption':
      pack = suggestCaption(page);
      break;
    case 'visual':
      pack = suggestVisual();
      break;
    default:
      pack = {
        original: note.body,
        suggested: `Concierge response: address "${note.body.slice(0, 80)}…" with NDXBook voice standards.`,
        reason: `${note.assignedConcierge} triage — general creative direction revision.`,
      };
  }

  return {
    id: uid('rev'),
    noteId: note.id,
    createdAt: new Date().toISOString(),
    conciergeId: note.assignedConcierge,
    reason: pack.reason,
    field,
    originalVersion: pack.original,
    suggestedVersion: pack.suggested,
    status: 'pending',
  };
}
