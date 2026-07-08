/** Director Feedback™ — natural language → generation instructions. */

type FeedbackRule = {
  pattern: RegExp;
  instruction: string;
};

const DIRECTOR_FEEDBACK_RULES: FeedbackRule[] = [
  { pattern: /\bwarmer\b/i, instruction: 'Warmer color temperature and golden ambient tones throughout.' },
  { pattern: /\bcooler\b/i, instruction: 'Cooler color temperature with subtle blue-neutral ambient fill.' },
  { pattern: /\bbrighter\b/i, instruction: 'Increase overall luminance and highlight clarity.' },
  { pattern: /\bdarker\b/i, instruction: 'Reduce overall luminance; preserve readable hero accents only.' },
  { pattern: /\bless marble\b/i, instruction: 'Reduce marble surfaces; favor walnut, plaster, and editorial fabric.' },
  { pattern: /\bmore marble\b/i, instruction: 'Increase polished marble presence with restrained luxury.' },
  { pattern: /\bmore futuristic\b/i, instruction: 'Introduce subtle futuristic architectural language without SaaS UI.' },
  { pattern: /\bincrease luxury\b/i, instruction: 'Elevate material richness, editorial spacing, and premium finish quality.' },
  { pattern: /\breduce clutter\b/i, instruction: 'Simplify composition; fewer props; stronger negative space.' },
  { pattern: /\bmore clutter\b/i, instruction: 'Add tasteful lived-in creative studio density without chaos.' },
  { pattern: /\bmove the orb\b/i, instruction: 'Reposition Studio Orb to a more prominent central command focal point.' },
  { pattern: /\bfrontal slayer\b/i, instruction: 'Apply Frontal Slayer brand DNA: editorial luxury, confident red accent discipline.' },
  { pattern: /\btoo corporate\b/i, instruction: 'Reduce corporate office cues; emphasize atelier, gallery, and creative studio.' },
  { pattern: /\btoo much like a website\b|\blooks too much like a website\b/i, instruction: 'Remove all UI/dashboard/card-grid language; pure spatial environment only.' },
  { pattern: /\bmore editorial\b/i, instruction: 'Strengthen editorial photography direction and gallery proportions.' },
  { pattern: /\bmore architectural\b/i, instruction: 'Emphasize structural clarity, ceiling height, and material honesty.' },
  { pattern: /\bmore glass\b/i, instruction: 'Increase glass surfaces with slim steel frames and soft exterior atmosphere.' },
  { pattern: /\bless glass\b/i, instruction: 'Reduce glass; favor stone, plaster, and warm solid surfaces.' },
];

export function parseDirectorFeedback(feedback: string): string[] {
  const trimmed = feedback.trim();
  if (!trimmed) return [];

  const matched = DIRECTOR_FEEDBACK_RULES.filter((rule) => rule.pattern.test(trimmed)).map(
    (rule) => rule.instruction
  );

  if (matched.length > 0) return matched;

  return [`Creative Director note: ${trimmed}`];
}

export function applyDirectorFeedbackToPrompt(basePrompt: string, feedback: string): string {
  const instructions = parseDirectorFeedback(feedback);
  if (instructions.length === 0) return basePrompt;
  return `${basePrompt} DIRECTOR FEEDBACK: ${instructions.join(' ')}`;
}
