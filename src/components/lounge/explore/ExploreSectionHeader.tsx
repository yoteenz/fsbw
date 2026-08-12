import type { ReactNode } from 'react';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../loungeTvFocusHandlers';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import {
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../loungeTvTypography';
import type { ExploreSectionId } from './exploreTypes';
import { EXPLORE_HUB_DESTINATIONS } from './exploreTypes';

type ExploreSectionHeaderProps = {
  sectionId: ExploreSectionId;
  title: string;
  tagline?: string;
  onNavigate?: (sectionId: ExploreSectionId) => void;
  focusId: string;
  children?: ReactNode;
};

function splitTitleAccent(title: string): { lead: string; rest: string } {
  const spaceIndex = title.indexOf(' ');
  if (spaceIndex === -1) return { lead: title, rest: '' };
  return { lead: title.slice(0, spaceIndex), rest: title.slice(spaceIndex) };
}

/** Section header — navigates to category hub when destination exists. */
export function ExploreSectionHeader({
  sectionId,
  title,
  tagline,
  onNavigate,
  focusId,
  children,
}: ExploreSectionHeaderProps) {
  const hubAvailable = Boolean(EXPLORE_HUB_DESTINATIONS[sectionId]);
  const interactive = Boolean(onNavigate && hubAvailable);
  const { lead, rest } = splitTitleAccent(title);

  const titleContent = (
    <>
      <span className="lounge-tv-explore-section-title__lead">
        {lead}
        <span className="lounge-tv-explore-section-title__accent" aria-hidden />
      </span>
      {rest ? <span className="lounge-tv-explore-section-title__rest">{rest}</span> : null}
    </>
  );

  const headerInner = (
    <>
      <span className="lounge-tv-explore-section-header__row">
        <span className="lounge-tv-explore-section-header__title">{titleContent}</span>
        {hubAvailable ? (
          <span className="lounge-tv-explore-section-header__cue" aria-hidden>
            →
          </span>
        ) : null}
      </span>
      {tagline ? (
        <p
          className="lounge-tv-explore-section-header__tagline"
          style={{
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: LOUNGE_TV_TYPE.l4,
            color: LOUNGE_TV_TEXT_GRAY,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            margin: `${loungeTvGlassCqw(0.35, 0.8, 1.6)} 0 0`,
            lineHeight: 1.35,
          }}
        >
          {tagline}
        </p>
      ) : null}
      {children}
    </>
  );

  if (!interactive) {
    return <header className="lounge-tv-explore-section-header">{headerInner}</header>;
  }

  return (
    <header className="lounge-tv-explore-section-header">
      <button
        type="button"
        className="lounge-tv-explore-section-header__button"
        data-lounge-tv-focusable
        data-lounge-tv-focus-id={focusId}
        aria-label={`Open ${title}`}
        onClick={() => onNavigate?.(sectionId)}
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
        {headerInner}
      </button>
    </header>
  );
}
