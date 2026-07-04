import type { BlueprintDependencyNode } from '../../../../utils/adminStudioBlueprintManagerDemo';
import { BP_VISUAL, bpCaption, bpPanelStyle } from './blueprintManagerTheme';

type BlueprintDependencyGraphProps = {
  nodes: BlueprintDependencyNode[];
};

export function BlueprintDependencyGraph({ nodes }: BlueprintDependencyGraphProps) {
  const ordered = [...nodes].reverse();

  return (
    <div style={{ ...bpPanelStyle, padding: '12px' }}>
      <div className="flex flex-col items-center gap-1">
        {ordered.map((node, idx) => (
          <div key={node.id} className="flex flex-col items-center w-full">
            <div
              className="w-full text-center py-2 px-3"
              style={{
                border: `1.3px solid ${idx === 0 ? BP_VISUAL.red : BP_VISUAL.border}`,
                background: idx === 0 ? 'rgba(235,28,36,0.06)' : 'rgba(255,255,255,0.9)',
              }}
            >
              <p style={{ ...bpCaption, color: BP_VISUAL.black, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
                {node.label}
              </p>
            </div>
            {idx < ordered.length - 1 ? (
              <p style={{ ...bpCaption, color: BP_VISUAL.gray, margin: '4px 0', fontSize: '10px' }}>↓ REQUIRES</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
