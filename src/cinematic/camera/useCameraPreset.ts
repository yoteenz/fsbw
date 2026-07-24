import { useMemo } from 'react';
import { resolveCameraPreset } from '../camera/presets';
import { resolveCameraId } from '../utilities/resolve';
import type { FscsCameraId } from '../utilities/types';

export function useCameraPreset(camera: FscsCameraId | string = 'slow-push') {
  const id = resolveCameraId(String(camera));
  return useMemo(() => resolveCameraPreset(id), [id]);
}
