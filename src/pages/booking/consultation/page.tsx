import { useRef, useState, type ChangeEvent } from 'react';
import { useLocation } from 'react-router-dom';
import BookingFlowLayout from '../../../components/BookingFlowLayout';
import {
  BookingBodyParagraph,
  BookingCrumbTitle,
  BookingHeroSubline,
  BookingMutedNote,
  BookingTierBadgeImg,
  NoirStyleAddToBagButton,
  bookingFontBook,
  bookingFontMedium
} from '../../../components/booking/BookingPageChrome';
import { bookingCartItemThumbnailSrc } from '../../../utils/bookingBadges';

const CONSULT_DEPOSIT_USD = 25;

type HairOption = 'WIG + INSTALL' | 'WIG ONLY';

export default function BookingConsultationPage() {
  const location = useLocation();
  const isPremiumBooking = location.pathname.includes('/booking/premium/');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hairOption, setHairOption] = useState<HairOption>('WIG + INSTALL');
  const [notes, setNotes] = useState('');
  const [inspoFileName, setInspoFileName] = useState('');
  const [inspoPreview, setInspoPreview] = useState<string | null>(null);
  const [addToBagState, setAddToBagState] = useState<'idle' | 'adding' | 'added'>('idle');
  const [formError, setFormError] = useState<string | null>(null);

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
          name: isPremiumBooking ? 'WIG CONSULT (PREMIUM)' : 'WIG CONSULT',
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
    fontFamily: bookingFontBook,
    fontSize: '11px' as const,
    color: '#000000',
    textTransform: 'uppercase' as const,
    marginBottom: '6px',
    display: 'block' as const,
    letterSpacing: '0.03em'
  };

  return (
    <BookingFlowLayout
      crumbHighlight="CONSULT"
      belowCard={
        <div className="w-full px-5" style={{ boxSizing: 'border-box' }}>
          <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto' }}>
            <NoirStyleAddToBagButton
              state={addToBagState}
              disabled={addToBagState === 'adding'}
              onClick={handleAddToBag}
            />
            <BookingMutedNote style={{ marginTop: '10px', marginBottom: 0 }}>
              DEPOSIT IS NON-REFUNDABLE AND CREDITED WHEN YOU PURCHASE YOUR WIG OR BOOK INSTALLATION.
            </BookingMutedNote>
          </div>
        </div>
      }
    >
      <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto', paddingBottom: '12px' }}>
        <BookingCrumbTitle middle={<BookingTierBadgeImg />}>CONSULT</BookingCrumbTitle>
        <BookingHeroSubline>NON-REFUNDABLE DEPOSIT APPLIES TOWARD YOUR WIG OR INSTALL</BookingHeroSubline>

        <div style={{ marginBottom: '22px' }}>
          <BookingBodyParagraph>
            BOOK A COMPLIMENTARY-STYLE CONSULT TO NARROW TEXTURE, ORIGIN, LENGTH, DENSITY, AND FINISH. YOUR DEPOSIT HOLDS YOUR SPOT AND CREDITS TOWARD YOUR UNIT OR INSTALL WHEN YOU MOVE FORWARD.
          </BookingBodyParagraph>
          <BookingBodyParagraph style={{ marginBottom: 0 }}>
            PICK WIG + INSTALL OR WIG ONLY, ADD NOTES, AND OPTIONALLY ADD A CLEAR INSPO PHOTO. YOU WILL RECEIVE A FOLLOW-UP WITH A CHECKLIST, PRICE BREAKDOWN, AND DEPOSIT DETAILS BY EMAIL.
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
              <span style={{ color: '#EB1C24', fontFamily: bookingFontMedium }}>HAIR INSPO</span>
              <span style={{ color: '#808080', fontFamily: bookingFontBook, fontSize: '9px' }}> (OPTIONAL)</span>
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
                  height: '40px',
                  opacity: 0,
                  cursor: 'pointer',
                  zIndex: 2
                }}
              />
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                className="bg-white/80 backdrop-blur-sm"
                style={{
                  width: '100%',
                  minHeight: '40px',
                  padding: '10px',
                  border: '1.3px solid #000000',
                  fontFamily: bookingFontBook,
                  fontSize: '11px',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em'
                }}
              >
                {inspoPreview ? (
                  <img src={inspoPreview} alt="Hair inspo preview" style={{ maxWidth: '100%', maxHeight: '160px', objectFit: 'contain' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <span
                      style={{
                        padding: '5px 10px',
                        border: '1.3px solid #000',
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                        color: '#000000',
                        fontSize: '10px',
                        fontFamily: bookingFontMedium,
                        letterSpacing: '0.04em'
                      }}
                    >
                      CHOOSE FILE
                    </span>
                    <span style={{ color: '#808080', fontFamily: bookingFontBook, fontSize: '10px' }}>
                      {inspoFileName || 'NO FILE SELECTED'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <p style={{ ...labelStyle, marginBottom: '10px', textAlign: 'center' }}>
              <span style={{ color: '#EB1C24', fontFamily: bookingFontMedium }}>HAIR OPTION</span>
              <span style={{ color: '#EB1C24' }}>*</span>
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {(['WIG + INSTALL', 'WIG ONLY'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setHairOption(opt)}
                  className="border border-black bg-white/80 backdrop-blur-sm"
                  style={{
                    borderWidth: '1.3px',
                    fontFamily: bookingFontMedium,
                    fontSize: '10px',
                    fontWeight: 500,
                    padding: '10px 14px',
                    color: hairOption === opt ? '#EB1C24' : '#000000',
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
              ADDITIONAL NOTES
            </label>
            <textarea
              id="consult-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="WRITE YOUR COMMENT HERE."
              rows={5}
              className="bg-white/80 backdrop-blur-sm"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                border: '1.3px solid #000',
                fontFamily: bookingFontBook,
                fontSize: '11px',
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

          <div
            style={{
              borderTop: '1px solid #e5e7eb',
              paddingTop: '18px',
              textAlign: 'center'
            }}
          >
            <p
              style={{
                fontFamily: bookingFontBook,
                fontSize: '10px',
                color: '#808080',
                textTransform: 'uppercase',
                margin: '0 0 6px',
                letterSpacing: '0.04em'
              }}
            >
              TOTAL DUE
            </p>
            <p style={{ fontFamily: bookingFontMedium, fontSize: '20px', color: '#000', margin: 0, letterSpacing: '0.02em' }}>
              ${CONSULT_DEPOSIT_USD} USD
            </p>
          </div>
        </div>
      </div>
    </BookingFlowLayout>
  );
}
