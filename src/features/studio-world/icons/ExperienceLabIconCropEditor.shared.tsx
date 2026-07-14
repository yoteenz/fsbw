import type { ReactNode } from 'react';
import styles from './ExperienceLabIconCropEditor.module.css';

export type CropEditorDraft = {
  cropLeft: number;
  cropTop: number;
  cropRight: number;
  cropBottom: number;
  glyphPadding: number;
  outputSize: number;
  alphaThreshold: number;
  approved: boolean;
  notes: string;
};

export const CROP_EDITOR_DRAFT_KEY = 'studio-world:icon-crop-editor-drafts';

export function loadCropEditorDrafts(): Partial<Record<string, CropEditorDraft>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(CROP_EDITOR_DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Partial<Record<string, CropEditorDraft>>) : {};
  } catch {
    return {};
  }
}

export function saveCropEditorDraft(key: string, draft: CropEditorDraft): void {
  if (typeof window === 'undefined') return;
  const all = loadCropEditorDrafts();
  all[key] = draft;
  window.localStorage.setItem(CROP_EDITOR_DRAFT_KEY, JSON.stringify(all, null, 2));
}

export function exportCropPatchFragment(
  key: string,
  draft: CropEditorDraft,
  cellLeft: number,
  cellTop: number,
): string {
  const cropX = cellLeft + draft.cropLeft;
  const cropY = cellTop + draft.cropTop;
  const cropWidth = Math.max(1, draft.cropRight - draft.cropLeft);
  const cropHeight = Math.max(1, draft.cropBottom - draft.cropTop);
  return JSON.stringify(
    {
      [key]: {
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        glyphPadding: draft.glyphPadding,
        outputSize: draft.outputSize,
        approved: draft.approved,
        notes: draft.notes,
      },
    },
    null,
    2,
  );
}

export function CropEditorPanel({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className={styles.panel}>
      <h3 className={styles.panelTitle}>{title}</h3>
      {children}
    </section>
  );
}

export { styles };
