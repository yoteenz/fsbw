import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioSectionHeading } from '../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioSearchInput } from '../../../../components/admin/studio/AdminStudioSearchInput';
import { AdminStudioFilterBar } from '../../../../components/admin/studio/AdminStudioFilterBar';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AdminStudioEditableField } from '../../../../components/admin/studio/AdminStudioEditableField';
import { AdminStudioPromptListItem } from '../../../../components/admin/studio/AdminStudioPromptListItem';
import { useAdminStudioPromptLibrary } from '../../../../hooks/useAdminStudioPromptLibraryState';
import {
  ADMIN_STUDIO_PROMPT_CATEGORIES,
} from '../../../../utils/adminStudioPromptLibraryDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

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
      <AdminStudioSectionHeading>MASTER PROMPTS</AdminStudioSectionHeading>

      <AdminStudioSearchInput value={search} onChange={setSearch} placeholder="SEARCH PROMPTS..." />

      <AdminStudioFilterBar
        items={[
          { id: 'all' as const, label: 'ALL' },
          { id: 'favorites' as const, label: `★ FAVS (${favorites.size})` },
          ...ADMIN_STUDIO_PROMPT_CATEGORIES.map((c) => ({ id: c.id, label: c.label })),
        ]}
        activeId={categoryFilter}
        onChange={setCategoryFilter}
      />

      <div className="grid gap-3" style={{ gridTemplateColumns: '1fr' }}>
        <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
          {filteredPrompts.length === 0 ? (
            <p
              className="text-[8px] font-futura uppercase py-4 text-center"
              style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}
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
              background: ADMIN_STUDIO_THEME.panelBg,
              border: `1px solid ${ADMIN_STUDIO_THEME.panelBorder}`,
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
                style={{ fontWeight: 515, color: favorites.has(selectedPrompt.id) ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary }}
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
                    color: ADMIN_STUDIO_THEME.textSecondary,
                    border: `1px solid ${ADMIN_STUDIO_THEME.panelBorder}`,
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

      <AdminStudioDisclaimerFooter>EDITS SAVED LOCALLY · NO AI · FRONTEND ONLY</AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
