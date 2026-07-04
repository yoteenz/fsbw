import { useState } from 'react';
import type { ContentPackAssetPickerCategory } from '../../../utils/adminStudioAssetDirectorDemo';
import {
  CONTENT_PACK_ASSET_PICKER_CATEGORIES,
  getPickerOptionsForCategory,
} from '../../../utils/adminStudioAssetDirectorDemo';
import { useAdminStudioContentPackAssets } from '../../../hooks/useAdminStudioAssetDirectorState';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioContentPackAssetPickerProps = {
  packId: string;
  accentHex?: string;
};

/** Visual asset picker for Content Packs — assembles prompts from approved assets. */
export function AdminStudioContentPackAssetPicker({ packId, accentHex = '#EB1C24' }: AdminStudioContentPackAssetPickerProps) {
  const [activeCategory, setActiveCategory] = useState<ContentPackAssetPickerCategory>('studio');
  const { selection, assembledPrompt, updateSelection, toggleMaterialId, togglePropId, clearSelection } =
    useAdminStudioContentPackAssets(packId);

  const options = getPickerOptionsForCategory(activeCategory);

  const isSelected = (category: ContentPackAssetPickerCategory, id: string): boolean => {
    switch (category) {
      case 'studio':
        return selection.studioId === id;
      case 'talent':
        return selection.talentId === id;
      case 'wardrobe':
        return selection.wardrobeId === id;
      case 'pose':
        return selection.poseId === id;
      case 'expression':
        return selection.expressionId === id;
      case 'camera':
        return selection.cameraId === id;
      case 'lighting':
        return selection.lightingId === id;
      case 'materials':
        return selection.materialIds?.includes(id) ?? false;
      case 'props':
        return selection.propIds?.includes(id) ?? false;
      case 'music':
        return selection.musicId === id;
      case 'animation':
        return selection.animationId === id;
      default:
        return false;
    }
  };

  const handleSelect = (category: ContentPackAssetPickerCategory, id: string) => {
    switch (category) {
      case 'studio':
        updateSelection({ studioId: selection.studioId === id ? undefined : id });
        break;
      case 'talent':
        updateSelection({ talentId: selection.talentId === id ? undefined : id });
        break;
      case 'wardrobe':
        updateSelection({ wardrobeId: selection.wardrobeId === id ? undefined : id });
        break;
      case 'pose':
        updateSelection({ poseId: selection.poseId === id ? undefined : id });
        break;
      case 'expression':
        updateSelection({ expressionId: selection.expressionId === id ? undefined : id });
        break;
      case 'camera':
        updateSelection({ cameraId: selection.cameraId === id ? undefined : id });
        break;
      case 'lighting':
        updateSelection({ lightingId: selection.lightingId === id ? undefined : id });
        break;
      case 'materials':
        toggleMaterialId(id);
        break;
      case 'props':
        togglePropId(id);
        break;
      case 'music':
        updateSelection({ musicId: selection.musicId === id ? undefined : id });
        break;
      case 'animation':
        updateSelection({ animationId: selection.animationId === id ? undefined : id });
        break;
      default:
        break;
    }
  };

  return (
    <div
      className="p-3 border"
      style={{ background: ADMIN_STUDIO_THEME.panelBg, borderColor: ADMIN_STUDIO_THEME.panelBorder, borderTop: `2px solid ${accentHex}` }}
    >
      <p className="text-[7px] font-futura uppercase mb-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
        VISUAL ASSET PICKER
      </p>
      <p className="text-[5px] font-futura uppercase mb-3" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        ASSET DIRECTOR · APPROVED ASSETS ONLY · DEMO PROMPT ASSEMBLY
      </p>

      <div className="flex flex-wrap gap-1 mb-3">
        {CONTENT_PACK_ASSET_PICKER_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className="px-2 py-1 text-[5px] font-futura uppercase border"
            style={{
              fontWeight: 515,
              color: activeCategory === cat.id ? '#FFF' : ADMIN_STUDIO_THEME.textSecondary,
              background: activeCategory === cat.id ? accentHex : 'rgba(255,255,255,0.8)',
              borderColor: ADMIN_STUDIO_THEME.panelBorder,
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-1.5 mb-3 max-h-40 overflow-y-auto">
        {options.map((opt) => {
          const selected = isSelected(activeCategory, opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(activeCategory, opt.id)}
              className="relative overflow-hidden border text-left"
              style={{
                aspectRatio: '1 / 1',
                borderColor: selected ? accentHex : ADMIN_STUDIO_THEME.panelBorder,
                borderWidth: selected ? '2px' : '1px',
                opacity: selected ? 1 : 0.85,
              }}
            >
              <img src={opt.previewSrc} alt="" className="w-full h-full object-cover" />
              <div
                className="absolute bottom-0 left-0 right-0 px-0.5 py-0.5"
                style={{ background: 'rgba(255,255,255,0.92)' }}
              >
                <p className="text-[4px] font-futura uppercase line-clamp-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
                  {opt.name}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="p-2 border mb-2" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.7)' }}>
        <p className="text-[5px] font-futura uppercase mb-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          ASSEMBLED PROMPT PREVIEW
        </p>
        <pre
          className="text-[5px] font-futura uppercase whitespace-pre-wrap"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, lineHeight: 1.5 }}
        >
          {assembledPrompt || 'SELECT APPROVED VISUAL ASSETS TO BUILD PROMPT'}
        </pre>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={clearSelection}
          className="flex-1 py-1.5 text-[5px] font-futura uppercase border"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, borderColor: ADMIN_STUDIO_THEME.panelBorder }}
        >
          CLEAR SELECTION
        </button>
        <button
          type="button"
          onClick={() => window.open('/admin/studio/asset-director', '_self')}
          className="flex-1 py-1.5 text-[5px] font-futura uppercase border"
          style={{ fontWeight: 515, color: accentHex, borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.8)' }}
        >
          OPEN ASSET DIRECTOR
        </button>
      </div>
    </div>
  );
}
