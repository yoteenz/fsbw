import { contentPackPrimaryRuntimeForCard } from '../loungeTvContentPack';
import { loungeTvFocusGlowIn, loungeTvFocusGlowOut } from '../loungeTvFocusHandlers';
import { LOUNGE_TV_FONT_DEMI, LOUNGE_TV_FONT_MEDIUM, LOUNGE_TV_TEXT_WHITE } from '../loungeTvTheme';
import { LOUNGE_TV_TYPE } from '../loungeTvTypography';
import { explorePackImage } from './ExploreCardShell';
import { ExploreFranchiseEyebrow, ExploreFranchiseHeader, ExploreFranchiseMeta } from './ExploreFranchiseHeader';
import { ExploreFranchiseSection } from './ExploreFranchiseSection';
import { exploreProductRevealSlots } from './explorePresentation';
import type { ExploreProductRevealSlot, ExploreSectionCommonProps, ExploreSectionId } from './exploreTypes';

const SECTION_ID: ExploreSectionId = 'product-reveals';

type ExploreProductRevealsSectionProps = ExploreSectionCommonProps;

function slotKey(slot: ExploreProductRevealSlot, index: number): string {
  if (slot.kind === 'pack') return slot.pack.id;
  return slot.id ?? `reveal-ph-${index}`;
}

function slotTitle(slot: ExploreProductRevealSlot): string {
  if (slot.kind === 'pack') return `${slot.unitName} — THE REVEAL`;
  return slot.title;
}

function slotImage(slot: ExploreProductRevealSlot): string {
  if (slot.kind === 'pack') return explorePackImage(slot.pack, 'portrait');
  return slot.imageSrc;
}

export function ExploreProductRevealsSection({
  onSelect,
  onNavigateSection,
}: ExploreProductRevealsSectionProps) {
  const slots = exploreProductRevealSlots(6);
  const lead = slots.find((s) => s.kind === 'pack') ?? slots[0];
  const peeks = slots.filter((s) => s !== lead).slice(0, 3);

  if (!lead) return null;

  const leadDisabled = lead.kind === 'placeholder' && lead.comingSoon;
  const leadRuntime =
    lead.kind === 'pack'
      ? contentPackPrimaryRuntimeForCard(lead.pack)
      : lead.runtimeLabel;
  const leadPremiere =
    lead.kind === 'pack' && lead.pack.featuredPremiere === 'product-premiere';

  return (
    <ExploreFranchiseSection franchise="product-reveals" ariaLabel="Product reveals">
      <ExploreFranchiseHeader
        title="PRODUCT REVEALS"
        tagline="WHAT FRONTAL SLAYER IS REVEALING."
        focusId="explore-nav-product-reveals"
        onNavigate={onNavigateSection ? () => onNavigateSection(SECTION_ID) : undefined}
        navigateAriaLabel="Open Product Reveals hub"
      />
      <div className="lounge-tv-explore-reveals__stage">
        <button
          type="button"
          className="lounge-tv-explore-reveals__premiere"
          data-lounge-tv-focusable
          data-lounge-tv-focus-id={
            lead.kind === 'pack' ? `explore-reveal-premiere-${lead.pack.id}` : `explore-reveal-premiere-${lead.id}`
          }
          disabled={leadDisabled}
          aria-label={slotTitle(lead)}
          onClick={() => {
            if (lead.kind === 'pack') onSelect(lead.pack);
          }}
          onFocusCapture={loungeTvFocusGlowIn}
          onBlurCapture={loungeTvFocusGlowOut}
        >
          <span className="lounge-tv-explore-reveals__premiere-media">
            <img src={slotImage(lead)} alt="" loading="lazy" decoding="async" />
            <span className="lounge-tv-explore-reveals__premiere-veil" aria-hidden />
            <span className="lounge-tv-explore-reveals__premiere-glow" aria-hidden />
            {leadPremiere ? <ExploreFranchiseEyebrow>PREMIERE</ExploreFranchiseEyebrow> : null}
          </span>
          <span className="lounge-tv-explore-reveals__premiere-copy">
            <span
              style={{
                fontFamily: LOUNGE_TV_FONT_DEMI,
                fontSize: LOUNGE_TV_TYPE.l1,
                color: LOUNGE_TV_TEXT_WHITE,
                letterSpacing: '0.05em',
                display: 'block',
                lineHeight: 1.08,
              }}
            >
              {slotTitle(lead)}
            </span>
            <span className="lounge-tv-explore-reveals__premiere-actions">
              <span
                style={{
                  fontFamily: LOUNGE_TV_FONT_MEDIUM,
                  fontSize: LOUNGE_TV_TYPE.l3,
                  color: LOUNGE_TV_TEXT_WHITE,
                  letterSpacing: '0.06em',
                }}
              >
                {leadDisabled ? 'COMING SOON' : 'WATCH NOW'}
              </span>
              {leadRuntime ? <ExploreFranchiseMeta>{leadRuntime}</ExploreFranchiseMeta> : null}
            </span>
          </span>
        </button>

        {peeks.length > 0 ? (
          <div className="lounge-tv-explore-reveals__peeks" aria-label="Upcoming reveals">
            {peeks.map((slot, index) => {
              const disabled = slot.kind === 'placeholder' && slot.comingSoon;
              return (
                <button
                  key={slotKey(slot, index)}
                  type="button"
                  className={`lounge-tv-explore-reveals__peek lounge-tv-explore-reveals__peek--${index + 1}`}
                  data-lounge-tv-focusable
                  data-lounge-tv-focus-id={
                    slot.kind === 'pack'
                      ? `explore-reveal-peek-${slot.pack.id}`
                      : `explore-reveal-peek-${slot.id}`
                  }
                  disabled={disabled}
                  aria-label={slotTitle(slot)}
                  onClick={() => {
                    if (slot.kind === 'pack') onSelect(slot.pack);
                  }}
                  onFocusCapture={loungeTvFocusGlowIn}
                  onBlurCapture={loungeTvFocusGlowOut}
                >
                  <span className="lounge-tv-explore-reveals__peek-media">
                    <img src={slotImage(slot)} alt="" loading="lazy" decoding="async" />
                    <span className="lounge-tv-explore-reveals__peek-veil" aria-hidden />
                  </span>
                  <span
                    style={{
                      fontFamily: LOUNGE_TV_FONT_DEMI,
                      fontSize: LOUNGE_TV_TYPE.l4,
                      color: LOUNGE_TV_TEXT_WHITE,
                      letterSpacing: '0.04em',
                      display: 'block',
                      marginTop: '0.35em',
                    }}
                  >
                    {slot.kind === 'pack' ? slot.unitName : slot.unitName ?? slot.title}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </ExploreFranchiseSection>
  );
}
