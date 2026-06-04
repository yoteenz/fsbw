import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PSA_NUDGE_BUBBLE_SRC } from '../../../constants/psaConfig';
import { type AccountAlertCatalogEntry } from '../../../utils/accountAlertsCatalog';
import { type PsaNudgeCatalogEntry } from '../../../utils/psaProactiveNudgeCatalog';
import {
  COPY_DEBUG_SAMPLE_VARS,
  COPY_DEBUG_UPDATED_EVENT,
  clearAllAlertCopyOverrides,
  clearAllNudgeCopyOverrides,
  countAlertCopyOverrides,
  countNudgeCopyOverrides,
  createBlankCustomAlert,
  createBlankCustomNudge,
  deleteAlertCopyOverride,
  deleteCustomAlertVariant,
  deleteCustomNudgeVariant,
  deleteNudgeCopyOverride,
  duplicateCustomAlertFromCatalog,
  duplicateCustomAlertFromCustom,
  duplicateCustomNudgeFromCatalog,
  duplicateCustomNudgeFromCustom,
  formatAlertCopyBlock,
  formatAllAlertsForClipboard,
  formatAllNudgesForClipboard,
  formatNudgeCopyBlock,
  getAccountAlertsCatalog,
  getAlertCopyTemplates,
  getNudgeCopyTemplates,
  getPsaProactiveNudgeCatalog,
  hasAlertCopyOverride,
  hasNudgeCopyOverride,
  interpolateCopy,
  listCatalogAlertVariantIds,
  listCatalogNudgeVariantIds,
  listCustomAlertVariants,
  listCustomNudgeVariants,
  saveAlertCopyOverride,
  saveCustomAlertVariantAndLive,
  saveCustomNudgeVariantAndLive,
  saveNudgeCopyOverride,
  type AlertCopyTemplates,
  type CustomAlertVariant,
  type CustomNudgeVariant,
  type NudgeCopyTemplates,
} from '../../../utils/copyDebugResolve';
import './copyDebug.css';

type CopyDebugTab = 'nudges' | 'alerts';

function slugify(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function copyToClipboard(text: string, onToast: (msg: string) => void, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    onToast(`Copied ${label}`);
  } catch {
    onToast('Copy failed — select text manually');
  }
}

function EditableField({
  id,
  label,
  value,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  return (
    <div className="copy-debug__field">
      <label htmlFor={id}>{label}</label>
      {hint ? <p className="copy-debug__field-hint">{hint}</p> : null}
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={value.includes('\n') ? 3 : value.length > 60 ? 3 : 2}
      />
    </div>
  );
}

function NudgePreview({ headline, body }: { headline: string; body?: string }) {
  return (
    <div className="copy-debug__nudge-preview" aria-hidden>
      <img className="copy-debug__nudge-preview-art" src={PSA_NUDGE_BUBBLE_SRC} alt="" draggable={false} />
      <div className="copy-debug__nudge-preview-content">
        <span className="copy-debug__nudge-preview-headline">{headline}</span>
        {body ? <span className="copy-debug__nudge-preview-body">{body}</span> : null}
      </div>
    </div>
  );
}

function AlertPreview({
  title,
  message,
  actionText,
  rowVariant,
}: {
  title: string;
  message: string;
  actionText: string;
  rowVariant: AccountAlertCatalogEntry['rowVariant'];
}) {
  const titleClass =
    rowVariant === 'consult_offer_ready'
      ? 'copy-debug__alert-preview-title copy-debug__alert-preview-title--consult'
      : 'copy-debug__alert-preview-title';

  return (
    <div className="copy-debug__alert-preview-row" aria-hidden>
      <img className="copy-debug__alert-preview-avatar" src="/assets/profile-thumb.png" alt="" draggable={false} />
      <div className="copy-debug__alert-preview-body-col">
        <p className={titleClass}>{title}</p>
        <p className="copy-debug__alert-preview-message">{message}</p>
        {actionText ? <span className="copy-debug__alert-preview-action">{actionText}</span> : null}
      </div>
    </div>
  );
}

function CardSecondaryActions({
  onCopy,
  onDuplicate,
}: {
  onCopy: () => void;
  onDuplicate: () => void;
}) {
  return (
    <div className="copy-debug__card-actions copy-debug__card-actions--secondary">
      <button type="button" className="copy-debug__btn" onClick={onCopy}>
        Copy block
      </button>
      <button type="button" className="copy-debug__btn" onClick={onDuplicate}>
        Duplicate
      </button>
    </div>
  );
}

function NudgeCard({
  entry,
  onSaved,
  onToast,
}: {
  entry: PsaNudgeCatalogEntry;
  onSaved: () => void;
  onToast: (msg: string) => void;
}) {
  const prefix = `nudge-${entry.variantId}`;
  const isCustom = hasNudgeCopyOverride(entry.variantId);
  const [draft, setDraft] = useState<NudgeCopyTemplates>(() => getNudgeCopyTemplates(entry.variantId));
  const preview = useMemo(
    () => ({
      headline: interpolateCopy(draft.headline, COPY_DEBUG_SAMPLE_VARS),
      body: interpolateCopy(draft.body, COPY_DEBUG_SAMPLE_VARS),
      prefilledMessage: interpolateCopy(draft.prefilledMessage, COPY_DEBUG_SAMPLE_VARS),
      actionLabel: interpolateCopy(draft.actionLabel, COPY_DEBUG_SAMPLE_VARS),
    }),
    [draft]
  );

  useEffect(() => {
    setDraft(getNudgeCopyTemplates(entry.variantId));
  }, [entry.variantId, isCustom]);

  const save = () => {
    saveNudgeCopyOverride(entry.variantId, draft);
    onSaved();
    onToast(`Saved ${entry.variantLabel}`);
  };

  const reset = () => {
    deleteNudgeCopyOverride(entry.variantId);
    setDraft(getNudgeCopyTemplates(entry.variantId));
    onSaved();
    onToast(`Reset ${entry.variantLabel} to default`);
  };

  const copyBlock = () => {
    void copyToClipboard(
      formatNudgeCopyBlock(entry.variantId, entry.variantLabel, draft, [
        `KIND: ${entry.kind}`,
        `PRIORITY: ${entry.priority}`,
        `ACTION PATH: ${entry.actionPath}`,
      ]),
      onToast,
      entry.variantLabel
    );
  };

  const duplicate = () => {
    duplicateCustomNudgeFromCatalog(entry.variantId);
    onSaved();
    onToast(`Duplicated ${entry.variantLabel} → custom drafts`);
    document.getElementById('custom-nudges')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <article className={`copy-debug__card${isCustom ? ' copy-debug__card--custom' : ''}`}>
      <div className="copy-debug__card-top">
        <span className="copy-debug__variant-label">
          {entry.variantLabel}
          {isCustom ? <span className="copy-debug__badge copy-debug__badge--live">saved</span> : null}
        </span>
        <span className="copy-debug__variant-id">{entry.variantId}</span>
      </div>
      <div className="copy-debug__preview-wrap">
        <NudgePreview headline={preview.headline} body={preview.body} />
      </div>
      <div className="copy-debug__fields">
        <EditableField id={`${prefix}-headline`} label="Headline" value={draft.headline} onChange={(v) => setDraft((d) => ({ ...d, headline: v }))} />
        <EditableField
          id={`${prefix}-body`}
          label="Body"
          hint="Use {orderRef}, {hoursLeft}, {productName}, {unitLabel}, {status}, etc."
          value={draft.body}
          onChange={(v) => setDraft((d) => ({ ...d, body: v }))}
        />
        <EditableField id={`${prefix}-prefilled`} label="Prefilled chat message" value={draft.prefilledMessage} onChange={(v) => setDraft((d) => ({ ...d, prefilledMessage: v }))} />
        <EditableField id={`${prefix}-action`} label="Action label" value={draft.actionLabel} onChange={(v) => setDraft((d) => ({ ...d, actionLabel: v }))} />
        <div className="copy-debug__card-actions">
          <button type="button" className="copy-debug__btn copy-debug__btn--primary" onClick={save}>
            Save
          </button>
          <button type="button" className="copy-debug__btn" onClick={reset} disabled={!isCustom}>
            Reset
          </button>
        </div>
        <CardSecondaryActions onCopy={copyBlock} onDuplicate={duplicate} />
      </div>
      <p className="copy-debug__meta">
        Priority {entry.priority} · Pages: {entry.pageContexts.join(', ')} · Action path: {entry.actionPath}
        {entry.notes ? ` · ${entry.notes}` : ''}
      </p>
    </article>
  );
}

function CustomNudgeCard({
  variant,
  catalogIds,
  onSaved,
  onToast,
}: {
  variant: CustomNudgeVariant;
  catalogIds: string[];
  onSaved: () => void;
  onToast: (msg: string) => void;
}) {
  const [draft, setDraft] = useState(variant);
  const templates = draft.templates;
  const preview = useMemo(
    () => ({
      headline: interpolateCopy(templates.headline, COPY_DEBUG_SAMPLE_VARS),
      body: interpolateCopy(templates.body, COPY_DEBUG_SAMPLE_VARS),
    }),
    [templates]
  );

  useEffect(() => {
    setDraft(variant);
  }, [variant]);

  const save = () => {
    saveCustomNudgeVariantAndLive(draft);
    onSaved();
    onToast(draft.linkedVariantId ? `Saved draft + live (${draft.linkedVariantId})` : 'Saved custom draft');
  };

  const remove = () => {
    if (!window.confirm(`Delete custom nudge "${draft.label}"?`)) return;
    deleteCustomNudgeVariant(draft.variantId);
    onSaved();
    onToast('Deleted custom nudge');
  };

  return (
    <article className="copy-debug__card copy-debug__card--draft">
      <div className="copy-debug__card-top">
        <span className="copy-debug__variant-label">
          <input
            className="copy-debug__label-input"
            value={draft.label}
            onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
            aria-label="Custom nudge label"
          />
          <span className="copy-debug__badge">custom</span>
        </span>
        <span className="copy-debug__variant-id">{draft.variantId}</span>
      </div>
      <div className="copy-debug__preview-wrap">
        <NudgePreview headline={preview.headline} body={preview.body} />
      </div>
      <div className="copy-debug__fields">
        <div className="copy-debug__field">
          <label htmlFor={`${draft.variantId}-link`}>Apply to live variant (optional)</label>
          <select
            id={`${draft.variantId}-link`}
            className="copy-debug__select"
            value={draft.linkedVariantId ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, linkedVariantId: e.target.value || undefined }))}
          >
            <option value="">— draft only —</option>
            {catalogIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </div>
        <EditableField id={`${draft.variantId}-h`} label="Headline" value={templates.headline} onChange={(v) => setDraft((d) => ({ ...d, templates: { ...d.templates, headline: v } }))} />
        <EditableField id={`${draft.variantId}-b`} label="Body" value={templates.body} onChange={(v) => setDraft((d) => ({ ...d, templates: { ...d.templates, body: v } }))} />
        <EditableField id={`${draft.variantId}-p`} label="Prefilled" value={templates.prefilledMessage} onChange={(v) => setDraft((d) => ({ ...d, templates: { ...d.templates, prefilledMessage: v } }))} />
        <EditableField id={`${draft.variantId}-a`} label="Action label" value={templates.actionLabel} onChange={(v) => setDraft((d) => ({ ...d, templates: { ...d.templates, actionLabel: v } }))} />
        <div className="copy-debug__card-actions">
          <button type="button" className="copy-debug__btn copy-debug__btn--primary" onClick={save}>
            Save
          </button>
          <button type="button" className="copy-debug__btn copy-debug__btn--danger" onClick={remove}>
            Delete
          </button>
        </div>
        <CardSecondaryActions
          onCopy={() =>
            void copyToClipboard(
              formatNudgeCopyBlock(draft.variantId, draft.label, draft.templates, [
                draft.linkedVariantId ? `LINKED LIVE: ${draft.linkedVariantId}` : 'LINKED LIVE: (none)',
              ]),
              onToast,
              draft.label
            )
          }
          onDuplicate={() => {
            duplicateCustomNudgeFromCustom(draft);
            onSaved();
            onToast('Duplicated custom nudge');
          }}
        />
      </div>
      {draft.meta.duplicatedFrom ? <p className="copy-debug__meta">Duplicated from {draft.meta.duplicatedFrom}</p> : null}
    </article>
  );
}

function AlertCard({
  entry,
  onSaved,
  onToast,
}: {
  entry: AccountAlertCatalogEntry;
  onSaved: () => void;
  onToast: (msg: string) => void;
}) {
  const prefix = `alert-${entry.variantId}`;
  const isCustom = hasAlertCopyOverride(entry.variantId);
  const [draft, setDraft] = useState<AlertCopyTemplates>(() => getAlertCopyTemplates(entry.variantId));
  const preview = useMemo(
    () => ({
      title: interpolateCopy(draft.title, COPY_DEBUG_SAMPLE_VARS),
      message: interpolateCopy(draft.message, COPY_DEBUG_SAMPLE_VARS),
      actionText: interpolateCopy(draft.actionText, COPY_DEBUG_SAMPLE_VARS),
    }),
    [draft]
  );

  useEffect(() => {
    setDraft(getAlertCopyTemplates(entry.variantId));
  }, [entry.variantId, isCustom]);

  const save = () => {
    saveAlertCopyOverride(entry.variantId, draft);
    onSaved();
    onToast(`Saved ${entry.variantLabel}`);
  };

  const reset = () => {
    deleteAlertCopyOverride(entry.variantId);
    setDraft(getAlertCopyTemplates(entry.variantId));
    onSaved();
    onToast(`Reset ${entry.variantLabel} to default`);
  };

  const copyBlock = () => {
    void copyToClipboard(
      formatAlertCopyBlock(entry.variantId, entry.variantLabel, draft, [
        `ID PATTERN: ${entry.idPattern}`,
        `ROUTE: ${entry.actionRoute}`,
      ]),
      onToast,
      entry.variantLabel
    );
  };

  const duplicate = () => {
    duplicateCustomAlertFromCatalog(entry.variantId);
    onSaved();
    onToast(`Duplicated ${entry.variantLabel} → custom drafts`);
    document.getElementById('custom-alerts')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <article className={`copy-debug__card${isCustom ? ' copy-debug__card--custom' : ''}`}>
      <div className="copy-debug__card-top">
        <span className="copy-debug__variant-label">
          {entry.variantLabel}
          {isCustom ? <span className="copy-debug__badge copy-debug__badge--live">saved</span> : null}
        </span>
        <span className="copy-debug__variant-id">{entry.variantId}</span>
      </div>
      <div className="copy-debug__preview-wrap copy-debug__preview-wrap--alert">
        <AlertPreview title={preview.title} message={preview.message} actionText={preview.actionText} rowVariant={entry.rowVariant} />
      </div>
      <div className="copy-debug__fields">
        <EditableField id={`${prefix}-title`} label="Title" value={draft.title} onChange={(v) => setDraft((d) => ({ ...d, title: v }))} />
        <EditableField id={`${prefix}-message`} label="Message" hint="Use {orderNumber}, {unitName}, {voucherType}, etc." value={draft.message} onChange={(v) => setDraft((d) => ({ ...d, message: v }))} />
        <EditableField id={`${prefix}-action`} label="Action link" value={draft.actionText} onChange={(v) => setDraft((d) => ({ ...d, actionText: v }))} />
        <p className="copy-debug__field-hint">Route (read-only): {entry.actionRoute}</p>
        <div className="copy-debug__card-actions">
          <button type="button" className="copy-debug__btn copy-debug__btn--primary" onClick={save}>
            Save
          </button>
          <button type="button" className="copy-debug__btn" onClick={reset} disabled={!isCustom}>
            Reset
          </button>
        </div>
        <CardSecondaryActions onCopy={copyBlock} onDuplicate={duplicate} />
      </div>
      <p className="copy-debug__meta">
        ID: {entry.idPattern} · {entry.rowVariant} · {entry.source}
        {entry.notes ? ` · ${entry.notes}` : ''}
      </p>
    </article>
  );
}

function CustomAlertCard({
  variant,
  catalogIds,
  onSaved,
  onToast,
}: {
  variant: CustomAlertVariant;
  catalogIds: string[];
  onSaved: () => void;
  onToast: (msg: string) => void;
}) {
  const [draft, setDraft] = useState(variant);
  const templates = draft.templates;
  const rowVariant = draft.meta.rowVariant ?? 'standard';
  const preview = useMemo(
    () => ({
      title: interpolateCopy(templates.title, COPY_DEBUG_SAMPLE_VARS),
      message: interpolateCopy(templates.message, COPY_DEBUG_SAMPLE_VARS),
      actionText: interpolateCopy(templates.actionText, COPY_DEBUG_SAMPLE_VARS),
    }),
    [templates]
  );

  useEffect(() => {
    setDraft(variant);
  }, [variant]);

  const save = () => {
    saveCustomAlertVariantAndLive(draft);
    onSaved();
    onToast(draft.linkedVariantId ? `Saved draft + live (${draft.linkedVariantId})` : 'Saved custom draft');
  };

  const remove = () => {
    if (!window.confirm(`Delete custom alert "${draft.label}"?`)) return;
    deleteCustomAlertVariant(draft.variantId);
    onSaved();
    onToast('Deleted custom alert');
  };

  return (
    <article className="copy-debug__card copy-debug__card--draft">
      <div className="copy-debug__card-top">
        <span className="copy-debug__variant-label">
          <input
            className="copy-debug__label-input"
            value={draft.label}
            onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
            aria-label="Custom alert label"
          />
          <span className="copy-debug__badge">custom</span>
        </span>
        <span className="copy-debug__variant-id">{draft.variantId}</span>
      </div>
      <div className="copy-debug__preview-wrap copy-debug__preview-wrap--alert">
        <AlertPreview title={preview.title} message={preview.message} actionText={preview.actionText} rowVariant={rowVariant} />
      </div>
      <div className="copy-debug__fields">
        <div className="copy-debug__field">
          <label htmlFor={`${draft.variantId}-link`}>Apply to live variant (optional)</label>
          <select
            id={`${draft.variantId}-link`}
            className="copy-debug__select"
            value={draft.linkedVariantId ?? ''}
            onChange={(e) => setDraft((d) => ({ ...d, linkedVariantId: e.target.value || undefined }))}
          >
            <option value="">— draft only —</option>
            {catalogIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </div>
        <EditableField id={`${draft.variantId}-t`} label="Title" value={templates.title} onChange={(v) => setDraft((d) => ({ ...d, templates: { ...d.templates, title: v } }))} />
        <EditableField id={`${draft.variantId}-m`} label="Message" value={templates.message} onChange={(v) => setDraft((d) => ({ ...d, templates: { ...d.templates, message: v } }))} />
        <EditableField id={`${draft.variantId}-a`} label="Action link" value={templates.actionText} onChange={(v) => setDraft((d) => ({ ...d, templates: { ...d.templates, actionText: v } }))} />
        <EditableField
          id={`${draft.variantId}-route`}
          label="Route (preview meta)"
          value={draft.meta.actionRoute ?? ''}
          onChange={(v) => setDraft((d) => ({ ...d, meta: { ...d.meta, actionRoute: v } }))}
        />
        <div className="copy-debug__card-actions">
          <button type="button" className="copy-debug__btn copy-debug__btn--primary" onClick={save}>
            Save
          </button>
          <button type="button" className="copy-debug__btn copy-debug__btn--danger" onClick={remove}>
            Delete
          </button>
        </div>
        <CardSecondaryActions
          onCopy={() =>
            void copyToClipboard(
              formatAlertCopyBlock(draft.variantId, draft.label, draft.templates, [
                draft.linkedVariantId ? `LINKED LIVE: ${draft.linkedVariantId}` : 'LINKED LIVE: (none)',
                draft.meta.actionRoute ? `ROUTE: ${draft.meta.actionRoute}` : '',
              ].filter(Boolean)),
              onToast,
              draft.label
            )
          }
          onDuplicate={() => {
            duplicateCustomAlertFromCustom(draft);
            onSaved();
            onToast('Duplicated custom alert');
          }}
        />
      </div>
      {draft.meta.duplicatedFrom ? <p className="copy-debug__meta">Duplicated from {draft.meta.duplicatedFrom}</p> : null}
    </article>
  );
}

function NudgesPanel({ revision, onSaved, onToast }: { revision: number; onSaved: () => void; onToast: (msg: string) => void }) {
  const categories = useMemo(() => getPsaProactiveNudgeCatalog(), [revision]);
  const customVariants = useMemo(() => listCustomNudgeVariants(), [revision]);
  const catalogIds = useMemo(() => listCatalogNudgeVariantIds(), []);
  const overrideCount = countNudgeCopyOverrides();

  const createNew = () => {
    const label = window.prompt('Name for new nudge draft:', 'New nudge');
    if (label === null) return;
    createBlankCustomNudge(label);
    onSaved();
    onToast('Created custom nudge');
    document.getElementById('custom-nudges')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <p className="copy-debug__intro">
        Edit, <strong>copy</strong>, <strong>duplicate</strong>, or <strong>create</strong> nudge variants. Save on a catalog card
        updates live copy; custom drafts can optionally link to a catalog variant. Use <code>{'{placeholders}'}</code> for dynamic text.
      </p>
      <div className="copy-debug__toolbar">
        <button type="button" className="copy-debug__btn copy-debug__btn--primary" onClick={createNew}>
          + Create nudge
        </button>
        <button type="button" className="copy-debug__btn" onClick={() => void copyToClipboard(formatAllNudgesForClipboard(), onToast, 'all nudges')}>
          Copy entire tab
        </button>
        <button
          type="button"
          className="copy-debug__btn"
          onClick={() => {
            if (window.confirm('Clear all saved nudge overrides on this device?')) {
              clearAllNudgeCopyOverrides();
              onSaved();
              onToast('Cleared all nudge overrides');
            }
          }}
          disabled={overrideCount === 0}
        >
          Reset all live overrides
        </button>
        <Link to="/account/alerts" className="copy-debug__btn">
          Live alerts page
        </Link>
      </div>
      <nav className="copy-debug__nav" aria-label="PSA nudge categories">
        {categories.map((cat) => (
          <a key={`${cat.kind}-${cat.sortOrder}`} href={`#nudge-${slugify(cat.label)}`}>
            {cat.sortOrder}. {cat.label}
          </a>
        ))}
        {customVariants.length > 0 ? (
          <a href="#custom-nudges">Custom drafts ({customVariants.length})</a>
        ) : null}
      </nav>
      {categories.map((cat) => (
        <section key={`${cat.kind}-${cat.sortOrder}`} id={`nudge-${slugify(cat.label)}`} className="copy-debug__category">
          <div className="copy-debug__category-head">
            <h2>
              {cat.sortOrder}. {cat.label}
            </h2>
            <p>{cat.description}</p>
          </div>
          <div className="copy-debug__grid">
            {cat.entries.map((entry) => (
              <NudgeCard key={entry.variantId} entry={entry} onSaved={onSaved} onToast={onToast} />
            ))}
          </div>
        </section>
      ))}
      <section id="custom-nudges" className="copy-debug__category copy-debug__category--custom">
        <div className="copy-debug__category-head">
          <h2>Custom nudge drafts</h2>
          <p>Duplicates and new nudges you create. Link to a catalog variant to push copy live on Save.</p>
        </div>
        {customVariants.length === 0 ? (
          <p className="copy-debug__empty">No custom drafts yet — use <strong>Duplicate</strong> on a catalog card or <strong>+ Create nudge</strong>.</p>
        ) : (
          <div className="copy-debug__grid">
            {customVariants.map((v) => (
              <CustomNudgeCard key={v.variantId} variant={v} catalogIds={catalogIds} onSaved={onSaved} onToast={onToast} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function AlertsPanel({ revision, onSaved, onToast }: { revision: number; onSaved: () => void; onToast: (msg: string) => void }) {
  const categories = useMemo(() => getAccountAlertsCatalog(), [revision]);
  const customVariants = useMemo(() => listCustomAlertVariants(), [revision]);
  const catalogIds = useMemo(() => listCatalogAlertVariantIds(), []);
  const overrideCount = countAlertCopyOverrides();

  const createNew = () => {
    const label = window.prompt('Name for new alert draft:', 'New alert');
    if (label === null) return;
    createBlankCustomAlert(label);
    onSaved();
    onToast('Created custom alert');
    document.getElementById('custom-alerts')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <p className="copy-debug__intro">
        Edit, copy, duplicate, or create alert rows. Save updates <strong>/account/alerts</strong> copy when linked to a catalog variant.
      </p>
      <div className="copy-debug__toolbar">
        <button type="button" className="copy-debug__btn copy-debug__btn--primary" onClick={createNew}>
          + Create alert
        </button>
        <button type="button" className="copy-debug__btn" onClick={() => void copyToClipboard(formatAllAlertsForClipboard(), onToast, 'all alerts')}>
          Copy entire tab
        </button>
        <button
          type="button"
          className="copy-debug__btn"
          onClick={() => {
            if (window.confirm('Clear all saved alert overrides on this device?')) {
              clearAllAlertCopyOverrides();
              onSaved();
              onToast('Cleared all alert overrides');
            }
          }}
          disabled={overrideCount === 0}
        >
          Reset all live overrides
        </button>
        <Link to="/account/alerts" className="copy-debug__btn">
          Live alerts page
        </Link>
      </div>
      <nav className="copy-debug__nav" aria-label="Account alert categories">
        {categories.map((cat) => (
          <a key={cat.categoryKey} href={`#alert-${slugify(cat.label)}`}>
            {cat.sortOrder}. {cat.label}
          </a>
        ))}
        {customVariants.length > 0 ? (
          <a href="#custom-alerts">Custom drafts ({customVariants.length})</a>
        ) : null}
      </nav>
      {categories.map((cat) => (
        <section key={cat.categoryKey} id={`alert-${slugify(cat.label)}`} className="copy-debug__category">
          <div className="copy-debug__category-head">
            <h2>
              {cat.sortOrder}. {cat.label}
            </h2>
            <p>{cat.description}</p>
          </div>
          <div className="copy-debug__grid">
            {cat.entries.map((entry) => (
              <AlertCard key={entry.variantId} entry={entry} onSaved={onSaved} onToast={onToast} />
            ))}
          </div>
        </section>
      ))}
      <section id="custom-alerts" className="copy-debug__category copy-debug__category--custom">
        <div className="copy-debug__category-head">
          <h2>Custom alert drafts</h2>
          <p>Duplicates and new alerts you create. Link to a catalog variant to push copy live on Save.</p>
        </div>
        {customVariants.length === 0 ? (
          <p className="copy-debug__empty">No custom drafts yet — use <strong>Duplicate</strong> on a catalog card or <strong>+ Create alert</strong>.</p>
        ) : (
          <div className="copy-debug__grid">
            {customVariants.map((v) => (
              <CustomAlertCard key={v.variantId} variant={v} catalogIds={catalogIds} onSaved={onSaved} onToast={onToast} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default function CopyDebugPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: CopyDebugTab = searchParams.get('tab') === 'alerts' ? 'alerts' : 'nudges';
  const [toast, setToast] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  const bumpRevision = useCallback(() => setRevision((r) => r + 1), []);

  useEffect(() => {
    const handler = () => bumpRevision();
    window.addEventListener(COPY_DEBUG_UPDATED_EVENT, handler);
    return () => window.removeEventListener(COPY_DEBUG_UPDATED_EVENT, handler);
  }, [bumpRevision]);

  const setTab = useCallback(
    (next: CopyDebugTab) => {
      setSearchParams(next === 'nudges' ? {} : { tab: next }, { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setSearchParams]
  );

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  return (
    <div className="copy-debug">
      <div className="copy-debug__inner">
        <header className="copy-debug__header">
          <h1>Copy editor — PSA nudges &amp; account alerts</h1>
          <div className="copy-debug__tabs" role="tablist" aria-label="Copy debug sections">
            <button type="button" role="tab" aria-selected={tab === 'nudges'} className={`copy-debug__tab${tab === 'nudges' ? ' copy-debug__tab--active' : ''}`} onClick={() => setTab('nudges')}>
              PSA proactive nudges
            </button>
            <button type="button" role="tab" aria-selected={tab === 'alerts'} className={`copy-debug__tab${tab === 'alerts' ? ' copy-debug__tab--active' : ''}`} onClick={() => setTab('alerts')}>
              Account alerts
            </button>
          </div>
          <div className="copy-debug__toolbar">
            <Link to="/home/tools" className="copy-debug__btn">
              ← Tools
            </Link>
          </div>
        </header>

        <div role="tabpanel" hidden={tab !== 'nudges'}>
          {tab === 'nudges' ? <NudgesPanel revision={revision} onSaved={bumpRevision} onToast={showToast} /> : null}
        </div>
        <div role="tabpanel" hidden={tab !== 'alerts'}>
          {tab === 'alerts' ? <AlertsPanel revision={revision} onSaved={bumpRevision} onToast={showToast} /> : null}
        </div>
      </div>
      {toast ? <div className="copy-debug__toast">{toast}</div> : null}
    </div>
  );
}
