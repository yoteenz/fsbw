export function SlayChallengeRoseBullet({
  children,
  completed = false,
}: {
  children: string;
  completed?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '4px', textAlign: 'left' }}>
      <img
        src="/assets/rose-alert.svg"
        alt=""
        style={{
          width: '12px',
          height: '12px',
          marginTop: '2px',
          flexShrink: 0,
          opacity: completed ? 1 : 0.35,
        }}
      />
      <p
        style={{
          fontFamily: '"Futura PT Book"',
          color: completed ? '#000000' : '#808080',
          fontSize: '10px',
          margin: 0,
          lineHeight: 1.45,
          textTransform: 'uppercase',
          textAlign: 'left',
        }}
      >
        {children}
      </p>
    </div>
  );
}

export function SlayChallengeBohemySubhead({ children }: { children: string }) {
  return (
    <p
      style={{
        fontFamily: '"Bohemy", cursive',
        color: '#000000',
        fontSize: '18px',
        margin: '8px 0 4px 0',
        lineHeight: 1.1,
        textTransform: 'lowercase',
        fontWeight: 400,
        textAlign: 'left',
      }}
    >
      {children}
    </p>
  );
}
