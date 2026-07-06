import {
  WISDOM_CAPTURE_PROMPT,
  WISDOM_LIBRARY_CATEGORIES,
  WISDOM_TRIGGER_PATTERNS,
} from './constants';
import type { WisdomDetectionResult, WisdomEntry, WisdomLibraryCategory } from './types';

const CATEGORY_KEYWORDS: { category: WisdomLibraryCategory; patterns: RegExp[] }[] = [
  { category: 'leadership', patterns: [/\bleadership\b/i, /\bfounder\b/i, /\bdecision\b/i, /\bdelegate\b/i] },
  { category: 'marketing', patterns: [/\bmarketing\b/i, /\bcampaign\b/i, /\baudience\b/i, /\bbrand\b/i] },
  { category: 'customer-experience', patterns: [/\bcustomer\b/i, /\bclient\b/i, /\bonboarding\b/i, /\btrust\b/i] },
  { category: 'operations', patterns: [/\boperat/i, /\bworkflow\b/i, /\bprocess\b/i, /\bcapacity\b/i] },
  { category: 'growth', patterns: [/\bgrowth\b/i, /\brevenue\b/i, /\bscale\b/i, /\bpricing\b/i] },
  { category: 'projects', patterns: [/\bproject\b/i, /\blaunch\b/i, /\bdelivery\b/i] },
  { category: 'profession-brain', patterns: [/\bknowledge\b/i, /\bexpertise\b/i, /\bbrain\b/i, /\bsop\b/i] },
  { category: 'customers', patterns: [/\bretention\b/i, /\bchurn\b/i, /\bsupport\b/i] },
  { category: 'industry', patterns: [/\bindustry\b/i, /\bmarket\b/i, /\bcompet/i] },
  { category: 'lessons-learned', patterns: [/\blesson\b/i, /\bmistake\b/i, /\bnever again\b/i] },
  { category: 'department', patterns: [/\bteam\b/i, /\bdepartment\b/i, /\bhire\b/i] },
];

function inferCategory(text: string): WisdomLibraryCategory {
  for (const { category, patterns } of CATEGORY_KEYWORDS) {
    if (patterns.some((p) => p.test(text))) return category;
  }
  return 'lessons-learned';
}

function extractWisdomSentence(text: string): string {
  const trimmed = text.trim();
  const sentences = trimmed.split(/(?<=[.!?])\s+/).filter(Boolean);
  const wisdomSentence =
    sentences.find((s) => WISDOM_TRIGGER_PATTERNS.some((p) => p.test(s))) ?? sentences[0] ?? trimmed;
  return wisdomSentence.slice(0, 280);
}

function matchedPattern(text: string): string {
  for (const pattern of WISDOM_TRIGGER_PATTERNS) {
    if (pattern.test(text)) return pattern.source;
  }
  return 'general-wisdom';
}

export function detectWisdomInText(text: string): WisdomDetectionResult | null {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length < 12) return null;

  const matched = WISDOM_TRIGGER_PATTERNS.find((p) => p.test(trimmed));
  if (!matched) return null;

  return {
    detected: true,
    extractedWisdom: extractWisdomSentence(trimmed),
    triggerPattern: matchedPattern(trimmed),
    suggestedCategory: inferCategory(trimmed),
    prompt: WISDOM_CAPTURE_PROMPT,
  };
}

export function buildSearchableTags(text: string, category: WisdomLibraryCategory): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 4)
    .slice(0, 8);
  return [...new Set([category, ...words])];
}

export function searchWisdomLibrary(entries: WisdomEntry[], query: string): WisdomEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return entries;

  return entries.filter(
    (e) =>
      e.wisdom.toLowerCase().includes(q) ||
      e.whyItMatters.toLowerCase().includes(q) ||
      e.category.includes(q) ||
      e.searchableTags.some((t) => t.includes(q)) ||
      (e.department?.toLowerCase().includes(q) ?? false)
  );
}

export function groupWisdomByCategory(entries: WisdomEntry[]): Record<WisdomLibraryCategory, WisdomEntry[]> {
  const grouped = {} as Record<WisdomLibraryCategory, WisdomEntry[]>;
  for (const cat of WISDOM_LIBRARY_CATEGORIES) {
    grouped[cat] = entries.filter((e) => e.category === cat);
  }
  return grouped;
}
