import { FS_CONCIERGE_LABEL } from '../constants';

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
      aria-label={`${FS_CONCIERGE_LABEL} — take a tour`}
      title={FS_CONCIERGE_LABEL}
    >
      <span
        style={{
          fontFamily: '"Futura PT Medium"',
          fontSize: '11px',
          letterSpacing: '0.04em',
          color: '#EB1C24',
        }}
      >
        FS
      </span>
    </button>
  );
}
