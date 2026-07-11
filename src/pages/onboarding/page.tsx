/**
 * Studio OS Unified Onboarding Pack — public hub (/onboarding)
 */
import { useEffect, useState } from 'react';
import {
  ONBOARDING_PACK_PERMANENT_LATEST_PATH,
  ONBOARDING_PACK_PUBLIC_RELEASE_PATH,
  UNIFIED_ONBOARDING_PROMPT,
} from '../../studio-os-core/onboarding-pack-export/constants';

type OnboardingRelease = {
  currentVersion: string;
  generatedAt: string;
  validationStatus: 'pass' | 'fail';
  contentCoverageStatus?: string;
  documentCount: number;
  artifact?: string;
  checksumSha256?: string;
  includedCapsules?: { name: string; version: string }[];
  missingOptionalCapsules?: string[];
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(165deg, #f8fafc 0%, #eef2ff 100%)',
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

export default function OnboardingPackPage() {
  const [release, setRelease] = useState<OnboardingRelease | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  useEffect(() => {
    void fetch(ONBOARDING_PACK_PUBLIC_RELEASE_PATH)
      .then((r) => {
        if (!r.ok) throw new Error('unavailable');
        return r.json() as Promise<OnboardingRelease>;
      })
      .then(setRelease)
      .catch(() => setRelease(null));
  }, []);

  const permanentUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${ONBOARDING_PACK_PERMANENT_LATEST_PATH}`
      : `https://fsbw.vercel.app${ONBOARDING_PACK_PERMANENT_LATEST_PATH}`;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Studio OS · Unified Onboarding Pack</p>
        <h1 style={{ fontSize: 32, fontWeight: 600, margin: '8px 0' }}>Complete AI Onboarding</h1>
        <p style={{ color: '#64748b', lineHeight: 1.55 }}>
          One pack · one reading order · one report. Context + Founder Intelligence + Collaboration Intelligence (+ DNA when included).
        </p>

        <div style={styles.card}>
          <div style={styles.row}>
            <span style={{ color: '#64748b' }}>Pack version</span>
            <strong>v{release?.currentVersion ?? '—'}</strong>
          </div>
          <div style={styles.row}>
            <span style={{ color: '#64748b' }}>Validation</span>
            <strong>{release?.validationStatus === 'pass' ? 'Verified' : '—'}</strong>
          </div>
          <div style={styles.row}>
            <span style={{ color: '#64748b' }}>Documents</span>
            <strong>{release?.documentCount ?? '—'}</strong>
          </div>
          <div style={styles.row}>
            <span style={{ color: '#64748b' }}>Coverage</span>
            <strong>{release?.contentCoverageStatus ?? '—'}</strong>
          </div>
          <p style={{ fontSize: 13, color: '#64748b', margin: '16px 0 8px' }}>Permanent URL</p>
          <code style={{ ...styles.mono, display: 'block', marginBottom: 16 }}>{permanentUrl}</code>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <a
              href={ONBOARDING_PACK_PERMANENT_LATEST_PATH}
              style={styles.btn}
              download={release?.artifact ?? undefined}
            >
              Download latest pack
            </a>
            <button
              type="button"
              style={{ ...styles.btn, background: '#fff', color: '#1e3a8a', border: '1px solid #cbd5e1' }}
              onClick={() => {
                void navigator.clipboard.writeText(permanentUrl).then(() => {
                  setCopiedUrl(true);
                  window.setTimeout(() => setCopiedUrl(false), 2000);
                });
              }}
            >
              {copiedUrl ? 'URL copied' : 'Copy download URL'}
            </button>
            <button
              type="button"
              style={{ ...styles.btn, background: '#fff', color: '#1e3a8a', border: '1px solid #cbd5e1' }}
              onClick={() => {
                void navigator.clipboard.writeText(UNIFIED_ONBOARDING_PROMPT).then(() => {
                  setCopiedPrompt(true);
                  window.setTimeout(() => setCopiedPrompt(false), 2000);
                });
              }}
            >
              {copiedPrompt ? 'Prompt copied' : 'Copy onboarding prompt'}
            </button>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>Included capsules</h2>
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
            {(release?.includedCapsules ?? []).map((c) => (
              <li key={c.name}>
                <strong>{c.name}</strong> v{c.version}
              </li>
            ))}
          </ul>
          {release?.missingOptionalCapsules?.length ? (
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 12 }}>
              Optional not included: {release.missingOptionalCapsules.join(', ')}
            </p>
          ) : null}
        </div>

        <div style={styles.card}>
          <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>Individual capsules (optional)</h2>
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8, fontSize: 14 }}>
            <li>
              <a href="/context">AI Context Capsule</a> — <a href="/context/latest">/context/latest</a>
            </li>
            <li>
              <a href="/founder-intelligence">Founder Intelligence</a> —{' '}
              <a href="/founder-intelligence/latest">/founder-intelligence/latest</a>
            </li>
            <li>
              <a href="/collaboration-intelligence">Collaboration Intelligence</a> —{' '}
              <a href="/collaboration-intelligence/latest">/collaboration-intelligence/latest</a>
            </li>
            <li>
              <a href="/context-updates">Delta Context Updates</a> —{' '}
              <a href="/context-updates/latest">/context-updates/latest</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
