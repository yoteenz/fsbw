/**
 * One-line "she remembers me" callback for early thread turns (instructions only).
 */
import type { PsaMemberContextSnapshot } from './psaMemberContext.js';
import { normalizeSlayArchetype } from './psaSlayArchetype.js';

function pickMicroMomentLine(ctx: PsaMemberContextSnapshot): string | null {
  const memories = ctx.memories ?? [];
  if (memories[0]?.note) {
    const note = memories[0].note.trim();
    if (note.length >= 8) {
      return `Last time you mentioned ${note.toLowerCase().replace(/\.$/, '')} — still the vibe?`;
    }
  }

  const archetype = normalizeSlayArchetype(ctx.slayArchetype ?? ctx.hairProfile ?? '');
  if (archetype) {
    return `Still shopping through your ${archetype.replace(/^THE /i, '').toLowerCase()} lens?`;
  }

  const purchase = ctx.purchaseContexts?.[0];
  if (purchase?.occasion) {
    const unit = purchase.unitName ? ` for ${purchase.unitName}` : '';
    return `You chose${unit} for ${purchase.occasion.toLowerCase()} — does that still fit your rotation?`;
  }

  if (ctx.cart?.unitNames?.length) {
    return `I see ${ctx.cart.unitNames[0]} in your bag — want help finishing that config?`;
  }

  if (ctx.activeOrders?.[0]?.productName) {
    return `Your ${ctx.activeOrders[0].productName} order is on my radar — what do you need today?`;
  }

  if (ctx.bawDraft?.unitLabel) {
    return `You still have a ${ctx.bawDraft.unitLabel} draft open — pick up where you left off?`;
  }

  return null;
}

export function buildPsaMemoryMicroMomentBlock(
  ctx: PsaMemberContextSnapshot | null,
  isEarlyThreadTurn: boolean
): string {
  if (!ctx || !isEarlyThreadTurn) return '';
  const line = pickMicroMomentLine(ctx);
  if (!line) return '';

  return `\n## Memory micro-moment (first reply in this thread only)
You may weave ONE short callback into your first sentence (max ~14 words), then answer their question directly.
Suggested line: "${line}"
Do not repeat Welcome / Welcome back. Skip the callback if their message is unrelated or urgent (order problem, checkout error).
Never stack pet names. One memory touch only.\n`;
}
