import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import BrandExpiresDatePicker, { type AdminCalendarDayMeta } from '../../../components/BrandExpiresDatePicker';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import {
  patchAdminMeeting,
  postAdminConsultQuote,
  postAdminMeetingClientAlert,
} from '../../../utils/api';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { isAdminEmail } from '../../../utils/adminAuth';
import { dispatchAdminMeetingsApiRefresh, useAdminMeetingsApiRefresh } from '../../../hooks/useAdminMeetingsApiRefresh';
import ConfirmationModal from '../../../components/ConfirmationModal';
import {
  ADDON_COMBO_OPTIONS,
  getDefaultColorForUnit,
  getDefaultDensityForUnit,
  getOptionsForUnit,
  type UnitId,
} from '../../../utils/productOptions';
import { calculateSpecialOfferPriceBreakdown, type SpecialOfferBreakdownLine } from '../../../utils/specialOfferPrice';
import {
  adminFounderDemoConsultMeetingOrder331,
  endOfMonth,
  generateMockMeetingsForRange,
  loadLocalMeetings,
  parseISODateLocal,
  startOfMonth,
  type AdminMeeting,
} from '../../../utils/adminMeetingsMock';
import {
  clearAdminMeetingsFocusFromClientDetails,
  readAdminMeetingsFocusFromClientDetails,
} from '../../../utils/adminMeetingsFocusSession';
import { buildRevenueOrdersList } from '../../../utils/adminRevenueStats';
import { markConsultOrderCompleteAfterQuoteSent } from '../../../utils/consultOrderLifecycle';
import type { ConsultOfferPersistedSnapshot } from '../../../utils/consultOfferFromQuote';
import { consultQuoteThumbnailSrcFromUnitKey } from '../../../utils/consultOfferFromQuote';
import {
  addDaysIso,
  bookingPaidInFullSalesUsd,
  consultCodeFromOrder,
  consultTypeLabelForMeeting,
  formatBookingInstallLineForViewAllGrid,
  formatHeaderDate,
  formatUsd,
  formatViewAllListMeetingDateOnly,
  formatViewAllListMeetingTimeOnly,
  meetingClientDisplayNameWithState,
  meetingClientProfilePhoto,
  meetingClientUniqKey,
  meetingHasTravelAddon,
  meetingIsCurrentOrActive,
  meetingMatchesPageSearch,
  meetingSortTimeMs,
  normalizeMoneyValue,
  normalizeSearchText,
  sortMeetingsByOption,
  tierPremium,
  viewAllListMeetingLabel,
} from '../../../utils/adminMeetingClientPanels';
import { AdminMeetingHubStyleCard } from '../../../utils/AdminMeetingHubStyleCard';

const UNIT_OPTIONS = [
  { id: 'NOIR', label: 'NOIR' },
  { id: 'BLANCO', label: 'BLANCO' },
  { id: 'SOFT WAVE', label: 'SOFT WAVE' },
  { id: 'SOFT CURL', label: 'SOFT CURL' },
  { id: 'BEACH WAVE', label: 'BEACH WAVE' },
  { id: 'OCEAN CURL', label: 'OCEAN CURL' },
] as const;

const SUB_PAGE_OPTIONS = [
  'LENGTH',
  'COLOR',
  'DENSITY',
  'CAP SIZE',
  'HAIRLINE',
  'LACE',
  'TEXTURE',
  'STYLING',
  'ADD-ONS',
] as const;

const EDIT_REASONS = [
  'SCHEDULE CONFLICT',
  'CLIENT REQUEST',
  'STAFF AVAILABILITY',
  'WEATHER / EMERGENCY',
  'OTHER',
] as const;

type PanelDropdownKey = 'editReason' | 'quoteUnit' | 'quoteSub' | 'quoteSubSelection';
type QuoteSubPage = (typeof SUB_PAGE_OPTIONS)[number];

type CreateOfferSelections = {
  capSize: string;
  length: string;
  density: string;
  texture: string;
  lace: string;
  hairline: string;
  color: string;
  styling: string;
  addOns: string[];
};

/** Same ids/order as build-a-wig cap-size page: custom XS–L then flexible bands. */
const CREATE_OFFER_CAP_SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XXS/XS/S', 'S/M/L'] as const;

const BOOKING_MEETING_SORT_OPTIONS = ['Most recent', 'A to Z', 'Z to A', 'Premium', 'Standard', 'Re-install', 'New install'] as const;
const CONSULT_MEETING_SORT_OPTIONS = ['Most recent', 'A to Z', 'Z to A', 'Premium', 'Standard', 'Wig only', 'Wig + install'] as const;
const MEETING_SORT_OPTIONS = [...BOOKING_MEETING_SORT_OPTIONS, ...CONSULT_MEETING_SORT_OPTIONS] as const;
type MeetingSortOption = (typeof MEETING_SORT_OPTIONS)[number];
function meetingSortOptionToLabel(opt: MeetingSortOption): string {
  return opt.toUpperCase();
}

function quoteUnitIdFromValue(value: string): UnitId {
  const normalized = String(value || '').trim().toUpperCase();
  if (normalized === 'BLANCO') return 'blanco';
  if (normalized === 'SOFT WAVE') return 'soft-wave';
  if (normalized === 'BEACH WAVE') return 'beach-wave';
  if (normalized === 'SOFT CURL') return 'soft-curl';
  if (normalized === 'OCEAN CURL') return 'ocean-curl';
  return 'noir';
}

function hairlineDisplayValue(value: string): string {
  return value === 'LAGOS, PEAK' ? 'LAGOS + PEAK' : value;
}

function createOfferSelectionsDefaults(unitId: UnitId): CreateOfferSelections {
  return {
    capSize: 'M',
    length: '24"',
    density: getDefaultDensityForUnit(unitId),
    texture: 'SILKY',
    lace: '13X6',
    hairline: 'NATURAL',
    color: getDefaultColorForUnit(unitId),
    styling: 'NONE',
    addOns: [],
  };
}

function createOfferSelectionOptionsForSubPage(unitId: UnitId, subPage: QuoteSubPage): readonly string[] {
  const options = getOptionsForUnit(unitId);
  switch (subPage) {
    case 'LENGTH':
      return options.length;
    case 'COLOR':
      return options.color;
    case 'DENSITY':
      return options.density;
    case 'CAP SIZE':
      return CREATE_OFFER_CAP_SIZE_OPTIONS;
    case 'HAIRLINE':
      return options.hairline;
    case 'LACE':
      return options.lace;
    case 'TEXTURE':
      return options.texture;
    case 'STYLING':
      return options.styling;
    case 'ADD-ONS':
      return ADDON_COMBO_OPTIONS.map((opt) => opt.label);
    default:
      return [];
  }
}

function createOfferSelectionRawValue(subPage: QuoteSubPage, selections: CreateOfferSelections): string {
  switch (subPage) {
    case 'LENGTH':
      return selections.length;
    case 'COLOR':
      return selections.color;
    case 'DENSITY':
      return selections.density;
    case 'CAP SIZE':
      return selections.capSize;
    case 'HAIRLINE':
      return selections.hairline;
    case 'LACE':
      return selections.lace;
    case 'TEXTURE':
      return selections.texture;
    case 'STYLING':
      return selections.styling;
    case 'ADD-ONS': {
      const match = ADDON_COMBO_OPTIONS.find(
        (opt) => opt.value.length === selections.addOns.length && opt.value.every((addOn) => selections.addOns.includes(addOn))
      );
      return match?.label ?? (selections.addOns.length === 0 ? 'NONE' : selections.addOns.join(' + '));
    }
    default:
      return '';
  }
}

function createOfferSelectionDisplayValue(subPage: QuoteSubPage, selections: CreateOfferSelections): string {
  const raw = createOfferSelectionRawValue(subPage, selections);
  return subPage === 'HAIRLINE' ? hairlineDisplayValue(raw) : raw;
}

function updateCreateOfferSelectionsForSubPage(
  previous: CreateOfferSelections,
  subPage: QuoteSubPage,
  next: string
): CreateOfferSelections {
  switch (subPage) {
    case 'LENGTH':
      return { ...previous, length: next };
    case 'COLOR':
      return { ...previous, color: next };
    case 'DENSITY':
      return { ...previous, density: next };
    case 'CAP SIZE':
      return { ...previous, capSize: next };
    case 'HAIRLINE':
      return { ...previous, hairline: next };
    case 'LACE':
      return { ...previous, lace: next };
    case 'TEXTURE':
      return { ...previous, texture: next };
    case 'STYLING':
      return { ...previous, styling: next };
    case 'ADD-ONS': {
      const match = ADDON_COMBO_OPTIONS.find((opt) => opt.label === next);
      return { ...previous, addOns: match ? [...match.value] : [] };
    }
    default:
      return previous;
  }
}

function formatCreateOfferBreakdownAmount(amountUsd: number, includeSign: boolean): string {
  const usd = `$${Math.abs(Math.round(amountUsd)).toLocaleString('en-US')} USD`;
  if (!includeSign) return usd;
  return amountUsd > 0 ? `+${usd}` : `-${usd}`;
}

const EDIT_MESSAGE_BY_REASON: Record<(typeof EDIT_REASONS)[number], { action: 'reschedule' | 'cancel'; message: string }> = {
  'SCHEDULE CONFLICT': {
    action: 'reschedule',
    message: 'WE NEED TO RESCHEDULE YOUR BOOKING DUE TO A SCHEDULE CONFLICT. PLEASE REVIEW THE UPDATED APPOINTMENT DETAILS.'
  },
  'CLIENT REQUEST': {
    action: 'reschedule',
    message: 'YOUR BOOKING HAS BEEN UPDATED PER YOUR REQUEST. PLEASE REVIEW THE RESCHEDULED APPOINTMENT DETAILS.'
  },
  'STAFF AVAILABILITY': {
    action: 'reschedule',
    message: 'WE NEED TO RESCHEDULE YOUR BOOKING DUE TO STAFF AVAILABILITY. PLEASE REVIEW THE UPDATED APPOINTMENT DETAILS.'
  },
  'WEATHER / EMERGENCY': {
    action: 'cancel',
    message: 'YOUR BOOKING HAS BEEN CANCELED DUE TO WEATHER OR AN EMERGENCY. PLEASE CONTACT US TO REVIEW NEXT STEPS.'
  },
  OTHER: {
    action: 'reschedule',
    message: 'YOUR BOOKING HAS BEEN UPDATED. PLEASE REVIEW THE LATEST APPOINTMENT DETAILS.'
  }
};

function viewAllHeaderTitle(mode: 'bookings' | 'consults' | null, uniqueClientCount: number): string | null {
  if (!mode) return null;
  if (mode === 'bookings') {
    return `${uniqueClientCount} CLIENT ${uniqueClientCount === 1 ? 'BOOKING' : 'BOOKINGS'}`;
  }
  return `${uniqueClientCount} CLIENT ${uniqueClientCount === 1 ? 'CONSULT' : 'CONSULTS'}`;
}

/** Match rewards / tier-benefits close control (brand red). */
const CLOSE_ICON_RED_FILTER =
  'brightness(0) saturate(100%) invert(15%) sepia(95%) saturate(7404%) hue-rotate(353deg) brightness(92%) contrast(92%)';

export default function AdminMeetingsHub() {
  useRequireAdminPageAccess();
  const navigate = useNavigate();
  const location = useLocation();
  const [clientSearchQuery, setClientSearchQuery] = useState(() => {
    if (typeof window === 'undefined') return '';
    const q = new URLSearchParams(window.location.search).get('q');
    return (q || '').trim();
  });
  const [mainTab, setMainTab] = useState<'overview' | 'bookings' | 'consults'>(() => {
    if (typeof window === 'undefined') return 'bookings';
    const sp = new URLSearchParams(window.location.search);
    const viewAll = sp.get('viewAll');
    if (viewAll === 'bookings' || viewAll === 'consults') return viewAll;
    const tab = sp.get('tab');
    return tab === 'overview' || tab === 'bookings' || tab === 'consults' ? tab : 'bookings';
  });
  const [calendarAnchor, setCalendarAnchor] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [apiMeetings, setApiMeetings] = useState<AdminMeeting[]>([]);
  const [localTick, setLocalTick] = useState(0);
  const [viewAllMode, setViewAllMode] = useState<'bookings' | 'consults' | null>(() => {
    if (typeof window === 'undefined') return null;
    const viewAll = new URLSearchParams(window.location.search).get('viewAll');
    if (viewAll === 'bookings' || viewAll === 'consults') return viewAll;
    try {
      const saved = window.sessionStorage.getItem('adminMeetingsViewAllMode');
      if (saved === 'bookings' || saved === 'consults') return saved;
    } catch {
      /* ignore */
    }
    return null;
  });
  const [quoteMeeting, setQuoteMeeting] = useState<AdminMeeting | null>(null);
  const [editMeeting, setEditMeeting] = useState<AdminMeeting | null>(null);
  const [quoteUnit, setQuoteUnit] = useState<string>(UNIT_OPTIONS[0].id);
  const [quoteSub, setQuoteSub] = useState<QuoteSubPage>(SUB_PAGE_OPTIONS[0]);
  const [quoteSelections, setQuoteSelections] = useState<CreateOfferSelections>(() =>
    createOfferSelectionsDefaults(quoteUnitIdFromValue(UNIT_OPTIONS[0].id))
  );
  const [quoteMessage, setQuoteMessage] = useState(
    'BASED ON YOUR INSPO AND NOTES, THESE SELECTIONS WILL GIVE YOU THE CLOSEST MATCH TO YOUR GOAL LOOK.'
  );
  const [quoteSending, setQuoteSending] = useState(false);
  const [showSendQuoteConfirm, setShowSendQuoteConfirm] = useState(false);
  const [editReason, setEditReason] = useState<string>(EDIT_REASONS[0]);
  const [editMessage, setEditMessage] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [hubNotice, setHubNotice] = useState<string | null>(null);
  const [consultPhotoPreviewSrc, setConsultPhotoPreviewSrc] = useState<string | null>(null);
  const [meetingSortOption, setMeetingSortOption] = useState<MeetingSortOption>('Most recent');
  const [showMeetingSortDropdown, setShowMeetingSortDropdown] = useState(false);
  const [viewAllDisplayMode, setViewAllDisplayMode] = useState<'list' | 'grid'>('list');
  const [activePanelDropdown, setActivePanelDropdown] = useState<PanelDropdownKey | null>(null);
  const clientDetailsFocusAppliedRef = useRef(false);

  const refreshLocal = useCallback(() => setLocalTick((t) => t + 1), []);
  const currentMeetingsSortOptions = useMemo<readonly MeetingSortOption[]>(() => {
    const effectiveTab = viewAllMode ?? mainTab;
    if (effectiveTab === 'consults') return CONSULT_MEETING_SORT_OPTIONS;
    return BOOKING_MEETING_SORT_OPTIONS;
  }, [mainTab, viewAllMode]);
  const quoteUnitId = useMemo(() => quoteUnitIdFromValue(quoteUnit), [quoteUnit]);
  const currentQuoteSubSelectionOptions = useMemo(
    () => createOfferSelectionOptionsForSubPage(quoteUnitId, quoteSub),
    [quoteUnitId, quoteSub]
  );
  const currentQuoteSubSelectionDisplayValue = useMemo(
    () => createOfferSelectionDisplayValue(quoteSub, quoteSelections),
    [quoteSelections, quoteSub]
  );
  const generatedQuoteBreakdown = useMemo(
    () => calculateSpecialOfferPriceBreakdown(quoteUnitId, quoteSelections),
    [quoteUnitId, quoteSelections]
  );

  useAdminMeetingsApiRefresh(setApiMeetings);

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const viewAll = sp.get('viewAll');
    if (viewAll === 'bookings' || viewAll === 'consults') {
      setMainTab(viewAll);
      return;
    }
    const tab = sp.get('tab');
    if (tab === 'overview' || tab === 'bookings' || tab === 'consults') setMainTab(tab);
  }, [location.search]);

  useEffect(() => {
    const q = new URLSearchParams(location.search).get('q');
    setClientSearchQuery((q || '').trim());
  }, [location.search]);

  useEffect(() => {
    const viewAll = new URLSearchParams(location.search).get('viewAll');
    if (viewAll === 'bookings' || viewAll === 'consults') {
      setViewAllMode(viewAll);
      return;
    }
    try {
      const saved = window.sessionStorage.getItem('adminMeetingsViewAllMode');
      if (saved === 'bookings' || saved === 'consults') {
        setViewAllMode(saved);
        return;
      }
    } catch {
      /* ignore */
    }
    setViewAllMode(null);
  }, [location.search]);

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    if (viewAllMode) sp.set('viewAll', viewAllMode);
    else sp.delete('viewAll');
    const nextSearch = sp.toString();
    const currentSearch = location.search.startsWith('?') ? location.search.slice(1) : location.search;
    if (nextSearch === currentSearch) return;
    navigate(`${location.pathname}${nextSearch ? `?${nextSearch}` : ''}`, { replace: true });
  }, [viewAllMode, location.pathname, location.search, navigate]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (viewAllMode) window.sessionStorage.setItem('adminMeetingsViewAllMode', viewAllMode);
      else window.sessionStorage.removeItem('adminMeetingsViewAllMode');
    } catch {
      /* ignore */
    }
  }, [viewAllMode]);

  useEffect(() => {
    setShowMeetingSortDropdown(false);
  }, [mainTab, viewAllMode]);

  useEffect(() => {
    if (!currentMeetingsSortOptions.includes(meetingSortOption)) {
      setMeetingSortOption('Most recent');
    }
  }, [currentMeetingsSortOptions, meetingSortOption]);

  useEffect(() => {
    if (!editMeeting && !quoteMeeting) setActivePanelDropdown(null);
  }, [editMeeting, quoteMeeting]);

  useEffect(() => {
    const options = getOptionsForUnit(quoteUnitId);
    const defaults = createOfferSelectionsDefaults(quoteUnitId);
    setQuoteSelections((previous) => {
      const next: CreateOfferSelections = {
        capSize: CREATE_OFFER_CAP_SIZE_OPTIONS.includes(previous.capSize as (typeof CREATE_OFFER_CAP_SIZE_OPTIONS)[number])
          ? previous.capSize
          : defaults.capSize,
        length: options.length.includes(previous.length) ? previous.length : defaults.length,
        density: options.density.includes(previous.density) ? previous.density : defaults.density,
        texture: options.texture.includes(previous.texture) ? previous.texture : defaults.texture,
        lace: options.lace.includes(previous.lace) ? previous.lace : defaults.lace,
        hairline: options.hairline.includes(previous.hairline) ? previous.hairline : defaults.hairline,
        color: options.color.includes(previous.color) ? previous.color : defaults.color,
        styling: options.styling.includes(previous.styling) ? previous.styling : defaults.styling,
        addOns: previous.addOns.every((addOn) => options.addOns.includes(addOn)) ? previous.addOns : defaults.addOns,
      };
      return JSON.stringify(next) === JSON.stringify(previous) ? previous : next;
    });
  }, [quoteUnitId]);

  const range = useMemo(() => {
    const start = startOfMonth(calendarAnchor);
    const end = endOfMonth(calendarAnchor);
    return { start, end };
  }, [calendarAnchor]);

  const mergedMeetings = useMemo(() => {
    const mock = generateMockMeetingsForRange(range.start, range.end);
    const local = loadLocalMeetings().filter((m) => m.date >= range.start && m.date <= range.end);
    const byId = new Map<string, AdminMeeting>();
    for (const m of mock) byId.set(m.id, m);
    for (const m of apiMeetings) {
      if (m.date >= range.start && m.date <= range.end) byId.set(m.id, m);
    }
    for (const m of local) byId.set(m.id, m);

    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
      const u = raw ? JSON.parse(raw) : null;
      const em = String((u as { email?: string } | null)?.email || '')
        .trim()
        .toLowerCase();
      if (u && isAdminEmail(em)) {
        const demo = adminFounderDemoConsultMeetingOrder331(startOfMonth(calendarAnchor));
        if (demo.date >= range.start && demo.date <= range.end) {
          byId.set(demo.id, demo);
        }
      }
    } catch {
      /* ignore */
    }

    return [...byId.values()].sort((a, b) => {
      const dc = a.date.localeCompare(b.date);
      if (dc !== 0) return dc;
      return a.time.localeCompare(b.time);
    });
  }, [range.start, range.end, apiMeetings, localTick, calendarAnchor]);

  /** Open edit / quote for a row navigated from admin client details (calendar month + merged list must include the meeting). */
  useEffect(() => {
    const focus = readAdminMeetingsFocusFromClientDetails();
    if (!focus) {
      clientDetailsFocusAppliedRef.current = false;
      return;
    }
    if (clientDetailsFocusAppliedRef.current) return;
    const focusYm = focus.date.slice(0, 7);
    const anchorYm = calendarAnchor.slice(0, 7);
    if (focusYm !== anchorYm) {
      setCalendarAnchor(focus.date);
      return;
    }
    const row = mergedMeetings.find((m) => m.id === focus.meetingId);
    if (!row) {
      clientDetailsFocusAppliedRef.current = true;
      clearAdminMeetingsFocusFromClientDetails();
      return;
    }
    clientDetailsFocusAppliedRef.current = true;
    clearAdminMeetingsFocusFromClientDetails();
    const isConsultRow = row.category === 'consultation';
    if (focus.tab === 'consults') {
      setMainTab('consults');
    } else if (focus.tab === 'bookings') {
      setMainTab('bookings');
    } else {
      setMainTab(isConsultRow ? 'consults' : 'bookings');
    }
    setViewAllMode(null);
    if (isConsultRow) {
      setQuoteMeeting(row);
      setEditMeeting(null);
    } else {
      setSelectedDay(row.date);
      setEditMeeting(row);
      setQuoteMeeting(null);
    }
  }, [mergedMeetings, calendarAnchor]);

  const appointmentMeetings = useMemo(
    () => mergedMeetings.filter((m) => m.category !== 'consultation'),
    [mergedMeetings]
  );

  /** Order comes from `sortMeetingsByOption` on the consult tab; avoid a hidden premium/date pre-sort. */
  const consultMeetings = useMemo(
    () => mergedMeetings.filter((m) => m.category === 'consultation'),
    [mergedMeetings]
  );

  const normalizedClientSearchTokens = useMemo(
    () =>
      normalizeSearchText(clientSearchQuery)
        .split(' ')
        .map((token) => token.trim())
        .filter(Boolean),
    [clientSearchQuery]
  );

  const filteredAppointmentMeetings = useMemo(
    () => appointmentMeetings.filter((m) => meetingMatchesPageSearch(m, normalizedClientSearchTokens)),
    [appointmentMeetings, normalizedClientSearchTokens]
  );

  const filteredConsultMeetings = useMemo(
    () => consultMeetings.filter((m) => meetingMatchesPageSearch(m, normalizedClientSearchTokens)),
    [consultMeetings, normalizedClientSearchTokens]
  );

  const completedBookingsCount = useMemo(
    () =>
      appointmentMeetings.filter((m) => {
        const s = String(m.status || '').toLowerCase();
        return s === 'completed' || s === 'confirmed';
      }).length,
    [appointmentMeetings]
  );

  const completedConsultsCount = useMemo(
    () =>
      consultMeetings.filter((m) => {
        const s = String(m.status || '').toLowerCase();
        return s === 'completed' || s === 'confirmed';
      }).length,
    [consultMeetings]
  );

  const apptDates = useMemo(() => {
    const s = new Set<string>();
    for (const m of filteredAppointmentMeetings) s.add(m.date);
    return s;
  }, [filteredAppointmentMeetings]);

  const appointmentsForSelectedDay = useMemo(() => {
    if (!selectedDay) return filteredAppointmentMeetings;
    return filteredAppointmentMeetings.filter((m) => m.date === selectedDay);
  }, [filteredAppointmentMeetings, selectedDay]);

  const sortedAppointmentsList = useMemo(
    () => sortMeetingsByOption(appointmentsForSelectedDay, meetingSortOption),
    [appointmentsForSelectedDay, meetingSortOption]
  );

  const sortedConsultsList = useMemo(
    () => sortMeetingsByOption(filteredConsultMeetings, meetingSortOption),
    [filteredConsultMeetings, meetingSortOption]
  );

  const openClientAccount = (m: AdminMeeting) => {
    const em = (m.clientEmail || '').trim();
    const meetingsTabForReturn = mainTab === 'consults' ? 'consults' : 'bookings';
    if (em) {
      navigate(
        `/admin/clients/overview?email=${encodeURIComponent(em.toLowerCase())}&returnTo=meetings&meetingsTab=${meetingsTabForReturn}`
      );
    }
    else setHubNotice('NO CLIENT EMAIL ON FILE FOR THIS ROW.');
  };

  const handleConfirmSendQuote = async () => {
    if (!quoteMeeting) return;
    const email = (quoteMeeting.clientEmail || '').trim().toLowerCase();
    if (!email) {
      setHubNotice('CLIENT EMAIL REQUIRED TO SEND QUOTE.');
      setShowSendQuoteConfirm(false);
      return;
    }
    setQuoteSending(true);
    try {
      const breakdown = generatedQuoteBreakdown.lines.map((line) => ({
        label: line.label,
        value:
          line.amountUsd === 0
            ? line.selection
            : `${line.selection} ${formatCreateOfferBreakdownAmount(line.amountUsd, line.label !== 'BASE UNIT')}`,
      }));
      breakdown.push({
        label: 'ESTIMATED TOTAL',
        value: `$${Math.round(generatedQuoteBreakdown.totalUsd).toLocaleString('en-US')} USD`,
      });
      const selectionsForQuote = {
        capSize: quoteSelections.capSize,
        length: quoteSelections.length,
        density: quoteSelections.density,
        texture: quoteSelections.texture,
        lace: quoteSelections.lace,
        hairline: quoteSelections.hairline,
        color: quoteSelections.color,
        styling: quoteSelections.styling,
        addOns: quoteSelections.addOns,
      };
      const thumbSrc = consultQuoteThumbnailSrcFromUnitKey(quoteUnit);
      const res = (await postAdminConsultQuote({
        clientEmail: email,
        unitKey: quoteUnit,
        selections: selectionsForQuote,
        priceBreakdown: breakdown,
        adminMessage: quoteMessage,
        thumbnailSrc: thumbSrc,
      })) as { quote?: Record<string, unknown>; discountCode?: string };
      const quoteRow = res?.quote && typeof res.quote === 'object' ? res.quote : {};
      const quoteId = String((quoteRow as { id?: string }).id || '').trim();
      const discountCode = String(res?.discountCode || (quoteRow as { discount_code?: string }).discount_code || '').trim();
      const expiresAt = String((quoteRow as { expires_at?: string }).expires_at || '').trim();
      const orderRef = String(
        (quoteMeeting.metadata && typeof quoteMeeting.metadata.orderNumber === 'string'
          ? quoteMeeting.metadata.orderNumber
          : '') || ''
      ).trim();
      if (quoteId && orderRef) {
        const snapshot: ConsultOfferPersistedSnapshot = {
          unitKey: quoteUnit,
          selections: selectionsForQuote,
          priceBreakdown: breakdown,
          adminMessage: quoteMessage,
          thumbnailSrc: thumbSrc,
          discountCode,
          expiresAt,
        };
        markConsultOrderCompleteAfterQuoteSent({
          clientEmail: email,
          orderNumberFromCheckout: orderRef,
          consultQuoteId: quoteId,
          consultOfferSnapshot: snapshot,
        });
      }
      setQuoteMeeting(null);
      setShowSendQuoteConfirm(false);
      setHubNotice('QUOTE SENT — CLIENT ALERT CREATED.');
    } catch (e) {
      setHubNotice(e instanceof Error ? e.message.toUpperCase() : 'SEND FAILED');
    } finally {
      setQuoteSending(false);
    }
  };

  const submitEditMeeting = async (action: 'reschedule' | 'cancel') => {
    if (!editMeeting) return;
    const uuid = /^[0-9a-f-]{36}$/i.test(editMeeting.id);
    setEditSubmitting(true);
    try {
      if (uuid) {
        await patchAdminMeeting(editMeeting.id, {
          notes: `${editMeeting.notes}\nADMIN: ${editReason} — ${editMessage}`.slice(0, 1200),
          status: 'scheduled',
        });
      }
      const email = editMeeting.clientEmail?.trim().toLowerCase();
      const uid = editMeeting.userId?.trim();
      let doneNotice = 'UPDATE RECORDED.';
      if (isSupabaseConfigured() && (email || uid)) {
        try {
          await postAdminMeetingClientAlert({
            meetingId: editMeeting.id,
            reason: editReason,
            message: editMessage,
            action,
            ...(uid ? { userId: uid } : {}),
            ...(email ? { clientEmail: email } : {}),
          });
          doneNotice = 'UPDATE SENT — CLIENT ALERT ADDED.';
        } catch (alertErr) {
          setHubNotice(
            alertErr instanceof Error
              ? `${alertErr.message.toUpperCase()} (NOTES SAVED)`
              : 'ALERT FAILED (NOTES SAVED)'
          );
          setEditMeeting(null);
          setEditMessage('');
          refreshLocal();
          return;
        }
      } else if (isSupabaseConfigured()) {
        doneNotice = 'NOTES SAVED — ADD CLIENT EMAIL ON MEETING TO SEND ALERTS.';
      }
      setEditMeeting(null);
      setEditMessage('');
      setHubNotice(doneNotice);
      refreshLocal();
      if (uuid) dispatchAdminMeetingsApiRefresh();
    } catch (e) {
      setHubNotice(e instanceof Error ? e.message.toUpperCase() : 'UPDATE FAILED');
    } finally {
      setEditSubmitting(false);
    }
  };

  const viewAllBaseRows = useMemo(() => {
    if (!viewAllMode) return [] as AdminMeeting[];
    const base = viewAllMode === 'bookings' ? filteredAppointmentMeetings : filteredConsultMeetings;
    return [...base].sort((a, b) => meetingSortTimeMs(b) - meetingSortTimeMs(a));
  }, [viewAllMode, filteredAppointmentMeetings, filteredConsultMeetings]);

  const viewAllRows = useMemo(
    () => sortMeetingsByOption(viewAllBaseRows, meetingSortOption),
    [viewAllBaseRows, meetingSortOption]
  );

  const viewAllClientCards = useMemo(() => {
    if (!viewAllMode) return [] as Array<{
      key: string;
      displayName: string;
      profilePhoto: string;
      hasActiveMeeting: boolean;
      totalCount: number;
      latestMeeting: AdminMeeting;
    }>;
    const byClient = new Map<
      string,
      { key: string; displayName: string; profilePhoto: string; hasActiveMeeting: boolean; totalCount: number; latestMeeting: AdminMeeting }
    >();
    for (const row of viewAllBaseRows) {
      const key = meetingClientUniqKey(row);
      const existing = byClient.get(key);
      if (!existing) {
        byClient.set(key, {
          key,
          displayName: meetingClientDisplayNameWithState(row),
          profilePhoto: meetingClientProfilePhoto(row),
          hasActiveMeeting: meetingIsCurrentOrActive(row),
          totalCount: 1,
          latestMeeting: row,
        });
        continue;
      }
      existing.totalCount += 1;
      if (meetingIsCurrentOrActive(row)) existing.hasActiveMeeting = true;
      if (meetingSortTimeMs(row) > meetingSortTimeMs(existing.latestMeeting)) {
        existing.latestMeeting = row;
        existing.profilePhoto = meetingClientProfilePhoto(row);
      }
    }
    const cards = [...byClient.values()];
    if (meetingSortOption === 'A to Z') {
      cards.sort((a, b) => a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' }));
    } else if (meetingSortOption === 'Z to A') {
      cards.sort((a, b) => b.displayName.localeCompare(a.displayName, undefined, { sensitivity: 'base' }));
    } else {
      cards.sort((a, b) => meetingSortTimeMs(b.latestMeeting) - meetingSortTimeMs(a.latestMeeting));
    }
    return cards;
  }, [viewAllMode, viewAllBaseRows, meetingSortOption]);

  const viewAllListClientPanels = useMemo(() => {
    if (!viewAllMode) return [] as Array<{
      key: string;
      displayName: string;
      profilePhoto: string;
      latestMeeting: AdminMeeting;
      tierIsPremium: boolean;
      meetings: AdminMeeting[];
    }>;

    const byClient = new Map<
      string,
      {
        key: string;
        displayName: string;
        profilePhoto: string;
        latestMeeting: AdminMeeting;
        tierIsPremium: boolean;
        meetings: AdminMeeting[];
      }
    >();

    for (const row of viewAllRows) {
      const key = meetingClientUniqKey(row);
      const existing = byClient.get(key);
      if (!existing) {
        byClient.set(key, {
          key,
          displayName: meetingClientDisplayNameWithState(row),
          profilePhoto: meetingClientProfilePhoto(row),
          latestMeeting: row,
          tierIsPremium: tierPremium(row),
          meetings: [row],
        });
        continue;
      }
      existing.meetings.push(row);
      if (meetingSortTimeMs(row) > meetingSortTimeMs(existing.latestMeeting)) {
        existing.latestMeeting = row;
        existing.profilePhoto = meetingClientProfilePhoto(row);
        existing.tierIsPremium = tierPremium(row);
      }
    }

    return [...byClient.values()].map((group) => {
      const meetings = [...group.meetings].sort((a, b) => meetingSortTimeMs(b) - meetingSortTimeMs(a));
      const latestMeeting = meetings[0] ?? group.latestMeeting;
      return {
        ...group,
        meetings,
        latestMeeting,
        profilePhoto: meetingClientProfilePhoto(latestMeeting),
        tierIsPremium: tierPremium(latestMeeting),
      };
    });
  }, [viewAllMode, viewAllRows]);

  const viewAllUniqueClientCount = useMemo(() => {
    if (!viewAllMode) return 0;
    return viewAllClientCards.length;
  }, [viewAllMode, viewAllClientCards]);

  const overviewBookingSales = useMemo(() => {
    let completedAppointments = 0;
    let paidInFullAppointments = 0;
    let salesUsd = 0;
    for (const appt of appointmentMeetings) {
      if (String(appt.status || '').trim().toLowerCase() !== 'completed') continue;
      completedAppointments += 1;
      const paidSale = bookingPaidInFullSalesUsd(appt);
      if (paidSale == null) continue;
      paidInFullAppointments += 1;
      salesUsd += paidSale;
    }
    return {
      completedAppointments,
      paidInFullAppointments,
      pendingBalanceAppointments: Math.max(0, completedAppointments - paidInFullAppointments),
      salesUsd,
      avgPaidInFullUsd: paidInFullAppointments > 0 ? Math.round(salesUsd / paidInFullAppointments) : 0,
    };
  }, [appointmentMeetings]);

  const overviewConsultSales = useMemo(() => {
    const allOrders = buildRevenueOrdersList() as Array<Record<string, unknown>>;
    const seenOrderKey = new Set<string>();
    let redeemedOrderCount = 0;
    let salesUsd = 0;
    for (const order of allOrders) {
      const consultCode = consultCodeFromOrder(order);
      if (!consultCode) continue;
      const orderKey = String(order.id || order.orderNumber || '').trim() || `${consultCode}-${String(order.date || '')}`;
      if (seenOrderKey.has(orderKey)) continue;
      seenOrderKey.add(orderKey);
      const total = normalizeMoneyValue(order.total ?? order.amount ?? order.subtotal);
      if (total == null || total <= 0) continue;
      redeemedOrderCount += 1;
      salesUsd += total;
    }
    const completedConsults = consultMeetings.filter(
      (m) => String(m.status || '').trim().toLowerCase() === 'completed'
    ).length;
    const wigOnlyConsults = consultMeetings.filter((m) => consultTypeLabelForMeeting(m) === 'WIG ONLY').length;
    const wigInstallConsults = consultMeetings.filter((m) => consultTypeLabelForMeeting(m) === 'WIG + INSTALL').length;
    return {
      salesUsd,
      redeemedOrderCount,
      completedConsults,
      totalConsults: consultMeetings.length,
      wigOnlyConsults,
      wigInstallConsults,
      avgRedeemedOrderUsd: redeemedOrderCount > 0 ? Math.round(salesUsd / redeemedOrderCount) : 0,
    };
  }, [consultMeetings, localTick]);

  const activeMainCardTitle = viewAllHeaderTitle(viewAllMode, viewAllUniqueClientCount)
    ?? (editMeeting
    ? String(editMeeting.client || '').trim().toUpperCase()
    : quoteMeeting
    ? String(quoteMeeting.client || '').trim().toUpperCase()
    : null);

  const closeMainCardPanel = () => {
    setViewAllMode(null);
    setQuoteMeeting(null);
    setEditMeeting(null);
    setEditMessage('');
  };

  const renderMeetingsSortDropdown = () => (
    <div className="relative" style={{ marginLeft: '2px', display: 'inline-flex', flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setShowMeetingSortDropdown((open) => !open)}
        className="flex items-center gap-1.5"
        style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000', whiteSpace: 'nowrap', flexShrink: 0 }}
        aria-label="Sort clients"
      >
        <span style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>{meetingSortOptionToLabel(meetingSortOption)}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{ transform: showMeetingSortDropdown ? 'rotate(180deg)' : 'none', color: '#EB1C24' }}
          aria-hidden
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {showMeetingSortDropdown && (
        <>
          <div className="fixed inset-0 z-10" aria-hidden onClick={() => setShowMeetingSortDropdown(false)} />
          <div
            className="absolute left-0 py-1 bg-white border border-black shadow-lg z-20 min-w-[120px]"
            style={{ borderWidth: '1.3px', marginTop: '7px' }}
          >
            {currentMeetingsSortOptions.filter((opt) => opt !== meetingSortOption).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setMeetingSortOption(opt);
                  setShowMeetingSortDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-xs uppercase hover:bg-gray-100 transition-colors"
                style={{ fontFamily: '"Futura PT Book"', color: '#000', fontWeight: 400 }}
              >
                {meetingSortOptionToLabel(opt)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );

  const renderPanelSelectDropdown = ({
    dropdownKey,
    label,
    value,
    displayValue,
    options,
    onChange,
    formatOptionLabel,
  }: {
    dropdownKey: PanelDropdownKey;
    label: string;
    value: string;
    displayValue?: string;
    options: readonly string[];
    onChange: (next: string) => void;
    formatOptionLabel?: (option: string) => string;
  }) => (
    <div className="mt-2">
      <label style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', display: 'block' }}>{label}</label>
      <div className="relative mt-1">
        <button
          type="button"
          onClick={() => setActivePanelDropdown((open) => (open === dropdownKey ? null : dropdownKey))}
          className="w-full"
          style={{
            width: '100%',
            padding: '8px 10px',
            minHeight: '36px',
            border: '1.3px solid #000',
            borderRadius: 0,
            fontFamily: '"Futura PT Book"',
            fontSize: '11px',
            background: '#fff',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            color: editMeeting || quoteMeeting ? '#EB1C24' : '#000',
            letterSpacing: '0.02em',
          }}
        >
          <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
            {displayValue ?? value}
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className="flex-shrink-0"
            style={{
              transform: activePanelDropdown === dropdownKey ? 'rotate(180deg)' : 'none',
              color: '#EB1C24',
              marginLeft: '8px',
            }}
          >
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {activePanelDropdown === dropdownKey ? (
          <>
            <div
              className="fixed inset-0 z-10"
              aria-hidden="true"
              onClick={() => setActivePanelDropdown(null)}
            />
            <div
              className="absolute left-0 right-0 py-1 bg-white border border-black shadow-lg z-20 max-h-48 overflow-y-auto"
              style={{ borderWidth: '1.3px', borderRadius: 0, marginTop: '7px' }}
            >
              {options.filter((opt) => opt !== value).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setActivePanelDropdown(null);
                  }}
                  className="w-full text-left px-3 py-2 text-xs uppercase hover:bg-gray-100 transition-colors"
                  style={{
                    fontFamily: '"Futura PT Book"',
                    color: '#000',
                    fontWeight: 400,
                    backgroundColor: '#fff',
                  }}
                >
                  {formatOptionLabel ? formatOptionLabel(opt) : opt}
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );

  const travelBlackoutDates = useMemo(() => {
    const blocked = new Set<string>();
    for (const appt of appointmentMeetings) {
      if (!meetingHasTravelAddon(appt)) continue;
      blocked.add(addDaysIso(appt.date, 1));
    }
    return blocked;
  }, [appointmentMeetings]);

  const travelHalfDayDates = useMemo(() => {
    const blocked = new Set<string>();
    for (const appt of appointmentMeetings) {
      if (!meetingHasTravelAddon(appt)) continue;
      blocked.add(addDaysIso(appt.date, -1));
    }
    return blocked;
  }, [appointmentMeetings]);

  const adminBookingsCalendarVisibleMonth = `${calendarAnchor.slice(0, 7)}-01`;

  const getAdminBookingsCalendarDayMeta = useCallback(
    (iso: string): AdminCalendarDayMeta => {
      const hasAppt = apptDates.has(iso);
      const hasTravelBlock = travelBlackoutDates.has(iso);
      const hasTravelHalfDay = travelHalfDayDates.has(iso);
      const title = hasTravelBlock
        ? 'TRAVEL BLOCK: UNAVAILABLE (FULL DAY)'
        : hasTravelHalfDay
          ? 'TRAVEL BLOCK: AFTER 12PM UNAVAILABLE'
          : undefined;
      return {
        disabled: hasTravelBlock,
        appointmentHighlight: !hasTravelBlock && hasAppt,
        title,
      };
    },
    [apptDates, travelBlackoutDates, travelHalfDayDates]
  );

  const onAdminBookingsCalendarMonthChange = useCallback((isoFirstOfMonth: string) => {
    const target = parseISODateLocal(isoFirstOfMonth);
    const cur = parseISODateLocal(calendarAnchor);
    if (target.getFullYear() === cur.getFullYear() && target.getMonth() === cur.getMonth()) return;
    const y = target.getFullYear();
    const mo = String(target.getMonth() + 1).padStart(2, '0');
    setCalendarAnchor(`${y}-${mo}-${String(cur.getDate()).padStart(2, '0')}`);
  }, [calendarAnchor]);

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/marble-half.png')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="relative z-10" style={{ textTransform: 'uppercase' }}>
        <AdminHeader
          title="MEETINGS"
          showBack
          onBack={() => window.history.back()}
          breadcrumbParentLabel="ADMIN"
          breadcrumbParentPath="/admin/dashboard"
          externalSearchValue={clientSearchQuery}
          onExternalSearchChange={setClientSearchQuery}
          globalSearchTargetPath="/admin/meetings"
          globalSearchPreserveKeys={['tab', 'viewAll']}
        />

        <div className="pb-6 px-4">
          <div className="max-w-md mx-auto">
            <div
              className="bg-white/60 backdrop-blur-sm border border-black flex flex-col overflow-hidden min-h-0"
              style={{
                borderWidth: '1.3px',
                minHeight: 'calc(100dvh - 160px)',
              }}
            >
              {activeMainCardTitle ? (
                <div className="flex-shrink-0 px-5 pb-2 -mt-1" style={{ marginTop: '10px' }}>
                  <div className="flex items-center justify-between" style={{ minWidth: 0 }}>
                    <h2
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        color: editMeeting || quoteMeeting ? '#EB1C24' : '#000',
                        fontSize: '12px',
                        fontWeight: 500,
                        display: 'block',
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minWidth: 0,
                        flex: '1 1 auto',
                        width: '100%',
                        maxWidth: 'calc(100% - 24px)',
                        paddingRight: '8px',
                      }}
                    >
                      {activeMainCardTitle}
                    </h2>
                    <button
                      type="button"
                      onClick={closeMainCardPanel}
                      aria-label="Close view all"
                      style={{
                        padding: 0,
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        lineHeight: 0,
                      }}
                    >
                      <img
                        src="/assets/close-icon.svg"
                        alt=""
                        width={16}
                        height={16}
                        style={{ display: 'block', filter: CLOSE_ICON_RED_FILTER }}
                      />
                    </button>
                  </div>
                  <div
                    style={{
                      borderBottom: '1px solid #d1d5db',
                      marginTop: '8px',
                    }}
                  />
                </div>
              ) : (
                <div
                  className="flex-shrink-0 px-5 pb-2"
                  style={{ marginTop: '10px' }}
                >
                  <div className="grid grid-cols-2 gap-4 mb-4" style={{ marginTop: '12px' }}>
                    <div
                      className="text-center py-3"
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.04)',
                        borderRadius: '4px',
                        height: '80px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        paddingBottom: '10px',
                      }}
                    >
                      <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24', lineHeight: 1, fontSize: '24px' }}>
                        {mainTab === 'overview' ? formatUsd(overviewBookingSales.salesUsd) : completedBookingsCount}
                      </p>
                      <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>
                        {mainTab === 'overview' ? 'BOOKING SALES' : 'TOTAL BOOKED'}
                      </p>
                    </div>
                    <div
                      className="text-center py-3"
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.04)',
                        borderRadius: '4px',
                        height: '80px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        paddingBottom: '10px',
                      }}
                    >
                      <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24', lineHeight: 1, fontSize: '24px' }}>
                        {mainTab === 'overview' ? formatUsd(overviewConsultSales.salesUsd) : completedConsultsCount}
                      </p>
                      <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>
                        {mainTab === 'overview' ? 'CONSULT SALES' : 'TOTAL CONSULTED'}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      overflowX: 'auto',
                      WebkitOverflowScrolling: 'touch',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                    }}
                  >
                    <div
                      className="flex items-center gap-6"
                      style={{
                        width: 'max-content',
                        minWidth: '100%',
                        justifyContent: 'center',
                        whiteSpace: 'nowrap',
                      }}
                    >
                    <button
                      type="button"
                      onClick={() => setMainTab('overview')}
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '11px',
                        color: mainTab === 'overview' ? '#EB1C24' : '#808080',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        borderBottom: mainTab === 'overview' ? '1px solid #EB1C24' : '1px solid transparent',
                        paddingBottom: '4px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      OVERVIEW
                    </button>
                    <button
                      type="button"
                      onClick={() => setMainTab('bookings')}
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '11px',
                        color: mainTab === 'bookings' ? '#EB1C24' : '#808080',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        borderBottom: mainTab === 'bookings' ? '1px solid #EB1C24' : '1px solid transparent',
                        paddingBottom: '4px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      BOOKINGS
                    </button>
                    <button
                      type="button"
                      onClick={() => setMainTab('consults')}
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '11px',
                        color: mainTab === 'consults' ? '#EB1C24' : '#808080',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        borderBottom: mainTab === 'consults' ? '1px solid #EB1C24' : '1px solid transparent',
                        paddingBottom: '4px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      CONSULTS
                    </button>
                    </div>
                  </div>
                </div>
              )}

              {hubNotice && (
                <div className="px-5 py-2" style={{ background: 'rgba(235,28,36,0.08)' }}>
                  <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', margin: 0, color: '#000' }}>{hubNotice}</p>
                  <button type="button" onClick={() => setHubNotice(null)} style={{ fontSize: '9px', marginTop: '4px' }}>
                    DISMISS
                  </button>
                </div>
              )}

              <div
                className="flex-1 min-h-0"
                style={{ paddingLeft: '20px', paddingRight: '20px', paddingBottom: '24px', boxSizing: 'border-box' }}
              >
                <div
                  className="overflow-y-auto"
                  style={{
                    maxHeight: 'calc(100dvh - 240px)',
                    paddingTop: '2px',
                    boxSizing: 'border-box',
                  }}
                >
                {viewAllMode ? (
                  <>
                    <div
                      className="flex items-center justify-between"
                      style={{ marginTop: '10px', marginBottom: '8px', position: 'relative', zIndex: 3 }}
                    >
                      {renderMeetingsSortDropdown()}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', transform: 'translateX(-2px)' }}>
                        <button
                          type="button"
                          onClick={() => setViewAllDisplayMode('list')}
                          style={{
                            padding: '4px',
                            border: viewAllDisplayMode === 'list' ? '1px solid #EB1C24' : '1px solid #ccc',
                            background: 'none',
                            cursor: 'pointer',
                            borderRadius: 0,
                            color: viewAllDisplayMode === 'list' ? '#EB1C24' : '#000',
                          }}
                          aria-label="List view"
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '12px', gap: '3px' }}>
                            <div style={{ width: '12px', height: '1px', backgroundColor: 'currentColor' }} />
                            <div style={{ width: '12px', height: '1px', backgroundColor: 'currentColor' }} />
                            <div style={{ width: '12px', height: '1px', backgroundColor: 'currentColor' }} />
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewAllDisplayMode('grid')}
                          style={{
                            padding: '4px',
                            border: viewAllDisplayMode === 'grid' ? '1px solid #EB1C24' : '1px solid #ccc',
                            background: 'none',
                            cursor: 'pointer',
                            borderRadius: 0,
                            color: viewAllDisplayMode === 'grid' ? '#EB1C24' : '#000',
                          }}
                          aria-label="Grid view"
                        >
                          <div style={{ width: '12px', height: '12px', border: '1px solid currentColor', backgroundColor: 'white', position: 'relative' }}>
                            <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '1px', transform: 'translateY(-50%)', backgroundColor: 'currentColor' }} />
                            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', transform: 'translateX(-50%)', backgroundColor: 'currentColor' }} />
                          </div>
                        </button>
                      </div>
                    </div>
                    {viewAllDisplayMode === 'grid' ? (
                      <div className="grid grid-cols-3 gap-2" style={{ marginTop: '10px' }}>
                        {viewAllClientCards.map((clientCard) => {
                          const latest = clientCard.latestMeeting;
                          return (
                            <button
                              key={clientCard.key}
                              type="button"
                              onClick={() => openClientAccount(latest)}
                              className="w-full"
                              style={{
                                background: '#fff',
                                border: '1px solid #d1d5db',
                                borderRadius: '0',
                                padding: '8px 6px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                overflow: 'hidden',
                              }}
                            >
                              <img
                                src={clientCard.profilePhoto}
                                alt=""
                                width={53}
                                height={53}
                                style={{
                                  width: '53px',
                                  height: '53px',
                                  objectFit: 'cover',
                                  borderRadius: '9999px',
                                  border: '0.7px solid #000',
                                  boxSizing: 'border-box',
                                  margin: '4px auto 0',
                                  display: 'block',
                                }}
                              />
                              <p
                                style={{
                                  fontFamily: '"Futura PT Medium"',
                                  fontSize: '8px',
                                  color: clientCard.hasActiveMeeting ? '#EB1C24' : '#000',
                                  margin: '6px 0 0',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {clientCard.displayName}
                              </p>
                              <p
                                style={{
                                  fontFamily: '"Futura PT Medium"',
                                  fontSize: '8px',
                                  color: '#808080',
                                  margin: '1px 0',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {clientCard.totalCount}{' '}
                                {viewAllMode === 'bookings'
                                  ? clientCard.totalCount === 1
                                    ? 'BOOKING'
                                    : 'BOOKINGS'
                                  : clientCard.totalCount === 1
                                  ? 'CONSULT'
                                  : 'CONSULTS'}
                              </p>
                              {viewAllMode === 'bookings' ? (
                                <>
                                  <p
                                    style={{
                                      fontFamily: '"Futura PT Medium"',
                                      fontSize: '8px',
                                      color: '#EB1C24',
                                      margin: '2px 0 0',
                                      lineHeight: 1.2,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {formatBookingInstallLineForViewAllGrid(latest)}
                                  </p>
                                  <p
                                    style={{
                                      fontFamily: '"Futura PT Book"',
                                      fontSize: '8px',
                                      color: '#000',
                                      margin: '4px 0 0',
                                      lineHeight: 1.2,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {formatHeaderDate(latest.date)}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p
                                    style={{
                                      fontFamily: '"Futura PT Medium"',
                                      fontSize: '8px',
                                      color: '#EB1C24',
                                      margin: '2px 0 0',
                                      lineHeight: 1.2,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {consultTypeLabelForMeeting(latest)}
                                  </p>
                                  <p
                                    style={{
                                      fontFamily: '"Futura PT Book"',
                                      fontSize: '8px',
                                      color: '#000',
                                      margin: '4px 0 0',
                                      lineHeight: 1.2,
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    {formatHeaderDate(latest.date)}
                                  </p>
                                </>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-3" style={{ marginTop: '10px' }}>
                        {viewAllListClientPanels.map((clientGroup) => (
                          <div
                            key={clientGroup.key}
                            style={{
                              background: '#fff',
                              border: '1px solid #d1d5db',
                              borderRadius: '0',
                              padding: '10px',
                              height: '92px',
                              boxSizing: 'border-box',
                              overflow: 'hidden',
                            }}
                          >
                            <div className="flex items-start gap-2.5">
                              <button
                                type="button"
                                onClick={() => openClientAccount(clientGroup.latestMeeting)}
                                aria-label="Open client details"
                                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, lineHeight: 0, flexShrink: 0 }}
                              >
                                <img
                                  src={clientGroup.profilePhoto}
                                  alt=""
                                  width={62}
                                  height={62}
                                  style={{ width: '62px', height: '62px', objectFit: 'cover', borderRadius: '9999px', border: '0.7px solid #000', flexShrink: 0 }}
                                />
                              </button>
                              <div
                                style={{
                                  minWidth: 0,
                                  flex: 1,
                                  /* Text only: nudge up 6px vs avatar; keep prior 6px horizontal inset */
                                  transform: 'translate(6px, -6px)',
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => openClientAccount(clientGroup.latestMeeting)}
                                  style={{
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    padding: 0,
                                    margin: 0,
                                    width: '100%',
                                    textAlign: 'left',
                                  }}
                                >
                                  <p
                                    style={{
                                      fontFamily: '"Futura PT Medium"',
                                      fontSize: '10px',
                                      margin: '0',
                                      color: '#000',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                    }}
                                  >
                                    <span style={{ color: '#000' }}>{clientGroup.displayName}</span>{' '}
                                    <span style={{ color: clientGroup.tierIsPremium ? '#000' : '#808080' }}>
                                      · {clientGroup.tierIsPremium ? 'PREMIUM' : 'STANDARD'}
                                    </span>
                                  </p>
                                </button>
                                <div
                                  style={{
                                    marginTop: '5px',
                                    maxHeight: '44px',
                                    overflowY: clientGroup.meetings.length > 3 ? 'auto' : 'hidden',
                                    paddingRight: clientGroup.meetings.length > 3 ? '4px' : 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px',
                                  }}
                                >
                                  {clientGroup.meetings.map((meeting) => (
                                    <div
                                      key={meeting.id}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'baseline',
                                        /* ~one word-space at 9px — 1ch was digit-width (too wide vs a real space) */
                                        fontSize: '9px',
                                        gap: '0.35em',
                                        minWidth: 0,
                                        lineHeight: '12px',
                                      }}
                                    >
                                      <span
                                        style={{
                                          fontFamily: '"Futura PT Medium"',
                                          fontSize: '9px',
                                          color: '#808080',
                                          flexShrink: 0,
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        {viewAllListMeetingLabel(meeting)}
                                      </span>
                                      <span
                                        style={{
                                          fontFamily: '"Futura PT Medium"',
                                          fontSize: '9px',
                                          color: '#EB1C24',
                                          minWidth: 0,
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        {formatViewAllListMeetingDateOnly(meeting)} ·{' '}
                                        <span style={{ color: '#000' }}>{formatViewAllListMeetingTimeOnly(meeting)}</span>
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : editMeeting ? (
                  <div style={{ marginTop: '12px', minHeight: '240px', display: 'flex', flexDirection: 'column' }}>
                    {renderPanelSelectDropdown({
                      dropdownKey: 'editReason',
                      label: 'REASON',
                      value: editReason,
                      options: EDIT_REASONS,
                      onChange: (next) => {
                        setEditReason(next);
                        const preset = EDIT_MESSAGE_BY_REASON[next as (typeof EDIT_REASONS)[number]];
                        if (preset) setEditMessage(preset.message);
                      },
                    })}
                    <label className="block mt-2" style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', marginTop: 'auto', paddingTop: '24px' }}>
                      MESSAGE TO CLIENT
                      <textarea
                        className="w-full mt-1 p-2 border text-[10px]"
                        rows={3}
                        value={editMessage}
                        onChange={(e) => setEditMessage(e.target.value)}
                      />
                    </label>
                  </div>
                ) : quoteMeeting ? (
                  <div style={{ marginTop: '12px' }}>
                    {renderPanelSelectDropdown({
                      dropdownKey: 'quoteUnit',
                      label: 'UNIT',
                      value: UNIT_OPTIONS.find((u) => u.id === quoteUnit)?.label ?? quoteUnit,
                      options: UNIT_OPTIONS.map((u) => u.label),
                      onChange: (next) => {
                        const picked = UNIT_OPTIONS.find((u) => u.label === next);
                        setQuoteUnit(picked?.id ?? next);
                      },
                    })}
                    {renderPanelSelectDropdown({
                      dropdownKey: 'quoteSub',
                      label: 'SUB-PAGE',
                      value: quoteSub,
                      options: SUB_PAGE_OPTIONS,
                      onChange: (next) => setQuoteSub(next as QuoteSubPage),
                    })}
                    {renderPanelSelectDropdown({
                      dropdownKey: 'quoteSubSelection',
                      label: 'SELECTION',
                      value: currentQuoteSubSelectionDisplayValue,
                      options: currentQuoteSubSelectionOptions.map((option) =>
                        quoteSub === 'HAIRLINE' ? hairlineDisplayValue(option) : option
                      ),
                      onChange: (nextDisplay) => {
                        const rawValue = quoteSub === 'HAIRLINE' && nextDisplay === 'LAGOS + PEAK' ? 'LAGOS, PEAK' : nextDisplay;
                        setQuoteSelections((previous) => updateCreateOfferSelectionsForSubPage(previous, quoteSub, rawValue));
                      },
                    })}
                    <label className="block mt-2" style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', marginTop: '100px' }}>
                      MESSAGE
                      <textarea
                        className="w-full mt-1 p-2 border text-[10px]"
                        rows={3}
                        value={quoteMessage}
                        onChange={(e) => setQuoteMessage(e.target.value)}
                      />
                    </label>
                    <div className="mt-2">
                      <label style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', display: 'block' }}>
                        PRICE BREAKDOWN
                      </label>
                      <div
                        className="mt-1"
                        style={{
                          border: '1.3px solid #000',
                          background: '#fff',
                          padding: '10px',
                        }}
                      >
                        <div style={{ display: 'grid', rowGap: '6px' }}>
                          {generatedQuoteBreakdown.lines.map((line: SpecialOfferBreakdownLine) => {
                            const selection = line.selection;
                            const amountText = line.amountUsd === 0 ? '' : formatCreateOfferBreakdownAmount(line.amountUsd, line.label !== 'BASE UNIT');
                            return (
                              <div
                                key={`${line.label}-${selection}`}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  justifyContent: 'space-between',
                                  gap: '10px',
                                }}
                              >
                                <div
                                  style={{
                                    fontFamily: '"Futura PT Book"',
                                    fontSize: '10px',
                                    color: '#000',
                                    lineHeight: 1.35,
                                    textTransform: 'uppercase',
                                    minWidth: 0,
                                  }}
                                >
                                  <span>{line.label}: </span>
                                  <span>{selection}</span>
                                </div>
                                {amountText ? (
                                  <span
                                    style={{
                                      fontFamily: '"Futura PT Medium"',
                                      fontSize: '10px',
                                      color: '#EB1C24',
                                      lineHeight: 1.35,
                                      textTransform: 'uppercase',
                                      flexShrink: 0,
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {amountText}
                                  </span>
                                ) : null}
                              </div>
                            );
                          })}
                          <div
                            style={{
                              borderTop: '1px solid #e5e7eb',
                              paddingTop: '8px',
                              marginTop: '2px',
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              gap: '10px',
                            }}
                          >
                            <span
                              style={{
                                fontFamily: '"Futura PT Book"',
                                fontSize: '10px',
                                color: '#000',
                                lineHeight: 1.35,
                                textTransform: 'uppercase',
                              }}
                            >
                              ESTIMATED TOTAL:
                            </span>
                            <span
                              style={{
                                fontFamily: '"Futura PT Medium"',
                                fontSize: '10px',
                                color: '#EB1C24',
                                lineHeight: 1.35,
                                textTransform: 'uppercase',
                                flexShrink: 0,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              ${Math.round(generatedQuoteBreakdown.totalUsd).toLocaleString('en-US')} USD
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#808080', marginTop: '8px' }}>
                      OFFER DETAILS REFLECT THE CURRENT UNIT + SUB-PAGE SELECTION YOU CHOOSE HERE.
                    </p>
                  </div>
                ) : mainTab === 'overview' ? (
                  <>
                    <div style={{ marginTop: '12px' }}>
                      <div className="space-y-3">
                        <div style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '0', padding: '10px' }}>
                          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#000', margin: 0 }}>
                            APPOINTMENT ANALYTICS
                          </p>
                          <div style={{ marginTop: '8px', display: 'grid', rowGap: '5px' }}>
                            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', margin: 0, color: '#808080' }}>
                              COMPLETED APPOINTMENTS: {overviewBookingSales.completedAppointments}
                            </p>
                            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', margin: 0, color: '#808080' }}>
                              PAID IN FULL APPOINTMENTS: {overviewBookingSales.paidInFullAppointments}
                            </p>
                            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', margin: 0, color: '#808080' }}>
                              APPOINTMENTS WITH REMAINING BALANCE: {overviewBookingSales.pendingBalanceAppointments}
                            </p>
                            <p style={{ fontFamily: '"Futura PT Demi"', fontSize: '9px', margin: 0, color: '#EB1C24' }}>
                              AVG BOOKING SALE (PAID IN FULL): {formatUsd(overviewBookingSales.avgPaidInFullUsd)}
                            </p>
                          </div>
                        </div>

                        <div style={{ background: '#fff', border: '1px solid #d1d5db', borderRadius: '0', padding: '10px' }}>
                          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#000', margin: 0 }}>
                            CONSULT ANALYTICS
                          </p>
                          <div style={{ marginTop: '8px', display: 'grid', rowGap: '5px' }}>
                            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', margin: 0, color: '#808080' }}>
                              TOTAL CONSULT MEETINGS: {overviewConsultSales.totalConsults}
                            </p>
                            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', margin: 0, color: '#808080' }}>
                              COMPLETED CONSULTS: {overviewConsultSales.completedConsults}
                            </p>
                            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', margin: 0, color: '#808080' }}>
                              WIG ONLY CONSULTS: {overviewConsultSales.wigOnlyConsults}
                            </p>
                            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', margin: 0, color: '#808080' }}>
                              WIG + INSTALL CONSULTS: {overviewConsultSales.wigInstallConsults}
                            </p>
                            <p style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', margin: 0, color: '#808080' }}>
                              REDEEMED CONSULT-OFFER ORDERS: {overviewConsultSales.redeemedOrderCount}
                            </p>
                            <p style={{ fontFamily: '"Futura PT Demi"', fontSize: '9px', margin: 0, color: '#EB1C24' }}>
                              AVG CONSULT SALE (REDEEMED OFFERS): {formatUsd(overviewConsultSales.avgRedeemedOrderUsd)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : mainTab === 'bookings' ? (
                  <>
                    <div style={{ marginTop: '4px', marginBottom: '16px' }}>
                      <BrandExpiresDatePicker
                        inline
                        monthLabelVariant="adminMeetings"
                        navArrowScale={17 / 22}
                        value={calendarAnchor}
                        onChange={() => {}}
                        visibleMonthAnchor={adminBookingsCalendarVisibleMonth}
                        onVisibleMonthAnchorChange={onAdminBookingsCalendarMonthChange}
                        selectionIso={selectedDay ?? ''}
                        getDayMeta={getAdminBookingsCalendarDayMeta}
                        hideClearDate
                        onDayClick={(iso) => setSelectedDay((current) => (current === iso ? null : iso))}
                      />
                    </div>
                    {sortedAppointmentsList.length === 0 ? (
                      <p
                        style={{
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '11px',
                          color: '#808080',
                          textAlign: 'center',
                          padding: '16px',
                        }}
                      >
                        {normalizedClientSearchTokens.length > 0
                          ? 'NO BOOKINGS MATCH YOUR SEARCH.'
                          : 'YOU DON\'T HAVE ANY APPOINTMENTS.'}
                      </p>
                    ) : (
                      <div style={{ marginTop: '6px' }}>
                        <div className="flex items-center justify-start" style={{ marginTop: '0', marginBottom: '10px', position: 'relative', zIndex: 3 }}>
                          {renderMeetingsSortDropdown()}
                        </div>
                        {sortedAppointmentsList.map((m) => (
                          <AdminMeetingHubStyleCard
                            key={m.id}
                            m={m}
                            variant="booking"
                            onProfileClick={() => openClientAccount(m)}
                            onActionClick={(e) => {
                              e.stopPropagation();
                              setEditMeeting(m);
                            }}
                            actionAriaLabel="Edit meeting"
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-start" style={{ marginTop: '8px', marginBottom: '8px', position: 'relative', zIndex: 3 }}>
                      {renderMeetingsSortDropdown()}
                    </div>
                    {sortedConsultsList.length === 0 ? (
                      <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#808080', textAlign: 'center' }}>
                        {normalizedClientSearchTokens.length > 0
                          ? 'NO CONSULTS MATCH YOUR SEARCH.'
                          : 'NO CONSULT ROWS IN THIS MONTH RANGE. SYNC FROM CHECKOUT OR EXPAND MOCK DATA.'}
                      </p>
                    ) : (
                      <div style={{ marginTop: '6px' }}>
                        {sortedConsultsList.map((m) => (
                          <AdminMeetingHubStyleCard
                            key={m.id}
                            m={m}
                            variant="consult"
                            onProfileClick={() => openClientAccount(m)}
                            onActionClick={(e) => {
                              e.stopPropagation();
                              setQuoteMeeting(m);
                            }}
                            actionAriaLabel="Send quote"
                            onConsultPhotoClick={setConsultPhotoPreviewSrc}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
                </div>
              </div>
            </div>

            <div className="w-full px-0 md:px-0" style={{ marginTop: '10px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {editMeeting ? (
                  <>
                    <button
                      type="button"
                      onClick={() => void submitEditMeeting('reschedule')}
                      className="border border-black font-futura w-full text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                      style={{
                        borderWidth: '1.3px',
                        color: '#EB1C24',
                        fontFamily: '"Futura PT Medium"',
                        backgroundColor: '#FFFFFF',
                        whiteSpace: 'nowrap',
                      }}
                      disabled={editSubmitting}
                    >
                      {editSubmitting ? '…' : 'RESCHEDULE'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void submitEditMeeting('cancel')}
                      className="border border-black font-futura w-full text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                      style={{
                        borderWidth: '1.3px',
                        color: '#EB1C24',
                        fontFamily: '"Futura PT Medium"',
                        backgroundColor: '#FFFFFF',
                        whiteSpace: 'nowrap',
                      }}
                      disabled={editSubmitting}
                    >
                      CANCEL BOOKING
                    </button>
                  </>
                ) : quoteMeeting ? (
                  <button
                    type="button"
                    onClick={() => setShowSendQuoteConfirm(true)}
                    className="border border-black font-futura w-full text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                    style={{
                      borderWidth: '1.3px',
                      color: '#EB1C24',
                      fontFamily: '"Futura PT Medium"',
                      backgroundColor: '#FFFFFF',
                      whiteSpace: 'nowrap',
                    }}
                    disabled={quoteSending}
                  >
                    {quoteSending ? '…' : 'SEND OFFER'}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setMainTab('bookings');
                        setViewAllMode((m) => (m === 'bookings' ? null : 'bookings'));
                      }}
                      className="border border-black font-futura w-full text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                      style={{
                        borderWidth: '1.3px',
                        color: '#EB1C24',
                        fontFamily: '"Futura PT Medium"',
                        backgroundColor: '#FFFFFF',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      VIEW ALL BOOKINGS
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMainTab('consults');
                        setViewAllMode((m) => (m === 'consults' ? null : 'consults'));
                      }}
                      className="border border-black font-futura w-full text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                      style={{
                        borderWidth: '1.3px',
                        color: '#EB1C24',
                        fontFamily: '"Futura PT Medium"',
                        backgroundColor: '#FFFFFF',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      VIEW ALL CONSULTS
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showSendQuoteConfirm}
        onClose={() => setShowSendQuoteConfirm(false)}
        onConfirm={() => void handleConfirmSendQuote()}
        title="SEND OFFER?"
        message="CLIENT WILL RECEIVE AN ALERT FOR THIS OFFER."
        confirmText="CONFIRM"
        cancelText="CANCEL"
        dataAttribute="send-consult-quote-confirm"
      />

      {consultPhotoPreviewSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={() => setConsultPhotoPreviewSrc(null)}
          role="presentation"
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              border: '1.3px solid #000',
              background: '#fff',
              padding: '10px',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
            role="presentation"
          >
            <img
              src={consultPhotoPreviewSrc}
              alt="Consult submitted photo preview"
              style={{
                width: '100%',
                maxHeight: 'calc(90vh - 20px)',
                objectFit: 'contain',
                display: 'block',
                background: '#f3f4f6',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
