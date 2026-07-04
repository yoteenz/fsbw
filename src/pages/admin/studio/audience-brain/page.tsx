import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioSectionHeading } from '../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AdminStudioAudienceMetricCard } from '../../../../components/admin/studio/AdminStudioAudienceMetricCard';
import { AdminStudioAudienceRecommendationCard } from '../../../../components/admin/studio/AdminStudioAudienceRecommendationCard';
import { AdminStudioAudienceJourneyFlow } from '../../../../components/admin/studio/AdminStudioAudienceJourneyFlow';
import { AdminStudioAudiencePredictionCard } from '../../../../components/admin/studio/AdminStudioAudiencePredictionCard';
import {
  ADMIN_STUDIO_AUDIENCE_BRAIN_SUBTITLE,
  AUDIENCE_DASHBOARD_SECTIONS,
  AUDIENCE_FEEDBACK_LOOP_TARGETS,
  AUDIENCE_INHERITANCE_CHAIN,
  AUDIENCE_JOURNEY_STEPS,
  AUDIENCE_OVERVIEW_METRICS,
  AUDIENCE_PREDICTIONS,
  AUDIENCE_RECOMMENDATIONS,
  type AudienceDashboardSectionId,
} from '../../../../utils/adminStudioAudienceBrainDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

const SECTION_TAB_MAP: Partial<Record<AudienceDashboardSectionId, string>> = {
  'audience-overview': 'overview',
  'member-behavior': 'overview',
  'content-insights': 'content',
  'product-insights': 'product',
  'journey-analytics': 'journey',
  'psa-insights': 'psa',
  'community-health': 'community',
  'conversion-intelligence': 'conversion',
  predictions: 'predictions',
  recommendations: 'recommendations',
};

export default function AdminStudioAudienceBrainPage() {
  const navigate = useNavigate();

  return (
    <AdminStudioStageShell
      title="AUDIENCE BRAIN"
      subtitle={ADMIN_STUDIO_AUDIENCE_BRAIN_SUBTITLE}
      breadcrumbParentLabel="THE STUDIO"
      breadcrumbParentPath="/admin/studio"
      onBack={() => navigate('/admin/studio')}
    >
      <div className="p-3 mb-4 border" style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <p className="text-[7px] font-futura uppercase mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          EXECUTIVE INTELLIGENCE CENTER — AGGREGATED DATA ONLY · NEVER FABRICATE CERTAINTY
        </p>
        <div className="flex flex-col items-center gap-0">
          {AUDIENCE_INHERITANCE_CHAIN.map((step, i) => (
            <div key={step} className="w-full flex flex-col items-center">
              {i > 0 ? <div className="w-px h-2" style={{ background: ADMIN_STUDIO_THEME.panelBorderStrong }} /> : null}
              <div
                className="w-full px-2 py-1 text-[7px] font-futura uppercase text-center border"
                style={{
                  fontWeight: 515,
                  color: step === 'AUDIENCE BRAIN' ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
                  background: step === 'AUDIENCE BRAIN' ? ADMIN_STUDIO_THEME.selectedBg : 'rgba(255,255,255,0.6)',
                  borderColor: ADMIN_STUDIO_THEME.panelBorder,
                }}
              >
                {step}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AdminStudioSectionHeading>INTELLIGENCE DASHBOARD</AdminStudioSectionHeading>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {AUDIENCE_DASHBOARD_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => navigate(`/admin/studio/audience-brain/intelligence?tab=${SECTION_TAB_MAP[section.id] ?? 'overview'}`)}
            className="p-2.5 border text-left transition-transform active:scale-[0.98]"
            style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
          >
            <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>{section.title}</p>
            <p className="text-[14px] leading-none mt-1" style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: ADMIN_STUDIO_THEME.textPrimary }}>{section.metric}</p>
            <p className="text-[5px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.4 }}>{section.description}</p>
          </button>
        ))}
      </div>

      <AdminStudioSectionHeading>AUDIENCE PROFILE</AdminStudioSectionHeading>
      <p className="text-[6px] font-futura uppercase -mt-2 mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        AGGREGATED TRENDS · NO INDIVIDUAL PII
      </p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {AUDIENCE_OVERVIEW_METRICS.map((m) => (
          <AdminStudioAudienceMetricCard key={m.id} metric={m} />
        ))}
      </div>

      <AdminStudioSectionHeading>CUSTOMER JOURNEY</AdminStudioSectionHeading>
      <div className="mb-4">
        <AdminStudioAudienceJourneyFlow steps={AUDIENCE_JOURNEY_STEPS} />
      </div>

      <AdminStudioSectionHeading>TOP RECOMMENDATIONS</AdminStudioSectionHeading>
      <div className="space-y-2 mb-4">
        {AUDIENCE_RECOMMENDATIONS.slice(0, 4).map((rec) => (
          <AdminStudioAudienceRecommendationCard
            key={rec.id}
            recommendation={rec}
            onClick={() => navigate('/admin/studio/audience-brain/intelligence?tab=recommendations')}
          />
        ))}
      </div>

      <AdminStudioSectionHeading>PREDICTIONS</AdminStudioSectionHeading>
      <p className="text-[6px] font-futura uppercase -mt-2 mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        CONFIDENCE SCORES — ESTIMATES NOT GUARANTEES
      </p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {AUDIENCE_PREDICTIONS.slice(0, 4).map((p) => (
          <AdminStudioAudiencePredictionCard key={p.id} prediction={p} />
        ))}
      </div>

      <AdminStudioSectionHeading>FEEDBACK LOOP</AdminStudioSectionHeading>
      <div className="flex flex-col items-center gap-0 mb-4">
        <div className="w-full px-2 py-1 text-[6px] font-futura uppercase text-center border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder, background: ADMIN_STUDIO_THEME.selectedBg }}>
          AUDIENCE BRAIN INSIGHTS
        </div>
        {AUDIENCE_FEEDBACK_LOOP_TARGETS.map((target) => (
          <div key={target} className="w-full flex flex-col items-center">
            <div className="w-px h-2" style={{ background: ADMIN_STUDIO_THEME.panelBorderStrong }} />
            <div className="w-full px-2 py-1 text-[6px] font-futura uppercase text-center border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.7)' }}>
              {target}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => navigate('/admin/studio/audience-brain/intelligence')}
        className="w-full mb-4 py-2.5 text-[7px] font-futura uppercase border"
        style={{ fontWeight: 515, color: '#FFF', background: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
      >
        OPEN INTELLIGENCE CENTER
      </button>

      <div className="flex gap-2">
        <button type="button" onClick={() => navigate('/admin/studio/distribution-network')} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>← DISTRIBUTION</button>
        <button type="button" onClick={() => navigate('/admin/studio/intelligence-engine')} className="flex-1 py-2 text-[7px] font-futura uppercase border" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}>INTELLIGENCE ENGINE →</button>
      </div>

      <AdminStudioDisclaimerFooter>AGGREGATED ANALYTICS ONLY · CONNECTORS NOT CONNECTED · CONSENT-READY ARCHITECTURE</AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
