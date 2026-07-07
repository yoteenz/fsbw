import { useEffect, useRef, useState } from 'react';
import { ORB_ANIMATION_CSS, ORB_VISUAL } from './studioOrbTheme';
import { useStudioOrb } from './StudioOrbProvider';

const PHASE_MS = [1200, 1600, 1400, 1800, 1200];

/** Awakening Sequence™ — one-time cinematic Studio Intelligence introduction. */
export function StudioOrbAwakeningOverlay() {
  const { awakeningActive, completeAwakening } = useStudioOrb();
  const [phase, setPhase] = useState(0);
  const completeRef = useRef(completeAwakening);

  completeRef.current = completeAwakening;

  useEffect(() => {
    if (!awakeningActive) {
      setPhase(0);
      return;
    }

    if (phase >= PHASE_MS.length) {
      completeRef.current();
      return;
    }

    const id = window.setTimeout(() => setPhase((p) => p + 1), PHASE_MS[phase]);
    return () => window.clearTimeout(id);
  }, [awakeningActive, phase]);

  if (!awakeningActive) return null;

  const messages = [
    'STUDIO INTELLIGENCE · AWAKENING',
    'CRYSTAL FORMING',
    'GLASS REFRACTION',
    'INTELLIGENCE ONLINE',
    'YOUR HEADQUARTERS IS READY',
  ];

  return (
    <>
      <style>{ORB_ANIMATION_CSS}</style>
      <div
        className="fixed inset-0 z-[100060] flex flex-col items-center justify-center"
        style={{
          background: phase < 2 ? 'rgba(10,10,12,0.92)' : 'rgba(255,255,255,0.88)',
          transition: 'background 1.2s ease',
          animation: 'studio-orb-awaken-fade 0.8s ease-out',
        }}
        aria-live="polite"
        aria-busy="true"
      >
        {phase >= 1 ? (
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              position: 'relative',
              animation: phase >= 3 ? 'studio-orb-awaken-ignite 1.4s ease-out forwards' : undefined,
            }}
          >
            <span
              className="studio-orb-crystal"
              style={{
                display: 'block',
                width: '100%',
                height: '100%',
                opacity: phase >= 2 ? 1 : 0.3,
                transition: 'opacity 0.8s ease',
              }}
            />
          </div>
        ) : null}

        <p
          style={{
            fontFamily: '"Futura PT Medium"',
            fontSize: '8px',
            letterSpacing: '0.14em',
            color: phase < 2 ? 'rgba(255,255,255,0.7)' : ORB_VISUAL.brandRed,
            marginTop: 24,
            textTransform: 'uppercase',
          }}
        >
          {messages[Math.min(phase, messages.length - 1)]}
        </p>

        {phase >= 4 ? (
          <button
            type="button"
            onClick={completeAwakening}
            style={{
              marginTop: 20,
              fontFamily: '"Futura PT Medium"',
              fontSize: '7px',
              letterSpacing: '0.1em',
              color: ORB_VISUAL.brandRed,
              background: 'transparent',
              border: '1px solid rgba(235,28,36,0.4)',
              padding: '8px 16px',
              cursor: 'pointer',
            }}
          >
            ENTER HEADQUARTERS
          </button>
        ) : (
          <button
            type="button"
            onClick={completeAwakening}
            style={{
              marginTop: 20,
              fontFamily: '"Futura PT Medium"',
              fontSize: '7px',
              letterSpacing: '0.1em',
              color: phase < 2 ? 'rgba(255,255,255,0.45)' : 'rgba(235,28,36,0.55)',
              background: 'transparent',
              border: 'none',
              padding: '8px 16px',
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}
          >
            SKIP INTRO
          </button>
        )}
      </div>
    </>
  );
}
