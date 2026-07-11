/**
 * Delta Context Capsule — incremental update hub (/context-updates)
 */
import { useEffect, useState } from 'react';
import {
  DELTA_CONTEXT_PERMANENT_LATEST_PATH,
  DELTA_CONTEXT_PUBLIC_RELEASE_PATH,
  DELTA_CONTEXT_UPDATE_PROMPT,
} from '../../studio-os-core/delta-context-export/constants';

type DeltaRelease = {
  currentVersion: string;
  generatedAt: string;
  validationStatus: 'pass' | 'fail';
  changeCount: number;
  checksumSha256?: string;
  artifact?: string;
  baseOnboardingVersionRequired?: string;
  currentOnboardingPackVersion?: string;
  compatibilityStatus?: string;
  categoriesIncluded?: string[];
  releaseHistory?: {
    version: string;
    generatedAt: string;
    changeCount: number;
    compatibilityStatus?: string;
    downloadPath?: string;
  }[];
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(165deg, #fffbeb 0%, #fef3c7 100%)',
    color: '#0f172a',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  } as const,
  container: { maxWidth: 760, margin: '0 auto', padding: '40px 20px 64px' } as const,
  card: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 14,
    padding: 24,
    marginBottom: 16,
    boxShadow: '0 4px 24px rgba(15,23,42,0.04)',
  } as const,
  badge: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: 999,
    background: '#ecfdf5',
    color: '#047857',
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 16,
  } as const,
  btn: {
    display: 'inline-block',
    padding: '14px 24px',
    borderRadius: 10,
    background: '#b45309',
    color: '#fff',
    fontSize: 16,
    fontWeight: 600,
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    minHeight: 48,
  } as const,
  mono: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 13,
    wordBreak: 'break-all' as const,
    color: '#475569',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    padding: '8px 0',
    borderBottom: '1px solid #f1f5f9',
    fontSize: 14,
  } as const,
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export default function ContextUpdatesPage() {
  const [release, setRelease] = useState<DeltaRelease | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  useEffect(() => {
    void fetch(DELTA_CONTEXT_PUBLIC_RELEASE_PATH)
      .then((r) => (r.ok ? (r.json() as Promise<DeltaRelease>) : Promise.reject()))
      .then(setRelease)
      .catch(() => setRelease(null));
  }, []);

  const permanentUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${DELTA_CONTEXT_PERMANENT_LATEST_PATH}`
      : `https://fsbw.vercel.app${DELTA_CONTEXT_PERMANENT_LATEST_PATH}`;

  const verified = release?.validationStatus === 'pass';

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <p style={{ fontSize: 13, color: '#92400e', margin: 0 }}>Studio OS · Incremental Context Updates</p>
        <h1 style={{ fontSize: 32, fontWeight: 600, margin: '8px 0' }}>Delta Context Capsule</h1>
        <p style={{ color: '#64748b', lineHeight: 1.55 }}>
          Synchronize already-onboarded AI collaborators with only meaningful capsule changes — without repeating full
          onboarding.
        </p>

        <div style={styles.card}>
          {verified ? (
            <span style={styles.badge}>Validated delta ready</span>
          ) : (
            <span style={{ ...styles.badge, background: '#fef2f2', color: '#b91c1c' }}>Status unavailable</span>
          )}
          <div style={styles.row}>
            <span style={{ color: '#64748b' }}>Latest delta</span>
            <strong>v{release?.currentVersion ?? '—'}</strong>
          </div>
          <div style={styles.row}>
            <span style={{ color: '#64748b' }}>Generated</span>
            <strong>{release?.generatedAt ? formatDate(release.generatedAt) : '—'}</strong>
          </div>
          <div style={styles.row}>
            <span style={{ color: '#64748b' }}>Changes included</span>
            <strong>{release?.changeCount ?? '—'}</strong>
          </div>
          <div style={styles.row}>
            <span style={{ color: '#64748b' }}>Base onboarding required</span>
            <strong>v{release?.baseOnboardingVersionRequired ?? '—'}</strong>
          </div>
          <div style={styles.row}>
            <span style={{ color: '#64748b' }}>Current onboarding pack</span>
            <strong>v{release?.currentOnboardingPackVersion ?? '—'}</strong>
          </div>
          <div style={styles.row}>
            <span style={{ color: '#64748b' }}>Compatibility</span>
            <strong>{release?.compatibilityStatus ?? '—'}</strong>
          </div>
          <div style={styles.row}>
            <span style={{ color: '#64748b' }}>Validation</span>
            <strong>{verified ? 'Passed' : '—'}</strong>
          </div>
          <p style={{ fontSize: 13, color: '#64748b', margin: '16px 0 8px' }}>Permanent download URL</p>
          <code style={{ ...styles.mono, display: 'block', marginBottom: 16 }}>{permanentUrl}</code>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <a
              href={DELTA_CONTEXT_PERMANENT_LATEST_PATH}
              style={styles.btn}
              download={release?.artifact ?? undefined}
            >
              Download Delta Capsule
            </a>
            <button
              type="button"
              style={{ ...styles.btn, background: '#fff', color: '#b45309', border: '1px solid #cbd5e1' }}
              onClick={() => {
                void navigator.clipboard.writeText(permanentUrl).then(() => {
                  setCopiedUrl(true);
                  window.setTimeout(() => setCopiedUrl(false), 2500);
                });
              }}
            >
              {copiedUrl ? 'URL copied' : 'Copy download URL'}
            </button>
            <button
              type="button"
              style={{ ...styles.btn, background: '#fff', color: '#b45309', border: '1px solid #cbd5e1' }}
              onClick={() => {
                void navigator.clipboard.writeText(DELTA_CONTEXT_UPDATE_PROMPT).then(() => {
                  setCopiedPrompt(true);
                  window.setTimeout(() => setCopiedPrompt(false), 2500);
                });
              }}
            >
              {copiedPrompt ? 'Prompt copied' : 'Copy Update Prompt'}
            </button>
          </div>
        </div>

        {release?.categoriesIncluded?.length ? (
          <div style={styles.card}>
            <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>Categories in latest delta</h2>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8, fontSize: 14 }}>
              {release.categoriesIncluded.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div style={styles.card}>
          <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>Release history</h2>
          {release?.releaseHistory?.length ? (
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', fontSize: 14 }}>
              {release.releaseHistory.map((h) => (
                <li
                  key={`${h.version}-${h.generatedAt}`}
                  style={{ padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}
                >
                  <strong>v{h.version}</strong> — {formatDate(h.generatedAt)} — {h.changeCount} change(s)
                  {h.compatibilityStatus ? ` · ${h.compatibilityStatus}` : ''}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>No history yet.</p>
          )}
        </div>

        <div style={styles.card}>
          <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>Related</h2>
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8, fontSize: 14 }}>
            <li>
              <a href="/onboarding/latest">Unified Onboarding Pack</a> — full initial onboarding
            </li>
            <li>
              <a href="/collaboration-intelligence/latest">Collaboration Intelligence Capsule</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
