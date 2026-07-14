import type { ReactNode } from 'react';
import type {
  StudioWorldIconCellOverride,
  StudioWorldIconGridCalibration,
} from './StudioWorldIconGridCalibration';
import { createDefaultGridCalibration } from './StudioWorldIconGridCalibration';
import styles from './StudioWorldIconGridCalibrationEditor.module.css';

export type GridEditorMode = 'grid' | 'row' | 'column' | 'cell' | 'preview' | 'reference' | 'history';

export type GridEditorHistoryEntry = {
  calibration: StudioWorldIconGridCalibration;
  label: string;
};

export const GRID_CALIBRATION_DRAFT_KEY = 'studio-world:icon-grid-calibration-draft';
export const GRID_CALIBRATION_HISTORY_KEY = 'studio-world:icon-grid-calibration-history';
export const GRID_CALIBRATION_CANONICAL_LOCAL_KEY = 'studio-world:icon-grid-calibration-canonical-local';

export function loadGridCalibrationDraft(): StudioWorldIconGridCalibration | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(GRID_CALIBRATION_DRAFT_KEY);
    return raw ? (JSON.parse(raw) as StudioWorldIconGridCalibration) : null;
  } catch {
    return null;
  }
}

export function saveGridCalibrationDraft(cal: StudioWorldIconGridCalibration): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(GRID_CALIBRATION_DRAFT_KEY, JSON.stringify(cal, null, 2));
}

export function exportCalibrationJson(cal: StudioWorldIconGridCalibration): string {
  return JSON.stringify(cal, null, 2);
}

export function importCalibrationJson(raw: string): StudioWorldIconGridCalibration {
  const parsed = JSON.parse(raw) as StudioWorldIconGridCalibration;
  return { ...createDefaultGridCalibration(), ...parsed };
}

export function pushHistory(
  history: GridEditorHistoryEntry[],
  entry: GridEditorHistoryEntry,
  max = 40,
): GridEditorHistoryEntry[] {
  return [...history.slice(-(max - 1)), entry];
}

export function createEmptyCellOverride(
  row: number,
  column: number,
  semanticKey: string,
): StudioWorldIconCellOverride {
  return {
    row,
    column,
    semanticKey,
    insetTop: 0,
    insetRight: 0,
    insetBottom: 0,
    insetLeft: 0,
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    enabled: true,
    reason: '',
  };
}

export function GridCalibrationPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.panel}>
      <h3 className={styles.panelTitle}>{title}</h3>
      {children}
    </section>
  );
}

export function StepperControl({
  label,
  value,
  onChange,
  step = 1,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
}) {
  const clamp = (v: number) => {
    let n = v;
    if (min !== undefined) n = Math.max(min, n);
    if (max !== undefined) n = Math.min(max, n);
    return n;
  };
  return (
    <div className={styles.stepper}>
      <span className={styles.stepperLabel}>{label}</span>
      <div className={styles.stepperControls}>
        <button type="button" className={styles.stepperBtn} onClick={() => onChange(clamp(value - step))} aria-label={`Decrease ${label}`}>−</button>
        <input
          className={styles.stepperInput}
          type="number"
          value={Number(value.toFixed(4))}
          step={step}
          onChange={(e) => onChange(clamp(Number(e.target.value)))}
        />
        <button type="button" className={styles.stepperBtn} onClick={() => onChange(clamp(value + step))} aria-label={`Increase ${label}`}>+</button>
      </div>
    </div>
  );
}

export { styles };
