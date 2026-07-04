import { AdminStudioExecutiveCard } from '../AdminStudioExecutiveCard';
import { useAdminStudioCampaignOrchestrator } from '../../../../hooks/useAdminStudioCampaignOrchestratorState';
import { CAMPAIGN_TYPES } from '../../../../utils/adminStudioCampaignOrchestratorDemo';
import { CampaignOrchestratorWizard } from './CampaignOrchestratorWizard';
import { CampaignOrchestratorDashboard } from './CampaignOrchestratorDashboard';
import { CO_VISUAL, coActionBtn, coCaption, coPanelStyle, coSectionTitle } from './campaignOrchestratorTheme';

export function CampaignOrchestratorWorkspace() {
  const {
    view,
    setView,
    wizard,
    updateWizard,
    setWizardStep,
    startWizard,
    generatePlan,
    activeCampaign,
    campaigns,
    selectCampaign,
    toggleApproval,
    toggleAutomation,
    advanceTask,
    blueprints,
  } = useAdminStudioCampaignOrchestrator();

  if (view === 'wizard') {
    return (
      <CampaignOrchestratorWizard
        wizard={wizard}
        onUpdate={updateWizard}
        onStep={setWizardStep}
        onGenerate={generatePlan}
        onCancel={() => setView('hub')}
      />
    );
  }

  if (view === 'dashboard' && activeCampaign) {
    return (
      <CampaignOrchestratorDashboard
        plan={activeCampaign}
        onBack={() => setView('hub')}
        onToggleApproval={toggleApproval}
        onToggleAutomation={toggleAutomation}
        onAdvanceTask={advanceTask}
      />
    );
  }

  return (
    <div>
      <div style={{ ...coPanelStyle, padding: '14px', marginBottom: '16px' }}>
        <p style={{ fontFamily: '"Covered By Your Grace"', fontSize: '20px', color: CO_VISUAL.black }}>ONE GOAL. ONE PLAN.</p>
        <p style={coCaption}>ENTER THE PLANNING ROOM — STUDIOOS BUILDS THE ROADMAP. YOU REMAIN EXECUTIVE PRODUCER.</p>
        <button type="button" onClick={() => startWizard()} style={{ ...coActionBtn, marginTop: '10px' }}>
          + CREATE CAMPAIGN
        </button>
      </div>

      <p style={coSectionTitle}>CAMPAIGN TYPES</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 mb-4">
        {CAMPAIGN_TYPES.slice(0, 8).map((t) => (
          <AdminStudioExecutiveCard
            key={t.id}
            title={t.label}
            metric={`${t.deliverables.length} DELIVERABLES`}
            description={t.deliverables.slice(0, 3).join(' · ')}
            accentHex="#EB1C24"
            onClick={() => startWizard()}
          />
        ))}
      </div>

      <p style={coSectionTitle}>CAMPAIGN BLUEPRINTS · REUSABLE</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 mb-4">
        {blueprints.map((bp) => (
          <AdminStudioExecutiveCard
            key={bp.id}
            title={bp.name}
            metric="TEMPLATE"
            description={bp.description}
            accentHex="#2563EB"
            onClick={() => startWizard(bp)}
          />
        ))}
      </div>

      {campaigns.length > 0 ? (
        <section style={{ ...coPanelStyle, padding: '12px' }}>
          <p style={coSectionTitle}>ACTIVE CAMPAIGNS</p>
          {campaigns.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => selectCampaign(c.id)}
              className="w-full text-left mb-2 p-2"
              style={{ border: CO_VISUAL.border, background: '#fff', cursor: 'pointer' }}
            >
              <p style={{ ...coCaption, color: CO_VISUAL.black, fontFamily: '"Futura PT Medium"' }}>{c.wizard.name || 'UNTITLED'}</p>
              <p style={coCaption}>{c.status.toUpperCase()} · {c.progressPct}% · READINESS {c.readinessScore}%</p>
            </button>
          ))}
        </section>
      ) : null}
    </div>
  );
}
