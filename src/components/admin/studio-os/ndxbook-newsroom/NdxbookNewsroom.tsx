import { useState } from 'react';
import { useNdxbookNewsroomState } from '../../../../hooks/useNdxbookNewsroomState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import {
  ActivityWallPanel,
  StrategyAlignmentPanel,
  CrossCompanyNewsroomPanel,
  DepartmentLanesPanel,
  EditorialCalendarPanel,
  KnowledgeProductionPanel,
  NewsroomDashboardPanel,
  NewsroomHeader,
  OperationalDnaPanel,
  OrchestrationPanel,
  PageWorkspacePanel,
  ProductionBoardPanel,
  ProductionIntelligencePanel,
  QualityGatesPanel,
  TalentRoutingPanel,
} from './NdxbookNewsroomPanels';

type NewsroomTab = 'floor' | 'page' | 'departments' | 'calendar' | 'intelligence' | 'dna';

const TABS: { id: NewsroomTab; label: string }[] = [
  { id: 'floor', label: 'PRODUCTION FLOOR' },
  { id: 'page', label: 'PAGE WORKSPACE' },
  { id: 'departments', label: 'DEPARTMENTS' },
  { id: 'calendar', label: 'CALENDAR' },
  { id: 'intelligence', label: 'INTELLIGENCE' },
  { id: 'dna', label: 'OPERATIONAL DNA' },
];

type NdxbookNewsroomProps = {
  workspaceId: string;
};

export function NdxbookNewsroom({ workspaceId }: NdxbookNewsroomProps) {
  const [tab, setTab] = useState<NewsroomTab>('floor');
  const { store, selectedPage, movePage, selectPage, rescheduleCalendar, formatTime } = useNdxbookNewsroomState();

  const panelProps = {
    store,
    selectedPage,
    workspaceId,
    formatTime,
    onSelectPage: selectPage,
    onMovePage: movePage,
    onReschedule: rescheduleCalendar,
  };

  const renderTab = () => {
    switch (tab) {
      case 'page':
        return (
          <>
            <ProductionBoardPanel {...panelProps} />
            <PageWorkspacePanel {...panelProps} />
            <StrategyAlignmentPanel selectedPage={selectedPage} />
            <QualityGatesPanel />
          </>
        );
      case 'departments':
        return (
          <>
            <DepartmentLanesPanel store={store} />
            <TalentRoutingPanel store={store} />
            <OrchestrationPanel store={store} />
          </>
        );
      case 'calendar':
        return <EditorialCalendarPanel {...panelProps} />;
      case 'intelligence':
        return (
          <>
            <ProductionIntelligencePanel store={store} />
            <StrategyAlignmentPanel selectedPage={selectedPage} />
            <ActivityWallPanel store={store} formatTime={formatTime} />
            <KnowledgeProductionPanel store={store} />
          </>
        );
      case 'dna':
        return (
          <>
            <OperationalDnaPanel store={store} />
            <QualityGatesPanel />
            <CrossCompanyNewsroomPanel />
          </>
        );
      case 'floor':
      default:
        return (
          <>
            <NewsroomDashboardPanel store={store} />
            <ProductionBoardPanel {...panelProps} />
            <PageWorkspacePanel {...panelProps} />
            <DepartmentLanesPanel store={store} />
            <OrchestrationPanel store={store} />
            <EditorialCalendarPanel {...panelProps} />
            <ActivityWallPanel {...panelProps} />
            <ProductionIntelligencePanel store={store} />
            <TalentRoutingPanel store={store} />
            <QualityGatesPanel />
            <OperationalDnaPanel store={store} />
            <KnowledgeProductionPanel store={store} />
            <CrossCompanyNewsroomPanel />
          </>
        );
    }
  };

  return (
    <div className="ndxbook-newsroom-root">
      <NewsroomHeader workspaceId={workspaceId} />

      <div className="flex gap-1 overflow-x-auto pb-2 mb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className="whitespace-nowrap px-2 py-1 text-[6px] font-futura border"
            style={{
              fontWeight: 515,
              borderColor: tab === t.id ? '#DC2626' : ADMIN_STUDIO_THEME.panelBorder,
              color: tab === t.id ? '#DC2626' : ADMIN_STUDIO_THEME.textSecondary,
              background: tab === t.id ? 'rgba(220,38,38,0.06)' : 'white',
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
