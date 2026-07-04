import { useState } from 'react';
import type { ProductionDraft, ProductionScene } from '../../../../utils/adminStudioProductionBuilderDemo';
import { getScenePreviewSrc } from '../../../../utils/adminStudioProductionBuilderDemo';
import type { DirectorModeSession } from '../../../../utils/adminStudioDirectorModeDemo';
import { resolveAssetLabel } from '../../../../utils/adminStudioDirectorModeDemo';
import { DM_VISUAL, dmCaptionStyle, dmPanelStyle, dmSectionTitleStyle } from './directorModeTheme';

type DirectorModeTimelineProps = {
  draft: ProductionDraft;
  session: DirectorModeSession;
  activeSceneId?: string;
  onSelectScene: (id: string) => void;
  onReorder: (from: number, to: number) => void;
};

export function DirectorModeTimeline({ draft, session, activeSceneId, onSelectScene, onReorder }: DirectorModeTimelineProps) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const sorted = [...draft.scenes].sort((a, b) => a.order - b.order);

  return (
    <aside className="flex flex-col min-h-0 h-full overflow-hidden" style={{ ...dmPanelStyle, padding: '10px' }}>
      <p style={dmSectionTitleStyle}>PRODUCTION TIMELINE</p>
      <div className="flex-1 overflow-y-auto min-h-0 space-y-1">
        {sorted.map((scene, index) => (
          <TimelineSceneCard
            key={scene.id}
            scene={scene}
            meta={session.sceneMeta[scene.id]}
            active={activeSceneId === scene.id || (!activeSceneId && index === 0)}
            onSelect={() => onSelectScene(scene.id)}
            draggable
            onDragStart={() => setDragIdx(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIdx !== null && dragIdx !== index) onReorder(dragIdx, index);
              setDragIdx(null);
            }}
            showArrow={index < sorted.length - 1}
          />
        ))}
      </div>
    </aside>
  );
}

function TimelineSceneCard({
  scene,
  meta,
  active,
  onSelect,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  showArrow,
}: {
  scene: ProductionScene;
  meta?: DirectorModeSession['sceneMeta'][string];
  active: boolean;
  onSelect: () => void;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: () => void;
  showArrow?: boolean;
}) {
  const thumb = getScenePreviewSrc(scene.selection);
  return (
    <div>
      <button
        type="button"
        draggable={draggable}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={onSelect}
        className="w-full text-left cursor-grab active:cursor-grabbing"
        style={{
          border: active ? `1.3px solid ${DM_VISUAL.red}` : DM_VISUAL.border,
          background: active ? '#FFF8F8' : '#FFFFFF',
          padding: '6px',
        }}
      >
        <div className="flex gap-2">
          <div className="flex-shrink-0 overflow-hidden" style={{ width: '48px', height: '32px', border: DM_VISUAL.border }}>
            <img src={thumb} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p style={{ ...dmCaptionStyle, fontFamily: '"Futura PT Medium"', color: DM_VISUAL.black, fontSize: '8px' }}>
              {scene.name}
            </p>
            <p style={{ ...dmCaptionStyle, fontSize: '7px' }}>{meta?.purpose ?? 'SEGMENT'}</p>
            <p style={{ ...dmCaptionStyle, fontSize: '7px' }}>
              {meta?.estimatedRuntime ?? '0:15'} · {meta?.status?.toUpperCase() ?? 'DRAFT'}
            </p>
            <p style={{ ...dmCaptionStyle, fontSize: '6px' }}>
              {resolveAssetLabel(scene.selection.talentId)} · {resolveAssetLabel(scene.selection.studioId)}
            </p>
            <p style={{ ...dmCaptionStyle, fontSize: '6px' }}>
              {resolveAssetLabel(scene.selection.cameraId)} · {resolveAssetLabel(scene.selection.lightingId)}
            </p>
          </div>
        </div>
      </button>
      {showArrow ? (
        <p style={{ ...dmCaptionStyle, textAlign: 'center', margin: '2px 0', color: DM_VISUAL.red, fontSize: '10px' }}>↓</p>
      ) : null}
    </div>
  );
}
