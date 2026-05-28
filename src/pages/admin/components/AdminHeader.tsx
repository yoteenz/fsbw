
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdminFounderAccount } from '../../../utils/adminAuth';
import { ADMIN_HEADER_NOTIFICATIONS } from '../../../utils/adminHeaderNotificationsData';
import { loadConciergePriorityMessages, markAdminHubMessageRead } from '../../../utils/adminMessagesHub';
import { markAdminHubNotificationRead } from '../../../utils/adminNotificationsHub';
import { ADMIN_MAIN_CARD_TOP_OFFSET_PX } from '../../../utils/adminLayoutConstants';

/** Debug: long-press (500ms) on messages/notifications icons toggles active/inactive for testing "no new" state */
const LONG_PRESS_MS = 500;

type HeaderPriorityMessage = {
  id: number | string;
  clientName: string;
  tier: string;
  message: string;
  timestamp: string;
  unread: boolean;
  priority: string;
  avatar: string;
  photo?: string;
};

function buildHeaderPriorityMessages(): HeaderPriorityMessage[] {
  const concierge = loadConciergePriorityMessages().map((m, index) => {
    const initials = (m.userName || 'C')
      .split(/\s+/)
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    return {
      id: m.id || `concierge-${index}`,
      clientName: (m.userName || 'CLIENT').toUpperCase(),
      tier: 'PRIORITY',
      message: m.message,
      timestamp: new Date(m.timestamp).toLocaleString(),
      unread: m.status === 'new',
      priority: 'urgent',
      avatar: initials || 'PM',
    };
  });
  if (concierge.length > 0) return concierge;
  return [
    {
      id: 1,
      clientName: 'SARAH JOHNSON',
      tier: 'BLACK TIER',
      message:
        'URGENT - Need to reschedule my installation appointment for this Saturday. Family emergency came up.',
      timestamp: '3 MIN AGO',
      unread: true,
      priority: 'urgent',
      avatar: 'SJ',
      photo: 'https://static.readdy.ai/image/315e13a2042f092242ff6698f0b32192/ce4ab885708daff01cd1b4c775509dc2.png',
    },
  ];
}

// System notifications - kept for future use
// const systemNotifications = [
//   { id: 27, text: "SYSTEM MAINTENANCE - SECURITY UPDATE REQUIRED", urgent: false },
//   { id: 28, text: "SERVER ERROR - DATABASE CONNECTION LOST", urgent: false },
//   { id: 29, text: "SECURITY ALERT - UNUSUAL LOGIN ACTIVITY", urgent: false },
//   { id: 30, text: "SYSTEM UPDATE - NEW FEATURES AVAILABLE", urgent: false },
//   { id: 31, text: "BACKUP REMINDER - WEEKLY DATA BACKUP DUE", urgent: false }
// ];

interface AdminHeaderProps {
  /** Text displayed after the breadcrumb label (e.g. "ADMIN" or "CLIENTS") */
  title: string;
  /** Show a back‑arrow button on the left side; when clicked, goes to previous page in history */
  showBack?: boolean;
  /** Optional custom back handler; when set, used instead of navigate(-1) */
  onBack?: () => void;
  /** Optional breadcrumb parent label (e.g. "CLIENTS"); when set, replaces "ADMIN" */
  breadcrumbParentLabel?: string;
  /** Optional breadcrumb parent path (e.g. "/admin/clients"); when set, breadcrumb link goes here instead of dashboard */
  breadcrumbParentPath?: string;
  /** Optional custom breadcrumb click handler; when set, used instead of navigate(breadcrumbParentPath) */
  breadcrumbParentOnClick?: () => void;
  /** When provided, the nav bar search input is controlled by the parent (e.g. client search on clients page) */
  externalSearchValue?: string;
  /** Called when the nav bar search input changes; when set with externalSearchValue, search filters are driven by parent */
  onExternalSearchChange?: (value: string) => void;
  /** Placeholder for the nav bar search input when using external search */
  externalSearchPlaceholder?: string;
  /** When true, hide the search icon (e.g. on client details view) */
  hideSearchIcon?: boolean;
  /** When true, show account icon to the right of search (e.g. on dashboard only) */
  showAccountIcon?: boolean;
  /** Optional query key used by admin pages to consume global header search (defaults to `q`) */
  globalSearchQueryKey?: string;
  /** Optional route for submit search navigation (defaults to current page) */
  globalSearchTargetPath?: string;
  /** Optional query params to preserve when submitting/clearing global search (e.g. active tab) */
  globalSearchPreserveKeys?: string[];
}

/**
 * AdminHeader – a small, reusable header bar used in the admin panel.
 * All JSX tags are properly closed, and a safe default handler for `onBack`
 * is provided to avoid runtime crashes when the prop is omitted or throws.
 */
export default function AdminHeader({
  title,
  showBack = false,
  onBack,
  breadcrumbParentLabel,
  breadcrumbParentPath,
  breadcrumbParentOnClick,
  externalSearchValue,
  onExternalSearchChange,
  externalSearchPlaceholder,
  hideSearchIcon = false,
  showAccountIcon = false,
  globalSearchQueryKey = 'q',
  globalSearchTargetPath,
  globalSearchPreserveKeys,
}: AdminHeaderProps) {
  const navigate = useNavigate();

  const priorityMessages = useMemo(() => buildHeaderPriorityMessages(), []);

  const headerNotifications = useMemo(() => {
    const base = [...ADMIN_HEADER_NOTIFICATIONS];
    let email: string | null = null;
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
      const u = raw ? JSON.parse(raw) : null;
      email = (u?.email || '').trim().toLowerCase() || null;
    } catch {
      /* ignore */
    }
    if (isAdminFounderAccount({ email: email ?? undefined })) {
      const afterAffiliate = base.findIndex((n) => n.id === 61);
      const row = {
        id: 62,
        text: 'ACCOUNT ALERT - CONSULT QUOTE (VIEW QUOTE)',
        urgent: false,
        unread: true,
        timestamp: 'JUST NOW',
        category: 'ALERTS',
      };
      if (afterAffiliate >= 0) base.splice(afterAffiliate + 1, 0, row);
      else base.unshift(row);
    }
    return base;
  }, []);

  const [isBackPressed, setIsBackPressed] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window === 'undefined') return '';
    try {
      const sp = new URLSearchParams(window.location.search);
      return (sp.get(globalSearchQueryKey) || '').trim();
    } catch {
      return '';
    }
  });
  const [_isMessagesPressed, _setIsMessagesPressed] = useState(false);
  const [_isNotificationsPressed, _setIsNotificationsPressed] = useState(false);
  const [_hasNotifications, _setHasNotifications] = useState(true);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showMessagesDropdown, setShowMessagesDropdown] = useState(false);
  const [readNotifications, setReadNotifications] = useState<number[]>([]);
  const [readMessages, setReadMessages] = useState<Array<number | string>>([]);

  // Long press detection (debug: toggle active/inactive for testing)
  const [showInactiveNotifications, setShowInactiveNotifications] = useState(false);
  const [showInactiveMessages, setShowInactiveMessages] = useState(false);
  const [isBreadcrumbHovered, setIsBreadcrumbHovered] = useState(false);
  const messagesLongPressJustOccurred = useRef(false);
  const notificationsLongPressJustOccurred = useRef(false);
  const messagesLongPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notificationsLongPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Add scroll event listener to close dropdowns
  useEffect(() => {
    const handleScroll = () => {
      // Only close on significant scroll, not small movements
      if (showNotificationsDropdown || showMessagesDropdown) {
        setShowNotificationsDropdown(false);
        setShowMessagesDropdown(false);
      }
    };

    // Only add scroll listeners if dropdowns are open, with debouncing
    if (showNotificationsDropdown || showMessagesDropdown) {
      const debouncedHandleScroll = debounce(handleScroll, 100);
      window.addEventListener('scroll', debouncedHandleScroll, { passive: true });
      document.addEventListener('scroll', debouncedHandleScroll, { passive: true });

      return () => {
        window.removeEventListener('scroll', debouncedHandleScroll);
        document.removeEventListener('scroll', debouncedHandleScroll);
      };
    }
  }, [showNotificationsDropdown, showMessagesDropdown]);

  // Keep search expanded when external search has a value so the filter stays visible (including when returning from client details so user can clear search without clicking search again)
  useEffect(() => {
    if (onExternalSearchChange != null && (externalSearchValue ?? '').trim() !== '') {
      setIsSearchActive(true);
    }
  }, [onExternalSearchChange, externalSearchValue, hideSearchIcon]);

  // When hideSearchIcon is true (e.g. client details), always show nav text + back button, not search
  useEffect(() => {
    if (hideSearchIcon) setIsSearchActive(false);
  }, [hideSearchIcon]);

  // Debounce function
  const debounce = (func: Function, wait: number) => {
    let timeout: ReturnType<typeof setTimeout>;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  /** Go to the previous page in history (used when back icon is shown) */
  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  // Handle search activation
  const handleSearchClick = () => {
    if (isSearchActive) {
      searchInputRef.current?.focus();
      return;
    }
    setIsSearchActive(true);
  };

  // Handle search input blur
  const handleSearchBlur = () => {
    const value = onExternalSearchChange != null ? (externalSearchValue ?? '') : searchQuery;
    if (value.trim() === '') {
      setIsSearchActive(false);
    }
  };

  // Handle search input key press
  const submitSearch = () => {
    const raw = onExternalSearchChange != null ? (externalSearchValue ?? '') : searchQuery;
    const value = raw.trim();
    const targetPath = globalSearchTargetPath || (typeof window !== 'undefined' ? window.location.pathname : '/admin/dashboard');
    const currentSearch = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const next = new URLSearchParams();
    (globalSearchPreserveKeys || []).forEach((key) => {
      const preserved = currentSearch.get(key);
      if (preserved != null && preserved !== '') next.set(key, preserved);
    });
    if (!value) {
      const qs = next.toString();
      navigate(qs ? `${targetPath}?${qs}` : targetPath);
      return;
    }
    next.set(globalSearchQueryKey, value);
    navigate(`${targetPath}?${next.toString()}`);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      submitSearch();
      return;
    }
    if (e.key === 'Escape') {
      if (onExternalSearchChange) {
        onExternalSearchChange('');
      } else {
        setSearchQuery('');
      }
      setIsSearchActive(false);
      return;
    }
    if (e.key === 'Backspace') {
      const raw = onExternalSearchChange != null ? (externalSearchValue ?? '') : searchQuery;
      if (String(raw).length === 0) {
        e.preventDefault();
        if (onExternalSearchChange) onExternalSearchChange('');
        else setSearchQuery('');
        setIsSearchActive(false);
      }
    }
  };

  const searchInputValue = onExternalSearchChange != null ? (externalSearchValue ?? '') : searchQuery;
  const searchInputOnChange = onExternalSearchChange != null
    ? (e: React.ChangeEvent<HTMLInputElement>) => onExternalSearchChange(e.target.value)
    : (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value);
  const inferredDefaultPlaceholder =
    title === 'OVERVIEW' || title === 'DETAILS'
      ? 'SEARCH CLIENTS...'
      : title === 'REVENUE'
      ? 'SEARCH PRODUCTS...'
      : 'SEARCH ADMIN...';
  const searchPlaceholder = externalSearchPlaceholder ?? inferredDefaultPlaceholder;

  // Handle messages: long-press toggles active/inactive (debug: test "no new messages" state)
  const handleMessagesPointerDown = () => {
    const timer = setTimeout(() => {
      setShowInactiveMessages((prev) => {
        const next = !prev;
        console.log('[AdminHeader] Long-press: messages icon →', next ? 'INACTIVE (no new)' : 'ACTIVE');
        return next;
      });
      setShowMessagesDropdown(false);
      messagesLongPressJustOccurred.current = true;
    }, LONG_PRESS_MS);
    messagesLongPressTimerRef.current = timer;
  };

  const handleMessagesPointerUp = () => {
    if (messagesLongPressTimerRef.current) {
      clearTimeout(messagesLongPressTimerRef.current);
      messagesLongPressTimerRef.current = null;
    }
  };

  const handleMessagesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (messagesLongPressJustOccurred.current) {
      messagesLongPressJustOccurred.current = false;
      return;
    }
    setShowMessagesDropdown(!showMessagesDropdown);
    setShowNotificationsDropdown(false);
  };

  // Handle notifications: long-press toggles active/inactive (debug: test "no new notifications" state)
  const handleNotificationsPointerDown = () => {
    const timer = setTimeout(() => {
      setShowInactiveNotifications((prev) => {
        const next = !prev;
        console.log('[AdminHeader] Long-press: notifications icon →', next ? 'INACTIVE (no new)' : 'ACTIVE');
        return next;
      });
      setShowNotificationsDropdown(false);
      notificationsLongPressJustOccurred.current = true;
    }, LONG_PRESS_MS);
    notificationsLongPressTimerRef.current = timer;
  };

  const handleNotificationsPointerUp = () => {
    if (notificationsLongPressTimerRef.current) {
      clearTimeout(notificationsLongPressTimerRef.current);
      notificationsLongPressTimerRef.current = null;
    }
  };

  const handleNotificationsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (notificationsLongPressJustOccurred.current) {
      notificationsLongPressJustOccurred.current = false;
      return;
    }
    setShowNotificationsDropdown(!showNotificationsDropdown);
    setShowMessagesDropdown(false);
  };

  // Mark notification as read
  const markAsRead = (notificationId: number) => {
    setReadNotifications((prev) => [...prev, notificationId]);
    markAdminHubNotificationRead(`notif-${notificationId}`);
  };

  // Mark message as read
  const markMessageAsRead = (messageId: number | string) => {
    setReadMessages((prev) => [...prev, messageId]);
    markAdminHubMessageRead(`inbox-${messageId}`);
  };

  // Get unread notifications count - always show count regardless of inactive state
  const unreadCount = headerNotifications.filter(
    (n) => n.unread && !readNotifications.includes(n.id)
  ).length;

  // Get unread messages count - always show count regardless of inactive state
  const unreadMessagesCount = priorityMessages.filter(
    m => m.unread && !readMessages.includes(m.id)
  ).length;

  // Get urgency color for notification items
  const getUrgencyColor = (urgent: boolean, unread: boolean) => {
    if (urgent) return '#EB1C24';
    return unread ? '#FF8C00' : '#808080';
  };

  // Get priority color
  const getPriorityColor = (priority: string, unread: boolean) => {
    if (!unread) return '#808080';
    switch (priority) {
      case 'urgent':
        return '#EB1C24';
      case 'high':
        return '#FF8C00';
      case 'medium':
        return '#4CAF50';
      case 'low':
      default:
        return '#808080';
    }
  };

  // Get tier color
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BLACK TIER':
        return '#000000';
      default:
        return '#808080';
    }
  };

  // Format text with red after hyphen and red parentheses
  const formatTextWithRedAfterHyphen = (text: string) => {
    if (text.includes('ORDER #17 NEEDS ORDER FORM (24 HOURS)')) {
      return (
        <>
          <span className="font-covered-by-your-grace">ORDER #17 NEEDS ORDER FORM </span>
          <span className="font-covered-by-your-grace" style={{ color: '#EB1C24' }}>
            (24 HOURS)
          </span>
        </>
      );
    }

    const parts = text.split(' - ');
    if (parts.length === 2) {
      return (
        <>
          <span className="font-covered-by-your-grace">{parts[0]} - </span>
          <span className="font-covered-by-your-grace" style={{ color: '#EB1C24' }}>
            {parts[1]}
          </span>
        </>
      );
    }
    return <span className="font-covered-by-your-grace">{text}</span>;
  };

  // Fallback image handler for any broken image URLs
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement>
  ) => {
    e.currentTarget.src =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBzdHlsZT0idHJhbnNsYXRlOiA1MCV8IDUwJTsgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTUwJSwgLTUwJSkiPgo8cGF0aCBkPSJNOCAxLjVDNCAxLjUgMS41IDQgMS41IDhDMS41IDEyIDQgMTQuNSA4IDE0LjVDMTIgMTQuNSAxNC41IDEyIDE0LjUgOEMxNC41IDQgMTIgMS41IDggMS41WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4KPC9zdmc+';
  };

  // Filter notifications and messages based on active/inactive state
  const displayedNotifications = showInactiveNotifications
    ? headerNotifications.filter(
        n => !n.unread || readNotifications.includes(n.id)
      )
    : headerNotifications.filter(
        n => n.unread && !readNotifications.includes(n.id)
      );

  const displayedMessages = showInactiveMessages
    ? priorityMessages.filter(
        m => !m.unread || readMessages.includes(m.id)
      )
    : priorityMessages.filter(
        m => m.unread && !readMessages.includes(m.id)
      );

  return (
    <header className="px-4 py-4 relative" style={{ textTransform: 'uppercase' }}>
      <div className="max-w-md mx-auto">
        <div
          className="bg-white/60 backdrop-blur-sm border border-black px-4 py-2 flex items-center justify-center h-10 relative"
          style={{ borderWidth: '1.3px' }}
        >
          {/* Left: back + search + account — always visible (search active only swaps center title for input) */}
          <div className="flex items-center gap-5 absolute left-4 h-full z-10">
            {showBack ? (
              <button
                type="button"
                onClick={handleBack}
                onMouseDown={() => setIsBackPressed(true)}
                onMouseUp={() => setIsBackPressed(false)}
                onMouseLeave={() => setIsBackPressed(false)}
                onTouchStart={() => setIsBackPressed(true)}
                onTouchEnd={() => setIsBackPressed(false)}
                className="cursor-pointer transition-opacity duration-150"
                style={{
                  height: '15px',
                  width: '21px',
                  padding: 0,
                  border: 'none',
                  background: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                aria-label="Back"
              >
                <img
                  src="/assets/back-button.svg"
                  alt="Back"
                  width="21"
                  height="15"
                  style={{ opacity: isBackPressed ? 0.7 : 1 }}
                />
              </button>
            ) : null}
            {!hideSearchIcon ? (
              <button
                type="button"
                className="cursor-pointer"
                onClick={handleSearchClick}
                style={{ transform: showBack ? 'translateX(-2px)' : 'translateX(2px)' }}
                aria-label="Open search"
              >
                <img
                  src="/assets/search-icon.svg"
                  alt=""
                  width="16"
                  height="15"
                />
              </button>
            ) : null}
            {showAccountIcon ? (
              <button
                type="button"
                className="cursor-pointer flex items-center justify-center"
                onClick={() => navigate('/account')}
                aria-label="Account profile"
                style={{ width: '20px', height: '20px', padding: 0, border: 'none', background: 'none', marginLeft: '2px', transform: 'translateX(-2px)' }}
              >
                <img
                  src="/assets/NOIR/account-icon.svg"
                  alt="Account"
                  width="15"
                  height="15"
                />
              </button>
            ) : null}
          </div>

          {/* Center: breadcrumb title OR centered search (replaces title only; icons unchanged) */}
          <div
            className="flex-1 text-center flex items-center justify-center h-full min-w-0 whitespace-nowrap"
            style={{ paddingLeft: '64px', paddingRight: '64px' }}
          >
            {isSearchActive && !hideSearchIcon ? (
              <input
                ref={searchInputRef}
                type="text"
                value={searchInputValue}
                onChange={searchInputOnChange}
                onBlur={handleSearchBlur}
                onKeyDown={handleSearchKeyDown}
                placeholder={searchPlaceholder}
                className="w-full max-w-full min-w-0 bg-transparent border-none outline-none text-xs uppercase placeholder:text-[#EB1C24]"
                style={{
                  fontFamily: "'Futura PT Medium'",
                  fontWeight: 500,
                  color: '#EB1C24',
                  fontSize: '12px',
                  textAlign: 'center',
                }}
                autoFocus
              />
            ) : (
              <div
                className="flex w-full min-w-0 max-w-full flex-nowrap items-center justify-center gap-1 overflow-hidden"
                style={{ whiteSpace: 'nowrap' }}
              >
                <button
                  type="button"
                  onClick={() => (breadcrumbParentOnClick ?? (() => navigate(breadcrumbParentPath ?? '/admin/dashboard')))()}
                  onMouseEnter={() => setIsBreadcrumbHovered(true)}
                  onMouseLeave={() => setIsBreadcrumbHovered(false)}
                  onTouchEnd={() => setIsBreadcrumbHovered(false)}
                  className="shrink-0 text-sm uppercase transition-colors cursor-pointer inline-flex items-center gap-1"
                  style={{
                    fontFamily: "'Futura PT Book'",
                    fontWeight: 500,
                    fontSize: '14px',
                    color: isBreadcrumbHovered ? '#EB1C24' : '#000000',
                    whiteSpace: 'nowrap',
                    padding: 0,
                    border: 'none',
                    background: 'none',
                  }}
                >
                  <span>{breadcrumbParentLabel ?? 'ADMIN'}</span>
                  <span aria-hidden="true">&gt;</span>
                </button>
                <span
                  className="min-w-0 shrink truncate text-sm uppercase"
                  style={{
                    fontFamily: "'Futura PT Medium'",
                    fontWeight: 500,
                    color: '#EB1C24',
                    fontSize: '14px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {title}
                </span>
              </div>
            )}
          </div>

          {/* Right side - Messages and Notifications icons with proper vertical centering */}
          <div className="w-16 flex justify-end items-center space-x-0.5 h-full absolute right-4">
            {/* Messages - Using proper Remix Icon with vertical centering */}
            <div className="relative h-full flex items-center">
              <button
                type="button"
                className="w-6 h-6 flex items-center justify-center transition-colors duration-150"
                onPointerDown={handleMessagesPointerDown}
                onPointerUp={handleMessagesPointerUp}
                onPointerLeave={handleMessagesPointerUp}
                onClick={handleMessagesClick}
              >
                <img
                  src={showInactiveMessages ? '/assets/messages-inactive.svg' : '/assets/messages-active.svg'}
                  alt="Messages"
                  width="16"
                  height="16"
                  style={{ transform: 'translate(-10px, -1px)' }}
                />
              </button>
            </div>

            {/* Notifications - Using proper Remix Icon with vertical centering */}
            <div className="relative h-full flex items-center">
              <button
                type="button"
                className="w-6 h-6 flex items-center justify-center transition-colors duration-150"
                onPointerDown={handleNotificationsPointerDown}
                onPointerUp={handleNotificationsPointerUp}
                onPointerLeave={handleNotificationsPointerUp}
                onClick={handleNotificationsClick}
              >
                <img
                  src={showInactiveNotifications ? '/assets/notifications-inactive.svg' : '/assets/notifications-active.svg'}
                  alt="Notifications"
                  width="15"
                  height="15"
                  style={{ transform: 'translateY(-0.8px)' }}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop to close dropdowns */}
      {(showNotificationsDropdown || showMessagesDropdown) && (
        <div
          className="fixed inset-0 z-[99998]"
          style={{ pointerEvents: 'auto' }}
          onMouseDown={(e) => {
            // Prevent closing when clicking inside dropdown content
            const target = e.target as HTMLElement;
            if (target.closest('[data-dropdown-content]')) {
              return;
            }
            setShowNotificationsDropdown(false);
            setShowMessagesDropdown(false);
          }}
        />
      )}

      {/* Messages Dropdown */}
      {showMessagesDropdown && (
        <div
          className="fixed inset-x-0 top-0 px-4 z-[99999] pointer-events-none"
          style={{ paddingTop: ADMIN_MAIN_CARD_TOP_OFFSET_PX }}
        >
          <div className="max-w-md mx-auto pointer-events-auto">
            <div
              data-dropdown-content
              className="bg-white/60 backdrop-blur-md border border-black shadow-lg hover:shadow-xl transition-all duration-300 ease-out flex flex-col overflow-hidden"
              style={{ borderWidth: '1.3px', maxHeight: 'min(365px, 85vh)' }}
              onMouseDown={(e) => {
                // Prevent backdrop from closing dropdown when clicking inside
                e.stopPropagation();
              }}
            >
              <div className="px-3 py-2 border-b flex items-center justify-between flex-shrink-0">
                <h3 className="font-futura font-bold text-black uppercase" style={{ fontSize: '10px' }}>
                  {showInactiveMessages ? 'INACTIVE MESSAGES' : 'PRIORITY MESSAGES'}
                </h3>
                <span
                  className="font-futura"
                  style={{ color: '#EB1C24', fontSize: '10px' }}
                >
                  {showInactiveMessages
                    ? `${displayedMessages.length} read`
                    : `${unreadMessagesCount} NEW`}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0" style={{ padding: '8px', boxSizing: 'border-box' }}>
                {displayedMessages.slice(0, 8).map(message => {
                  const isRead = readMessages.includes(message.id);
                  const isUnread = message.unread && !isRead;
                  const borderColor = getPriorityColor(message.priority, isUnread);
                  const tierColor = getTierColor(message.tier);

                  return (
                    <div
                      key={message.id}
                      className={`px-3 py-3 border-b border-gray-100 cursor-pointer hover:bg-white/20 ${isUnread ? 'bg-white/10' : ''}`}
                      onClick={() => markMessageAsRead(message.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-bold">
                            {message.photo ? (
                              <img
                                src={message.photo}
                                alt={message.clientName}
                                className="w-full h-full object-cover"
                                onError={handleImageError}
                              />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center"
                                style={{ backgroundColor: tierColor, fontSize: '8px' }}
                              >
                                {message.avatar}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-covered-by-your-grace font-bold uppercase" style={{ fontSize: '11px', color: '#EB1C24' }}>
                              {message.clientName}
                            </div>
                            <div
                              className="text-xs font-bold uppercase"
                              style={{ color: tierColor, fontSize: '8px', fontFamily: '"Futura PT Medium"' }}
                            >
                              {message.tier}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-futura uppercase" style={{ color: '#808080', fontSize: '8px' }}>
                            {message.timestamp}
                          </span>
                          {isUnread && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#EB1C24' }} />}
                        </div>
                      </div>

                      <div className="border-l-2 pl-3" style={{ borderColor }}>
                        <p className="text-xs font-covered-by-your-grace leading-relaxed uppercase" style={{ fontSize: '10px', color: '#000000' }}>
                          {message.message}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {displayedMessages.length === 0 && (
                  <div className="px-3 py-6 text-center">
                    <p className="text-xs font-futura text-gray-500">
                      {showInactiveMessages ? 'NO READ MESSAGES' : 'NO NEW MESSAGES'}
                    </p>
                  </div>
                )}
              </div>

              <div className="px-3 py-2 border-t border-gray-200 flex-shrink-0">
                <button
                  className="w-full text-center text-xs font-futura font-bold uppercase hover:opacity-80"
                  style={{ color: '#EB1C24' }}
                  onClick={() => {
                    setShowMessagesDropdown(false);
                    navigate('/admin/messages');
                  }}
                >
                  <span style={{ fontSize: '10px' }}>VIEW ALL MESSAGES</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Dropdown */}
      {showNotificationsDropdown && (
        <div
          className="fixed inset-x-0 top-0 px-4 z-[99999] pointer-events-none"
          style={{ paddingTop: ADMIN_MAIN_CARD_TOP_OFFSET_PX }}
        >
          <div className="max-w-md mx-auto pointer-events-auto">
            <div
              data-dropdown-content
              className="bg-white/60 backdrop-blur-md border border-black shadow-lg hover:shadow-xl transition-all duration-300 ease-out flex flex-col overflow-hidden"
              style={{ borderWidth: '1.3px', maxHeight: 'min(415px, 85vh)' }}
              onMouseDown={(e) => {
                // Prevent backdrop from closing dropdown when clicking inside
                e.stopPropagation();
              }}
            >
              <div className="px-3 py-2 border-b flex items-center justify-between flex-shrink-0">
                <h3 className="font-futura font-bold text-black uppercase" style={{ fontSize: '10px' }}>
                  {showInactiveNotifications ? 'INACTIVE NOTIFICATIONS' : 'NOTIFICATIONS'}
                </h3>
                <span className="font-futura" style={{ color: '#EB1C24', fontSize: '10px' }}>
                  {showInactiveNotifications
                    ? `${displayedNotifications.length} read`
                    : `${unreadCount} NEW`}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0" style={{ padding: '8px', boxSizing: 'border-box' }}>
                {displayedNotifications.slice(0, 10).map(notification => {
                  const isRead = readNotifications.includes(notification.id);
                  const isUnread = notification.unread && !isRead;
                  const urgencyColor = getUrgencyColor(notification.urgent, isUnread);

                  return (
                    <div
                      key={notification.id}
                      className={`px-3 py-3 border-b border-gray-100 cursor-pointer hover:bg-white/20 ${isUnread ? 'bg-white/10' : ''}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-xs font-futura font-bold uppercase"
                          style={{ color: '#EB1C24', fontSize: '9px' }}
                        >
                          {notification.category}
                        </span>

                        <div className="flex items-center space-x-2">
                          <span
                            className="text-xs font-futura uppercase"
                            style={{ color: '#808080', fontSize: '9px' }}
                          >
                            {notification.timestamp}
                          </span>
                          {isUnread && (
                            <div
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: '#EB1C24' }}
                            />
                          )}
                        </div>
                      </div>

                      <div className="border-l-2 pl-3" style={{ borderColor: urgencyColor }}>
                        <p className="font-covered-by-your-grace text-black leading-relaxed uppercase" style={{ fontSize: '12px' }}>
                          {formatTextWithRedAfterHyphen(notification.text)}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {displayedNotifications.length === 0 && (
                  <div className="px-3 py-6 text-center">
                    <p className="text-xs font-futura text-gray-500">
                      {showInactiveNotifications ? 'NO READ NOTIFICATIONS' : 'NO NEW NOTIFICATIONS'}
                    </p>
                  </div>
                )}
              </div>

              <div className="px-3 py-2 border-t border-gray-200 flex-shrink-0">
                <button
                  className="w-full text-center text-xs font-futura font-bold uppercase hover:opacity-80"
                  style={{ color: '#EB1C24' }}
                  onClick={() => {
                    setShowNotificationsDropdown(false);
                    navigate('/admin/alerts');
                  }}
                >
                  <span style={{ fontSize: '10px' }}>VIEW ALL NOTIFICATIONS</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

