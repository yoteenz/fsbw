import { useState } from 'react';
import { useFoundersPromiseState } from '../../../../hooks/useFoundersPromiseState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { StudioTabMoreHint } from '../StudioTabMoreHint';
import {
  CampusInstallationPanel,
  ConnectedSystemsPanel,
  CurrentPromisePanel,
  ExecutiveAlignmentPanel,
  FoundersPromiseHeader,
  LegacyInheritancePanel,
  LivingEvolutionPanel,
  OrganizationalAlignmentPanel,
  OriginalPromisePanel,
  PromiseArchivePanel,
  PromiseDashboardPanel,
  PromisePhilosophyPanel,
  PromiseVersionsPanel,
  ReflectionMomentsPanel,
  ReflectiveQuestionsPanel,
  WorkspaceSelectorPanel,
} from './FoundersPromisePanels';

type FpTab = 'promise' | 'reflect' | 'living' | 'align' | 'archive' | 'connect';

const TABS: { id: FpTab; label: string }[] = [
  { id: 'promise', label: 'PROMISE · NORTH STAR' },
  { id: 'reflect', label: 'REFLECT · WRITE' },
  { id: 'living', label: 'LIVING · EVOLVE' },
  { id: 'align', label: 'ALIGN · DECIDE' },
  { id: 'archive', label: 'ARCHIVE · LEGACY' },
  { id: 'connect', label: 'CONNECT · CAMPUS' },
];

export function FoundersPromiseWorkspace() {
  const [tab, setTab] = useState<FpTab>('promise');
  const { store, selectWorkspace } = useFoundersPromiseState();
  const panelProps = { store, onSelectWorkspace: selectWorkspace };

  const renderTab = () => {
    switch (tab) {
      case 'reflect':
        return (
          <>
            <ReflectiveQuestionsPanel {...panelProps} />
            <CurrentPromisePanel {...panelProps} />
            <ReflectionMomentsPanel {...panelProps} />
          </>
        );
      case 'living':
        return (
          <>
            <OriginalPromisePanel {...panelProps} />
            <PromiseVersionsPanel {...panelProps} />
            <LivingEvolutionPanel {...panelProps} />
          </>
        );
      case 'align':
        return (
          <>
            <OrganizationalAlignmentPanel {...panelProps} />
            <ExecutiveAlignmentPanel {...panelProps} />
          </>
        );
      case 'archive':
        return (
          <>
            <PromiseArchivePanel {...panelProps} />
            <LegacyInheritancePanel {...panelProps} />
          </>
        );
      case 'connect':
        return (
          <>
            <CampusInstallationPanel {...panelProps} />
            <ConnectedSystemsPanel />
          </>
        );
      case 'promise':
        return (
          <>
            <PromiseDashboardPanel {...panelProps} />
            <PromisePhilosophyPanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />
            <CurrentPromisePanel {...panelProps} />

            <StudioTabMoreHint accent="rgba(15,23,42,0.04)">
              ADDITIONAL SECTIONS ON OTHER TABS — OPEN TABS FOR FULL DETAIL
            </StudioTabMoreHint>
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="founders-promise-root">
      <FoundersPromiseHeader />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#92400E' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#92400E' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(146,64,14,0.06)' : 'white',
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
