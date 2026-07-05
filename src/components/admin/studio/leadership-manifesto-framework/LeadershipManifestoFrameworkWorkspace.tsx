import { useState } from 'react';
import { useLeadershipManifestoFrameworkState } from '../../../../hooks/useLeadershipManifestoFrameworkState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { StudioTabMoreHint } from '../StudioTabMoreHint';
import {
  CollaborationPhilosophyPanel,
  CommunicationStandardsPanel,
  RecommendedNextStepsPanel,
  ConnectedSystemsPanel,
  CoreBeliefsPanel,
  DecisionFrameworkPanel,
  ExcellencePanel,
  ExecutiveCompassPanel,
  ExecutiveIdentityPanel,
  FounderRelationshipPanel,
  LeadershipManifestoFrameworkHeader,
  LeadershipPhilosophyPanel,
  LearningPhilosophyPanel,
  LegacyCommitmentPanel,
  ManifestoDashboardPanel,
  ManifestoInheritancePanel,
  ManifestoPhilosophyPanel,
  NonNegotiablesPanel,
  WorkspaceSelectorPanel,
} from './LeadershipManifestoFrameworkPanels';

type LmfTab = 'manifesto' | 'identity' | 'beliefs' | 'decide' | 'communicate' | 'inherit' | 'connect';

const TABS: { id: LmfTab; label: string }[] = [
  { id: 'manifesto', label: 'MANIFESTO · HEALTH' },
  { id: 'identity', label: 'IDENTITY · PHILOSOPHY' },
  { id: 'beliefs', label: 'BELIEFS · NON-NEGOTIABLES' },
  { id: 'decide', label: 'DECIDE · COMPASS' },
  { id: 'communicate', label: 'COMMUNICATE · COLLABORATE' },
  { id: 'inherit', label: 'INHERIT · LEGACY' },
  { id: 'connect', label: 'CONNECT · SYSTEMS' },
];

export function LeadershipManifestoFrameworkWorkspace() {
  const [tab, setTab] = useState<LmfTab>('manifesto');
  const { store, selectWorkspace } = useLeadershipManifestoFrameworkState();
  const panelProps = { store, onSelectWorkspace: selectWorkspace };

  const renderTab = () => {
    switch (tab) {
      case 'identity':
        return (
          <>
            <ExecutiveIdentityPanel {...panelProps} />
            <LeadershipPhilosophyPanel {...panelProps} />
            <FounderRelationshipPanel {...panelProps} />
          </>
        );
      case 'beliefs':
        return (
          <>
            <CoreBeliefsPanel {...panelProps} />
            <NonNegotiablesPanel {...panelProps} />
          </>
        );
      case 'decide':
        return (
          <>
            <DecisionFrameworkPanel {...panelProps} />
            <ExecutiveCompassPanel {...panelProps} />
            <ExcellencePanel {...panelProps} />
          </>
        );
      case 'communicate':
        return (
          <>
            <CommunicationStandardsPanel {...panelProps} />
            <CollaborationPhilosophyPanel {...panelProps} />
            <LearningPhilosophyPanel {...panelProps} />
          </>
        );
      case 'inherit':
        return (
          <>
            <ManifestoInheritancePanel {...panelProps} />
            <LegacyCommitmentPanel {...panelProps} />
            <RecommendedNextStepsPanel {...panelProps} />
          </>
        );
      case 'connect':
        return <ConnectedSystemsPanel />;
      case 'manifesto':
        return (
          <>
            <ManifestoDashboardPanel {...panelProps} />
            <ManifestoPhilosophyPanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />
            <LeadershipPhilosophyPanel {...panelProps} />

            <StudioTabMoreHint accent="rgba(15,23,42,0.04)">
              ADDITIONAL SECTIONS ON OTHER TABS — OPEN TABS FOR FULL DETAIL
            </StudioTabMoreHint>
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="leadership-manifesto-framework-root">
      <LeadershipManifestoFrameworkHeader />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#4338CA' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#4338CA' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(67,56,202,0.06)' : 'white',
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
