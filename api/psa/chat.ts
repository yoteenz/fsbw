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
} from '../_lib/psaKnowledge.js';
import { buildPsaInstructions } from '../_lib/psaInstructions.js';
import { formatPsaVoiceText } from '../_lib/psaVoiceFormat.js';
import { filterPsaActionToolsForProfile } from '../_lib/psaFeatureGates.js';
import {
  executePsaActionTool,
  isPsaActionTool,
  PSA_ACTION_TOOL_DEFINITIONS,
  type PsaClientAction,
  type PsaToolContext,
} from '../_lib/psaTools.js';

export const config = {
  maxDuration: 60,
};

const DEFAULT_MODEL = 'gpt-5.4-mini';

type ChatRequestBody = {
  message?: string;
  previousResponseId?: string | null;
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
    description: 'Search wig unit catalog and texture families (NOIR, BLANCO, SOFT WAVE, BEACH WAVE, SOFT CURL, OCEAN CURL). Use for length/texture/density questions — pair with FAQ for Build-a-Wig guidance.',
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
      return JSON.stringify(
        hits.map((p) => ({
          name: p.name,
          texture: p.texture,
          productPage: p.path,
          buildAWig: p.buildAWigPath,
          summary: p.summary,
        }))
      );
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

  try {
    const toolCtx: PsaToolContext = {
      userId: user.id,
      email: user.email,
      accessToken: user.accessToken,
      premium,
    };

    const clientActions: PsaClientAction[] = [];

    let response = await callOpenAiResponses({
      model,
      instructions: buildPsaInstructions(premium),
      input: message,
      previous_response_id: previousResponseId,
      reasoning: { effort: 'none' },
      tools: toolsForMember(premium),
      store: true,
    });

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
          return {
            type: 'function_call_output',
            call_id: call.call_id,
            output: executePsaSearchTool(toolName, args),
          };
        })
      );

      response = await callOpenAiResponses({
        model,
        previous_response_id: response.id,
        input: toolOutputs,
        store: true,
      });
      safety += 1;
    }

    const reply = extractOutputText(response);
    if (!reply) {
      return res.status(502).json({ error: 'PSA returned an empty response. Please try again.' });
    }

    return res.status(200).json({
      reply: formatPsaVoiceText(reply),
      responseId: response.id ?? null,
      model,
      clientActions: clientActions.length ? clientActions : undefined,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'PSA chat failed';
    console.error('[psa/chat]', msg);
    return res.status(500).json({ error: msg });
  }
}
