import type { AdminStudioHubCard } from '../../../utils/adminStudioDemo';

type AdminStudioHubCardProps = {
  card: AdminStudioHubCard;
  onClick: () => void;
};

/** Studio hub tile — matches admin dashboard StatsCard luxury language. */
export function AdminStudioHubCard({ card, onClick }: AdminStudioHubCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white/60 backdrop-blur-sm border border-black p-4 flex flex-col overflow-hidden shadow-lg transition-all duration-300 ease-out text-left w-full min-h-[120px] hover:shadow-xl active:scale-[0.99]"
      style={{ borderWidth: '1.3px' }}
    >
      <div className="flex items-center justify-between -mt-1">
        <span
          className="text-red-500 font-bold text-lg tracking-wider truncate uppercase"
          style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', color: '#EB1C24' }}
        >
          {card.title}
        </span>
        <span
          className="text-black font-bold text-lg flex-shrink-0 ml-2 uppercase"
          style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif' }}
        >
          {card.metric}
        </span>
      </div>
      <p
        className="mt-3 text-[9px] text-left font-futura uppercase leading-snug"
        style={{ fontWeight: 515, color: '#808080' }}
      >
        {card.description}
      </p>
    </button>
  );
}
