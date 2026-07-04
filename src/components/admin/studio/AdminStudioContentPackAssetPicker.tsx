import { useState } from 'react';
import { AdminHubTabBar } from '../AdminHubTabBar';
import type { ContentPackAssetPickerCategory } from '../../../utils/adminStudioAssetDirectorDemo';
import {
  CONTENT_PACK_ASSET_PICKER_CATEGORIES,
  getPickerOptionsForCategory,
} from '../../../utils/adminStudioAssetDirectorDemo';
import { useAdminStudioContentPackAssets } from '../../../hooks/useAdminStudioAssetDirectorState';
import { adActionBtnStyle, adCaptionStyle, AD_VISUAL } from './asset-director/assetDirectorVisualTheme';

type AdminStudioContentPackAssetPickerProps = {
  packId: string;
  accentHex?: string;
};

/** Visual-first asset picker — select studio, talent, wardrobe, etc. before typing prompts. */
export function AdminStudioContentPackAssetPicker({ packId, accentHex = '#EB1C24' }: AdminStudioContentPackAssetPickerProps) {
  const [activeCategory, setActiveCategory] = useState<ContentPackAssetPickerCategory>('studio');
  const { selection, assembledPrompt, updateSelection, toggleMaterialId, togglePropId, clearSelection } =
    useAdminStudioContentPackAssets(packId);

  const options = getPickerOptionsForCategory(activeCategory);
  const tabs = CONTENT_PACK_ASSET_PICKER_CATEGORIES.map((c) => ({ id: c.id, label: c.label }));

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
    <div className="border border-black p-3" style={{ borderWidth: '1.3px', borderTop: `2px solid ${accentHex}` }}>
      <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: AD_VISUAL.black }}>VISUAL ASSET PICKER</p>
      <p style={{ ...adCaptionStyle, marginBottom: '10px' }}>CHOOSE APPROVED ASSETS VISUALLY — PROMPT BUILDS AUTOMATICALLY</p>

      <AdminHubTabBar tabs={tabs} activeTab={activeCategory} onTabChange={setActiveCategory} fontSize="10px" />

      <div className="grid grid-cols-3 gap-2 mb-3 max-h-56 overflow-y-auto mt-2">
        {options.map((opt) => {
          const selected = isSelected(activeCategory, opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(activeCategory, opt.id)}
              className="relative overflow-hidden border text-left bg-white"
              style={{
                aspectRatio: activeCategory === 'studio' ? '16 / 9' : '3 / 4',
                borderColor: selected ? accentHex : '#e5e7eb',
                borderWidth: selected ? '2px' : '1px',
              }}
            >
              <img src={opt.previewSrc} alt="" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 px-1 py-1" style={{ background: 'rgba(255,255,255,0.92)' }}>
                <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '8px', color: selected ? accentHex : AD_VISUAL.black }}>{opt.name}</p>
              </div>
              {selected ? (
                <span className="absolute top-1 right-1 px-1 text-[8px] text-white" style={{ background: accentHex }}>✓</span>
              ) : null}
            </button>
          );
        })}
      </div>

      <details className="border border-black mb-2" style={{ borderWidth: '1px' }}>
        <summary style={{ ...adCaptionStyle, padding: '8px', cursor: 'pointer', fontSize: '9px' }}>ASSEMBLED PROMPT — COLLAPSED</summary>
        <pre className="p-2 whitespace-pre-wrap" style={{ ...adCaptionStyle, fontSize: '8px', borderTop: AD_VISUAL.divider }}>
          {assembledPrompt || 'SELECT VISUAL ASSETS ABOVE'}
        </pre>
      </details>

      <div className="flex gap-2">
        <button type="button" onClick={clearSelection} className="flex-1" style={adActionBtnStyle}>
          CLEAR
        </button>
        <button
          type="button"
          onClick={() => window.open('/admin/studio/asset-director', '_self')}
          className="flex-1"
          style={{ ...adActionBtnStyle, color: accentHex }}
        >
          OPEN ASSET DIRECTOR
        </button>
      </div>
    </div>
  );
}
