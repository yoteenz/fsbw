import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import {
  XCOS_DEMO_BRAND_LABELS,
  XCOS_ORG_STATE_LABELS,
  XCOS_ROOM_PATH_LABELS,
  type XcosBoardMeeting,
  type XcosReadyView,
  type XcosRoomPath,
} from '../../../../studio-os-core/genesis';
import { useCreativeOperatingSystemState } from '../../../../hooks/useCreativeOperatingSystemState';
import { hqGlassPanel, hqLabel } from '../headquarters-experience/hqExperienceTheme';
import { HqExperienceStyles } from '../headquarters-experience/HqWingZone';

const BASE = '/admin/studio/creative-operating-system';
const ACCENT = '#0F766E';

const WING_NAV: { slug: XcosRoomPath; label: string }[] = [
  { slug: 'creative-operating-system', label: 'Creative Organization' },
  { slug: 'executive-creative-board', label: 'Executive Creative Board™' },
  { slug: 'creative-council', label: 'Creative Council™' },
  { slug: 'creative-memory', label: 'Creative Memory™' },
  { slug: 'creative-evolution', label: 'Creative Evolution™' },
  { slug: 'creative-economy', label: 'Creative Economy™' },
  { slug: 'creative-assets', label: 'Creative Assets' },
  { slug: 'creative-governance', label: 'Creative Governance™' },
];

export function CreativeOperatingSystemWorkspace() {
  const { roomSlug } = useParams<{ roomSlug?: string }>();
  const { view, setBrand, decideMeeting, searchMemory, refresh } = useCreativeOperatingSystemState();
  const activeSlug = (roomSlug ?? 'creative-operating-system') as XcosRoomPath;
  const activeMeeting = view.pendingMeetings[0] ?? view.boardMeetings[0];

  return (
    <div className="relative min-h-[calc(100vh-120px)] overflow-hidden" style={{ background: '#F5F7F6' }} data-xcos-brand={view.activeBrandId}>
      <HqExperienceStyles />
      <XcosStyles />

      <header className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3" style={{ ...hqGlassPanel, borderColor: `${ACCENT}22` }}>
        <div>
          <p style={{ ...hqLabel, color: ACCENT, margin: 0 }}>CREATIVE OPERATING SYSTEM™</p>
          <p style={{ fontFamily: '"Covered By Your Grace", sans-serif', fontSize: '18px', margin: '4px 0 0' }}>
            {XCOS_ROOM_PATH_LABELS[activeSlug]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/studio/studio-production/production-control-room" className="xcos-btn">Production Control Room →</Link>
          <Link to="/admin/studio/studio-intelligence-layer" className="xcos-btn">Studio Intelligence →</Link>
          <button type="button" className="xcos-btn primary" style={{ borderColor: ACCENT, color: ACCENT }} onClick={refresh}>Refresh</button>
        </div>
      </header>

      <div className="relative z-10 flex min-h-[640px]">
        <nav className="hidden w-56 shrink-0 overflow-y-auto border-r bg-white/20 p-3 lg:block" style={{ borderColor: `${ACCENT}15` }}>
          {WING_NAV.map((room) => (
            <Link
              key={room.slug}
              to={`${BASE}/${room.slug}`}
              className="mb-1 block rounded-lg px-3 py-2 text-[10px] uppercase tracking-wider transition hover:bg-white/70"
              style={{
                color: activeSlug === room.slug ? '#1A1A1A' : '#808080',
                background: activeSlug === room.slug ? `${ACCENT}10` : 'transparent',
                borderLeft: activeSlug === room.slug ? `2px solid ${ACCENT}` : '2px solid transparent',
              }}
            >
              {room.label}
            </Link>
          ))}
        </nav>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <ArrivalPanel view={view} setBrand={setBrand} />

            {(activeSlug === 'creative-operating-system' || activeSlug === 'executive-creative-board') && (
              <BoardPanel view={view} />
            )}

            {(activeSlug === 'creative-council' || activeSlug === 'creative-operating-system') && activeMeeting && (
              <BoardMeetingPanel meeting={activeMeeting} onDecide={decideMeeting} onRefresh={refresh} />
            )}

            {(activeSlug === 'creative-memory' || activeSlug === 'creative-operating-system') && (
              <MemoryPanel view={view} onSearch={searchMemory} />
            )}

            {(activeSlug === 'creative-evolution' || activeSlug === 'creative-operating-system') && (
              <EvolutionPanel view={view} />
            )}

            {(activeSlug === 'creative-economy' || activeSlug === 'creative-assets' || activeSlug === 'creative-operating-system') && (
              <EconomyPanel view={view} />
            )}

            {activeSlug === 'creative-governance' && <GovernancePanel view={view} />}
          </div>

          <aside className="w-full shrink-0 lg:w-80">
            <OrgSidebar view={view} meeting={activeMeeting} onDecide={decideMeeting} onRefresh={refresh} />
          </aside>
        </main>
      </div>
    </div>
  );
}

function ArrivalPanel({ view, setBrand }: { view: XcosReadyView; setBrand: (id: import('../../../../studio-os-core/genesis').XcosDemoBrandId) => void }) {
  return (
    <section className="xcos-panel" style={{ borderLeft: `3px solid ${ACCENT}` }}>
      <p style={{ ...hqLabel, color: ACCENT }}>Creative Civilization™</p>
      <p style={{ fontSize: '13px', lineHeight: 1.6 }}>{view.orbNote}</p>
      <p style={{ fontSize: '10px', marginTop: 8 }}>Organization state: <strong>{XCOS_ORG_STATE_LABELS[view.orgState]}</strong></p>
      <div className="mt-3 flex flex-wrap gap-2">
        {view.demoBrandIds.map((id) => (
          <button key={id} type="button" className="xcos-btn" style={{ borderColor: view.activeBrandId === id ? ACCENT : undefined }} onClick={() => setBrand(id)}>
            {XCOS_DEMO_BRAND_LABELS[id]}
          </button>
        ))}
      </div>
    </section>
  );
}

function BoardPanel({ view }: { view: XcosReadyView }) {
  const board = view.controlRoomOverlay.executiveBoard;
  return (
    <section className="xcos-panel">
      <p style={{ ...hqLabel, color: ACCENT }}>Executive Creative Board™</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {board.map((exec) => (
          <div key={exec.executiveId} className="rounded border p-2 text-[9px]" style={{ borderColor: `${ACCENT}22` }}>
            <strong>{exec.label}</strong>
            <p style={{ color: '#808080' }}>{exec.status}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function BoardMeetingPanel({
  meeting,
  onDecide,
  onRefresh,
}: {
  meeting: XcosBoardMeeting;
  onDecide: (id: string, d: import('../../../../studio-os-core/genesis').XcosFounderDecision, r?: string) => void;
  onRefresh: () => void;
}) {
  return (
    <section className="xcos-panel">
      <p style={{ ...hqLabel, color: ACCENT }}>Board Meeting™ — {meeting.topic}</p>
      <p style={{ fontSize: '9px', color: '#808080' }}>Founder decision: {meeting.founderDecision}</p>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div>
          <p style={{ ...hqLabel }}>Agenda</p>
          <ul className="list-inside list-disc text-[9px]">{meeting.agenda.map((a) => <li key={a}>{a}</li>)}</ul>
        </div>
        <div>
          <p style={{ ...hqLabel }}>Expected Outcomes</p>
          <ul className="list-inside list-disc text-[9px]">{meeting.expectedOutcomes.map((o) => <li key={o}>{o}</li>)}</ul>
        </div>
      </div>

      <p style={{ ...hqLabel, marginTop: 12 }}>Unified Recommendation</p>
      <p style={{ fontSize: '10px' }}>{meeting.unifiedRecommendation}</p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {meeting.executiveBriefs.slice(0, 4).map((b) => (
          <div key={b.executiveId} className="rounded p-2 text-[9px]" style={{ background: `${ACCENT}08` }}>
            <strong>{b.label}</strong>
            <p>{b.recommendation}</p>
            <p style={{ color: '#808080' }}>Evidence: {b.evidence[0]}</p>
          </div>
        ))}
      </div>

      <p style={{ ...hqLabel, marginTop: 12 }}>Trade-offs & Risks</p>
      <ul className="text-[9px]">
        {meeting.tradeOffs.map((t) => <li key={t.tradeOffId}>{t.summary}: {t.recommendation}</li>)}
        {meeting.risks.map((r) => <li key={r}>Risk: {r}</li>)}
      </ul>

      {meeting.founderDecision === 'pending' && (
        <div className="mt-3 flex flex-wrap gap-2">
          {(['approved', 'revision', 'hold', 'rejected'] as const).map((d) => (
            <button key={d} type="button" className="xcos-btn primary" style={{ borderColor: ACCENT }} onClick={() => { onDecide(meeting.meetingId, d, `Founder ${d}`); onRefresh(); }}>
              {d}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function MemoryPanel({ view, onSearch }: { view: XcosReadyView; onSearch: (q: string) => import('../../../../studio-os-core/genesis').XcosCreativeMemoryRecord[] }) {
  const [query, setQuery] = useState('');
  const results = query ? onSearch(query) : view.memoryRecords.slice(0, 8);

  return (
    <section className="xcos-panel">
      <p style={{ ...hqLabel, color: ACCENT }}>Creative Memory™</p>
      <p style={{ fontSize: '9px' }}>{view.controlRoomOverlay.instituteLinkCount} records linked to Institute of Knowledge™</p>
      <input className="mb-2 mt-2 w-full rounded border px-3 py-2 text-sm" style={{ borderColor: `${ACCENT}33` }} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search institutional memory…" />
      <ul className="space-y-2 text-[9px]">
        {results.map((r) => (
          <li key={r.recordId} className="rounded border p-2" style={{ borderColor: `${ACCENT}18` }}>
            <strong>{r.summary}</strong>
            <p style={{ color: '#808080' }}>{r.memoryType} · {r.createdAt.slice(0, 10)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function EvolutionPanel({ view }: { view: XcosReadyView }) {
  return (
    <section className="xcos-panel">
      <p style={{ ...hqLabel, color: ACCENT }}>Creative Evolution Engine™</p>
      {view.evolutionProposals.length === 0 ? (
        <p style={{ fontSize: '10px' }}>Evolution proposals appear after publication and performance review.</p>
      ) : (
        <ul className="space-y-2 text-[9px]">
          {view.evolutionProposals.slice(0, 6).map((p) => (
            <li key={p.proposalId} className="rounded border p-2" style={{ borderColor: `${ACCENT}18` }}>
              <strong>{p.target}</strong> — {p.summary}
              <p>Predicted: {p.predictedOutcome}</p>
              <p>Actual: {p.actualOutcome}</p>
              <p style={{ color: ACCENT }}>{p.recommendation}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function EconomyPanel({ view }: { view: XcosReadyView }) {
  return (
    <section className="xcos-panel">
      <p style={{ ...hqLabel, color: ACCENT }}>Creative Economy™ — {view.economyAssets.length} assets</p>
      <ul className="space-y-2 text-[9px]">
        {view.economyAssets.slice(0, 8).map((a) => (
          <li key={a.assetId} className="rounded border p-2" style={{ borderColor: `${ACCENT}18` }}>
            <strong>{a.title}</strong> · {a.assetType} · {a.status}
            <p>{a.reuseRecommendation}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function GovernancePanel({ view }: { view: XcosReadyView }) {
  return (
    <section className="xcos-panel">
      <p style={{ ...hqLabel, color: ACCENT }}>Creative Governance Engine™</p>
      <ul className="space-y-2 text-[9px]">
        {view.governanceRecords.map((g) => (
          <li key={g.recordId} className="rounded border p-2" style={{ borderColor: g.status === 'violation' ? '#dc2626' : `${ACCENT}18` }}>
            <strong>{g.policy}</strong> — {g.status}
            <p>{g.summary}</p>
            <p style={{ color: '#808080' }}>{g.recommendation}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function OrgSidebar({
  view,
  meeting,
  onDecide,
  onRefresh,
}: {
  view: XcosReadyView;
  meeting?: XcosBoardMeeting;
  onDecide: (id: string, d: import('../../../../studio-os-core/genesis').XcosFounderDecision, r?: string) => void;
  onRefresh: () => void;
}) {
  const overlay = view.controlRoomOverlay;

  return (
    <section className="xcos-panel sticky top-4">
      <p style={{ ...hqLabel, color: ACCENT }}>Organization Status</p>
      <p style={{ fontSize: '18px', fontFamily: '"Covered By Your Grace", sans-serif' }}>{overlay.orgStateLabel}</p>
      <p style={{ fontSize: '9px' }}>Studio Intelligence: {overlay.studioIntelligenceStatus}</p>
      <p style={{ fontSize: '9px' }}>{overlay.liveProductionCount} live production(s) · {overlay.pendingFounderDecisions} pending decision(s)</p>
      <p style={{ fontSize: '9px' }}>{overlay.memoryCount} memory records · {overlay.economyAssetCount} economy assets</p>

      {meeting?.founderDecision === 'pending' && (
        <button type="button" className="xcos-btn primary mt-3 w-full" style={{ borderColor: ACCENT }} onClick={() => { onDecide(meeting.meetingId, 'approved', 'Founder approved'); onRefresh(); }}>
          Approve recommendation
        </button>
      )}

      <p style={{ ...hqLabel, marginTop: 12 }}>AI Consumers</p>
      <ul className="text-[9px]">
        {view.consumerBindings.map((c) => <li key={c.system}>{c.status}</li>)}
      </ul>
    </section>
  );
}

function XcosStyles() {
  return (
    <style>{`
      [data-xcos-brand] .xcos-panel {
        border-radius: 12px;
        border: 1px solid ${ACCENT}18;
        background: #ffffffcc;
        backdrop-filter: blur(12px);
        padding: 16px;
      }
      [data-xcos-brand] .xcos-btn {
        border: 1px solid ${ACCENT}33;
        background: transparent;
        border-radius: 8px;
        padding: 6px 12px;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        cursor: pointer;
      }
      [data-xcos-brand] .xcos-btn.primary { background: ${ACCENT}10; }
    `}</style>
  );
}
