/**
 * Resolve PSA chat UI copy + starter quick replies (defaults + localStorage + optional cloud merge).
 */
import { formatPsaMemberFirstName } from '../constants/psaConfig';
import { getCurrentUserFirstNameFromStorage } from './perUserStorage';
import { resolvePsaWelcomeKind, type PsaWelcomeKind } from './psaWelcomeState';
import {
  buildDefaultPsaChatCopyConfig,
  normalizePsaChatCopyConfig,
  PSA_CHAT_COPY_STORAGE_KEY,
  type PsaChatCopyConfig,
  type PsaChatUiCopy,
  type PsaStarterQuickReplyDef,
} from './psaChatCopyCatalog';

export const PSA_CHAT_COPY_UPDATED_EVENT = 'psaChatCopyUpdated';

function loadLocalPsaChatCopyConfig(): PsaChatCopyConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PSA_CHAT_COPY_STORAGE_KEY);
    if (!raw) return null;
    return normalizePsaChatCopyConfig(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveLocalPsaChatCopyConfig(config: PsaChatCopyConfig): void {
  if (typeof window === 'undefined') return;
  const next = { ...config, updatedAt: Date.now() };
  localStorage.setItem(PSA_CHAT_COPY_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(PSA_CHAT_COPY_UPDATED_EVENT));
}

export function clearLocalPsaChatCopyConfig(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PSA_CHAT_COPY_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(PSA_CHAT_COPY_UPDATED_EVENT));
}

export function mergePsaChatCopyConfig(local: PsaChatCopyConfig, remote: PsaChatCopyConfig): PsaChatCopyConfig {
  if (remote.updatedAt >= local.updatedAt) return remote;
  return local;
}

export function getResolvedPsaChatCopyConfig(): PsaChatCopyConfig {
  return loadLocalPsaChatCopyConfig() ?? buildDefaultPsaChatCopyConfig();
}

export function getPsaChatUiCopy(): PsaChatUiCopy {
  return getResolvedPsaChatCopyConfig().ui;
}

export function getPsaStarterQuickReplyDefs(): PsaStarterQuickReplyDef[] {
  return getResolvedPsaChatCopyConfig().starterQuickReplies;
}

export function getPsaStarterQuickReplyLabels(): string[] {
  return getPsaStarterQuickReplyDefs().map((row) => row.label);
}

export function buildPsaWelcomeMessageFromCopy(options?: {
  firstName?: string | null;
  kind?: PsaWelcomeKind;
  ui?: PsaChatUiCopy;
}): string {
  const ui = options?.ui ?? getPsaChatUiCopy();
  const rawName = options?.firstName ?? getCurrentUserFirstNameFromStorage();
  const formatted = rawName?.trim() ? formatPsaMemberFirstName(rawName) : '';
  const kind = options?.kind ?? resolvePsaWelcomeKind();

  let greeting = '';
  if (kind === 'first') {
    greeting = formatted
      ? ui.welcomeFirstGreeting.replace('{firstName}', formatted)
      : ui.welcomeAnonymousGreeting;
  } else if (kind === 'returning') {
    greeting = formatted
      ? ui.welcomeReturningGreeting.replace('{firstName}', formatted)
      : 'Welcome back!';
  }

  const psaIntro = greeting ? `${greeting} I'm your PSA.` : `I'm your PSA!`;
  return `${psaIntro} ${ui.welcomeIntroTail}`.trim();
}

export function readPsaWelcomeMessageFromCopyStorage(): string {
  return buildPsaWelcomeMessageFromCopy({
    firstName: getCurrentUserFirstNameFromStorage(),
    kind: resolvePsaWelcomeKind(),
  });
}

function normalizeChipLabel(label: string): string {
  return label.trim().toUpperCase();
}

export function findPsaStarterQuickReplyDef(userText: string): PsaStarterQuickReplyDef | undefined {
  const needle = normalizeChipLabel(userText);
  return getPsaStarterQuickReplyDefs().find((row) => normalizeChipLabel(row.label) === needle);
}

export function resolvePsaScriptedQuickReply(userText: string): {
  reply: string;
  followUpChips?: string[];
} | null {
  const def = findPsaStarterQuickReplyDef(userText);
  if (!def || def.useLlm || !def.scriptedReply?.trim()) return null;
  return {
    reply: def.scriptedReply.trim(),
    followUpChips: def.followUpChips?.length ? def.followUpChips : undefined,
  };
}

export function formatPsaChatCopyForClipboard(config: PsaChatCopyConfig): string {
  return JSON.stringify(config, null, 2);
}
