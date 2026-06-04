import { useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PSA_NUDGE_BUBBLE_SRC } from '../../../constants/psaConfig';
import {
  formatAccountAlertEntryForCopy,
  formatFullAccountAlertsCatalogForCopy,
  getAccountAlertsCatalog,
  type AccountAlertCatalogEntry,
} from '../../../utils/accountAlertsCatalog';
import {
  formatFullPsaNudgeCatalogForCopy,
  formatPsaNudgeCatalogEntryForCopy,
  getPsaProactiveNudgeCatalog,
  type PsaNudgeCatalogEntry,
} from '../../../utils/psaProactiveNudgeCatalog';
import './copyDebug.css';

type CopyDebugTab = 'nudges' | 'alerts';

function slugify(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function CopyField({
  id,
  label,
  value,
  onCopy,
}: {
  id: string;
  label: string;
  value: string;
  onCopy: (text: string, label: string) => void;
}) {
  return (
    <div className="copy-debug__field">
      <label htmlFor={id}>{label}</label>
      <div className="copy-debug__field-row">
        <textarea id={id} readOnly value={value} rows={value.includes('\n') ? 3 : value.length > 60 ? 3 : 2} />
        <button type="button" className="copy-debug__copy" onClick={() => onCopy(value, label)}>
          Copy
        </button>
      </div>
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
  onCopy,
}: {
  entry: PsaNudgeCatalogEntry;
  onCopy: (text: string, label: string) => void;
}) {
  const prefix = `nudge-${entry.variantId}`;
  return (
    <article className="copy-debug__card">
      <div className="copy-debug__card-top">
        <span className="copy-debug__variant-label">{entry.variantLabel}</span>
        <span className="copy-debug__variant-id">{entry.variantId}</span>
      </div>
      <div className="copy-debug__preview-wrap">
        <NudgePreview headline={entry.headline} body={entry.body} />
      </div>
      <div className="copy-debug__fields">
        <CopyField id={`${prefix}-headline`} label="Headline (Bohemy · lowercase in UI)" value={entry.headline} onCopy={onCopy} />
        <CopyField id={`${prefix}-body`} label="Body (Futura · red · uppercase in UI)" value={entry.body ?? ''} onCopy={onCopy} />
        <CopyField id={`${prefix}-prefilled`} label="Prefilled chat message (on tap)" value={entry.prefilledMessage ?? ''} onCopy={onCopy} />
        <div className="copy-debug__field-row">
          <button type="button" className="copy-debug__btn" style={{ width: '100%' }} onClick={() => onCopy(formatPsaNudgeCatalogEntryForCopy(entry), 'full block')}>
            Copy full block
          </button>
        </div>
      </div>
      <p className="copy-debug__meta">
        Priority {entry.priority} · Pages: {entry.pageContexts.join(', ')} · Action: {entry.actionLabel} → {entry.actionPath}
        {entry.notes ? ` · ${entry.notes}` : ''}
      </p>
    </article>
  );
}

function AlertPreview({ entry }: { entry: AccountAlertCatalogEntry }) {
  const titleClass =
    entry.rowVariant === 'consult_offer_ready'
      ? 'copy-debug__alert-preview-title copy-debug__alert-preview-title--consult'
      : 'copy-debug__alert-preview-title';

  return (
    <div className="copy-debug__alert-preview-row" aria-hidden>
      <img className="copy-debug__alert-preview-avatar" src="/assets/profile-thumb.png" alt="" draggable={false} />
      <div className="copy-debug__alert-preview-body-col">
        <p className={titleClass}>{entry.title}</p>
        <p className="copy-debug__alert-preview-message">{entry.message}</p>
        {entry.actionText ? <span className="copy-debug__alert-preview-action">{entry.actionText}</span> : null}
      </div>
    </div>
  );
}

function AlertCard({
  entry,
  onCopy,
}: {
  entry: AccountAlertCatalogEntry;
  onCopy: (text: string, label: string) => void;
}) {
  const prefix = `alert-${entry.variantId}`;
  return (
    <article className="copy-debug__card">
      <div className="copy-debug__card-top">
        <span className="copy-debug__variant-label">{entry.variantLabel}</span>
        <span className="copy-debug__variant-id">{entry.variantId}</span>
      </div>
      <div className="copy-debug__preview-wrap copy-debug__preview-wrap--alert">
        <AlertPreview entry={entry} />
      </div>
      <div className="copy-debug__fields">
        <CopyField id={`${prefix}-title`} label="Title (row 1 · Grace / Futura consult)" value={entry.title} onCopy={onCopy} />
        <CopyField id={`${prefix}-message`} label="Message (row 2 · Futura gray)" value={entry.message} onCopy={onCopy} />
        <CopyField id={`${prefix}-action`} label="Action link (row 3 · red)" value={entry.actionText} onCopy={onCopy} />
        <CopyField id={`${prefix}-route`} label="Action route" value={entry.actionRoute} onCopy={onCopy} />
        <div className="copy-debug__field-row">
          <button type="button" className="copy-debug__btn" style={{ width: '100%' }} onClick={() => onCopy(formatAccountAlertEntryForCopy(entry), 'full block')}>
            Copy full block
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

function NudgesPanel({ onCopy }: { onCopy: (text: string, label: string) => void }) {
  const categories = useMemo(() => getPsaProactiveNudgeCatalog(), []);

  return (
    <>
      <p className="copy-debug__intro">
        Every proactive FAB nudge variant, grouped by kind (priority order). Headline + body match the live thought
        bubble; prefilled text opens in chat when the nudge is tapped. Wire changes in{' '}
        <code style={{ fontSize: '10px' }}>psaProactiveNudges.ts</code> /{' '}
        <code style={{ fontSize: '10px' }}>psaOrderCelebrations.ts</code>.
      </p>
      <div className="copy-debug__toolbar">
        <button
          type="button"
          className="copy-debug__btn copy-debug__btn--primary"
          onClick={() => onCopy(formatFullPsaNudgeCatalogForCopy(categories), 'PSA nudge catalog')}
        >
          Copy entire tab
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
              <NudgeCard key={entry.variantId} entry={entry} onCopy={onCopy} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

function AlertsPanel({ onCopy }: { onCopy: (text: string, label: string) => void }) {
  const categories = useMemo(() => getAccountAlertsCatalog(), []);
  const totalVariants = useMemo(() => categories.reduce((sum, c) => sum + c.entries.length, 0), [categories]);

  return (
    <>
      <p className="copy-debug__intro">
        Every alert row on <strong>/account/alerts</strong> ({categories.length} categories, {totalVariants} variants).
        Preview matches the live list: title, gray message, red action link. Wire changes in{' '}
        <code style={{ fontSize: '10px' }}>notifications/page.tsx</code>,{' '}
        <code style={{ fontSize: '10px' }}>orderAccountAlerts.ts</code>, and related helpers.
      </p>
      <div className="copy-debug__toolbar">
        <button
          type="button"
          className="copy-debug__btn copy-debug__btn--primary"
          onClick={() => onCopy(formatFullAccountAlertsCatalogForCopy(categories), 'account alerts catalog')}
        >
          Copy entire tab
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
              <AlertCard key={entry.variantId} entry={entry} onCopy={onCopy} />
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

  const setTab = useCallback(
    (next: CopyDebugTab) => {
      setSearchParams(next === 'nudges' ? {} : { tab: next }, { replace: true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setSearchParams]
  );

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  }, []);

  const copyText = useCallback(
    async (text: string, label: string) => {
      try {
        await navigator.clipboard.writeText(text);
        showToast(`Copied ${label}`);
      } catch {
        showToast('Copy failed — select text manually');
      }
    },
    [showToast]
  );

  return (
    <div className="copy-debug">
      <div className="copy-debug__inner">
        <header className="copy-debug__header">
          <h1>Copy debug — PSA nudges &amp; account alerts</h1>
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
          {tab === 'nudges' ? <NudgesPanel onCopy={copyText} /> : null}
        </div>
        <div role="tabpanel" hidden={tab !== 'alerts'}>
          {tab === 'alerts' ? <AlertsPanel onCopy={copyText} /> : null}
        </div>
      </div>
      {toast ? <div className="copy-debug__toast">{toast}</div> : null}
    </div>
  );
}
