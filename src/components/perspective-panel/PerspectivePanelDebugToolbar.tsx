import { useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  getPerspectivePanelsForPage,
  PERSPECTIVE_PANEL_DEFINITIONS,
  PERSPECTIVE_PANEL_BY_ID,
} from '../../constants/perspectivePanelConfig';
import type { PerspectivePanelId } from '../../types/perspectivePanel';
import { canAccessPageDebugMode } from '../../utils/adminAuth';
import { usePerspectivePanelDebug } from './PerspectivePanelDebugProvider';
import './perspectivePanelDebug.css';

export function PerspectivePanelDebugToolbar() {
  const editor = usePerspectivePanelDebug();
  const [collapsed, setCollapsed] = useState(true);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const pagePanels = useMemo(() => {
    if (!editor?.currentPage) return PERSPECTIVE_PANEL_DEFINITIONS;
    return getPerspectivePanelsForPage(editor.currentPage);
  }, [editor?.currentPage]);

  const selectedQuad = editor?.resolveQuad(editor.selectedPanelId);

  const onCopy = useCallback(async () => {
    if (!editor) return;
    const ok = await editor.copyJson();
    setCopyStatus(ok ? 'Copied JSON to clipboard.' : 'Copy failed.');
    window.setTimeout(() => setCopyStatus(null), 2200);
  }, [editor]);

  const onImport = useCallback(() => {
    if (!editor) return;
    const ok = editor.importJson(importText);
    setImportStatus(ok ? 'Import applied.' : 'Invalid JSON.');
    if (ok) {
      setImportOpen(false);
      setImportText('');
    }
    window.setTimeout(() => setImportStatus(null), 2200);
  }, [editor, importText]);

  if (!editor?.debugEnabled) return null;

  const panel = PERSPECTIVE_PANEL_BY_ID[editor.selectedPanelId];

  return createPortal(
    <div
      className={[
        'perspective-panel-debug-toolbar',
        collapsed ? 'perspective-panel-debug-toolbar--collapsed' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="region"
      aria-label="Panel debug"
    >
      <header className="perspective-panel-debug-toolbar__header">
        <button
          type="button"
          className="perspective-panel-debug-toolbar__collapse"
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
        >
          PANEL DEBUG
        </button>
        <button
          type="button"
          className="perspective-panel-debug-toolbar__toggle"
          onClick={() => editor.setOverlaysVisible(!editor.overlaysVisible)}
        >
          {editor.overlaysVisible ? 'Hide' : 'Show'}
        </button>
      </header>

      {!collapsed ? (
        <div className="perspective-panel-debug-toolbar__body">
          <label className="perspective-panel-debug-toolbar__field">
            <span>Panel</span>
            <select
              value={editor.selectedPanelId}
              onChange={(e) => editor.selectPanel(e.target.value as PerspectivePanelId)}
            >
              {pagePanels.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          <label className="perspective-panel-debug-toolbar__check">
            <input
              type="checkbox"
              checked={editor.editAll}
              onChange={(e) => editor.setEditAll(e.target.checked)}
            />
            Edit all panels
          </label>

          {selectedQuad ? (
            <div className="perspective-panel-debug-toolbar__coords">
              <div>
                <strong>TL</strong> {selectedQuad.topLeft.x.toFixed(4)}, {selectedQuad.topLeft.y.toFixed(4)}
              </div>
              <div>
                <strong>TR</strong> {selectedQuad.topRight.x.toFixed(4)}, {selectedQuad.topRight.y.toFixed(4)}
              </div>
              <div>
                <strong>BR</strong> {selectedQuad.bottomRight.x.toFixed(4)}, {selectedQuad.bottomRight.y.toFixed(4)}
              </div>
              <div>
                <strong>BL</strong> {selectedQuad.bottomLeft.x.toFixed(4)}, {selectedQuad.bottomLeft.y.toFixed(4)}
              </div>
            </div>
          ) : null}

          <div className="perspective-panel-debug-toolbar__actions">
            <button type="button" onClick={() => editor.resetSelectedPanel()}>
              Reset
            </button>
            <button type="button" onClick={() => void onCopy()}>
              Copy
            </button>
            <button type="button" onClick={() => setImportOpen((v) => !v)}>
              Import
            </button>
            <button
              type="button"
              className="perspective-panel-debug-toolbar__save"
              onClick={() => editor.save()}
            >
              Save
            </button>
          </div>

          {importOpen ? (
            <div className="perspective-panel-debug-toolbar__import">
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste panel JSON…"
                rows={3}
              />
              <button type="button" onClick={onImport}>
                Apply
              </button>
            </div>
          ) : null}

          {editor.saveStatus === 'saved' ? (
            <p className="perspective-panel-debug-toolbar__status">
              Saved{canAccessPageDebugMode() ? ' (syncing across devices)' : ''}.
            </p>
          ) : null}
          {editor.saveStatus === 'failed' ? (
            <p className="perspective-panel-debug-toolbar__status perspective-panel-debug-toolbar__status--error">
              Save failed.
            </p>
          ) : null}
          {copyStatus ? <p className="perspective-panel-debug-toolbar__status">{copyStatus}</p> : null}
          {importStatus ? <p className="perspective-panel-debug-toolbar__status">{importStatus}</p> : null}

          <p className="perspective-panel-debug-toolbar__hint">
            Page: <code>{editor.currentPage ?? 'none'}</code> · Selected:{' '}
            <code>{panel?.label ?? editor.selectedPanelId}</code>
          </p>
        </div>
      ) : null}
    </div>,
    document.body,
  );
}
