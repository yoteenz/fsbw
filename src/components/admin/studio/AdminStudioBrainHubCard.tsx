import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';
import type { ContentBrainHubCard } from '../../../utils/adminStudioContentBrainDemo';

type AdminStudioBrainHubCardProps = {
  card: ContentBrainHubCard;
  onClick: () => void;
};

export function AdminStudioBrainHubCard({ card, onClick }: AdminStudioBrainHubCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left p-3 transition-all hover:bg-white/80 border bg-white/70"
      style={{
        borderColor: ADMIN_STUDIO_THEME.panelBorder,
        borderWidth: '1px',
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p
          className="text-[11px] leading-tight flex-1"
          style={{
            fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
            color: ADMIN_STUDIO_THEME.accent,
          }}
        >
          {card.title}
        </p>
        <span
          className="text-[14px] flex-shrink-0"
          style={{
            fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
            color: ADMIN_STUDIO_THEME.textSecondary,
          }}
        >
          {card.metric}
        </span>
      </div>
      <p
        className="text-[7px] font-futura uppercase"
        style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}
      >
        {card.description}
      </p>
    </button>
  );
}
