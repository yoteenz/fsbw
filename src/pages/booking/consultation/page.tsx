import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BookingFlowLayout from '../../../components/BookingFlowLayout';
import BrandExpiresDatePicker from '../../../components/BrandExpiresDatePicker';
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
import { createBookingDateDisabledFn } from '../../../utils/bookingDateRules';
import { isPremiumMemberForGatedFeatures, prepareMembershipUpgradeNavigation } from '../../../utils/premiumMemberAccess';
import { BOOKING_PATHS } from '../../../utils/membershipRoutePolicy';
import { signInHrefWithReturnTo } from '../../../utils/signInReturnTo';

const CONSULT_DEPOSIT_USD = 40;

type HairOption = 'WIG + INSTALL' | 'WIG ONLY';

const MAX_HAIR_INSPO_PHOTOS = 3;

function hairInspoSubmittedLabel(count: number): string {
  return `${count} OF ${MAX_HAIR_INSPO_PHOTOS} PHOTOS SUBMITTED.`;
}

/** Persists across consult URL remounts (`/booking/consultation` → `/booking/premium/consultation` from MembershipRouteSync). */
const CONSULT_INSPO_SESSION_KEY = 'bawBookingConsultHairInspoDraft';

type ConsultInspoItem = { id: string; name: string; dataUrl: string };

function loadInspoDraftFromSession(): ConsultInspoItem[] {
  if (typeof sessionStorage === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(CONSULT_INSPO_SESSION_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (x): x is ConsultInspoItem =>
          Boolean(x) &&
          typeof x === 'object' &&
          typeof (x as ConsultInspoItem).id === 'string' &&
          typeof (x as ConsultInspoItem).name === 'string' &&
          typeof (x as ConsultInspoItem).dataUrl === 'string' &&
          (x as ConsultInspoItem).dataUrl.startsWith('data:')
      )
      .slice(0, MAX_HAIR_INSPO_PHOTOS);
  } catch {
    return [];
  }
}

function readImageFileAsDataUrl(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result;
      resolve(typeof r === 'string' && r.startsWith('data:') ? r : null);
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

/**
 * iOS Photo Library often sends UTType strings (`public.jpeg`, `public.png`, `public.heic`) instead of `image/*`.
 * Empty `type` is common; `application/octet-stream` appears for some HEIC paths.
 */
function isProbablyImageFile(f: File): boolean {
  if (f.size <= 0) return false;
  const t = (f.type || '').trim().toLowerCase();
  if (t.startsWith('image/')) return true;
  if (t === 'application/octet-stream') {
    if (/\.(jpe?g|png|gif|webp|heic|heif|bmp|tif?f)$/i.test(f.name)) return true;
    if (f.name && !f.name.includes('.')) return true;
    if (!f.name) return true;
    return false;
  }
  if (!t) {
    if (/\.(jpe?g|png|gif|webp|heic|heif|bmp|tif?f)$/i.test(f.name)) return true;
    if (f.name && !f.name.includes('.')) return true;
    if (!f.name) return true;
    return false;
  }
  // WebKit/macOS/iOS UTIs and other non-standard MIME hints
  if (
    /jpe?g|png|gif|webp|heic|heif|tiff|bmp|bitmap|uti-image|public\.image|dyn\.a/.test(t)
  ) {
    return true;
  }
  return false;
}

const CONSULT_WIG_INSTALL_TIME_SLOTS = [
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
  '6:00 PM'
] as const;

function formatConsultIsoForDisplay(isoYmd: string): string {
  const [y, m, d] = isoYmd.split('-');
  if (!y || !m || !d) return '';
  return `${m}/${d}/${y}`;
}

function formatConsultTimeSlotForDisplay(slot: string): string {
  const t = slot.trim();
  if (!t) return '';
  return t.replace(/\s+/g, '');
}

/** Standard consult is open to all users; premium members are canonicalized to premium consult path for badge/tier consistency. */
export default function BookingConsultationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isPremiumBooking = location.pathname.includes('/booking/premium/');
  const [authRev, setAuthRev] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hairOption, setHairOption] = useState<HairOption>(() =>
    isPremiumMemberForGatedFeatures() ? 'WIG + INSTALL' : 'WIG ONLY'
  );
  /** Only reset hair option when premium ↔ standard actually changes (not every `signInStateChanged`). */
  const prevPremiumForHairRef = useRef<boolean | null>(null);
  const [notes, setNotes] = useState('');
  const [inspoItems, setInspoItems] = useState<ConsultInspoItem[]>(loadInspoDraftFromSession);
  const [showMaxInspoModal, setShowMaxInspoModal] = useState(false);
  const [addToBagState, setAddToBagState] = useState<'idle' | 'adding' | 'added'>('idle');
  const [consultFormNotice, setConsultFormNotice] = useState<{ title: string; message: string } | null>(
    null
  );
  const [inspoRemoveTargetId, setInspoRemoveTargetId] = useState<string | null>(null);
  const [showConsultAccessModal, setShowConsultAccessModal] = useState(false);
  const [showWigInstallFeatureModal, setShowWigInstallFeatureModal] = useState(false);
  const [consultPreferredDateIso, setConsultPreferredDateIso] = useState('');
  const [consultPreferredTime, setConsultPreferredTime] = useState('');
  const [showConsultTimeDropdown, setShowConsultTimeDropdown] = useState(false);
  const { formatUsd } = useSelectedCurrencyDisplay();

  const isPremium = isPremiumMemberForGatedFeatures();
  const consultScheduledSummaryVisible =
    Boolean(consultPreferredDateIso.trim()) && Boolean(consultPreferredTime.trim());
  const consultWigInstallDateDisabled = useMemo(() => createBookingDateDisabledFn('two_calendar_months'), []);

  useEffect(() => {
    try {
      if (inspoItems.length === 0) {
        sessionStorage.removeItem(CONSULT_INSPO_SESSION_KEY);
      } else {
        sessionStorage.setItem(CONSULT_INSPO_SESSION_KEY, JSON.stringify(inspoItems));
      }
    } catch {
      /* quota / private mode */
    }
  }, [inspoItems]);

  useEffect(() => {
    const d = consultPreferredDateIso.trim();
    if (!d || !consultWigInstallDateDisabled(d)) return;
    setConsultPreferredDateIso('');
    setConsultPreferredTime('');
    setShowConsultTimeDropdown(false);
  }, [consultPreferredDateIso, consultWigInstallDateDisabled]);

  useEffect(() => {
    const bump = () => setAuthRev((n) => n + 1);
    window.addEventListener('signInStateChanged', bump);
    return () => window.removeEventListener('signInStateChanged', bump);
  }, []);

  useEffect(() => {
    const premium = isPremiumMemberForGatedFeatures();
    const prev = prevPremiumForHairRef.current;
    if (prev === null) {
      prevPremiumForHairRef.current = premium;
      return;
    }
    if (prev !== premium) {
      prevPremiumForHairRef.current = premium;
      setHairOption(premium ? 'WIG + INSTALL' : 'WIG ONLY');
    }
  }, [authRev]);

  /** Premium vs standard URL alignment: `MembershipRouteSync` + `membershipRoutePolicy`. Modal when non-premium hits premium path. */
  useEffect(() => {
    const premium = isPremiumMemberForGatedFeatures();
    if (isPremiumBooking && !premium) {
      setShowConsultAccessModal(true);
      return;
    }
    setShowConsultAccessModal(false);
  }, [isPremiumBooking, authRev]);

  useEffect(() => {
    if (hairOption !== 'WIG + INSTALL' || !isPremiumMemberForGatedFeatures()) {
      setConsultPreferredDateIso('');
      setConsultPreferredTime('');
      setShowConsultTimeDropdown(false);
    }
  }, [hairOption, authRev]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    // Snapshot files BEFORE clearing value. On iOS Safari/WebKit, resetting `value`
    // immediately can empty or invalidate `FileList`, so previews never appear.
    const files = input.files ? Array.from(input.files) : [];
    input.value = '';
    if (!files.length) return;

    const picked = files.filter(isProbablyImageFile);
    if (!picked.length) return;

    // Read sequentially so parallel FileReader onload handlers never race on `setInspoItems` (same base `prev`).
    void (async () => {
      const built: ConsultInspoItem[] = [];
      let i = 0;
      for (const f of picked) {
        const dataUrl = await readImageFileAsDataUrl(f);
        if (dataUrl) {
          built.push({
            id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 11)}-${(f.name || 'img').slice(0, 24)}`,
            name: f.name || 'IMAGE',
            dataUrl
          });
        }
        i += 1;
      }
      if (built.length === 0) return;

      setInspoItems((prev) => {
        const room = MAX_HAIR_INSPO_PHOTOS - prev.length;
        if (room <= 0) {
          queueMicrotask(() => setShowMaxInspoModal(true));
          return prev;
        }
        const toAdd = built.slice(0, room);
        if (picked.length > room || built.length > room) {
          queueMicrotask(() => setShowMaxInspoModal(true));
        }
        return [...prev, ...toAdd].slice(0, MAX_HAIR_INSPO_PHOTOS);
      });
    })();
  };

  const confirmRemoveInspoItem = () => {
    if (!inspoRemoveTargetId) return;
    setInspoItems((prev) => prev.filter((x) => x.id !== inspoRemoveTargetId));
    setInspoRemoveTargetId(null);
  };

  const handleAddToBag = () => {
    setConsultFormNotice(null);
    if (inspoItems.length === 0) {
      setConsultFormNotice({
        title: 'FORGETTING SOMETHING?',
        message: 'PLEASE UPLOAD A HAIR INSPO PHOTO.'
      });
      return;
    }
    if (hairOption === 'WIG + INSTALL' && !isPremiumMemberForGatedFeatures()) {
      setShowWigInstallFeatureModal(true);
      return;
    }
    if (hairOption === 'WIG + INSTALL' && isPremiumMemberForGatedFeatures()) {
      const d = consultPreferredDateIso.trim();
      const tm = consultPreferredTime.trim();
      if (!d || !tm) {
        setConsultFormNotice({
          title: 'FORGETTING SOMETHING?',
          message: 'PLEASE SELECT A PREFERRED DATE AND TIME.'
        });
        return;
      }
      if (consultWigInstallDateDisabled(d)) {
        setConsultFormNotice({
          title: 'DATE NOT AVAILABLE',
          message: 'SELECTED DATE IS NOT AVAILABLE. PLEASE CHOOSE ANOTHER.'
        });
        return;
      }
    }
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
          bookingInspoPhotoUrls: inspoItems.map((it) => it.dataUrl).slice(0, MAX_HAIR_INSPO_PHOTOS),
          bookingInspoFileNames: inspoItems.map((it) => it.name),
          bookingInspoFileName: inspoItems.map((it) => it.name).join(' · '),
          bookingBagSubtitle: hairOption,
          ...(hairOption === 'WIG + INSTALL' && consultPreferredDateIso.trim()
            ? { bookingPreferredDate: consultPreferredDateIso.trim() }
            : {}),
          ...(hairOption === 'WIG + INSTALL' && consultPreferredTime.trim()
            ? { bookingPreferredTime: consultPreferredTime.trim() }
            : {})
        };
        const updated = [newItem, ...cartItems];
        localStorage.setItem('cartItems', JSON.stringify(updated));
        const newCartCount = updated.length;
        localStorage.setItem('cartCount', String(newCartCount));
        window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCartCount }));
        window.dispatchEvent(new Event('cartUpdated'));
        try {
          sessionStorage.removeItem(CONSULT_INSPO_SESSION_KEY);
        } catch {
          /* ignore */
        }
        setInspoItems([]);
        setAddToBagState('added');
        setTimeout(() => {
          setAddToBagState('idle');
          navigate('/checkout/bookings');
        }, 600);
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
            idleLabel="PROCEED TO CHECKOUT"
            alwaysShowIdleLabel
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
        <div style={{ marginTop: '-2px' }}>
          <BookingHeroSubline>
            THIS DEPOSIT SERVES AS A CREDIT TOWARDS YOUR WIG OR INSTALL WHEN REDEEMED WITHIN 72 HOURS OF YOUR QUOTE.
          </BookingHeroSubline>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <BookingBodyParagraph>
            BOOK A COMPLIMENTARY CONSULT TO NARROW DOWN TEXTURE, ORIGIN, LENGTH, DENSITY OR OVERALL FINISH. SELECT WIG + INSTALL OR WIG ONLY.
          </BookingBodyParagraph>
          <BookingBodyParagraph style={{ marginBottom: 0 }}>
            ADD NOTES ALONG WITH HAIR INSPO PHOTOS FOR THE BEST, MOST ACCURATE RESULTS. YOU WILL RECEIVE A FOLLOW UP RESPONSE WITHIN 72 HOURS WITH A CHECKLIST, PRICE BREAKDOWN & PAYMENT DETAILS.
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
          <div style={{ width: '100%', minWidth: 0 }}>
            <p id="consult-inspo-heading" style={{ ...labelStyle, marginTop: 0 }}>
              HAIR INSPO:
              <span style={{ color: '#EB1C24' }}>*</span>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                {inspoItems.length < MAX_HAIR_INSPO_PHOTOS ? (
                  <>
                    <input
                      ref={fileInputRef}
                      id="consult-hair-inspo-file"
                      type="file"
                      accept="image/*,.heic,.heif"
                      multiple
                      aria-labelledby="consult-inspo-heading"
                      onChange={handleFileChange}
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '36px',
                        opacity: 0,
                        cursor: 'pointer',
                        zIndex: 3,
                        top: 0,
                        left: 0,
                        margin: 0
                      }}
                    />
                    <div
                      role="presentation"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        width: '100%',
                        minHeight: '36px',
                        height: '36px',
                        padding: '8px',
                        border: '1.3px solid #000000',
                        fontFamily: bookingFontMedium,
                        fontSize: '11px',
                        fontWeight: 500,
                        backgroundColor: '#FFFFFF',
                        color: inspoItems.length > 0 ? '#808080' : '#000000',
                        boxSizing: 'border-box',
                        borderRadius: '0',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        textAlign: 'left'
                      }}
                    >
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
                          fontWeight: 500,
                          flexShrink: 0,
                          whiteSpace: 'nowrap'
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
                          fontSize: '10px',
                          flex: 1,
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {inspoItems.length > 0 ? hairInspoSubmittedLabel(inspoItems.length) : 'NO FILE SELECTED'}
                      </span>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowMaxInspoModal(true)}
                    style={{
                      width: '100%',
                      minHeight: '36px',
                      height: '36px',
                      padding: '8px',
                      border: '1.3px solid #000000',
                      fontFamily: bookingFontMedium,
                      fontSize: '11px',
                      fontWeight: 500,
                      backgroundColor: '#FFFFFF',
                      color: '#808080',
                      boxSizing: 'border-box',
                      borderRadius: '0',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
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
                      {hairInspoSubmittedLabel(inspoItems.length)}
                    </span>
                  </button>
                )}
              </div>

              {inspoItems.length > 0 ? (
                <div
                  className="consult-hair-inspo-thumbs"
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: '13px',
                    width: '100%',
                    marginTop: '14px',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    minHeight: '88px'
                  }}
                >
                  {inspoItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        position: 'relative',
                        width: '88px',
                        height: '88px',
                        flexShrink: 0
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setInspoRemoveTargetId(item.id)}
                        aria-label="Remove inspo photo"
                        style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-4px',
                          width: '14px',
                          height: '14px',
                          backgroundColor: '#FFFFFF',
                          border: '0.97px solid #000000',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 10,
                          padding: 0,
                          flexShrink: 0
                        }}
                      >
                        <img
                          src="/assets/close-icon.svg"
                          alt=""
                          style={{
                            width: '8.4px',
                            height: '8.4px',
                            objectFit: 'contain',
                            display: 'block',
                            flexShrink: 0,
                            filter:
                              'brightness(0) saturate(100%) invert(20%) sepia(93%) saturate(7151%) hue-rotate(349deg) brightness(92%) contrast(92%)'
                          }}
                        />
                      </button>
                      <div
                        style={{
                          position: 'relative',
                          padding: '1px',
                          border: '3px solid white',
                          boxShadow: '0 0 0 1.1px black',
                          boxSizing: 'border-box',
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: '#f5f5f5',
                          overflow: 'hidden'
                        }}
                      >
                        <img
                          src={item.dataUrl}
                          alt=""
                          loading="eager"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center',
                            display: 'block'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div style={{ width: '100%', minWidth: 0 }}>
            <p style={{ ...labelStyle, marginBottom: '10px', textAlign: 'left' }}>
              HAIR OPTION:
              <span style={{ color: '#EB1C24' }}>*</span>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(['WIG + INSTALL', 'WIG ONLY'] as const).map((opt) => {
                const checked = hairOption === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setHairOption(opt)}
                    className="flex w-full text-left border border-black bg-white/80 backdrop-blur-sm"
                    style={{
                      borderWidth: '1.3px',
                      borderColor: checked ? '#EB1C24' : '#000',
                      padding: '12px 12px',
                      cursor: 'pointer',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      gap: 0
                    }}
                  >
                    <span
                      style={{
                        fontFamily: bookingFontMedium,
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        color: checked ? '#EB1C24' : '#000',
                        display: 'block',
                        letterSpacing: '0.02em',
                        lineHeight: 1.35
                      }}
                    >
                      {opt}
                    </span>
                    {opt === 'WIG + INSTALL' && checked && !isPremium ? (
                      <p
                        style={{
                          fontFamily: bookingFontBook,
                          fontSize: '9px',
                          color: '#000000',
                          textTransform: 'uppercase',
                          margin: '10px 0 0',
                          padding: 0,
                          lineHeight: 1.45,
                          letterSpacing: '0.02em',
                          textAlign: 'left',
                          width: '100%'
                        }}
                      >
                        THIS OPTION IS FOR PREMIUM MEMBERS ONLY.
                      </p>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ width: '100%', minWidth: 0 }}>
            <label htmlFor="consult-notes" style={{ ...labelStyle, marginBottom: '7px' }}>
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
                minWidth: 0,
                maxWidth: '100%',
                boxSizing: 'border-box',
                border: '1.3px solid #000',
                fontFamily: bookingFontMedium,
                fontSize: '11px',
                color: '#EB1C24',
                fontWeight: 500,
                padding: '12px',
                textTransform: 'uppercase',
                resize: 'vertical',
                letterSpacing: '0.03em',
                lineHeight: 1.45
              }}
            />
          </div>

          {hairOption === 'WIG + INSTALL' && isPremium ? (
            <>
              <div
                style={{
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: '20px',
                  marginTop: 0,
                  marginBottom: consultScheduledSummaryVisible ? '16px' : '10px'
                }}
              >
                <BrandExpiresDatePicker
                  inline
                  navArrowScale={0.75}
                  monthLabelVariant="adminMeetings"
                  value={consultPreferredDateIso}
                  onChange={(iso) => {
                    setConsultPreferredDateIso(iso);
                    setConsultPreferredTime('');
                    setShowConsultTimeDropdown(false);
                  }}
                  isDateDisabled={consultWigInstallDateDisabled}
                />
              </div>
              {consultPreferredDateIso ? (
                <div style={{ marginBottom: '12px' }}>
                  <label
                    style={{
                      fontFamily: bookingFontMedium,
                      fontSize: '10px',
                      color: '#000',
                      textTransform: 'uppercase',
                      margin: '0 0 6px',
                      display: 'block',
                      letterSpacing: '0.02em'
                    }}
                  >
                    AVAILABLE TIME SLOTS:
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowConsultTimeDropdown((v) => !v)}
                      className="w-full"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        height: '36px',
                        border: '1.3px solid #000',
                        borderRadius: 0,
                        fontFamily: bookingFontMedium,
                        fontSize: '11px',
                        background: '#fff',
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        color: consultPreferredTime ? '#000' : '#808080',
                        letterSpacing: '0.02em'
                      }}
                    >
                      <span>{consultPreferredTime || 'SELECT A TIME'}</span>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        className="flex-shrink-0"
                        style={{
                          transform: showConsultTimeDropdown ? 'rotate(180deg)' : 'none',
                          color: '#EB1C24',
                          marginLeft: '8px'
                        }}
                      >
                        <path
                          d="M3 4.5L6 7.5L9 4.5"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    {showConsultTimeDropdown ? (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          aria-hidden="true"
                          onClick={() => setShowConsultTimeDropdown(false)}
                        />
                        <div
                          className="absolute left-0 right-0 py-1 bg-white border border-black shadow-lg z-20 max-h-48 overflow-y-auto"
                          style={{ borderWidth: '1.3px', borderRadius: 0, marginTop: '7px' }}
                        >
                          {CONSULT_WIG_INSTALL_TIME_SLOTS.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => {
                                setConsultPreferredTime(slot);
                                setShowConsultTimeDropdown(false);
                              }}
                              className="w-full text-left px-3 py-2 text-xs uppercase hover:bg-gray-100 transition-colors"
                              style={{ fontFamily: '"Futura PT Book"', color: '#000', fontWeight: 400 }}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              ) : null}
              {consultPreferredDateIso && consultPreferredTime ? (
                <p
                  style={{
                    fontFamily: bookingFontMedium,
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    margin: '0 0 12px',
                    lineHeight: 1.45,
                    letterSpacing: '0.02em'
                  }}
                >
                  SCHEDULED DATE & TIME: {formatConsultIsoForDisplay(consultPreferredDateIso)} @{' '}
                  {formatConsultTimeSlotForDisplay(consultPreferredTime)}.
                  <br />
                  FINAL DURATION CONFIRMED AFTER CHECKOUT.
                </p>
              ) : null}
            </>
          ) : null}

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
      isOpen={Boolean(consultFormNotice)}
      onClose={() => setConsultFormNotice(null)}
      onConfirm={() => setConsultFormNotice(null)}
      title={consultFormNotice?.title ?? ''}
      message={consultFormNotice?.message ?? ''}
      confirmText="OK"
      cancelText=""
      dataAttribute="consult-form-notice-modal"
    />

    <ConfirmationModal
      isOpen={inspoRemoveTargetId !== null}
      onClose={() => setInspoRemoveTargetId(null)}
      onConfirm={() => {
        confirmRemoveInspoItem();
      }}
      title="REMOVE PHOTO?"
      message="REMOVE THIS HAIR INSPO PHOTO?"
      confirmText="REMOVE"
      cancelText="CANCEL"
      dataAttribute="consult-remove-inspo-modal"
    />

    <ConfirmationModal
      isOpen={showConsultAccessModal}
      onClose={() => {
        setShowConsultAccessModal(false);
        navigate(BOOKING_PATHS.STANDARD_CONSULT, { replace: true });
      }}
      onConfirm={() => {
        setShowConsultAccessModal(false);
        navigate(BOOKING_PATHS.STANDARD_CONSULT, { replace: true });
      }}
      title="UPGRADE YOUR SUBSCRIPTION?"
      message="YOU MUST BE A PREMIUM MEMBER TO ACCESS THIS AREA."
      confirmText="GO TO STANDARD CONSULT"
      cancelText="CANCEL"
      dataAttribute="upgrade-subscription-modal-booking-premium-consult"
    />

    <ConfirmationModal
      isOpen={showWigInstallFeatureModal}
      onClose={() => setShowWigInstallFeatureModal(false)}
      onConfirm={() => {
        setShowWigInstallFeatureModal(false);
        if (localStorage.getItem('isSignedIn') === 'true') {
          prepareMembershipUpgradeNavigation();
          navigate('/account/rewards');
          return;
        }
        navigate(signInHrefWithReturnTo(location));
      }}
      title="UPGRADE YOUR SUBSCRIPTION?"
      message="YOU MUST BE A PREMIUM MEMBER TO USE THIS FEATURE."
      confirmText="UPGRADE"
      cancelText="CANCEL"
      dataAttribute="upgrade-subscription-modal-booking-consult-wig-install"
    />

    <ConfirmationModal
      isOpen={showMaxInspoModal}
      onClose={() => setShowMaxInspoModal(false)}
      onConfirm={() => setShowMaxInspoModal(false)}
      title="MAX PHOTOS REACHED."
      message="REMOVE OR REPLACE AN IMAGE TO ADD MORE."
      confirmText="CLOSE"
      cancelText=""
      dataAttribute="consult-max-hair-inspo-photos-modal"
    />

    </>
  );
}
