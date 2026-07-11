import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { loadSession } from '../../../studio-os-core/expert-capture';
import { buildKnowledgeVaultSnapshot } from '../../../studio-os-core/expert-capture/trust-vault';
import { useKnowledgeMirror, identityFromSession } from '../../../hooks/useKnowledgeMirror';
import { mirrorNavLinks, resolveProfileFromSlug } from '../knowledge-mirror/resolve-profile';
import { vaultGlass, VaultStylesInjector } from './vault-glass-styles';

export default function TrustDashboardPage({ profileSlug }: { profileSlug?: string }) {
  const profile = resolveProfileFromSlug(profileSlug);
  const session = loadSession(profile);
  const identity = session ? identityFromSession(session) : null;
  const km = useKnowledgeMirror(profile, identity);
  const nav = mirrorNavLinks(profile);

  const snapshot = useMemo(
    () => buildKnowledgeVaultSnapshot({ profile, session, program: km.program }),
    [profile, session, km.program]
  );
  const d = snapshot.dashboard;

  return (
    <div style={vaultGlass.page}>
      <VaultStylesInjector />
      <div style={vaultGlass.container}>
        <nav style={{ marginBottom: 20, fontSize: 14 }}>
          <Link to={nav.knowledgeVault} style={{ color: '#64748b' }}>
            ← Knowledge Vault
          </Link>
        </nav>
        <h1 style={vaultGlass.h1}>Trust Dashboard</h1>
        <p style={vaultGlass.sub}>Owner oversight — progress, approvals, and knowledge health at a glance.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {[
            ['Knowledge uploaded', d.knowledgeUploaded],
            ['Hours recorded', d.hoursRecorded],
            ['Training completion', `${d.trainingCompletionPercent}%`],
            ['Approval queue', d.approvalQueueCount],
            ['Pending reviews', d.pendingReviews],
            ['Corrections needed', d.correctionsNeeded],
            ['Recent updates', d.recentUpdatesCount],
            ['Knowledge health', d.knowledgeHealthScore],
          ].map(([label, value]) => (
            <div key={String(label)} style={vaultGlass.metric}>
              <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>{label}</p>
              <p style={{ margin: '6px 0 0', fontSize: 24, fontWeight: 600 }}>{value}</p>
            </div>
          ))}
        </div>

        <div style={{ ...vaultGlass.glassCard(0), marginTop: 24 }}>
          <h3 style={{ margin: '0 0 8px' }}>Worker status</h3>
          <p style={{ margin: '4px 0', fontSize: 14 }}>
            <strong>Accuracy:</strong> {d.workerAccuracyLabel}
          </p>
          <p style={{ margin: '4px 0', fontSize: 14 }}>
            <strong>Confidence:</strong> {d.workerConfidenceLabel}
          </p>
          <p style={{ margin: '4px 0', fontSize: 14 }}>
            <strong>Latest session:</strong>{' '}
            {d.latestSessionAt ? new Date(d.latestSessionAt).toLocaleString() : 'None yet'}
          </p>
        </div>

        <div style={{ marginTop: 20 }}>
          <Link to={nav.ownerMirror} style={{ color: '#475569', fontSize: 14 }}>
            Open Owner Training Mirror →
          </Link>
        </div>
      </div>
    </div>
  );
}
