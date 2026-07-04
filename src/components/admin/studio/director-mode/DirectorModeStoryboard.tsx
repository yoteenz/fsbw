import type { ProductionScene } from '../../../../utils/adminStudioProductionBuilderDemo';
import type { DirectorSceneMeta } from '../../../../utils/adminStudioDirectorModeDemo';
import { getScenePreviewSrc } from '../../../../utils/adminStudioProductionBuilderDemo';
import { resolveAssetLabel } from '../../../../utils/adminStudioDirectorModeDemo';
import { DM_VISUAL, dmCaptionStyle, dmPanelStyle, dmScriptStyle, dmSectionTitleStyle } from './directorModeTheme';

type DirectorModeStoryboardProps = {
  scenes: ProductionScene[];
  sceneMeta: Record<string, DirectorSceneMeta>;
  activeSceneId?: string;
  cta: string;
  onSelectScene: (id: string) => void;
};

export function DirectorModeStoryboard({ scenes, sceneMeta, activeSceneId, cta, onSelectScene }: DirectorModeStoryboardProps) {
  const sorted = [...scenes].sort((a, b) => a.order - b.order);

  return (
    <section className="mb-3" style={{ ...dmPanelStyle, padding: '10px' }}>
      <p style={dmSectionTitleStyle}>LIVE STORYBOARD</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {sorted.map((scene) => {
          const meta = sceneMeta[scene.id];
          const active = scene.id === activeSceneId;
          return (
            <button
              key={scene.id}
              type="button"
              onClick={() => onSelectScene(scene.id)}
              className="flex-shrink-0 text-left"
              style={{
                width: '140px',
                border: active ? `1.3px solid ${DM_VISUAL.red}` : DM_VISUAL.border,
                background: '#fff',
                padding: '6px',
                cursor: 'pointer',
              }}
            >
              <img src={getScenePreviewSrc(scene.selection)} alt="" style={{ width: '100%', height: '72px', objectFit: 'cover', marginBottom: '4px' }} />
              <p style={{ ...dmCaptionStyle, fontFamily: '"Futura PT Medium"', color: DM_VISUAL.black, fontSize: '7px' }}>{scene.name}</p>
              <p style={{ ...dmScriptStyle, fontSize: '7px', maxHeight: '48px', overflow: 'hidden' }}>{meta?.script?.slice(0, 80)}…</p>
              <p style={{ ...dmCaptionStyle, fontSize: '6px' }}>{meta?.estimatedRuntime} · {meta?.purpose}</p>
              <p style={{ ...dmCaptionStyle, fontSize: '6px' }}>{resolveAssetLabel(scene.selection.cameraId)} · {resolveAssetLabel(scene.selection.lightingId)}</p>
              <p style={{ ...dmCaptionStyle, fontSize: '6px' }}>CTA: {cta}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

type DirectorModeScriptPanelProps = {
  sceneName: string;
  meta?: DirectorSceneMeta;
  onUpdate: (patch: Partial<DirectorSceneMeta>) => void;
};

export function DirectorModeScriptPanel({ sceneName, meta, onUpdate }: DirectorModeScriptPanelProps) {
  if (!meta) return null;
  return (
    <section className="mb-3 grid gap-3 md:grid-cols-2" style={{ ...dmPanelStyle, padding: '10px' }}>
      <div>
        <p style={dmSectionTitleStyle}>SCRIPT PANEL</p>
        <p style={{ ...dmCaptionStyle, marginBottom: '4px' }}>{sceneName}</p>
        <textarea
          value={meta.script}
          onChange={(e) => onUpdate({ script: e.target.value })}
          className="w-full border p-2 min-h-[100px]"
          style={{ ...dmScriptStyle, borderWidth: '1.3px' }}
        />
      </div>
      <div>
        <p style={dmSectionTitleStyle}>SCENE NOTES</p>
        <textarea
          value={meta.sceneNotes}
          onChange={(e) => onUpdate({ sceneNotes: e.target.value })}
          className="w-full border p-2 mb-2"
          style={{ fontSize: '8px', borderWidth: '1.3px', minHeight: '48px' }}
        />
        <p style={dmSectionTitleStyle}>VOICE NOTES</p>
        <textarea
          value={meta.voiceNotes}
          onChange={(e) => onUpdate({ voiceNotes: e.target.value })}
          className="w-full border p-2 mb-2"
          style={{ fontSize: '8px', borderWidth: '1.3px', minHeight: '48px' }}
        />
        <p style={dmSectionTitleStyle}>TIMING</p>
        <p style={dmCaptionStyle}>{meta.estimatedRuntime} · {meta.durationSec}s</p>
      </div>
    </section>
  );
}

type DirectorModeShotListProps = {
  meta?: DirectorSceneMeta;
};

export function DirectorModeShotList({ meta }: DirectorModeShotListProps) {
  if (!meta?.shots?.length) return null;
  return (
    <section className="mb-3" style={{ ...dmPanelStyle, padding: '10px' }}>
      <p style={dmSectionTitleStyle}>SHOT LIST</p>
      <div className="flex flex-wrap items-center gap-2">
        {meta.shots.map((shot, i) => (
          <div key={shot.id} className="flex items-center gap-2">
            {i > 0 ? <span style={{ color: DM_VISUAL.red, fontSize: '10px' }}>↓</span> : null}
            <span
              style={{
                ...dmCaptionStyle,
                fontFamily: '"Futura PT Medium"',
                color: DM_VISUAL.black,
                border: DM_VISUAL.border,
                padding: '4px 8px',
                background: '#fff',
              }}
            >
              {shot.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
