import { useState, type CSSProperties } from 'react';
import {
  useDesktopLoungeTvDebugEnabled,
  useDesktopLoungeTvEditEnabled,
} from '../../utils/desktopLoungeTvFrameDebug';
import { useDesktopLoungeTvFrameEditor } from './DesktopLoungeTvFrameEditorContext';

const panelButtonStyle: CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 10,
  padding: '4px 8px',
  border: '1px solid rgba(0,0,0,0.35)',
  borderRadius: 4,
  background: '#fff',
  cursor: 'pointer',
};

const shellStyle: CSSProperties = {
  position: 'fixed',
  bottom: 8,
  right: 8,
  zIndex: 100002,
  fontFamily: 'monospace',
  fontSize: 10,
  lineHeight: 1.4,
  color: '#000',
  background: 'rgba(255, 255, 255, 0.96)',
  border: '1px solid rgba(0, 0, 0, 0.35)',
  borderRadius: 6,
  boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
  pointerEvents: 'auto',
};

/** QA panel for desktop lounge TV frame (`?desktopLoungeTvDebug=1&desktopLoungeTvEdit=1`). */
export function DesktopLoungeTvFrameEditorPanel() {
  const debugEnabled = useDesktopLoungeTvDebugEnabled();
  const editEnabled = useDesktopLoungeTvEditEnabled();
  const editor = useDesktopLoungeTvFrameEditor();
  const [expanded, setExpanded] = useState(false);

  if (!debugEnabled || !editEnabled || !editor) return null;

  const statusLabel = editor.hasUnsavedChanges
    ? 'Unsaved'
    : editor.hasSavedOverrides
      ? 'Saved'
      : 'Defaults';

  const actionButtons = (
    <>
      <button type="button" style={panelButtonStyle} onClick={editor.saveOverrides}>
        Save
      </button>
      <button type="button" style={panelButtonStyle} onClick={editor.resetOverrides}>
        Reset
      </button>
      <button type="button" style={panelButtonStyle} onClick={() => void editor.copyOverridesJson()}>
        Copy JSON
      </button>
    </>
  );

  if (!expanded) {
    return (
      <div
        style={{
          ...shellStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 6,
          padding: '6px 8px',
          maxWidth: 'calc(100vw - 16px)',
        }}
      >
        <span>TV frame · {statusLabel}</span>
        <button type="button" style={panelButtonStyle} onClick={() => setExpanded(true)}>
          Expand
        </button>
        {actionButtons}
      </div>
    );
  }

  const { rect, layout } = editor.config;

  return (
    <div style={{ ...shellStyle, padding: '8px 10px', maxWidth: 320 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <strong>Desktop lounge TV frame</strong>
        <button type="button" style={panelButtonStyle} onClick={() => setExpanded(false)}>
          Collapse
        </button>
      </div>
      <p style={{ margin: '0 0 6px' }}>
        Tap the amber square on the TV, then drag center or corners/edges. PRESS TO PLAY is centered inside
        the frame as an alignment guide.
      </p>
      <p style={{ margin: '0 0 6px' }}>
        <code>?desktopLoungeTvDebug=1&amp;desktopLoungeTvEdit=1</code>
      </p>
      <div style={{ marginBottom: 6, opacity: 0.85 }}>
        rect: L {rect.left.toFixed(3)} T {rect.top.toFixed(3)} W {rect.width.toFixed(3)} H{' '}
        {rect.height.toFixed(3)}
        <br />
        layout: Δx {layout.layoutOffsetX ?? 0}px Δy {layout.layoutOffsetY ?? 0}px W+
        {layout.layoutWidthExtraPx ?? 0}px H+{layout.layoutHeightExtraPx ?? 0}px
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {actionButtons}
      </div>
      <div style={{ marginTop: 6, opacity: 0.75 }}>Status: {statusLabel}</div>
    </div>
  );
}
