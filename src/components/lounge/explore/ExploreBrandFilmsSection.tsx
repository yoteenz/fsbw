import { contentPackPrimaryRuntimeForCard } from '../loungeTvContentPack';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../loungeTvFocusHandlers';
import { LOUNGE_TV_FONT_DEMI, LOUNGE_TV_FONT_MEDIUM, LOUNGE_TV_TEXT_GRAY, LOUNGE_TV_TEXT_WHITE } from '../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../loungeTvTypography';
import { explorePackImage } from './ExploreCardShell';
import { ExploreFranchiseEyebrow, ExploreFranchiseHeader } from './ExploreFranchiseHeader';
import { ExploreFranchiseSection } from './ExploreFranchiseSection';
import { exploreBrandFilmSlots } from './explorePresentation';
import type { ExploreBrandFilmSlot, ExploreSectionCommonProps, ExploreSectionId } from './exploreTypes';

const SECTION_ID: ExploreSectionId = 'brand-films';

type ExploreBrandFilmsSectionProps = ExploreSectionCommonProps;

function slotKey(slot: ExploreBrandFilmSlot, index: number): string {
  if (slot.kind === 'pack') return slot.pack.id;
  return slot.id ?? `brand-film-ph-${index}`;
}

export function ExploreBrandFilmsSection({
  onSelect,
  onNavigateSection,
}: ExploreBrandFilmsSectionProps) {
  const slots = exploreBrandFilmSlots(4);
  const lead = slots[0];
  const previews = slots.slice(1, 3);

  if (!lead) return null;

  const renderPoster = (
    slot: ExploreBrandFilmSlot,
    variant: 'premiere' | 'preview',
    index: number
  ) => {
    const disabled = slot.kind === 'placeholder' && slot.comingSoon;
    const title = slot.kind === 'pack' ? slot.pack.title : slot.title;
    const imageSrc =
      slot.kind === 'pack'
        ? explorePackImage(slot.pack, variant === 'premiere' ? 'portrait' : 'landscape')
        : slot.imageSrc;
    const runtime = slot.kind === 'pack' ? contentPackPrimaryRuntimeForCard(slot.pack) : undefined;
    const premiere = slot.kind === 'pack' && slot.pack.featuredPremiere === 'brand-film';

    return (
      <button
        key={slotKey(slot, index)}
        type="button"
        className={`lounge-tv-explore-brand-films__poster lounge-tv-explore-brand-films__poster--${variant}`}
        data-lounge-tv-focusable
        data-lounge-tv-focus-id={
          slot.kind === 'pack'
            ? `explore-brand-film-${variant}-${slot.pack.id}`
            : `explore-brand-film-${variant}-${slot.id}`
        }
        disabled={disabled}
        aria-label={title}
        onClick={() => {
          if (slot.kind === 'pack') onSelect(slot.pack);
        }}
        onFocusCapture={loungeTvFocusGlowIn}
        onBlurCapture={loungeTvFocusGlowOut}
      >
        <span className="lounge-tv-explore-brand-films__poster-frame">
          <img src={imageSrc} alt="" loading="lazy" decoding="async" />
          <span className="lounge-tv-explore-brand-films__poster-veil" aria-hidden />
          {premiere && variant === 'premiere' ? <ExploreFranchiseEyebrow>PREMIERE</ExploreFranchiseEyebrow> : null}
        </span>
        <span className="lounge-tv-explore-brand-films__poster-copy">
          <span
            style={{
              fontFamily: LOUNGE_TV_FONT_DEMI,
              fontSize: variant === 'premiere' ? LOUNGE_TV_TYPE.l1 : LOUNGE_TV_TYPE.l3,
              color: LOUNGE_TV_TEXT_WHITE,
              letterSpacing: '0.04em',
              display: 'block',
            }}
          >
            {title}
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
            {disabled ? 'COMING SOON' : runtime ?? 'BRAND FILM'}
          </span>
        </span>
      </button>
    );
  };

  return (
    <ExploreFranchiseSection franchise="brand-films" ariaLabel="Brand films">
      <ExploreFranchiseHeader
        title="BRAND FILMS"
        tagline="FRONTAL SLAYER AS CINEMA."
        focusId="explore-nav-brand-films"
        onNavigate={onNavigateSection ? () => onNavigateSection(SECTION_ID) : undefined}
        navigateAriaLabel="Open Brand Films hub"
      />
      <div className="lounge-tv-explore-brand-films__cinema">
        {renderPoster(lead, 'premiere', 0)}
        {previews.length > 0 ? (
          <div className="lounge-tv-explore-brand-films__previews">
            {previews.map((slot, index) => renderPoster(slot, 'preview', index + 1))}
          </div>
        ) : null}
      </div>
    </ExploreFranchiseSection>
  );
}
