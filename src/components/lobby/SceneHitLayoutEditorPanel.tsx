import { useState, type CSSProperties } from 'react';
import { useSceneHitDebugEnabled, useSceneHitEditEnabled } from '../../utils/sceneHitDebug';
import { SCENE_HIT_REGION_IDS, SCENE_HIT_REGION_LABELS } from '../../utils/sceneHitRegionDefaults';
import { useSceneHitLayoutEditor } from './SceneHitLayoutEditorContext';

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
  top: 8,
  right: 8,
  zIndex: 999999,
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

/** Fixed controls for drag/resize scene hit QA squares (`?sceneHitDebug=1&sceneHitEdit=1`). */
export function SceneHitLayoutEditorPanel() {
  const hitDebug = useSceneHitDebugEnabled();
  const editEnabled = useSceneHitEditEnabled();
  const [expanded, setExpanded] = useState(false);
  const {
    saveOverrides,
    resetOverrides,
    copyOverridesJson,
    hasUnsavedChanges,
    hasSavedOverrides,
    regions,
  } = useSceneHitLayoutEditor();

  if (!hitDebug || !editEnabled) return null;

  const statusLabel = hasUnsavedChanges
    ? 'Unsaved'
    : hasSavedOverrides
      ? 'Saved'
      : 'Defaults';

  const actionButtons = (
    <>
      <button type="button" style={panelButtonStyle} onClick={saveOverrides}>
        Save
      </button>
      <button type="button" style={panelButtonStyle} onClick={resetOverrides}>
        Reset
      </button>
      <button type="button" style={panelButtonStyle} onClick={() => void copyOverridesJson()}>
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
          flexWrap: 'wrap',
          gap: 6,
          padding: '6px 8px',
          maxWidth: 'calc(100vw - 16px)',
        }}
      >
        <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Scene hit</span>
        <span
          style={{
            padding: '2px 6px',
            borderRadius: 999,
            background: hasUnsavedChanges ? '#ffe08a' : hasSavedOverrides ? '#c8f7c5' : '#eee',
            whiteSpace: 'nowrap',
          }}
        >
          {statusLabel}
        </span>
        {actionButtons}
        <button
          type="button"
          style={panelButtonStyle}
          onClick={() => setExpanded(true)}
          title="Show region details"
        >
          Details ▾
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        ...shellStyle,
        width: 'min(360px, calc(100vw - 16px))',
        maxHeight: 'min(280px, calc(100vh - 16px))',
        display: 'flex',
        flexDirection: 'column',
        padding: '8px 10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
        <p style={{ margin: 0, fontWeight: 700, flex: 1 }}>Scene hit editor</p>
        <button
          type="button"
          style={{ ...panelButtonStyle, flexShrink: 0 }}
          onClick={() => setExpanded(false)}
          title="Minimize panel"
        >
          Minimize ▴
        </button>
      </div>
      <p style={{ margin: '0 0 8px 0' }}>
        Drag squares to move; drag any corner to resize. Save applies to production hits.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {actionButtons}
      </div>
      <p style={{ margin: 0, opacity: 0.85 }}>
        {hasUnsavedChanges ? 'Unsaved edits — tap Save.' : hasSavedOverrides ? 'Saved overrides loaded.' : 'Using code defaults.'}
      </p>
      <ul
        style={{
          margin: '6px 0 0 0',
          paddingLeft: 16,
          overflowY: 'auto',
          flex: 1,
          minHeight: 0,
        }}
      >
        {SCENE_HIT_REGION_IDS.map((id) => {
          const cfg = regions[id];
          const layout = cfg.layout;
          return (
            <li key={id} style={{ marginBottom: 2 }}>
              {SCENE_HIT_REGION_LABELS[id]} — x:{layout.layoutOffsetX ?? 0} y:{layout.layoutOffsetY ?? 0}{' '}
              w+:{layout.layoutWidthExtraPx ?? 0} h+:{layout.layoutHeightExtraPx ?? 0}
              {cfg.coverOffset ? ` cover(${cfg.coverOffset.x},${cfg.coverOffset.y})` : ''}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
