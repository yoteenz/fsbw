import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NDXBOOK_MISSION_CONTROL_NAV } from '../../../../studio-os-core/ndxbook/mission-control/constants';
import type { MissionControlNavId } from '../../../../studio-os-core/ndxbook/mission-control/types';
import { STUDIO_OS_ROUTES } from '../../../../studio-os-core/workspace/routes';
import { useNdxbookMissionControlState } from '../../../../hooks/useNdxbookMissionControlState';
import { StudioImmersionStyles } from '../../studio/immersion/StudioImmersionStyles';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { NDXBOOK_MC_STYLES } from './ndxbookMissionControlTheme';
import {
  ActivityWallPanel,
  ChiefConciergeBriefingPanel,
  CompanyHealthPanel,
  ExternalNavPanel,
  FounderTimelinePanel,
  HeadquartersIntro,
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
          <div className="ndxbook-hq-flow space-y-1 pb-4">
            <ChiefConciergeBriefingPanel />
            <CompanyHealthPanel {...panelProps} />
            <PublishingTimelinePanel {...panelProps} />
            <PageOfTheDayPanel {...panelProps} />
            <NewsroomPanel {...panelProps} />
            <NdxbookLibraryPanel {...panelProps} />
            <StudioIntelligencePanel {...panelProps} />
            <RevenueCenterPanel {...panelProps} />
            <LabsExperimentsPanel {...panelProps} />
            <TalentBoardPanel {...panelProps} />
            <MissionActionsPanel {...panelProps} />
            <FounderTimelinePanel />
            <ActivityWallPanel {...panelProps} />
          </div>
        );
    }
  };

  return (
    <div className="ndxbook-mission-control">
      <style>{NDXBOOK_MC_STYLES}</style>
      <StudioImmersionStyles />

      <HeadquartersIntro lastUpdatedAt={lastUpdatedAt} formatDate={formatDate} />

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
