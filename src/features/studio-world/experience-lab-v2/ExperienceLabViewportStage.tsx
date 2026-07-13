import type { ExperienceLabV2ViewModel } from './experience-lab-v2.types';
import type { StudioViewportMode } from './experience-lab-v2.types';
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
  isMobile: boolean;
  onFloatSelect: (side: 'left' | 'right', slot: string, mode: StudioViewportMode) => void;
  activeFloat: { left: string; right: string };
};

/** Viewport stage with floating mounted inspectors and view angles rail. */
export function ExperienceLabViewportStage({
  model,
  viewportMode,
  onModeChange,
  onImageLoad,
  isMobile,
  onFloatSelect,
  activeFloat,
}: Props) {
  const a = model.artifacts;

  return (
    <div className="elab-stage" {...{ [ELAB_V2_COMPOSITION.viewportStage]: '' }}>
      <div className="elab-stage__viewport-wrap">
        <ExperienceLabFloatingInspector
          label="BLUEPRINT"
          summary={a.blueprint?.summary ?? 'Wireframe'}
          side="left"
          slot="blueprint"
          active={activeFloat.left === 'blueprint'}
          compact={isMobile}
          onClick={() => onFloatSelect('left', 'blueprint', 'BLUEPRINT')}
        >
          <div className="elab-float__mini elab-float__mini--blueprint" aria-hidden />
        </ExperienceLabFloatingInspector>
        <ExperienceLabFloatingInspector
          label="CONSTRUCTION"
          summary={a.construction?.summary ?? 'Build order'}
          side="left"
          slot="construction"
          active={activeFloat.left === 'construction'}
          compact={isMobile}
          onClick={() => onFloatSelect('left', 'construction', 'CONSTRUCTION_PLAN')}
        >
          <div className="elab-float__mini elab-float__mini--chart" aria-hidden />
        </ExperienceLabFloatingInspector>
        {!isMobile ? (
          <ExperienceLabFloatingInspector
            label="SCOPE"
            summary="Roles & rules"
            side="left"
            slot="scope"
            active={activeFloat.left === 'scope'}
            onClick={() => onFloatSelect('left', 'scope', 'EMPTY_STATE')}
          />
        ) : null}

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
        />

        <ExperienceLabFloatingInspector
          label="MATERIALS"
          summary={a.materials?.summary ?? '21 materials'}
          side="right"
          slot="materials"
          active={activeFloat.right === 'materials'}
          compact={isMobile}
          onClick={() => onFloatSelect('right', 'materials', 'MATERIALS')}
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
          compact={isMobile}
          onClick={() => onFloatSelect('right', 'lighting', 'LIGHTING')}
        />
        <ExperienceLabFloatingInspector
          label="CAMERA"
          summary={a.camera?.summary ?? 'Founder perspective'}
          side="right"
          slot="camera"
          active={activeFloat.right === 'camera'}
          compact={isMobile}
          onClick={() => onFloatSelect('right', 'camera', 'CAMERA')}
        />
      </div>

      <nav className="elab-view-angles" {...{ [ELAB_V2_COMPOSITION.viewAngles]: '' }} aria-label="View angles">
        <span className="elab-view-angles__label">VIEW ANGLES</span>
        <div className="elab-view-angles__strip">
          {VIEW_ANGLES.map((angle, i) => (
            <button key={angle} type="button" className={`elab-view-angles__thumb${i === 0 ? ' elab-view-angles__thumb--active' : ''}`}>
              <span className="elab-view-angles__thumb-inner" />
              <span className="elab-view-angles__thumb-label">{angle}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
