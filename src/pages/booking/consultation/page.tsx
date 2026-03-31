import { useRef, useState, type ChangeEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BookingFlowLayout from '../../../components/BookingFlowLayout';
import ConfirmationModal from '../../../components/ConfirmationModal';
import {
  BookingBodyParagraph,
  BookingCrumbTitle,
  BookingHeroSubline,
  BookingTierBadgeImg,
  NoirStyleAddToBagButton,
  bookingFontBook,
  bookingFontMedium
} from '../../../components/booking/BookingPageChrome';
import { useSelectedCurrencyDisplay } from '../../../hooks/useSelectedCurrencyDisplay';
import { bookingCartItemThumbnailSrc } from '../../../utils/bookingBadges';
import { isPremiumMemberForGatedFeatures, prepareMembershipUpgradeNavigation } from '../../../utils/premiumMemberAccess';

const CONSULT_DEPOSIT_USD = 40;

type HairOption = 'WIG + INSTALL' | 'WIG ONLY';

/** Standard `/booking/consultation`: any signed-in tier. Premium `/booking/premium/consultation`: same gate as appointments (modal + no add-to-bag without premium). */
export default function BookingConsultationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isPremiumBooking = location.pathname.includes('/booking/premium/');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hairOption, setHairOption] = useState<HairOption>('WIG + INSTALL');
  const [notes, setNotes] = useState('');
  const [inspoFileName, setInspoFileName] = useState('');
  const [inspoPreview, setInspoPreview] = useState<string | null>(null);
  const [addToBagState, setAddToBagState] = useState<'idle' | 'adding' | 'added'>('idle');
  const [formError, setFormError] = useState<string | null>(null);
  const [showPremiumConsultUpgradeModal, setShowPremiumConsultUpgradeModal] = useState(false);
  const { formatUsd } = useSelectedCurrencyDisplay();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) {
      setInspoFileName('');
      setInspoPreview(null);
      return;
    }
    setInspoFileName(f.name);
    setFormError(null);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setInspoPreview(typeof reader.result === 'string' ? reader.result : null);
      reader.readAsDataURL(f);
    } else {
      setInspoPreview(null);
    }
  };

  const handleAddToBag = () => {
    if (isPremiumBooking && !isPremiumMemberForGatedFeatures()) {
      setShowPremiumConsultUpgradeModal(true);
      return;
    }
    setFormError(null);
    setAddToBagState('adding');
    setTimeout(() => {
      try {
        const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        const tier = isPremiumBooking ? 'premium' : 'standard';
        const badgeImage =
          bookingCartItemThumbnailSrc({ type: 'booking-consult', bookingTier: tier }) ||
          '/assets/consultation-standard.png';
        const newItem = {
          id: `booking-consult-${Date.now()}`,
          name: 'WIG CONSULT',
          price: CONSULT_DEPOSIT_USD,
          quantity: 1,
          image: badgeImage,
          type: 'booking-consult',
          bookingTier: tier,
          bookingHairOption: hairOption,
          bookingNotes: notes.trim(),
          bookingInspoFileName: inspoFileName.trim(),
          bookingBagSubtitle: hairOption
        };
        const updated = [newItem, ...cartItems];
        localStorage.setItem('cartItems', JSON.stringify(updated));
        const newCartCount = updated.length;
        localStorage.setItem('cartCount', String(newCartCount));
        window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCartCount }));
        window.dispatchEvent(new Event('cartUpdated'));
        setAddToBagState('added');
        setTimeout(() => setAddToBagState('idle'), 2000);
      } catch (err) {
        console.error(err);
        setAddToBagState('idle');
      }
    }, 400);
  };

  const labelStyle = {
    fontFamily: bookingFontMedium,
    fontSize: '11px' as const,
    color: '#000000',
    textTransform: 'uppercase' as const,
    marginBottom: '6px',
    display: 'block' as const,
    letterSpacing: '0.03em',
    fontWeight: 500 as const
  };

  return (
    <>
    <BookingFlowLayout
      crumbHighlight="CONSULT"
      belowCard={
        <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto', paddingTop: '2px' }}>
          <NoirStyleAddToBagButton
            state={addToBagState}
            disabled={addToBagState === 'adding'}
            onClick={handleAddToBag}
          />
        </div>
      }
    >
      <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto', paddingBottom: '12px' }}>
        <BookingCrumbTitle middle={<BookingTierBadgeImg />} hideRule>
          {null}
        </BookingCrumbTitle>
        <BookingHeroSubline>
          NON-REFUNDABLE DEPOSIT APPLIES TOWARD YOUR WIG OR INSTALL WHEN REDEEMED WITHIN 60 DAYS OF PURCHASE.
        </BookingHeroSubline>

        <div style={{ marginBottom: '24px' }}>
          <BookingBodyParagraph>
            BOOK A COMPLIMENTARY CONSULT TO NARROW DOWN TEXTURE, ORIGIN, LENGTH, DENSITY & OVERALL FINISH. THIS DEPOSIT HOLDS YOUR APPOINTMENT & CREDITS TOWARD YOUR UNIT OR INSTALL.
          </BookingBodyParagraph>
          <BookingBodyParagraph style={{ marginBottom: 0 }}>
            SELECT WIG + INSTALL OR WIG ONLY. ADD NOTES ALONG WITH A HAIR INSPO PHOTO FOR THE BEST RESULTS. YOU WILL RECEIVE A FOLLOW-UP RESPONSE WITHIN 72 HOURS WITH A CHECKLIST, PRICE BREAKDOWN & PAYMENT DETAILS.
          </BookingBodyParagraph>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            borderTop: '1px solid #e5e7eb',
            paddingTop: '20px'
          }}
        >
          <div>
            <label htmlFor="hair-inspo" style={labelStyle}>
              HAIR INSPO:
            </label>
            <div style={{ position: 'relative' }}>
              <input
                ref={fileInputRef}
                id="hair-inspo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '36px',
                  opacity: 0,
                  cursor: 'pointer',
                  zIndex: 2
                }}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100%',
                  minHeight: '36px',
                  height: inspoPreview ? 'auto' : '36px',
                  padding: '8px',
                  border: '1.3px solid #000000',
                  fontFamily: bookingFontMedium,
                  fontSize: '11px',
                  fontWeight: 500,
                  backgroundColor: '#FFFFFF',
                  color: inspoFileName ? '#808080' : '#000000',
                  boxSizing: 'border-box',
                  borderRadius: '0',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  position: 'relative',
                  overflow: inspoPreview ? 'visible' : 'hidden',
                  display: inspoPreview ? 'block' : 'flex',
                  alignItems: inspoPreview ? 'normal' : 'center'
                }}
              >
                {inspoPreview ? (
                  <img
                    src={inspoPreview}
                    alt="Hair inspo preview"
                    style={{
                      width: '100%',
                      height: 'auto',
                      objectFit: 'contain',
                      objectPosition: 'left center',
                      display: 'block'
                    }}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        border: '1px solid #808080',
                        borderRadius: '4px',
                        backgroundColor: '#F5F5F5',
                        color: '#000000',
                        textTransform: 'uppercase',
                        fontSize: '11px',
                        fontFamily: bookingFontMedium,
                        fontWeight: 500
                      }}
                    >
                      CHOOSE FILE
                    </span>
                    <span
                      style={{
                        marginLeft: '8px',
                        color: '#808080',
                        fontFamily: bookingFontMedium,
                        fontWeight: 500,
                        fontSize: '10px'
                      }}
                    >
                      {inspoFileName || 'NO FILE SELECTED'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <p style={{ ...labelStyle, marginBottom: '10px', textAlign: 'left' }}>HAIR OPTION:*</p>
            <div className="flex flex-wrap gap-2 justify-start">
              {(['WIG + INSTALL', 'WIG ONLY'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setHairOption(opt)}
                  className="bg-white/80 backdrop-blur-sm"
                  style={{
                    border: '1.3px solid',
                    borderColor: hairOption === opt ? '#EB1C24' : '#000000',
                    fontFamily: bookingFontMedium,
                    fontSize: '10px',
                    fontWeight: 500,
                    padding: '10px 14px',
                    color: '#000000',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em'
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="consult-notes" style={labelStyle}>
              ADDITIONAL NOTES:
            </label>
            <textarea
              id="consult-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              className="bg-white/80 backdrop-blur-sm"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                border: '1.3px solid #000',
                fontFamily: bookingFontMedium,
                fontSize: '11px',
                color: '#000000',
                fontWeight: 500,
                padding: '12px',
                textTransform: 'uppercase',
                resize: 'vertical',
                letterSpacing: '0.03em',
                lineHeight: 1.45
              }}
            />
          </div>

          {formError && (
            <p style={{ fontFamily: bookingFontMedium, fontSize: '10px', color: '#EB1C24', textAlign: 'center', margin: 0, letterSpacing: '0.02em' }}>
              {formError}
            </p>
          )}

          <div className="text-center" style={{ paddingTop: '6px' }}>
            <p className="font-futura text-[12px] md:text-sm lg:text-base font-medium" style={{ color: '#808080' }}>
              TOTAL DUE
            </p>
            <p
              className="text-black font-medium text-base md:text-xl lg:text-2xl"
              style={{ fontFamily: '"Futura PT Medium", Futura, Inter, sans-serif', fontWeight: '500' }}
            >
              {formatUsd(CONSULT_DEPOSIT_USD)}
            </p>
          </div>
        </div>
      </div>
    </BookingFlowLayout>

    <ConfirmationModal
      isOpen={showPremiumConsultUpgradeModal}
      onClose={() => setShowPremiumConsultUpgradeModal(false)}
      onConfirm={() => {
        setShowPremiumConsultUpgradeModal(false);
        prepareMembershipUpgradeNavigation();
        navigate('/account/rewards');
      }}
      title="UPGRADE YOUR SUBSCRIPTION?"
      message="PREMIUM-PATH WIG CONSULTS REQUIRE AN ACTIVE PREMIUM OR BLACK TIER MEMBERSHIP. STANDARD CONSULTS ARE AVAILABLE FROM THE SHOP MENU."
      confirmText="UPGRADE"
      cancelText="CANCEL"
      dataAttribute="upgrade-subscription-modal-booking-premium-consult"
    />
    </>
  );
}
