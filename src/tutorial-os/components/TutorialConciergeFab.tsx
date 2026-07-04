import { ONBOARDING_TUTORIAL_LABEL } from '../constants';

type Props = {
  onClick: () => void;
  hidden?: boolean;
};

export function TutorialConciergeFab({ onClick, hidden }: Props) {
  if (hidden) return null;
  return (
    <button
      type="button"
      className="tutorial-os-concierge-fab"
      onClick={onClick}
      aria-label={`${ONBOARDING_TUTORIAL_LABEL} — take a tour`}
      title={ONBOARDING_TUTORIAL_LABEL}
    >
      <span
        style={{
          fontFamily: '"Futura PT Medium"',
          fontSize: '8px',
          letterSpacing: '0.04em',
          color: '#EB1C24',
          textTransform: 'uppercase',
        }}
      >
        OT
      </span>
    </button>
  );
}
