import './CommercePageBackground.css';

const MOBILE_MARBLE_BG = "url('/assets/marble-half.png')";

type CommercePageBackgroundProps = {
  desktopSrc: string;
};

/** Marble tile on mobile; full-bleed desktop hero at ≥1024px (account/sign-in, checkout). */
export function CommercePageBackground({ desktopSrc }: CommercePageBackgroundProps) {
  return (
    <>
      <div
        className="commerce-page-background commerce-page-background--mobile fixed inset-0 -z-10"
        style={{
          backgroundImage: MOBILE_MARBLE_BG,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed',
        }}
        aria-hidden
      />
      <div className="commerce-page-background commerce-page-background--desktop fixed inset-0 -z-10" aria-hidden>
        <img src={desktopSrc} alt="" draggable={false} className="commerce-page-background__hero" />
      </div>
    </>
  );
}
