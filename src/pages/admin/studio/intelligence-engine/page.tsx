import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioTabBar } from '../../../../components/admin/studio/AdminStudioTabBar';
import { AdminStudioSectionHeading } from '../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AdminStudioCreativeScoreRing, AdminStudioCreativeBarScore } from '../../../../components/admin/studio/AdminStudioCreativeWidget';
import { useAdminStudioIntelligenceEngine } from '../../../../hooks/useAdminStudioIntelligenceEngineState';
import {
  ADMIN_STUDIO_INTELLIGENCE_ENGINE_SUBTITLE,
  INTELLIGENCE_TYPE_LABELS,
  CONFIDENCE_LEVEL_LABELS,
  type IntelligenceTypeId,
} from '../../../../utils/adminStudioIntelligenceDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

type IntelTab = 'recommendations' | 'connectors' | 'forecasts' | 'customer' | 'performance' | 'feed';

const INTEL_TABS: Array<{ id: IntelTab; label: string }> = [
  { id: 'recommendations', label: 'TOPICS' },
  { id: 'connectors', label: 'CONNECTORS' },
  { id: 'forecasts', label: 'FORECASTS' },
  { id: 'customer', label: 'CUSTOMER' },
  { id: 'performance', label: 'PERFORMANCE' },
  { id: 'feed', label: 'CD FEED' },
];

export default function AdminStudioIntelligenceEnginePage() {
  const navigate = useNavigate();
  const {
    snapshot,
    connectorRegistry,
    connectorStates,
    useDemoConnection,
    toggleConnector,
    enableDemoSources,
    syncOneConnector,
  } = useAdminStudioIntelligenceEngine();
  const [tab, setTab] = useState<IntelTab>('recommendations');

  return (
    <AdminStudioStageShell
      title="INTELLIGENCE ENGINE"
      subtitle={ADMIN_STUDIO_INTELLIGENCE_ENGINE_SUBTITLE}
      breadcrumbParentLabel="THE STUDIO"
      breadcrumbParentPath="/admin/studio"
      onBack={() => navigate('/admin/studio')}
    >
      <div
        className="p-2.5 mb-3 border bg-white/80"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `3px solid ${ADMIN_STUDIO_THEME.accent}` }}
      >
        <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
          EVIDENCE ONLY FROM ACTIVE CONNECTORS · NEVER FABRICATED TREND DATA
        </p>
        <p className="text-[7px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
          ACTIVE: {snapshot.activeConnectors.length} · ACTIONABLE: {snapshot.hasActionableData ? 'YES' : 'NO'}
          {useDemoConnection ? ' · DEMO CONNECTION MODE' : ''}
        </p>
        <button
          type="button"
          onClick={enableDemoSources}
          className="mt-2 w-full py-2 text-[8px] font-futura uppercase border"
          style={{ fontWeight: 515, color: '#FFFFFF', background: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          ENABLE DEMO CONNECTORS (SIMULATED SIGNALS)
        </button>
      </div>

      <AdminStudioTabBar tabs={INTEL_TABS} activeTab={tab} onTabChange={setTab} />

      {tab === 'recommendations' ? (
        <div className="space-y-3 mt-3">
          <AdminStudioSectionHeading>TOPIC RECOMMENDATIONS</AdminStudioSectionHeading>
          {snapshot.recommendations.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} />
          ))}
        </div>
      ) : null}

      {tab === 'connectors' ? (
        <div className="space-y-2 mt-3">
          <AdminStudioSectionHeading>MODULAR CONNECTORS</AdminStudioSectionHeading>
          {connectorRegistry.map((def) => {
            const st = connectorStates[def.id];
            return (
              <div
                key={def.id}
                className="p-2.5 border flex items-start justify-between gap-2 bg-white/70"
                style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
                    {def.label}
                  </p>
                  <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                    {INTELLIGENCE_TYPE_LABELS[def.category as IntelligenceTypeId]} · {def.description}
                  </p>
                  <p className="text-[6px] font-futura uppercase mt-0.5" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                    {st.statusMessage}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <button type="button" onClick={() => toggleConnector(def.id)} className="text-[6px] font-futura uppercase px-2 py-1 border" style={{ fontWeight: 515, color: st.enabled ? '#16A34A' : ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                    {st.enabled ? 'ON' : 'OFF'}
                  </button>
                  {st.enabled ? (
                    <button type="button" onClick={() => syncOneConnector(def.id)} className="text-[6px] font-futura uppercase px-2 py-1 border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                      SYNC
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {tab === 'forecasts' ? (
        <div className="space-y-2 mt-3">
          <AdminStudioSectionHeading>TOPIC FORECASTING</AdminStudioSectionHeading>
          {snapshot.forecasts.map((f) => (
            <div key={f.id} className="p-2.5 border bg-white/70" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `2px solid ${f.ready ? '#16A34A' : '#CA8A04'}` }}>
              <p className="text-[9px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{f.title}</p>
              <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>WINDOW: {f.window}</p>
              {!f.ready ? (
                <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: '#CA8A04' }}>
                  MISSING: {f.missingConnectors.join(' · ')}
                </p>
              ) : (
                <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: '#16A34A' }}>CONNECTORS READY</p>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {tab === 'customer' ? (
        <div className="space-y-2 mt-3">
          <AdminStudioSectionHeading>CUSTOMER INTELLIGENCE</AdminStudioSectionHeading>
          {snapshot.customerSignals.length === 0 ? (
            <UnavailablePanel message="NO CUSTOMER DATA — ENABLE ORDERS, BAW SAVES, PSA, OR WISHLIST CONNECTORS" />
          ) : (
            snapshot.customerSignals.map((s) => (
              <SignalRow key={s.label} label={s.label} value={s.value} source={s.connectorId} />
            ))
          )}
        </div>
      ) : null}

      {tab === 'performance' ? (
        <div className="space-y-3 mt-3">
          <AdminStudioSectionHeading>PERFORMANCE INTELLIGENCE</AdminStudioSectionHeading>
          {snapshot.performanceSignals.length === 0 ? (
            <UnavailablePanel message="NO PERFORMANCE DATA — ENABLE LOUNGE TV, EMAIL, OR WEBSITE CONNECTORS" />
          ) : (
            snapshot.performanceSignals.map((s) => (
              <div key={s.metric} className="p-2.5 border bg-white/70" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
                <AdminStudioCreativeBarScore label={s.metric} score={parseInt(s.value, 10) || 70} />
                <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>→ {s.recommendation}</p>
              </div>
            ))
          )}
        </div>
      ) : null}

      {tab === 'feed' ? (
        <div className="space-y-3 mt-3">
          <AdminStudioSectionHeading>CREATIVE DIRECTOR FEED</AdminStudioSectionHeading>
          <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}>
            INTELLIGENCE FEEDS BRIEFING · RECOMMENDATIONS · SCORES — CREATIVE DIRECTOR RETAINS FINAL DECISIONS
          </p>
          {snapshot.creativeDirectorFeed.insufficientData ? (
            <UnavailablePanel message="INSUFFICIENT CONNECTOR DATA FOR CREATIVE DIRECTOR FEED" />
          ) : (
            <>
              <FeedBlock title="BRIEFING BULLETS" items={snapshot.creativeDirectorFeed.briefingBullets} />
              <FeedBlock title="CAMPAIGN SUGGESTIONS" items={snapshot.creativeDirectorFeed.campaignSuggestions} />
              <FeedBlock title="PUBLISHING STRATEGY" items={snapshot.creativeDirectorFeed.publishingNotes} />
              <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
                SUGGESTED TOPIC: {snapshot.creativeDirectorFeed.suggestedTopic}
              </p>
            </>
          )}
        </div>
      ) : null}

      <div className="mt-4 flex gap-2">
        <button type="button" onClick={() => navigate('/admin/studio/creative-director')} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
          CREATIVE DIRECTOR →
        </button>
        <button type="button" onClick={() => navigate('/admin/studio/ai-orchestrator')} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
          AI ORCHESTRATOR →
        </button>
      </div>

      <AdminStudioDisclaimerFooter>
        INTELLIGENCE ENGINE GATHERS EVIDENCE ONLY — CREATIVE DECISIONS ORIGINATE FROM FRONTAL SLAYER · NOT AI PROVIDERS
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}

function RecommendationCard({
  rec,
}: {
  rec: {
    title: string;
    confidence: number;
    confidenceLevel: string;
    insufficientEvidence: boolean;
    reason?: string;
    evidence: Array<{ connectorLabel: string; signal: string; metric?: string }>;
  };
}) {
  return (
    <div className="p-3 border bg-white/80" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, borderLeft: `2px solid ${rec.insufficientEvidence ? '#CA8A04' : ADMIN_STUDIO_THEME.accent}` }}>
      <div className="flex gap-2 mb-2">
        <div className="flex-1">
          <p className="text-[10px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{rec.title}</p>
          <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: CONFIDENCE_LEVEL_LABELS[rec.confidenceLevel as keyof typeof CONFIDENCE_LEVEL_LABELS] ?? rec.confidenceLevel }}>
            CONFIDENCE {rec.confidence}% · {rec.confidenceLevel.toUpperCase()}
          </p>
        </div>
        {!rec.insufficientEvidence ? (
          <AdminStudioCreativeScoreRing label="" score={rec.confidence} />
        ) : null}
      </div>
      {rec.insufficientEvidence ? (
        <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: '#CA8A04' }}>{rec.reason}</p>
      ) : null}
      <p className="text-[7px] font-futura uppercase mb-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>EVIDENCE</p>
      {rec.evidence.length === 0 ? (
        <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>NO DATA — CONNECTORS UNAVAILABLE</p>
      ) : (
        <ul className="space-y-0.5">
          {rec.evidence.map((e) => (
            <li key={`${e.connectorLabel}-${e.signal}`} className="text-[6px] font-futura uppercase flex gap-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
              <span style={{ color: ADMIN_STUDIO_THEME.accent }}>•</span>
              {e.connectorLabel}: {e.signal}{e.metric ? ` (${e.metric})` : ''}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function UnavailablePanel({ message }: { message: string }) {
  return (
    <div className="p-3 border text-center" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}>{message}</p>
    </div>
  );
}

function SignalRow({ label, value, source }: { label: string; value: string; source: string }) {
  return (
    <div className="p-2 border bg-white/70" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
      <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{label}</p>
      <p className="text-[8px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>{value}</p>
      <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>SOURCE: {source}</p>
    </div>
  );
}

function FeedBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="p-2.5" style={{ background: ADMIN_STUDIO_THEME.panelBg, border: `1px solid ${ADMIN_STUDIO_THEME.panelBorder}` }}>
      <p className="text-[7px] font-futura uppercase mb-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{title}</p>
      {items.map((item) => (
        <p key={item} className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, lineHeight: 1.45 }}>• {item}</p>
      ))}
    </div>
  );
}
