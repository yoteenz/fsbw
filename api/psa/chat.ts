/**
 * POST /api/psa/chat — Personal Slay Assistant (PSA) chat for premium members.
 *
 * v1: FAQ search, product catalog, and site navigation via OpenAI Responses API + server tools.
 * Env: OPENAI_API_KEY (required), optional PSA_OPENAI_MODEL (default gpt-5.4-mini).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { getPsaPremiumProfile } from '../_lib/psaPremiumCheck.js';
import {
  getPsaEngagementLimits,
  isPsaEngagementUnlimited,
} from '../_lib/psaEngagementLimits.js';
import { consumePsaMessage } from '../_lib/psaUsageLimit.js';
import {
  searchPsaFaq,
  searchPsaNavigation,
  searchPsaProducts,
  mapPsaProductForTool,
} from '../_lib/psaKnowledge.js';
import { buildPsaInstructions } from '../_lib/psaInstructions.js';
import { formatPsaVoiceText } from '../_lib/psaVoiceFormat.js';
import { formatPsaSessionContextBlock } from '../_lib/psaSessionContext.js';
import {
  buildCardsFromToolTrace,
  parseQuickRepliesFromReply,
  type PsaToolTraceEntry,
} from '../_lib/psaResponseUi.js';
import { filterPsaActionToolsForProfile } from '../_lib/psaFeatureGates.js';
import {
  executePsaActionTool,
  isPsaActionTool,
  PSA_ACTION_TOOL_DEFINITIONS,
  type PsaClientAction,
  type PsaToolContext,
} from '../_lib/psaTools.js';
import {
  appendPsaMessage,
  isPsaThreadStoreConfigured,
  resolvePsaThreadForChat,
  touchPsaThreadAfterReply,
} from '../_lib/psaThreadStore.js';

export const config = {
  maxDuration: 60,
};

const DEFAULT_MODEL = 'gpt-5.4-mini';

type ChatRequestBody = {
  message?: string;
  previousResponseId?: string | null;
  threadId?: string | null;
  /** When true, start a fresh thread even if threadId was sent. */
  newThread?: boolean;
  /** Client session snapshot (page, cart, orders) — hints only. */
  context?: Record<string, unknown>;
};

type OpenAiToolCall = {
  type?: string;
  call_id?: string;
  name?: string;
  arguments?: string;
};

type OpenAiOutputItem = {
  type?: string;
  call_id?: string;
  name?: string;
  arguments?: string;
  content?: unknown;
};

type OpenAiResponse = {
  id?: string;
  output?: OpenAiOutputItem[];
  output_text?: string;
  error?: { message?: string };
};

const PSA_TOOLS = [
  {
    type: 'function',
    name: 'search_faq',
    description: 'Search Frontal Slayer FAQ for policies, shipping, processing, hair care, installation, maintenance, membership, loyalty, referrals, affiliate, returns.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search terms from the user question.' },
      },
      required: ['query'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'search_products',
    description:
      'Search wig unit catalog (NOIR, BLANCO, SOFT WAVE, BEACH WAVE, SOFT CURL, OCEAN CURL) with starting base USD prices. Use for price comparisons and texture/length questions — pair with FAQ for Build-a-Wig customization.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Texture, unit name, or style keywords.' },
      },
      required: ['query'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'suggest_navigation',
    description: 'Find the best in-app route for shop, bag, orders, booking, concierge, rewards, referrals, affiliate, FAQ, etc.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'What the user wants to do or find.' },
      },
      required: ['query'],
      additionalProperties: false,
    },
    strict: true,
  },
] as const;

function toolsForMember(premium: NonNullable<Awaited<ReturnType<typeof getPsaPremiumProfile>>>) {
  return [...PSA_TOOLS, ...filterPsaActionToolsForProfile(PSA_ACTION_TOOL_DEFINITIONS, premium)];
}

function parseToolArgs(raw: string | undefined): Record<string, unknown> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function executePsaSearchTool(name: string, args: Record<string, unknown>): string {
  const query = typeof args.query === 'string' ? args.query : '';

  switch (name) {
    case 'search_faq': {
      const hits = searchPsaFaq(query, 5);
      return JSON.stringify(
        hits.map((h) => ({ question: h.question, answer: h.answer }))
      );
    }
    case 'search_products': {
      const hits = searchPsaProducts(query, 6);
      return JSON.stringify(hits.map(mapPsaProductForTool));
    }
    case 'suggest_navigation': {
      const hits = searchPsaNavigation(query, 5);
      return JSON.stringify(
        hits.map((l) => ({ label: l.label, path: l.path, description: l.description }))
      );
    }
    default:
      return JSON.stringify({ error: 'Unknown search tool' });
  }
}

function extractFunctionCalls(output: OpenAiOutputItem[] | undefined): OpenAiToolCall[] {
  if (!Array.isArray(output)) return [];
  return output
    .filter((item) => item.type === 'function_call')
    .map((item) => ({
      type: item.type,
      call_id: item.call_id,
      name: item.name,
      arguments: typeof item.arguments === 'string' ? item.arguments : undefined,
    }));
}

function extractOutputText(data: OpenAiResponse): string {
  if (typeof data.output_text === 'string' && data.output_text.trim()) {
    return data.output_text.trim();
  }
  if (!Array.isArray(data.output)) return '';
  const parts: string[] = [];
  for (const item of data.output) {
    if (item.type === 'message' && Array.isArray(item.content)) {
      for (const block of item.content as { type?: string; text?: string }[]) {
        if (block.type === 'output_text' && block.text) parts.push(block.text);
        if (block.type === 'text' && block.text) parts.push(block.text);
      }
    }
  }
  return parts.join('\n').trim();
}

const PSA_EMPTY_REPLY_FALLBACK =
  'Love, I hit a brief glitch pulling that together. Ask me again in a second, or open Build-a-Wig to see live pricing on your unit.';

type PsaChatAiContext = {
  model: string;
  instructions: string;
  tools: ReturnType<typeof toolsForMember>;
};

async function runPsaToolLoop(
  initialResponse: OpenAiResponse,
  ctx: PsaChatAiContext,
  toolCtx: PsaToolContext,
  clientActions: PsaClientAction[],
  toolTrace: PsaToolTraceEntry[]
): Promise<OpenAiResponse> {
  let response = initialResponse;
  let safety = 0;

  while (safety < 6) {
    const calls = extractFunctionCalls(response.output);
    if (calls.length === 0) break;

    const toolOutputs = await Promise.all(
      calls.map(async (call) => {
        const args = parseToolArgs(call.arguments);
        const toolName = call.name || '';
        if (isPsaActionTool(toolName)) {
          const result = await executePsaActionTool(toolName, args, toolCtx);
          if (result.output) toolTrace.push({ name: toolName, output: result.output });
          if (result.clientActions?.length) {
            for (const action of result.clientActions) {
              const dup =
                action.type === 'navigate'
                  ? clientActions.some((a) => a.type === 'navigate' && a.path === action.path)
                  : clientActions.some((a) => a.type === action.type);
              if (!dup) clientActions.push(action);
            }
          }
          return {
            type: 'function_call_output',
            call_id: call.call_id,
            output: result.output,
          };
        }
        const searchOutput = executePsaSearchTool(toolName, args);
        toolTrace.push({ name: toolName, output: searchOutput });
        return {
          type: 'function_call_output',
          call_id: call.call_id,
          output: searchOutput,
        };
      })
    );

    response = await callOpenAiResponses({
      model: ctx.model,
      instructions: ctx.instructions,
      tools: ctx.tools,
      previous_response_id: response.id,
      input: toolOutputs,
      store: true,
    });
    safety += 1;
  }

  return response;
}

async function resolveAssistantReply(
  response: OpenAiResponse,
  ctx: PsaChatAiContext
): Promise<{ reply: string; response: OpenAiResponse }> {
  let text = extractOutputText(response);
  if (text) return { reply: text, response };

  console.warn('[psa/chat] empty model output after tools, nudging for text');

  const nudge = await callOpenAiResponses({
    model: ctx.model,
    instructions: ctx.instructions,
    tools: ctx.tools,
    previous_response_id: response.id,
    input:
      'Reply to the member now in plain founder voice. Answer their last question directly. Do not call tools unless you still lack catalog or policy facts.',
    store: true,
  });

  text = extractOutputText(nudge);
  if (text) return { reply: text, response: nudge };

  console.warn('[psa/chat] empty output after nudge, using fallback copy');
  return { reply: PSA_EMPTY_REPLY_FALLBACK, response: nudge };
}

async function callOpenAiResponses(body: Record<string, unknown>): Promise<OpenAiResponse> {
  const apiKey = (process.env.OPENAI_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY is not configured on the server. Add it in Vercel → Settings → Environment Variables (Production + Preview), then Redeploy. Local .env.local only applies when running vercel dev — not when the site calls fsbw.vercel.app.'
    );
  }

  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as OpenAiResponse & { error?: { message?: string } };
  if (!res.ok) {
    const msg = data.error?.message || `OpenAI API error (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized', code: 'SIGN_IN_REQUIRED' });
  }

  const premium = await getPsaPremiumProfile(user.id, user.accessToken, user.email);
  if (!premium?.isPremium) {
    return res.status(403).json({
      error: 'Premium membership required for PSA.',
      code: 'PREMIUM_REQUIRED',
    });
  }

  const engagementLimits = getPsaEngagementLimits(premium);

  if (!isPsaEngagementUnlimited(user.email)) {
    const consumed = await consumePsaMessage(user.id, engagementLimits);
    if (!consumed.ok) {
      const limitLabel =
        consumed.reason === 'daily'
          ? `Daily PSA limit reached (${consumed.usage.dayLimit} messages per day on ${engagementLimits.tierLabel}).`
          : `Monthly PSA limit reached (${consumed.usage.monthLimit} messages per month on ${engagementLimits.tierLabel}).`;
      res.setHeader('Retry-After', String(consumed.retryAfterSec ?? 3600));
      return res.status(429).json({
        error: `${limitLabel} Resets automatically. Upgrade your plan for a higher limit, or use Concierge for hands-on help.`,
        code: 'PSA_LIMIT_REACHED',
        reason: consumed.reason,
        usage: consumed.usage,
        retryAfterSec: consumed.retryAfterSec,
      });
    }
  }

  const body = (req.body ?? {}) as ChatRequestBody;
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message || message.length > 4000) {
    return res.status(400).json({ error: 'Message required (max 4000 characters).' });
  }

  const model = process.env.PSA_OPENAI_MODEL?.trim() || DEFAULT_MODEL;
  const previousResponseId =
    typeof body.previousResponseId === 'string' && body.previousResponseId.trim()
      ? body.previousResponseId.trim()
      : undefined;
  const requestThreadId =
    typeof body.threadId === 'string' && body.threadId.trim() ? body.threadId.trim() : undefined;
  const createNewThread = body.newThread === true;

  try {
    const toolCtx: PsaToolContext = {
      userId: user.id,
      email: user.email,
      accessToken: user.accessToken,
      premium,
    };

    const clientActions: PsaClientAction[] = [];
    const toolTrace: PsaToolTraceEntry[] = [];

    let activeThreadId: string | null = null;
    let chainPreviousResponseId = previousResponseId;

    if (isPsaThreadStoreConfigured()) {
      try {
        const thread = await resolvePsaThreadForChat({
          userId: user.id,
          threadId: requestThreadId,
          createNew: createNewThread,
        });
        activeThreadId = thread.id;
        if (!createNewThread && thread.last_openai_response_id) {
          chainPreviousResponseId = thread.last_openai_response_id;
        }
        await appendPsaMessage({
          threadId: thread.id,
          role: 'user',
          content: message,
        });
      } catch (persistErr) {
        console.error('[psa/chat] thread persist (user)', persistErr);
      }
    }

    const sessionBlock = formatPsaSessionContextBlock(body.context);
    const aiCtx: PsaChatAiContext = {
      model,
      instructions: buildPsaInstructions(premium, sessionBlock),
      tools: toolsForMember(premium),
    };

    let response = await callOpenAiResponses({
      model: aiCtx.model,
      instructions: aiCtx.instructions,
      input: message,
      previous_response_id: chainPreviousResponseId,
      reasoning: { effort: 'none' },
      tools: aiCtx.tools,
      store: true,
    });

    response = await runPsaToolLoop(response, aiCtx, toolCtx, clientActions, toolTrace);

    const { reply, response: finalResponse } = await resolveAssistantReply(response, aiCtx);

    const formattedReply = formatPsaVoiceText(reply);
    const { reply: displayReply, quickReplies } = parseQuickRepliesFromReply(formattedReply);
    const cards = buildCardsFromToolTrace(toolTrace);
    const responseIdOut = finalResponse.id ?? response.id ?? null;

    if (activeThreadId && isPsaThreadStoreConfigured()) {
      try {
        await appendPsaMessage({
          threadId: activeThreadId,
          role: 'assistant',
          content: displayReply,
          openaiResponseId: responseIdOut,
        });
        await touchPsaThreadAfterReply({
          threadId: activeThreadId,
          lastOpenaiResponseId: responseIdOut,
          titleFromFirstUserMessage: message,
        });
      } catch (persistErr) {
        console.error('[psa/chat] thread persist (assistant)', persistErr);
      }
    }

    return res.status(200).json({
      reply: displayReply,
      quickReplies: quickReplies.length ? quickReplies : undefined,
      cards: cards.length ? cards : undefined,
      responseId: responseIdOut,
      threadId: activeThreadId,
      model,
      clientActions: clientActions.length ? clientActions : undefined,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'PSA chat failed';
    console.error('[psa/chat]', msg);
    return res.status(500).json({ error: msg });
  }
}
