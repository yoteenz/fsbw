import { useCallback, useMemo, type KeyboardEvent, type FocusEvent } from 'react';
import type { LoungeContentPack } from './loungeTvContentPack';
import type { LoungeContentUnlock } from '../../utils/slayTicketHistoryDisplay';
import type { SlayTip, CareLesson } from '../../content/education/types';
import type { PSATodayEpisode } from './psa-today/types';
import { loungeTvGlassCqw } from './loungeTvResponsive';
import { LOUNGE_TV_TYPE } from './loungeTvTypography';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from './loungeTvTheme';
import { searchLoungeTvContent, type LoungeTvSearchHit } from './loungeTvSearch';
import { LoungeTvEmptyState } from './LoungeTvEmptyState';
import {
  isLoungeTvSilentFocus,
  loungeTvFocusBorderIn,
  loungeTvFocusBorderOut,
  loungeTvFocusGlowIn,
  loungeTvFocusGlowOut,
} from './loungeTvFocusHandlers';
import { getContentPackById } from './loungeTvContentPack';
import { getPsaTodayEpisodeById } from './psa-today/psaTodayCatalog';
import { getSlayTipById, getAllEducationFamilies } from '../../content/education';
import { getCareLessonById } from '../../content/education/care/catalog';

type LoungeTvLibrarySearchHandlers = {
  onSelect: (pack: LoungeContentPack) => void;
  onSelectSlayTip?: (tip: SlayTip) => void;
  onSelectCareLesson?: (lesson: CareLesson) => void;
  onSelectPsaEpisode?: (episode: PSATodayEpisode) => void;
  onSelectMastery?: (masteryId: string) => void;
  onSelectSeason?: (seasonId: string) => void;
  isUnlocked: (contentId: string) => boolean;
  unlocks?: LoungeContentUnlock[];
};

type LoungeTvLibrarySearchProps = LoungeTvLibrarySearchHandlers & {
  query: string;
  onQueryChange: (value: string) => void;
};

function resolvePackForEducationFamily(familyId: string): LoungeContentPack | undefined {
  const family = getAllEducationFamilies().find((f) => f.id === familyId);
  if (!family) return undefined;
  if (family.primaryPSAEpisodeId) {
    const ep = getPsaTodayEpisodeById(family.primaryPSAEpisodeId);
    if (ep?.linkedContentPackId) return getContentPackById(ep.linkedContentPackId);
  }
  const tipId = family.slayTipIds?.[0];
  if (tipId) {
    const tip = getSlayTipById(tipId);
    if (tip?.linkedContentPackId) return getContentPackById(tip.linkedContentPackId);
  }
  const relatedEp = family.relatedPSAEpisodeIds?.[0];
  if (relatedEp) {
    const ep = getPsaTodayEpisodeById(relatedEp);
    if (ep?.linkedContentPackId) return getContentPackById(ep.linkedContentPackId);
  }
  return undefined;
}

function openSearchHit(
  hit: LoungeTvSearchHit,
  handlers: LoungeTvLibrarySearchHandlers,
): void {
  switch (hit.kind) {
    case 'content-pack': {
      const pack = getContentPackById(hit.entityId);
      if (pack) handlers.onSelect(pack);
      return;
    }
    case 'slay-tip': {
      const tip = getSlayTipById(hit.entityId);
      if (tip) handlers.onSelectSlayTip?.(tip);
      return;
    }
    case 'care-lesson': {
      const lesson = getCareLessonById(hit.entityId);
      if (lesson) handlers.onSelectCareLesson?.(lesson);
      return;
    }
    case 'psa-episode': {
      const ep = getPsaTodayEpisodeById(hit.entityId);
      if (ep) handlers.onSelectPsaEpisode?.(ep);
      return;
    }
    case 'mastery':
      handlers.onSelectMastery?.(hit.entityId);
      return;
    case 'season':
      handlers.onSelectSeason?.(hit.entityId);
      return;
    case 'education-family': {
      const pack = resolvePackForEducationFamily(hit.entityId);
      if (pack) handlers.onSelect(pack);
      return;
    }
    default:
      return;
  }
}

function SearchResultRow({
  hit,
  onActivate,
}: {
  hit: LoungeTvSearchHit;
  onActivate: () => void;
}) {
  return (
    <button
      type="button"
      data-lounge-tv-focusable
      data-lounge-tv-focus-id={`library-search-${hit.id}`}
      onClick={onActivate}
      onFocusCapture={(e) => {
        if (isLoungeTvSilentFocus(e.currentTarget)) return;
        loungeTvFocusGlowIn(e);
        loungeTvFocusBorderIn(e);
      }}
      onBlurCapture={(e) => {
        loungeTvFocusGlowOut(e);
        loungeTvFocusBorderOut(e, 'rgba(255,255,255,0.14)');
      }}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: loungeTvGlassCqw(1.1, 2.6, 5.2),
        border: '1px solid rgba(255,255,255,0.14)',
        background: 'rgba(255,255,255,0.04)',
        cursor: 'pointer',
        transition: 'box-shadow 0.22s ease, border-color 0.2s ease',
        textTransform: 'uppercase',
      }}
    >
      <span
        style={{
          display: 'block',
          fontFamily: LOUNGE_TV_FONT_BOOK,
          fontSize: LOUNGE_TV_TYPE.l4,
          color: LOUNGE_TV_TEXT_GRAY,
          letterSpacing: '0.08em',
          lineHeight: 1.2,
          marginBottom: loungeTvGlassCqw(0.35, 0.8, 1.6),
        }}
      >
        {hit.typeLabel}
      </span>
      <span
        style={{
          display: 'block',
          fontFamily: LOUNGE_TV_FONT_MEDIUM,
          fontSize: LOUNGE_TV_TYPE.l2,
          color: LOUNGE_TV_TEXT_WHITE,
          lineHeight: 1.15,
        }}
      >
        {hit.title}
      </span>
      {hit.subtitle ? (
        <span
          style={{
            display: 'block',
            marginTop: loungeTvGlassCqw(0.35, 0.8, 1.6),
            fontFamily: LOUNGE_TV_FONT_BOOK,
            fontSize: LOUNGE_TV_TYPE.l3,
            color: LOUNGE_TV_TEXT_GRAY,
            lineHeight: 1.35,
          }}
        >
          {hit.subtitle}
        </span>
      ) : null}
    </button>
  );
}

export function LoungeTvLibrarySearch({
  query,
  onQueryChange,
  ...props
}: LoungeTvLibrarySearchProps) {
  const trimmed = query.trim();

  const results = useMemo(() => {
    if (trimmed.length < 2) return [];
    return searchLoungeTvContent(trimmed);
  }, [trimmed]);

  const showResults = trimmed.length >= 2;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        onQueryChange('');
        e.currentTarget.blur();
      }
    },
    [onQueryChange],
  );

  const activateHit = useCallback(
    (hit: LoungeTvSearchHit) => {
      openSearchHit(hit, props);
    },
    [props],
  );

  const searchIconGutter = loungeTvGlassCqw(3.4, 8, 16);
  const searchIconSize = loungeTvGlassCqw(1.5, 3.5, 7);

  const resetScrollBody = useCallback(() => {
    const scrollBody = document.querySelector<HTMLElement>(
      '.lounge-tv-screen-root [data-scene-hit-region="lounge-tv-media-panel"]',
    );
    if (scrollBody) scrollBody.scrollTop = 0;
  }, []);

  const handleSearchFocus = useCallback(
    (_e: FocusEvent<HTMLInputElement>) => {
      resetScrollBody();
    },
    [resetScrollBody],
  );

  return (
    <section
      data-lounge-tv-rail="library-search"
      style={{
        width: '100%',
        marginBottom: loungeTvGlassCqw(2, 5, 10),
      }}
    >
      <div style={{ position: 'relative', width: '100%' }}>
        <span
          aria-hidden
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: searchIconGutter,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            color: LOUNGE_TV_BRAND_RED,
          }}
        >
          <svg
            viewBox="0 0 48 48"
            width={searchIconSize}
            height={searchIconSize}
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
            style={{ display: 'block', flexShrink: 0, transform: 'translate(2px, 4px)' }}
          >
            <path d="m21.421,42.842c-5.488,0-10.976-2.089-15.154-6.267C-2.089,28.219-2.089,14.623,6.267,6.267c8.356-8.355,21.952-8.356,30.308,0,8.356,8.356,8.356,21.952,0,30.308-4.178,4.178-9.666,6.267-15.154,6.267Zm0-40.922c-4.997,0-9.993,1.902-13.796,5.705C.018,15.232.018,27.61,7.625,35.217c7.608,7.607,19.985,7.608,27.592,0s7.607-19.985,0-27.592c-3.804-3.803-8.8-5.705-13.796-5.705Z" />
            <path d="m47.039,48c-.246,0-.491-.094-.679-.281l-11.145-11.145c-.375-.375-.375-.983,0-1.358s.983-.375,1.358,0l11.145,11.145c.375.375.375.983,0,1.358-.188.188-.433.281-.679.281Z" />
          </svg>
        </span>
        <input
          id="lounge-tv-library-search-input"
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Search lounge"
          data-lounge-tv-focusable
          data-lounge-tv-focus-id="library-search-input"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={handleSearchFocus}
          onKeyDown={handleKeyDown}
          className="lounge-tv-library-search-input"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            margin: 0,
            padding: `${loungeTvGlassCqw(0.75, 1.8, 3.6)} ${loungeTvGlassCqw(2.8, 6.5, 13)} ${loungeTvGlassCqw(0.75, 1.8, 3.6)} ${searchIconGutter}`,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: LOUNGE_TV_TYPE.l3,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: LOUNGE_TV_TEXT_WHITE,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.16)',
            outline: 'none',
            borderRadius: 0,
            WebkitAppearance: 'none',
          }}
        />
        {trimmed ? (
          <button
            type="button"
            aria-label="Clear search"
            data-lounge-tv-focusable
            onClick={() => onQueryChange('')}
            style={{
              position: 'absolute',
              right: loungeTvGlassCqw(0.6, 1.4, 2.8),
              top: '50%',
              transform: 'translateY(-50%)',
              margin: 0,
              padding: loungeTvGlassCqw(0.35, 0.8, 1.6),
              border: 'none',
              background: 'transparent',
              color: LOUNGE_TV_TEXT_GRAY,
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_TYPE.l3,
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        ) : null}
      </div>

      {showResults ? (
        <div
          style={{
            marginTop: loungeTvGlassCqw(1.4, 3.5, 7),
            display: 'flex',
            flexDirection: 'column',
            gap: loungeTvGlassCqw(0.75, 1.8, 3.6),
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: LOUNGE_TV_FONT_BOOK,
              fontSize: LOUNGE_TV_TYPE.l4,
              color: LOUNGE_TV_TEXT_GRAY,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            {results.length
              ? `${results.length} RESULT${results.length === 1 ? '' : 'S'}`
              : 'NO MATCHES'}
          </p>
          {results.length ? (
            results.map((hit) => (
              <SearchResultRow key={hit.id} hit={hit} onActivate={() => activateHit(hit)} />
            ))
          ) : (
            <LoungeTvEmptyState message="TRY A DIFFERENT TITLE, TOPIC, OR KEYWORD." />
          )}
        </div>
      ) : trimmed.length === 1 ? (
        <p
          style={{
            margin: `${loungeTvGlassCqw(0.75, 1.8, 3.6)} 0 0`,
            fontFamily: LOUNGE_TV_FONT_BOOK,
            fontSize: LOUNGE_TV_TYPE.l4,
            color: LOUNGE_TV_TEXT_GRAY,
            textTransform: 'uppercase',
          }}
        >
          TYPE ONE MORE CHARACTER TO SEARCH.
        </p>
      ) : null}
    </section>
  );
}

export function loungeTvLibrarySearchIsActive(query: string): boolean {
  return query.trim().length >= 2;
}
