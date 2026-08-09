type Props = {
  estimatedMinutes: number;
  onStart: () => void;
  onMaybeLater: () => void;
};

export function TutorialWelcomePrompt({ estimatedMinutes, onStart, onMaybeLater }: Props) {
  return (
    <div className="tutorial-os-welcome-backdrop" role="dialog" aria-modal="true" aria-label="WELCOME TO FRONTAL SLAYER!">
      <div className="tutorial-os-welcome-card">
        <p
          style={{
            fontFamily: '"Futura PT Medium"',
            fontSize: '9px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#808080',
            marginBottom: '6px',
          }}
        >
          ONBOARDING TUTORIAL
        </p>
        <h2
          style={{
            fontFamily: '"Futura PT Medium"',
            fontSize: '15px',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#EB1C24',
            marginBottom: '10px',
          }}
        >
          WELCOME TO FRONTAL SLAYER!
        </h2>
        <p
          style={{
            fontFamily: '"Futura PT Book"',
            fontSize: '11px',
            lineHeight: 1.5,
            textTransform: 'uppercase',
            color: '#1A1A1A',
            marginBottom: '6px',
          }}
        >
          TAKE THE GUIDED TOUR WITH OUR CONCIERGE?
        </p>
        <p
          style={{
            fontFamily: '"Futura PT Medium"',
            fontSize: '10px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#808080',
            marginBottom: '18px',
          }}
        >
          ESTIMATED TIME: {estimatedMinutes} MINUTES
        </p>
        <div className="flex flex-col gap-2">
          <button type="button" onClick={onStart} className="tutorial-os-welcome-btn tutorial-os-welcome-btn--primary">
            START TOUR
          </button>
          <button type="button" onClick={onMaybeLater} className="tutorial-os-welcome-btn">
            MAYBE LATER
          </button>
        </div>
      </div>
      <style>{`
        .tutorial-os-welcome-btn {
          font-family: "Futura PT Medium", sans-serif;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 12px 16px;
          border-radius: 4px;
          border: 1.3px solid #0a0a0a;
          background: rgba(255,255,255,0.65);
          cursor: pointer;
          width: 100%;
        }
        .tutorial-os-welcome-btn--primary {
          background: #fff;
          color: #EB1C24;
          border-color: #EB1C24;
        }
      `}</style>
    </div>
  );
}
