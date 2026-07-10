import { FOLLOW_UP_TRIGGERS } from './constants';

export function detectFollowUpNeeded(transcript: string): boolean {
  const lower = transcript.toLowerCase();
  return FOLLOW_UP_TRIGGERS.some((trigger) => lower.includes(trigger));
}

export function buildLocalFollowUpQuestion(transcript: string, question: string): string | null {
  if (!detectFollowUpNeeded(transcript)) return null;
  const lower = transcript.toLowerCase();
  if (lower.includes('depends')) {
    return 'You mentioned it depends — what factors determine which path you take?';
  }
  if (lower.includes('unless')) {
    return 'You said "unless" — can you walk me through that exception and why it matters?';
  }
  if (lower.includes('i check') || lower.includes('i verify') || lower.includes('i review')) {
    return 'Tell me more about that check — what exactly are you looking for, and why?';
  }
  if (lower.includes('always') || lower.includes('never') || lower.includes('usually')) {
    return 'Help me understand the reasoning behind that — why do you do it that way?';
  }
  return `You mentioned something important in your answer to "${question.slice(0, 60)}…" — can you explain the why behind that?`;
}
