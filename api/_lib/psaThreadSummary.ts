/**
 * Deterministic thread summary for long PSA chats (no extra OpenAI call).
 */

export const PSA_LONG_THREAD_MESSAGE_THRESHOLD = 20;

export type PsaSummaryMessage = {
  role: string;
  content: string;
};

export function buildPsaThreadSummaryFromMessages(messages: PsaSummaryMessage[]): string {
  if (messages.length < PSA_LONG_THREAD_MESSAGE_THRESHOLD) return '';

  const lines: string[] = ['Conversation so far (older turns summarized):'];

  const firstUser = messages.find((m) => m.role === 'user');
  if (firstUser?.content?.trim()) {
    lines.push(`- Opening question: ${truncate(firstUser.content, 160)}`);
  }

  const userTopics = messages
    .filter((m) => m.role === 'user')
    .slice(1, 6)
    .map((m) => truncate(m.content, 80));
  if (userTopics.length) {
    lines.push(`- Earlier member topics: ${userTopics.join(' | ')}`);
  }

  lines.push('- Recent turns:');
  for (const m of messages.slice(-10)) {
    const label = m.role === 'user' ? 'Member' : m.role === 'assistant' ? 'PSA' : 'System';
    lines.push(`  ${label}: ${truncate(m.content, 180)}`);
  }

  return lines.join('\n').slice(0, 2400);
}

function truncate(text: string, max: number): string {
  const t = (text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function formatPsaThreadSummaryBlock(summary: string | null | undefined): string {
  const s = (summary || '').trim();
  if (!s) return '';
  return `\n## Prior conversation summary (same thread — continue naturally, do not re-introduce yourself)\n${s}\n`;
}
