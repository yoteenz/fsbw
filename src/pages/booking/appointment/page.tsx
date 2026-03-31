import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BookingFlowLayout from '../../../components/BookingFlowLayout';
import BrandExpiresDatePicker from '../../../components/BrandExpiresDatePicker';
import ConfirmationModal from '../../../components/ConfirmationModal';
import {
  BookingBodyParagraph,
  BookingCrumbTitle,
  BookingHeroSubline,
  BookingMutedNote,
  BookingSectionHeading,
  BookingTierBadgeImg,
  NoirStyleAddToBagButton,
  bookingFontBook,
  bookingFontMedium
} from '../../../components/booking/BookingPageChrome';
import { bookingCartItemThumbnailSrc } from '../../../utils/bookingBadges';
import { isPremiumMemberForGatedFeatures, prepareMembershipUpgradeNavigation } from '../../../utils/premiumMemberAccess';

type InstallKind = 'NEW_INSTALL' | 'RE_INSTALL';

const INSTALL_BASE: Record<InstallKind, { label: string; sub: string; price: number }> = {
  NEW_INSTALL: { label: 'NEW INSTALL', sub: '+2 HOURS @ $635', price: 635 },
  RE_INSTALL: { label: 'RE-INSTALL', sub: '+2 HOURS @ $150', price: 150 }
};

const ADDONS = [
  { id: 'braids', label: 'BRAIDS', sub: '+40 MINUTES @ $40', price: 40 },
  { id: 'brow-clean', label: 'BROW CLEAN UP (WAX, TWEEZE + FILL)', sub: '+30 MINUTES @ $30', price: 30 },
  { id: 'brow-tint', label: 'BROW TINT', sub: '+60 MINUTES @ $60', price: 60 },
  { id: 'mink-lashes', label: 'MINK LASHES', sub: '+15 MINUTES @ $15', price: 15 },
  { id: 'makeup', label: 'MAKEUP (LIP WAX, BROW SCULPT + LASHES)', sub: '+2 HOURS @ $100', price: 100 },
  { id: 'travel', label: 'TRAVEL FEE (FLIGHT + OVERNIGHT STAY)', sub: '+24 HOURS @ $600', price: 600 }
] as const;

function ToggleRow({
  checked,
  onToggle,
  label,
  sub
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full gap-3 text-left border border-black bg-white/80 backdrop-blur-sm"
      style={{
        borderWidth: '1.3px',
        borderColor: checked ? '#EB1C24' : '#000',
        padding: '12px 12px',
        alignItems: 'flex-start',
        cursor: 'pointer'
      }}
    >
      <span
        aria-hidden
        style={{
          flexShrink: 0,
          width: '18px',
          height: '18px',
          border: '1.3px solid #000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: bookingFontMedium,
          fontSize: '12px',
          color: checked ? '#EB1C24' : 'transparent'
        }}
      >
        {checked ? '×' : ''}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontFamily: bookingFontMedium,
            fontSize: '10px',
            textTransform: 'uppercase',
            color: '#000',
            display: 'block',
            lineHeight: 1.35,
            letterSpacing: '0.02em'
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: bookingFontMedium,
            fontSize: '9px',
            textTransform: 'uppercase',
            color: '#EB1C24',
            display: 'block',
            marginTop: '5px',
            letterSpacing: '0.02em',
            lineHeight: 1.35
          }}
        >
          {sub}
        </span>
      </span>
    </button>
  );
}

export default function BookingAppointmentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isPremiumBooking = location.pathname.includes('/booking/premium/');
  const [installKind, setInstallKind] = useState<InstallKind>('NEW_INSTALL');
  const [addonIds, setAddonIds] = useState<Set<string>>(() => new Set());
  const [preferredDateIso, setPreferredDateIso] = useState('');
  const [addToBagState, setAddToBagState] = useState<'idle' | 'adding' | 'added'>('idle');
  const [showAppointmentUpgradeModal, setShowAppointmentUpgradeModal] = useState(false);

  /** Installs / hair appointments: premium only. Consultation booking stays open to all signed-in tiers (see consultation page). */
  useEffect(() => {
    if (!isPremiumMemberForGatedFeatures()) {
      setShowAppointmentUpgradeModal(true);
    }
  }, []);

  const toggleAddon = (id: string) => {
    setAddonIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalUsd = useMemo(() => {
    let t = INSTALL_BASE[installKind].price;
    ADDONS.forEach((a) => {
      if (addonIds.has(a.id)) t += a.price;
    });
    return t;
  }, [installKind, addonIds]);

  const bookingBagSubtitle = useMemo(() => {
    const parts = [INSTALL_BASE[installKind].label];
    ADDONS.forEach((a) => {
      if (addonIds.has(a.id)) parts.push(a.label);
    });
    return parts.join(' · ');
  }, [installKind, addonIds]);

  const handleScheduleToBag = () => {
    if (!isPremiumMemberForGatedFeatures()) {
      setShowAppointmentUpgradeModal(true);
      return;
    }
    setAddToBagState('adding');
    setTimeout(() => {
      try {
        const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        const addonList = ADDONS.filter((a) => addonIds.has(a.id)).map((a) => a.id);
        const tier = isPremiumBooking ? 'premium' : 'standard';
        const badgeImage =
          bookingCartItemThumbnailSrc({ type: 'booking-appointment', bookingTier: tier }) ||
          '/assets/appointment-standard.png';
        const newItem = {
          id: `booking-appt-${Date.now()}`,
          name: 'WIG INSTALLATION',
          price: totalUsd,
          quantity: 1,
          image: badgeImage,
          type: 'booking-appointment',
          bookingTier: tier,
          bookingInstallKind: installKind,
          bookingAddonIds: addonList,
          bookingBagSubtitle,
          ...(preferredDateIso.trim() ? { bookingPreferredDate: preferredDateIso.trim() } : {})
        };
        const updated = [newItem, ...cartItems];
        localStorage.setItem('cartItems', JSON.stringify(updated));
        const newCartCount = updated.length;
        localStorage.setItem('cartCount', String(newCartCount));
        window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCartCount }));
        window.dispatchEvent(new Event('cartUpdated'));
        setAddToBagState('added');
        setTimeout(() => setAddToBagState('idle'), 2000);
      } catch (e) {
        console.error(e);
        setAddToBagState('idle');
      }
    }, 400);
  };

  const policyLines = [
    'NEW CLIENTS MUST FIRST PURCHASE YOUR WIG FROM ME. I WILL ONLY RE-INSTALL WIGS I HAVE PREVIOUSLY CUT & LAID.',
    'IF YOU NEED HELP CHOOSING A UNIT FOR YOUR LOOK, BOOK A WIG CONSULTATION FROM THE SHOP MENU.',
    'NEW INSTALLS SHOULD BE BOOKED AT LEAST TWO WEEKS OUT SO YOUR UNIT CAN BE MADE, STYLED, AND PREPPED. RE-INSTALLS SHOULD BE BOOKED AT LEAST ONE WEEK OUT.'
  ];

  return (
    <>
    <BookingFlowLayout
      crumbHighlight="APPOINTMENT"
      belowCard={
        <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto', paddingTop: '8px' }}>
          <NoirStyleAddToBagButton
            state={addToBagState}
            disabled={addToBagState === 'adding'}
            onClick={handleScheduleToBag}
          />
          <BookingMutedNote style={{ marginTop: '10px', marginBottom: 0 }}>
            FINAL TIME AND DATE ARE CONFIRMED AFTER CHECKOUT. USE ORDER NOTES OR CONCIERGE FOR SPECIAL REQUESTS.
          </BookingMutedNote>
        </div>
      }
    >
      <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto', paddingBottom: '12px' }}>
        <BookingCrumbTitle middle={<BookingTierBadgeImg />} />
        <BookingHeroSubline>LOCATED IN MEMPHIS, TN.</BookingHeroSubline>

        <div style={{ marginBottom: '24px' }}>
          {policyLines.map((line, i) => (
            <BookingBodyParagraph
              key={line.slice(0, 28)}
              style={i === policyLines.length - 1 ? { marginBottom: 0 } : undefined}
            >
              {line}
            </BookingBodyParagraph>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
          <BookingSectionHeading accent>ADD TO YOUR APPOINTMENT</BookingSectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
            {ADDONS.map((a) => (
              <ToggleRow
                key={a.id}
                checked={addonIds.has(a.id)}
                onToggle={() => toggleAddon(a.id)}
                label={a.label}
                sub={a.sub}
              />
            ))}
          </div>

          <BookingSectionHeading>SERVICE TYPE</BookingSectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {(Object.keys(INSTALL_BASE) as InstallKind[]).map((kind) => {
              const row = INSTALL_BASE[kind];
              const checked = installKind === kind;
              return (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setInstallKind(kind)}
                  className="flex w-full gap-3 items-start text-left border border-black bg-white/80 backdrop-blur-sm"
                  style={{
                    borderWidth: '1.3px',
                    borderColor: checked ? '#EB1C24' : '#000',
                    padding: '12px 12px',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        fontFamily: bookingFontMedium,
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        color: '#000',
                        display: 'block',
                        letterSpacing: '0.02em',
                        lineHeight: 1.35
                      }}
                    >
                      {row.label}
                    </span>
                    <span
                      style={{
                        fontFamily: bookingFontBook,
                        fontSize: '9px',
                        textTransform: 'uppercase',
                        color: '#EB1C24',
                        display: 'block',
                        marginTop: '5px',
                        letterSpacing: '0.02em',
                        lineHeight: 1.35
                      }}
                    >
                      {row.sub}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    style={{
                      width: '18px',
                      height: '18px',
                      border: '1.3px solid #000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: bookingFontMedium,
                      fontSize: '12px',
                      color: checked ? '#EB1C24' : 'transparent',
                      flexShrink: 0
                    }}
                  >
                    {checked ? '×' : ''}
                  </span>
                </button>
              );
            })}
          </div>

          <BookingSectionHeading accent>PREFERRED APPOINTMENT DATE</BookingSectionHeading>
          <BookingMutedNote>SAME CALENDAR AS ADMIN BRAND — CREATE CODE. FINAL TIME CONFIRMED AFTER CHECKOUT.</BookingMutedNote>
          <div style={{ marginBottom: '22px' }}>
            <BrandExpiresDatePicker value={preferredDateIso} onChange={setPreferredDateIso} />
          </div>

          <div style={{ paddingTop: '6px', textAlign: 'center' }}>
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
              ESTIMATED TOTAL
            </p>
            <p style={{ fontFamily: bookingFontMedium, fontSize: '20px', color: '#000', margin: 0, letterSpacing: '0.02em' }}>
              ${totalUsd} USD
            </p>
          </div>
        </div>
      </div>
    </BookingFlowLayout>

    <ConfirmationModal
      isOpen={showAppointmentUpgradeModal}
      onClose={() => setShowAppointmentUpgradeModal(false)}
      onConfirm={() => {
        setShowAppointmentUpgradeModal(false);
        prepareMembershipUpgradeNavigation();
        navigate('/account/rewards');
      }}
      title="UPGRADE YOUR SUBSCRIPTION?"
      message="HAIR APPOINTMENTS AND INSTALLS ARE FOR PREMIUM MEMBERS. WIG CONSULTS ARE STILL AVAILABLE TO YOU FROM THE SHOP MENU."
      confirmText="UPGRADE"
      cancelText="CANCEL"
      dataAttribute="upgrade-subscription-modal-booking-appointment"
    />
    </>
  );
}
