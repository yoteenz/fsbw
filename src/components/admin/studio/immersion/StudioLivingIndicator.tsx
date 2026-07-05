import { presenceDotClass } from './studioImmersionTheme';

type Props = {
  label?: string;
  state?: 'available' | 'thinking' | 'busy' | 'completed';
  showDot?: boolean;
};

/** Small live indicator for panels — processing · thinking · complete. */
export function StudioLivingIndicator({ label = 'LIVE', state = 'busy', showDot = true }: Props) {
  return (
    <span
      style={{
        fontFamily: '"Futura PT Medium"',
        fontSize: '5px',
        letterSpacing: '0.06em',
        color: '#808080',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {showDot ? <span className={presenceDotClass(state)} /> : null}
      {label}
    </span>
  );
}
