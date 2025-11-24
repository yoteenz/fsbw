
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const notifications = [
  { id: 1, text: "LOW INVENTORY - RESTOCK (5) ITEMS", urgent: true, unread: true, timestamp: "2 MIN AGO", category: "ALERTS" },
  { id: 2, text: "NEW PURCHASE ORDER - DECEMBER 19TH", urgent: false, unread: true, timestamp: "5 MIN AGO", category: "ORDERS" },
  { id: 4, text: "ORDER #17 NEEDS ORDER FORM (24 HOURS)", urgent: true, unread: true, timestamp: "8 MIN AGO", category: "ALERTS" },
  { id: 6, text: "APPOINTMENT CONFLICT - DOUBLE BOOKING DETECTED", urgent: true, unread: false, timestamp: "15 MIN AGO", category: "BOOKINGS" },
  { id: 7, text: "CLIENT COMPLAINT - PRIORITY RESPONSE NEEDED", urgent: true, unread: false, timestamp: "22 MIN AGO", category: "CLIENTS" },
  { id: 8, text: "SHIPPING DELAY - 12 ORDERS AFFECTED", urgent: false, unread: false, timestamp: "35 MIN AGO", category: "ORDERS" },
  { id: 9, text: "REFUND REQUEST - CUSTOMER ID #789", urgent: false, unread: false, timestamp: "1 HOUR AGO", category: "ORDERS" },
  { id: 10, text: "EQUIPMENT FAILURE - PRINTER OFFLINE", urgent: false, unread: false, timestamp: "2 HOURS AGO", category: "OPERATIONAL" },
  { id: 35, text: "BULK ORDER PROCESSING - ORDER #23", urgent: false, unread: true, timestamp: "3 HOURS AGO", category: "ORDERS" },
  { id: 36, text: "ORDER MODIFICATION REQUEST - ORDER #19", urgent: false, unread: true, timestamp: "4 HOURS AGO", category: "ORDERS" },
  { id: 37, text: "ORDER SHIPPED - #ORD-2024-089", urgent: false, unread: false, timestamp: "5 HOURS AGO", category: "ORDERS" },
  { id: 38, text: "PAYMENT RECEIVED - $1,250", urgent: false, unread: true, timestamp: "6 HOURS AGO", category: "SALES" },
  { id: 39, text: "QUOTE APPROVED - ENTERPRISE CLIENT", urgent: false, unread: false, timestamp: "7 HOURS AGO", category: "SALES" },
  { id: 40, text: "PAYMENT RECEIVED - $850", urgent: false, unread: false, timestamp: "8 HOURS AGO", category: "SALES" },
  { id: 41, text: "APPOINTMENT CONFIRMED - MICHAEL T.", urgent: false, unread: true, timestamp: "9 HOURS AGO", category: "BOOKINGS" },
  { id: 42, text: "BOOKING CANCELLATION - JENNIFER S.", urgent: false, unread: false, timestamp: "10 HOURS AGO", category: "BOOKINGS" },
  { id: 43, text: "FOLLOW-UP SCHEDULED - LISA W.", urgent: false, unread: false, timestamp: "12 HOURS AGO", category: "BOOKINGS" }
];

const priorityMessages = [
  {
    id: 1,
    clientName: "SARAH JOHNSON",
    tier: "BLACK TIER",
    message: "URGENT - Need to reschedule my installation appointment for this Saturday. Family emergency came up.",
    timestamp: "3 MIN AGO",
    unread: true,
    priority: "urgent",
    avatar: "SJ",
    photo: "https://static.readdy.ai/image/315e13a2042f092242ff6698f0b32192/ce4ab885708daff01cd1b4c775509dc2.png"
  },
  {
    id: 2,
    clientName: "MARIA RODRIGUEZ",
    tier: "BLACK TIER",
    message: "Hi! Just wanted to confirm my consultation tomorrow at 2 PM. Also, can we discuss the new hair texture options?",
    timestamp: "8 MIN AGO",
    unread: true,
    priority: "high",
    avatar: "MR",
    photo: "https://static.readdy.ai/image/315e13a2042f092242ff6698f0b32192/ce4ab885708daff01cd1b4c775509dc2.png"
  },
  {
    id: 3,
    clientName: "ASHLEY WILLIAMS",
    tier: "BLACK TIER",
    message: "The wig you installed last week is absolutely perfect! My friends keep asking where I got it done. Thank you!",
    timestamp: "15 MIN AGO",
    unread: false,
    priority: "medium",
    avatar: "AW",
    photo: "https://static.readdy.ai/image/315e13a2042f092242ff6698f0b32192/ce4ab885708daff01cd1b4c775509dc2.png"
  },
  {
    id: 4,
    clientName: "JENNIFER DAVIS",
    tier: "BLACK TIER",
    message: "I'm having some issues with the maintenance routine you recommended. Could we schedule a quick virtual check-in?",
    timestamp: "22 MIN AGO",
    unread: true,
    priority: "high",
    avatar: "JD",
    photo: "https://static.readdy.ai/image/315e13a2042f092242ff6698f0b32192/ce4ab885708daff01cd1b4c775509dc2.png"
  },
  {
    id: 5,
    clientName: "LISA MARTINEZ",
    tier: "BLACK TIER",
    message: "Thank you for the amazing service! I'm referring my sister - she'll be calling soon for an appointment.",
    timestamp: "35 MIN AGO",
    unread: false,
    priority: "medium",
    avatar: "LM",
    photo: "https://static.readdy.ai/image/315e13a2042f092242ff6698f0b32192/ce4ab885708daff01cd1b4c775509dc2.png"
  },
  {
    id: 6,
    clientName: "MICHELLE BROWN",
    tier: "BLACK TIER",
    message: "Can we discuss upgrading to the premium package? I'm interested in the monthly maintenance plan.",
    timestamp: "1 HOUR AGO",
    unread: true,
    priority: "high",
    avatar: "MB",
    photo: "https://static.readdy.ai/image/315e13a2042f092242ff6698f0b32192/ce4ab885708daff01cd1b4c775509dc2.png"
  },
  {
    id: 7,
    clientName: "SAMANTHA JONES",
    tier: "BLACK TIER",
    message: "Love the new hair! Quick question about washing frequency - is twice a week too much for this texture?",
    timestamp: "2 HOURS AGO",
    unread: false,
    priority: "low",
    avatar: "SJ",
    photo: "https://static.readdy.ai/image/315e13a2042f092242ff6698f0b32192/ce4ab885708daff01cd1b4c775509dc2.png"
  },
  {
    id: 8,
    clientName: "NICOLE TAYLOR",
    tier: "BLACK TIER",
    message: "Hi! I'm traveling to Miami next month. Do you have any stylist recommendations there for emergency touch-ups?",
    timestamp: "3 HOURS AGO",
    unread: false,
    priority: "medium",
    avatar: "NT",
    photo: "https://static.readdy.ai/image/315e13a2042f092242ff6698f0b32192/ce4ab885708daff01cd1b4c775509dc2.png"
  }
];

const systemNotifications = [
  { id: 27, text: "SYSTEM MAINTENANCE - SECURITY UPDATE REQUIRED", urgent: false },
  { id: 28, text: "SERVER ERROR - DATABASE CONNECTION LOST", urgent: false },
  { id: 29, text: "SECURITY ALERT - UNUSUAL LOGIN ACTIVITY", urgent: false },
  { id: 30, text: "SYSTEM UPDATE - NEW FEATURES AVAILABLE", urgent: false },
  { id: 31, text: "BACKUP REMINDER - WEEKLY DATA BACKUP DUE", urgent: false }
];

interface AdminHeaderProps {
  /** Text displayed after the "ADMIN >" label */
  title: string;
  /** Show a back‑arrow button on the left side */
  showBack?: boolean;
  /** Callback executed when the back button is pressed */
  onBack?: () => void;
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
}: AdminHeaderProps) {
  const navigate = useNavigate();

  const [isBackPressed, setIsBackPressed] = useState(false);
  const [isSearchPressed, setIsSearchPressed] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMessagesPressed, setIsMessagesPressed] = useState(false);
  const [isNotificationsPressed, setIsNotificationsPressed] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showMessagesDropdown, setShowMessagesDropdown] = useState(false);
  const [readNotifications, setReadNotifications] = useState<number[]>([]);
  const [readMessages, setReadMessages] = useState<number[]>([]);

  // Long press detection states
  const [messagesLongPressTimer, setMessagesLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [notificationsLongPressTimer, setNotificationsLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [showInactiveNotifications, setShowInactiveNotifications] = useState(false);
  const [showInactiveMessages, setShowInactiveMessages] = useState(false);

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

  // Debounce function
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  /** Safely invoke the optional onBack callback or navigate back */
  const handleBack = () => {
    if (typeof onBack === 'function') {
      try {
        onBack();
      } catch (err) {
        console.error('AdminHeader: onBack handler threw an error', err);
      }
    } else {
      navigate(-1);
    }
  };

  // Handle search activation
  const handleSearchClick = () => {
    setIsSearchActive(true);
  };

  // Handle search input blur
  const handleSearchBlur = () => {
    if (searchQuery.trim() === '') {
      setIsSearchActive(false);
    }
  };

  // Handle search input key press
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      console.log('Searching for:', searchQuery);
    }
    if (e.key === 'Escape') {
      setSearchQuery('');
      setIsSearchActive(false);
    }
  };

  // Handle messages click with long press detection
  const handleMessagesMouseDown = () => {
    const timer = setTimeout(() => {
      setShowInactiveMessages(!showInactiveMessages);
      setShowMessagesDropdown(false);
    }, 500); // 500ms long press
    setMessagesLongPressTimer(timer);
  };

  const handleMessagesMouseUp = () => {
    if (messagesLongPressTimer) {
      clearTimeout(messagesLongPressTimer);
      setMessagesLongPressTimer(null);
    }
  };

  const handleMessagesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Always toggle dropdown on click, regardless of long press timer
    setShowMessagesDropdown(!showMessagesDropdown);
    setShowNotificationsDropdown(false);
  };

  // Handle notifications click with long press detection
  const handleNotificationsMouseDown = () => {
    const timer = setTimeout(() => {
      setShowInactiveNotifications(!showInactiveNotifications);
      setShowNotificationsDropdown(false);
    }, 500); // 500ms long press
    setNotificationsLongPressTimer(timer);
  };

  const handleNotificationsMouseUp = () => {
    if (notificationsLongPressTimer) {
      clearTimeout(notificationsLongPressTimer);
      setNotificationsLongPressTimer(null);
    }
  };

  const handleNotificationsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Always toggle dropdown on click, regardless of long press timer
    setShowNotificationsDropdown(!showNotificationsDropdown);
    setShowMessagesDropdown(false);
  };

  // Mark notification as read
  const markAsRead = (notificationId: number) => {
    setReadNotifications(prev => [...prev, notificationId]);
  };

  // Mark message as read
  const markMessageAsRead = (messageId: number) => {
    setReadMessages(prev => [...prev, messageId]);
  };

  // Get unread notifications count - always show count regardless of inactive state
  const unreadCount = notifications.filter(
    n => n.unread && !readNotifications.includes(n.id)
  ).length;

  // Get unread messages count - always show count regardless of inactive state
  const unreadMessagesCount = priorityMessages.filter(
    m => m.unread && !readMessages.includes(m.id)
  ).length;

  // Get urgency color for notification items
  const getUrgencyColor = (urgent: boolean, unread: boolean) => {
    if (urgent) return '#EB1C24';
    return unread ? '#FF8C00' : '#909090';
  };

  // Get priority color
  const getPriorityColor = (priority: string, unread: boolean) => {
    if (!unread) return '#909090';
    switch (priority) {
      case 'urgent':
        return '#EB1C24';
      case 'high':
        return '#FF8C00';
      case 'medium':
        return '#4CAF50';
      case 'low':
      default:
        return '#909090';
    }
  };

  // Get tier color
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BLACK TIER':
        return '#000000';
      default:
        return '#909090';
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
    ? notifications.filter(
        n => !n.unread || readNotifications.includes(n.id)
      )
    : notifications.filter(
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
    <header className="px-4 py-4 relative">
      <div className="max-w-md mx-auto">
        <div
          className="bg-white/60 backdrop-blur-sm border border-black px-4 py-2 flex items-center justify-center h-10 relative"
          style={{ borderWidth: '1.4px' }}
        >
          {/* Left side icons - Fixed width container with proper vertical centering */}
          <div className="flex items-center space-x-0.5 w-16 h-full absolute left-4">
            {/* Back button or Search icon - always takes same space with vertical centering */}
            <div className="w-8 h-8 flex items-center justify-center">
              {showBack && !isSearchActive ? (
                <button
                  type="button"
                  onClick={handleBack}
                  onMouseDown={() => setIsBackPressed(true)}
                  onMouseUp={() => setIsBackPressed(false)}
                  onMouseLeave={() => setIsBackPressed(false)}
                  onTouchStart={() => setIsBackPressed(true)}
                  onTouchEnd={() => setIsBackPressed(false)}
                  className="w-full h-full flex items-center justify-center transition-colors duration-150"
                  aria-label="Back"
                >
                  <svg
                    width="12"
                    height="15"
                    viewBox="0 0 12 15"
                    fill="none"
                    style={{ color: isBackPressed ? '#EB1C24' : '#000000' }}
                  >
                    <path
                      d="M10.7579 15C10.6205 15.0001 10.4877 14.9622 10.3836 14.8934L0.201231 8.17623C0.139913 8.13596 0.0903232 8.08623 0.0556832 8.03028C0.0210431 7.97434 0.00212871 7.91342 0.000169535 7.85149C-0.00178963 7.78956 0.0132503 7.72801 0.0443116 7.67084C0.0753729 7.61367 0.12176 7.56215 0.180458 7.51965L10.3628 0.113393C10.4743 0.036355 10.6205 -0.00421025 10.7704 0.000346211C10.9203 0.00490267 11.0619 0.0542203 11.165 0.137783C11.2682 0.221347 11.3248 0.332543 11.3227 0.447664C11.3206 0.562785 11.26 0.67272 11.1538 0.754031L1.43411 7.82543L11.133 14.2237C11.2221 14.2824 11.2856 14.3607 11.315 14.4481C11.3444 14.5354 11.3383 14.6275 11.2974 14.7121C11.2566 14.7966 11.183 14.8695 11.0865 14.921C10.9901 14.9725 10.8754 15.0001 10.7579 15Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              ) : (
                // Show search icon in back button position for dashboard or when search is not active
                !isSearchActive && (
                  <button
                    type="button"
                    className="w-full h-full flex items-center justify-center transition-colors duration-150"
                    onMouseDown={() => setIsSearchPressed(true)}
                    onMouseUp={() => setIsSearchPressed(false)}
                    onMouseLeave={() => setIsSearchPressed(false)}
                    onTouchStart={() => setIsSearchPressed(true)}
                    onTouchEnd={() => setIsSearchPressed(false)}
                    onClick={handleSearchClick}
                  >
                    <img
                      src="/assets/search-icon.svg"
                      alt="Search"
                      width="20"
                      height="20"
                      style={{
                        filter: isSearchPressed ? 'brightness(0) saturate(100%) invert(20%) sepia(100%) saturate(7500%) hue-rotate(0deg) brightness(100%) contrast(100%)' : 'none'
                      }}
                    />
                  </button>
                )
              )}
            </div>

            {/* Secondary icon button - only show if there's a back button AND search is not active */}
            {showBack && !isSearchActive && (
              <div className="w-6 h-6 flex items-center justify-center">
                <button
                  type="button"
                  className="w-full h-full flex items-center justify-center transition-colors duration-150"
                  onMouseDown={() => setIsSearchPressed(true)}
                  onMouseUp={() => setIsSearchPressed(false)}
                  onMouseLeave={() => setIsSearchPressed(false)}
                  onTouchStart={() => setIsSearchPressed(true)}
                  onTouchEnd={() => setIsSearchPressed(false)}
                  onClick={handleSearchClick}
                >
                  <img
                    src="/assets/search-icon.svg"
                    alt="Search"
                    width="20"
                    height="20"
                    style={{
                      filter: isSearchPressed ? 'brightness(0) saturate(100%) invert(20%) sepia(100%) saturate(7500%) hue-rotate(0deg) brightness(100%) contrast(100%)' : 'none'
                    }}
                  />
                </button>
              </div>
            )}
          </div>

          {/* Center title or search input - Fixed positioning */}
          <div className="flex-1 text-center flex items-center justify-center h-full">
            {isSearchActive ? (
              <div className="w-full flex items-center absolute left-4 right-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={handleSearchBlur}
                  onKeyDown={handleSearchKeyPress}
                  placeholder="SEARCH ADMIN..."
                  className="w-full bg-transparent border-none outline-none text-xs font-futura uppercase placeholder-gray-400"
                  style={{
                    fontWeight: '500',
                    color: '#EB1C24',
                    fontSize: '12px',
                    textAlign: 'left',
                    paddingLeft: '0',
                  }}
                  autoFocus
                />
              </div>
            ) : (
              <div className="overflow-hidden text-ellipsis">
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="text-xs text-black font-futura uppercase hover:text-red-500 transition-colors cursor-pointer"
                  style={{ fontWeight: '500' }}
                >
                  ADMIN &gt;{' '}
                </button>
                <span
                  className="text-xs font-futura text-red-500 uppercase"
                  style={{ fontWeight: '500', color: '#EB1C24' }}
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
                onMouseDown={handleMessagesMouseDown}
                onMouseUp={handleMessagesMouseUp}
                onMouseLeave={handleMessagesMouseUp}
                onTouchStart={handleMessagesMouseDown}
                onTouchEnd={handleMessagesMouseUp}
                onClick={handleMessagesClick}
              >
                <img
                  src={showInactiveMessages ? '/assets/inactive message-icon.svg' : '/assets/active messages-icon.svg'}
                  alt="Messages"
                  width="22"
                  height="20"
                  style={{
                    opacity: showInactiveMessages ? 0.5 : 1,
                    transform: 'translateY(-1px)'
                  }}
                />
              </button>
            </div>

            {/* Notifications - Using proper Remix Icon with vertical centering */}
            <div className="relative h-full flex items-center">
              <button
                type="button"
                className="w-6 h-6 flex items-center justify-center transition-colors duration-150"
                onMouseDown={handleNotificationsMouseDown}
                onMouseUp={handleNotificationsMouseUp}
                onMouseLeave={handleNotificationsMouseUp}
                onTouchStart={handleNotificationsMouseDown}
                onTouchEnd={handleNotificationsMouseUp}
                onClick={handleNotificationsClick}
              >
                <img
                  src={showInactiveNotifications ? '/assets/inactive notifications-icon.svg' : '/assets/active notifications-icon.svg'}
                  alt="Notifications"
                  width="20"
                  height="20"
                  style={{
                    opacity: showInactiveNotifications ? 0.5 : 1,
                    transform: 'translateY(1px)'
                  }}
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
        <div className="fixed inset-x-0 top-0 pt-16 px-4 z-[99999] pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <div
              data-dropdown-content
              className="bg-white/60 backdrop-blur-md border border-black shadow-lg hover:shadow-xl transition-all duration-300 ease-out max-h-80 overflow-y-auto"
              style={{ borderWidth: '1.4px' }}
              onMouseDown={(e) => {
                // Prevent backdrop from closing dropdown when clicking inside
                e.stopPropagation();
              }}
            >
              <div className="px-3 py-2 border-b flex items-center justify-between">
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

              <div className="max-h-64 overflow-y-auto">
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
                              style={{ color: tierColor, fontSize: '8px', fontFamily: '"Futura PT Medium", Futura, Arial, sans-serif' }}
                            >
                              {message.tier}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-futura uppercase" style={{ color: '#909090', fontSize: '8px' }}>
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

                <div className="px-3 py-2 border-t border-gray-200">
                  <button
                    className="w-full text-center text-xs font-futura font-bold uppercase hover:opacity-80"
                    style={{ color: '#EB1C24' }}
                    onClick={() => {
                      setShowMessagesDropdown(false);
                      navigate('/admin/overview');
                    }}
                  >
                    <span style={{ fontSize: '10px' }}>VIEW ALL MESSAGES</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Dropdown */}
      {showNotificationsDropdown && (
        <div className="fixed inset-x-0 top-0 pt-16 px-4 z-[99999] pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <div
              data-dropdown-content
              className="bg-white/60 backdrop-blur-md border border-black shadow-lg hover:shadow-xl transition-all duration-300 ease-out max-h-80 overflow-y-auto"
              style={{ borderWidth: '1.4px' }}
              onMouseDown={(e) => {
                // Prevent backdrop from closing dropdown when clicking inside
                e.stopPropagation();
              }}
            >
              <div className="px-3 py-2 border-b flex items-center justify-between">
                <h3 className="font-futura font-bold text-black uppercase" style={{ fontSize: '10px' }}>
                  {showInactiveNotifications ? 'INACTIVE NOTIFICATIONS' : 'NOTIFICATIONS'}
                </h3>
                <span className="font-futura" style={{ color: '#EB1C24', fontSize: '10px' }}>
                  {showInactiveNotifications
                    ? `${displayedNotifications.length} read`
                    : `${unreadCount} NEW`}
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto">
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
                            style={{ color: '#909090', fontSize: '9px' }}
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

                <div className="px-3 py-2 border-t border-gray-200">
                  <button
                    className="w-full text-center text-xs font-futura font-bold uppercase hover:opacity-80"
                    style={{ color: '#EB1C24' }}
                    onClick={() => {
                      setShowNotificationsDropdown(false);
                      navigate('/admin/overview');
                    }}
                  >
                    <span style={{ fontSize: '10px' }}>VIEW ALL NOTIFICATIONS</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

