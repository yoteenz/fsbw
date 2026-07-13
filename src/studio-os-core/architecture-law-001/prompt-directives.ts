import {
  AI_ALLOWED_ENVIRONMENT_CATEGORIES,
  AI_FORBIDDEN_PRODUCTION_UI_CATEGORIES,
  ARCHITECTURE_LAW_001_VERSION,
  DISPLAY_PLACEHOLDER_TREATMENTS,
} from './contract';

export const ARCHITECTURE_LAW_PROMPT_DIRECTIVE_VERSION = 'architecture-law-prompt.v1' as const;

/** Positive prompt block — AI builds places, not interfaces. */
export function buildArchitectureLawPositiveDirective(): string {
  return [
    `STUDIO WORLD ARCHITECTURE LAW #001 (${ARCHITECTURE_LAW_001_VERSION}): AI builds places. Studio World builds interfaces.`,
    `GENERATE: ${AI_ALLOWED_ENVIRONMENT_CATEGORIES.slice(0, 12).join(', ')}, integrated Command Dock™ shell, Workbench™ console furniture, monitor bezels, display frames, button housings, empty illuminated screens.`,
    `DISPLAY PLACEHOLDERS: Every monitor powered on, premium glass, illuminated, reflective, active — but intentionally BLANK. Use: ${DISPLAY_PLACEHOLDER_TREATMENTS.join(', ')}. No readable information.`,
    `INTEGRATION: Command Dock and Workbench are permanent architectural furniture — glass, acrylic, chrome, embedded screens, tool slots, console surfaces. Premium, realistic, fully integrated into the room.`,
  ].join('\n');
}

/** Negative prompt block — never generate production UI. */
export function buildArchitectureLawNegativeDirective(): string {
  return [
    ...AI_FORBIDDEN_PRODUCTION_UI_CATEGORIES,
    'readable text',
    'legible words',
    'UI screenshot',
    'dashboard screenshot',
    'app interface',
    'software UI',
    'HUD overlay text',
    'status bar text',
    'menu labels',
    'button text',
    'chart labels',
    'graph axes',
    'notification banners',
    'company logo text',
    'brand lettering',
    'breadcrumb trail',
    'tooltip text',
    'metric numbers',
    'revision stamp',
  ].join(', ');
}

export function appendArchitectureLawToEnvironmentPrompt(prompt: string): string {
  return `${prompt}\n\n${buildArchitectureLawPositiveDirective()}`;
}

export function appendArchitectureLawToNegativePrompt(negativePrompt: string): string {
  const lawNegative = buildArchitectureLawNegativeDirective();
  return negativePrompt ? `${negativePrompt}, ${lawNegative}` : lawNegative;
}
