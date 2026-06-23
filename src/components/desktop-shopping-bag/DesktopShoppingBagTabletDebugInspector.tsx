import { useState } from 'react';
import { roundPanelDebugPercent } from '../../utils/desktopPanelDebugMode';
import { useDesktopShoppingBagTabletDebugRequired } from './DesktopShoppingBagTabletDebugProvider';
import './DesktopShoppingBagTabletDebug.css';

const btnClass = 'desktop-shopping-bag-tablet-debug-inspector__btn';

export function DesktopShoppingBagTabletDebugInspector() {
  const editor = useDesktopShoppingBagTabletDebugRequired();
  const [expanded, setExpanded] = useState(true);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  if (!editor.debugEnabled) return null;

  const patchField = (field: 'x' | 'y' | 'width' | 'height', raw: string) => {
    const value = Number.parseFloat(raw);
    if (!Number.isFinite(value)) return;
    editor.patchRect({ [field]: roundPanelDebugPercent(value) });
  };

  const onExport = async () => {
    try {
      await editor.exportRect();
      setExportStatus('Copied to clipboard');
      window.setTimeout(() => setExportStatus(null), 2000);
    } catch {
      setExportStatus('Copy failed');
      window.setTimeout(() => setExportStatus(null), 2000);
    }
  };

  if (!expanded) {
    return (
      <div className="desktop-shopping-bag-tablet-debug-inspector">
        <div className="desktop-shopping-bag-tablet-debug-inspector__header">
          <span>SHOPPING BAG TABLET DEBUG</span>
          <button type="button" className={btnClass} onClick={() => setExpanded(true)}>
            Expand
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="desktop-shopping-bag-tablet-debug-inspector"
      role="region"
      aria-label="Shopping bag tablet debug inspector"
    >
      <div className="desktop-shopping-bag-tablet-debug-inspector__header">
        <span>SHOPPING BAG TABLET DEBUG</span>
        <button
          type="button"
          className={[
            btnClass,
            'desktop-shopping-bag-tablet-debug-inspector__toggle',
            editor.overlayVisible
              ? 'desktop-shopping-bag-tablet-debug-inspector__toggle--on'
              : 'desktop-shopping-bag-tablet-debug-inspector__toggle--off',
          ].join(' ')}
          onClick={() => editor.setOverlayVisible(!editor.overlayVisible)}
        >
          TABLET RECT: {editor.overlayVisible ? 'ON' : 'OFF'}
        </button>
        <button
          type="button"
          className={`${btnClass} desktop-shopping-bag-tablet-debug-inspector__btn--primary`}
          onClick={() => void onExport()}
        >
          EXPORT TABLET RECT
        </button>
        {exportStatus ? <span>{exportStatus}</span> : null}
        <button type="button" className={btnClass} onClick={editor.resetRect}>
          Reset
        </button>
        <button type="button" className={btnClass} onClick={() => setExpanded(false)}>
          Collapse
        </button>
      </div>

      <div className="desktop-shopping-bag-tablet-debug-inspector__body">
        <div className="desktop-shopping-bag-tablet-debug-inspector__row">
          {(['x', 'y', 'width', 'height'] as const).map((field) => (
            <label key={field} className="desktop-shopping-bag-tablet-debug-inspector__field">
              {field}
              <input
                type="number"
                step="0.1"
                value={editor.percentRect[field]}
                onChange={(e) => patchField(field, e.target.value)}
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
