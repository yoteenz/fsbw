import type { AdminStudioPromptEntry } from '../../../utils/adminStudioPromptLibraryDemo';

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
      className="flex items-stretch gap-0 transition-all"
      style={{
        background: isSelected ? 'rgba(235,28,36,0.1)' : 'rgba(255,255,255,0.03)',
        border: isSelected ? '1px solid #EB1C2455' : '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex-1 text-left p-2.5 min-w-0"
      >
        <p
          className="text-[9px] truncate mb-0.5"
          style={{
            fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
            color: isSelected ? '#EB1C24' : '#FFFFFF',
          }}
        >
          {prompt.title}
        </p>
        <p
          className="text-[6px] font-futura uppercase truncate"
          style={{ fontWeight: 515, color: '#9A9A9A' }}
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
        <span style={{ color: isFavorite ? '#EB1C24' : '#9A9A9A', fontSize: '12px' }}>
          {isFavorite ? '★' : '☆'}
        </span>
      </button>
    </div>
  );
}
