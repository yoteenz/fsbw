import { detectFollowUpNeeded, buildLocalFollowUpQuestion } from './follow-up-detector';
import type { InterviewAiRequest, InterviewAiResponse, StructuredKnowledgeItem } from './types';
import type { KnowledgeStatementType } from './types';

function extractKnowledgeLocally(
  transcript: string,
  understanding: string,
  question: string
): Omit<StructuredKnowledgeItem, 'id' | 'answerId' | 'status'>[] {
  const text = `${transcript}\n${understanding}`.trim();
  if (!text) return [];

  const items: Omit<StructuredKnowledgeItem, 'id' | 'answerId' | 'status'>[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.length > 12);

  for (const sentence of sentences.slice(0, 4)) {
    let type: KnowledgeStatementType = 'principle';
    const lower = sentence.toLowerCase();
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

    items.push({
      statement: sentence.trim(),
      type,
      condition: type === 'decision_rule' ? 'Context-dependent' : null,
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

function localAnalyzeAnswer(question: string, transcript: string, expertRole: string): InterviewAiResponse {
  const trimmed = transcript.trim();
  const understanding = trimmed
    ? `As ${expertRole}, you explained: ${trimmed.slice(0, 280)}${trimmed.length > 280 ? '…' : ''}`
    : 'No speech was detected in this answer.';
  const knowledgeItems = extractKnowledgeLocally(trimmed, understanding, question);
  const followUp = buildLocalFollowUpQuestion(trimmed, question);
  return {
    text: understanding,
    understanding,
    knowledgeItems,
    followUpQuestion: followUp,
    needsFollowUp: Boolean(followUp),
  };
}

function localGreet(expertName: string, expertRole: string): InterviewAiResponse {
  return {
    text: `Hello ${expertName}. I'm your apprentice today — here to learn ${expertRole} directly from you. There are no long forms; we'll take this one question at a time, and you stay in charge. When you're ready, I'll ask the first question.`,
  };
}

function localClarify(expertCorrection: string): InterviewAiResponse {
  return {
    text: 'Thank you for correcting me. Here is my updated understanding.',
    understanding: expertCorrection.trim(),
    knowledgeItems: extractKnowledgeLocally(expertCorrection, expertCorrection, 'Clarification'),
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
      return localGreet(request.expertName, request.expertRole);
    case 'analyze_answer':
      return localAnalyzeAnswer(request.question, request.transcript, request.expertRole);
    case 'follow_up':
      return {
        text: request.understanding,
        understanding: request.understanding,
        followUpQuestion: buildLocalFollowUpQuestion(request.transcript, request.question),
        needsFollowUp: true,
      };
    case 'clarify':
      return localClarify(request.expertCorrection);
    default:
      return { text: '' };
  }
}

export { extractKnowledgeLocally };
