/**
 * Founder Intelligence Capsule™ — public download hub (/founder-intelligence)
 */
import { useEffect, useState } from 'react';
import {
  FOUNDER_INTELLIGENCE_CAPSULE_PERMANENT_LATEST_PATH,
  FOUNDER_INTELLIGENCE_CAPSULE_PUBLIC_RELEASE_PATH,
} from '../../studio-os-core/founder-intelligence-capsule-export/constants';

type FicReleaseManifest = {
  currentVersion: string;
  generatedAt: string;
  validationStatus: 'pass' | 'fail';
  documentCount: number;
  artifact?: string;
  checksumSha256?: string;
  packageHealth?: number;
  releaseHistory?: { version: string; generatedAt: string; downloadPath: string; sizeBytes?: number }[];
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(165deg, #fafafa 0%, #f5f0eb 100%)',
    color: '#0f172a',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  } as const,
  container: { maxWidth: 720, margin: '0 auto', padding: '40px 20px 64px' } as const,
  h1: { fontSize: 32, fontWeight: 600, letterSpacing: '-0.03em', margin: '0 0 8px' } as const,
  sub: { fontSize: 16, color: '#64748b', lineHeight: 1.55, margin: '0 0 28px' } as const,
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
    background: '#92704A',
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
  row: { display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 14 } as const,
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export default function FounderIntelligenceDownloadPage() {
  const [release, setRelease] = useState<FicReleaseManifest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void fetch(FOUNDER_INTELLIGENCE_CAPSULE_PUBLIC_RELEASE_PATH)
      .then((r) => {
        if (!r.ok) throw new Error('Release manifest unavailable');
        return r.json() as Promise<FicReleaseManifest>;
      })
      .then(setRelease)
      .catch(() => setError('Could not load capsule status. Try again after the next deploy.'));
  }, []);

  const permanentUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${FOUNDER_INTELLIGENCE_CAPSULE_PERMANENT_LATEST_PATH}`
      : `https://fsbw.vercel.app${FOUNDER_INTELLIGENCE_CAPSULE_PERMANENT_LATEST_PATH}`;

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(permanentUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      /* fallback */
    }
  };

  const verified = release?.validationStatus === 'pass';

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Studio OS · Founder Intelligence Capsule™</p>
        <h1 style={styles.h1}>Founder Intelligence</h1>
        <p style={styles.sub}>
          Why Studio OS exists — strategy, vision, business model, and institutional memory. Pair with the AI Context
          Capsule (what) and Studio DNA Capsule (how).
        </p>

        <div style={styles.card}>
          {verified ? (
            <span style={styles.badge}>Ready for AI onboarding</span>
          ) : (
            <span style={{ ...styles.badge, background: '#fef2f2', color: '#b91c1c' }}>Status unavailable</span>
          )}
          <div style={styles.row}>
            <span style={{ color: '#64748b' }}>Version</span>
            <strong>v{release?.currentVersion ?? '—'}</strong>
          </div>
          <div style={styles.row}>
            <span style={{ color: '#64748b' }}>Generated</span>
            <strong>{release?.generatedAt ? formatDate(release.generatedAt) : '—'}</strong>
          </div>
          <div style={styles.row}>
            <span style={{ color: '#64748b' }}>Documents</span>
            <strong>{release?.documentCount ?? '—'}</strong>
          </div>
          <div style={styles.row}>
            <span style={{ color: '#64748b' }}>Validation</span>
            <strong>{verified ? 'Passed' : '—'}</strong>
          </div>
          {release?.checksumSha256 ? (
            <div style={{ ...styles.row, borderBottom: 'none', flexDirection: 'column' as const, alignItems: 'flex-start' }}>
              <span style={{ color: '#64748b', marginBottom: 4 }}>Checksum (SHA-256)</span>
              <code style={styles.mono}>{release.checksumSha256}</code>
            </div>
          ) : null}
          <p style={{ margin: '20px 0 8px', fontSize: 13, color: '#64748b' }}>Permanent download URL</p>
          <code style={{ ...styles.mono, display: 'block', marginBottom: 16 }}>{permanentUrl}</code>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <a
              href={FOUNDER_INTELLIGENCE_CAPSULE_PERMANENT_LATEST_PATH}
              style={styles.btn}
              download={release?.artifact ?? undefined}
            >
              Download Founder Intelligence Capsule
            </a>
            <button
              type="button"
              style={{ ...styles.btn, background: '#fff', color: '#92704A', border: '1px solid #cbd5e1' }}
              onClick={() => void copyUrl()}
            >
              {copied ? 'URL copied' : 'Copy permanent URL'}
            </button>
          </div>
        </div>

        {error ? <p style={{ color: '#dc2626' }}>{error}</p> : null}

        <div style={styles.card}>
          <h2 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 600 }}>Complete onboarding (three capsules)</h2>
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.9 }}>
            <li>
              <a href="/context/latest">AI Context Capsule</a> — what the project is
            </li>
            <li>
              <a href="/downloads/studio-dna-capsules/latest.zip">Studio DNA Capsule</a> — how Studio OS thinks
            </li>
            <li>
              <a href={FOUNDER_INTELLIGENCE_CAPSULE_PERMANENT_LATEST_PATH}>Founder Intelligence Capsule</a> — why it
              exists
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
