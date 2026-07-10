type InterviewAiRequest =
  | { action: 'greet'; expertName: string; expertRole: string }
  | { action: 'analyze_answer'; question: string; transcript: string; expertRole: string }
  | { action: 'clarify'; question: string; transcript: string; misunderstanding: string; expertCorrection: string };

type InterviewAiResponse = {
  text: string;
  understanding?: string;
  knowledgeItems?: Array<Record<string, unknown>>;
  followUpQuestion?: string | null;
  needsFollowUp?: boolean;
};

const MODEL = process.env.EXPERT_CAPTURE_OPENAI_MODEL?.trim() || process.env.PSA_OPENAI_MODEL?.trim() || 'gpt-4.1-mini';

async function openAiJson(system: string, user: string): Promise<string> {
  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) throw new Error('OPENAI_API_KEY not configured');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content ?? '{}';
}

const SYSTEM = `You are a professional apprentice interviewing a master expert for Studio Institute Expert Capture.
Rules:
- Ask ONE question at a time in follow-ups only when requested.
- The human expert is always the authority.
- Never dump questionnaires.
- Explore WHY when answers use hedging words (always, usually, depends, unless, I check, I verify, etc.).
- Return valid JSON only.`;

export async function runExpertCaptureAi(request: InterviewAiRequest): Promise<InterviewAiResponse> {
  switch (request.action) {
    case 'greet': {
      const raw = await openAiJson(
        SYSTEM,
        JSON.stringify({
          task: 'greet_expert',
          expertName: request.expertName,
          expertRole: request.expertRole,
          output: { text: 'warm professional greeting as apprentice, one paragraph' },
        })
      );
      const parsed = JSON.parse(raw) as { text?: string };
      return { text: parsed.text ?? `Hello ${request.expertName}. I'm here to learn from you.` };
    }
    case 'analyze_answer': {
      const raw = await openAiJson(
        SYSTEM,
        JSON.stringify({
          task: 'analyze_answer',
          question: request.question,
          transcript: request.transcript,
          expertRole: request.expertRole,
          output: {
            understanding: 'summary of what apprentice understood',
            knowledgeItems: [
              {
                statement: 'string',
                type: 'workflow_step|decision_rule|quality_control|edge_case|communication_style|exception|principle|gap',
                condition: 'string|null',
                action: 'string|null',
                purpose: 'string|null',
                confidence: 0.0,
                needsReview: false,
              },
            ],
            followUpQuestion: 'string|null',
            needsFollowUp: false,
          },
        })
      );
      const parsed = JSON.parse(raw) as InterviewAiResponse & { output?: InterviewAiResponse };
      const out = parsed.output ?? parsed;
      return {
        text: out.understanding ?? out.text ?? '',
        understanding: out.understanding ?? out.text ?? '',
        knowledgeItems: out.knowledgeItems?.map((k) => ({
          ...k,
          sourceTimestampMs: Date.now(),
          videoTimestampMs: null,
          conversationReference: request.question,
        })),
        followUpQuestion: out.followUpQuestion ?? null,
        needsFollowUp: out.needsFollowUp ?? Boolean(out.followUpQuestion),
      };
    }
    case 'clarify': {
      const raw = await openAiJson(
        SYSTEM,
        JSON.stringify({
          task: 'clarify_misunderstanding',
          question: request.question,
          transcript: request.transcript,
          misunderstanding: request.misunderstanding,
          expertCorrection: request.expertCorrection,
          output: { understanding: 'corrected summary', knowledgeItems: [] },
        })
      );
      const parsed = JSON.parse(raw) as { understanding?: string; output?: { understanding?: string } };
      const understanding = parsed.output?.understanding ?? parsed.understanding ?? request.expertCorrection;
      return { text: understanding, understanding, followUpQuestion: null, needsFollowUp: false };
    }
    default:
      return { text: '' };
  }
}
