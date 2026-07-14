import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRequireStudioWorldAdmin } from '../../../../hooks/useRequireStudioWorldAdmin';
import {
  EXPERIENCE_LAB_ICON_ASSETS,
  EXPERIENCE_LAB_ICON_NAMES,
  EXPERIENCE_LAB_ICON_REGISTRY,
  EXPERIENCE_LAB_ICON_SPRITE_CONFIG,
  resolveExperienceLabIconSourceLabeledUrl,
  resolveExperienceLabIconSourceUnlabeledUrl,
} from '../../../../features/studio-world/icons';
import {
  STUDIO_WORLD_ICON_GRID_CALIBRATION_CANONICAL,
  applyColumnPadding,
  applyRowPadding,
  createDefaultGridCalibration,
  createEmptyCellOverride,
  distributeBoundariesEvenly,
  exportCalibrationJson,
  getSemanticKeyForCell,
  importCalibrationJson,
  resolveAllCalibratedCellRects,
  resolveGridContentRect,
  resolveStudioWorldIconCalibratedCellRect,
  upsertCellOverride,
  validateGridCalibration,
  type StudioWorldIconGridCalibration,
} from '../../../../features/studio-world/icons/grid-calibration';
import {
  GridCalibrationPanel,
  StepperControl,
  loadGridCalibrationDraft,
  pushHistory,
  saveGridCalibrationDraft,
  styles,
  type GridEditorHistoryEntry,
  type GridEditorMode,
} from '../../../../features/studio-world/icons/grid-calibration/StudioWorldIconGridCalibrationEditor.shared';

import contactSheetUrl from '../../../../assets/studio-world/experience-lab/icons/generated-v6/_contact-sheet.png';

const MODES: GridEditorMode[] = ['grid', 'row', 'column', 'cell', 'preview', 'reference', 'history'];
const MODE_LABELS: Record<GridEditorMode, string> = {
  grid: 'Grid Calibration',
  row: 'Rows',
  column: 'Columns',
  cell: 'Cell Overrides',
  preview: 'Runtime Preview',
  reference: 'Reference Catalog',
  history: 'History',
};

export default function StudioWorldIconGridCalibrationPage() {
  useRequireStudioWorldAdmin();

  const [mode, setMode] = useState<GridEditorMode>('grid');
  const [calibration, setCalibration] = useState<StudioWorldIconGridCalibration>(() =>
    loadGridCalibrationDraft() ?? STUDIO_WORLD_ICON_GRID_CALIBRATION_CANONICAL,
  );
  const [selectedCells, setSelectedCells] = useState<Array<{ row: number; column: number }>>([]);
  const [selectedRow, setSelectedRow] = useState(0);
  const [selectedColumn, setSelectedColumn] = useState(0);
  const [undoStack, setUndoStack] = useState<GridEditorHistoryEntry[]>([]);
  const [redoStack, setRedoStack] = useState<GridEditorHistoryEntry[]>([]);
  const [publishConfirm, setPublishConfirm] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const validation = useMemo(() => validateGridCalibration(calibration), [calibration]);
  const cells = useMemo(() => resolveAllCalibratedCellRects(calibration), [calibration]);
  const contentRect = useMemo(() => resolveGridContentRect(calibration), [calibration]);

  const commitCalibration = useCallback(
    (next: StudioWorldIconGridCalibration, label: string) => {
      setUndoStack((s) => pushHistory(s, { calibration, label }));
      setRedoStack([]);
      setCalibration({ ...next, updatedAt: new Date().toISOString(), updatedBy: 'founder' });
    },
    [calibration],
  );

  const undo = () => {
    const prev = undoStack[undoStack.length - 1];
    if (!prev) return;
    setRedoStack((s) => [...s, { calibration, label: 'undo-point' }]);
    setUndoStack((s) => s.slice(0, -1));
    setCalibration(prev.calibration);
    setStatus(`Undo: ${prev.label}`);
  };

  const redo = () => {
    const next = redoStack[redoStack.length - 1];
    if (!next) return;
    setUndoStack((s) => pushHistory(s, { calibration, label: 'redo-point' }));
    setRedoStack((s) => s.slice(0, -1));
    setCalibration(next.calibration);
    setStatus(`Redo: ${next.label}`);
  };

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
  const primaryKey = getSemanticKeyForCell(primaryCell.row, primaryCell.column) ?? `${primaryCell.row}-${primaryCell.column}`;
  const primaryOverride = calibration.cellOverrides.find(
    (o) => o.row === primaryCell.row && o.column === primaryCell.column,
  );
  const overrideDraft = primaryOverride ?? createEmptyCellOverride(primaryCell.row, primaryCell.column, primaryKey);

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
    const linesV = calibration.columnBoundaries.map((b, i) => {
      const x = contentRect.left + Math.round(b * contentRect.width);
      return (
        <span
          key={`cv-${i}`}
          className={styles.gridLineV}
          style={{ left: `${(x / calibration.sourceWidth) * sw}px` }}
        />
      );
    });
    const linesH = calibration.rowBoundaries.map((b, i) => {
      const y = contentRect.top + Math.round(b * contentRect.height);
      return (
        <span
          key={`rh-${i}`}
          className={styles.gridLineH}
          style={{ top: `${(y / calibration.sourceHeight) * sh}px` }}
        />
      );
    });
    const cellHits = cells.map((cell) => {
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
    });
    return (
      <div className={styles.gridOverlay}>
        {linesV}
        {linesH}
        {cellHits}
      </div>
    );
  };

  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null);

  const boundaryControls = (
    <GridCalibrationPanel title="Outer Margins (normalized)">
      <StepperControl label="Outer Left" value={calibration.outerLeft} step={0.005} min={0} max={0.4} onChange={(v) => commitCalibration({ ...calibration, outerLeft: v }, 'outer left')} />
      <StepperControl label="Outer Right" value={calibration.outerRight} step={0.005} min={0} max={0.4} onChange={(v) => commitCalibration({ ...calibration, outerRight: v }, 'outer right')} />
      <StepperControl label="Outer Top" value={calibration.outerTop} step={0.005} min={0} max={0.4} onChange={(v) => commitCalibration({ ...calibration, outerTop: v }, 'outer top')} />
      <StepperControl label="Outer Bottom" value={calibration.outerBottom} step={0.005} min={0} max={0.4} onChange={(v) => commitCalibration({ ...calibration, outerBottom: v }, 'outer bottom')} />
    </GridCalibrationPanel>
  );

  const rowControls = (
    <GridCalibrationPanel title={`Row ${selectedRow + 1} Calibration`}>
      <StepperControl
        label="Row Top Boundary"
        value={calibration.rowBoundaries[selectedRow] ?? 0}
        step={0.002}
        min={selectedRow === 0 ? 0 : (calibration.rowBoundaries[selectedRow - 1] ?? 0) + 0.001}
        max={(calibration.rowBoundaries[selectedRow + 1] ?? 1) - 0.001}
        onChange={(v) => {
          const rowBoundaries = [...calibration.rowBoundaries];
          rowBoundaries[selectedRow] = v;
          commitCalibration({ ...calibration, rowBoundaries }, `row ${selectedRow + 1} top`);
        }}
      />
      <StepperControl
        label="Row Bottom Boundary"
        value={calibration.rowBoundaries[selectedRow + 1] ?? 1}
        step={0.002}
        min={(calibration.rowBoundaries[selectedRow] ?? 0) + 0.001}
        max={selectedRow === 7 ? 1 : (calibration.rowBoundaries[selectedRow + 2] ?? 1) - 0.001}
        onChange={(v) => {
          const rowBoundaries = [...calibration.rowBoundaries];
          rowBoundaries[selectedRow + 1] = v;
          commitCalibration({ ...calibration, rowBoundaries }, `row ${selectedRow + 1} bottom`);
        }}
      />
      <StepperControl
        label="Row Offset (px)"
        value={calibration.rowOffsets[selectedRow] ?? 0}
        step={1}
        min={-20}
        max={20}
        onChange={(v) => {
          const rowOffsets = [...calibration.rowOffsets];
          rowOffsets[selectedRow] = v;
          commitCalibration({ ...calibration, rowOffsets }, `row ${selectedRow + 1} offset`);
        }}
      />
      <StepperControl
        label="Top Padding"
        value={calibration.rowPadding[selectedRow]?.top ?? 0}
        step={1}
        min={0}
        max={30}
        onChange={(v) => commitCalibration(applyRowPadding(calibration, selectedRow, { top: v - (calibration.rowPadding[selectedRow]?.top ?? 0) }), `row ${selectedRow + 1} top pad`)}
      />
      <StepperControl
        label="Bottom Padding"
        value={calibration.rowPadding[selectedRow]?.bottom ?? 0}
        step={1}
        min={0}
        max={30}
        onChange={(v) => commitCalibration(applyRowPadding(calibration, selectedRow, { bottom: v - (calibration.rowPadding[selectedRow]?.bottom ?? 0) }), `row ${selectedRow + 1} bottom pad`)}
      />
      <button type="button" className={styles.btn} onClick={() => commitCalibration({ ...calibration, rowBoundaries: distributeBoundariesEvenly(8) }, 'distribute rows')}>Distribute Rows Evenly</button>
    </GridCalibrationPanel>
  );

  const columnControls = (
    <GridCalibrationPanel title={`Column ${selectedColumn + 1} Calibration`}>
      <StepperControl
        label="Column Left Boundary"
        value={calibration.columnBoundaries[selectedColumn] ?? 0}
        step={0.002}
        min={selectedColumn === 0 ? 0 : (calibration.columnBoundaries[selectedColumn - 1] ?? 0) + 0.001}
        max={(calibration.columnBoundaries[selectedColumn + 1] ?? 1) - 0.001}
        onChange={(v) => {
          const columnBoundaries = [...calibration.columnBoundaries];
          columnBoundaries[selectedColumn] = v;
          commitCalibration({ ...calibration, columnBoundaries }, `col ${selectedColumn + 1} left`);
        }}
      />
      <StepperControl
        label="Column Right Boundary"
        value={calibration.columnBoundaries[selectedColumn + 1] ?? 1}
        step={0.002}
        min={(calibration.columnBoundaries[selectedColumn] ?? 0) + 0.001}
        max={selectedColumn === 7 ? 1 : (calibration.columnBoundaries[selectedColumn + 2] ?? 1) - 0.001}
        onChange={(v) => {
          const columnBoundaries = [...calibration.columnBoundaries];
          columnBoundaries[selectedColumn + 1] = v;
          commitCalibration({ ...calibration, columnBoundaries }, `col ${selectedColumn + 1} right`);
        }}
      />
      <StepperControl
        label="Column Offset (px)"
        value={calibration.columnOffsets[selectedColumn] ?? 0}
        step={1}
        min={-20}
        max={20}
        onChange={(v) => {
          const columnOffsets = [...calibration.columnOffsets];
          columnOffsets[selectedColumn] = v;
          commitCalibration({ ...calibration, columnOffsets }, `col ${selectedColumn + 1} offset`);
        }}
      />
      <StepperControl
        label="Left Padding"
        value={calibration.columnPadding[selectedColumn]?.left ?? 0}
        step={1}
        min={0}
        max={30}
        onChange={(v) => commitCalibration(applyColumnPadding(calibration, selectedColumn, { left: v - (calibration.columnPadding[selectedColumn]?.left ?? 0) }), `col ${selectedColumn + 1} left pad`)}
      />
      <StepperControl
        label="Right Padding"
        value={calibration.columnPadding[selectedColumn]?.right ?? 0}
        step={1}
        min={0}
        max={30}
        onChange={(v) => commitCalibration(applyColumnPadding(calibration, selectedColumn, { right: v - (calibration.columnPadding[selectedColumn]?.right ?? 0) }), `col ${selectedColumn + 1} right pad`)}
      />
      <button type="button" className={styles.btn} onClick={() => commitCalibration({ ...calibration, columnBoundaries: distributeBoundariesEvenly(8) }, 'distribute columns')}>Distribute Columns Evenly</button>
    </GridCalibrationPanel>
  );

  const cellControls = (
    <GridCalibrationPanel title={`Cell Override — ${primaryKey} (r${primaryCell.row + 1} c${primaryCell.column + 1})`}>
      <p style={{ fontSize: 8, margin: '0 0 8px', color: 'rgba(240,235,227,0.65)' }}>
        Selected: {selectedCells.length} cell(s). Overrides apply after row/column calibration only.
      </p>
      {(['insetTop', 'insetRight', 'insetBottom', 'insetLeft', 'offsetX', 'offsetY'] as const).map((field) => (
        <StepperControl
          key={field}
          label={field}
          value={overrideDraft[field]}
          step={1}
          min={field.startsWith('inset') ? 0 : -30}
          max={30}
          onChange={(v) => {
            const next = upsertCellOverride(calibration, { ...overrideDraft, [field]: v, enabled: true });
            commitCalibration(next, `cell ${primaryKey} ${field}`);
          }}
        />
      ))}
      <StepperControl
        label="Scale"
        value={overrideDraft.scale}
        step={0.01}
        min={0.5}
        max={1.5}
        onChange={(v) => commitCalibration(upsertCellOverride(calibration, { ...overrideDraft, scale: v, enabled: true }), `cell ${primaryKey} scale`)}
      />
      <button
        type="button"
        className={styles.btn}
        onClick={() => {
          const next = upsertCellOverride(calibration, { ...overrideDraft, enabled: false });
          commitCalibration(next, `reset cell ${primaryKey}`);
        }}
      >
        Reset Cell Override
      </button>
      <button
        type="button"
        className={styles.btn}
        onClick={() => {
          let next = calibration;
          for (const cell of selectedCells.length ? selectedCells : [primaryCell]) {
            const key = getSemanticKeyForCell(cell.row, cell.column) ?? `${cell.row}-${cell.column}`;
            next = upsertCellOverride(next, { ...overrideDraft, row: cell.row, column: cell.column, semanticKey: key, enabled: true });
          }
          commitCalibration(next, `bulk override ${selectedCells.length || 1} cells`);
        }}
      >
        Apply To Selected ({selectedCells.length || 1})
      </button>
    </GridCalibrationPanel>
  );

  const previewPanel = (
    <GridCalibrationPanel title="Runtime Preview (v6 generated)">
      <div className={styles.previewGrid}>
        {EXPERIENCE_LAB_ICON_NAMES.map((name) => {
          const reg = EXPERIENCE_LAB_ICON_REGISTRY[name];
          const asset = EXPERIENCE_LAB_ICON_ASSETS[name];
          const hasOverride = calibration.cellOverrides.some(
            (o) => o.enabled && o.row === reg.row && o.column === reg.column,
          );
          return (
            <div key={name} className={styles.previewCell} style={{ background: '#0e1016' }}>
              {asset?.src ? <img src={asset.src} alt={reg.accessibleLabel} /> : <span style={{ fontSize: 6 }}>—</span>}
              <span className={styles.previewMeta}>{reg.sourceLabel}</span>
              {hasOverride ? <span className={styles.badge}>OVERRIDE</span> : null}
            </div>
          );
        })}
      </div>
    </GridCalibrationPanel>
  );

  const referencePanel = (
    <GridCalibrationPanel title="Reference Catalog (labeled — not used for extraction)">
      <img
        src={resolveExperienceLabIconSourceLabeledUrl()}
        alt="Labeled reference catalog"
        style={{ width: '100%', borderRadius: 6, border: '1px solid rgba(197,160,89,0.2)' }}
      />
      <p style={{ fontSize: 8, marginTop: 8, color: 'rgba(240,235,227,0.6)' }}>
        Use labeled sheet only to identify semantic row/column positions. Production generator reads unlabeled source only.
      </p>
    </GridCalibrationPanel>
  );

  const historyPanel = (
    <GridCalibrationPanel title="Calibration History">
      <p style={{ fontSize: 8 }}>Undo stack: {undoStack.length} · Redo stack: {redoStack.length}</p>
      <ul style={{ fontSize: 8, paddingLeft: 16, margin: 0 }}>
        {undoStack.slice(-8).reverse().map((h, i) => (
          <li key={i}>{h.label} — {h.calibration.updatedAt}</li>
        ))}
      </ul>
    </GridCalibrationPanel>
  );

  const activeControls =
    mode === 'grid' ? boundaryControls
    : mode === 'row' ? rowControls
    : mode === 'column' ? columnControls
    : mode === 'cell' ? cellControls
    : mode === 'preview' ? previewPanel
    : mode === 'reference' ? referencePanel
    : historyPanel;

  const saveDraft = () => {
    saveGridCalibrationDraft({ ...calibration, canonical: false });
    setStatus('Draft saved to localStorage');
  };

  const saveCanonical = () => {
    if (!validation.ok) {
      setStatus(`Cannot save canonical: ${validation.errors.join('; ')}`);
      return;
    }
    const next = { ...calibration, canonical: true, calibrationVersion: `studio-world-icon-grid-calibration-v${Date.now()}` };
    saveGridCalibrationDraft(next);
    setCalibration(next);
    setStatus('Canonical calibration saved locally — run generator + publish to deploy');
  };

  const resetGrid = () => {
    commitCalibration(createDefaultGridCalibration({ canonical: false }), 'reset entire grid');
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = importCalibrationJson(String(reader.result));
        commitCalibration(imported, 'import JSON');
        setStatus('Imported calibration JSON');
      } catch {
        setStatus('Import failed — invalid JSON');
      }
    };
    reader.readAsText(file);
  };

  const handlePublish = () => {
    if (!publishConfirm) {
      setPublishConfirm(true);
      setStatus('Confirm publish — click PUBLISH again');
      return;
    }
    setPublishConfirm(false);
    setStatus('Publish queued — commit calibration JSON + run experience-lab:build-icons on deploy');
  };

  const selectedCellRect = resolveStudioWorldIconCalibratedCellRect(calibration, primaryCell.row, primaryCell.column);
  const sourceCellStyle: React.CSSProperties = {
    width: 180,
    height: Math.round((selectedCellRect.height / selectedCellRect.width) * 180),
    backgroundImage: `url(${resolveExperienceLabIconSourceUnlabeledUrl()})`,
    backgroundSize: `${calibration.sourceWidth * (180 / selectedCellRect.width)}px auto`,
    backgroundPosition: `-${selectedCellRect.left * (180 / selectedCellRect.width)}px -${selectedCellRect.top * (180 / selectedCellRect.width)}px`,
    backgroundRepeat: 'no-repeat',
    border: '1px solid rgba(197,160,89,0.3)',
    borderRadius: 4,
  };

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <h1 className={styles.title}>Studio World Icon Grid Calibration Editor</h1>
        <div className={styles.actions}>
          <button type="button" className={styles.btn} onClick={undo} disabled={!undoStack.length}>Undo</button>
          <button type="button" className={styles.btn} onClick={redo} disabled={!redoStack.length}>Redo</button>
          <button type="button" className={styles.btn} onClick={saveDraft}>Save Draft</button>
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={saveCanonical}>Save Canonical</button>
          <button type="button" className={styles.btn} onClick={() => fileInputRef.current?.click()}>Import JSON</button>
          <button type="button" className={styles.btn} onClick={() => {
            const blob = new Blob([exportCalibrationJson(calibration)], { type: 'application/json' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'studio-world-icon-grid-calibration.json';
            a.click();
          }}>Export JSON</button>
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={handlePublish}>Publish to Experience Lab V2</button>
          <button type="button" className={`${styles.btn} ${styles.btnDanger}`} onClick={resetGrid}>Reset Grid</button>
        </div>
        <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleImport(f);
        }} />
      </header>

      <nav className={styles.tabs} aria-label="Calibration modes">
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            className={`${styles.tab}${mode === m ? ` ${styles.tabActive}` : ''}`}
            onClick={() => setMode(m)}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </nav>

      <div className={styles.statusBar}>
        <span>{status}</span>
        <span>Validation: {validation.ok ? 'OK' : validation.errors.join(', ')}</span>
        <span>Version: {calibration.calibrationVersion}</span>
        <span>Canonical: {calibration.canonical ? 'yes' : 'draft'}</span>
        <span>Mode: {EXPERIENCE_LAB_ICON_SPRITE_CONFIG.mode}</span>
      </div>

      <div className={`${styles.layout}${isMobile ? ` ${styles.layoutMobile}` : ''}`}>
        <div className={styles.sourceWrap}>
          <img
            ref={(el) => setSourceImg(el)}
            className={styles.sourceImg}
            src={resolveExperienceLabIconSourceUnlabeledUrl()}
            alt="Unlabeled icon source pack"
            draggable={false}
            onLoad={() => setSourceImg((prev) => prev)}
          />
          {renderGridOverlay(sourceImg)}
        </div>

        <div className={styles.controlsCol}>
          <GridCalibrationPanel title="Selected Cell Preview">
            <div style={sourceCellStyle} />
            {EXPERIENCE_LAB_ICON_ASSETS[primaryKey as keyof typeof EXPERIENCE_LAB_ICON_ASSETS]?.src ? (
              <img
                src={EXPERIENCE_LAB_ICON_ASSETS[primaryKey as keyof typeof EXPERIENCE_LAB_ICON_ASSETS].src}
                alt="Generated runtime icon"
                style={{ width: 96, height: 96, marginTop: 8, objectFit: 'contain', background: '#0e1016' }}
              />
            ) : null}
            <p style={{ fontSize: 8, marginTop: 6 }}>{EXPERIENCE_LAB_ICON_REGISTRY[primaryKey as keyof typeof EXPERIENCE_LAB_ICON_REGISTRY]?.sourceLabel ?? primaryKey}</p>
          </GridCalibrationPanel>
          {activeControls}
        </div>

        {!isMobile ? (
          <div className={styles.controlsCol}>
            <GridCalibrationPanel title="64-Icon Contact Sheet">
              <img src={contactSheetUrl} alt="Generated contact sheet" style={{ width: '100%', borderRadius: 6 }} />
            </GridCalibrationPanel>
            <GridCalibrationPanel title="Founder Priority Icons">
              <div className={styles.sheetRow}>
                {['experienceLab', 'blueprint', 'construction', 'materials', 'lighting', 'camera', 'analytics', 'permissions', 'playback', 'perspective', 'terminal', 'dashboard', 'attachments', 'team', 'diagnostics'].map((key) => {
                  const asset = EXPERIENCE_LAB_ICON_ASSETS[key as keyof typeof EXPERIENCE_LAB_ICON_ASSETS];
                  return (
                    <div key={key} className={styles.sheetThumb}>
                      {asset?.src ? <img src={asset.src} alt={key} /> : null}
                      <div className={styles.sheetLabel}>{EXPERIENCE_LAB_ICON_REGISTRY[key as keyof typeof EXPERIENCE_LAB_ICON_REGISTRY]?.sourceLabel ?? key}</div>
                    </div>
                  );
                })}
              </div>
            </GridCalibrationPanel>
          </div>
        ) : null}
      </div>

      {isMobile ? (
        <div className={styles.mobileSheet}>
          <GridCalibrationPanel title="Mobile Controls">
            {activeControls}
          </GridCalibrationPanel>
        </div>
      ) : null}
    </div>
  );
}
