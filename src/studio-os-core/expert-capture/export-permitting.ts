import type { ExpertCaptureSession, KnowledgeStatementType } from './types';
import { buildPermittingSessionSummary } from './profiles/permitting-summary';
import { mdKnowledgeSection, mdList, collectByTypes } from './export-default';

function collectCategories(session: ExpertCaptureSession): string[] {
  const cats = new Set<string>();
  for (const q of session.questions) {
    const answered = session.answers.some((a) => a.questionId === q.id && !a.deleted && !a.skipped);
    if (answered) cats.add(q.category);
  }
  return [...cats];
}

export function buildPermittingExportBundle(session: ExpertCaptureSession): Record<string, string> {
  const summary = session.summary ?? buildPermittingSessionSummary(session);
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

  const workflowTypes: KnowledgeStatementType[] = ['workflow_step', 'workflow', 'submission_rule'];
  const docTypes: KnowledgeStatementType[] = ['required_document'];
  const commTypes: KnowledgeStatementType[] = [
    'communication_style',
    'communication_rule',
    'customer_experience_rule',
  ];

  return {
    EXPERT_PROFILE: `# Expert Profile\n\n- **Name:** ${expert}\n- **Role:** ${role}\n- **Organization:** ${org}\n- **Company:** All In One\n- **Profession:** Permitting Specialist\n- **Session:** ${session.meta.id}\n- **Captured:** ${date}\n\n## Summary\n\n${expert} documented All In One permitting expertise through a Studio Institute Expert Knowledge Capture session. All items await explicit approval before training use.\n`,
    BUSINESS_OVERVIEW: `# Business Overview\n\n${mdKnowledgeSection(session, ['principle', 'best_practice'])}\n\n## Business areas covered\n\n${mdList(summary.businessAreasCovered ?? collectCategories(session))}\n`,
    WORKFLOWS: `# Workflows\n\n${mdKnowledgeSection(session, workflowTypes)}`,
    PERMIT_TYPES: `# Permit Types\n\n${mdKnowledgeSection(session, ['decision_rule', 'principle'])}\n\n## From interview topics\n\n${mdList(collectByTypes(session, ['decision_rule']).slice(0, 20))}\n`,
    MUNICIPALITY_RULES: `# Municipality Rules\n\n${mdKnowledgeSection(session, ['municipality_rule'])}`,
    DECISION_RULES: `# Decision Rules\n\n${mdKnowledgeSection(session, ['decision_rule'])}`,
    DOCUMENT_REQUIREMENTS: `# Document Requirements\n\n${mdKnowledgeSection(session, docTypes)}`,
    QUALITY_CONTROL: `# Quality Control\n\n${mdKnowledgeSection(session, ['quality_control', 'quality_check'])}`,
    CUSTOMER_COMMUNICATION: `# Customer Communication\n\n${mdKnowledgeSection(session, commTypes)}`,
    ESCALATION_RULES: `# Escalation Rules\n\n${mdKnowledgeSection(session, ['escalation_rule'])}`,
    COMMON_FAILURES: `# Common Failures\n\n${mdKnowledgeSection(session, ['common_failure', 'gap'])}`,
    BEST_PRACTICES: `# Best Practices\n\n${mdKnowledgeSection(session, ['best_practice', 'personal_technique', 'principle'])}`,
    EDGE_CASES: `# Edge Cases\n\n${mdKnowledgeSection(session, ['edge_case', 'exception'])}`,
    KNOWLEDGE_GAPS: `# Knowledge Gaps\n\n${mdList(summary.knowledgeGaps)}\n\n## Remaining interview topics\n\n${mdList(summary.remainingTopics ?? [])}\n`,
    SESSION_TRANSCRIPT: `# Session Transcript\n\n${transcript}`,
    SESSION_SUMMARY: `# Session Summary\n\n## Overview\n\n- **Business areas covered:** ${(summary.businessAreasCovered ?? []).length}\n- **Workflow steps captured:** ${summary.workflowSteps.length}\n- **Decision rules:** ${summary.decisionRules.length}\n- **Municipality rules:** ${(summary.municipalityRules ?? []).length}\n- **Exceptions:** ${summary.exceptions.length}\n- **Best practices:** ${(summary.bestPractices ?? []).length}\n- **Approved answers:** ${summary.questionsApproved}\n- **Skipped:** ${summary.questionsSkipped}\n- **Corrected:** ${summary.questionsCorrected}\n- **Deleted:** ${summary.questionsDeleted}\n\n## Business areas\n\n${mdList(summary.businessAreasCovered ?? [])}\n\n## Workflow steps\n\n${mdList(summary.workflowSteps)}\n\n## Decision rules\n\n${mdList(summary.decisionRules)}\n\n## Municipality rules\n\n${mdList(summary.municipalityRules ?? [])}\n\n## Exceptions\n\n${mdList(summary.exceptions)}\n\n## Best practices\n\n${mdList(summary.bestPractices ?? [])}\n\n## Knowledge gaps\n\n${mdList(summary.knowledgeGaps)}\n\n## Follow-up opportunities\n\n${mdList(summary.followUpOpportunities)}\n\n## Remaining topics\n\n${mdList(summary.remainingTopics ?? [])}\n`,
  };
}
