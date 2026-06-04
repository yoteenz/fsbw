import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PSA_NUDGE_BUBBLE_SRC } from '../../../constants/psaConfig';
import {
  type AccountAlertCatalogEntry,
} from '../../../utils/accountAlertsCatalog';
import {
  type PsaNudgeCatalogEntry,
} from '../../../utils/psaProactiveNudgeCatalog';
import {
  COPY_DEBUG_UPDATED_EVENT,
  COPY_DEBUG_SAMPLE_VARS,
  clearAllAlertCopyOverrides,
  clearAllNudgeCopyOverrides,
  countAlertCopyOverrides,
  countNudgeCopyOverrides,
  deleteAlertCopyOverride,
  deleteNudgeCopyOverride,
  getAccountAlertsCatalog,
  getAlertCopyTemplates,
  getNudgeCopyTemplates,
  getPsaProactiveNudgeCatalog,
  hasAlertCopyOverride,
  hasNudgeCopyOverride,
  interpolateCopy,
  saveAlertCopyOverride,
  saveNudgeCopyOverride,
  type AlertCopyTemplates,
  type NudgeCopyTemplates,
} from '../../../utils/copyDebugResolve';
import './copyDebug.css';

type CopyDebugTab = 'nudges' | 'alerts';

function slugify(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
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
        <EditableField
          id={`${prefix}-headline`}
          label="Headline"
          value={draft.headline}
          onChange={(v) => setDraft((d) => ({ ...d, headline: v }))}
        />
        <EditableField
          id={`${prefix}-body`}
          label="Body"
          hint="Use {orderRef}, {hoursLeft}, {productName}, {unitLabel}, {status}, etc."
          value={draft.body}
          onChange={(v) => setDraft((d) => ({ ...d, body: v }))}
        />
        <EditableField
          id={`${prefix}-prefilled`}
          label="Prefilled chat message"
          value={draft.prefilledMessage}
          onChange={(v) => setDraft((d) => ({ ...d, prefilledMessage: v }))}
        />
        <EditableField
          id={`${prefix}-action`}
          label="Action label"
          value={draft.actionLabel}
          onChange={(v) => setDraft((d) => ({ ...d, actionLabel: v }))}
        />
        <div className="copy-debug__card-actions">
          <button type="button" className="copy-debug__btn copy-debug__btn--primary" onClick={save}>
            Save
          </button>
          <button type="button" className="copy-debug__btn" onClick={reset} disabled={!isCustom}>
            Reset
          </button>
        </div>
      </div>
      <p className="copy-debug__meta">
        Priority {entry.priority} · Pages: {entry.pageContexts.join(', ')} · Action path: {entry.actionPath}
        {entry.notes ? ` · ${entry.notes}` : ''}
      </p>
    </article>
  );
}

function AlertPreview({ title, message, actionText, rowVariant }: { title: string; message: string; actionText: string; rowVariant: AccountAlertCatalogEntry['rowVariant'] }) {
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
        <EditableField
          id={`${prefix}-title`}
          label="Title"
          value={draft.title}
          onChange={(v) => setDraft((d) => ({ ...d, title: v }))}
        />
        <EditableField
          id={`${prefix}-message`}
          label="Message"
          hint="Use {orderNumber}, {unitName}, {voucherType}, {timeLabel}, {balance}, etc."
          value={draft.message}
          onChange={(v) => setDraft((d) => ({ ...d, message: v }))}
        />
        <EditableField
          id={`${prefix}-action`}
          label="Action link"
          value={draft.actionText}
          onChange={(v) => setDraft((d) => ({ ...d, actionText: v }))}
        />
        <p className="copy-debug__field-hint">Route (read-only): {entry.actionRoute}</p>
        <div className="copy-debug__card-actions">
          <button type="button" className="copy-debug__btn copy-debug__btn--primary" onClick={save}>
            Save
          </button>
          <button type="button" className="copy-debug__btn" onClick={reset} disabled={!isCustom}>
            Reset
          </button>
        </div>
      </div>
      <p className="copy-debug__meta">
        ID: {entry.idPattern} · {entry.rowVariant} · {entry.source}
        {entry.notes ? ` · ${entry.notes}` : ''}
        <br />
        {entry.newAccountOnly ? <span className="copy-debug__badge">New account</span> : null}
        {entry.activityAccountOnly ? <span className="copy-debug__badge">Activity account</span> : null}
        {entry.adminOnly ? <span className="copy-debug__badge">Admin only</span> : null}
      </p>
    </article>
  );
}

function NudgesPanel({ revision, onSaved, onToast }: { revision: number; onSaved: () => void; onToast: (msg: string) => void }) {
  const categories = useMemo(() => getPsaProactiveNudgeCatalog(), [revision]);
  const overrideCount = countNudgeCopyOverrides();

  return (
    <>
      <p className="copy-debug__intro">
        Edit copy below and click <strong>Save</strong> — changes apply immediately to proactive FAB nudges in this
        browser. Use <code>{'{placeholders}'}</code> for dynamic bits (preview uses sample values).{' '}
        <strong>Reset</strong> removes your saved override.
        {overrideCount > 0 ? ` ${overrideCount} custom variant${overrideCount === 1 ? '' : 's'}.` : ''}
      </p>
      <div className="copy-debug__toolbar">
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
          Reset all nudges
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
    </>
  );
}

function AlertsPanel({ revision, onSaved, onToast }: { revision: number; onSaved: () => void; onToast: (msg: string) => void }) {
  const categories = useMemo(() => getAccountAlertsCatalog(), [revision]);
  const totalVariants = useMemo(() => categories.reduce((sum, c) => sum + c.entries.length, 0), [categories]);
  const overrideCount = countAlertCopyOverrides();

  return (
    <>
      <p className="copy-debug__intro">
        Edit account alert rows and save — updates <strong>/account/alerts</strong> and related notification copy in this
        browser ({categories.length} categories, {totalVariants} variants).
        {overrideCount > 0 ? ` ${overrideCount} custom variant${overrideCount === 1 ? '' : 's'}.` : ''}
      </p>
      <div className="copy-debug__toolbar">
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
          Reset all alerts
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
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'nudges'}
              className={`copy-debug__tab${tab === 'nudges' ? ' copy-debug__tab--active' : ''}`}
              onClick={() => setTab('nudges')}
            >
              PSA proactive nudges
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'alerts'}
              className={`copy-debug__tab${tab === 'alerts' ? ' copy-debug__tab--active' : ''}`}
              onClick={() => setTab('alerts')}
            >
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
