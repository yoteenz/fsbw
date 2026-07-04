import type { ProductionScene } from '../../../../utils/adminStudioProductionBuilderDemo';
import type { DirectorGraphicsToggles, DirectorModeSession } from '../../../../utils/adminStudioDirectorModeDemo';
import { getCinemaPreviewSrc, resolveAssetLabel } from '../../../../utils/adminStudioDirectorModeDemo';
import { DM_VISUAL, dmCaptionStyle } from './directorModeTheme';

type DirectorModeCinemaPreviewProps = {
  scene: ProductionScene | undefined;
  session: DirectorModeSession;
  cta: string;
  graphics: DirectorGraphicsToggles;
};

const OVERLAY_SLOTS: Array<{ key: string; label: string; resolve: (s: ProductionScene['selection'], cta: string) => string | null }> = [
  { key: 'studio', label: 'STUDIO', resolve: (s) => resolveAssetLabel(s.studioId) },
  { key: 'talent', label: 'TALENT', resolve: (s) => resolveAssetLabel(s.talentId) },
  { key: 'wardrobe', label: 'WARDROBE', resolve: (s) => resolveAssetLabel(s.wardrobeId) },
  { key: 'camera', label: 'CAMERA', resolve: (s) => resolveAssetLabel(s.cameraId) },
  { key: 'lighting', label: 'LIGHTING', resolve: (s) => resolveAssetLabel(s.lightingId) },
  { key: 'graphics', label: 'GRAPHICS', resolve: (s) => resolveAssetLabel(s.graphicsId) },
  { key: 'props', label: 'PROPS', resolve: (s) => (s.propIds?.length ? s.propIds.map((id) => resolveAssetLabel(id)).join(' · ') : null) },
  { key: 'cta', label: 'CTA', resolve: (_s, cta) => cta || null },
];

export function DirectorModeCinemaPreview({ scene, session, cta, graphics }: DirectorModeCinemaPreviewProps) {
  const selection = scene?.selection ?? {};
  const preview = getCinemaPreviewSrc(selection, session.activeCameraOverride, session.activeLightingOverride);

  return (
    <section className="flex flex-col min-h-0 h-full" style={{ minWidth: 0 }}>
      <div
        className="relative flex-1 overflow-hidden"
        style={{
          border: `1.3px solid ${DM_VISUAL.black}`,
          minHeight: '220px',
          aspectRatio: '16 / 9',
          background: '#0a0a0a',
        }}
      >
        <img
          src={preview.src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
          style={{ filter: preview.filter }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 35%, rgba(255,255,255,0.2) 100%)' }}
        />
        <div
          className="absolute top-3 left-3 px-2 py-1"
          style={{ background: DM_VISUAL.glass, backdropFilter: 'blur(8px)', border: DM_VISUAL.border, fontFamily: '"Futura PT Medium"', fontSize: '8px' }}
        >
          CINEMA PREVIEW · {preview.cameraLabel} · {preview.lightingLabel}
        </div>
        {graphics.lowerThirds ? (
          <div
            className="absolute bottom-12 left-4 right-4 px-3 py-2"
            style={{ background: 'rgba(255,255,255,0.88)', borderLeft: `3px solid ${DM_VISUAL.red}`, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}
          >
            {resolveAssetLabel(selection.talentId)} · LUXURY FORECAST
          </div>
        ) : null}
        {graphics.luxuryTitles ? (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2" style={{ fontFamily: '"Covered By Your Grace"', fontSize: '22px', color: '#FFFFFF', textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
            FRONTAL SLAYER
          </div>
        ) : null}
        {graphics.forecastGraphics ? (
          <div className="absolute right-4 top-1/4 w-24 h-16 opacity-90" style={{ background: 'rgba(255,255,255,0.75)', border: DM_VISUAL.border, fontSize: '7px', padding: '4px', fontFamily: '"Futura PT Medium"' }}>
            FORECAST MAP · PLACEHOLDER
          </div>
        ) : null}
        {graphics.captions ? (
          <div className="absolute bottom-3 left-0 right-0 text-center" style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#FFFFFF', textShadow: '0 1px 4px #000' }}>
            [CAPTIONS ENABLED]
          </div>
        ) : null}
        <div className="absolute bottom-3 right-3 px-2 py-0.5" style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '7px', fontFamily: '"Futura PT Medium"' }}>
          PLACEHOLDER · AI ASSETS REPLACE ON GENERATION
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-1 sm:grid-cols-4">
        {OVERLAY_SLOTS.map((slot) => {
          const val = scene ? slot.resolve(selection, cta) : null;
          if (!val) return null;
          return (
            <div key={slot.key} className="px-2 py-1" style={{ background: DM_VISUAL.glass, border: DM_VISUAL.border }}>
              <p style={{ ...dmCaptionStyle, fontSize: '6px' }}>{slot.label}</p>
              <p style={{ ...dmCaptionStyle, color: DM_VISUAL.black, fontFamily: '"Futura PT Medium"', fontSize: '7px' }}>{val}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
