import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioTabBar } from '../../../../../components/admin/studio/AdminStudioTabBar';
import { AdminStudioSectionHeading } from '../../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AdminStudioAudienceFieldGroups } from '../../../../../components/admin/studio/AdminStudioAudienceFieldGroups';
import { AdminStudioAudienceJourneyFlow } from '../../../../../components/admin/studio/AdminStudioAudienceJourneyFlow';
import { AdminStudioAudienceRecommendationCard } from '../../../../../components/admin/studio/AdminStudioAudienceRecommendationCard';
import { AdminStudioAudiencePredictionCard } from '../../../../../components/admin/studio/AdminStudioAudiencePredictionCard';
import { AdminStudioAudienceMetricCard } from '../../../../../components/admin/studio/AdminStudioAudienceMetricCard';
import { AdminStudioCreativeBarScore } from '../../../../../components/admin/studio/AdminStudioCreativeWidget';
import { useAdminStudioAudienceBrain } from '../../../../../hooks/useAdminStudioAudienceBrainState';
import {
  AUDIENCE_INTELLIGENCE_TABS,
  AUDIENCE_OVERVIEW_GROUPS,
  AUDIENCE_CONTENT_GROUPS,
  AUDIENCE_PRODUCT_GROUPS,
  AUDIENCE_MEMBERSHIP_GROUPS,
  AUDIENCE_PSA_GROUPS,
  AUDIENCE_COMMUNITY_GROUPS,
  AUDIENCE_CONVERSION_GROUPS,
  AUDIENCE_PRIVACY_GROUPS,
  AUDIENCE_FEEDBACK_LOOP_TARGETS,
  AUDIENCE_JOURNEY_STEPS,
  AUDIENCE_OVERVIEW_METRICS,
  AUDIENCE_RECOMMENDATIONS,
  AUDIENCE_PREDICTIONS,
  type AudienceIntelligenceTabId,
  type AudienceInsightFieldKey,
} from '../../../../../utils/adminStudioAudienceBrainDemo';
import { ADMIN_STUDIO_THEME } from '../../../../../utils/adminStudioTheme';

export default function AdminStudioAudienceBrainIntelligencePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<AudienceIntelligenceTabId>('overview');
  const { insight, updateField, resetToDefaults } = useAdminStudioAudienceBrain();

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && AUDIENCE_INTELLIGENCE_TABS.some((t) => t.id === tab)) {
      setActiveTab(tab as AudienceIntelligenceTabId);
    }
  }, [searchParams]);

  const onUpdate = (key: AudienceInsightFieldKey, value: string) => updateField(key, value);

  return (
    <AdminStudioStageShell
      title="INTELLIGENCE CENTER"
      subtitle="AUDIENCE BRAIN · LEARNING FROM EVERY INTERACTION"
      breadcrumbParentLabel="AUDIENCE BRAIN"
      breadcrumbParentPath="/admin/studio/audience-brain"
      onBack={() => navigate('/admin/studio/audience-brain')}
    >
      <div className="p-2.5 mb-3 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderTop: `2px solid ${ADMIN_STUDIO_THEME.accent}` }}>
        <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          AGGREGATED INTELLIGENCE · EVIDENCE-TRACEABLE · NO PII
        </p>
      </div>

      <AdminStudioTabBar tabs={AUDIENCE_INTELLIGENCE_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'overview' ? (
        <div className="mt-3 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {AUDIENCE_OVERVIEW_METRICS.map((m) => (
              <AdminStudioAudienceMetricCard key={m.id} metric={m} />
            ))}
          </div>
          <AdminStudioAudienceFieldGroups groups={AUDIENCE_OVERVIEW_GROUPS} insight={insight} onUpdate={onUpdate} />
        </div>
      ) : null}

      {activeTab === 'content' ? (
        <div className="mt-3"><AdminStudioAudienceFieldGroups groups={AUDIENCE_CONTENT_GROUPS} insight={insight} onUpdate={onUpdate} /></div>
      ) : null}

      {activeTab === 'product' ? (
        <div className="mt-3"><AdminStudioAudienceFieldGroups groups={AUDIENCE_PRODUCT_GROUPS} insight={insight} onUpdate={onUpdate} /></div>
      ) : null}

      {activeTab === 'membership' ? (
        <div className="mt-3"><AdminStudioAudienceFieldGroups groups={AUDIENCE_MEMBERSHIP_GROUPS} insight={insight} onUpdate={onUpdate} /></div>
      ) : null}

      {activeTab === 'psa' ? (
        <div className="mt-3"><AdminStudioAudienceFieldGroups groups={AUDIENCE_PSA_GROUPS} insight={insight} onUpdate={onUpdate} /></div>
      ) : null}

      {activeTab === 'community' ? (
        <div className="mt-3"><AdminStudioAudienceFieldGroups groups={AUDIENCE_COMMUNITY_GROUPS} insight={insight} onUpdate={onUpdate} /></div>
      ) : null}

      {activeTab === 'journey' ? (
        <div className="mt-3 space-y-3">
          <AdminStudioSectionHeading>CUSTOMER JOURNEY</AdminStudioSectionHeading>
          <p className="text-[6px] font-futura uppercase -mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            WHERE USERS CONTINUE OR LEAVE
          </p>
          <AdminStudioAudienceJourneyFlow steps={AUDIENCE_JOURNEY_STEPS} />
        </div>
      ) : null}

      {activeTab === 'conversion' ? (
        <div className="mt-3"><AdminStudioAudienceFieldGroups groups={AUDIENCE_CONVERSION_GROUPS} insight={insight} onUpdate={onUpdate} /></div>
      ) : null}

      {activeTab === 'predictions' ? (
        <div className="mt-3 space-y-3">
          <AdminStudioSectionHeading>PREDICTION ENGINE</AdminStudioSectionHeading>
          <p className="text-[6px] font-futura uppercase -mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            HISTORICAL ESTIMATES · CONFIDENCE % · NEVER FABRICATE CERTAINTY
          </p>
          <div className="space-y-2">
            {AUDIENCE_PREDICTIONS.map((p) => (
              <AdminStudioAudiencePredictionCard key={p.id} prediction={p} />
            ))}
          </div>
          <div className="space-y-2 pt-2">
            {AUDIENCE_PREDICTIONS.map((p) => (
              <AdminStudioCreativeBarScore key={`bar-${p.id}`} label={p.topic} score={p.confidence} />
            ))}
          </div>
        </div>
      ) : null}

      {activeTab === 'recommendations' ? (
        <div className="mt-3 space-y-3">
          <AdminStudioSectionHeading>RECOMMENDATION ENGINE</AdminStudioSectionHeading>
          <p className="text-[6px] font-futura uppercase -mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            EVERY RECOMMENDATION SUPPORTED BY EVIDENCE
          </p>
          {AUDIENCE_RECOMMENDATIONS.map((rec) => (
            <AdminStudioAudienceRecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      ) : null}

      {activeTab === 'feedback' ? (
        <div className="mt-3 space-y-3">
          <AdminStudioSectionHeading>FEEDBACK LOOP</AdminStudioSectionHeading>
          <p className="text-[6px] font-futura uppercase -mt-2 mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            INSIGHTS FEED INTO STUDIO MODULES — CONTINUOUS IMPROVEMENT
          </p>
          <div className="flex flex-col items-center gap-0">
            <div className="w-full px-3 py-2 text-[7px] font-futura uppercase text-center border" style={{ fontWeight: 515, color: '#FFF', background: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
              AUDIENCE BRAIN
            </div>
            {AUDIENCE_FEEDBACK_LOOP_TARGETS.map((target) => (
              <div key={target} className="w-full flex flex-col items-center">
                <div className="text-[10px]" style={{ color: ADMIN_STUDIO_THEME.accent }}>↓</div>
                <div className="w-full px-3 py-1.5 text-[7px] font-futura uppercase text-center border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.75)' }}>
                  {target}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {activeTab === 'privacy' ? (
        <div className="mt-3 space-y-3">
          <div className="p-2.5 border" style={{ background: 'rgba(235,28,36,0.06)', borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
            <p className="text-[7px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}>
              PRIVACY FIRST — AGGREGATED WHERE POSSIBLE · NO SENSITIVE PII IN DASHBOARDS
            </p>
          </div>
          <AdminStudioAudienceFieldGroups groups={AUDIENCE_PRIVACY_GROUPS} insight={insight} onUpdate={onUpdate} />
        </div>
      ) : null}

      <button
        type="button"
        onClick={resetToDefaults}
        className="w-full mt-4 py-2 text-[7px] font-futura uppercase border"
        style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
      >
        RESET DEMO INSIGHTS
      </button>

      <AdminStudioDisclaimerFooter>LEARNING ENGINE · TRACEABLE TO MEASURABLE DATA · CONNECTORS NOT CONNECTED</AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
