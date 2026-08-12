import { contentPackPrimaryRuntimeForCard } from '../loungeTvContentPack';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../loungeTvFocusHandlers';
import { LOUNGE_TV_FONT_DEMI, LOUNGE_TV_FONT_MEDIUM, LOUNGE_TV_TEXT_GRAY, LOUNGE_TV_TEXT_WHITE } from '../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../loungeTvTypography';
import { explorePackImage } from './ExploreCardShell';
import { ExploreFranchiseHeader } from './ExploreFranchiseHeader';
import { ExploreFranchiseSection } from './ExploreFranchiseSection';
import { exploreSlayCamStories } from './explorePresentation';
import type { ExploreSectionCommonProps, ExploreSectionId } from './exploreTypes';

const SECTION_ID: ExploreSectionId = 'slay-cam';

type ExploreSlayCamSectionProps = ExploreSectionCommonProps;

export function ExploreSlayCamSection({
  onSelect,
  onNavigateSection,
}: ExploreSlayCamSectionProps) {
  const stories = exploreSlayCamStories(4).filter((s) => s.kind === 'pack');
  const [hero, side, peek, extra] = stories;

  if (!hero || hero.kind !== 'pack') return null;

  const renderStory = (
    story: typeof hero,
    variant: 'hero' | 'side' | 'peek' | 'extra',
    focusSuffix: string
  ) => {
    if (!story || story.kind !== 'pack') return null;
    const runtime = contentPackPrimaryRuntimeForCard(story.pack);

    return (
      <button
        key={story.pack.id}
        type="button"
        className={`lounge-tv-explore-slay-cam__frame lounge-tv-explore-slay-cam__frame--${variant}`}
        data-lounge-tv-focusable
        data-lounge-tv-focus-id={`explore-slay-cam-${focusSuffix}-${story.pack.id}`}
        aria-label={story.pack.title}
        onClick={() => onSelect(story.pack)}
        onFocusCapture={loungeTvFocusGlowIn}
        onBlurCapture={loungeTvFocusGlowOut}
      >
        <span className="lounge-tv-explore-slay-cam__media">
          <img
            src={explorePackImage(story.pack, variant === 'hero' ? 'portrait' : 'landscape')}
            alt=""
            loading="lazy"
            decoding="async"
          />
          <span className="lounge-tv-explore-slay-cam__veil" aria-hidden />
          {story.note ? (
            <span className="lounge-tv-explore-slay-cam__annotation" aria-hidden>
              {story.note}
            </span>
          ) : null}
        </span>
        <span className="lounge-tv-explore-slay-cam__copy">
          <span
            style={{
              fontFamily: LOUNGE_TV_FONT_DEMI,
              fontSize: variant === 'hero' ? LOUNGE_TV_TYPE.l2 : LOUNGE_TV_TYPE.l3,
              color: LOUNGE_TV_TEXT_WHITE,
              letterSpacing: '0.04em',
              display: 'block',
            }}
          >
            {story.pack.title}
          </span>
          <span
            style={{
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_TYPE.l4,
              color: LOUNGE_TV_TEXT_GRAY,
              letterSpacing: '0.06em',
              display: 'block',
              marginTop: '0.2em',
            }}
          >
            SLAY CAM{runtime ? ` · ${runtime}` : ''}
          </span>
        </span>
      </button>
    );
  };

  return (
    <ExploreFranchiseSection franchise="slay-cam" ariaLabel="Slay Cam stories">
      <ExploreFranchiseHeader
        title="SLAY CAM"
        tagline="HOW THE COMMUNITY IS WEARING IT."
        focusId="explore-nav-slay-cam"
        onNavigate={onNavigateSection ? () => onNavigateSection(SECTION_ID) : undefined}
        navigateAriaLabel="Open Slay Cam hub"
      />
      <div className="lounge-tv-explore-slay-cam__contact">
        {renderStory(hero, 'hero', 'hero')}
        {side && side.kind === 'pack' ? renderStory(side, 'side', 'side') : null}
        {peek && peek.kind === 'pack' ? renderStory(peek, 'peek', 'peek') : null}
        {extra && extra.kind === 'pack' ? (
          <span className="lounge-tv-explore-slay-cam__more" aria-hidden>
            {renderStory(extra, 'extra', 'extra')}
          </span>
        ) : null}
      </div>
    </ExploreFranchiseSection>
  );
}
