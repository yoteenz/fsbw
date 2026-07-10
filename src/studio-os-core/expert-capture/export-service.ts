import type { ExpertCaptureSession } from './types';
import { getExpertCaptureProfile } from './profiles';

export type ExpertCaptureExportBundle = Record<string, string>;

export function buildExportBundle(session: ExpertCaptureSession): ExpertCaptureExportBundle {
  const profile = getExpertCaptureProfile(session.meta.profileId);
  return profile.buildExportBundle(session);
}

export function downloadExportBundle(session: ExpertCaptureSession): void {
  const bundle = buildExportBundle(session);
  const slug = session.meta.expertName.replace(/\s+/g, '-').toLowerCase().slice(0, 24) || 'expert';
  for (const [name, content] of Object.entries(bundle)) {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}-${name}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
