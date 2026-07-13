import type { RoomAssemblyState } from '../../../../studio-os-core/founder-review';

type Props = {
  assembly: RoomAssemblyState;
};

/** Live Room Assembly — founder watches the world assemble. */
export function LiveRoomAssemblyPanel({ assembly }: Props) {
  return (
    <div
      data-live-room-assembly
      style={{
        marginTop: 12,
        padding: 14,
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        borderRadius: 12,
        color: '#e0e7ff',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <p style={{ margin: '0 0 8px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em', color: '#a5b4fc' }}>
        LIVE ROOM ASSEMBLY
      </p>
      <p style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600 }}>{assembly.narrative}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {assembly.layers.map((layer) => (
          <span
            key={layer.layerId}
            style={{
              padding: '5px 10px',
              borderRadius: 6,
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.04em',
              background: layer.visible ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)',
              color: layer.visible ? '#fff' : '#6366f1',
              border: layer.layerId === assembly.currentLayerId ? '1px solid #fbbf24' : '1px solid transparent',
              transition: 'all 0.35s ease',
            }}
          >
            {layer.visible ? '✓' : '○'} {layer.label}
          </span>
        ))}
      </div>
      <div
        style={{
          marginTop: 12,
          height: 4,
          borderRadius: 2,
          background: 'rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${assembly.progressPercent}%`,
            background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
            transition: 'width 0.6s ease',
          }}
        />
      </div>
    </div>
  );
}
