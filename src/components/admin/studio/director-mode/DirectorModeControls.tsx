import type { ProductionScene } from '../../../../utils/adminStudioProductionBuilderDemo';
import type { DirectorGraphicsToggles, DirectorModeSession, DirectorSceneMeta, DirectorVoiceSettings } from '../../../../utils/adminStudioDirectorModeDemo';
import {
  DIRECTOR_CAMERA_PRESETS,
  DIRECTOR_LIGHTING_PRESETS,
  DIRECTOR_MUSIC_TRACKS,
  resolveAssetLabel,
} from '../../../../utils/adminStudioDirectorModeDemo';
import { DIRECTOR_LAYER_TOGGLE_SLOTS, type DirectorLayerToggles } from '../../../../utils/adminStudioSetSeparation';
import { getProductionAssetLibrary } from '../../../../utils/adminStudioProductionBuilderDemo';
import { DM_VISUAL, dmActionBtnStyle, dmCaptionStyle, dmPanelStyle, dmSectionTitleStyle } from './directorModeTheme';

type DirectorModeControlsProps = {
  scene: ProductionScene | undefined;
  meta?: DirectorSceneMeta;
  session: DirectorModeSession;
  voice: DirectorVoiceSettings;
  graphics: DirectorGraphicsToggles;
  layerToggles: DirectorLayerToggles;
  onSwapAsset: (category: string, assetId: string) => void;
  onCamera: (id: string) => void;
  onLighting: (id: string) => void;
  onMusic: (id: string) => void;
  onToggleGraphics: (key: keyof DirectorGraphicsToggles) => void;
  onToggleLayer: (key: string) => void;
  onVoiceChange: (patch: Partial<DirectorVoiceSettings>) => void;
  onDirectorNotes: (notes: string) => void;
};

const SWAP_CATEGORIES = [
  { cat: 'studios', field: 'studioId' as const, label: 'STUDIO' },
  { cat: 'talent', field: 'talentId' as const, label: 'TALENT' },
  { cat: 'wardrobe', field: 'wardrobeId' as const, label: 'WARDROBE' },
  { cat: 'expressions', field: 'expressionId' as const, label: 'EXPRESSION' },
  { cat: 'poses', field: 'poseId' as const, label: 'POSE' },
  { cat: 'lighting', field: 'lightingId' as const, label: 'LIGHTING' },
  { cat: 'camera', field: 'cameraId' as const, label: 'CAMERA' },
  { cat: 'audio', field: 'musicId' as const, label: 'MUSIC' },
  { cat: 'brand', field: 'graphicsId' as const, label: 'GRAPHICS' },
];

export function DirectorModeControls({
  scene,
  meta,
  session,
  voice,
  graphics,
  layerToggles,
  onSwapAsset,
  onCamera,
  onLighting,
  onMusic,
  onToggleGraphics,
  onToggleLayer,
  onVoiceChange,
  onDirectorNotes,
}: DirectorModeControlsProps) {
  const lib = getProductionAssetLibrary();
  const selection = scene?.selection ?? {};
  const talentThumb = selection.talentId ? lib.talent.find((t) => t.id === selection.talentId) : undefined;

  return (
    <aside className="flex flex-col min-h-0 h-full overflow-y-auto" style={{ ...dmPanelStyle, padding: '10px' }}>
      <p style={dmSectionTitleStyle}>DIRECTOR CONTROLS</p>

      <ControlSection title="LAYER TOGGLES · SET VS EPISODE">
        <p style={{ ...dmCaptionStyle, fontSize: '7px', marginBottom: '6px' }}>
          TOGGLE LAYERS TO SEE WHAT BELONGS TO THE SET VS THE EPISODE
        </p>
        <div className="flex flex-wrap gap-1">
          {DIRECTOR_LAYER_TOGGLE_SLOTS.map((slot) => (
            <button
              key={slot.key}
              type="button"
              onClick={() => onToggleLayer(slot.key)}
              style={{
                ...dmActionBtnStyle,
                fontSize: '7px',
                padding: '3px 6px',
                borderColor: layerToggles[slot.key] ? DM_VISUAL.red : DM_VISUAL.border,
                background: layerToggles[slot.key] ? '#FFF5F5' : '#fff',
              }}
            >
              {layerToggles[slot.key] ? '● ' : '○ '}
              {slot.label}
            </button>
          ))}
        </div>
      </ControlSection>

      <ControlSection title="CURRENT SELECTION">
        {SWAP_CATEGORIES.map(({ cat, field, label }) => {
          const assets = lib[cat as keyof typeof lib]?.slice(0, 4) ?? [];
          return (
            <div key={cat} className="mb-2">
              <p style={{ ...dmCaptionStyle, fontSize: '7px', marginBottom: '2px' }}>
                {label}: {resolveAssetLabel(selection[field] as string | undefined)}
              </p>
              <div className="flex gap-1 overflow-x-auto">
                {assets.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => onSwapAsset(cat, a.id)}
                    className="flex-shrink-0 overflow-hidden"
                    style={{
                      width: '36px',
                      height: '28px',
                      border: selection[field] === a.id ? `1.3px solid ${DM_VISUAL.red}` : DM_VISUAL.border,
                      padding: 0,
                      cursor: 'pointer',
                    }}
                  >
                    <img src={a.previewSrc} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </ControlSection>

      <ControlSection title="TALENT PERFORMANCE">
        {talentThumb ? (
          <div className="flex gap-2 mb-2">
            <img src={talentThumb.previewSrc} alt="" style={{ width: '48px', height: '64px', objectFit: 'cover', border: DM_VISUAL.border }} />
            <div>
              <p style={{ ...dmCaptionStyle, fontFamily: '"Futura PT Medium"', color: DM_VISUAL.black }}>{talentThumb.name}</p>
              <p style={dmCaptionStyle}>WARDROBE: {resolveAssetLabel(selection.wardrobeId)}</p>
              <p style={dmCaptionStyle}>EXPRESSION: {resolveAssetLabel(selection.expressionId)}</p>
              <p style={dmCaptionStyle}>POSE: {resolveAssetLabel(selection.poseId)}</p>
              <button type="button" style={{ ...dmActionBtnStyle, fontSize: '7px', marginTop: '4px' }} onClick={() => onSwapAsset('talent', lib.talent[1]?.id ?? '')}>
                REPLACE TALENT
              </button>
            </div>
          </div>
        ) : (
          <p style={dmCaptionStyle}>SELECT TALENT IN TIMELINE</p>
        )}
      </ControlSection>

      <ControlSection title="CAMERA SIMULATION">
        <div className="flex flex-wrap gap-1">
          {DIRECTOR_CAMERA_PRESETS.map((cam) => (
            <button
              key={cam.id}
              type="button"
              onClick={() => onCamera(cam.id)}
              style={{
                ...dmActionBtnStyle,
                fontSize: '7px',
                borderColor: (session.activeCameraOverride ?? selection.cameraId) === cam.id ? DM_VISUAL.red : '#000',
                background: (session.activeCameraOverride ?? selection.cameraId) === cam.id ? '#FFF5F5' : '#fff',
              }}
            >
              {cam.label}
            </button>
          ))}
        </div>
      </ControlSection>

      <ControlSection title="LIGHTING SIMULATION">
        <div className="flex flex-wrap gap-1">
          {DIRECTOR_LIGHTING_PRESETS.map((lit) => (
            <button
              key={lit.id}
              type="button"
              onClick={() => onLighting(lit.id)}
              style={{
                ...dmActionBtnStyle,
                fontSize: '7px',
                borderColor: (session.activeLightingOverride ?? selection.lightingId) === lit.id ? DM_VISUAL.red : '#000',
              }}
            >
              {lit.label}
            </button>
          ))}
        </div>
      </ControlSection>

      <ControlSection title="VOICE PREVIEW">
        {(['tone', 'energy', 'speed', 'pause', 'emotion'] as const).map((key) => (
          <div key={key} className="mb-1">
            <p style={{ ...dmCaptionStyle, fontSize: '6px' }}>{key.toUpperCase()}</p>
            <input
              value={voice[key]}
              onChange={(e) => onVoiceChange({ [key]: e.target.value })}
              className="w-full border px-1 py-0.5"
              style={{ fontSize: '8px', borderWidth: '1px' }}
            />
          </div>
        ))}
        <button type="button" style={{ ...dmActionBtnStyle, fontSize: '7px', opacity: 0.5 }} disabled>
          PLAY SAMPLE · AI NOT CONNECTED
        </button>
      </ControlSection>

      <ControlSection title="MUSIC">
        <div className="grid grid-cols-2 gap-1">
          {DIRECTOR_MUSIC_TRACKS.map((track) => (
            <button
              key={track.id}
              type="button"
              onClick={() => onMusic(track.id)}
              className="text-left overflow-hidden"
              style={{
                border: (session.activeMusicId ?? selection.musicId) === track.id ? `1.3px solid ${DM_VISUAL.red}` : DM_VISUAL.border,
                padding: '4px',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              <img src={track.previewSrc} alt="" style={{ width: '100%', height: '28px', objectFit: 'cover' }} />
              <p style={{ ...dmCaptionStyle, fontSize: '6px' }}>{track.name}</p>
            </button>
          ))}
        </div>
      </ControlSection>

      <ControlSection title="GRAPHICS">
        {(Object.keys(graphics) as Array<keyof DirectorGraphicsToggles>).map((key) => (
          <label key={key} className="flex items-center gap-2 py-0.5 cursor-pointer">
            <input type="checkbox" checked={graphics[key]} onChange={() => onToggleGraphics(key)} />
            <span style={{ ...dmCaptionStyle, fontSize: '7px' }}>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</span>
          </label>
        ))}
      </ControlSection>

      {meta ? (
        <ControlSection title="DIRECTOR NOTES">
          <textarea
            value={meta.directorNotes}
            onChange={(e) => onDirectorNotes(e.target.value)}
            placeholder="Need stronger CTA. More luxury lighting."
            className="w-full border p-1 min-h-[48px]"
            style={{ fontSize: '8px' }}
          />
        </ControlSection>
      ) : null}
    </aside>
  );
}

function ControlSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 pb-2" style={{ borderBottom: DM_VISUAL.divider }}>
      <p style={{ ...dmSectionTitleStyle, fontSize: '8px', marginBottom: '4px' }}>{title}</p>
      {children}
    </div>
  );
}
