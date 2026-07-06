import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NDXBOOK_MISSION_CONTROL_NAV } from '../../../../studio-os-core/ndxbook/mission-control/constants';
import type { MissionControlNavId } from '../../../../studio-os-core/ndxbook/mission-control/types';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import { useNdxbookMissionControlState } from '../../../../hooks/useNdxbookMissionControlState';
import { useOrganizationContext } from '../../../../studio-os-core/organization-context';
import { readFounderPilotModeStore } from '../../../../studio-os-core/founder-pilot-mode';
import { StudioImmersionStyles } from '../../studio/immersion/StudioImmersionStyles';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { NDXBOOK_MC_STYLES } from './ndxbookMissionControlTheme';
import { NdxbookExecutiveLobby } from './NdxbookExecutiveLobby';
import {
  HqExperienceStyles,
  HqWingZone,
  resolveHeadquartersEnvironment,
  resolveHeadquartersMaturity,
} from '../../studio/headquarters-experience';
import {
  ActivityWallPanel,
  CompanyHealthPanel,
  ExternalNavPanel,
  FounderTimelinePanel,
  LabsExperimentsPanel,
  MissionActionsPanel,
  NdxbookLibraryPanel,
  NewsroomPanel,
  PageOfTheDayPanel,
  PublishingTimelinePanel,
  ReaderIntelligencePanel,
  RevenueCenterPanel,
  StudioIntelligencePanel,
  TalentBoardPanel,
  VolumeExplorerPanel,
} from './NdxbookMissionControlPanels';

type NdxbookMissionControlProps = {
  workspaceId: string;
  accentColor?: string;
};

export function NdxbookMissionControl({ workspaceId, accentColor = '#6366F1' }: NdxbookMissionControlProps) {
  const navigate = useNavigate();
  const org = useOrganizationContext();
  const env = resolveHeadquartersEnvironment(org.organizationId);
  const [activeNav, setActiveNav] = useState<MissionControlNavId>('mission-control');
  const {
    store,
    formatTime,
    formatDate,
    formatClock,
    countdownToLaunch,
    lastUpdatedAt,
    rescheduleItem,
  } = useNdxbookMissionControlState();

  const pilot = readFounderPilotModeStore(org.organizationId);
  const overallHealth = store.companyHealth.find((m) => m.id === 'overall')?.score ?? 0;
  const maturity = resolveHeadquartersMaturity(pilot.pagesPublished, overallHealth);

  const panelProps = {
    store,
    formatTime,
    formatDate,
    formatClock,
    countdownToLaunch,
    lastUpdatedAt,
    onReschedule: rescheduleItem,
  };

  const renderFocusedView = () => {
    switch (activeNav) {
      case 'newsroom':
        return <NewsroomPanel {...panelProps} />;
      case 'library':
        return <NdxbookLibraryPanel {...panelProps} />;
      case 'publishing':
        return <PublishingTimelinePanel {...panelProps} />;
      case 'analytics':
        return (
          <>
            <ReaderIntelligencePanel {...panelProps} />
            <VolumeExplorerPanel {...panelProps} />
          </>
        );
      case 'experiments':
        return <LabsExperimentsPanel {...panelProps} />;
      case 'studio-intelligence':
        return <StudioIntelligencePanel {...panelProps} />;
      case 'creative-dna':
      case 'knowledge':
      case 'settings':
        return <ExternalNavPanel tab={activeNav} workspaceId={workspaceId} />;
      case 'mission-control':
      default:
        return (
          <div className="ndxbook-hq-flow pb-36">
            <NdxbookExecutiveLobby store={store} formatDate={formatDate} formatClock={formatClock} />

            <HqWingZone wing="COMPANY PULSE™" title="How the organization feels today" accentHex={env.accentHex}>
              <CompanyHealthPanel {...panelProps} />
            </HqWingZone>

            <HqWingZone wing="PRIORITY OF THE DAY" title="Today's mission" accentHex={env.accentHex}>
              <PageOfTheDayPanel {...panelProps} />
            </HqWingZone>

            <HqWingZone wing="OPERATIONS WING™" title="Production & publishing" subtitle="Pipeline in motion" accentHex={env.accentHex}>
              <PublishingTimelinePanel {...panelProps} />
              <NewsroomPanel {...panelProps} />
            </HqWingZone>

            <HqWingZone wing="KNOWLEDGE WING™" title="Library & intelligence" accentHex={env.accentHex}>
              <NdxbookLibraryPanel {...panelProps} />
              <StudioIntelligencePanel {...panelProps} />
            </HqWingZone>

            {maturity.showFinancial ? (
              <HqWingZone wing="FINANCIAL WING™" title="Revenue snapshot" accentHex={env.accentHex}>
                <RevenueCenterPanel {...panelProps} />
              </HqWingZone>
            ) : null}

            {maturity.showInnovation ? (
              <HqWingZone wing="INNOVATION WING™" title="Labs & talent" accentHex={env.accentHex}>
                <LabsExperimentsPanel {...panelProps} />
                <TalentBoardPanel {...panelProps} />
                <MissionActionsPanel {...panelProps} />
              </HqWingZone>
            ) : null}

            {maturity.showLegacy ? (
              <HqWingZone wing="LEGACY WING™" title="Permanent organizational history" accentHex={env.accentHex}>
                <FounderTimelinePanel />
                <ActivityWallPanel {...panelProps} />
              </HqWingZone>
            ) : null}
          </div>
        );
    }
  };

  return (
    <div className="ndxbook-mission-control">
      <style>{NDXBOOK_MC_STYLES}</style>
      <HqExperienceStyles />
      <StudioImmersionStyles />

      <div className="flex gap-1 overflow-x-auto pb-2 mb-3" role="tablist" aria-label="Department navigation">
        {NDXBOOK_MISSION_CONTROL_NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={activeNav === item.id}
            onClick={() => {
              if (item.id === 'newsroom') {
                navigate(STUDIO_OS_ROUTES.workspaceNewsroom(workspaceId));
                return;
              }
              setActiveNav(item.id);
            }}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: activeNav === item.id ? accentColor : ADMIN_STUDIO_THEME.panelBorder,
              color: activeNav === item.id ? accentColor : ADMIN_STUDIO_THEME.textSecondary,
              background: activeNav === item.id ? 'rgba(99,102,241,0.08)' : 'white',
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {renderFocusedView()}
    </div>
  );
}
