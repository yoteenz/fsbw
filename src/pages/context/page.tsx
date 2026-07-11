/**
 * AI Context Capsule™ — public download hub (/context)
 */
import { useEffect, useState } from 'react';
import {
  CONTEXT_CAPSULE_PERMANENT_LATEST_PATH,
  CONTEXT_CAPSULE_PUBLIC_RELEASE_PATH,
  type ContextCapsuleReleaseManifest,
} from '../../studio-os-core/context-capsule-export/constants';

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(165deg, #fafafa 0%, #f1f5f9 100%)',
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
    background: '#0f172a',
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
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export default function ContextCapsuleDownloadPage() {
  const [release, setRelease] = useState<ContextCapsuleReleaseManifest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void fetch(CONTEXT_CAPSULE_PUBLIC_RELEASE_PATH)
      .then((r) => {
        if (!r.ok) throw new Error('Release manifest unavailable');
        return r.json() as Promise<ContextCapsuleReleaseManifest>;
      })
      .then(setRelease)
      .catch(() => setError('Could not load capsule status. Try again after the next deploy.'));
  }, []);

  const permanentUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${CONTEXT_CAPSULE_PERMANENT_LATEST_PATH}`
      : `https://fsbw.vercel.app${CONTEXT_CAPSULE_PERMANENT_LATEST_PATH}`;

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(permanentUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      /* fallback: user can select mono block */
    }
  };

  const verified = release?.validationStatus === 'pass';
  const health = release?.packageHealth ?? (verified ? 100 : 0);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Studio OS · AI Context Capsule™</p>
        <h1 style={styles.h1}>Download Latest Capsule</h1>
        <p style={styles.sub}>
          One permanent URL — always the newest validated release. Bookmark it once; never update your workflow again.
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
            <span style={{ color: '#64748b' }}>Status</span>
            <strong>{verified ? 'Verified' : release?.validationStatus?.toUpperCase() ?? '—'}</strong>
          </div>
          <div style={styles.row}>
            <span style={{ color: '#64748b' }}>Generated</span>
            <strong>{release?.generatedAt ? formatDate(release.generatedAt) : '—'}</strong>
          </div>
          <div style={styles.row}>
            <span style={{ color: '#64748b' }}>Documents</span>
            <strong>
              {release?.documentCount ?? '—'} / {release?.documentCount ?? '—'}
            </strong>
          </div>
          <div style={styles.row}>
            <span style={{ color: '#64748b' }}>Validation</span>
            <strong>{verified ? 'Passed' : '—'}</strong>
          </div>
          <div style={styles.row}>
            <span style={{ color: '#64748b' }}>Capsule health</span>
            <strong>{health}%</strong>
          </div>
          <div style={styles.row}>
            <span style={{ color: '#64748b' }}>Manifest</span>
            <strong>{release?.manifestDocumentCount ?? release?.documentCount ?? '—'} docs</strong>
          </div>
          {release?.checksumSha256 ? (
            <div style={{ ...styles.row, borderBottom: 'none', flexDirection: 'column' as const, alignItems: 'flex-start' }}>
              <span style={{ color: '#64748b', marginBottom: 4 }}>Checksum (SHA-256)</span>
              <code style={styles.mono}>{release.checksumSha256}</code>
            </div>
          ) : null}
          {release?.releaseHistory?.[0]?.sizeBytes ? (
            <div style={styles.row}>
              <span style={{ color: '#64748b' }}>ZIP size</span>
              <strong>{(release.releaseHistory[0].sizeBytes / 1024).toFixed(1)} KB</strong>
            </div>
          ) : null}

          <p style={{ margin: '20px 0 8px', fontSize: 13, color: '#64748b' }}>Permanent download URL</p>
          <code style={{ ...styles.mono, display: 'block', marginBottom: 16 }}>{permanentUrl}</code>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <a href={CONTEXT_CAPSULE_PERMANENT_LATEST_PATH} style={styles.btn} download>
              Download latest capsule
            </a>
            <button type="button" style={{ ...styles.btn, background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1' }} onClick={() => void copyUrl()}>
              {copied ? 'URL copied' : 'Copy permanent URL'}
            </button>
          </div>
        </div>

        {error ? <p style={{ color: '#dc2626' }}>{error}</p> : null}

        <div style={styles.card}>
          <h2 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 600 }}>Previous versions (archive)</h2>
          {!release?.releaseHistory?.length ? (
            <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>No archived versions listed yet.</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.8 }}>
              {release.releaseHistory.map((entry) => (
                <li key={entry.version}>
                  <strong>v{entry.version}</strong> · {formatDate(entry.generatedAt)} ·{' '}
                  <a href={entry.downloadPath} style={{ color: '#0f172a' }}>
                    Download
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
          Workflow: download all three capsules → attach ZIPs → paste onboarding prompt from{' '}
          <code style={styles.mono}>/admin/studio/context-capsule</code>. Pair with{' '}
          <a href="/founder-intelligence">Founder Intelligence</a> and Studio DNA for WHY + HOW.
        </p>
      </div>
    </div>
  );
}
