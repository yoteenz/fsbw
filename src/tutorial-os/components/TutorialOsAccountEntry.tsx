import { useTutorialOs } from '../TutorialOsContext';
import { MANSION_TOUR_CUSTOMER_NAME } from '../constants';

/** Subtle account dashboard entry — does not alter account business logic. */
export function TutorialOsAccountEntry() {
  const { startTour, mansionTourCompleted } = useTutorialOs();

  return (
    <button
      type="button"
      onClick={() => startTour('mansion-tour')}
      style={{
        fontFamily: '"Futura PT Medium"',
        fontSize: '10px',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: '#EB1C24',
        background: 'transparent',
        border: 'none',
        padding: '8px 0',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
      }}
    >
      {mansionTourCompleted ? 'REPLAY THE MANSION TOUR' : `TAKE ${MANSION_TOUR_CUSTOMER_NAME.toUpperCase()}`}
    </button>
  );
}
