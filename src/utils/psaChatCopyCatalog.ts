/**
 * Default PSA chat copy catalog — admin can override via Admin → Brand → EDIT CHAT.
 */
import {
  PSA_CHAT_SUBTITLE,
  PSA_CHAT_TITLE,
  PSA_CONTINUE_CTA,
  PSA_HIDE_CHAT_CTA,
  PSA_SHOW_CHAT_CTA,
  PSA_MORE_STARTER_QUICK_REPLIES,
  PSA_STARTER_QUICK_REPLIES,
  PSA_WIDGET_CTA,
  PSA_WIDGET_LABEL,
  PSA_WIDGET_SUBLABEL,
} from '../constants/psaConfig';

export type PsaStarterQuickReplyDef = {
  id: string;
  label: string;
  /** When set (and useLlm is not true), tapping the chip shows this reply without calling the LLM. */
  scriptedReply?: string;
  /** Optional follow-up chips after a scripted reply. */
  followUpChips?: string[];
  /** When true, always call the LLM even if scriptedReply is set. */
  useLlm?: boolean;
};

export type PsaChatUiCopy = {
  widgetLabel: string;
  widgetSublabel: string;
  widgetCta: string;
  continueCta: string;
  hideChatCta: string;
  showChatCta: string;
  chatTitle: string;
  chatSubtitle: string;
  inputPlaceholder: string;
  loadingLabel: string;
  typingLabel: string;
  welcomeFirstGreeting: string;
  welcomeReturningGreeting: string;
  welcomeAnonymousGreeting: string;
  welcomeIntroTail: string;
};

export type PsaChatCopyConfig = {
  ui: PsaChatUiCopy;
  starterQuickReplies: PsaStarterQuickReplyDef[];
  updatedAt: number;
};

export const PSA_CHAT_COPY_STORAGE_KEY = 'psa_chat_copy_admin';

export const DEFAULT_PSA_CHAT_UI: PsaChatUiCopy = {
  widgetLabel: PSA_WIDGET_LABEL,
  widgetSublabel: PSA_WIDGET_SUBLABEL,
  widgetCta: PSA_WIDGET_CTA,
  continueCta: PSA_CONTINUE_CTA,
  hideChatCta: PSA_HIDE_CHAT_CTA,
  showChatCta: PSA_SHOW_CHAT_CTA,
  chatTitle: PSA_CHAT_TITLE,
  chatSubtitle: PSA_CHAT_SUBTITLE,
  inputPlaceholder: 'ASK PSA ANYTHING…',
  loadingLabel: 'LOADING YOUR CHAT…',
  typingLabel: 'YOUR PSA IS TYPING…',
  welcomeFirstGreeting: 'Welcome, {firstName}!',
  welcomeReturningGreeting: 'Welcome back, {firstName}!',
  welcomeAnonymousGreeting: 'Welcome!',
  welcomeIntroTail:
    'What are you looking for today: new hair, maintenance, customization or a little bit of everything?',
};

function slugStarterId(label: string, index: number): string {
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return slug || `starter-${index + 1}`;
}

export const DEFAULT_PSA_STARTER_QUICK_REPLIES: PsaStarterQuickReplyDef[] = [
  ...PSA_STARTER_QUICK_REPLIES.map((label, index) => ({
    id: slugStarterId(label, index),
    label,
  })),
  ...PSA_MORE_STARTER_QUICK_REPLIES.map((label, index) => ({
    id: slugStarterId(label, PSA_STARTER_QUICK_REPLIES.length + index),
    label,
  })),
];

export function buildDefaultPsaChatCopyConfig(): PsaChatCopyConfig {
  return {
    ui: { ...DEFAULT_PSA_CHAT_UI },
    starterQuickReplies: DEFAULT_PSA_STARTER_QUICK_REPLIES.map((row) => ({ ...row })),
    updatedAt: 0,
  };
}

export function normalizePsaChatCopyConfig(raw: unknown): PsaChatCopyConfig | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const base = buildDefaultPsaChatCopyConfig();
  const obj = raw as Partial<PsaChatCopyConfig>;
  const uiRaw = obj.ui;
  const ui: PsaChatUiCopy = { ...base.ui };
  if (uiRaw && typeof uiRaw === 'object' && !Array.isArray(uiRaw)) {
    for (const key of Object.keys(base.ui) as (keyof PsaChatUiCopy)[]) {
      const v = (uiRaw as PsaChatUiCopy)[key];
      if (typeof v === 'string' && v.trim()) ui[key] = v.trim();
    }
  }
  let starters = base.starterQuickReplies;
  if (Array.isArray(obj.starterQuickReplies) && obj.starterQuickReplies.length > 0) {
    const parsed: PsaStarterQuickReplyDef[] = [];
    obj.starterQuickReplies.forEach((row, index) => {
      if (!row || typeof row !== 'object') return;
      const label = typeof row.label === 'string' ? row.label.trim() : '';
      if (!label) return;
      const id =
        typeof row.id === 'string' && row.id.trim() ? row.id.trim() : slugStarterId(label, index);
      const scriptedReply =
        typeof row.scriptedReply === 'string' && row.scriptedReply.trim()
          ? row.scriptedReply.trim()
          : undefined;
      const followUpChips = Array.isArray(row.followUpChips)
        ? row.followUpChips
            .filter((c): c is string => typeof c === 'string' && Boolean(c.trim()))
            .map((c) => c.trim())
        : undefined;
      parsed.push({
        id,
        label,
        scriptedReply,
        followUpChips: followUpChips?.length ? followUpChips : undefined,
        useLlm: row.useLlm === true ? true : undefined,
      });
    });
    if (parsed.length) starters = parsed;
  }
  return {
    ui,
    starterQuickReplies: starters.length ? starters : base.starterQuickReplies,
    updatedAt: typeof obj.updatedAt === 'number' ? obj.updatedAt : Date.now(),
  };
}
