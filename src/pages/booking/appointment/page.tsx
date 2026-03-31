import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BookingFlowLayout from '../../../components/BookingFlowLayout';
import BrandExpiresDatePicker from '../../../components/BrandExpiresDatePicker';
import ConfirmationModal from '../../../components/ConfirmationModal';
import {
  BookingBodyParagraph,
  BookingCrumbTitle,
  BookingHeroSubline,
  BookingSectionHeading,
  BookingTierBadgeImg,
  NoirStyleAddToBagButton,
  bookingFontBook,
  bookingFontMedium
} from '../../../components/booking/BookingPageChrome';
import { useSelectedCurrencyDisplay } from '../../../hooks/useSelectedCurrencyDisplay';
import { bookingCartItemThumbnailSrc } from '../../../utils/bookingBadges';
import { isPremiumMemberForGatedFeatures, prepareMembershipUpgradeNavigation } from '../../../utils/premiumMemberAccess';

type InstallKind = 'NEW_INSTALL' | 'RE_INSTALL';

const INSTALL_BASE: Record<InstallKind, { label: string; sub: string; price: number }> = {
  NEW_INSTALL: { label: 'NEW INSTALL', sub: '+2.5 HOURS', price: 250 },
  RE_INSTALL: { label: 'RE-INSTALL', sub: '+2 HOURS', price: 200 }
};

/** Base service length in minutes (before add-ons). */
const INSTALL_BASE_MINUTES: Record<InstallKind, number> = {
  NEW_INSTALL: 150,
  RE_INSTALL: 120
};

/** Extra minutes per add-on id (must match `AppointmentAddon` ids). */
const ADDON_DURATION_MINUTES: Record<string, number> = {
  braids: 60,
  'brow-clean': 40,
  'brow-tint': 60,
  'mink-lashes': 20,
  makeup: 120,
  'clean-lace': 40,
  travel: 24 * 60
};

function formatEstimatedAppointmentTime(totalMinutes: number): string {
  if (totalMinutes <= 0) return '~0 MINUTES';
  let remaining = totalMinutes;
  const days = Math.floor(remaining / (24 * 60));
  remaining %= 24 * 60;
  const hours = Math.floor(remaining / 60);
  const mins = remaining % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days} DAY${days === 1 ? '' : 'S'}`);
  if (hours > 0) parts.push(`${hours} HOUR${hours === 1 ? '' : 'S'}`);
  if (mins > 0) parts.push(`${mins} MINUTE${mins === 1 ? '' : 'S'}`);
  if (parts.length === 0) parts.push('0 MINUTES');
  return parts.join(' ');
}

type AppointmentAddon = { id: string; label: string; sub: string; price: number };

const ADDONS_BASE: AppointmentAddon[] = [
  { id: 'braids', label: 'BRAIDS', sub: '+60 MINUTES', price: 60 },
  { id: 'brow-clean', label: 'BROW CLEAN UP', sub: '+40 MINUTES', price: 40 },
  { id: 'brow-tint', label: 'BROW TINT', sub: '+60 MINUTES', price: 60 },
  { id: 'mink-lashes', label: 'MINK LASHES', sub: '+20 MINUTES', price: 20 },
  { id: 'makeup', label: 'MAKEUP', sub: '+2 HOURS', price: 200 }
];

const ADDON_CLEAN_LACE: AppointmentAddon = {
  id: 'clean-lace',
  label: 'CLEAN LACE',
  sub: '+40 MINUTES',
  price: 40
};

const ADDON_TRAVEL: AppointmentAddon = {
  id: 'travel',
  label: 'TRAVEL FEE',
  sub: '+24 HOURS',
  price: 1200
};

/** Shown below the red duration line when the add-on row is selected (checked). */
const ADDON_DETAIL_LINES: Record<string, ReactNode> = {
  'clean-lace':
    'THIS SERVICE INCLUDES REMOVING GLUE & GUNK FROM YOUR LACE. MUST BE DROPPED OFF 1 WEEK PRIOR TO SERVICE.',
  braids:
    'THIS SERVICE INCLUDES 8-10 BRAIDS, DEPENDING ON HAIR DENSITY. COME WASHED & BLOW DRYED.',
  'brow-clean': 'THIS SERVICE INCLUDES WAXING, TWEEZING & SCULPTING.',
  'brow-tint': 'THIS SERVICE INCLUDES WAXING, TWEEZING & SEMI-PERMANENT TINT.',
  'mink-lashes': 'THIS SERVICE INCLUDES APPLICATION OF AUTHENTIC MINK LASHES.',
  makeup: 'THIS SERVICE INCLUDES LIP WAXING, BROW SCULPTING & MINK LASHES.',
  travel: (
    <>
      THIS IS AN ESTIMATE AMOUNT FOR FLIGHT & OVERNIGHT STAY.
      <br />
      FINAL COSTS WILL BE CALCULATED BASED ON YOUR CITY & COUNTRY.
    </>
  )
};

/** Shown when NEW INSTALL or RE-INSTALL is the active service type. */
const INSTALL_KIND_DETAIL_LINES: Record<InstallKind, string> = {
  NEW_INSTALL: 'THIS SERVICE INCLUDES LACE CUSTOMIZATION & STYLING.',
  RE_INSTALL: 'THIS SERVICE INCLUDES LACE CUSTOMIZATION & STYLING.'
};

function appointmentAddonsForInstall(kind: InstallKind): AppointmentAddon[] {
  if (kind === 'RE_INSTALL') {
    return [ADDON_CLEAN_LACE, ...ADDONS_BASE, ADDON_TRAVEL];
  }
  return [...ADDONS_BASE, ADDON_TRAVEL];
}

function ToggleRow({
  checked,
  onToggle,
  label,
  sub,
  priceDisplay,
  detailLine
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  sub: string;
  priceDisplay: string;
  detailLine?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full text-left border border-black bg-white/80 backdrop-blur-sm"
      style={{
        borderWidth: '1.3px',
        borderColor: checked ? '#EB1C24' : '#000',
        padding: '12px 12px',
        flexDirection: 'column',
        alignItems: 'stretch',
        cursor: 'pointer',
        gap: 0
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', width: '100%' }}>
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
        <span
          style={{
            flexShrink: 0,
            fontFamily: bookingFontMedium,
            fontSize: '10px',
            color: '#808080',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            alignSelf: 'center'
          }}
        >
          {priceDisplay}
        </span>
      </div>
      {checked && detailLine ? (
        <p
          style={{
            fontFamily: bookingFontBook,
            fontSize: '9px',
            color: '#000',
            textTransform: 'uppercase',
            margin: '10px 0 0',
            padding: 0,
            lineHeight: 1.45,
            letterSpacing: '0.02em',
            textAlign: 'left',
            width: '100%'
          }}
        >
          {detailLine}
        </p>
      ) : null}
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
  const { formatUsd } = useSelectedCurrencyDisplay();

  /** Installs / hair appointments: premium only. Standard consult: `/booking/consultation`. Premium-path consult: `/booking/premium/*` — same membership gate as this page (see consultation page). */
  useEffect(() => {
    if (!isPremiumMemberForGatedFeatures()) {
      setShowAppointmentUpgradeModal(true);
    }
  }, []);

  /** CLEAN LACE is only valid for RE-INSTALL; drop selection when switching to NEW INSTALL. */
  useEffect(() => {
    if (installKind !== 'RE_INSTALL') {
      setAddonIds((prev) => {
        if (!prev.has('clean-lace')) return prev;
        const next = new Set(prev);
        next.delete('clean-lace');
        return next;
      });
    }
  }, [installKind]);

  const toggleAddon = (id: string) => {
    setAddonIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const visibleAddons = useMemo(() => appointmentAddonsForInstall(installKind), [installKind]);

  const totalUsd = useMemo(() => {
    let t = INSTALL_BASE[installKind].price;
    visibleAddons.forEach((a) => {
      if (addonIds.has(a.id)) t += a.price;
    });
    return t;
  }, [installKind, addonIds, visibleAddons]);

  const estimatedMinutes = useMemo(() => {
    let m = INSTALL_BASE_MINUTES[installKind];
    visibleAddons.forEach((a) => {
      if (addonIds.has(a.id)) {
        const extra = ADDON_DURATION_MINUTES[a.id];
        if (extra != null) m += extra;
      }
    });
    return m;
  }, [installKind, addonIds, visibleAddons]);

  const bookingBagSubtitle = useMemo(() => {
    const parts = [INSTALL_BASE[installKind].label];
    visibleAddons.forEach((a) => {
      if (addonIds.has(a.id)) parts.push(a.label);
    });
    return parts.join(' · ');
  }, [installKind, addonIds, visibleAddons]);

  const handleScheduleToBag = () => {
    if (!isPremiumMemberForGatedFeatures()) {
      setShowAppointmentUpgradeModal(true);
      return;
    }
    setAddToBagState('adding');
    setTimeout(() => {
      try {
        const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        const addonList = appointmentAddonsForInstall(installKind)
          .filter((a) => addonIds.has(a.id))
          .map((a) => a.id);
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
    'NEW CLIENTS ARE REQUIRED TO PURCHASE A UNIT PRIOR TO INSTALLATION.',
    'I WILL ONLY RE-INSTALL WIGS I HAVE PREVIOUSLY CUT & LAID.',
    'IF YOU NEED HELP CHOOSING A UNIT FOR YOUR LOOK, BOOK A WIG CONSULTATION FROM THE SHOP MENU.',
    'NEW INSTALLS SHOULD BE BOOKED AT LEAST TWO MONTHS IN ADVANCE SO YOUR UNIT CAN BE CONSTRUCTED, CUSTOMIZED, STYLED & READY FOR INSTALLATION. RE-INSTALLS SHOULD BE BOOKED AT LEAST ONE WEEK IN ADVANCE USING THE "CLEAN LACE" ADD ON IF APPLICABLE.'
  ];

  return (
    <>
    <BookingFlowLayout
      crumbHighlight="APPOINTMENT"
      belowCard={
        <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto', paddingTop: '2px' }}>
          <NoirStyleAddToBagButton
            state={addToBagState}
            disabled={addToBagState === 'adding'}
            onClick={handleScheduleToBag}
          />
        </div>
      }
    >
      <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto', paddingBottom: '12px' }}>
        <BookingCrumbTitle middle={<BookingTierBadgeImg />} hideRule>
          {null}
        </BookingCrumbTitle>
        <BookingHeroSubline>LOCATED IN MEMPHIS, TN.</BookingHeroSubline>

        <div
          style={{
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
            padding: 0
          }}
        >
          {policyLines.map((line, i) => (
            <BookingBodyParagraph
              key={line.slice(0, 28)}
              style={{
                ...(i === policyLines.length - 1 ? { marginBottom: 0 } : {}),
                ...(i === 1 ? { marginTop: '-8px' } : {})
              }}
            >
              {line}
            </BookingBodyParagraph>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
          <BookingSectionHeading align="left">SERVICE TYPE:</BookingSectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {(Object.keys(INSTALL_BASE) as InstallKind[]).map((kind) => {
              const row = INSTALL_BASE[kind];
              const checked = installKind === kind;
              const kindDetail = INSTALL_KIND_DETAIL_LINES[kind];
              return (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setInstallKind(kind)}
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
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', width: '100%' }}>
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
                      style={{
                        flexShrink: 0,
                        fontFamily: bookingFontMedium,
                        fontSize: '10px',
                        color: '#808080',
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em',
                        alignSelf: 'center'
                      }}
                    >
                      {formatUsd(row.price)}
                    </span>
                  </div>
                  {checked && kindDetail ? (
                    <p
                      style={{
                        fontFamily: bookingFontBook,
                        fontSize: '9px',
                        color: '#000',
                        textTransform: 'uppercase',
                        margin: '10px 0 0',
                        padding: 0,
                        lineHeight: 1.45,
                        letterSpacing: '0.02em',
                        textAlign: 'left',
                        width: '100%'
                      }}
                    >
                      {kindDetail}
                    </p>
                  ) : null}
                </button>
              );
            })}
          </div>

          <BookingSectionHeading align="left" fontSize="11px">
            ADD TO YOUR APPOINTMENT:
          </BookingSectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
            {visibleAddons.map((a) => (
              <ToggleRow
                key={a.id}
                checked={addonIds.has(a.id)}
                onToggle={() => toggleAddon(a.id)}
                label={a.label}
                sub={a.sub}
                priceDisplay={formatUsd(a.price)}
                detailLine={ADDON_DETAIL_LINES[a.id]}
              />
            ))}
          </div>

          <div style={{ marginTop: '22px', marginBottom: '16px' }}>
            <BrandExpiresDatePicker inline value={preferredDateIso} onChange={setPreferredDateIso} />
          </div>
          <p
            style={{
              fontFamily: bookingFontMedium,
              fontSize: '9px',
              color: '#EB1C24',
              textTransform: 'uppercase',
              textAlign: 'center',
              margin: '6px 0 20px',
              lineHeight: 1.45,
              letterSpacing: '0.02em'
            }}
          >
            ESTIMATED APPOINTMENT TIME: {formatEstimatedAppointmentTime(estimatedMinutes)}.
            <br />
            FINAL DURATION CONFIRMED AFTER CHECKOUT.
          </p>

          <div className="text-center" style={{ paddingTop: '6px' }}>
            <p className="font-futura text-[12px] md:text-sm lg:text-base font-medium" style={{ color: '#808080' }}>
              TOTAL DUE
            </p>
            <p
              className="text-black font-medium text-base md:text-xl lg:text-2xl"
              style={{ fontFamily: '"Futura PT Medium", Futura, Inter, sans-serif', fontWeight: '500' }}
            >
              {formatUsd(totalUsd)}
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
