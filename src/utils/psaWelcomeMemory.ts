/**
 * Client welcome memory hint — one line so members feel remembered (no DNA/scores).
 */
import { getCachedPsaMemberContext, getCachedSlayArchetype } from './psaMemberContextCache';

export function buildPsaWelcomeMemorySuffix(): string {
  const ctx = getCachedPsaMemberContext();
  if (!ctx) return '';

  const archetype = getCachedSlayArchetype();
  if (archetype) {
    const short = archetype.replace(/^THE /i, '').replace(/ SLAYER$/i, '');
    return ` Still shopping with your ${short} vibe?`;
  }

  const purchase = ctx.purchaseContexts?.[0];
  if (purchase?.occasion) {
    const unit = purchase.unitName ? ` for ${purchase.unitName}` : '';
    return ` I remember you chose${unit} for ${purchase.occasion.toLowerCase()}.`;
  }

  return '';
}

export function appendWelcomeMemoryHint(welcomeMessage: string): string {
  const suffix = buildPsaWelcomeMemorySuffix();
  if (!suffix) return welcomeMessage;
  return `${welcomeMessage.trim()}${suffix}`;
}
