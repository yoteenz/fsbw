import type { ExperienceLabV2ViewModel } from './experience-lab-v2.types';
import type { StudioViewportMode } from './experience-lab-v2.types';
import type { ElabFocusMode } from './experience-lab-v2-layout';
import { StudioViewport } from './StudioViewport';
import { ExperienceLabFloatingInspector } from './ExperienceLabFloatingInspector';
import { ELAB_V2_COMPOSITION } from './experience-lab-v2-composition';

const VIEWPORT_MODES: StudioViewportMode[] = [
  'BLUEPRINT', 'FOUNDER_RENDER', 'CONSTRUCTION_PLAN', 'MATERIALS', 'LIGHTING', 'CAMERA', 'SPLIT_VIEW',
];

const VIEW_ANGLES = ['Hero L', 'Hero P', 'Desktop', 'Mobile', 'Wide', 'Detail'] as const;

type Props = {
  model: ExperienceLabV2ViewModel;
  viewportMode: StudioViewportMode;
  onModeChange: (mode: StudioViewportMode) => void;
  onImageLoad: () => void;
  isCompact?: boolean;
  onFloatSelect: (side: 'left' | 'right', slot: string, mode: StudioViewportMode, label: string) => void;
  activeFloat: { left: string; right: string };
  onFocusMode?: (mode: StudioViewportMode) => void;
  focusMode?: ElabFocusMode;
};

/** Viewport stage — view angles attached to viewport bottom on compact layouts. */
export function ExperienceLabViewportStage({
  model,
  viewportMode,
  onModeChange,
  onImageLoad,
  isCompact,
  onFloatSelect,
  activeFloat,
  onFocusMode,
}: Props) {
  const a = model.artifacts;

  const floats = isCompact
    ? [
        { label: 'BLUEPRINT', summary: a.blueprint?.summary ?? 'Wireframe', side: 'left' as const, slot: 'blueprint', mode: 'BLUEPRINT' as StudioViewportMode },
        { label: 'BUILD', summary: a.construction?.summary ?? 'Build', side: 'left' as const, slot: 'construction', mode: 'CONSTRUCTION_PLAN' as StudioViewportMode },
        { label: 'MATERIALS', summary: a.materials?.summary ?? '21', side: 'right' as const, slot: 'materials', mode: 'MATERIALS' as StudioViewportMode },
      ]
    : null;

  return (
    <div className="elab-stage" {...{ [ELAB_V2_COMPOSITION.viewportStage]: '' }}>
      <div className="elab-stage__viewport-wrap">
        {isCompact && floats
          ? floats.map((f) => (
              <ExperienceLabFloatingInspector
                key={f.slot}
                label={f.label}
                summary={f.summary}
                side={f.side}
                slot={f.slot}
                active={activeFloat[f.side] === f.slot}
                compact
                onClick={() => onFloatSelect(f.side, f.slot, f.mode, f.label)}
              />
            ))
          : (
            <>
              <ExperienceLabFloatingInspector
                label="BLUEPRINT"
                summary={a.blueprint?.summary ?? 'Wireframe'}
                side="left"
                slot="blueprint"
                active={activeFloat.left === 'blueprint'}
                onClick={() => onFloatSelect('left', 'blueprint', 'BLUEPRINT', 'BLUEPRINT')}
              >
                <div className="elab-float__mini elab-float__mini--blueprint" aria-hidden />
              </ExperienceLabFloatingInspector>
              <ExperienceLabFloatingInspector
                label="CONSTRUCTION"
                summary={a.construction?.summary ?? 'Build order'}
                side="left"
                slot="construction"
                active={activeFloat.left === 'construction'}
                onClick={() => onFloatSelect('left', 'construction', 'CONSTRUCTION_PLAN', 'CONSTRUCTION')}
              >
                <div className="elab-float__mini elab-float__mini--chart" aria-hidden />
              </ExperienceLabFloatingInspector>
              <ExperienceLabFloatingInspector
                label="SCOPE"
                summary="Roles & rules"
                side="left"
                slot="scope"
                active={activeFloat.left === 'scope'}
                onClick={() => onFloatSelect('left', 'scope', 'EMPTY_STATE', 'SCOPE')}
              />
              <ExperienceLabFloatingInspector
                label="MATERIALS"
                summary={a.materials?.summary ?? '21 materials'}
                side="right"
                slot="materials"
                active={activeFloat.right === 'materials'}
                onClick={() => onFloatSelect('right', 'materials', 'MATERIALS', 'MATERIALS')}
              >
                <div className="elab-float__swatches" aria-hidden>
                  {[0, 1, 2, 3].map((i) => <span key={i} className="elab-float__swatch" />)}
                </div>
              </ExperienceLabFloatingInspector>
              <ExperienceLabFloatingInspector
                label="LIGHTING"
                summary={a.lighting?.summary ?? 'Profile'}
                side="right"
                slot="lighting"
                active={activeFloat.right === 'lighting'}
                onClick={() => onFloatSelect('right', 'lighting', 'LIGHTING', 'LIGHTING')}
              />
              <ExperienceLabFloatingInspector
                label="CAMERA"
                summary={a.camera?.summary ?? 'Founder perspective'}
                side="right"
                slot="camera"
                active={activeFloat.right === 'camera'}
                onClick={() => onFloatSelect('right', 'camera', 'CAMERA', 'CAMERA')}
              />
            </>
          )}

        <StudioViewport
          embedded
          mode={viewportMode}
          departmentName={model.departmentName}
          revision={model.revision}
          artifactStatus={model.healthState}
          artifacts={model.artifacts}
          isStale={model.isStale}
          onImageLoad={onImageLoad}
          modes={VIEWPORT_MODES}
          onModeChange={onModeChange}
          onFocusMode={onFocusMode}
        />

        <nav
          className={`elab-view-angles${isCompact ? ' elab-view-angles--attached' : ''}`}
          {...{ [ELAB_V2_COMPOSITION.viewAngles]: '' }}
          aria-label="View angles"
        >
          {!isCompact ? <span className="elab-view-angles__label">VIEW ANGLES</span> : null}
          <div className="elab-view-angles__strip">
            {VIEW_ANGLES.map((angle, i) => (
              <button key={angle} type="button" className={`elab-view-angles__thumb${i === 0 ? ' elab-view-angles__thumb--active' : ''}`}>
                <span className="elab-view-angles__thumb-inner" />
                {!isCompact ? <span className="elab-view-angles__thumb-label">{angle}</span> : null}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
