import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRequireStudioWorldAdmin } from '../../../../hooks/useRequireStudioWorldAdmin';
import {
  EXPERIENCE_LAB_ICON_NAMES,
  EXPERIENCE_LAB_ICON_REGISTRY,
  EXPERIENCE_LAB_ICON_SPRITE_CONFIG,
} from '../../../../features/studio-world/icons';
import { resolveExperienceLabIconSourceLabeledUrl } from '../../../../features/studio-world/icons/experience-lab-icon-sprite.config';
import {
  StudioWorldIconCropManifest,
  resolveStudioWorldIconCellBounds,
  STUDIO_WORLD_ICON_CROP_MANIFEST_VERSION,
  STUDIO_WORLD_ICON_SOURCE,
} from '../../../../features/studio-world/icons/studio-world-icon-crop-manifest';
import type { ExperienceLabIconName } from '../../../../features/studio-world/icons/experience-lab-icon-registry';
import {
  CropEditorPanel,
  exportCropPatchFragment,
  loadCropEditorDrafts,
  saveCropEditorDraft,
  styles,
  type CropEditorDraft,
} from '../../../../features/studio-world/icons/ExperienceLabIconCropEditor.shared';

const PRIORITY_KEYS: ExperienceLabIconName[] = [
  'zoomIn',
  'materials',
  'analytics',
  'permissions',
  'camera',
  'playback',
  'perspective',
  'terminal',
  'dashboard',
  'blueprint',
  'construction',
  'lighting',
  'attachments',
  'team',
  'experienceLab',
  'share',
  'diagnostics',
];

function manifestToDraft(
  key: ExperienceLabIconName,
  draft?: CropEditorDraft,
): CropEditorDraft {
  const entry = StudioWorldIconCropManifest[key];
  const cell = resolveStudioWorldIconCellBounds(entry);
  if (draft) return draft;
  return {
    cropLeft: entry.cropX - cell.left,
    cropTop: entry.cropY - cell.top,
    cropRight: entry.cropX - cell.left + entry.cropWidth,
    cropBottom: entry.cropY - cell.top + entry.cropHeight,
    glyphPadding: entry.glyphPadding,
    outputSize: entry.outputSize,
    alphaThreshold: 24,
    approved: entry.approved,
    notes: entry.notes,
  };
}

function cellBackgroundStyle(row: number, column: number, scale = 1): React.CSSProperties {
  const { sourceWidth, sourceHeight, rows, columns } = EXPERIENCE_LAB_ICON_SPRITE_CONFIG;
  const cellW = sourceWidth / columns;
  const cellH = sourceHeight / rows;
  const w = Math.round(cellW * scale);
  const h = Math.round(cellH * scale);
  return {
    width: w,
    height: h,
    backgroundImage: `url(${resolveExperienceLabIconSourceLabeledUrl()})`,
    backgroundSize: `${sourceWidth * scale}px ${sourceHeight * scale}px`,
    backgroundPosition: `-${column * cellW * scale}px -${row * cellH * scale}px`,
    backgroundRepeat: 'no-repeat',
  };
}

async function renderPreview(
  sourceUrl: string,
  cropX: number,
  cropY: number,
  cropW: number,
  cropH: number,
  outputSize: number,
): Promise<string> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.crossOrigin = 'anonymous';
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = sourceUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.clearRect(0, 0, outputSize, outputSize);
  const scale = Math.min(
    (outputSize - 36) / cropW,
    (outputSize - 36) / cropH,
  );
  const dw = Math.max(1, Math.round(cropW * scale));
  const dh = Math.max(1, Math.round(cropH * scale));
  const dx = Math.floor((outputSize - dw) / 2);
  const dy = Math.floor((outputSize - dh) / 2);

  ctx.drawImage(img, cropX, cropY, cropW, cropH, dx, dy, dw, dh);

  const imageData = ctx.getImageData(0, 0, outputSize, outputSize);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const lum = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
    if (lum <= 28) {
      d[i + 3] = 0;
    } else if (lum >= 235) {
      d[i + 3] = 255;
    } else {
      const t = (lum - 28) / (235 - 28);
      d[i + 3] = Math.round(Math.pow(t, 0.72) * 255);
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

/** Dev-only deterministic crop editor — maps glyph rectangles on the labeled master. */
export default function AdminExperienceLabIconCropEditorPage() {
  useRequireStudioWorldAdmin();
  const [selected, setSelected] = useState<ExperienceLabIconName>('zoomIn');
  const [draft, setDraft] = useState<CropEditorDraft>(() =>
    manifestToDraft('zoomIn', loadCropEditorDrafts().zoomIn),
  );
  const [previewUrl, setPreviewUrl] = useState('');
  const [exportText, setExportText] = useState('');
  const [status, setStatus] = useState('');
  const stageScale = 1.4;
  const sourceUrl = resolveExperienceLabIconSourceLabeledUrl();
  const entry = StudioWorldIconCropManifest[selected];
  const cell = resolveStudioWorldIconCellBounds(entry);
  const cellStyle = cellBackgroundStyle(entry.row, entry.column, stageScale);

  const cropStyle = useMemo(() => {
    const left = draft.cropLeft * stageScale;
    const top = draft.cropTop * stageScale;
    const w = (draft.cropRight - draft.cropLeft) * stageScale;
    const h = (draft.cropBottom - draft.cropTop) * stageScale;
    return { left, top, width: w, height: h };
  }, [draft, stageScale]);

  const absoluteCrop = useMemo(
    () => ({
      cropX: cell.left + draft.cropLeft,
      cropY: cell.top + draft.cropTop,
      cropW: Math.max(1, draft.cropRight - draft.cropLeft),
      cropH: Math.max(1, draft.cropBottom - draft.cropTop),
    }),
    [cell.left, cell.top, draft],
  );

  const refreshPreview = useCallback(async () => {
    try {
      const url = await renderPreview(
        sourceUrl,
        absoluteCrop.cropX,
        absoluteCrop.cropY,
        absoluteCrop.cropW,
        absoluteCrop.cropH,
        draft.outputSize,
      );
      setPreviewUrl(url);
    } catch {
      setPreviewUrl('');
    }
  }, [absoluteCrop, draft.outputSize, sourceUrl]);

  useEffect(() => {
    void refreshPreview();
  }, [refreshPreview]);

  const selectIcon = (key: ExperienceLabIconName) => {
    setSelected(key);
    setDraft(manifestToDraft(key, loadCropEditorDrafts()[key]));
    setExportText('');
    setStatus('');
  };

  const updateDraft = (patch: Partial<CropEditorDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
  };

  const resetToCell = () => {
    setDraft({
      cropLeft: 8,
      cropTop: 8,
      cropRight: cell.width - 8,
      cropBottom: Math.floor(cell.height * 0.78),
      glyphPadding: 18,
      outputSize: 512,
      alphaThreshold: 24,
      approved: false,
      notes: 'Reset to cell glyph zone; excludes label band.',
    });
  };

  const onSaveDraft = () => {
    saveCropEditorDraft(selected, draft);
    setStatus(`Draft saved for ${selected}`);
    setExportText(exportCropPatchFragment(selected, draft, cell.left, cell.top));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 4 : 1;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      updateDraft({
        cropLeft: Math.max(0, draft.cropLeft - step),
        cropRight: Math.max(draft.cropLeft + 4, draft.cropRight - step),
      });
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      updateDraft({
        cropLeft: draft.cropLeft + step,
        cropRight: Math.min(cell.width, draft.cropRight + step),
      });
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      updateDraft({
        cropTop: Math.max(0, draft.cropTop - step),
        cropBottom: Math.max(draft.cropTop + 4, draft.cropBottom - step),
      });
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      updateDraft({
        cropTop: draft.cropTop + step,
        cropBottom: Math.min(cell.height, draft.cropBottom + step),
      });
    }
  };

  const idx = EXPERIENCE_LAB_ICON_NAMES.indexOf(selected);
  const prev = EXPERIENCE_LAB_ICON_NAMES[(idx - 1 + 64) % 64];
  const next = EXPERIENCE_LAB_ICON_NAMES[(idx + 1) % 64];

  return (
    <div className={styles.editorRoot} onKeyDown={onKeyDown} tabIndex={0}>
      <header className={styles.header}>
        <h1>Experience Lab Icon Crop Editor</h1>
        <p>
          Manifest {STUDIO_WORLD_ICON_CROP_MANIFEST_VERSION} · source {STUDIO_WORLD_ICON_SOURCE.width}×
          {STUDIO_WORLD_ICON_SOURCE.height} · sha {STUDIO_WORLD_ICON_SOURCE.sha256.slice(0, 12)}… · v2
          pipeline frozen · optical tuning paused
        </p>
      </header>

      <div className={styles.iconPicker}>
        {PRIORITY_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className={`${styles.iconChip} ${selected === key ? styles.iconChipActive : ''}`}
            onClick={() => selectIcon(key)}
          >
            {EXPERIENCE_LAB_ICON_REGISTRY[key].sourceLabel}
          </button>
        ))}
      </div>

      <p style={{ fontSize: 10, opacity: 0.6, marginBottom: 8 }}>
        Selected: <strong>{entry.sourceLabel}</strong> ({selected}) · row {entry.row} col {entry.column}
      </p>

      <div className={styles.grid}>
        <CropEditorPanel title="Source cell">
          <div className={styles.sourceCell} style={cellStyle} />
        </CropEditorPanel>

        <CropEditorPanel title="Crop rectangle">
          <div className={styles.cropStage} style={cellStyle}>
            <div className={styles.cropRect} style={cropStyle} />
          </div>
          <div className={styles.controls}>
            {(
              [
                ['cropLeft', 'Left', 0, cell.width - 8],
                ['cropTop', 'Top', 0, cell.height - 8],
                ['cropRight', 'Right', 4, cell.width],
                ['cropBottom', 'Bottom', 4, cell.height],
                ['glyphPadding', 'Padding', 0, 48],
                ['outputSize', 'Output', 256, 512],
              ] as const
            ).map(([key, label, min, max]) => (
              <label key={key} className={styles.controlRow}>
                <span>{label}</span>
                <input
                  type="range"
                  min={min}
                  max={max}
                  value={draft[key]}
                  onChange={(e) => updateDraft({ [key]: Number(e.target.value) } as Partial<CropEditorDraft>)}
                />
                <span>{draft[key]}</span>
              </label>
            ))}
          </div>
        </CropEditorPanel>

        <CropEditorPanel title="Transparent preview">
          <div className={styles.previewBox}>
            {previewUrl ? (
              <img src={previewUrl} alt="" className={styles.previewImg} draggable={false} />
            ) : null}
          </div>
          <label className={styles.controlRow} style={{ marginTop: 10 }}>
            <span>Approved</span>
            <input
              type="checkbox"
              checked={draft.approved}
              onChange={(e) => updateDraft({ approved: e.target.checked })}
            />
            <span>{draft.approved ? 'yes' : 'no'}</span>
          </label>
        </CropEditorPanel>
      </div>

      <div className={styles.toolbar}>
        <button type="button" className={styles.btn} onClick={() => selectIcon(prev)}>
          Previous
        </button>
        <button type="button" className={styles.btn} onClick={() => selectIcon(next)}>
          Next
        </button>
        <button type="button" className={styles.btn} onClick={resetToCell}>
          Reset to cell
        </button>
        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={onSaveDraft}>
          Save draft
        </button>
        <button
          type="button"
          className={styles.btn}
          onClick={() => {
            setExportText(exportCropPatchFragment(selected, draft, cell.left, cell.top));
            setStatus('Export fragment ready — merge via apply-studio-world-icon-crop-patch.mjs');
          }}
        >
          Copy export fragment
        </button>
        <a className={styles.btn} href="/admin/studio/experience-lab-icon-qa">
          Open QA
        </a>
      </div>

      {status ? <p className={styles.status}>{status}</p> : null}
      {exportText ? (
        <textarea className={styles.exportBox} readOnly value={exportText} rows={6} />
      ) : null}
    </div>
  );
}
