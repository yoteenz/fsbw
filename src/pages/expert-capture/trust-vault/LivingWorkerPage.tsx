import { useMemo } from 'react';
import { loadSession } from '../../../studio-os-core/expert-capture';
import { buildKnowledgeVaultSnapshot, CONTINUOUS_EDUCATION_OPTIONS } from '../../../studio-os-core/expert-capture/trust-vault';
import { useKnowledgeMirror, identityFromSession } from '../../../hooks/useKnowledgeMirror';
import { resolveProfileFromSlug } from '../knowledge-mirror/resolve-profile';
import { vaultGlass, VaultBtn, VaultStylesInjector } from './vault-glass-styles';

export default function LivingWorkerPage({ profileSlug }: { profileSlug?: string }) {
  const profile = resolveProfileFromSlug(profileSlug);
  const session = loadSession(profile);
  const identity = session ? identityFromSession(session) : null;
  const km = useKnowledgeMirror(profile, identity);

  const snapshot = useMemo(
    () => buildKnowledgeVaultSnapshot({ profile, session, program: km.program }),
    [profile, session, km.program]
  );
  const w = snapshot.livingWorker;

  return (
    <div style={vaultGlass.page}>
      <VaultStylesInjector />
      <div style={vaultGlass.container}>
        <h1 style={vaultGlass.h1}>Living Worker</h1>
        <p style={vaultGlass.sub}>{w.workerName} — evolves as approved knowledge accumulates. Never a vague global score.</p>

        <div style={vaultGlass.grid}>
          <div style={vaultGlass.metric}>
            <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>Knowledge version</p>
            <p style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 600 }}>v{w.knowledgeVersion}</p>
          </div>
          <div style={vaultGlass.metric}>
            <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>Training progress</p>
            <p style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 600 }}>{w.trainingProgressPercent}%</p>
          </div>
          <div style={vaultGlass.metric}>
            <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>Pending lessons</p>
            <p style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 600 }}>{w.pendingLessons}</p>
          </div>
        </div>

        <div style={{ ...vaultGlass.glassCard(0), marginTop: 20 }}>
          <p style={{ margin: '0 0 8px' }}>
            <strong>Competency:</strong> {w.competencyLevel}
          </p>
          <p style={{ margin: '0 0 8px' }}>
            <strong>Confidence:</strong> {w.confidenceSummary}
          </p>
          <p style={{ margin: '0 0 8px' }}>
            <strong>Active sources:</strong> {w.sourceCount} approved knowledge items
          </p>
          {w.weakAreas.length ? (
            <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
              <strong>Weak areas:</strong> {w.weakAreas.join(', ')}
            </p>
          ) : null}
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 600, margin: '28px 0 12px' }}>Studio Worker Evolution</h2>
        {w.evolutionVersions.map((v) => (
          <div key={v.version} style={vaultGlass.glassCard(v.version * 30)}>
            <strong>{v.label}</strong>
            <span style={{ marginLeft: 8, fontSize: 12, color: '#94a3b8' }}>{new Date(v.changedAt).toLocaleDateString()}</span>
            <p style={{ margin: '8px 0 0', fontSize: 14 }}>{v.changeSummary}</p>
          </div>
        ))}

        <h2 style={{ fontSize: 20, fontWeight: 600, margin: '28px 0 12px' }}>Continuous education</h2>
        <p style={{ fontSize: 14, color: '#64748b', marginBottom: 12 }}>The interview is not one-time — return anytime to teach.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CONTINUOUS_EDUCATION_OPTIONS.map((opt) => (
            <VaultBtn
              key={opt.id}
              onClick={() => {
                window.location.href = `${profile.route.replace(/\/$/, '')}/confessional`.replace('//', '/');
              }}
            >
              {opt.label}
            </VaultBtn>
          ))}
        </div>
      </div>
    </div>
  );
}
