import type { PromptEntry } from './types';
import { buildPromptCatalog, getPromptEntry } from './prompt-catalog';

const customPrompts: PromptEntry[] = [];

export function registerPrompt(entry: PromptEntry): PromptEntry {
  const registered = { ...entry, registered: true, lastUpdated: new Date().toISOString() };
  const idx = customPrompts.findIndex((p) => p.promptId === entry.promptId);
  if (idx >= 0) customPrompts[idx] = registered;
  else customPrompts.push(registered);
  return registered;
}

export function getAllPrompts(): PromptEntry[] {
  const byId = new Map(buildPromptCatalog().map((p) => [p.promptId, p]));
  for (const custom of customPrompts) {
    byId.set(custom.promptId, custom);
  }
  return [...byId.values()];
}

export function getRegisteredPrompt(promptId: string): PromptEntry | undefined {
  return getAllPrompts().find((p) => p.promptId === promptId) ?? getPromptEntry(promptId);
}

/** Gate — unregistered prompts must not execute in production AI workflows. */
export function canPromptExecute(promptId: string): boolean {
  const entry = getRegisteredPrompt(promptId);
  return entry?.registered === true && entry.status === 'active';
}
