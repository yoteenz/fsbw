import { detectFollowUpNeeded, buildLocalFollowUpQuestion } from './follow-up-detector';
import type { InterviewAiRequest, InterviewAiResponse, StructuredKnowledgeItem, KnowledgeStatementType } from './types';

function extractKnowledgeLocally(
  transcript: string,
  understanding: string,
  question: string,
  industryContext?: string
): Omit<StructuredKnowledgeItem, 'id' | 'answerId' | 'status'>[] {
  const text = `${transcript}\n${understanding}`.trim();
  if (!text) return [];

  const isPermitting = industryContext?.includes('permitting');
  const items: Omit<StructuredKnowledgeItem, 'id' | 'answerId' | 'status'>[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.length > 12);

  for (const sentence of sentences.slice(0, 4)) {
    let type: KnowledgeStatementType = 'principle';
    const lower = sentence.toLowerCase();
    if (isPermitting) {
      if (lower.includes('city') || lower.includes('municipality') || lower.includes('jurisdiction')) {
        type = 'municipality_rule';
      } else if (lower.includes('document') || lower.includes('plan') || lower.includes('drawing')) {
        type = 'required_document';
      } else if (lower.includes('inspect')) {
        type = 'inspection_rule';
      } else if (lower.includes('submit') || lower.includes('filing')) {
        type = 'submission_rule';
      } else if (lower.includes('escalat') || lower.includes('manager')) {
        type = 'escalation_rule';
      } else if (lower.includes('customer') || lower.includes('client') || lower.includes('homeowner')) {
        type = 'customer_experience_rule';
      } else if (lower.includes('fee') || lower.includes('cost') || lower.includes('price')) {
        type = 'time_estimate';
      } else if (lower.includes('mistake') || lower.includes('fail') || lower.includes('delay')) {
        type = 'common_failure';
      } else if (lower.includes('never') || lower.includes('always')) {
        type = 'best_practice';
      }
    }
    if (type === 'principle') {
      if (lower.includes('always check') || lower.includes('verify') || lower.includes('quality')) {
        type = 'quality_control';
      } else if (lower.includes('if ') || lower.includes('when ') || lower.includes('unless')) {
        type = 'decision_rule';
      } else if (lower.includes('step') || lower.includes('first') || lower.includes('then')) {
        type = 'workflow_step';
      } else if (lower.includes('except') || lower.includes('edge')) {
        type = 'edge_case';
      } else if (lower.includes('communicate') || lower.includes('tell') || lower.includes('explain')) {
        type = 'communication_style';
      }
    }

    items.push({
      statement: sentence.trim(),
      type,
      condition: type === 'decision_rule' || type === 'municipality_rule' ? 'Context-dependent' : null,
      action: sentence.trim(),
      purpose: `Captured from: ${question.slice(0, 80)}`,
      confidence: detectFollowUpNeeded(sentence) ? 0.65 : 0.82,
      needsReview: detectFollowUpNeeded(sentence),
      sourceTimestampMs: Date.now(),
      videoTimestampMs: null,
      conversationReference: question,
    });
  }

  return items;
}

function localAnalyzeAnswer(
  question: string,
  transcript: string,
  expertRole: string,
  industryContext?: string
): InterviewAiResponse {
  const trimmed = transcript.trim();
  const understanding = trimmed
    ? `As ${expertRole}, you explained: ${trimmed.slice(0, 280)}${trimmed.length > 280 ? '…' : ''}`
    : 'No speech was detected in this answer.';
  const knowledgeItems = extractKnowledgeLocally(trimmed, understanding, question, industryContext);
  const followUp = buildLocalFollowUpQuestion(trimmed, question);
  return {
    text: understanding,
    understanding,
    knowledgeItems,
    followUpQuestion: followUp,
    needsFollowUp: Boolean(followUp),
  };
}

function localGreet(expertName: string, expertRole: string, industryContext?: string): InterviewAiResponse {
  const permitting = industryContext?.includes('permitting');
  const text = permitting
    ? `Hello ${expertName}. I'm your apprentice today — here to learn how All In One handles permitting directly from you. There are no long forms; we'll take this one question at a time about your workflows, municipalities, and professional judgment. You stay in charge. When you're ready, we'll begin.`
    : `Hello ${expertName}. I'm your apprentice today — here to learn ${expertRole} directly from you. There are no long forms; we'll take this one question at a time, and you stay in charge. When you're ready, I'll ask the first question.`;
  return { text };
}

function localClarify(expertCorrection: string, question: string): InterviewAiResponse {
  return {
    text: 'Thank you for correcting me. Here is my updated understanding.',
    understanding: expertCorrection.trim(),
    knowledgeItems: extractKnowledgeLocally(expertCorrection, expertCorrection, question),
    followUpQuestion: null,
    needsFollowUp: false,
  };
}

export async function callInterviewAi(request: InterviewAiRequest): Promise<InterviewAiResponse> {
  try {
    const base = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') ?? '';
    const res = await fetch(`${base}/api/expert-capture/interview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (res.ok) {
      return (await res.json()) as InterviewAiResponse;
    }
  } catch {
    /* fallback below */
  }

  switch (request.action) {
    case 'greet':
      return localGreet(request.expertName, request.expertRole, request.industryContext);
    case 'analyze_answer':
      return localAnalyzeAnswer(
        request.question,
        request.transcript,
        request.expertRole,
        request.industryContext
      );
    case 'follow_up':
      return {
        text: request.understanding,
        understanding: request.understanding,
        followUpQuestion: buildLocalFollowUpQuestion(request.transcript, request.question),
        needsFollowUp: true,
      };
    case 'clarify':
      return localClarify(request.expertCorrection, request.question);
    default:
      return { text: '' };
  }
}

export { extractKnowledgeLocally };
