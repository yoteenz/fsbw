/**
 * Collaboration Intelligence Capsule™ — public download hub (/collaboration-intelligence)
 */
import { useEffect, useState } from 'react';
import {
  COLLABORATION_INTELLIGENCE_CAPSULE_PERMANENT_LATEST_PATH,
  COLLABORATION_INTELLIGENCE_CAPSULE_PUBLIC_RELEASE_PATH,
} from '../../studio-os-core/collaboration-intelligence-capsule-export/constants';

type CiReleaseManifest = {
  currentVersion: string;
  generatedAt: string;
  validationStatus: 'pass' | 'fail';
  documentCount: number;
  artifact?: string;
  checksumSha256?: string;
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(165deg, #f0f9ff 0%, #e0e7ff 100%)',
    color: '#0f172a',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  } as const,
  container: { maxWidth: 720, margin: '0 auto', padding: '40px 20px 64px' } as const,
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
    background: '#1e3a8a',
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

export default function CollaborationIntelligenceDownloadPage() {
  const [release, setRelease] = useState<CiReleaseManifest | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void fetch(COLLABORATION_INTELLIGENCE_CAPSULE_PUBLIC_RELEASE_PATH)
      .then((r) => (r.ok ? (r.json() as Promise<CiReleaseManifest>) : Promise.reject()))
      .then(setRelease)
      .catch(() => setRelease(null));
  }, []);

  const permanentUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${COLLABORATION_INTELLIGENCE_CAPSULE_PERMANENT_LATEST_PATH}`
      : `https://fsbw.vercel.app${COLLABORATION_INTELLIGENCE_CAPSULE_PERMANENT_LATEST_PATH}`;

  const verified = release?.validationStatus === 'pass';

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Studio OS · Collaboration Intelligence Capsule™</p>
        <h1 style={{ fontSize: 32, fontWeight: 600, margin: '8px 0' }}>Collaboration Intelligence</h1>
        <p style={{ color: '#64748b', lineHeight: 1.55 }}>
          How the Founder and AI built Studio OS together — shorthand, decisions, patterns, and institutional stories.
          Not chat history. Curated collaboration memory.
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
            <span style={{ color: '#64748b' }}>Documents</span>
            <strong>{release?.documentCount ?? '—'}</strong>
          </div>
          <code style={{ ...styles.mono, display: 'block', margin: '16px 0' }}>{permanentUrl}</code>
          <a
            href={COLLABORATION_INTELLIGENCE_CAPSULE_PERMANENT_LATEST_PATH}
            style={styles.btn}
            download={release?.artifact ?? undefined}
          >
            Download Collaboration Intelligence Capsule
          </a>
          <button
            type="button"
            style={{ ...styles.btn, background: '#fff', color: '#1e3a8a', border: '1px solid #cbd5e1', marginLeft: 10 }}
            onClick={() => {
              void navigator.clipboard.writeText(permanentUrl).then(() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2500);
              });
            }}
          >
            {copied ? 'URL copied' : 'Copy permanent URL'}
          </button>
        </div>

        <div style={styles.card}>
          <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>Complete onboarding</h2>
          <p style={{ margin: '0 0 12px', fontSize: 14, lineHeight: 1.7 }}>
            <strong>Preferred:</strong> <a href="/onboarding/latest">Unified Onboarding Pack</a> — fourth required capsule.
          </p>
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.9 }}>
            <li>
              <a href="/context/latest">AI Context</a>
            </li>
            <li>
              <a href="/founder-intelligence/latest">Founder Intelligence</a>
            </li>
            <li>
              <a href="/downloads/studio-dna-capsules/latest.zip">Studio DNA</a> (when included)
            </li>
            <li>
              <a href={COLLABORATION_INTELLIGENCE_CAPSULE_PERMANENT_LATEST_PATH}>Collaboration Intelligence</a>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
