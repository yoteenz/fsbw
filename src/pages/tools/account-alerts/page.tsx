import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  formatAccountAlertEntryForCopy,
  formatFullAccountAlertsCatalogForCopy,
  getAccountAlertsCatalog,
  type AccountAlertCatalogEntry,
} from '../../../utils/accountAlertsCatalog';
import './accountAlertsDebug.css';

function slugify(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function CopyField({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: (text: string, label: string) => void;
}) {
  return (
    <div className="account-alerts-debug__field">
      <label htmlFor={`alert-field-${label}`}>{label}</label>
      <div className="account-alerts-debug__field-row">
        <textarea id={`alert-field-${label}`} readOnly value={value} rows={value.length > 60 ? 3 : 2} />
        <button type="button" className="account-alerts-debug__copy" onClick={() => onCopy(value, label)}>
          Copy
        </button>
      </div>
    </div>
  );
}

function AlertPreview({ entry }: { entry: AccountAlertCatalogEntry }) {
  const titleClass =
    entry.rowVariant === 'consult_offer_ready'
      ? 'account-alerts-debug__preview-title account-alerts-debug__preview-title--consult'
      : 'account-alerts-debug__preview-title';

  return (
    <div className="account-alerts-debug__preview-row" aria-hidden>
      <img
        className="account-alerts-debug__preview-avatar"
        src="/assets/profile-thumb.png"
        alt=""
        draggable={false}
      />
      <div className="account-alerts-debug__preview-body-col">
        <p className={titleClass}>{entry.title}</p>
        <p className="account-alerts-debug__preview-message">{entry.message}</p>
        {entry.actionText ? (
          <span className="account-alerts-debug__preview-action">{entry.actionText}</span>
        ) : null}
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
  return (
    <article className="account-alerts-debug__card">
      <div className="account-alerts-debug__card-top">
        <span className="account-alerts-debug__variant-label">{entry.variantLabel}</span>
        <span className="account-alerts-debug__variant-id">{entry.variantId}</span>
      </div>
      <div className="account-alerts-debug__preview-wrap">
        <AlertPreview entry={entry} />
      </div>
      <div className="account-alerts-debug__fields">
        <CopyField label="Title (row 1 · Grace / Futura consult)" value={entry.title} onCopy={onCopy} />
        <CopyField label="Message (row 2 · Futura gray)" value={entry.message} onCopy={onCopy} />
        <CopyField label="Action link (row 3 · red)" value={entry.actionText} onCopy={onCopy} />
        <CopyField label="Action route" value={entry.actionRoute} onCopy={onCopy} />
        <div className="account-alerts-debug__field-row">
          <button
            type="button"
            className="account-alerts-debug__btn"
            style={{ width: '100%' }}
            onClick={() => onCopy(formatAccountAlertEntryForCopy(entry), 'full block')}
          >
            Copy full block
          </button>
        </div>
      </div>
      <p className="account-alerts-debug__meta">
        ID: {entry.idPattern} · {entry.rowVariant} · {entry.source}
        {entry.notes ? ` · ${entry.notes}` : ''}
        <br />
        {entry.newAccountOnly ? <span className="account-alerts-debug__badge">New account</span> : null}
        {entry.activityAccountOnly ? (
          <span className="account-alerts-debug__badge">Activity account</span>
        ) : null}
        {entry.adminOnly ? <span className="account-alerts-debug__badge">Admin only</span> : null}
      </p>
    </article>
  );
}

export default function AccountAlertsDebugPage() {
  const categories = useMemo(() => getAccountAlertsCatalog(), []);
  const [toast, setToast] = useState<string | null>(null);

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

  const copyAll = useCallback(() => {
    void copyText(formatFullAccountAlertsCatalogForCopy(categories), 'entire catalog');
  }, [categories, copyText]);

  const totalVariants = useMemo(
    () => categories.reduce((sum, c) => sum + c.entries.length, 0),
    [categories]
  );

  return (
    <div className="account-alerts-debug">
      <div className="account-alerts-debug__inner">
        <header className="account-alerts-debug__header">
          <h1>Account alerts copy — debug</h1>
          <p>
            Every alert row variant on <strong>/account/alerts</strong>, grouped by category in display order (
            {categories.length} categories, {totalVariants} variants). Preview matches the live list: title, gray
            message, red action link. Copy fields are paste-ready for rewording — wire changes in{' '}
            <code style={{ fontSize: '10px' }}>notifications/page.tsx</code>,{' '}
            <code style={{ fontSize: '10px' }}>orderAccountAlerts.ts</code>, and related alert append helpers.
          </p>
          <div className="account-alerts-debug__toolbar">
            <button
              type="button"
              className="account-alerts-debug__btn account-alerts-debug__btn--primary"
              onClick={copyAll}
            >
              Copy entire catalog
            </button>
            <Link to="/tools/psa-nudges" className="account-alerts-debug__btn">
              PSA nudges debug
            </Link>
            <Link to="/home/tools" className="account-alerts-debug__btn">
              ← Tools
            </Link>
            <Link to="/account/alerts" className="account-alerts-debug__btn">
              Live alerts page
            </Link>
          </div>
        </header>

        <nav className="account-alerts-debug__nav" aria-label="Alert categories">
          {categories.map((cat) => (
            <a key={cat.categoryKey} href={`#${slugify(cat.label)}`}>
              {cat.sortOrder}. {cat.label}
            </a>
          ))}
        </nav>

        {categories.map((cat) => (
          <section id={slugify(cat.label)} className="account-alerts-debug__category">
            <div className="account-alerts-debug__category-head">
              <h2>
                {cat.sortOrder}. {cat.label}
              </h2>
              <p>{cat.description}</p>
            </div>
            <div className="account-alerts-debug__grid">
              {cat.entries.map((entry) => (
                <AlertCard key={entry.variantId} entry={entry} onCopy={copyText} />
              ))}
            </div>
          </section>
        ))}
      </div>
      {toast ? <div className="account-alerts-debug__toast">{toast}</div> : null}
    </div>
  );
}
