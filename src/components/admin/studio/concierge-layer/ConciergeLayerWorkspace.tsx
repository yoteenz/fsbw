import { useState } from 'react';
import { useConciergeLayerState } from '../../../../hooks/useConciergeLayerState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ChiefConciergeExperiencePanel,
  ClDashboardPanel,
  ConciergeBehaviorPanel,
  ConciergeDirectoryPanel,
  ConciergeLayerHeader,
  ConciergePhilosophyPanel,
  ConciergeRelationshipPanel,
  ConnectedSystemsPanel,
  FutureVisionPanel,
  TerminologyMapPanel,
  WorkspaceSelectorPanel,
} from './ConciergeLayerPanels';

type ClTab = 'team' | 'behavior' | 'chief' | 'connect';

const TABS: { id: ClTab; label: string }[] = [
  { id: 'team', label: 'PHILOSOPHY · CONCIERGE TEAM' },
  { id: 'behavior', label: 'BEHAVIOR · RELATIONSHIP' },
  { id: 'chief', label: 'CHIEF CONCIERGE · TERMINOLOGY' },
  { id: 'connect', label: 'DASHBOARD · CONNECT' },
];

export function ConciergeLayerWorkspace() {
  const [tab, setTab] = useState<ClTab>('team');
  const { store, selectWorkspace } = useConciergeLayerState();
  const panelProps = { store, onSelectWorkspace: selectWorkspace };

  const renderTab = () => {
    switch (tab) {
      case 'behavior':
        return (
          <>
            <ConciergeBehaviorPanel {...panelProps} />
            <ConciergeRelationshipPanel {...panelProps} />
          </>
        );
      case 'chief':
        return (
          <>
            <ChiefConciergeExperiencePanel {...panelProps} />
            <TerminologyMapPanel {...panelProps} />
            <FutureVisionPanel {...panelProps} />
          </>
        );
      case 'connect':
        return (
          <>
            <ClDashboardPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
      case 'team':
      default:
        return (
          <>
            <ClDashboardPanel {...panelProps} />
            <ConciergePhilosophyPanel {...panelProps} />
            <ConciergeDirectoryPanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />
            <ConciergeBehaviorPanel {...panelProps} />
            <ConciergeRelationshipPanel {...panelProps} />
            <ChiefConciergeExperiencePanel {...panelProps} />
            <TerminologyMapPanel {...panelProps} />
            <FutureVisionPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="concierge-layer-root">
      <ConciergeLayerHeader />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#92704A' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#92704A' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(146,112,74,0.06)' : 'white',
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
