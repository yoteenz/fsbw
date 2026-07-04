import { AdminStudioExecutiveCard } from '../AdminStudioExecutiveCard';
import { EXECUTIVE_AI_HUB_CARDS } from '../../../../utils/adminStudioExecutiveAiDirectorDemo';
import type { ExecutiveAiTabId } from '../../../../utils/adminStudioExecutiveAiDirectorDemo';

type ExecutiveAiDirectorHubCardsProps = {
  onSelectTab: (tab: ExecutiveAiTabId) => void;
};

export function ExecutiveAiDirectorHubCards({ onSelectTab }: ExecutiveAiDirectorHubCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 mb-4">
      {EXECUTIVE_AI_HUB_CARDS.map((card) => (
        <AdminStudioExecutiveCard
          key={card.id}
          title={card.title}
          metric={card.metric}
          description={card.description}
          accentHex={card.accentHex}
          onClick={() => onSelectTab(card.tab)}
        />
      ))}
    </div>
  );
}
