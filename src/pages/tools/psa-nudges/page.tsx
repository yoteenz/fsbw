import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PSA_NUDGE_BUBBLE_SRC } from '../../../constants/psaConfig';
import {
  formatFullPsaNudgeCatalogForCopy,
  formatPsaNudgeCatalogEntryForCopy,
  getPsaProactiveNudgeCatalog,
  type PsaNudgeCatalogEntry,
} from '../../../utils/psaProactiveNudgeCatalog';
import './psaNudgeDebug.css';

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
    <div className="psa-nudge-debug__field">
      <label htmlFor={`field-${label}`}>{label}</label>
      <div className="psa-nudge-debug__field-row">
        <textarea id={`field-${label}`} readOnly value={value} rows={value.includes('\n') ? 3 : 2} />
        <button type="button" className="psa-nudge-debug__copy" onClick={() => onCopy(value, label)}>
          Copy
        </button>
      </div>
    </div>
  );
}

function NudgePreview({ headline, body }: { headline: string; body?: string }) {
  return (
    <div className="psa-nudge-debug__preview" aria-hidden>
      <img className="psa-nudge-debug__preview-art" src={PSA_NUDGE_BUBBLE_SRC} alt="" draggable={false} />
      <div className="psa-nudge-debug__preview-content">
        <span className="psa-nudge-debug__preview-headline">{headline}</span>
        {body ? <span className="psa-nudge-debug__preview-body">{body}</span> : null}
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
  return (
    <article className="psa-nudge-debug__card">
      <div className="psa-nudge-debug__card-top">
        <span className="psa-nudge-debug__variant-label">{entry.variantLabel}</span>
        <span className="psa-nudge-debug__variant-id">{entry.variantId}</span>
      </div>
      <div className="psa-nudge-debug__preview-wrap">
        <NudgePreview headline={entry.headline} body={entry.body} />
      </div>
      <div className="psa-nudge-debug__fields">
        <CopyField label="Headline (Bohemy · lowercase in UI)" value={entry.headline} onCopy={onCopy} />
        <CopyField label="Body (Futura · red · uppercase in UI)" value={entry.body ?? ''} onCopy={onCopy} />
        <CopyField label="Prefilled chat message (on tap)" value={entry.prefilledMessage ?? ''} onCopy={onCopy} />
        <div className="psa-nudge-debug__field-row">
          <button
            type="button"
            className="psa-nudge-debug__btn"
            style={{ width: '100%' }}
            onClick={() => onCopy(formatPsaNudgeCatalogEntryForCopy(entry), 'full block')}
          >
            Copy full block
          </button>
        </div>
      </div>
      <p className="psa-nudge-debug__meta">
        Priority {entry.priority} · Pages: {entry.pageContexts.join(', ')} · Action: {entry.actionLabel} →{' '}
        {entry.actionPath}
        {entry.notes ? ` · ${entry.notes}` : ''}
      </p>
    </article>
  );
}

export default function PsaNudgesDebugPage() {
  const categories = useMemo(() => getPsaProactiveNudgeCatalog(), []);
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
    void copyText(formatFullPsaNudgeCatalogForCopy(categories), 'entire catalog');
  }, [categories, copyText]);

  return (
    <div className="psa-nudge-debug">
      <div className="psa-nudge-debug__inner">
        <header className="psa-nudge-debug__header">
          <h1>PSA proactive nudge copy — debug</h1>
          <p>
            Every proactive FAB nudge variant, grouped by kind (priority order). Headline + body match the live
            thought bubble; prefilled text opens in chat when the nudge is tapped. Edit copy here for review, then
            send revised strings back to wire into{' '}
            <code style={{ fontSize: '10px' }}>psaProactiveNudges.ts</code> /{' '}
            <code style={{ fontSize: '10px' }}>psaOrderCelebrations.ts</code>.
          </p>
          <div className="psa-nudge-debug__toolbar">
            <button type="button" className="psa-nudge-debug__btn psa-nudge-debug__btn--primary" onClick={copyAll}>
              Copy entire catalog
            </button>
            <Link to="/home/tools" className="psa-nudge-debug__btn" style={{ textDecoration: 'none' }}>
              ← Tools
            </Link>
          </div>
        </header>

        <nav className="psa-nudge-debug__nav" aria-label="Nudge categories">
          {categories.map((cat) => (
            <a key={`${cat.kind}-${cat.sortOrder}`} href={`#${slugify(cat.label)}`}>
              {cat.sortOrder}. {cat.label}
            </a>
          ))}
        </nav>

        {categories.map((cat) => (
          <section key={`${cat.kind}-${cat.sortOrder}`} id={slugify(cat.label)} className="psa-nudge-debug__category">
            <div className="psa-nudge-debug__category-head">
              <h2>
                {cat.sortOrder}. {cat.label}
              </h2>
              <p>{cat.description}</p>
            </div>
            <div className="psa-nudge-debug__grid">
              {cat.entries.map((entry) => (
                <NudgeCard key={entry.variantId} entry={entry} onCopy={copyText} />
              ))}
            </div>
          </section>
        ))}
      </div>
      {toast ? <div className="psa-nudge-debug__toast">{toast}</div> : null}
    </div>
  );
}
