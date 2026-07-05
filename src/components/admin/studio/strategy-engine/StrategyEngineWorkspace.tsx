import { useState } from 'react';
import { useStrategyEngineState } from '../../../../hooks/useStrategyEngineState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ActiveStrategiesPanel,
  AlignmentPanel,
  ConnectedSystemsPanel,
  CosIntegrationPanel,
  DecisionJournalPanel,
  InitiativesPanel,
  IntelligenceSignalsPanel,
  SimulationPanel,
  StrategicBetsPanel,
  StrategyBoardPanel,
  StrategyBuilderPanel,
  StrategyEngineHeader,
  StrategyHealthPanel,
  StrategyHierarchyPanel,
  StrategyInheritancePanel,
  StrategyLineagePanel,
  StrategyProfilePanel,
  StrategyReviewPanel,
  WorkspaceSelectorPanel,
} from './StrategyEnginePanels';

type SeTab = 'board' | 'builder' | 'initiatives' | 'health' | 'decisions' | 'lineage';

const TABS: { id: SeTab; label: string }[] = [
  { id: 'board', label: 'STRATEGY BOARD' },
  { id: 'builder', label: 'BUILDER' },
  { id: 'initiatives', label: 'INITIATIVES · BETS' },
  { id: 'health', label: 'HEALTH · ALIGNMENT' },
  { id: 'decisions', label: 'DECISIONS · REVIEWS' },
  { id: 'lineage', label: 'LINEAGE · INHERITANCE' },
];

export function StrategyEngineWorkspace() {
  const [tab, setTab] = useState<SeTab>('board');
  const {
    store,
    activeProfile,
    selectedStrategy,
    selectedInitiative,
    workspaceStrategies,
    workspaceInitiatives,
    workspaceBets,
    selectWorkspace,
    selectStrategy,
    selectInitiative,
    setBuilderStep,
  } = useStrategyEngineState();

  const panelProps = {
    store,
    activeProfile,
    selectedStrategy,
    selectedInitiative,
    workspaceStrategies,
    workspaceInitiatives,
    workspaceBets,
    onSelectWorkspace: selectWorkspace,
    onSelectStrategy: selectStrategy,
    onSelectInitiative: selectInitiative,
    onSetBuilderStep: setBuilderStep,
  };

  const renderTab = () => {
    switch (tab) {
      case 'builder':
        return (
          <>
            <StrategyBuilderPanel {...panelProps} />
            <StrategyProfilePanel {...panelProps} />
            <ActiveStrategiesPanel {...panelProps} />
            <SimulationPanel {...panelProps} />
          </>
        );
      case 'initiatives':
        return (
          <>
            <InitiativesPanel {...panelProps} />
            <StrategicBetsPanel {...panelProps} />
            <CosIntegrationPanel {...panelProps} />
          </>
        );
      case 'health':
        return (
          <>
            <StrategyHealthPanel {...panelProps} />
            <AlignmentPanel {...panelProps} />
            <IntelligenceSignalsPanel {...panelProps} />
          </>
        );
      case 'decisions':
        return (
          <>
            <DecisionJournalPanel {...panelProps} />
            <StrategyReviewPanel {...panelProps} />
          </>
        );
      case 'lineage':
        return (
          <>
            <StrategyLineagePanel {...panelProps} />
            <StrategyHierarchyPanel {...panelProps} />
            <StrategyInheritancePanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
      case 'board':
      default:
        return (
          <>
            <WorkspaceSelectorPanel {...panelProps} />
            <StrategyBoardPanel {...panelProps} />
            <StrategyProfilePanel {...panelProps} />
            <ActiveStrategiesPanel {...panelProps} />
            <InitiativesPanel {...panelProps} />
            <StrategicBetsPanel {...panelProps} />
            <StrategyHealthPanel {...panelProps} />
            <AlignmentPanel {...panelProps} />
            <IntelligenceSignalsPanel {...panelProps} />
            <CosIntegrationPanel {...panelProps} />
            <DecisionJournalPanel {...panelProps} />
            <StrategyReviewPanel {...panelProps} />
            <StrategyLineagePanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="strategy-engine-root">
      <StrategyEngineHeader />

      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#334155' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#334155' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(51,65,85,0.06)' : 'white',
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
