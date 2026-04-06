import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
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
import { syncAllFromApi } from '../../../utils/syncFromApi';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { createBookingDateDisabledFn } from '../../../utils/bookingDateRules';
import { signInHrefWithReturnTo } from '../../../utils/signInReturnTo';
import { bcfOptionSelectedChrome, BCF_OPTION_RED } from '../../../utils/bcfProductOptions';
import {
  BUILD_WIG_HUB_UNITS,
  clearAllBookingNewInstallAttachments,
  clearBookingNewInstallAttachedUnit,
  loadEligiblePurchasedWigUnitsFromStorage,
  persistBookingNewInstallAttachedOrder,
  readBookingNewInstallAttachedOrder,
  readBookingNewInstallAttachedUnitJson,
  setBuildWigAppointmentMode,
  type EligiblePurchasedUnitOption
} from '../../../utils/bookingNewInstallUnit';

const EMPTY_ELIGIBLE_WIG_UNITS: EligiblePurchasedUnitOption[] = [];
import {
  BOOKING_APPOINTMENT_DRAFT_HYDRATE_EVENT,
  clearAppointmentFormDraft,
  EDITING_BOOKING_APPOINTMENT_CART_ITEM_ID_KEY,
  loadAppointmentFormDraft,
  persistAppointmentFormDraft,
  type AppointmentFormDraftV1
} from '../../../utils/bookingAppointmentFormDraft';

type InstallKind = 'NEW_INSTALL' | 'RE_INSTALL';
type AppointmentStyle = 'BONE STRAIGHT' | 'LAYERED CURLS' | 'CRIMPS';
type PartDirection = 'LEFT SIDE' | 'MIDDLE' | 'RIGHT SIDE';

const APPOINTMENT_STYLE_OPTIONS: AppointmentStyle[] = ['BONE STRAIGHT', 'LAYERED CURLS', 'CRIMPS'];
const PART_DIRECTION_OPTIONS: PartDirection[] = ['LEFT SIDE', 'MIDDLE', 'RIGHT SIDE'];

/** Shown in gray on the LAYERED CURLS row and added to total + server quote. */
const LAYERED_CURLS_UPCHARGE_USD = 40;

const WEEKDAY_TIME_SLOTS = [
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

function dateShiftIso(isoYmd: string, days: number): string {
  const [y, m, d] = isoYmd.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  dt.setDate(dt.getDate() + days);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function timeSlotHour24(slot: string): number | null {
  const m = String(slot || '')
    .trim()
    .toUpperCase()
    .match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!m) return null;
  let h = Number(m[1]);
  const ap = m[3];
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return h;
}

const INSTALL_BASE: Record<InstallKind, { label: string; sub: string; price: number }> = {
  NEW_INSTALL: { label: 'NEW INSTALL', sub: '+2.5 HOURS', price: 275 },
  RE_INSTALL: { label: 'RE-INSTALL', sub: '+2 HOURS', price: 225 }
};

/** Base service length in minutes (before add-ons). */
const INSTALL_BASE_MINUTES: Record<InstallKind, number> = {
  NEW_INSTALL: 150,
  RE_INSTALL: 120
};

/** Extra minutes per add-on id (must match `AppointmentAddon` ids). Travel is omitted — not part of in-salon time. */
const ADDON_DURATION_MINUTES: Record<string, number> = {
  braids: 60,
  'brow-clean': 40,
  'brow-tint': 60,
  'mink-lashes': 20,
  makeup: 150,
  'clean-lace': 40
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

function formatIsoForDisplay(isoYmd: string): string {
  const [y, m, d] = isoYmd.split('-');
  if (!y || !m || !d) return '';
  return `${m}-${d}-${y}`;
}

function formatTimeSlotForDisplay(slot: string): string {
  const t = slot.trim();
  if (!t) return '';
  return t.replace(/\s+/g, '');
}

type AppointmentAddon = { id: string; label: string; sub: string; price: number };

const ADDONS_BASE: AppointmentAddon[] = [
  { id: 'braids', label: 'BRAIDS', sub: '+60 MINUTES', price: 60 },
  { id: 'brow-clean', label: 'BROW SCULPTING', sub: '+40 MINUTES', price: 40 },
  { id: 'brow-tint', label: 'BROW TINT', sub: '+60 MINUTES', price: 60 },
  /** Before mink so shade UI appears above volume (per product copy flow). */
  { id: 'makeup', label: 'MAKEUP', sub: '+2.5 HOURS', price: 250 },
  { id: 'mink-lashes', label: 'MINK LASHES', sub: '+20 MINUTES', price: 20 }
];

type MakeupSkinToneId =
  | 'fair'
  | 'light'
  | 'light-medium'
  | 'medium'
  | 'medium-deep'
  | 'deep'
  | 'deep-dark'
  | 'rich-ebony';

const MAKEUP_SKIN_TONES: { id: MakeupSkinToneId; label: string; swatch: string }[] = [
  { id: 'fair', label: 'FAIR', swatch: '#FFEFE4' },
  { id: 'light', label: 'LIGHT', swatch: '#F5D5C0' },
  { id: 'light-medium', label: 'BEIGE', swatch: '#E8C4A8' },
  { id: 'medium', label: 'MEDIUM', swatch: '#D4A574' },
  { id: 'medium-deep', label: 'TAN', swatch: '#B87B52' },
  { id: 'deep', label: 'DEEP', swatch: '#8B5239' },
  { id: 'deep-dark', label: 'MAHOGANY', swatch: '#5C3A2A' },
  { id: 'rich-ebony', label: 'EBONY', swatch: '#3D2314' }
];

type MinkLashVolume = 'NATURAL' | 'DRAMATIC';

const MINK_VOLUME_OPTIONS: MinkLashVolume[] = ['NATURAL', 'DRAMATIC'];

function isValidMakeupSkinToneId(id: string): id is MakeupSkinToneId {
  return MAKEUP_SKIN_TONES.some((t) => t.id === id);
}

/** Match BCF PDP `hair color` label (Bohemy). */
const appointmentAddonBohemyLabelStyle: CSSProperties = {
  fontFamily: '"Bohemy", cursive',
  fontSize: '19px',
  fontWeight: 400,
  textAlign: 'center',
  margin: '14px 0 10px',
  color: '#000'
};

/** Same gray/white/color rings as BCF `BcfColorSwatchDonut`. */
function AppointmentSkinToneSwatchDonut({ colorCode }: { colorCode: string }) {
  return (
    <div
      style={{
        width: '35px',
        height: '35px',
        backgroundColor: '#808080',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}
    >
      <div
        style={{
          width: '81%',
          height: '81%',
          backgroundColor: '#FFFFFF',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            width: '76%',
            height: '76%',
            backgroundColor: colorCode,
            borderRadius: '50%'
          }}
        />
      </div>
    </div>
  );
}

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
    'THIS SERVICE INCLUDES REMOVING GLUE & RESIDUE FROM YOUR LACE. MUST BE DROPPED OFF AT LEAST 3 DAYS PRIOR TO SERVICE.',
  braids:
    'THIS SERVICE INCLUDES 8-10 BRAIDS, DEPENDING ON HAIR DENSITY. COME WASHED & BLOW DRYED.',
  'brow-clean': 'THIS SERVICE INCLUDES WAXING & TWEEZING.',
  'brow-tint': 'THIS SERVICE INCLUDES BROW SCULPTING & SEMI-PERMANENT TINT.',
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
  detailLine,
  expandedContent
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
  sub: string;
  priceDisplay: string;
  detailLine?: ReactNode;
  /** Renders inside the same bordered card below detail text (e.g. shade / volume pickers). Not a child of the toggle button. */
  expandedContent?: ReactNode;
}) {
  return (
    <div
      className="flex w-full text-left border border-black bg-white/80 backdrop-blur-sm"
      style={{
        borderWidth: '1.3px',
        borderColor: checked ? '#EB1C24' : '#000',
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 0,
        padding: 0
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left border-0 bg-transparent cursor-pointer"
        style={{ padding: '12px 12px' }}
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
      </button>
      {checked && detailLine ? (
        <div
          style={{
            padding: `8px 12px ${expandedContent ? 0 : 12}px`,
            width: '100%',
            boxSizing: 'border-box'
          }}
        >
          <p
            style={{
              fontFamily: bookingFontBook,
              fontSize: '9px',
              color: '#000',
              textTransform: 'uppercase',
              margin: 0,
              padding: 0,
              lineHeight: 1.45,
              letterSpacing: '0.02em',
              textAlign: 'left',
              width: '100%'
            }}
          >
            {detailLine}
          </p>
        </div>
      ) : null}
      {checked && expandedContent ? (
        <div
          style={{ padding: '0 12px 22px', width: '100%', boxSizing: 'border-box' }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {expandedContent}
        </div>
      ) : null}
    </div>
  );
}

export default function BookingAppointmentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isPremiumBooking = location.pathname.includes('/booking/premium/');
  const initialDraft = useRef(loadAppointmentFormDraft());

  const [installKind, setInstallKind] = useState<InstallKind>(() => {
    const d = initialDraft.current;
    return d?.installKind === 'NEW_INSTALL' || d?.installKind === 'RE_INSTALL' ? d.installKind : 'RE_INSTALL';
  });
  const [appointmentStyle, setAppointmentStyle] = useState<AppointmentStyle>(() => {
    const d = initialDraft.current;
    return d && APPOINTMENT_STYLE_OPTIONS.includes(d.appointmentStyle) ? d.appointmentStyle : 'BONE STRAIGHT';
  });
  const [partDirection, setPartDirection] = useState<PartDirection>(() => {
    const d = initialDraft.current;
    return d && PART_DIRECTION_OPTIONS.includes(d.partDirection) ? d.partDirection : 'MIDDLE';
  });
  const [addonIds, setAddonIds] = useState<Set<string>>(() => {
    const d = initialDraft.current;
    if (d?.addonIds && Array.isArray(d.addonIds)) {
      return new Set(d.addonIds.filter((x): x is string => typeof x === 'string'));
    }
    return new Set();
  });
  const [makeupSkinToneId, setMakeupSkinToneId] = useState<MakeupSkinToneId>(() => {
    const d = initialDraft.current;
    if (d?.makeupSkinToneId && isValidMakeupSkinToneId(d.makeupSkinToneId)) return d.makeupSkinToneId;
    return MAKEUP_SKIN_TONES[0]?.id ?? 'fair';
  });
  const [minkLashVolume, setMinkLashVolume] = useState<MinkLashVolume>(() => {
    const d = initialDraft.current;
    if (d?.minkLashVolume === 'NATURAL' || d?.minkLashVolume === 'DRAMATIC') return d.minkLashVolume;
    return 'NATURAL';
  });
  const [preferredDateIso, setPreferredDateIso] = useState(() => initialDraft.current?.preferredDateIso ?? '');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState(
    () => initialDraft.current?.preferredTimeSlot ?? ''
  );
  const [appointmentNotes, setAppointmentNotes] = useState(
    () => initialDraft.current?.appointmentNotes ?? ''
  );
  const [showTimeSlotDropdown, setShowTimeSlotDropdown] = useState(false);
  const [addToBagState, setAddToBagState] = useState<'idle' | 'adding' | 'added'>('idle');
  const [showAppointmentUpgradeModal, setShowAppointmentUpgradeModal] = useState(false);
  const [authRev, setAuthRev] = useState(0);
  const [attachUnitSelectRev, setAttachUnitSelectRev] = useState(0);
  const [newInstallAttachmentsRev, setNewInstallAttachmentsRev] = useState(0);
  const [attachedOrderSelectValue, setAttachedOrderSelectValue] = useState('');
  const { formatUsd } = useSelectedCurrencyDisplay();

  const appointmentScheduledSummaryVisible =
    Boolean(preferredDateIso.trim()) && Boolean(preferredTimeSlot.trim());

  const appointmentNotesLabelStyle: CSSProperties = {
    fontFamily: bookingFontMedium,
    fontSize: '11px',
    color: '#000000',
    textTransform: 'uppercase',
    marginBottom: '6px',
    display: 'block',
    letterSpacing: '0.03em',
    fontWeight: 500
  };

  const newInstallSelectStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    minHeight: '57px',
    padding: '6px 4px',
    border: 'none',
    borderRadius: 0,
    fontFamily: bookingFontMedium,
    fontSize: '8px',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
    background: 'transparent',
    color: '#000',
    boxSizing: 'border-box',
    textAlign: 'center',
    textAlignLast: 'center',
    cursor: 'pointer'
  };

  const attachOrderSelectFullStyle: CSSProperties = {
    width: '100%',
    minHeight: '44px',
    padding: '10px 8px',
    border: '1.3px solid #000',
    borderRadius: 0,
    fontFamily: bookingFontMedium,
    fontSize: '10px',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
    background: '#fff',
    color: '#000',
    boxSizing: 'border-box',
    cursor: 'pointer'
  };

  useEffect(() => {
    const bump = () => setAuthRev((n) => n + 1);
    window.addEventListener('signInStateChanged', bump);
    return () => window.removeEventListener('signInStateChanged', bump);
  }, []);

  useEffect(() => {
    const bump = () => setNewInstallAttachmentsRev((n) => n + 1);
    window.addEventListener('bookingNewInstallUnitAttached', bump);
    window.addEventListener('focus', bump);
    return () => {
      window.removeEventListener('bookingNewInstallUnitAttached', bump);
      window.removeEventListener('focus', bump);
    };
  }, []);

  const eligiblePurchasedWigUnits = useMemo(
    () =>
      installKind === 'NEW_INSTALL'
        ? loadEligiblePurchasedWigUnitsFromStorage()
        : EMPTY_ELIGIBLE_WIG_UNITS,
    [installKind, authRev, newInstallAttachmentsRev]
  );

  useEffect(() => {
    if (installKind !== 'NEW_INSTALL') {
      clearAllBookingNewInstallAttachments();
      setAttachedOrderSelectValue('');
      setNewInstallAttachmentsRev((n) => n + 1);
      return;
    }
    const saved = readBookingNewInstallAttachedOrder();
    if (!saved) {
      setAttachedOrderSelectValue('');
      return;
    }
    if (saved.key && eligiblePurchasedWigUnits.some((o) => o.key === saved.key)) {
      setAttachedOrderSelectValue(saved.key);
      return;
    }
    const m = eligiblePurchasedWigUnits.find(
      (o) => o.orderId === saved.orderId && o.label === saved.label
    );
    setAttachedOrderSelectValue(m?.key || '');
  }, [installKind, eligiblePurchasedWigUnits]);

  const attachedCustomUnitSummary = useMemo(() => {
    if (installKind !== 'NEW_INSTALL') return null;
    const raw = readBookingNewInstallAttachedUnitJson();
    if (!raw) return null;
    try {
      const u = JSON.parse(raw) as { name?: string; productName?: string; price?: number };
      const nm = u?.productName || u?.name || 'UNIT';
      const pr = typeof u?.price === 'number' ? u.price : null;
      return { name: String(nm), price: pr };
    } catch {
      return null;
    }
  }, [installKind, newInstallAttachmentsRev]);

  /**
   * Hair install booking is premium-only (both `/booking/appointment` and `/booking/premium/appointment`).
   * Premium members are canonicalized to `/booking/premium/appointment` by `MembershipRouteSync`.
   * Sync + modal: non-premium users see the lobby-style area gate; sync avoids stale localStorage.
   */
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (isSupabaseConfigured() && localStorage.getItem('isSignedIn') === 'true') {
        try {
          await syncAllFromApi();
        } catch {
          /* ignore */
        }
      }
      if (cancelled) return;

      const premium = isPremiumMemberForGatedFeatures();
      setShowAppointmentUpgradeModal(!premium);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [isPremiumBooking, authRev]);

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

  const isAppointmentDateDisabled = useMemo(
    () =>
      createBookingDateDisabledFn(installKind === 'RE_INSTALL' ? 'seven_days' : 'two_calendar_months'),
    [installKind]
  );

  const travelBlocksPrevDayAfternoon = useMemo(() => {
    if (!addonIds.has('travel') || !preferredDateIso.trim()) return null;
    return dateShiftIso(preferredDateIso.trim(), -1);
  }, [addonIds, preferredDateIso]);

  const travelBlocksWholeDay = useMemo(() => {
    if (!addonIds.has('travel') || !preferredDateIso.trim()) return null;
    return dateShiftIso(preferredDateIso.trim(), 1);
  }, [addonIds, preferredDateIso]);

  const availableTimeSlotsForDate = useMemo(() => {
    if (!preferredDateIso.trim()) return WEEKDAY_TIME_SLOTS;
    if (!addonIds.has('travel')) return WEEKDAY_TIME_SLOTS;
    if (travelBlocksWholeDay && preferredDateIso.trim() === travelBlocksWholeDay) return [] as string[];
    if (travelBlocksPrevDayAfternoon && preferredDateIso.trim() === travelBlocksPrevDayAfternoon) {
      return WEEKDAY_TIME_SLOTS.filter((slot) => {
        const h = timeSlotHour24(slot);
        return h != null && h < 12;
      });
    }
    return WEEKDAY_TIME_SLOTS;
  }, [preferredDateIso, addonIds, travelBlocksWholeDay, travelBlocksPrevDayAfternoon]);

  /** If lead rules change (e.g. RE-INSTALL → NEW INSTALL), drop a date that is no longer selectable. */
  useEffect(() => {
    setPreferredDateIso((prev) => {
      const t = prev.trim();
      if (!t) return prev;
      return isAppointmentDateDisabled(t) ? '' : prev;
    });
  }, [installKind, isAppointmentDateDisabled]);

  useEffect(() => {
    if (!preferredDateIso.trim()) {
      setPreferredTimeSlot('');
      setShowTimeSlotDropdown(false);
    }
  }, [preferredDateIso]);

  useEffect(() => {
    if (!preferredTimeSlot.trim()) return;
    if (!availableTimeSlotsForDate.includes(preferredTimeSlot as (typeof WEEKDAY_TIME_SLOTS)[number])) {
      setPreferredTimeSlot('');
    }
  }, [availableTimeSlotsForDate, preferredTimeSlot]);

  /** Cart / bag “EDIT APPOINTMENT” writes draft + dispatches; re-apply when PDP is already mounted. */
  useEffect(() => {
    const applyDraftFromEvent = () => {
      const d = loadAppointmentFormDraft();
      if (!d || d.v !== 1) return;
      if (d.installKind === 'NEW_INSTALL' || d.installKind === 'RE_INSTALL') {
        setInstallKind(d.installKind);
      }
      if (APPOINTMENT_STYLE_OPTIONS.includes(d.appointmentStyle)) {
        setAppointmentStyle(d.appointmentStyle);
      }
      if (PART_DIRECTION_OPTIONS.includes(d.partDirection)) {
        setPartDirection(d.partDirection);
      }
      if (d.addonIds && Array.isArray(d.addonIds)) {
        setAddonIds(new Set(d.addonIds.filter((x): x is string => typeof x === 'string')));
      }
      if (d.makeupSkinToneId && isValidMakeupSkinToneId(d.makeupSkinToneId)) {
        setMakeupSkinToneId(d.makeupSkinToneId);
      }
      if (d.minkLashVolume === 'NATURAL' || d.minkLashVolume === 'DRAMATIC') {
        setMinkLashVolume(d.minkLashVolume);
      }
      setPreferredDateIso(typeof d.preferredDateIso === 'string' ? d.preferredDateIso : '');
      setPreferredTimeSlot(typeof d.preferredTimeSlot === 'string' ? d.preferredTimeSlot : '');
      setAppointmentNotes(typeof d.appointmentNotes === 'string' ? d.appointmentNotes : '');
    };
    window.addEventListener(BOOKING_APPOINTMENT_DRAFT_HYDRATE_EVENT, applyDraftFromEvent);
    return () => window.removeEventListener(BOOKING_APPOINTMENT_DRAFT_HYDRATE_EVENT, applyDraftFromEvent);
  }, []);

  useEffect(() => {
    const draft: AppointmentFormDraftV1 = {
      v: 1,
      installKind,
      appointmentStyle,
      partDirection,
      addonIds: [...addonIds],
      makeupSkinToneId,
      minkLashVolume,
      preferredDateIso,
      preferredTimeSlot,
      appointmentNotes
    };
    persistAppointmentFormDraft(draft);
  }, [
    installKind,
    appointmentStyle,
    partDirection,
    addonIds,
    makeupSkinToneId,
    minkLashVolume,
    preferredDateIso,
    preferredTimeSlot,
    appointmentNotes
  ]);

  const toggleAddon = (id: string) => {
    setAddonIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        return next;
      }
      next.add(id);
      // Makeup includes mink + brow sculpting; brow tint includes brow sculpting — avoid double charge.
      if (id === 'makeup') {
        next.delete('mink-lashes');
        next.delete('brow-clean');
      }
      if (id === 'mink-lashes') next.delete('makeup');
      if (id === 'brow-clean') {
        next.delete('makeup');
        next.delete('brow-tint');
      }
      if (id === 'brow-tint') next.delete('brow-clean');
      return next;
    });
  };

  const visibleAddons = useMemo(() => appointmentAddonsForInstall(installKind), [installKind]);

  const totalUsd = useMemo(() => {
    let t = INSTALL_BASE[installKind].price;
    if (appointmentStyle === 'LAYERED CURLS') t += LAYERED_CURLS_UPCHARGE_USD;
    visibleAddons.forEach((a) => {
      if (addonIds.has(a.id)) t += a.price;
    });
    return t;
  }, [installKind, appointmentStyle, addonIds, visibleAddons]);

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
    const parts = [INSTALL_BASE[installKind].label, appointmentStyle, partDirection];
    visibleAddons.forEach((a) => {
      if (!addonIds.has(a.id)) return;
      parts.push(a.label);
      if (a.id === 'makeup') {
        const tone = MAKEUP_SKIN_TONES.find((t) => t.id === makeupSkinToneId);
        if (tone) parts.push(tone.label);
      }
      if (a.id === 'mink-lashes') parts.push(minkLashVolume);
    });
    return parts.join(' · ');
  }, [installKind, appointmentStyle, partDirection, addonIds, visibleAddons, makeupSkinToneId, minkLashVolume]);

  const handleScheduleToBag = () => {
    if (!isPremiumMemberForGatedFeatures()) {
      setShowAppointmentUpgradeModal(true);
      return;
    }
    setAddToBagState('adding');
    setTimeout(() => {
      try {
        let cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]') as unknown[];
        try {
          const editingId = localStorage.getItem(EDITING_BOOKING_APPOINTMENT_CART_ITEM_ID_KEY);
          if (editingId && Array.isArray(cartItems)) {
            cartItems = cartItems.filter((row) => {
              if (typeof row !== 'object' || row === null) return true;
              return (row as { id?: string }).id !== editingId;
            });
            localStorage.removeItem(EDITING_BOOKING_APPOINTMENT_CART_ITEM_ID_KEY);
          }
        } catch {
          /* ignore */
        }
        const addonList = appointmentAddonsForInstall(installKind)
          .filter((a) => addonIds.has(a.id))
          .map((a) => a.id);
        const tier = isPremiumBooking ? 'premium' : 'standard';
        const badgeImage =
          bookingCartItemThumbnailSrc({ type: 'booking-appointment', bookingTier: tier }) ||
          '/assets/appointment-standard.png';
        const attachedUnitJson = readBookingNewInstallAttachedUnitJson();
        const attachedOrder = readBookingNewInstallAttachedOrder();
        const newItem = {
          id: `booking-appt-${Date.now()}`,
          name: 'WIG INSTALLATION',
          price: totalUsd,
          quantity: 1,
          image: badgeImage,
          type: 'booking-appointment',
          bookingTier: tier,
          bookingInstallKind: installKind,
          bookingStyle: appointmentStyle,
          bookingPartDirection: partDirection,
          ...(preferredTimeSlot ? { bookingPreferredTime: preferredTimeSlot } : {}),
          bookingAddonIds: addonList,
          bookingBagSubtitle,
          ...(addonIds.has('makeup')
            ? {
                bookingMakeupSkinTone:
                  MAKEUP_SKIN_TONES.find((t) => t.id === makeupSkinToneId)?.label ?? String(makeupSkinToneId)
              }
            : {}),
          ...(addonIds.has('mink-lashes') ? { bookingMinkLashVolume: minkLashVolume } : {}),
          ...(preferredDateIso.trim() ? { bookingPreferredDate: preferredDateIso.trim() } : {}),
          ...(appointmentNotes.trim() ? { bookingNotes: appointmentNotes.trim() } : {}),
          ...(installKind === 'NEW_INSTALL' && attachedUnitJson
            ? { bookingNewInstallUnitJson: attachedUnitJson }
            : {}),
          ...(installKind === 'NEW_INSTALL' && attachedOrder
            ? {
                bookingAttachedOrderId: attachedOrder.orderId,
                bookingAttachedOrderSummary: attachedOrder.orderNumber
                  ? `${attachedOrder.label} (#${attachedOrder.orderNumber})`
                  : attachedOrder.label
              }
            : {})
        };
        clearAppointmentFormDraft();
        clearAllBookingNewInstallAttachments();
        const updated = [newItem, ...cartItems];
        localStorage.setItem('cartItems', JSON.stringify(updated));
        const newCartCount = updated.length;
        localStorage.setItem('cartCount', String(newCartCount));
        window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCartCount }));
        window.dispatchEvent(new Event('cartUpdated'));
        setAddToBagState('added');
        setTimeout(() => {
          setAddToBagState('idle');
          navigate('/checkout/bookings');
        }, 600);
      } catch (e) {
        console.error(e);
        setAddToBagState('idle');
      }
    }, 400);
  };

  const policyLines = [
    'NEW CLIENTS ARE REQUIRED TO PURCHASE A UNIT PRIOR TO INSTALLATION.',
    'I WILL ONLY RE-INSTALL WIGS I HAVE PREVIOUSLY CUT & LAID.',
    'IF YOU NEED ASSISTANCE CHOOSING A UNIT FOR YOUR DESIRED LOOK, FEEL FREE TO BOOK A COMPLIMENTARY CONSULTATION FROM THE SHOP MENU.',
    'NEW INSTALLS SHOULD BE BOOKED AT LEAST TWO MONTHS IN ADVANCE SO YOUR UNIT CAN BE CONSTRUCTED, CUSTOMIZED, STYLED & READY FOR INSTALLATION. RE-INSTALLS SHOULD BE BOOKED AT LEAST ONE WEEK IN ADVANCE USING THE "CLEAN LACE" ADD ON, IF APPLICABLE.',
    'ABSOLUTELY NO GUESTS ARE ALLOWED AT YOUR APPOINTMENT DUE TO PRIVACY & SAFETY PRECAUTIONS. APPOINTMENTS MUST BE CANCELLED WITHIN 48 HOURS & RESCHEDULED WITHIN 24 HOURS OF YOUR APPOINTMENT TO AVOID BEING CHARGED A NO SHOW FEE OF $50 USD.'
  ];

  return (
    <>
    <BookingFlowLayout
      crumbHighlight="APPOINTMENT"
      belowCard={
        <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto', paddingTop: '2px' }}>
          <NoirStyleAddToBagButton
            idleLabel="PROCEED TO CHECKOUT"
            alwaysShowIdleLabel
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
                ...(i === 1 ? { marginTop: '-12px' } : {})
              }}
            >
              {line}
            </BookingBodyParagraph>
          ))}
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
          <BookingSectionHeading align="left">SELECT A SERVICE:</BookingSectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {(Object.keys(INSTALL_BASE) as InstallKind[]).map((kind) => {
              const row = INSTALL_BASE[kind];
              const checked = installKind === kind;
              const kindDetail = INSTALL_KIND_DETAIL_LINES[kind];
              return (
                <div
                  key={kind}
                  className="flex w-full text-left border border-black bg-white/80 backdrop-blur-sm"
                  style={{
                    borderWidth: '1.3px',
                    borderColor: checked ? '#EB1C24' : '#000',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    gap: 0
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setInstallKind(kind)}
                    className="w-full text-left border-0 bg-transparent cursor-pointer"
                    style={{
                      padding: '12px 12px',
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
                  </button>
                  {checked && kindDetail ? (
                    <div
                      style={{
                        padding: `8px 12px ${kind === 'NEW_INSTALL' ? 0 : 12}px`,
                        width: '100%',
                        boxSizing: 'border-box'
                      }}
                    >
                      <p
                        style={{
                          fontFamily: bookingFontBook,
                          fontSize: '9px',
                          color: '#000',
                          textTransform: 'uppercase',
                          margin: 0,
                          padding: 0,
                          lineHeight: 1.45,
                          letterSpacing: '0.02em',
                          textAlign: 'left',
                          width: '100%'
                        }}
                      >
                        {kindDetail}
                      </p>
                    </div>
                  ) : null}
                  {checked && kind === 'NEW_INSTALL' ? (
                    <div
                      style={{
                        padding: '6px 12px 16px',
                        width: '100%',
                        boxSizing: 'border-box'
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <p style={{ ...appointmentAddonBohemyLabelStyle, marginTop: '4px', marginBottom: '10px' }}>
                        select your unit
                      </p>
                      <p
                        style={{
                          fontFamily: bookingFontMedium,
                          fontSize: '9px',
                          textTransform: 'uppercase',
                          color: '#000',
                          margin: '0 0 8px',
                          letterSpacing: '0.02em',
                          textAlign: 'center'
                        }}
                      >
                        attach unit
                      </p>
                      <div className="flex justify-center w-full" style={{ marginBottom: '14px' }}>
                        <div
                          className="bg-white"
                          style={{
                            width: '60px',
                            height: '65px',
                            borderWidth: '1.3px',
                            borderStyle: 'solid',
                            borderColor: '#000',
                            boxSizing: 'border-box',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'stretch',
                            justifyContent: 'center'
                          }}
                        >
                          <select
                            key={attachUnitSelectRev}
                            aria-label="Attach unit — choose build-a-wig hub"
                            defaultValue=""
                            style={newInstallSelectStyle}
                            onChange={(e) => {
                              const path = e.target.value;
                              if (!path) return;
                              setBuildWigAppointmentMode(`${location.pathname}${location.search || ''}`);
                              navigate(path);
                              setAttachUnitSelectRev((n) => n + 1);
                            }}
                          >
                            <option value="">UNIT</option>
                            {BUILD_WIG_HUB_UNITS.map((u) => (
                              <option key={u.slug} value={u.path}>
                                {u.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {attachedCustomUnitSummary ? (
                        <p
                          style={{
                            fontFamily: bookingFontBook,
                            fontSize: '9px',
                            color: '#EB1C24',
                            textTransform: 'uppercase',
                            margin: '0 0 10px',
                            letterSpacing: '0.02em',
                            textAlign: 'center',
                            lineHeight: 1.4
                          }}
                        >
                          ATTACHED BUILD: {attachedCustomUnitSummary.name}
                          {attachedCustomUnitSummary.price != null
                            ? ` — ${formatUsd(attachedCustomUnitSummary.price)}`
                            : ''}{' '}
                          <button
                            type="button"
                            className="underline border-0 bg-transparent cursor-pointer p-0"
                            style={{
                              fontFamily: bookingFontBook,
                              fontSize: '9px',
                              color: '#000',
                              textTransform: 'uppercase'
                            }}
                            onClick={() => {
                              clearBookingNewInstallAttachedUnit();
                              setNewInstallAttachmentsRev((n) => n + 1);
                            }}
                          >
                            clear
                          </button>
                        </p>
                      ) : null}
                      <p
                        style={{
                          fontFamily: bookingFontMedium,
                          fontSize: '9px',
                          textTransform: 'uppercase',
                          color: '#000',
                          margin: '0 0 8px',
                          letterSpacing: '0.02em',
                          textAlign: 'center'
                        }}
                      >
                        attach order
                      </p>
                      {eligiblePurchasedWigUnits.length === 0 ? (
                        <p
                          style={{
                            fontFamily: bookingFontBook,
                            fontSize: '9px',
                            color: '#808080',
                            textTransform: 'uppercase',
                            margin: 0,
                            letterSpacing: '0.02em',
                            textAlign: 'center',
                            lineHeight: 1.45
                          }}
                        >
                          NO ELIGIBLE ORDERS.
                        </p>
                      ) : (
                        <select
                          aria-label="Attach a previously purchased unit"
                          value={attachedOrderSelectValue}
                          style={attachOrderSelectFullStyle}
                          onChange={(e) => {
                            const v = e.target.value;
                            setAttachedOrderSelectValue(v);
                            if (!v) {
                              persistBookingNewInstallAttachedOrder(null);
                              return;
                            }
                            const opt = eligiblePurchasedWigUnits.find((o) => o.key === v);
                            if (opt) {
                              persistBookingNewInstallAttachedOrder({
                                orderId: opt.orderId,
                                orderNumber: opt.orderNumber,
                                label: opt.label,
                                key: opt.key
                              });
                            }
                          }}
                        >
                          <option value="">SELECT ORDER (OPTIONAL)</option>
                          {eligiblePurchasedWigUnits.map((o) => (
                            <option key={o.key} value={o.key}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <BookingSectionHeading align="left" fontSize="11px">
            SELECT A STYLE:
          </BookingSectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {APPOINTMENT_STYLE_OPTIONS.map((style) => {
              const checked = appointmentStyle === style;
              const isLayered = style === 'LAYERED CURLS';
              return (
                <button
                  key={style}
                  type="button"
                  onClick={() => setAppointmentStyle(style)}
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
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%'
                    }}
                  >
                    <span style={{ flex: 1, minWidth: 0 }}>
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
                        {style}
                      </span>
                    </span>
                    {isLayered ? (
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
                        {formatUsd(LAYERED_CURLS_UPCHARGE_USD)}
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>

          <BookingSectionHeading align="left" fontSize="11px">
            SELECT PART DIRECTION:
          </BookingSectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {PART_DIRECTION_OPTIONS.map((direction) => {
              const checked = partDirection === direction;
              return (
                <button
                  key={direction}
                  type="button"
                  onClick={() => setPartDirection(direction)}
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
                    {direction}
                  </span>
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
                expandedContent={
                  a.id === 'makeup' ? (
                    <>
                      <p style={{ ...appointmentAddonBohemyLabelStyle, marginTop: '12px' }}>select your shade</p>
                      <div className="flex flex-wrap justify-center gap-x-3 gap-y-3">
                        {MAKEUP_SKIN_TONES.map((c) => {
                          const sel = makeupSkinToneId === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setMakeupSkinToneId(c.id)}
                              className="bg-white"
                              style={{
                                position: 'relative',
                                borderWidth: '1.3px',
                                borderStyle: 'solid',
                                ...bcfOptionSelectedChrome(sel),
                                width: '60px',
                                height: '65px',
                                boxSizing: 'border-box',
                                cursor: 'pointer',
                                padding: '2px 3px 3px'
                              }}
                            >
                              <div
                                style={{
                                  position: 'absolute',
                                  left: '50%',
                                  top: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  width: '35px',
                                  height: '35px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  pointerEvents: 'none'
                                }}
                              >
                                <AppointmentSkinToneSwatchDonut colorCode={c.swatch} />
                              </div>
                              <span
                                style={{
                                  position: 'absolute',
                                  left: '50%',
                                  bottom: '1px',
                                  transform: 'translateX(-50%) translateY(6px)',
                                  fontFamily: bookingFontMedium,
                                  fontSize: '9px',
                                  fontWeight: 500,
                                  textAlign: 'center',
                                  lineHeight: 1.05,
                                  textTransform: 'uppercase',
                                  color: sel ? BCF_OPTION_RED : '#000000',
                                  width: '100%',
                                  maxWidth: '100%',
                                  display: 'block',
                                  pointerEvents: 'none'
                                }}
                              >
                                {c.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : a.id === 'mink-lashes' ? (
                    <>
                      <p style={{ ...appointmentAddonBohemyLabelStyle, marginTop: '12px' }}>select your volume</p>
                      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', width: '100%' }}>
                        {MINK_VOLUME_OPTIONS.map((vol) => {
                          const sel = minkLashVolume === vol;
                          return (
                            <button
                              key={vol}
                              type="button"
                              onClick={() => setMinkLashVolume(vol)}
                              className="bg-white/80 backdrop-blur-sm"
                              style={{
                                flex: 1,
                                minWidth: 0,
                                borderWidth: '1.3px',
                                borderStyle: 'solid',
                                ...bcfOptionSelectedChrome(sel),
                                padding: '12px 10px',
                                cursor: 'pointer',
                                fontFamily: bookingFontMedium,
                                fontSize: '10px',
                                fontWeight: 500,
                                textTransform: 'uppercase',
                                letterSpacing: '0.02em',
                                lineHeight: 1.35
                              }}
                            >
                              {vol}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : undefined
                }
              />
            ))}
          </div>

          <div style={{ width: '100%', minWidth: 0 }}>
            <label htmlFor="appointment-additional-notes" style={{ ...appointmentNotesLabelStyle, marginBottom: '7px' }}>
              ADDITIONAL NOTES:
            </label>
            <textarea
              id="appointment-additional-notes"
              value={appointmentNotes}
              onChange={(e) => setAppointmentNotes(e.target.value)}
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

          <div
            style={{
              borderTop: '1px solid #e5e7eb',
              paddingTop: '20px',
              marginTop: '20px',
              marginBottom: '16px'
            }}
          >
            <BrandExpiresDatePicker
              inline
              navArrowScale={0.75}
              monthLabelVariant="adminMeetings"
              value={preferredDateIso}
              onChange={(iso) => {
                setPreferredDateIso(iso);
                setPreferredTimeSlot('');
                setShowTimeSlotDropdown(false);
              }}
              isDateDisabled={isAppointmentDateDisabled}
            />
          </div>
          {preferredDateIso ? (
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
                  onClick={() => setShowTimeSlotDropdown((v) => !v)}
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
                    color: preferredTimeSlot ? '#000' : '#808080',
                    letterSpacing: '0.02em'
                  }}
                >
                  <span>{preferredTimeSlot || 'SELECT A TIME'}</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    className="flex-shrink-0"
                    style={{
                      transform: showTimeSlotDropdown ? 'rotate(180deg)' : 'none',
                      color: '#EB1C24',
                      marginLeft: '8px'
                    }}
                  >
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {showTimeSlotDropdown ? (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      aria-hidden="true"
                      onClick={() => setShowTimeSlotDropdown(false)}
                    />
                    <div
                      className="absolute left-0 right-0 py-1 bg-white border border-black shadow-lg z-20 max-h-48 overflow-y-auto"
                      style={{ borderWidth: '1.3px', borderRadius: 0, marginTop: '7px' }}
                    >
                      {WEEKDAY_TIME_SLOTS.map((slot) => {
                        const slotDisabled = !availableTimeSlotsForDate.includes(slot);
                        return (
                        <button
                          key={slot}
                          type="button"
                          disabled={slotDisabled}
                          onClick={() => {
                            if (slotDisabled) return;
                            setPreferredTimeSlot(slot);
                            setShowTimeSlotDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs uppercase hover:bg-gray-100 transition-colors"
                          style={{
                            fontFamily: '"Futura PT Book"',
                            color: slotDisabled ? '#9ca3af' : '#000',
                            fontWeight: 400,
                            cursor: slotDisabled ? 'not-allowed' : 'pointer',
                            opacity: slotDisabled ? 0.7 : 1,
                          }}
                          title={
                            slotDisabled
                              ? 'UNAVAILABLE DUE TO TRAVEL BUFFER (NO APPOINTMENTS AFTER 12 PM THE DAY BEFORE A TRAVEL BOOKING).'
                              : undefined
                          }
                        >
                          {slot}
                        </button>
                      );
                    })}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          ) : null}
          <div style={{ marginBottom: appointmentScheduledSummaryVisible ? '20px' : '14px' }}>
            {preferredDateIso && preferredTimeSlot ? (
              <p
                style={{
                  fontFamily: bookingFontMedium,
                  fontSize: '10px',
                  color: '#EB1C24',
                  textTransform: 'uppercase',
                  textAlign: 'center',
                  margin: '0 0 4px',
                  lineHeight: 1.45,
                  letterSpacing: '0.02em'
                }}
              >
                SCHEDULED DATE & TIME: {formatIsoForDisplay(preferredDateIso)} @ {formatTimeSlotForDisplay(preferredTimeSlot)}.
              </p>
            ) : null}
            <p
              style={{
                fontFamily: bookingFontMedium,
                fontSize: '10px',
                color: '#EB1C24',
                textTransform: 'uppercase',
                textAlign: 'center',
                margin: 0,
                lineHeight: 1.45,
                letterSpacing: '0.02em'
              }}
            >
              ESTIMATED APPOINTMENT TIME: {formatEstimatedAppointmentTime(estimatedMinutes)}.
              <br />
              FINAL DURATION CONFIRMED AFTER CHECKOUT.
            </p>
          </div>

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
      onClose={() => {
        setShowAppointmentUpgradeModal(false);
        if (typeof window !== 'undefined' && window.history.length > 1) {
          navigate(-1);
        } else {
          navigate('/home/shop');
        }
      }}
      onConfirm={() => {
        setShowAppointmentUpgradeModal(false);
        if (localStorage.getItem('isSignedIn') === 'true') {
          prepareMembershipUpgradeNavigation();
          navigate('/account/rewards');
          return;
        }
        navigate(signInHrefWithReturnTo(location));
      }}
      title="UPGRADE YOUR SUBSCRIPTION?"
      message="YOU MUST BE A PREMIUM MEMBER TO ACCESS THIS AREA."
      confirmText="UPGRADE"
      cancelText="CANCEL"
      dataAttribute="upgrade-subscription-modal-booking-appointment"
    />
    </>
  );
}
