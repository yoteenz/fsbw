import { useState } from 'react';
import type { ProductionDraft, ProductionScene } from '../../../../utils/adminStudioProductionBuilderDemo';
import {
  getScenePreviewSrc,
  PRODUCTION_LAYER_FORMULA,
  resolveSceneStackLabel,
  SCENE_STACK_SLOTS,
} from '../../../../utils/adminStudioProductionBuilderDemo';
import { PB_VISUAL, pbActionBtnStyle, pbCaptionStyle, pbPanelStyle, pbSectionTitleStyle } from './productionBuilderTheme';

type ProductionBuilderSceneCanvasProps = {
  draft: ProductionDraft;
  activeScene: ProductionScene | undefined;
  scenes: ProductionScene[];
  onSelectScene: (sceneId: string) => void;
  onAddScene: () => void;
  onRemoveScene: (sceneId: string) => void;
  onReorderScenes: (from: number, to: number) => void;
  onAssetDrop: (category: string, assetId: string) => void;
};

export function ProductionBuilderSceneCanvas({
  draft,
  activeScene,
  scenes,
  onSelectScene,
  onAddScene,
  onRemoveScene,
  onReorderScenes,
  onAssetDrop,
}: ProductionBuilderSceneCanvasProps) {
  const [dragSceneIndex, setDragSceneIndex] = useState<number | null>(null);

  const sorted = [...scenes].sort((a, b) => a.order - b.order);
  const selection = activeScene?.selection ?? {};
  const previewSrc = getScenePreviewSrc(selection);
  const stack = SCENE_STACK_SLOTS.map((slot) => ({
    label: slot.label,
    value: resolveSceneStackLabel(slot.key, selection, draft.cta),
  })).filter((row) => row.value);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/x-pb-asset');
    if (!raw) return;
    try {
      const { category, assetId } = JSON.parse(raw) as { category: string; assetId: string };
      onAssetDrop(category, assetId);
    } catch {
      /* ignore */
    }
  };

  return (
    <main className="flex flex-col min-h-0 h-full gap-3" style={{ minWidth: 0 }}>
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {sorted.map((scene, index) => (
          <div
            key={scene.id}
            draggable
            onDragStart={() => setDragSceneIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragSceneIndex !== null && dragSceneIndex !== index) {
                onReorderScenes(dragSceneIndex, index);
              }
              setDragSceneIndex(null);
            }}
            className="flex items-center gap-1 flex-shrink-0"
          >
            <button
              type="button"
              onClick={() => onSelectScene(scene.id)}
              style={{
                ...pbActionBtnStyle,
                borderColor: activeScene?.id === scene.id ? PB_VISUAL.red : '#000',
                background: activeScene?.id === scene.id ? '#FFF5F5' : '#FFFFFF',
              }}
            >
              {scene.name}
            </button>
            {sorted.length > 1 ? (
              <button
                type="button"
                onClick={() => onRemoveScene(scene.id)}
                style={{ ...pbCaptionStyle, color: PB_VISUAL.gray, border: 'none', background: 'none', cursor: 'pointer', fontSize: '10px' }}
                aria-label={`Remove ${scene.name}`}
              >
                ×
              </button>
            ) : null}
          </div>
        ))}
        <button type="button" onClick={onAddScene} style={pbActionBtnStyle}>
          + SCENE
        </button>
      </div>

      <div
        className="flex-1 min-h-0 flex flex-col"
        style={{ ...pbPanelStyle, padding: '12px' }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <p style={pbSectionTitleStyle}>SCENE BUILDER</p>
        <p style={{ ...pbCaptionStyle, marginBottom: '6px' }}>CREATIVE STORYBOARD · DROP ASSETS TO ASSEMBLE</p>
        <p style={{ ...pbCaptionStyle, marginBottom: '10px', fontSize: '7px', color: PB_VISUAL.red }}>{PRODUCTION_LAYER_FORMULA}</p>

        <div
          className="relative w-full overflow-hidden mb-4 flex-shrink-0"
          style={{ aspectRatio: '16 / 9', border: `1.3px solid ${PB_VISUAL.black}`, minHeight: '160px' }}
        >
          <img src={previewSrc} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(255,255,255,0.55) 100%)' }}
          />
          <div
            className="absolute top-2 left-2 px-2 py-1"
            style={{ background: PB_VISUAL.glass, border: PB_VISUAL.border, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}
          >
            LIVE PREVIEW · {activeScene?.name ?? 'SCENE'}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-1">
          {stack.length === 0 ? (
            <p style={pbCaptionStyle}>DROP STUDIOS, TALENT, WARDROBE, AND MORE FROM THE ASSET LIBRARY</p>
          ) : (
            stack.map((row, i) => (
              <div key={row.label} className="flex items-center gap-2 py-1" style={{ borderBottom: PB_VISUAL.divider }}>
                <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '8px', color: PB_VISUAL.red, width: '72px', flexShrink: 0 }}>
                  {row.label}
                </span>
                <span style={{ fontFamily: '"Covered By Your Grace"', fontSize: '12px', color: PB_VISUAL.black, textTransform: 'uppercase' }}>
                  {i > 0 ? '↓ ' : ''}
                  {row.value}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
