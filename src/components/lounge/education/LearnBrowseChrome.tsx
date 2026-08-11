import type { FocusEvent, ReactNode } from 'react';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../loungeTvFocusHandlers';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_DEMI,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from '../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../loungeTvTypography';
import {
  MASTERY_PANEL_BORDER_COLOR,
  MASTERY_PANEL_TYPE_META_PLUS_1,
  MASTERY_PANEL_TYPE_TITLE_MINUS_1,
} from './LearnMasterySelector';
import { LEARN_ACRYLIC_HIT_SIZE } from '../learnAcrylicGlyphSizes';

type LearnBrowseFiltersProps<T extends string> = {
  filters: readonly T[];
  active: T;
  onChange: (filter: T) => void;
  focusIdPrefix: string;
  ariaLabel: string;
  /** Optional wrapper class — e.g. section-scoped acrylic filter styling. */
  filtersClassName?: string;
  /** Optional label renderer for custom pill content. */
  renderFilterContent?: (filter: T, selected: boolean) => ReactNode;
};

export function LearnBrowseFilters<T extends string>({
  filters,
  active,
  onChange,
  focusIdPrefix,
  ariaLabel,
  filtersClassName,
  renderFilterContent,
}: LearnBrowseFiltersProps<T>) {
  return (
    <div
      className={
        filtersClassName
          ? `lounge-tv-learn-browse-filters ${filtersClassName}`
          : 'lounge-tv-learn-browse-filters'
      }
      role="toolbar"
      aria-label={ariaLabel}
    >
      <div
        className="lounge-tv-learn-browse-filters__scroll"
        style={{ ['--learn-filter-count' as string]: filters.length }}
      >
        {filters.map((filter) => {
          const selected = filter === active;
          return (
            <button
              key={filter}
              type="button"
              data-lounge-tv-focusable
              data-lounge-tv-focus-id={`${focusIdPrefix}-${filter.toLowerCase().replace(/\s+/g, '-')}`}
              aria-pressed={selected}
              onClick={() => onChange(filter)}
              onFocusCapture={loungeTvFocusGlowIn}
              onBlurCapture={loungeTvFocusGlowOut}
              className={[
                selected
                  ? 'lounge-tv-learn-browse-filter lounge-tv-learn-browse-filter--active'
                  : 'lounge-tv-learn-browse-filter',
                filter === 'LIKES' ? 'lounge-tv-learn-browse-filter--likes' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                fontFamily: LOUNGE_TV_FONT_MEDIUM,
                fontSize: `calc(${LOUNGE_TV_TYPE.l4} + 2px)`,
                letterSpacing: '0.06em',
                ...(filter === 'LIKES'
                  ? {
                      minWidth: LEARN_ACRYLIC_HIT_SIZE,
                      minHeight: LEARN_ACRYLIC_HIT_SIZE,
                    }
                  : null),
              }}
            >
              <span className="lounge-tv-learn-browse-filter__content">
                {renderFilterContent ? renderFilterContent(filter, selected) : filter}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

type LearnSectionViewAllToggleProps = {
  expanded: boolean;
  onToggle: () => void;
  expandLabel: string;
  collapseLabel: string;
  focusId: string;
  controlsId: string;
};

export function LearnSectionViewAllToggle({
  expanded,
  onToggle,
  expandLabel,
  collapseLabel,
  focusId,
  controlsId,
}: LearnSectionViewAllToggleProps) {
  return (
    <button
      type="button"
      className="lounge-tv-learn-section-toggle"
      data-lounge-tv-focusable
      data-lounge-tv-focus-id={focusId}
      aria-expanded={expanded}
      aria-controls={controlsId}
      onClick={onToggle}
      onFocusCapture={loungeTvFocusGlowIn}
      onBlurCapture={loungeTvFocusGlowOut}
      style={{
        fontFamily: LOUNGE_TV_FONT_MEDIUM,
        fontSize: MASTERY_PANEL_TYPE_TITLE_MINUS_1,
        color: LOUNGE_TV_BRAND_RED,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        background: 'transparent',
        border: 'none',
        padding: `${loungeTvGlassCqw(0.45, 1, 2)} 0`,
        marginBottom: expanded ? '0' : '3px',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      {expanded ? collapseLabel : expandLabel}
    </button>
  );
}

export function LearnSectionTitle({ title }: { title: string }) {
  const spaceIndex = title.indexOf(' ');
  const firstWord = spaceIndex === -1 ? title : title.slice(0, spaceIndex);
  const remainder = spaceIndex === -1 ? '' : title.slice(spaceIndex);

  return (
    <h2
      className="lounge-tv-learn-section-title"
      style={{
        margin: 0,
        fontFamily: LOUNGE_TV_FONT_MEDIUM,
        fontSize: LOUNGE_TV_TYPE.l1,
        color: LOUNGE_TV_TEXT_WHITE,
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
      }}
    >
      <span className="lounge-tv-learn-section-title__lead">
        {firstWord}
        <span className="lounge-tv-learn-section-title__accent" aria-hidden />
      </span>
      {remainder ? <span className="lounge-tv-learn-section-title__rest">{remainder}</span> : null}
    </h2>
  );
}

export function LearnSectionTagline({
  children,
  spacingVariant,
}: {
  children: string;
  /** Extra 4px above tagline; 8px below (Slay Tips, PSA Answers, Product Education). */
  spacingVariant?: 'browse' | 'education';
}) {
  const baseTop = loungeTvGlassCqw(0.3, 0.7, 1.4);
  const marginTop =
    spacingVariant === 'browse' || spacingVariant === 'education'
      ? `calc(${baseTop} + 4px)`
      : baseTop;
  const marginBottom =
    spacingVariant === 'browse' || spacingVariant === 'education' ? '8px' : '0';

  return (
    <p
      className="lounge-tv-learn-section-tagline"
      style={{
        margin: `${marginTop} 0 ${marginBottom}`,
        fontFamily: LOUNGE_TV_FONT_BOOK,
        fontSize: MASTERY_PANEL_TYPE_META_PLUS_1,
        lineHeight: 1.25,
        color: LOUNGE_TV_TEXT_GRAY,
        letterSpacing: '0.04em',
        maxWidth: '42em',
      }}
    >
      {children}
    </p>
  );
}

export function LearnSectionHeaderRow({
  meta,
  toggle,
}: {
  meta?: string;
  toggle: ReactNode;
}) {
  return (
    <div
      className="lounge-tv-learn-section-nav"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: loungeTvGlassCqw(1, 2.4, 4.8),
        marginTop: loungeTvGlassCqw(0.45, 1, 2),
        minWidth: 0,
      }}
    >
      {meta ? (
        <span
          className="lounge-tv-learn-section-meta"
          style={{
            fontFamily: LOUNGE_TV_FONT_DEMI,
            fontSize: MASTERY_PANEL_TYPE_META_PLUS_1,
            color: MASTERY_PANEL_BORDER_COLOR,
            letterSpacing: '0.04em',
            flexShrink: 0,
            minWidth: 0,
          }}
        >
          {meta}
        </span>
      ) : (
        <span aria-hidden style={{ flex: 1 }} />
      )}
      {toggle}
    </div>
  );
}

export function useLearnCardFocusHandlers() {
  const onFocus = (e: FocusEvent<HTMLElement>) => {
    loungeTvFocusGlowIn(e as FocusEvent<HTMLButtonElement>);
  };
  const onBlur = (e: FocusEvent<HTMLElement>) => {
    loungeTvFocusGlowOut(e as FocusEvent<HTMLButtonElement>);
  };
  return { onFocus, onBlur };
}
