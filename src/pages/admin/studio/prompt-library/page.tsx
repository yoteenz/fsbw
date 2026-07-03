import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioEditableField } from '../../../../components/admin/studio/AdminStudioEditableField';
import { AdminStudioPromptListItem } from '../../../../components/admin/studio/AdminStudioPromptListItem';
import { useAdminStudioPromptLibrary } from '../../../../hooks/useAdminStudioPromptLibraryState';
import {
  ADMIN_STUDIO_PROMPT_CATEGORIES,
  type AdminStudioPromptCategoryId,
} from '../../../../utils/adminStudioPromptLibraryDemo';

export default function AdminStudioPromptLibraryPage() {
  const navigate = useNavigate();
  const {
    filteredPrompts,
    favorites,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    selectedId,
    setSelectedId,
    selectedPrompt,
    updatePromptField,
    toggleFavorite,
  } = useAdminStudioPromptLibrary();

  return (
    <AdminStudioStageShell
      title="PROMPT LIBRARY"
      subtitle="EDITABLE MASTER PROMPTS — SEARCH, CATEGORIES, FAVORITES"
      breadcrumbParentLabel="THE STUDIO"
      breadcrumbParentPath="/admin/studio"
      onBack={() => navigate('/admin/studio')}
    >
      <p
        className="text-lg mb-3"
        style={{
          fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
          color: '#EB1C24',
        }}
      >
        MASTER PROMPTS
      </p>

      <div className="mb-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="SEARCH PROMPTS..."
          className="w-full bg-white/5 border border-white/15 text-white text-[9px] font-futura uppercase px-3 py-2.5 outline-none focus:border-white/40 placeholder:text-white/25"
          style={{ fontWeight: 515 }}
        />
      </div>

      <div className="flex gap-1 overflow-x-auto pb-2 mb-4 -mx-1 px-1" style={{ scrollbarWidth: 'thin' }}>
        {(
          [
            { id: 'all' as const, label: 'ALL' },
            { id: 'favorites' as const, label: `★ FAVS (${favorites.size})` },
            ...ADMIN_STUDIO_PROMPT_CATEGORIES,
          ] as Array<{ id: AdminStudioPromptCategoryId | 'all' | 'favorites'; label: string }>
        ).map((cat) => {
          const isActive = categoryFilter === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className="flex-shrink-0 px-2 py-1 text-[7px] font-futura uppercase whitespace-nowrap"
              style={{
                fontWeight: 515,
                color: isActive ? '#FFFFFF' : '#9A9A9A',
                background: isActive ? 'rgba(235,28,36,0.25)' : 'rgba(255,255,255,0.04)',
                borderBottom: isActive ? '2px solid #EB1C24' : '2px solid transparent',
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns: '1fr' }}>
        <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
          {filteredPrompts.length === 0 ? (
            <p
              className="text-[8px] font-futura uppercase py-4 text-center"
              style={{ fontWeight: 515, color: '#9A9A9A' }}
            >
              NO PROMPTS MATCH YOUR SEARCH
            </p>
          ) : (
            filteredPrompts.map((prompt) => (
              <AdminStudioPromptListItem
                key={prompt.id}
                prompt={prompt}
                isSelected={selectedId === prompt.id}
                isFavorite={favorites.has(prompt.id)}
                onSelect={() => setSelectedId(prompt.id)}
                onToggleFavorite={() => toggleFavorite(prompt.id)}
              />
            ))
          )}
        </div>

        {selectedPrompt ? (
          <div
            className="p-3 space-y-3"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <p
                className="text-[10px] leading-tight"
                style={{
                  fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                  color: '#EB1C24',
                }}
              >
                PROMPT EDITOR
              </p>
              <button
                type="button"
                onClick={() => toggleFavorite(selectedPrompt.id)}
                className="text-[8px] font-futura uppercase flex-shrink-0"
                style={{ fontWeight: 515, color: favorites.has(selectedPrompt.id) ? '#EB1C24' : '#9A9A9A' }}
              >
                {favorites.has(selectedPrompt.id) ? '★ FAVORITED' : '☆ FAVORITE'}
              </button>
            </div>

            <div className="flex flex-wrap gap-1">
              {selectedPrompt.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[6px] font-futura uppercase px-1.5 py-0.5"
                  style={{
                    fontWeight: 515,
                    color: '#9A9A9A',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            <AdminStudioEditableField
              label="TITLE"
              value={selectedPrompt.title}
              onChange={(v) => updatePromptField(selectedPrompt.id, 'title', v)}
            />
            <AdminStudioEditableField
              label="DESCRIPTION"
              value={selectedPrompt.description}
              onChange={(v) => updatePromptField(selectedPrompt.id, 'description', v)}
            />
            <AdminStudioEditableField
              label="PROMPT BODY"
              value={selectedPrompt.body}
              onChange={(v) => updatePromptField(selectedPrompt.id, 'body', v)}
              multiline
            />
          </div>
        ) : null}
      </div>

      <p
        className="mt-4 text-[7px] font-futura uppercase text-center"
        style={{ fontWeight: 515, color: '#9A9A9A' }}
      >
        EDITS SAVED LOCALLY · NO AI · FRONTEND ONLY
      </p>
    </AdminStudioStageShell>
  );
}
