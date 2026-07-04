type Props = {
  nodes: string[];
};

/** Animated workflow diagram — horizontal pipeline with pulse on active flow. */
export function ManualWorkflowStrip({ nodes }: Props) {
  return (
    <div
      className="studio-manual-workflow-strip"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
        alignItems: 'center',
        marginBottom: '10px',
        padding: '8px',
        border: '1px solid rgba(0,0,0,0.12)',
        borderRadius: '4px',
        background: 'rgba(255,255,255,0.5)',
      }}
    >
      {nodes.map((node, i) => (
        <span key={`${node}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span
            className="studio-manual-workflow-node"
            style={{
              fontFamily: '"Futura PT Medium"',
              fontSize: '8px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#EB1C24',
              padding: '4px 6px',
              border: '1px solid #EB1C24',
              borderRadius: '3px',
              animation: `studioManualWorkflowPulse 2s ease-in-out ${i * 0.15}s infinite`,
            }}
          >
            {node}
          </span>
          {i < nodes.length - 1 ? (
            <span style={{ color: '#808080', fontSize: '10px' }} aria-hidden="true">
              →
            </span>
          ) : null}
        </span>
      ))}
      <style>{`
        @keyframes studioManualWorkflowPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 rgba(235,28,36,0); }
          50% { opacity: 0.85; box-shadow: 0 0 8px rgba(235,28,36,0.35); }
        }
      `}</style>
    </div>
  );
}
