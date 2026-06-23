import { useState } from 'react';
import { roundPanelDebugPercent } from '../../utils/desktopPanelDebugMode';
import { useDesktopPanelDebugRequired } from './DesktopPanelDebugProvider';

const btnClass = 'desktop-panel-debug-inspector__btn';

export function DesktopPanelDebugInspector() {
  const editor = useDesktopPanelDebugRequired();
  const [expanded, setExpanded] = useState(true);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const selected = editor.selectedPanelId
    ? editor.panelMap[editor.selectedPanelId]
    : undefined;

  const patchSelected = (field: 'x' | 'y' | 'width' | 'height', raw: string) => {
    if (!editor.selectedPanelId) return;
    const value = Number.parseFloat(raw);
    if (!Number.isFinite(value)) return;
    editor.patchPanel(editor.selectedPanelId, {
      [field]: roundPanelDebugPercent(value),
    });
  };

  const onExport = async () => {
    try {
      await editor.exportPanelMap();
      setExportStatus('Copied to clipboard');
      window.setTimeout(() => setExportStatus(null), 2000);
    } catch {
      setExportStatus('Copy failed');
      window.setTimeout(() => setExportStatus(null), 2000);
    }
  };

  if (!expanded) {
    return (
      <div className="desktop-panel-debug-inspector">
        <div className="desktop-panel-debug-inspector__header">
          <span>PANEL DEBUG MODE</span>
          <button type="button" className={btnClass} onClick={() => setExpanded(true)}>
            Expand
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="desktop-panel-debug-inspector" role="region" aria-label="Panel debug inspector">
      <div className="desktop-panel-debug-inspector__header">
        <span>PANEL DEBUG MODE — {editor.sceneId.toUpperCase()}</span>
        <button
          type="button"
          className={[
            btnClass,
            'desktop-panel-debug-inspector__toggle',
            editor.overlaysVisible
              ? 'desktop-panel-debug-inspector__toggle--on'
              : 'desktop-panel-debug-inspector__toggle--off',
          ].join(' ')}
          onClick={() => editor.setOverlaysVisible(!editor.overlaysVisible)}
        >
          DEBUG PANELS: {editor.overlaysVisible ? 'ON' : 'OFF'}
        </button>
        <button type="button" className={`${btnClass} desktop-panel-debug-inspector__btn--primary`} onClick={onExport}>
          EXPORT PANEL MAP
        </button>
        {exportStatus ? <span>{exportStatus}</span> : null}
        <button type="button" className={btnClass} onClick={editor.resetPanelMap}>
          Reset
        </button>
        <button type="button" className={btnClass} onClick={() => setExpanded(false)}>
          Collapse
        </button>
      </div>

      <div className="desktop-panel-debug-inspector__body">
        <div className="desktop-panel-debug-inspector__row">
          <label className="desktop-panel-debug-inspector__field">
            Panel
            <select
              value={editor.selectedPanelId ?? ''}
              onChange={(e) => editor.selectPanel(e.target.value)}
            >
              {editor.panels.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {selected ? (
          <div className="desktop-panel-debug-inspector__row">
            {(['x', 'y', 'width', 'height'] as const).map((field) => (
              <label key={field} className="desktop-panel-debug-inspector__field">
                {field}
                <input
                  type="number"
                  step="0.1"
                  value={selected[field]}
                  onChange={(e) => patchSelected(field, e.target.value)}
                />
              </label>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
