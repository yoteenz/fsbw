import {
  CONSULT_HAIR_COLORS,
  normalizeConsultHairColor,
  type ConsultHairColorName,
} from './consultStyleAnalysisCatalog.js';

const DEFAULT_MODEL = (process.env.PSA_OPENAI_MODEL || 'gpt-5.4-mini').trim();

const COLOR_LIST = Object.keys(CONSULT_HAIR_COLORS).join(', ');

function parseColorJson(raw: string | null): ConsultHairColorName | null {
  if (!raw) return null;
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]) as { hairColor?: string };
    return normalizeConsultHairColor(parsed.hairColor ?? '');
  } catch {
    return null;
  }
}

/** Closest BAW catalog color for hair in the inspo reference image. */
export async function detectInspoHairColor(inspoDataUrl: string): Promise<ConsultHairColorName> {
  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) return 'JET BLACK';

  try {
    const res = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        instructions: [
          'You classify wig/hair color in a reference photo.',
          `Return JSON only: {"hairColor":"<ONE OF: ${COLOR_LIST}>"}`,
          'Pick the single closest BAW catalog name for the dominant hair color in the image.',
          'Blonde family: PLATINUM = icy/silver/white blonde, GOLDEN = warm/yellow blonde, ASH = cool beige/ash blonde.',
          'Fashion colors: SANGRIA = burgundy/wine, CHERRY = vivid red, RASPBERRY = pink-magenta, PLUM = purple, COBALT = blue, TEAL = teal/aqua, SLIME = neon green, CITRINE = neon yellow.',
          'If unsure between black shades, use OFF BLACK for natural black hair and JET BLACK only for very deep black.',
        ].join(' '),
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: 'What is the dominant hair color? Return JSON only.',
              },
              {
                type: 'input_image',
                image_url: inspoDataUrl,
                detail: 'high',
              },
            ],
          },
        ],
      }),
    });

    if (!res.ok) return 'JET BLACK';

    const data = (await res.json()) as {
      output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>;
    };
    const texts: string[] = [];
    for (const block of data.output ?? []) {
      if (block.type !== 'message') continue;
      for (const part of block.content ?? []) {
        if (part.type === 'output_text' && part.text) texts.push(part.text);
      }
    }
    return parseColorJson(texts.join('\n').trim()) ?? 'JET BLACK';
  } catch {
    return 'JET BLACK';
  }
}
