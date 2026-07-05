import { useState } from 'react';
import { useLeadershipModesState } from '../../../../hooks/useLeadershipModesState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  AdaptiveInterfacePanel,
  CampusTransformationPanel,
  ChiefOfStaffBriefingsPanel,
  ConnectedSystemsPanel,
  ExecutiveBehaviorPanel,
  LeadershipModesHeader,
  LeadershipModesPanel,
  LeadershipPhilosophyPanel,
  LeadershipTransitionsPanel,
  LmDashboardPanel,
  ModeDetectionPanel,
  OiModeIntegrationPanel,
  RecommendedNextStepsPanel,
  WorkspaceSelectorPanel,
} from './LeadershipModesPanels';

type LmTab = 'modes' | 'detect' | 'cos' | 'oi' | 'transition' | 'connect';

const TABS: { id: LmTab; label: string }[] = [
  { id: 'modes', label: 'MODES · PHILOSOPHY' },
  { id: 'detect', label: 'DETECT · ADAPTIVE' },
  { id: 'cos', label: 'CoS · EXECUTIVES' },
  { id: 'oi', label: 'OI · CAMPUS' },
  { id: 'transition', label: 'TRANSITION · DASHBOARD' },
  { id: 'connect', label: 'CONNECT' },
];

export function LeadershipModesWorkspace() {
  const [tab, setTab] = useState<LmTab>('modes');
  const { store, selectWorkspace, selectMode } = useLeadershipModesState();
  const panelProps = { store, onSelectWorkspace: selectWorkspace, onSelectMode: selectMode };

  const renderTab = () => {
    switch (tab) {
      case 'detect':
        return (
          <>
            <ModeDetectionPanel {...panelProps} />
            <AdaptiveInterfacePanel {...panelProps} />
          </>
        );
      case 'cos':
        return (
          <>
            <ChiefOfStaffBriefingsPanel {...panelProps} />
            <ExecutiveBehaviorPanel {...panelProps} />
          </>
        );
      case 'oi':
        return (
          <>
            <OiModeIntegrationPanel {...panelProps} />
            <CampusTransformationPanel {...panelProps} />
          </>
        );
      case 'transition':
        return (
          <>
            <LmDashboardPanel {...panelProps} />
            <LeadershipTransitionsPanel {...panelProps} />
            <RecommendedNextStepsPanel {...panelProps} />
          </>
        );
      case 'connect':
        return (
          <>
            <LmDashboardPanel {...panelProps} />
            <RecommendedNextStepsPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
      case 'modes':
      default:
        return (
          <>
            <LmDashboardPanel {...panelProps} />
            <LeadershipPhilosophyPanel {...panelProps} />
            <LeadershipModesPanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />
            <ModeDetectionPanel {...panelProps} />
            <AdaptiveInterfacePanel {...panelProps} />
            <ChiefOfStaffBriefingsPanel {...panelProps} />
            <ExecutiveBehaviorPanel {...panelProps} />
            <OiModeIntegrationPanel {...panelProps} />
            <CampusTransformationPanel {...panelProps} />
            <LeadershipTransitionsPanel {...panelProps} />
            <RecommendedNextStepsPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="leadership-modes-root">
      <LeadershipModesHeader />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#4F46E5' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#4F46E5' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(79,70,229,0.06)' : 'white',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {renderTab()}
    </div>
  );
}
