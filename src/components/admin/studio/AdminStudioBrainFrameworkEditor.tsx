import { useState } from 'react';
import { AdminStudioEditableField } from './AdminStudioEditableField';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';
import type { PromptFrameworkEntry } from '../../../utils/adminStudioContentBrainPromptFrameworksDemo';

type AdminStudioBrainFrameworkEditorProps = {
  entry: PromptFrameworkEntry;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onUpdateField: (key: 'title' | 'description' | 'body', value: string) => void;
  onSaveVersion: (note: string) => void;
  onRestoreVersion: (versionId: string) => void;
};

export function AdminStudioBrainFrameworkEditor({
  entry,
  isFavorite,
  onToggleFavorite,
  onUpdateField,
  onSaveVersion,
  onRestoreVersion,
}: AdminStudioBrainFrameworkEditorProps) {
  const [versionNote, setVersionNote] = useState('');

  return (
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
            color: ADMIN_STUDIO_THEME.accent,
          }}
        >
          FRAMEWORK EDITOR
        </p>
        <button
          type="button"
          onClick={onToggleFavorite}
          className="text-[8px] font-futura uppercase flex-shrink-0"
          style={{
            fontWeight: 515,
            color: isFavorite ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textSecondary,
          }}
        >
          {isFavorite ? '★ FAVORITED' : '☆ FAVORITE'}
        </button>
      </div>

      <div className="flex flex-wrap gap-1">
        <span
          className="text-[6px] font-futura uppercase px-1.5 py-0.5"
          style={{
            fontWeight: 515,
            color: ADMIN_STUDIO_THEME.accent,
            border: `1px solid ${ADMIN_STUDIO_THEME.panelBorder}`,
          }}
        >
          {entry.category}
        </span>
        {entry.tags.map((tag) => (
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
        value={entry.title}
        onChange={(v) => onUpdateField('title', v)}
      />
      <AdminStudioEditableField
        label="DESCRIPTION"
        value={entry.description}
        onChange={(v) => onUpdateField('description', v)}
        multiline
      />
      <AdminStudioEditableField
        label="PROMPT BODY"
        value={entry.body}
        onChange={(v) => onUpdateField('body', v)}
        multiline
      />

      <div
        className="p-2 border-t"
        style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
      >
        <p
          className="text-[8px] font-futura uppercase mb-2"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}
        >
          VERSION HISTORY ({entry.versions.length})
        </p>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={versionNote}
            onChange={(e) => setVersionNote(e.target.value)}
            placeholder="VERSION NOTE..."
            className="flex-1 bg-white border text-black text-[8px] font-futura uppercase px-2 py-1 outline-none"
            style={{ fontWeight: 515, borderColor: ADMIN_STUDIO_THEME.inputBorder }}
          />
          <button
            type="button"
            onClick={() => {
              onSaveVersion(versionNote);
              setVersionNote('');
            }}
            className="text-[7px] font-futura uppercase px-2 py-1 border bg-white"
            style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
          >
            SAVE VERSION
          </button>
        </div>
        <div className="space-y-1 max-h-[80px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {[...entry.versions].reverse().map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => onRestoreVersion(v.id)}
              className="w-full text-left px-2 py-1 border text-[7px] font-futura uppercase"
              style={{
                fontWeight: 515,
                color: ADMIN_STUDIO_THEME.textSecondary,
                borderColor: ADMIN_STUDIO_THEME.panelBorder,
                background: 'rgba(255,255,255,0.6)',
              }}
            >
              {v.id.toUpperCase()} · {v.note} · {new Date(v.savedAt).toLocaleDateString()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
