import type { CSSProperties } from 'react';
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

/** Fixed controls for drag/resize scene hit QA squares (`?sceneHitDebug=1&sceneHitEdit=1`). */
export function SceneHitLayoutEditorPanel() {
  const hitDebug = useSceneHitDebugEnabled();
  const editEnabled = useSceneHitEditEnabled();
  const {
    saveOverrides,
    resetOverrides,
    copyOverridesJson,
    hasUnsavedChanges,
    hasSavedOverrides,
    regions,
  } = useSceneHitLayoutEditor();

  if (!hitDebug || !editEnabled) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: 8,
        right: 8,
        bottom: 8,
        zIndex: 999999,
        maxWidth: 420,
        margin: '0 auto',
        padding: '8px 10px',
        fontFamily: 'monospace',
        fontSize: 10,
        lineHeight: 1.4,
        color: '#000',
        background: 'rgba(255, 255, 255, 0.96)',
        border: '1px solid rgba(0, 0, 0, 0.35)',
        borderRadius: 6,
        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
        pointerEvents: 'auto',
      }}
    >
      <p style={{ margin: '0 0 6px 0', fontWeight: 700 }}>Scene hit editor</p>
      <p style={{ margin: '0 0 8px 0' }}>
        Drag a square to move. Drag the white corner handle to resize/crop. Save stores tuning in this
        browser (localStorage) and applies to production hit targets.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        <button type="button" style={panelButtonStyle} onClick={saveOverrides}>
          Save
        </button>
        <button type="button" style={panelButtonStyle} onClick={resetOverrides}>
          Reset
        </button>
        <button type="button" style={panelButtonStyle} onClick={() => void copyOverridesJson()}>
          Copy JSON
        </button>
      </div>
      <p style={{ margin: 0, opacity: 0.85 }}>
        {hasUnsavedChanges ? 'Unsaved edits — tap Save.' : hasSavedOverrides ? 'Saved overrides loaded.' : 'Using code defaults.'}
      </p>
      <ul style={{ margin: '6px 0 0 0', paddingLeft: 16 }}>
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
