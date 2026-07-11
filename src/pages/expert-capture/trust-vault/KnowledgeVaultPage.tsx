import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadSession } from '../../../studio-os-core/expert-capture';
import { useKnowledgeMirror } from '../../../hooks/useKnowledgeMirror';
import {
  buildKnowledgeVaultSnapshot,
  buildVaultExport,
  downloadVaultExport,
  VAULT_EXPORT_OPTIONS,
} from '../../../studio-os-core/expert-capture/trust-vault';
import type { VaultSectionId } from '../../../studio-os-core/expert-capture/trust-vault';
import { identityFromSession } from '../../../hooks/useKnowledgeMirror';
import { mirrorNavLinks, resolveProfileFromSlug } from '../knowledge-mirror/resolve-profile';
import { vaultGlass, VaultBtn, VaultStylesInjector } from './vault-glass-styles';

function sectionItems(sectionId: VaultSectionId, snapshot: ReturnType<typeof buildKnowledgeVaultSnapshot>) {
  return snapshot.searchableItems.filter((i) => {
    if (sectionId === 'transcripts') return i.sectionId === 'transcripts';
    if (sectionId === 'published_knowledge') return i.sectionId === 'published_knowledge';
    if (sectionId === 'draft_knowledge') return i.sectionId === 'draft_knowledge';
    if (sectionId === 'audit_history' || sectionId === 'access_logs') return false;
    return false;
  });
}

export default function KnowledgeVaultPage({
  profileSlug,
  onContinueInterview,
  gateMode,
}: {
  profileSlug?: string;
  onContinueInterview?: () => void;
  gateMode?: boolean;
}) {
  const profile = resolveProfileFromSlug(profileSlug);
  const session = loadSession(profile);
  const identity = session ? identityFromSession(session) : null;
  const km = useKnowledgeMirror(profile, identity);
  const nav = mirrorNavLinks(profile);
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState<VaultSectionId | null>(null);

  const snapshot = useMemo(
    () => buildKnowledgeVaultSnapshot({ profile, session, program: km.program }),
    [profile, session, km.program]
  );

  const filteredSections = snapshot.sections.filter(
    (s) => !search || s.title.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSearch = snapshot.searchableItems.filter(
    (i) => !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.snippet.toLowerCase().includes(search.toLowerCase())
  );

  if (!session?.meta.expertName) {
    return (
      <div style={vaultGlass.page}>
        <div style={vaultGlass.container}>
          <h1 style={vaultGlass.h1}>Knowledge Vault™</h1>
          <p style={vaultGlass.sub}>Begin an expert session to unlock your secure institutional archive.</p>
          <VaultBtn primary onClick={() => (window.location.href = profile.route)}>
            Start Expert Capture
          </VaultBtn>
        </div>
      </div>
    );
  }

  return (
    <div style={vaultGlass.page}>
      <VaultStylesInjector />
      <div style={vaultGlass.container}>
        {!gateMode ? (
          <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20, fontSize: 14 }}>
            <Link to={nav.interview} style={{ color: '#64748b' }}>
              Interview
            </Link>
            <Link to={nav.stream} style={{ color: '#64748b' }}>
              Knowledge Stream
            </Link>
            <Link to={nav.trustDashboard} style={{ color: '#64748b' }}>
              Trust Dashboard
            </Link>
            <Link to={nav.livingWorker} style={{ color: '#64748b' }}>
              Living Worker
            </Link>
            <Link to={nav.ownerMirror} style={{ color: '#64748b' }}>
              Owner Mirror
            </Link>
          </nav>
        ) : null}

        <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 6px' }}>Knowledge Vault™</p>
        <h1 style={vaultGlass.h1}>{snapshot.organizationLabel}</h1>
        <p style={vaultGlass.sub}>
          Your secure archive — not the worker. Original recordings, approved knowledge, version history, and audit trail
          for the next 20+ years.
        </p>

        <div style={{ ...vaultGlass.glassCard(0), marginBottom: 20 }}>
          <p style={{ margin: 0, fontSize: 14 }}>
            <strong>Worker isolation:</strong> {snapshot.workerIsolation.workerName} learns only from{' '}
            {snapshot.workerIsolation.organizationLabel} — never from another organization&apos;s proprietary knowledge.
          </p>
        </div>

        {gateMode && onContinueInterview ? (
          <div style={{ ...vaultGlass.glassCard(50), marginBottom: 24, borderColor: 'rgba(99, 102, 241, 0.3)' }}>
            <h3 style={{ margin: '0 0 8px' }}>Your vault is ready</h3>
            <p style={{ margin: '0 0 16px', color: '#64748b' }}>
              Agreements signed. You can return here anytime. Continue to enable camera and begin teaching.
            </p>
            <VaultBtn primary onClick={onContinueInterview}>
              Continue to Interview Setup
            </VaultBtn>
          </div>
        ) : null}

        <input
          style={vaultGlass.input}
          placeholder="Search vault…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 28 }}>
          <div style={vaultGlass.metric}>
            <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>Knowledge health</p>
            <p style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 600 }}>{snapshot.dashboard.knowledgeHealthScore}</p>
          </div>
          <div style={vaultGlass.metric}>
            <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>Hours recorded</p>
            <p style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 600 }}>{snapshot.dashboard.hoursRecorded}</p>
          </div>
          <div style={vaultGlass.metric}>
            <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>Approval queue</p>
            <p style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 600 }}>{snapshot.dashboard.approvalQueueCount}</p>
          </div>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 14px' }}>Vault sections</h2>
        <div style={vaultGlass.grid}>
          {filteredSections.map((section, i) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
              style={{
                ...vaultGlass.glassCard(i * 20),
                textAlign: 'left',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              <span style={{ fontSize: 22 }}>{section.icon}</span>
              <h3 style={{ margin: '8px 0 4px', fontSize: 16 }}>{section.title}</h3>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>{section.description}</p>
            </button>
          ))}
        </div>

        {activeSection === 'exports' || activeSection ? (
          <div style={{ ...vaultGlass.glassCard(100), marginTop: 20 }}>
            <h3 style={{ margin: '0 0 12px' }}>
              {snapshot.sections.find((s) => s.id === activeSection)?.title ?? 'Section detail'}
            </h3>
            {activeSection === 'exports' ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {VAULT_EXPORT_OPTIONS.map((opt) => (
                  <VaultBtn
                    key={opt.kind}
                    onClick={() => {
                      const bundle = buildVaultExport(opt.kind, session, km.program);
                      downloadVaultExport(bundle);
                    }}
                  >
                    {opt.label} ({opt.format})
                  </VaultBtn>
                ))}
              </div>
            ) : activeSection === 'audit_history' || activeSection === 'access_logs' ? (
              <ul style={{ fontSize: 13, paddingLeft: 18, margin: 0 }}>
                {snapshot.auditLog.slice(-12).reverse().map((a) => (
                  <li key={a.id} style={{ marginBottom: 8 }}>
                    {new Date(a.timestamp).toLocaleString()} — {a.user}: {a.action}
                  </li>
                ))}
              </ul>
            ) : activeSection === 'legal_agreements' ? (
              <p style={{ fontSize: 14, color: '#475569' }}>
                Signed {snapshot.trustRecord?.agreementsSignedAt ? new Date(snapshot.trustRecord.agreementsSignedAt).toLocaleString() : '—'}{' '}
                by {snapshot.trustRecord?.signatureName ?? '—'}
              </p>
            ) : (
              <ul style={{ fontSize: 13, paddingLeft: 18, margin: 0 }}>
                {(activeSection ? sectionItems(activeSection, snapshot) : filteredSearch).slice(0, 8).map((item) => (
                  <li key={item.id} style={{ marginBottom: 8 }}>
                    <strong>{item.title}</strong> — {item.snippet}
                  </li>
                ))}
                {!sectionItems(activeSection!, snapshot).length ? (
                  <li style={{ color: '#94a3b8' }}>No items yet — complete interview answers to populate this section.</li>
                ) : null}
              </ul>
            )}
          </div>
        ) : null}

        <h2 style={{ fontSize: 20, fontWeight: 600, margin: '32px 0 14px' }}>Knowledge timeline</h2>
        <div style={vaultGlass.glassCard(0)}>
          {snapshot.timeline.slice(0, 10).map((ev) => (
            <div key={ev.id} style={{ padding: '10px 0', borderBottom: '1px solid rgba(226,232,240,0.8)' }}>
              <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>{new Date(ev.timestamp).toLocaleString()}</p>
              <p style={{ margin: '2px 0', fontWeight: 600 }}>{ev.title}</p>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>{ev.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
