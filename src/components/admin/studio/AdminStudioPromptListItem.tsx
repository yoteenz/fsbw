import type { AdminStudioPromptEntry } from '../../../utils/adminStudioPromptLibraryDemo';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioPromptListItemProps = {
  prompt: AdminStudioPromptEntry;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
};

export function AdminStudioPromptListItem({
  prompt,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: AdminStudioPromptListItemProps) {
  return (
    <div
      className="flex items-stretch gap-0 transition-all border"
      style={{
        background: isSelected ? ADMIN_STUDIO_THEME.selectedBg : 'rgba(255,255,255,0.7)',
        borderColor: isSelected ? `${ADMIN_STUDIO_THEME.accent}55` : ADMIN_STUDIO_THEME.panelBorder,
      }}
    >
      <button type="button" onClick={onSelect} className="flex-1 text-left p-2.5 min-w-0">
        <p
          className="text-[9px] truncate mb-0.5"
          style={{
            fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
            color: isSelected ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textPrimary,
          }}
        >
          {prompt.title}
        </p>
        <p
          className="text-[6px] font-futura uppercase truncate"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}
        >
          {prompt.category}
        </p>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className="flex-shrink-0 px-2 flex items-center"
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <span style={{ color: isFavorite ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary, fontSize: '12px' }}>
          {isFavorite ? '★' : '☆'}
        </span>
      </button>
    </div>
  );
}
