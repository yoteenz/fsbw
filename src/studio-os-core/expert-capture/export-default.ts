import type { ExpertCaptureSession } from './types';
import { buildSessionSummary } from './knowledge-extraction';

function mdList(items: string[]): string {
  if (!items.length) return '_None recorded._\n';
  return items.map((i) => `- ${i}`).join('\n') + '\n';
}

function mdKnowledgeSection(session: ExpertCaptureSession, types: string[]): string {
  const lines: string[] = [];
  for (const answer of session.answers.filter((a) => !a.deleted)) {
    for (const item of answer.knowledgeItems.filter((k) => types.includes(k.type) && k.status !== 'deleted')) {
      lines.push(`- **${item.type}** — ${item.statement}`);
      if (item.condition) lines.push(`  - Condition: ${item.condition}`);
      if (item.action) lines.push(`  - Action: ${item.action}`);
    }
  }
  return lines.length ? lines.join('\n') + '\n' : '_None recorded._\n';
}

function collectByTypes(session: ExpertCaptureSession, types: string[]): string[] {
  return session.answers
    .filter((a) => !a.deleted)
    .flatMap((a) =>
      a.knowledgeItems.filter((k) => types.includes(k.type) && k.status !== 'deleted').map((k) => k.statement)
    );
}

export function buildDefaultExportBundle(session: ExpertCaptureSession): Record<string, string> {
  const summary = session.summary ?? buildSessionSummary(session);
  const expert = session.meta.expertName;
  const role = session.meta.expertRole;
  const org = session.meta.organizationLabel;
  const date = new Date(session.meta.updatedAt).toISOString();

  const transcript = session.answers
    .filter((a) => !a.deleted)
    .map((a) => {
      const text = a.correctedTranscript ?? a.transcript;
      return `## ${a.questionText}\n\n${text || '_(empty)_'}\n\n**AI understanding:** ${a.aiUnderstanding ?? '—'}\n`;
    })
    .join('\n---\n\n');

  return {
    EXPERT_PROFILE: `# Expert Profile\n\n- **Name:** ${expert}\n- **Role:** ${role}\n- **Organization:** ${org}\n- **Session:** ${session.meta.id}\n- **Captured:** ${date}\n\n## Summary\n\n${expert} shared professional knowledge through a guided Expert Capture interview. All items below await explicit approval before training use.\n`,
    WORKFLOW: `# Workflow\n\n${mdKnowledgeSection(session, ['workflow_step', 'workflow'])}`,
    DECISION_RULES: `# Decision Rules\n\n${mdKnowledgeSection(session, ['decision_rule'])}`,
    QUALITY_CONTROL: `# Quality Control\n\n${mdKnowledgeSection(session, ['quality_control', 'quality_check'])}`,
    EDGE_CASES: `# Edge Cases\n\n${mdKnowledgeSection(session, ['edge_case', 'exception'])}`,
    COMMUNICATION_STYLE: `# Communication Style\n\n${mdKnowledgeSection(session, ['communication_style', 'communication_rule', 'customer_experience_rule'])}`,
    KNOWLEDGE_GAPS: `# Knowledge Gaps\n\n${mdList(summary.knowledgeGaps)}`,
    SESSION_TRANSCRIPT: `# Session Transcript\n\n${transcript}`,
    SESSION_SUMMARY: `# Session Summary\n\n- **Topics covered:** ${summary.topicsCovered.length}\n- **Approved answers:** ${summary.questionsApproved}\n- **Skipped:** ${summary.questionsSkipped}\n- **Deleted:** ${summary.questionsDeleted}\n- **Corrected:** ${summary.questionsCorrected}\n\n## Topics\n\n${mdList(summary.topicsCovered)}\n\n## Follow-up opportunities\n\n${mdList(summary.followUpOpportunities)}\n`,
  };
}

export { mdList, mdKnowledgeSection, collectByTypes };
