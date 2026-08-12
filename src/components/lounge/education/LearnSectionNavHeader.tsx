import type { ReactNode } from 'react';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../loungeTvFocusHandlers';
import {
  LOUNGE_TV_FONT_DEMI,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../loungeTvTypography';
import { MASTERY_PANEL_TYPE_META_PLUS_1 } from './LearnMasterySelector';
import { LearnSectionTagline } from './LearnBrowseChrome';

type LearnSectionNavHeaderProps = {
  title: string;
  tagline?: string;
  onNavigate?: () => void;
  focusId: string;
  taglineSpacing?: 'browse' | 'education';
  children?: ReactNode;
};

/** Interactive section header — full title row opens the content hub. */
export function LearnSectionNavHeader({
  title,
  tagline,
  onNavigate,
  focusId,
  taglineSpacing = 'browse',
  children,
}: LearnSectionNavHeaderProps) {
  const interactive = Boolean(onNavigate);
  const spaceIndex = title.indexOf(' ');
  const firstWord = spaceIndex === -1 ? title : title.slice(0, spaceIndex);
  const remainder = spaceIndex === -1 ? '' : title.slice(spaceIndex);

  const titleContent = (
    <>
      <span className="lounge-tv-learn-section-title__lead">
        {firstWord}
        <span className="lounge-tv-learn-section-title__accent" aria-hidden />
      </span>
      {remainder ? <span className="lounge-tv-learn-section-title__rest">{remainder}</span> : null}
    </>
  );

  const headerInner = (
    <>
      <span className="lounge-tv-learn-section-nav__title-row">
        <span className="lounge-tv-learn-section-nav__title">{titleContent}</span>
      </span>
      {tagline ? <LearnSectionTagline spacingVariant={taglineSpacing}>{tagline}</LearnSectionTagline> : null}
      {children}
    </>
  );

  if (!interactive) {
    return <header className="lounge-tv-learn-section-nav">{headerInner}</header>;
  }

  return (
    <header className="lounge-tv-learn-section-nav">
      <button
        type="button"
        className="lounge-tv-learn-section-nav__button"
        data-lounge-tv-focusable
        data-lounge-tv-focus-id={focusId}
        aria-label={`Open ${title} hub`}
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
        {headerInner}
      </button>
    </header>
  );
}

export function LearnSectionMeta({ children }: { children: string }) {
  return (
    <span
      className="lounge-tv-learn-section-meta"
      style={{
        fontFamily: LOUNGE_TV_FONT_DEMI,
        fontSize: MASTERY_PANEL_TYPE_META_PLUS_1,
        color: LOUNGE_TV_TEXT_WHITE,
        letterSpacing: '0.04em',
        display: 'block',
        marginTop: loungeTvGlassCqw(0.45, 1, 2),
      }}
    >
      {children}
    </span>
  );
}
