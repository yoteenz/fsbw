import { useCallback, useMemo, useRef, useState } from 'react';
import type { IconSheetProfileId } from '../../../../studio-os-core/icon-manufacturing';
import {
  saveManufacturingExtensions,
  recordManufacturingEvent,
} from '../../../../studio-os-core/icon-manufacturing';
import {
  distributeBoundariesEvenly,
  exportCalibrationJson,
  importCalibrationJson,
  upsertCellOverride,
  createEmptyCellOverride,
  type StudioWorldIconGridCalibration,
} from '../grid-calibration';
import {
  getSemanticKeyForCellFromRegistry,
  resolveAllCalibratedCellRectsForProfile,
  resolveCalibratedCellRectForProfile,
} from '../../../../studio-os-core/icon-manufacturing';
import {
  GridCalibrationPanel,
  StepperControl,
  pushHistory,
  styles,
  type GridEditorHistoryEntry,
  type GridEditorMode,
} from '../grid-calibration/StudioWorldIconGridCalibrationEditor.shared';
import type { StudioWorldIconCellRect } from '../grid-calibration/StudioWorldIconGridCalibration';
import {
  getCanonicalCalibrationForProfile,
  loadCalibrationDraftForProfile,
  saveCalibrationDraftForProfile,
  useIconManufacturingSheet,
  validateCalibrationForProfile,
} from './useIconManufacturingSheet';
import { resolveExperienceLabIconSourceUnlabeledUrl } from '../experience-lab-icon-sprite.config';
import navigationMasterSheetUrl from '../../../../assets/studio-world/navigation/icons/source/studio-world-navigation-master-sheet.png';

const MODES: GridEditorMode[] = ['grid', 'row', 'column', 'cell', 'preview', 'history'];
const MODE_LABELS: Record<GridEditorMode, string> = {
  grid: 'Grid',
  row: 'Rows',
  column: 'Columns',
  cell: 'Cell Overrides',
  preview: 'Live Preview',
  reference: 'Reference',
  history: 'History',
};

function resolveSourceUrl(profileId: IconSheetProfileId): string {
  if (profileId === 'navigation-master') return navigationMasterSheetUrl;
  return resolveExperienceLabIconSourceUnlabeledUrl();
}

type GridCalibrationStudioProps = {
  profileId: IconSheetProfileId;
};

export function GridCalibrationStudio({ profileId }: GridCalibrationStudioProps) {
  const { profile, registry, extensions: initialExtensions } = useIconManufacturingSheet(profileId);
  const [mode, setMode] = useState<GridEditorMode>('grid');
  const [calibration, setCalibration] = useState<StudioWorldIconGridCalibration>(() =>
    loadCalibrationDraftForProfile(profileId) ?? getCanonicalCalibrationForProfile(profileId),
  );
  const [extensions, setExtensions] = useState(initialExtensions);
  const [selectedCells, setSelectedCells] = useState<Array<{ row: number; column: number }>>([]);
  const [selectedRow, setSelectedRow] = useState(0);
  const [selectedColumn, setSelectedColumn] = useState(0);
  const [undoStack, setUndoStack] = useState<GridEditorHistoryEntry[]>([]);
  const [redoStack, setRedoStack] = useState<GridEditorHistoryEntry[]>([]);
  const [status, setStatus] = useState('Ready');
  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validation = useMemo(
    () => validateCalibrationForProfile(profileId, calibration),
    [profileId, calibration],
  );
  const cells = useMemo(
    () => resolveAllCalibratedCellRectsForProfile(calibration, profile, registry, extensions),
    [calibration, profile, registry, extensions],
  );
  const contentRect = useMemo(() => {
    const left = Math.round(calibration.outerLeft * calibration.sourceWidth);
    const top = Math.round(calibration.outerTop * calibration.sourceHeight);
    const right = Math.round(calibration.sourceWidth * (1 - calibration.outerRight));
    const bottom = Math.round(calibration.sourceHeight * (1 - calibration.outerBottom));
    return { left, top, width: Math.max(1, right - left), height: Math.max(1, bottom - top) };
  }, [calibration]);

  const commitCalibration = useCallback(
    (next: StudioWorldIconGridCalibration, label: string) => {
      setUndoStack((s) => pushHistory(s, { calibration, label }));
      setRedoStack([]);
      setCalibration({ ...next, updatedAt: new Date().toISOString(), updatedBy: 'founder' });
    },
    [calibration],
  );

  const commitExtensions = useCallback(
    (next: typeof extensions, label: string) => {
      setExtensions(next);
      saveManufacturingExtensions(profileId, next);
      setStatus(`Extensions: ${label}`);
    },
    [profileId],
  );

  const selectCell = (row: number, column: number, additive = false) => {
    if (additive) {
      setSelectedCells((prev) => {
        const exists = prev.some((c) => c.row === row && c.column === column);
        return exists ? prev.filter((c) => !(c.row === row && c.column === column)) : [...prev, { row, column }];
      });
    } else {
      setSelectedCells([{ row, column }]);
      setSelectedRow(row);
      setSelectedColumn(column);
    }
  };

  const primaryCell = selectedCells[0] ?? { row: selectedRow, column: selectedColumn };
  const primaryKey =
    getSemanticKeyForCellFromRegistry(primaryCell.row, primaryCell.column, registry) ??
    `${primaryCell.row}-${primaryCell.column}`;

  const overlayStyle = (left: number, top: number, width: number, height: number, sw: number, sh: number) => {
    const scaleX = sw / calibration.sourceWidth;
    const scaleY = sh / calibration.sourceHeight;
    return {
      left: `${left * scaleX}px`,
      top: `${top * scaleY}px`,
      width: `${width * scaleX}px`,
      height: `${height * scaleY}px`,
    };
  };

  const renderGridOverlay = (imgEl: HTMLImageElement | null) => {
    if (!imgEl) return null;
    const sw = imgEl.clientWidth;
    const sh = imgEl.clientHeight;
    return (
      <div className={styles.gridOverlay}>
        {calibration.columnBoundaries.map((b, i) => {
          const x = contentRect.left + Math.round(b * contentRect.width);
          return (
            <span key={`cv-${i}`} className={styles.gridLineV} style={{ left: `${(x / calibration.sourceWidth) * sw}px` }} />
          );
        })}
        {calibration.rowBoundaries.map((b, i) => {
          const y = contentRect.top + Math.round(b * contentRect.height);
          return (
            <span key={`rh-${i}`} className={styles.gridLineH} style={{ top: `${(y / calibration.sourceHeight) * sh}px` }} />
          );
        })}
        {cells.map((cell: StudioWorldIconCellRect) => {
          const selected = selectedCells.some((c) => c.row === cell.row && c.column === cell.column);
          return (
            <button
              key={`${cell.row}-${cell.column}`}
              type="button"
              className={`${styles.cellHit}${selected ? ` ${styles.cellHitSelected}` : ''}${cell.hasOverride ? ` ${styles.cellHitOverride}` : ''}`}
              style={overlayStyle(cell.left, cell.top, cell.width, cell.height, sw, sh)}
              aria-label={`Cell r${cell.row + 1} c${cell.column + 1} ${cell.semanticKey}`}
              onClick={(e) => selectCell(cell.row, cell.column, e.shiftKey)}
            />
          );
        })}
      </div>
    );
  };

  const globalControls = (
    <GridCalibrationPanel title="Global Manufacturing Controls">
      <StepperControl label="Global Scale" value={extensions.globalScale} step={0.02} min={0.5} max={1.5} onChange={(v) => commitExtensions({ ...extensions, globalScale: v }, 'global scale')} />
      <StepperControl label="Global Offset X" value={extensions.globalOffsetX} step={1} min={-40} max={40} onChange={(v) => commitExtensions({ ...extensions, globalOffsetX: v }, 'global offset x')} />
      <StepperControl label="Global Offset Y" value={extensions.globalOffsetY} step={1} min={-40} max={40} onChange={(v) => commitExtensions({ ...extensions, globalOffsetY: v }, 'global offset y')} />
      <StepperControl label="Global Safe Area" value={extensions.globalSafeArea} step={0.01} min={0} max={0.2} onChange={(v) => commitExtensions({ ...extensions, globalSafeArea: v }, 'safe area')} />
      <StepperControl label="Optical Margin" value={extensions.globalOpticalMargin} step={0.01} min={0} max={0.15} onChange={(v) => commitExtensions({ ...extensions, globalOpticalMargin: v }, 'optical margin')} />
    </GridCalibrationPanel>
  );

  const rowControls = (
    <GridCalibrationPanel title={`Row ${selectedRow + 1} — height · offset · padding · scale`}>
      <StepperControl label="Row Scale" value={extensions.rowScales[selectedRow] ?? 1} step={0.02} min={0.5} max={1.5} onChange={(v) => {
        const rowScales = [...extensions.rowScales];
        rowScales[selectedRow] = v;
        commitExtensions({ ...extensions, rowScales }, `row ${selectedRow + 1} scale`);
      }} />
      <StepperControl label="Row Offset (px)" value={calibration.rowOffsets[selectedRow] ?? 0} step={1} min={-40} max={40} onChange={(v) => {
        const rowOffsets = [...calibration.rowOffsets];
        rowOffsets[selectedRow] = v;
        commitCalibration({ ...calibration, rowOffsets }, `row ${selectedRow + 1} offset`);
      }} />
      <button type="button" className={styles.btn} onClick={() => commitCalibration({ ...calibration, rowBoundaries: distributeBoundariesEvenly(profile.grid.rows) }, 'distribute rows')}>Distribute Rows</button>
    </GridCalibrationPanel>
  );

  const columnControls = (
    <GridCalibrationPanel title={`Column ${selectedColumn + 1} — width · offset · padding · scale`}>
      <StepperControl label="Column Scale" value={extensions.columnScales[selectedColumn] ?? 1} step={0.02} min={0.5} max={1.5} onChange={(v) => {
        const columnScales = [...extensions.columnScales];
        columnScales[selectedColumn] = v;
        commitExtensions({ ...extensions, columnScales }, `col ${selectedColumn + 1} scale`);
      }} />
      <StepperControl label="Column Offset (px)" value={calibration.columnOffsets[selectedColumn] ?? 0} step={1} min={-40} max={40} onChange={(v) => {
        const columnOffsets = [...calibration.columnOffsets];
        columnOffsets[selectedColumn] = v;
        commitCalibration({ ...calibration, columnOffsets }, `col ${selectedColumn + 1} offset`);
      }} />
      <button type="button" className={styles.btn} onClick={() => commitCalibration({ ...calibration, columnBoundaries: distributeBoundariesEvenly(profile.grid.columns) }, 'distribute columns')}>Distribute Columns</button>
    </GridCalibrationPanel>
  );

  const selectedCellRect = resolveCalibratedCellRectForProfile(
    calibration,
    primaryCell.row,
    primaryCell.column,
    registry,
    extensions,
  );

  const sourceUrl = resolveSourceUrl(profileId);
  const previewScale = 180 / Math.max(selectedCellRect.width, 1);
  const sourceCellStyle: React.CSSProperties = {
    width: 180,
    height: Math.round(selectedCellRect.height * previewScale),
    backgroundImage: `url(${sourceUrl})`,
    backgroundSize: `${calibration.sourceWidth * previewScale}px auto`,
    backgroundPosition: `-${selectedCellRect.left * previewScale}px -${selectedCellRect.top * previewScale}px`,
    backgroundRepeat: 'no-repeat',
    border: '1px solid rgba(197,160,89,0.3)',
    borderRadius: 4,
  };

  const saveDraft = () => {
    saveCalibrationDraftForProfile(profileId, { ...calibration, canonical: false });
    recordManufacturingEvent({ sheetId: profileId, type: 'calibrated', actor: 'founder', summary: 'Calibration draft saved' });
    setStatus('Draft saved');
  };

  const saveCanonical = () => {
    if (!validation.ok) {
      setStatus(`Cannot save: ${validation.errors.join('; ')}`);
      return;
    }
    const next = {
      ...calibration,
      canonical: true,
      calibrationVersion: `${profile.id}-calibration-v${Date.now()}`,
    };
    saveCalibrationDraftForProfile(profileId, next);
    setCalibration(next);
    recordManufacturingEvent({ sheetId: profileId, type: 'calibrated', actor: 'founder', summary: 'Canonical calibration saved' });
    setStatus(`Canonical saved — run ${profile.buildScript}`);
  };

  const activeControls =
    mode === 'grid' ? globalControls
    : mode === 'row' ? rowControls
    : mode === 'column' ? columnControls
    : mode === 'cell' ? (
      <GridCalibrationPanel title={`Cell Inspector — ${primaryKey}`}>
        <p style={{ fontSize: 8 }}>r{primaryCell.row + 1} c{primaryCell.column + 1} · Individual overrides available</p>
        <StepperControl label="Scale" value={1} step={0.05} min={0.5} max={1.5} onChange={(v) => {
          const override = createEmptyCellOverride(primaryCell.row, primaryCell.column, primaryKey);
          commitCalibration(upsertCellOverride(calibration, { ...override, scale: v, enabled: true }), 'cell scale');
        }} />
      </GridCalibrationPanel>
    )
    : mode === 'preview' ? (
      <GridCalibrationPanel title="Live Preview Sizes">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[24, 32, 48, 64, 96, 128, 256, 512].map((size) => (
            <div key={size} style={{ textAlign: 'center', fontSize: 8 }}>
              <div style={{ ...sourceCellStyle, width: size, height: size, backgroundSize: `${calibration.sourceWidth * (size / selectedCellRect.width)}px auto` }} />
              <div>{size}px</div>
            </div>
          ))}
        </div>
      </GridCalibrationPanel>
    ) : (
      <GridCalibrationPanel title="History">
        <p style={{ fontSize: 8 }}>Undo: {undoStack.length} · Redo: {redoStack.length}</p>
      </GridCalibrationPanel>
    );

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <h1 className={styles.title}>Calibration Studio — {profile.label}</h1>
        <div className={styles.actions}>
          <button type="button" className={styles.btn} onClick={saveDraft}>Save Draft</button>
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={saveCanonical}>Save Canonical</button>
          <button type="button" className={styles.btn} onClick={() => fileInputRef.current?.click()}>Import</button>
          <button type="button" className={styles.btn} onClick={() => {
            const blob = new Blob([exportCalibrationJson(calibration)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${profile.id}-grid-calibration.json`;
            a.click();
          }}>Export</button>
        </div>
        <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const reader = new FileReader();
          reader.onload = () => {
            try {
              commitCalibration(importCalibrationJson(String(reader.result)), 'import');
            } catch {
              setStatus('Import failed');
            }
          };
          reader.readAsText(f);
        }} />
      </header>

      <nav className={styles.tabs}>
        {MODES.map((m) => (
          <button key={m} type="button" className={`${styles.tab}${mode === m ? ` ${styles.tabActive}` : ''}`} onClick={() => setMode(m)}>{MODE_LABELS[m]}</button>
        ))}
      </nav>

      <div className={styles.statusBar}>
        <span>{status}</span>
        <span>Validation: {validation.ok ? 'OK' : validation.errors.join(', ')}</span>
        <span>{profile.grid.rows}×{profile.grid.columns} · {profile.grid.iconCount} icons</span>
      </div>

      <div className={styles.layout}>
        <div className={styles.sourceWrap}>
          <img className={styles.sourceImg} src={sourceUrl} alt={`${profile.label} master sheet`} draggable={false} ref={setSourceImg} onLoad={() => setSourceImg((p) => p)} />
          {renderGridOverlay(sourceImg)}
        </div>
        <div className={styles.controlsCol}>
          <GridCalibrationPanel title="Cell Preview">
            <div style={sourceCellStyle} />
            <p style={{ fontSize: 8, marginTop: 6 }}>{primaryKey}</p>
          </GridCalibrationPanel>
          {activeControls}
        </div>
      </div>
    </div>
  );
}
