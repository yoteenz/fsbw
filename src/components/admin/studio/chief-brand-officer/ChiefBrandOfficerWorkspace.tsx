import { useState } from 'react';
import { useChiefBrandOfficerState } from '../../../../hooks/useChiefBrandOfficerState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { ConciergeFounderBanner } from '../concierge-layer/ConciergeFounderBanner';
import { StudioTabMoreHint } from '../StudioTabMoreHint';
import {
  BrandAlignmentPanel,
  BrandCouncilPanel,
  BrandEvolutionPanel,
  BrandGovernancePanel,
  BrandIntelligencePanel,
  BrandMemoryPanel,
  BrandProtectionPanel,
  ChiefBrandOfficerHeader,
  CboDashboardPanel,
  ConnectedSystemsPanel,
  CreativeReviewStudioPanel,
  DailyBriefingPanel,
  ExecutiveCompassPanel,
  LeadershipPhilosophyPanel,
  RecommendationsPanel,
  WorkspaceSelectorPanel,
} from './ChiefBrandOfficerPanels';

type CboTab = 'brand' | 'govern' | 'align' | 'studio' | 'protect' | 'connect';

const TABS: { id: CboTab; label: string }[] = [
  { id: 'brand', label: 'BRAND · STEWARD' },
  { id: 'govern', label: 'GOVERN · ALIGN' },
  { id: 'align', label: 'INTELLIGENCE · EVOLVE' },
  { id: 'studio', label: 'STUDIO · COUNCIL' },
  { id: 'protect', label: 'PROTECT · BRIEF' },
  { id: 'connect', label: 'CONNECT · SYSTEMS' },
];

export function ChiefBrandOfficerWorkspace() {
  const [tab, setTab] = useState<CboTab>('brand');
  const { store, selectWorkspace } = useChiefBrandOfficerState();
  const panelProps = { store, onSelectWorkspace: selectWorkspace };

  const renderTab = () => {
    switch (tab) {
      case 'govern':
        return (
          <>
            <BrandGovernancePanel {...panelProps} />
            <BrandAlignmentPanel {...panelProps} />
            <RecommendationsPanel {...panelProps} />
          </>
        );
      case 'align':
        return (
          <>
            <BrandIntelligencePanel {...panelProps} />
            <BrandEvolutionPanel {...panelProps} />
            <BrandMemoryPanel {...panelProps} />
          </>
        );
      case 'studio':
        return (
          <>
            <CreativeReviewStudioPanel {...panelProps} />
            <BrandCouncilPanel {...panelProps} />
          </>
        );
      case 'protect':
        return (
          <>
            <BrandProtectionPanel {...panelProps} />
            <DailyBriefingPanel {...panelProps} />
          </>
        );
      case 'connect':
        return <ConnectedSystemsPanel />;
      case 'brand':
        return (
          <>
            <CboDashboardPanel {...panelProps} />
            <ExecutiveCompassPanel {...panelProps} />
            <LeadershipPhilosophyPanel {...panelProps} />
            <WorkspaceSelectorPanel {...panelProps} />

            <StudioTabMoreHint accent="rgba(15,23,42,0.04)">
              ADDITIONAL SECTIONS ON OTHER TABS — OPEN TABS FOR FULL DETAIL
            </StudioTabMoreHint>
            <ConnectedSystemsPanel />
          </>
        );
    }
  };

  return (
    <div className="chief-brand-officer-root">
      <ChiefBrandOfficerHeader />
      <ConciergeFounderBanner conciergeId="brand-concierge" />
      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#7C3AED' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#7C3AED' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(124,58,237,0.06)' : 'white',
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
