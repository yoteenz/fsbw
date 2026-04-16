import { useState, useEffect, useMemo, useCallback, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import BrandExpiresDatePicker, { type AdminCalendarDayMeta } from '../../../components/BrandExpiresDatePicker';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import {
  patchAdminMeeting,
  postBuildWigUnitImage,
  postAdminConsultQuote,
  postAdminMeetingClientAlert,
} from '../../../utils/api';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { useRequireAdminPageAccess } from '../../../hooks/useRequireAdminPageAccess';
import { isAdminEmail } from '../../../utils/adminAuth';
import { dispatchAdminMeetingsApiRefresh, useAdminMeetingsApiRefresh } from '../../../hooks/useAdminMeetingsApiRefresh';
import ConfirmationModal from '../../../components/ConfirmationModal';
import OrderFormFilePicker from '../../../components/OrderFormFilePicker';
import {
  ADDON_COMBO_OPTIONS,
  getDefaultColorForUnit,
  getDefaultDensityForUnit,
  getOptionsForUnit,
  type UnitId,
} from '../../../utils/productOptions';
import {
  calculateSpecialOfferPriceBreakdown,
  expandStylingBreakdownLineForDisplay,
  type SpecialOfferBreakdownLine,
  type SpecialOfferOptions,
} from '../../../utils/specialOfferPrice';
import {
  adminFounderDemoConsultMeetingOrder331,
  adminFounderDemoConsultMeetingOrder340,
  adminFounderDemoConsultMeetingOrder341,
  endOfMonth,
  generateMockMeetingsForRange,
  loadLocalMeetings,
  parseISODateLocal,
  startOfMonth,
  upsertLocalMeeting,
  type AdminMeeting,
} from '../../../utils/adminMeetingsMock';
import {
  clearAdminMeetingsFocusFromClientDetails,
  readAdminMeetingsFocusFromClientDetails,
} from '../../../utils/adminMeetingsFocusSession';
import { buildRevenueOrdersList } from '../../../utils/adminRevenueStats';
import { markConsultOrderCompleteAfterQuoteSent } from '../../../utils/consultOrderLifecycle';
import type { ConsultOfferPersistedSnapshot } from '../../../utils/consultOfferFromQuote';
import { ordersPageUnitThumbnailSrcFromUnitKey } from '../../../utils/accountReviewProductThumbnail';
import { appendConsultOfferCompleteAccountAlert } from '../../../utils/orderAccountAlerts';
import {
  deleteAdminConsultOfferSavedThumbnail,
  loadAdminConsultOfferSavedThumbnails,
  stableConsultOfferSelectionsKey,
  upsertAdminConsultOfferSavedThumbnail,
} from '../../../utils/adminConsultOfferSavedThumbnails';
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
  meetingClientNamePlain,
  meetingClientProfilePhoto,
  meetingClientUniqKey,
  meetingClientViewAllListHeadline,
  meetingHasTravelAddon,
  meetingIsArchivedForAdminViewAll,
  meetingIsCurrentOrActive,
  meetingMatchesPageSearch,
  meetingSortTimeMs,
  normalizeMoneyValue,
  normalizeSearchText,
  sortMeetingsByOption,
  tierPremium,
  viewAllListMeetingLabel,
} from '../../../utils/adminMeetingClientPanels';

const SEND_OFFER_GENERATE_UNIT_ROSE_REFERENCE_URL =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/refs-noir/consult%20inspo2.JPG';
import { AdminMeetingHubStyleCard } from '../../../utils/AdminMeetingHubStyleCard';
import { BAW_CUSTOM_SEND_OFFER_OPTION_ID } from '../../../utils/bawCustomSendOfferOption';

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

type PanelDropdownKey = 'editReason' | 'quoteUnit' | 'quoteSub' | 'quoteSubSelection' | 'quotePartSelection';
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
  /** Parting when styling applies (cart / claim). */
  partSelection: string;
  addOns: string[];
};

const QUOTE_PART_SELECTION_OPTIONS = ['MIDDLE', 'LEFT', 'RIGHT'] as const;

/** Same ids/order as build-a-wig cap-size page: custom XS–L then flexible bands. */
const CREATE_OFFER_CAP_SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XXS/XS/S', 'S/M/L'] as const;

const BOOKING_MEETING_SORT_OPTIONS = [
  'Most recent',
  'A to Z',
  'Z to A',
  'Archived',
  'Premium',
  'Standard',
  'Re-install',
  'New install',
] as const;
const CONSULT_MEETING_SORT_OPTIONS = [
  'Most recent',
  'A to Z',
  'Z to A',
  'Archived',
  'Premium',
  'Standard',
  'Wig only',
  'Wig + install',
] as const;
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
    partSelection: 'MIDDLE',
    addOns: [],
  };
}

function createOfferSelectionOptionsForSubPage(unitId: UnitId, subPage: QuoteSubPage): readonly string[] {
  const options = getOptionsForUnit(unitId);
  switch (subPage) {
    case 'LENGTH':
      return [BAW_CUSTOM_SEND_OFFER_OPTION_ID, ...options.length];
    case 'COLOR':
      return [BAW_CUSTOM_SEND_OFFER_OPTION_ID, ...options.color];
    case 'DENSITY':
      return [BAW_CUSTOM_SEND_OFFER_OPTION_ID, ...options.density];
    case 'CAP SIZE':
      return [BAW_CUSTOM_SEND_OFFER_OPTION_ID, ...CREATE_OFFER_CAP_SIZE_OPTIONS];
    case 'HAIRLINE':
      return [BAW_CUSTOM_SEND_OFFER_OPTION_ID, ...options.hairline];
    case 'LACE':
      return [BAW_CUSTOM_SEND_OFFER_OPTION_ID, ...options.lace];
    case 'TEXTURE':
      return [BAW_CUSTOM_SEND_OFFER_OPTION_ID, ...options.texture];
    case 'STYLING':
      return [BAW_CUSTOM_SEND_OFFER_OPTION_ID, ...options.styling];
    case 'ADD-ONS':
      return [BAW_CUSTOM_SEND_OFFER_OPTION_ID, ...ADDON_COMBO_OPTIONS.map((opt) => opt.label)];
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
      if (selections.addOns.length === 1 && selections.addOns[0] === BAW_CUSTOM_SEND_OFFER_OPTION_ID) return BAW_CUSTOM_SEND_OFFER_OPTION_ID;
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

function sendOfferSubPageToBreakdownLineKey(subPage: QuoteSubPage): keyof NonNullable<SpecialOfferOptions['customLineUsd']> {
  if (subPage === 'CAP SIZE') return 'CAP SIZE';
  if (subPage === 'ADD-ONS') return 'ADD-ONS';
  return subPage as keyof NonNullable<SpecialOfferOptions['customLineUsd']>;
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
      if (next === BAW_CUSTOM_SEND_OFFER_OPTION_ID) return { ...previous, addOns: [BAW_CUSTOM_SEND_OFFER_OPTION_ID] };
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
  if (amountUsd > 0) return `+${usd}`;
  if (amountUsd < 0) return `-${usd}`;
  return usd;
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

const SESSION_QUOTE_MEETING_ID = 'adminMeetingsQuoteMeetingId';
const sessionQuoteDraftKey = (meetingId: string) => `adminMeetingsQuoteDraft_${meetingId}`;

function randomConsultDiscountCode(): string {
  const part = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CONSULT-${part}`;
}

function randomQuoteId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `quote-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

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
  /** Send offer: **CUSTOM** line item USD per category (only used when that row is `CUSTOM`). */
  const [offerCustomUsdByLine, setOfferCustomUsdByLine] = useState<Partial<Record<QuoteSubPage, number>>>({});
  const [quoteMessage, setQuoteMessage] = useState(
    'BASED ON YOUR INSPO AND NOTES, THESE SELECTIONS WILL GIVE YOU THE CLOSEST MATCH TO YOUR GOAL LOOK. 2D MODEL IS FOR ILLUSTRATIVE AND MARKETING PURPOSES ONLY. COLORS AND STYLING MAY DIFFER OR SLIGHTLY VARY FROM THE FINAL CONSTRUCTION OF YOUR UNIT. THIS IS NOT A GUARANTEE OF AN EXACT MATCH TO YOUR INSPO IMAGES. HANDCRAFTED UNITS ARE SUBJECT TO ARTISAN VARIATION. THIS FEATURE IS PURELY FOR BRANDING AND VISUALIZATION.'
  );
  const [quoteSending, setQuoteSending] = useState(false);
  /** SAVE SELECTION: same UX pattern as shop **ADD TO BAG** (adding → success, then reset). */
  const [quoteSaveSelectionState, setQuoteSaveSelectionState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const quoteSaveSelectionResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showSendQuoteConfirm, setShowSendQuoteConfirm] = useState(false);
  const [showRegenerateQuoteUnitConfirm, setShowRegenerateQuoteUnitConfirm] = useState(false);
  const [editReason, setEditReason] = useState<string>(EDIT_REASONS[0]);
  const [editMessage, setEditMessage] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [hubNotice, setHubNotice] = useState<string | null>(null);
  const [consultPhotoPreviewSrc, setConsultPhotoPreviewSrc] = useState<string | null>(null);
  /** Admin-uploaded image for this session (optional); takes precedence over saved-by-selection map. */
  const [quoteManualThumbnailSrc, setQuoteManualThumbnailSrc] = useState<string | null>(null);
  const [quoteGenerateUnitState, setQuoteGenerateUnitState] = useState<'idle' | 'loading'>('idle');
  const [quoteGenerateUnitError, setQuoteGenerateUnitError] = useState<string | null>(null);
  const [quoteGeneratedSelectionKey, setQuoteGeneratedSelectionKey] = useState<string | null>(null);
  /** `selectionKey` → data URL from “SAVE SELECTION” (localStorage-backed). */
  const [quoteSavedThumbnailMap, setQuoteSavedThumbnailMap] = useState<Record<string, string>>(() =>
    typeof window !== 'undefined' ? loadAdminConsultOfferSavedThumbnails() : {}
  );
  const [meetingSortOption, setMeetingSortOption] = useState<MeetingSortOption>('Most recent');
  const [showMeetingSortDropdown, setShowMeetingSortDropdown] = useState(false);
  const [viewAllDisplayMode, setViewAllDisplayMode] = useState<'list' | 'grid'>('list');
  const [activePanelDropdown, setActivePanelDropdown] = useState<PanelDropdownKey | null>(null);
  const [panelDropdownRect, setPanelDropdownRect] = useState<DOMRect | null>(null);
  const panelDropdownAnchorRef = useRef<HTMLButtonElement | null>(null);
  const quoteOfferImageInputRef = useRef<HTMLInputElement | null>(null);
  const clientDetailsFocusAppliedRef = useRef(false);

  const quoteSelectionKey = useMemo(
    () =>
      stableConsultOfferSelectionsKey(quoteUnit, {
        length: quoteSelections.length,
        density: quoteSelections.density,
        color: quoteSelections.color,
        hairline: quoteSelections.hairline,
        styling: quoteSelections.styling,
        partSelection: quoteSelections.partSelection,
        addOns: quoteSelections.addOns,
      }),
    [
      quoteUnit,
      quoteSelections.length,
      quoteSelections.density,
      quoteSelections.color,
      quoteSelections.hairline,
      quoteSelections.styling,
      quoteSelections.partSelection,
      quoteSelections.addOns,
    ]
  );

  const quoteSavedThumbnailForSelection = quoteSavedThumbnailMap[quoteSelectionKey] || null;
  const quoteEffectiveCustomSrc = quoteManualThumbnailSrc ?? quoteSavedThumbnailForSelection;
  const quoteOfferThumbnailSrc =
    quoteEffectiveCustomSrc || ordersPageUnitThumbnailSrcFromUnitKey(quoteUnit);
  const handleGenerateQuoteUnitImage = useCallback(async () => {
    setShowRegenerateQuoteUnitConfirm(false);
    setQuoteGenerateUnitState('loading');
    setQuoteGenerateUnitError(null);
    try {
      const result = await postBuildWigUnitImage({
        unitKey: quoteUnit,
        referenceImagePath: ordersPageUnitThumbnailSrcFromUnitKey(quoteUnit),
        referenceView: 'FRONT',
        backdropReferenceImageUrl: SEND_OFFER_GENERATE_UNIT_ROSE_REFERENCE_URL,
        length: quoteSelections.length,
        density: quoteSelections.density,
        lace: quoteSelections.lace,
        texture: quoteSelections.texture,
        color: quoteSelections.color,
        hairline: quoteSelections.hairline,
        styling: quoteSelections.styling,
        addOns: quoteSelections.addOns,
        partSelection: quoteSelections.partSelection,
        referenceMatchesHairline: String(quoteUnit || '').trim().toUpperCase() === 'NOIR',
      });
      setQuoteManualThumbnailSrc(result.imageUrl);
      setQuoteGeneratedSelectionKey(quoteSelectionKey);
    } catch (error) {
      setQuoteGenerateUnitError(
        error instanceof Error ? error.message : 'Generate unit image failed.'
      );
    } finally {
      setQuoteGenerateUnitState('idle');
    }
  }, [quoteSelectionKey, quoteSelections, quoteUnit]);

  useEffect(() => {
    if (!quoteMeeting) return;
    setQuoteSavedThumbnailMap(loadAdminConsultOfferSavedThumbnails());
  }, [quoteMeeting]);

  useEffect(() => {
    if (!quoteMeeting) {
      setQuoteGenerateUnitError(null);
      setQuoteGenerateUnitState('idle');
      setQuoteGeneratedSelectionKey(null);
      setShowRegenerateQuoteUnitConfirm(false);
      return;
    }
    setQuoteGenerateUnitError(null);
    setQuoteGenerateUnitState('idle');
    setShowRegenerateQuoteUnitConfirm(false);
  }, [quoteMeeting, quoteUnit, quoteSelections]);

  useLayoutEffect(() => {
    if (!activePanelDropdown || !panelDropdownAnchorRef.current) {
      setPanelDropdownRect(null);
      return;
    }
    const el = panelDropdownAnchorRef.current;
    const update = () => setPanelDropdownRect(el.getBoundingClientRect());
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [activePanelDropdown, quoteUnit, quoteSub, quoteSelections, editReason, editMeeting, quoteMeeting]);

  const refreshLocal = useCallback(() => setLocalTick((t) => t + 1), []);

  /**
   * Which pair of summary tiles to show. When **View all** is open, `viewAllMode` can disagree with
   * `mainTab` until URL sync runs — prefer `viewAllMode` so Bookings vs Consults headers match the list.
   */
  const summaryStripMode: 'overview' | 'bookings' | 'consults' =
    mainTab === 'overview'
      ? 'overview'
      : viewAllMode === 'bookings' || viewAllMode === 'consults'
        ? viewAllMode
        : mainTab === 'consults'
          ? 'consults'
          : 'bookings';

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

  const computeSpecialOfferInput = useMemo((): SpecialOfferOptions => {
    const customLineUsd: NonNullable<SpecialOfferOptions['customLineUsd']> = {};
    for (const sub of SUB_PAGE_OPTIONS) {
      const raw = createOfferSelectionRawValue(sub, quoteSelections);
      if (raw !== BAW_CUSTOM_SEND_OFFER_OPTION_ID) continue;
      const key = sendOfferSubPageToBreakdownLineKey(sub);
      const usd = Math.max(0, Math.round(offerCustomUsdByLine[sub] ?? 0));
      customLineUsd[key] = usd;
    }
    const hasCustom = Object.keys(customLineUsd).length > 0;
    return {
      ...quoteSelections,
      partSelection: quoteSelections.partSelection,
      ...(hasCustom ? { customLineUsd } : {}),
    };
  }, [quoteSelections, offerCustomUsdByLine]);

  const generatedQuoteBreakdown = useMemo(
    () => calculateSpecialOfferPriceBreakdown(quoteUnitId, computeSpecialOfferInput),
    [quoteUnitId, computeSpecialOfferInput]
  );

  const quoteBreakdownDisplayLines = useMemo(() => {
    const partRaw =
      generatedQuoteBreakdown.lines.find((l) => l.label === 'PARTING')?.selection ?? quoteSelections.partSelection;
    return generatedQuoteBreakdown.lines
      .filter((line) => line.label !== 'PARTING')
      .flatMap((line) =>
        line.label === 'STYLING' ? expandStylingBreakdownLineForDisplay(line, String(partRaw || '')) : [line]
      );
  }, [generatedQuoteBreakdown.lines, quoteSelections.partSelection]);

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
    setOfferCustomUsdByLine({});
  }, [quoteUnitId]);

  useEffect(() => {
    const options = getOptionsForUnit(quoteUnitId);
    const defaults = createOfferSelectionsDefaults(quoteUnitId);
    setQuoteSelections((previous) => {
      const next: CreateOfferSelections = {
        capSize:
          CREATE_OFFER_CAP_SIZE_OPTIONS.includes(previous.capSize as (typeof CREATE_OFFER_CAP_SIZE_OPTIONS)[number]) ||
          previous.capSize === BAW_CUSTOM_SEND_OFFER_OPTION_ID
            ? previous.capSize
            : defaults.capSize,
        length:
          options.length.includes(previous.length) || previous.length === BAW_CUSTOM_SEND_OFFER_OPTION_ID
            ? previous.length
            : defaults.length,
        density:
          options.density.includes(previous.density) || previous.density === BAW_CUSTOM_SEND_OFFER_OPTION_ID
            ? previous.density
            : defaults.density,
        texture:
          options.texture.includes(previous.texture) || previous.texture === BAW_CUSTOM_SEND_OFFER_OPTION_ID
            ? previous.texture
            : defaults.texture,
        lace: options.lace.includes(previous.lace) || previous.lace === BAW_CUSTOM_SEND_OFFER_OPTION_ID ? previous.lace : defaults.lace,
        hairline:
          options.hairline.includes(previous.hairline) || previous.hairline === BAW_CUSTOM_SEND_OFFER_OPTION_ID
            ? previous.hairline
            : defaults.hairline,
        color: options.color.includes(previous.color) || previous.color === BAW_CUSTOM_SEND_OFFER_OPTION_ID ? previous.color : defaults.color,
        styling:
          options.styling.includes(previous.styling) || previous.styling === BAW_CUSTOM_SEND_OFFER_OPTION_ID
            ? previous.styling
            : defaults.styling,
        addOns:
          (previous.addOns.length === 1 && previous.addOns[0] === BAW_CUSTOM_SEND_OFFER_OPTION_ID) ||
          previous.addOns.every((addOn) => options.addOns.includes(addOn))
            ? previous.addOns
            : defaults.addOns,
        partSelection: QUOTE_PART_SELECTION_OPTIONS.includes(
          String(previous.partSelection || '').toUpperCase() as (typeof QUOTE_PART_SELECTION_OPTIONS)[number]
        )
          ? String(previous.partSelection || '').toUpperCase()
          : defaults.partSelection,
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
        const anchor = startOfMonth(calendarAnchor);
        const demos = [
          adminFounderDemoConsultMeetingOrder331(anchor),
          adminFounderDemoConsultMeetingOrder340(anchor),
          adminFounderDemoConsultMeetingOrder341(anchor),
        ];
        for (const demo of demos) {
          if (demo.date >= range.start && demo.date <= range.end) {
            byId.set(demo.id, demo);
          }
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

  /** Restore Send offer after refresh: align month first, then reopen row when it appears in `mergedMeetings`. */
  useEffect(() => {
    if (quoteMeeting || typeof window === 'undefined') return;
    let id = '';
    try {
      id = (sessionStorage.getItem(SESSION_QUOTE_MEETING_ID) || '').trim();
    } catch {
      return;
    }
    if (!id) return;
    const m = mergedMeetings.find((x) => x.id === id);
    if (!m || m.category !== 'consultation') return;
    const rowYm = m.date.slice(0, 7);
    const anchorYm = calendarAnchor.slice(0, 7);
    if (rowYm && rowYm !== anchorYm) {
      setCalendarAnchor(m.date);
      return;
    }
    setQuoteMeeting(m);
    setMainTab('consults');
    setViewAllMode(null);
  }, [mergedMeetings, quoteMeeting, calendarAnchor]);

  /** Persist quote draft (debounced so session restore hydrate does not overwrite with defaults). */
  useEffect(() => {
    if (!quoteMeeting || typeof window === 'undefined') return;
    const id = window.setTimeout(() => {
      try {
        sessionStorage.setItem(SESSION_QUOTE_MEETING_ID, quoteMeeting.id);
        sessionStorage.setItem(
          sessionQuoteDraftKey(quoteMeeting.id),
          JSON.stringify({
            quoteUnit,
            quoteSub,
            quoteSelections,
            offerCustomUsdByLine,
            quoteMessage,
            quoteManualThumbnailDataUrl: quoteManualThumbnailSrc?.startsWith('data:') ? quoteManualThumbnailSrc : undefined,
          })
        );
      } catch {
        /* ignore */
      }
    }, 400);
    return () => window.clearTimeout(id);
  }, [quoteMeeting, quoteUnit, quoteSub, quoteSelections, offerCustomUsdByLine, quoteMessage, quoteManualThumbnailSrc]);

  useEffect(() => {
    if (!quoteMeeting) {
      setOfferCustomUsdByLine({});
      setQuoteSaveSelectionState('idle');
      if (quoteSaveSelectionResetTimeoutRef.current) {
        clearTimeout(quoteSaveSelectionResetTimeoutRef.current);
        quoteSaveSelectionResetTimeoutRef.current = null;
      }
    }
  }, [quoteMeeting]);

  useEffect(
    () => () => {
      if (quoteSaveSelectionResetTimeoutRef.current) {
        clearTimeout(quoteSaveSelectionResetTimeoutRef.current);
        quoteSaveSelectionResetTimeoutRef.current = null;
      }
    },
    []
  );

  const quoteMeetingOpenSeqRef = useRef(0);
  /** Load saved draft when a consult send-offer row opens (after refresh or Send quote click). */
  useEffect(() => {
    if (!quoteMeeting || typeof window === 'undefined') {
      quoteMeetingOpenSeqRef.current = 0;
      return;
    }
    quoteMeetingOpenSeqRef.current += 1;
    const seq = quoteMeetingOpenSeqRef.current;
    const mid = quoteMeeting.id;
    setOfferCustomUsdByLine({});
    queueMicrotask(() => {
      if (seq !== quoteMeetingOpenSeqRef.current) return;
      try {
        const raw = sessionStorage.getItem(sessionQuoteDraftKey(mid));
        if (!raw) {
          setQuoteManualThumbnailSrc(null);
          return;
        }
        const d = JSON.parse(raw) as {
          quoteUnit?: string;
          quoteSub?: string;
          quoteSelections?: CreateOfferSelections;
          offerCustomUsdByLine?: Partial<Record<QuoteSubPage, number>>;
          quoteMessage?: string;
          quoteManualThumbnailDataUrl?: string;
        };
        const unitFromDraft = String(d.quoteUnit || '').trim();
        if (UNIT_OPTIONS.some((u) => u.id === unitFromDraft)) setQuoteUnit(unitFromDraft);
        if (SUB_PAGE_OPTIONS.includes((d.quoteSub || '') as QuoteSubPage)) {
          setQuoteSub(d.quoteSub as QuoteSubPage);
        }
        if (typeof d.quoteMessage === 'string') setQuoteMessage(d.quoteMessage);
        const legacyThumb = (d as { quoteCustomThumbnailDataUrl?: string }).quoteCustomThumbnailDataUrl;
        if (typeof d.quoteManualThumbnailDataUrl === 'string' && d.quoteManualThumbnailDataUrl.startsWith('data:')) {
          setQuoteManualThumbnailSrc(d.quoteManualThumbnailDataUrl);
        } else if (typeof legacyThumb === 'string' && legacyThumb.startsWith('data:')) {
          setQuoteManualThumbnailSrc(legacyThumb);
        } else {
          setQuoteManualThumbnailSrc(null);
        }
        if (!d.quoteSelections || typeof d.quoteSelections !== 'object') return;
        const uid = quoteUnitIdFromValue(unitFromDraft || quoteUnit);
        const opts = getOptionsForUnit(uid);
        const prev = d.quoteSelections;
        const def = createOfferSelectionsDefaults(uid);
        const nextSelections: CreateOfferSelections = {
          capSize:
            CREATE_OFFER_CAP_SIZE_OPTIONS.includes(prev.capSize as (typeof CREATE_OFFER_CAP_SIZE_OPTIONS)[number]) ||
            prev.capSize === BAW_CUSTOM_SEND_OFFER_OPTION_ID
              ? prev.capSize
              : def.capSize,
          length:
            opts.length.includes(prev.length) || prev.length === BAW_CUSTOM_SEND_OFFER_OPTION_ID ? prev.length : def.length,
          density:
            opts.density.includes(prev.density) || prev.density === BAW_CUSTOM_SEND_OFFER_OPTION_ID
              ? prev.density
              : def.density,
          texture:
            opts.texture.includes(prev.texture) || prev.texture === BAW_CUSTOM_SEND_OFFER_OPTION_ID
              ? prev.texture
              : def.texture,
          lace: opts.lace.includes(prev.lace) || prev.lace === BAW_CUSTOM_SEND_OFFER_OPTION_ID ? prev.lace : def.lace,
          hairline:
            opts.hairline.includes(prev.hairline) || prev.hairline === BAW_CUSTOM_SEND_OFFER_OPTION_ID
              ? prev.hairline
              : def.hairline,
          color: opts.color.includes(prev.color) || prev.color === BAW_CUSTOM_SEND_OFFER_OPTION_ID ? prev.color : def.color,
          styling:
            opts.styling.includes(prev.styling) || prev.styling === BAW_CUSTOM_SEND_OFFER_OPTION_ID
              ? prev.styling
              : def.styling,
          addOns:
            (Array.isArray(prev.addOns) &&
              prev.addOns.length === 1 &&
              prev.addOns[0] === BAW_CUSTOM_SEND_OFFER_OPTION_ID) ||
            (Array.isArray(prev.addOns) && prev.addOns.length && prev.addOns.every((a) => opts.addOns.includes(a)))
              ? prev.addOns
              : def.addOns,
          partSelection: QUOTE_PART_SELECTION_OPTIONS.includes(
            String((prev as CreateOfferSelections).partSelection || '').toUpperCase() as (typeof QUOTE_PART_SELECTION_OPTIONS)[number]
          )
            ? String((prev as CreateOfferSelections).partSelection || '').toUpperCase()
            : def.partSelection,
        };
        setQuoteSelections(nextSelections);
        if (d.offerCustomUsdByLine && typeof d.offerCustomUsdByLine === 'object') {
          const cleaned: Partial<Record<QuoteSubPage, number>> = {};
          for (const sub of SUB_PAGE_OPTIONS) {
            const rawSel = createOfferSelectionRawValue(sub, nextSelections);
            if (rawSel !== BAW_CUSTOM_SEND_OFFER_OPTION_ID) continue;
            const v = (d.offerCustomUsdByLine as Record<string, unknown>)[sub];
            const n = typeof v === 'number' ? v : parseInt(String(v), 10);
            if (Number.isFinite(n) && n >= 0) cleaned[sub] = Math.round(n);
          }
          setOfferCustomUsdByLine(cleaned);
        }
      } catch {
        /* ignore */
      }
    });
  }, [quoteMeeting]);

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

  const apptDates = useMemo(() => {
    const s = new Set<string>();
    for (const m of filteredAppointmentMeetings) s.add(m.date);
    return s;
  }, [filteredAppointmentMeetings]);

  const appointmentsForSelectedDay = useMemo(() => {
    if (!selectedDay) return filteredAppointmentMeetings;
    return filteredAppointmentMeetings.filter((m) => m.date === selectedDay);
  }, [filteredAppointmentMeetings, selectedDay]);

  const sortedAppointmentsList = useMemo(() => {
    const base =
      meetingSortOption === 'Archived'
        ? appointmentsForSelectedDay
        : appointmentsForSelectedDay.filter((m) => !meetingIsArchivedForAdminViewAll(m));
    return sortMeetingsByOption(base, meetingSortOption);
  }, [appointmentsForSelectedDay, meetingSortOption]);

  const sortedConsultsList = useMemo(() => {
    const base =
      meetingSortOption === 'Archived'
        ? filteredConsultMeetings
        : filteredConsultMeetings.filter((m) => !meetingIsArchivedForAdminViewAll(m));
    return sortMeetingsByOption(base, meetingSortOption);
  }, [filteredConsultMeetings, meetingSortOption]);

  /** Same rows as the Bookings / Consults tabs (search + sort + archive filter). */
  const newBookingsTabCount = sortedAppointmentsList.length;
  const newConsultsTabCount = sortedConsultsList.length;
  const totalBookedExcludingNew = useMemo(
    () => Math.max(0, appointmentMeetings.length - newBookingsTabCount),
    [appointmentMeetings.length, newBookingsTabCount]
  );
  const totalConsultsExcludingNew = useMemo(
    () => Math.max(0, consultMeetings.length - newConsultsTabCount),
    [consultMeetings.length, newConsultsTabCount]
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
    const clientName = String(quoteMeeting.client || '').trim();
    const nameParts = clientName.split(/\s+/).filter(Boolean);
    const clientFirstName = nameParts[0] || '';
    const clientLastName = nameParts.slice(1).join(' ') || clientFirstName || 'CLIENT';

    const breakdown = quoteBreakdownDisplayLines.map((line) => ({
      label: line.label,
      value:
        line.amountUsd === 0
          ? line.selection
          : `${line.selection} ${formatCreateOfferBreakdownAmount(line.amountUsd, true)}`,
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
      partSelection: quoteSelections.partSelection,
      addOns: quoteSelections.addOns,
    };
    const thumbSrc = quoteOfferThumbnailSrc;
    const orderRef = String(
      (quoteMeeting.metadata && typeof quoteMeeting.metadata.orderNumber === 'string'
        ? quoteMeeting.metadata.orderNumber
        : '') || ''
    ).trim();

    setQuoteSending(true);
    try {
      let quoteId = '';
      let discountCode = '';
      let expiresAt = '';
      let fromApi = false;

      try {
        const res = (await postAdminConsultQuote({
          clientEmail: email,
          clientFirstName,
          clientLastName,
          unitKey: quoteUnit,
          selections: selectionsForQuote,
          priceBreakdown: breakdown,
          adminMessage: quoteMessage,
          thumbnailSrc: thumbSrc,
          orderNumberFromCheckout: orderRef || undefined,
        })) as { quote?: Record<string, unknown>; discountCode?: string };
        const quoteRow = res?.quote && typeof res.quote === 'object' ? res.quote : {};
        quoteId = String((quoteRow as { id?: string }).id || '').trim();
        discountCode = String(res?.discountCode || (quoteRow as { discount_code?: string }).discount_code || '').trim();
        expiresAt = String((quoteRow as { expires_at?: string }).expires_at || '').trim();
        fromApi = Boolean(quoteId && discountCode);
      } catch {
        /* offline / no profile / network — still complete local order + client alert */
      }

      if (!fromApi) {
        quoteId = randomQuoteId();
        discountCode = randomConsultDiscountCode();
        expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
      }

      const snapshot: ConsultOfferPersistedSnapshot = {
        unitKey: quoteUnit,
        selections: selectionsForQuote,
        priceBreakdown: breakdown,
        adminMessage: quoteMessage,
        thumbnailSrc: thumbSrc,
        discountCode,
        expiresAt,
      };

      let matchedConsultOrderId = '';
      if (orderRef) {
        const markRes = markConsultOrderCompleteAfterQuoteSent({
          clientEmail: email,
          orderNumberFromCheckout: orderRef,
          consultQuoteId: quoteId,
          consultOfferSnapshot: snapshot,
        });
        matchedConsultOrderId = String(markRes.matchedOrderId || '').trim();
      }

      const alertOrderLabel =
        orderRef ||
        (typeof quoteMeeting.metadata?.orderNumber === 'string'
          ? String(quoteMeeting.metadata.orderNumber).trim()
          : '') ||
        `CONSULT OFFER`;
      appendConsultOfferCompleteAccountAlert(email, alertOrderLabel, quoteId, {
        matchedOrderId: matchedConsultOrderId || undefined,
      });

      upsertLocalMeeting({
        ...quoteMeeting,
        status: 'Completed',
        notes: (() => {
          const prev = String(quoteMeeting.notes || '').trim();
          if (prev.toUpperCase().includes('OFFER SENT')) return quoteMeeting.notes;
          return prev ? `${prev}\nOFFER SENT.` : 'OFFER SENT.';
        })(),
        metadata: {
          ...(quoteMeeting.metadata || {}),
          consultOfferSent: true,
          consultQuoteId: quoteId,
        },
      });
      try {
        window.dispatchEvent(new Event('adminMeetingsUpdated'));
      } catch {
        /* ignore */
      }
      refreshLocal();

      try {
        sessionStorage.removeItem(SESSION_QUOTE_MEETING_ID);
        sessionStorage.removeItem(sessionQuoteDraftKey(quoteMeeting.id));
      } catch {
        /* ignore */
      }

      setQuoteMeeting(null);
      setShowSendQuoteConfirm(false);
      setHubNotice(
        fromApi
          ? 'QUOTE SENT — CLIENT ALERT CREATED.'
          : orderRef
            ? 'OFFER SAVED LOCALLY — CLIENT ORDER COMPLETED + ALERT (CLOUD SEND FAILED OR UNAVAILABLE).'
            : 'OFFER SAVED LOCALLY — ADD ORDER # TO MEETING METADATA TO LINK CHECKOUT ORDER.'
      );
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
    const raw = viewAllMode === 'bookings' ? filteredAppointmentMeetings : filteredConsultMeetings;
    const base =
      meetingSortOption === 'Archived'
        ? raw.filter((m) => meetingIsArchivedForAdminViewAll(m))
        : raw.filter((m) => !meetingIsArchivedForAdminViewAll(m));
    return [...base].sort((a, b) => meetingSortTimeMs(b) - meetingSortTimeMs(a));
  }, [viewAllMode, filteredAppointmentMeetings, filteredConsultMeetings, meetingSortOption]);

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
          displayName: meetingClientNamePlain(row),
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
          displayName: meetingClientViewAllListHeadline(row),
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
        displayName: meetingClientViewAllListHeadline(latestMeeting),
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
    try {
      sessionStorage.removeItem(SESSION_QUOTE_MEETING_ID);
    } catch {
      /* ignore */
    }
    setActivePanelDropdown(null);
    setPanelDropdownRect(null);
    setOfferCustomUsdByLine({});
    setQuoteManualThumbnailSrc(null);
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
    portalMaxHeight,
  }: {
    dropdownKey: PanelDropdownKey;
    label: string;
    value: string;
    displayValue?: string;
    options: readonly string[];
    onChange: (next: string) => void;
    formatOptionLabel?: (option: string) => string;
    /** Fixed-position list `max-height` (viewport-safe) so options are not clipped by the card. */
    portalMaxHeight?: string;
  }) => {
    const maxH = portalMaxHeight ?? 'min(70vh, 520px)';
    const isOpen = activePanelDropdown === dropdownKey;
    const portalList =
      isOpen &&
      panelDropdownRect &&
      typeof document !== 'undefined' &&
      createPortal(
        <>
          <div
            className="fixed inset-0"
            style={{ zIndex: 5000 }}
            aria-hidden="true"
            onClick={() => {
              setActivePanelDropdown(null);
              setPanelDropdownRect(null);
            }}
          />
          <div
            className="py-1 bg-white border border-black shadow-lg overflow-y-auto"
            style={{
              position: 'fixed',
              left: panelDropdownRect.left,
              top: panelDropdownRect.bottom + 7,
              width: panelDropdownRect.width,
              maxHeight: maxH,
              borderWidth: '1.3px',
              borderRadius: 0,
              zIndex: 5010,
              boxSizing: 'border-box',
            }}
          >
            {options.filter((opt) => opt !== value).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setActivePanelDropdown(null);
                  setPanelDropdownRect(null);
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
        </>,
        document.body
      );
    return (
      <div className="mt-2">
        <label style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', display: 'block' }}>{label}</label>
        <div className="relative mt-1">
          <button
            ref={(el) => {
              if (activePanelDropdown === dropdownKey) {
                panelDropdownAnchorRef.current = el;
              } else if (panelDropdownAnchorRef.current === el) {
                panelDropdownAnchorRef.current = null;
              }
            }}
            type="button"
            onClick={() =>
              setActivePanelDropdown((open) => {
                const next = open === dropdownKey ? null : dropdownKey;
                if (next === null) setPanelDropdownRect(null);
                return next;
              })
            }
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
                transform: isOpen ? 'rotate(180deg)' : 'none',
                color: '#EB1C24',
                marginLeft: '8px',
              }}
            >
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {portalList}
        </div>
      </div>
    );
  };

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
                /** Send offer panel: +40px main card min-height vs default hub card. */
                minHeight: quoteMeeting ? 'calc(100dvh - 120px)' : 'calc(100dvh - 160px)',
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
                    {summaryStripMode === 'overview' ? (
                      <>
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
                            {formatUsd(overviewBookingSales.salesUsd)}
                          </p>
                          <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>
                            BOOKING SALES
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
                            {formatUsd(overviewConsultSales.salesUsd)}
                          </p>
                          <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>
                            CONSULT SALES
                          </p>
                        </div>
                      </>
                    ) : summaryStripMode === 'bookings' ? (
                      <>
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
                            {newBookingsTabCount}
                          </p>
                          <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>
                            NEW BOOKINGS
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
                            {totalBookedExcludingNew}
                          </p>
                          <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>
                            TOTAL BOOKINGS
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
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
                            {newConsultsTabCount}
                          </p>
                          <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>
                            NEW CONSULTS
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
                            {totalConsultsExcludingNew}
                          </p>
                          <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>
                            TOTAL CONSULTS
                          </p>
                        </div>
                      </>
                    )}
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
                    maxHeight: quoteMeeting ? 'calc(100dvh - 200px)' : 'calc(100dvh - 240px)',
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
                                    {(() => {
                                      const h = clientGroup.displayName;
                                      const parts = h.split(' · ');
                                      if (parts.length < 2) return <span style={{ color: '#000' }}>{h}</span>;
                                      const nameSt = parts.slice(0, -1).join(' · ');
                                      const tier = parts[parts.length - 1] || '';
                                      const tierPremiumLabel = tier === 'PREMIUM';
                                      return (
                                        <>
                                          <span style={{ color: '#000' }}>{nameSt}</span>
                                          <span style={{ color: tierPremiumLabel ? '#000' : '#808080' }}>
                                            {' · '}
                                            {tier}
                                          </span>
                                        </>
                                      );
                                    })()}
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
                      portalMaxHeight: 'min(70vh, 520px)',
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
                    <div
                      className="flex justify-center"
                      style={{
                        /** Custom: was 8px; −10px gap above REMOVE = −2px (margin collapse handled). */
                        marginBottom: quoteEffectiveCustomSrc ? '-2px' : '20px',
                      }}
                    >
                      <img
                        src={quoteOfferThumbnailSrc}
                        alt=""
                        width={153}
                        height={153}
                        style={{ objectFit: 'contain', display: 'block' }}
                      />
                    </div>
                    {quoteEffectiveCustomSrc ? (
                      <button
                        type="button"
                        className="w-full text-[10px] uppercase"
                        style={{
                          fontFamily: '"Futura PT Book"',
                          color: '#EB1C24',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          /** Was mb-2 (8px); +20px below REMOVE only. */
                          marginBottom: '28px',
                        }}
                        onClick={() => {
                          if (quoteManualThumbnailSrc) {
                            setQuoteManualThumbnailSrc(null);
                          } else if (quoteSavedThumbnailForSelection) {
                            setQuoteSavedThumbnailMap(deleteAdminConsultOfferSavedThumbnail(quoteSelectionKey));
                          }
                          try {
                            if (quoteOfferImageInputRef.current) quoteOfferImageInputRef.current.value = '';
                          } catch {
                            /* ignore */
                          }
                        }}
                      >
                        REMOVE CUSTOM IMAGE
                      </button>
                    ) : null}
                    <label
                      htmlFor="adminQuoteOfferImage"
                      style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', display: 'block', marginBottom: '5px' }}
                    >
                      CUSTOM IMAGE:
                    </label>
                    <div className="mb-3">
                      <OrderFormFilePicker
                        id="adminQuoteOfferImage"
                        name="adminQuoteOfferImage"
                        inputRef={quoteOfferImageInputRef}
                        accept="image/*"
                        previewSrc={quoteManualThumbnailSrc}
                        showSelectedTint={!!quoteManualThumbnailSrc}
                        hideInlinePreview
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            const r = String(reader.result || '');
                            if (r.startsWith('data:')) setQuoteManualThumbnailSrc(r);
                          };
                          reader.readAsDataURL(f);
                          e.target.value = '';
                        }}
                      />
                    </div>
                    {renderPanelSelectDropdown({
                      dropdownKey: 'quoteUnit',
                      label: 'UNIT:',
                      value: UNIT_OPTIONS.find((u) => u.id === quoteUnit)?.label ?? quoteUnit,
                      options: UNIT_OPTIONS.map((u) => u.label),
                      onChange: (next) => {
                        const picked = UNIT_OPTIONS.find((u) => u.label === next);
                        setQuoteUnit(picked?.id ?? next);
                      },
                      portalMaxHeight: 'min(70vh, 520px)',
                    })}
                    {renderPanelSelectDropdown({
                      dropdownKey: 'quoteSub',
                      label: 'CATEGORY:',
                      value: quoteSub,
                      options: SUB_PAGE_OPTIONS,
                      onChange: (next) => setQuoteSub(next as QuoteSubPage),
                      portalMaxHeight: 'min(70vh, 520px)',
                    })}
                    {renderPanelSelectDropdown({
                      dropdownKey: 'quoteSubSelection',
                      label: 'SELECTION:',
                      value: currentQuoteSubSelectionDisplayValue,
                      options: currentQuoteSubSelectionOptions.map((option) =>
                        quoteSub === 'HAIRLINE' ? hairlineDisplayValue(option) : option
                      ),
                      onChange: (nextDisplay) => {
                        const rawValue = quoteSub === 'HAIRLINE' && nextDisplay === 'LAGOS + PEAK' ? 'LAGOS, PEAK' : nextDisplay;
                        setQuoteSelections((previous) => updateCreateOfferSelectionsForSubPage(previous, quoteSub, rawValue));
                        if (rawValue !== BAW_CUSTOM_SEND_OFFER_OPTION_ID) {
                          setOfferCustomUsdByLine((prev) => {
                            if (prev[quoteSub] === undefined) return prev;
                            const next = { ...prev };
                            delete next[quoteSub];
                            return next;
                          });
                        }
                      },
                      portalMaxHeight: 'min(70vh, 520px)',
                    })}
                    {createOfferSelectionRawValue(quoteSub, quoteSelections) === BAW_CUSTOM_SEND_OFFER_OPTION_ID ? (
                      <label className="block mt-2" style={{ fontFamily: '"Futura PT Book"', fontSize: '9px' }}>
                        CUSTOM PRICE (USD)
                        <input
                          type="number"
                          min={0}
                          step={1}
                          inputMode="numeric"
                          className="w-full mt-1 p-2 border text-[10px]"
                          value={Math.max(0, Math.round(offerCustomUsdByLine[quoteSub] ?? 0))}
                          onChange={(e) => {
                            const v = parseInt(e.target.value, 10);
                            const usd = Number.isFinite(v) && v >= 0 ? v : 0;
                            setOfferCustomUsdByLine((prev) => ({ ...prev, [quoteSub]: usd }));
                          }}
                        />
                      </label>
                    ) : null}
                    {quoteSub === 'STYLING' ? (
                      renderPanelSelectDropdown({
                        dropdownKey: 'quotePartSelection',
                        label: 'PARTING:',
                        value: quoteSelections.partSelection,
                        options: [...QUOTE_PART_SELECTION_OPTIONS],
                        onChange: (next) =>
                          setQuoteSelections((previous) => ({
                            ...previous,
                            partSelection: next,
                          })),
                        portalMaxHeight: 'min(70vh, 520px)',
                      })
                    ) : null}
                    <div style={{ marginTop: '24px', marginBottom: '12px' }}>
                      <label className="block mt-2" style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', marginTop: 0 }}>
                        MESSAGE:
                        <textarea
                          className="w-full mt-1 p-2 border text-[10px]"
                          rows={3}
                          value={quoteMessage}
                          onChange={(e) => setQuoteMessage(e.target.value)}
                        />
                      </label>
                    </div>
                    <div style={{ marginTop: '16px' }}>
                      <label style={{ fontFamily: '"Futura PT Book"', fontSize: '9px', display: 'block' }}>
                        PRICE BREAKDOWN:
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
                          {quoteBreakdownDisplayLines.map((line: SpecialOfferBreakdownLine, lineIdx: number) => {
                            const selection = line.selection;
                            const displayLabel = line.label === 'BASE UNIT' ? 'UNIT' : line.label;
                            const amountText =
                              line.amountUsd === 0 ? '' : formatCreateOfferBreakdownAmount(line.amountUsd, true);
                            return (
                              <div
                                key={`${line.label}-${selection}-${lineIdx}`}
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
                                  <span>{displayLabel}: </span>
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
                  <>
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
                    <button
                      type="button"
                      onClick={() => {
                        if (quoteGenerateUnitState === 'loading') return;
                        if (quoteGeneratedSelectionKey === quoteSelectionKey && quoteManualThumbnailSrc) {
                          setShowRegenerateQuoteUnitConfirm(true);
                          return;
                        }
                        void handleGenerateQuoteUnitImage();
                      }}
                      disabled={quoteGenerateUnitState === 'loading'}
                      className={`border border-black font-futura w-full text-center py-2 text-[11px] font-semibold ${
                        quoteGenerateUnitState === 'loading'
                          ? 'bg-white cursor-not-allowed'
                          : 'bg-white cursor-pointer hover:bg-gray-50'
                      }`}
                      style={{
                        borderWidth: '1.3px',
                        color: '#EB1C24',
                        fontFamily: '"Futura PT Medium"',
                        backgroundColor: '#FFFFFF',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {quoteGenerateUnitState === 'loading'
                        ? 'GENERATING UNIT...'
                        : quoteGeneratedSelectionKey === quoteSelectionKey && quoteManualThumbnailSrc
                          ? 'REGENERATE UNIT'
                          : 'GENERATE UNIT'}
                    </button>
                    {quoteGenerateUnitError ? (
                      <p
                        style={{
                          margin: 0,
                          textAlign: 'center',
                          color: '#EB1C24',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '9px',
                          lineHeight: 1.35,
                          textTransform: 'uppercase',
                        }}
                      >
                        {quoteGenerateUnitError}
                      </p>
                    ) : null}
                    {quoteManualThumbnailSrc?.startsWith('data:') ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (quoteSaveSelectionState !== 'idle') return;
                          setQuoteSaveSelectionState('saving');
                          if (quoteSaveSelectionResetTimeoutRef.current) {
                            clearTimeout(quoteSaveSelectionResetTimeoutRef.current);
                            quoteSaveSelectionResetTimeoutRef.current = null;
                          }
                          /** Brief delay so **SAVING…** can paint (sync localStorage write; mirrors async add-to-bag feel). */
                          quoteSaveSelectionResetTimeoutRef.current = setTimeout(() => {
                            const next = upsertAdminConsultOfferSavedThumbnail(
                              quoteSelectionKey,
                              quoteManualThumbnailSrc
                            );
                            setQuoteSavedThumbnailMap(next);
                            setQuoteSaveSelectionState('saved');
                            quoteSaveSelectionResetTimeoutRef.current = setTimeout(() => {
                              quoteSaveSelectionResetTimeoutRef.current = null;
                              setQuoteSaveSelectionState('idle');
                            }, 2000);
                          }, 80);
                        }}
                        disabled={quoteSending || quoteSaveSelectionState === 'saving'}
                        className={`border border-black font-futura w-full text-center py-2 text-[11px] font-semibold ${
                          quoteSaveSelectionState === 'saving'
                            ? 'bg-white cursor-not-allowed'
                            : quoteSaveSelectionState === 'saved'
                              ? 'bg-white cursor-pointer'
                              : 'bg-white cursor-pointer hover:bg-gray-50'
                        }`}
                        style={{
                          borderWidth: '1.3px',
                          color: '#EB1C24',
                          fontFamily: '"Futura PT Medium"',
                          backgroundColor: '#FFFFFF',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {quoteSaveSelectionState === 'idle' && 'SAVE SELECTION'}
                        {quoteSaveSelectionState === 'saving' && 'SAVING…'}
                        {quoteSaveSelectionState === 'saved' && (
                          <span className="flex items-center justify-center gap-1">
                            <img src="/assets/check.svg" alt="" width={9} height={9} />
                            <span style={{ color: '#808080' }}>SELECTION SAVED</span>
                          </span>
                        )}
                      </button>
                    ) : null}
                  </>
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

      <ConfirmationModal
        isOpen={showRegenerateQuoteUnitConfirm}
        onClose={() => setShowRegenerateQuoteUnitConfirm(false)}
        onConfirm={() => void handleGenerateQuoteUnitImage()}
        title="REGENERATE UNIT?"
        message="THIS WILL GENERATE A NEW UNIT IMAGE FOR THE CURRENT SELECTIONS."
        confirmText="CONFIRM"
        cancelText="CANCEL"
        dataAttribute="regenerate-consult-quote-unit-confirm"
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
