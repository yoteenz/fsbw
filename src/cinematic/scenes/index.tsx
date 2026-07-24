import type { ReactNode } from 'react';
import { resolveCameraPreset } from '../camera/presets';
import { resolveSceneTemplate } from '../templates/sceneTemplates';
import { resolveTransitionPreset } from '../transitions/presets';
import { CinematicOverlay } from '../overlays';
import { cn, resolveCameraId, resolveSceneTemplateId } from '../utilities/resolve';
import type { FscsCameraId, FscsSceneTemplateId } from '../utilities/types';

export type CinematicSceneProps = {
  template?: FscsSceneTemplateId | string;
  camera?: FscsCameraId | string;
  active?: boolean;
  className?: string;
  children?: ReactNode;
};

export function CinematicScene({
  template = 'luxury-arrival',
  camera,
  active = true,
  className,
  children,
}: CinematicSceneProps) {
  const templateId = resolveSceneTemplateId(String(template));
  const sceneTemplate = resolveSceneTemplate(templateId);
  const cameraId = camera ? resolveCameraId(String(camera)) : sceneTemplate.camera;
  const cameraPreset = resolveCameraPreset(cameraId);
  const transition = resolveTransitionPreset(sceneTemplate.transition);

  return (
    <section
      className={cn('fscs-root fscs-scene', active && 'fscs-scene--camera-active', className)}
      data-fscs-template={templateId}
      data-fscs-camera={cameraId}
      data-fscs-transition={transition.id}
      style={{
        ['--fscs-camera-ms' as string]: `${cameraPreset.durationMs}ms`,
      }}
    >
      <div className="fscs-scene__camera" aria-hidden />
      <CinematicOverlay variant="vignette" />
      {children}
    </section>
  );
}

export type SceneTemplateProps = CinematicSceneProps & {
  title?: string;
};

export function LuxuryArrivalScene(props: Omit<CinematicSceneProps, 'template'>) {
  return <CinematicScene template="luxury-arrival" {...props} />;
}

export function MorningRoutineScene(props: Omit<CinematicSceneProps, 'template'>) {
  return <CinematicScene template="morning-routine" {...props} />;
}

export function ShowroomWalkthroughScene(props: Omit<CinematicSceneProps, 'template'>) {
  return <CinematicScene template="showroom-walkthrough" {...props} />;
}

export function CampaignEndingScene(props: Omit<CinematicSceneProps, 'template'>) {
  return <CinematicScene template="campaign-ending" {...props} />;
}

export { CinematicScene as FscsScene };
export { CinematicSequence } from './CinematicSequence';
export type { CinematicSequenceProps } from './CinematicSequence';
