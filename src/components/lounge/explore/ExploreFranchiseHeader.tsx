import type { ReactNode } from 'react';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../loungeTvFocusHandlers';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import {
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../loungeTvTypography';

type ExploreFranchiseHeaderProps = {
  title: string;
  tagline?: string;
  focusId: string;
  onNavigate?: () => void;
  navigateAriaLabel?: string;
  children?: ReactNode;
};

function splitTitleAccent(title: string): { lead: string; rest: string } {
  const spaceIndex = title.indexOf(' ');
  if (spaceIndex === -1) return { lead: title, rest: '' };
  return { lead: title.slice(0, spaceIndex), rest: title.slice(spaceIndex) };
}

/** Level-1 franchise title — full row navigates when hub handler provided. */
export function ExploreFranchiseHeader({
  title,
  tagline,
  focusId,
  onNavigate,
  navigateAriaLabel,
  children,
}: ExploreFranchiseHeaderProps) {
  const { lead, rest } = splitTitleAccent(title);
  const interactive = Boolean(onNavigate);

  const inner = (
    <>
      <span className="lounge-tv-explore-franchise-header__row">
        <span className="lounge-tv-explore-franchise-header__title">
          <span className="lounge-tv-explore-franchise-header__lead">
            {lead}
            <span className="lounge-tv-explore-franchise-header__accent" aria-hidden />
          </span>
          {rest ? <span className="lounge-tv-explore-franchise-header__rest">{rest}</span> : null}
        </span>
        {interactive ? (
          <span className="lounge-tv-explore-franchise-header__cue" aria-hidden>
            →
          </span>
        ) : null}
      </span>
      {tagline ? <p className="lounge-tv-explore-franchise-header__tagline">{tagline}</p> : null}
      {children}
    </>
  );

  if (!interactive) {
    return <header className="lounge-tv-explore-franchise-header">{inner}</header>;
  }

  return (
    <header className="lounge-tv-explore-franchise-header">
      <button
        type="button"
        className="lounge-tv-explore-franchise-header__button"
        data-lounge-tv-focusable
        data-lounge-tv-focus-id={focusId}
        aria-label={navigateAriaLabel ?? `Open ${title}`}
        onClick={onNavigate}
        onFocusCapture={loungeTvFocusGlowIn}
        onBlurCapture={loungeTvFocusGlowOut}
        style={{
          width: '100%',
          textAlign: 'left',
          background: 'transparent',
          border: 'none',
          padding: 0,
          margin: 0,
          cursor: 'pointer',
          color: LOUNGE_TV_TEXT_WHITE,
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: LOUNGE_TV_TYPE.l1,
        }}
      >
        {inner}
      </button>
    </header>
  );
}

export function ExploreFranchiseMeta({ children }: { children: string }) {
  return (
    <span
      className="lounge-tv-explore-franchise-meta"
      style={{
        fontFamily: LOUNGE_TV_FONT_MEDIUM,
        fontSize: LOUNGE_TV_TYPE.l4,
        color: LOUNGE_TV_TEXT_GRAY,
        letterSpacing: '0.06em',
      }}
    >
      {children}
    </span>
  );
}

export function ExploreFranchiseEyebrow({ children }: { children: string }) {
  return (
    <span
      className="lounge-tv-explore-franchise-eyebrow"
      style={{
        fontFamily: LOUNGE_TV_FONT_MEDIUM,
        fontSize: LOUNGE_TV_TYPE.l4,
        color: '#EB1C24',
        letterSpacing: '0.08em',
        display: 'block',
        marginBottom: loungeTvGlassCqw(0.25, 0.55, 1.1),
      }}
    >
      {children}
    </span>
  );
}
