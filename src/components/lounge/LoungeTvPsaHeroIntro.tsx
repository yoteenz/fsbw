import { loungeTvGlassCqw } from './loungeTvResponsive';
import {
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from './loungeTvTheme';
import { dismissLoungeTvPsaIntro } from '../../utils/loungeTvPsaIntroSession';

type LoungeTvPsaHeroIntroProps = {
  premiereLabel: string;
  message: string;
  onSkip: () => void;
};

/** Skippable text-only PSA host intro — no audio, respects autoplay policy. */
export function LoungeTvPsaHeroIntro({ premiereLabel, message, onSkip }: LoungeTvPsaHeroIntroProps) {
  const handleSkip = () => {
    dismissLoungeTvPsaIntro();
    onSkip();
  };

  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '16 / 9',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: loungeTvGlassCqw(1.2, 3, 6),
        padding: loungeTvGlassCqw(2, 5, 10),
        background: 'linear-gradient(145deg, #0d0d0d 0%, #1a1a1a 55%, #111 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'center',
        textTransform: 'uppercase',
      }}
    >
      <span
        style={{
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: loungeTvGlassCqw(1.25, 2.8, 5.5),
          letterSpacing: '0.12em',
          color: '#EB1C24',
        }}
      >
        {premiereLabel}
      </span>
      <p
        style={{
          margin: 0,
          maxWidth: '42em',
          fontFamily: LOUNGE_TV_FONT_BOOK,
          fontSize: loungeTvGlassCqw(1.5, 3.5, 7),
          lineHeight: 1.45,
          color: LOUNGE_TV_TEXT_WHITE,
        }}
      >
        {message}
      </p>
      <button
        type="button"
        onClick={handleSkip}
        style={{
          marginTop: loungeTvGlassCqw(0.5, 1.5, 3),
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: loungeTvGlassCqw(1.35, 3, 6),
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: `${loungeTvGlassCqw(0.9, 2, 4)} ${loungeTvGlassCqw(1.8, 4, 8)}`,
          background: 'transparent',
          color: LOUNGE_TV_TEXT_GRAY,
          border: '1px solid rgba(255,255,255,0.35)',
          cursor: 'pointer',
        }}
      >
        SKIP · VIEW FEATURED
      </button>
    </div>
  );
}
