import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  buildDefaultPsaChatCopyConfig,
  type PsaChatCopyConfig,
  type PsaChatUiCopy,
  type PsaStarterQuickReplyDef,
} from '../../../utils/psaChatCopyCatalog';
import {
  clearLocalPsaChatCopyConfig,
  formatPsaChatCopyForClipboard,
  getResolvedPsaChatCopyConfig,
  PSA_CHAT_COPY_UPDATED_EVENT,
  saveLocalPsaChatCopyConfig,
} from '../../../utils/psaChatCopyResolve';
import { fetchAndMergePsaChatCopyFromCloud, syncPsaChatCopyToCloud } from '../../../utils/psaChatCopySync';
import './brandCopyEditor.css';

function EditableField({
  id,
  label,
  value,
  onChange,
  hint,
  rows,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  rows?: number;
}) {
  return (
    <div className="brand-copy-editor__field">
      <label htmlFor={id}>{label}</label>
      {hint ? <p className="brand-copy-editor__field-hint">{hint}</p> : null}
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows ?? (value.includes('\n') ? 3 : value.length > 60 ? 3 : 2)}
      />
    </div>
  );
}

function StarterReplyCard({
  row,
  index,
  onChange,
  onRemove,
}: {
  row: PsaStarterQuickReplyDef;
  index: number;
  onChange: (next: PsaStarterQuickReplyDef) => void;
  onRemove: () => void;
}) {
  const followUpText = (row.followUpChips ?? []).join('\n');

  return (
    <article className="brand-copy-editor__card">
      <header className="brand-copy-editor__card-head">
        <h3>Starter #{index + 1}</h3>
        <button type="button" className="brand-copy-editor__btn" onClick={onRemove}>
          Remove
        </button>
      </header>
      <EditableField
        id={`starter-label-${row.id}`}
        label="Chip label (shown on welcome screen)"
        value={row.label}
        onChange={(label) => onChange({ ...row, label })}
      />
      <EditableField
        id={`starter-reply-${row.id}`}
        label="Scripted PSA reply (optional — skips LLM when set)"
        value={row.scriptedReply ?? ''}
        onChange={(scriptedReply) => onChange({ ...row, scriptedReply: scriptedReply || undefined })}
        hint="Leave blank to let PSA answer via AI when the member taps this chip."
        rows={4}
      />
      <EditableField
        id={`starter-followups-${row.id}`}
        label="Follow-up chips (one per line, optional)"
        value={followUpText}
        onChange={(text) => {
          const followUpChips = text
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);
          onChange({ ...row, followUpChips: followUpChips.length ? followUpChips : undefined });
        }}
        rows={3}
      />
      <label className="brand-copy-editor__checkbox">
        <input
          type="checkbox"
          checked={row.useLlm === true}
          onChange={(e) => onChange({ ...row, useLlm: e.target.checked || undefined })}
        />
        Always use AI (ignore scripted reply)
      </label>
    </article>
  );
}

export default function PsaChatCopyEditorPanel() {
  const [draft, setDraft] = useState<PsaChatCopyConfig>(() => getResolvedPsaChatCopyConfig());
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingRemote, setLoadingRemote] = useState(true);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoadingRemote(true);
      const merged = await fetchAndMergePsaChatCopyFromCloud();
      if (!cancelled) {
        setDraft(merged);
        setLoadingRemote(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const reload = () => setDraft(getResolvedPsaChatCopyConfig());
    window.addEventListener(PSA_CHAT_COPY_UPDATED_EVENT, reload);
    return () => window.removeEventListener(PSA_CHAT_COPY_UPDATED_EVENT, reload);
  }, []);

  const patchUi = (patch: Partial<PsaChatUiCopy>) => {
    setDraft((prev) => ({ ...prev, ui: { ...prev.ui, ...patch } }));
  };

  const patchStarter = (index: number, next: PsaStarterQuickReplyDef) => {
    setDraft((prev) => {
      const starterQuickReplies = [...prev.starterQuickReplies];
      starterQuickReplies[index] = next;
      return { ...prev, starterQuickReplies };
    });
  };

  const addStarter = () => {
    const label = window.prompt('New starter chip label:', 'NEW QUICK REPLY');
    if (!label?.trim()) return;
    const id = `starter-${Date.now()}`;
    setDraft((prev) => ({
      ...prev,
      starterQuickReplies: [...prev.starterQuickReplies, { id, label: label.trim().toUpperCase() }],
    }));
  };

  const removeStarter = (index: number) => {
    setDraft((prev) => ({
      ...prev,
      starterQuickReplies: prev.starterQuickReplies.filter((_, i) => i !== index),
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const next = { ...draft, updatedAt: Date.now() };
      saveLocalPsaChatCopyConfig(next);
      await syncPsaChatCopyToCloud(next);
      setDraft(next);
      showToast('Saved PSA chat copy');
    } catch {
      showToast('Saved locally — cloud sync failed');
    } finally {
      setSaving(false);
    }
  };

  const resetAll = () => {
    if (!window.confirm('Reset PSA chat copy to defaults on this device?')) return;
    clearLocalPsaChatCopyConfig();
    setDraft(buildDefaultPsaChatCopyConfig());
    showToast('Reset to defaults (save to push cloud)');
  };

  const uiSections = useMemo(
    () =>
      [
        { title: 'FAB + widget', keys: ['widgetLabel', 'widgetSublabel', 'widgetCta', 'continueCta', 'hideChatCta', 'showChatCta'] as const },
        { title: 'Chat panel chrome', keys: ['chatTitle', 'chatSubtitle', 'inputPlaceholder', 'loadingLabel', 'typingLabel'] as const },
        {
          title: 'Welcome message',
          keys: [
            'welcomeFirstGreeting',
            'welcomeReturningGreeting',
            'welcomeAnonymousGreeting',
            'welcomeIntroTail',
          ] as const,
        },
      ] as const,
    [],
  );

  const uiFieldLabels: Record<keyof PsaChatUiCopy, string> = {
    widgetLabel: 'Widget label',
    widgetSublabel: 'Widget sublabel',
    widgetCta: 'FAB CTA (tap to chat)',
    continueCta: 'FAB CTA (continue chat)',
    hideChatCta: 'FAB CTA (hide chat)',
    showChatCta: 'FAB CTA (show chat)',
    chatTitle: 'Chat title',
    chatSubtitle: 'Chat subtitle',
    inputPlaceholder: 'Input placeholder',
    loadingLabel: 'Loading history label',
    typingLabel: 'Typing indicator label',
    welcomeFirstGreeting: 'First visit greeting ({firstName})',
    welcomeReturningGreeting: 'Returning visit greeting ({firstName})',
    welcomeAnonymousGreeting: 'Anonymous first visit greeting',
    welcomeIntroTail: 'Welcome intro tail (after "I\'m your PSA")',
  };

  return (
    <div className="brand-copy-editor">
      {toast ? <p className="brand-copy-editor__toast">{toast}</p> : null}
      <p className="brand-copy-editor__intro">
        Edit PSA chat design copy, welcome message templates, and starter quick replies. Scripted replies show
        instantly without calling the AI. Save syncs to Supabase for all members.
      </p>
      {loadingRemote ? <p className="brand-copy-editor__empty">Loading cloud copy…</p> : null}
      <div className="brand-copy-editor__toolbar">
        <button
          type="button"
          className="brand-copy-editor__btn brand-copy-editor__btn--primary"
          disabled={saving}
          onClick={() => void save()}
        >
          {saving ? 'Saving…' : 'Save chat copy'}
        </button>
        <button
          type="button"
          className="brand-copy-editor__btn"
          onClick={() => void navigator.clipboard.writeText(formatPsaChatCopyForClipboard(draft)).then(() => showToast('Copied JSON'))}
        >
          Copy JSON
        </button>
        <button type="button" className="brand-copy-editor__btn" onClick={resetAll}>
          Reset defaults
        </button>
        <button type="button" className="brand-copy-editor__btn" onClick={addStarter}>
          + Starter chip
        </button>
      </div>

      {uiSections.map((section) => (
        <section key={section.title} className="brand-copy-editor__category">
          <div className="brand-copy-editor__category-head">
            <h2>{section.title}</h2>
          </div>
          <div className="brand-copy-editor__grid brand-copy-editor__grid--single">
            {section.keys.map((key) => (
              <EditableField
                key={key}
                id={`psa-ui-${key}`}
                label={uiFieldLabels[key]}
                value={draft.ui[key]}
                onChange={(value) => patchUi({ [key]: value })}
                hint={
                  key.includes('welcome') && key !== 'welcomeIntroTail'
                    ? 'Use {firstName} where the member name should appear.'
                    : undefined
                }
              />
            ))}
          </div>
        </section>
      ))}

      <section className="brand-copy-editor__category">
        <div className="brand-copy-editor__category-head">
          <h2>Starter quick replies</h2>
          <p>Shown on the welcome-only thread before the member sends a message.</p>
        </div>
        <div className="brand-copy-editor__grid">
          {draft.starterQuickReplies.map((row, index) => (
            <StarterReplyCard
              key={row.id}
              row={row}
              index={index}
              onChange={(next) => patchStarter(index, next)}
              onRemove={() => removeStarter(index)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
