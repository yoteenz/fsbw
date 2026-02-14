import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import ConfirmationModal from '../../../components/ConfirmationModal';
import BrandMenuLinks from '../../../components/BrandMenuLinks';
import SocialMenuIcons from '../../../components/SocialMenuIcons';

interface Notification {
  id: string;
  title: string;
  message: string;
  actionText?: string;
  actionRoute?: string;
  date: string;
  isRead: boolean;
  icon: string; // 'f' or 'fc'
}

function NotificationsPage() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('cartCount') || '0', 10);
    } catch (e) {
      return 0;
    }
  });
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileMenuActiveTab, setMobileMenuActiveTab] = useState(() => {
    const pathname = window.location.pathname;
    if (pathname.includes('/tools') || pathname === '/tools/gift-card') {
      return 'TOOLS';
    } else if (pathname.includes('/brand') || pathname.includes('/about') || pathname.includes('/contact') || pathname.includes('/faq') || pathname.includes('/reviews') || pathname.includes('/terms')) {
      return 'BRAND';
    }
    return 'SHOP';
  });
  const [mobileMenuExpandedItems, setMobileMenuExpandedItems] = useState<string[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('isSignedIn') === 'true';
      } catch (e) {
        return false;
      }
    }
    return false;
  });
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [notificationToArchive, setNotificationToArchive] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'NEW' | 'SEEN'>('NEW');
  const [profileImage, setProfileImage] = useState(() => {
    // Load from localStorage on mount
    if (typeof window !== 'undefined') {
      try {
        const savedImage = localStorage.getItem('profileImage');
        return savedImage || '/assets/profile-thumb.png';
      } catch (e) {
        return '/assets/profile-thumb.png';
      }
    }
    return '/assets/profile-thumb.png';
  });

  // Mock notifications data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'SATIN BONNET IS NOW ON SALE',
      message: 'SHOP THIS DEAL WHILE SUPPLIES LAST.',
      actionText: 'VIEW PRODUCT',
      actionRoute: '/shop/units',
      date: 'TODAY',
      isRead: false,
      icon: 'f'
    },
    {
      id: '2',
      title: 'ORDER #344 HAS BEEN DELIVERED',
      message: 'YOU CAN NOW LEAVE A REVIEW FOR THIS ORDER.',
      actionText: 'SUBMIT REVIEW',
      actionRoute: '/account/orders',
      date: 'YESTERDAY',
      isRead: false,
      icon: 'f'
    },
    {
      id: '3',
      title: 'ORDER #344 HAS SHIPPED',
      message: 'PROCESSING FOR THIS ORDER IS NOW COMPLETE.',
      actionText: 'TRACK DELIVERY',
      actionRoute: '/account/orders',
      date: '2 DAYS AGO',
      isRead: false,
      icon: 'fc'
    },
    {
      id: '4',
      title: 'NEW DROP COMING SOON',
      message: 'TRAVEL SIZE FOAM RELEASING ON 4/22.',
      date: '3 DAYS AGO',
      isRead: false,
      icon: 'f'
    },
    {
      id: '5',
      title: 'ORDER #344 HAS BEEN CONFIRMED',
      message: "WE'RE PROCESSING YOUR ORDER, SIT TIGHT.",
      actionText: 'VIEW DETAILS',
      actionRoute: '/account/orders',
      date: '1 WEEK AGO',
      isRead: true,
      icon: 'f'
    }
  ]);

  const newNotifications = notifications.filter(n => !n.isRead);
  const seenNotifications = notifications.filter(n => n.isRead);

  // Listen for cart count changes and profile image updates
  useEffect(() => {
    const handleCartCountUpdate = (event: CustomEvent) => {
      setCartCount(event.detail);
    };

    const handleStorageChange = () => {
      try {
        const newCartCount = parseInt(localStorage.getItem('cartCount') || '0', 10);
        setCartCount(newCartCount);
        
        // Update profile image if it changed
        const savedImage = localStorage.getItem('profileImage');
        if (savedImage && savedImage !== profileImage) {
          setProfileImage(savedImage);
        } else if (!savedImage && profileImage !== '/assets/profile-thumb.png') {
          setProfileImage('/assets/profile-thumb.png');
        }
      } catch (e) {
        setCartCount(0);
      }
    };

    window.addEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
    window.addEventListener('cartUpdated', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
      window.removeEventListener('cartUpdated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, [profileImage]);

  const handleMobileMenuToggle = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleMobileMenuTabClick = (tab: string) => {
    setMobileMenuActiveTab(tab);
  };

  const handleMobileMenuItemToggle = (item: string) => {
    setMobileMenuExpandedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const handleMobileMenuSignInToggle = () => {
    if (isSignedIn) {
      setShowSignOutConfirm(true);
    } else {
      navigate('/sign-in');
    }
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    localStorage.setItem('isSignedIn', 'false');
    localStorage.removeItem('currentUser');
    window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'false' }));
    setShowSignOutConfirm(false);
    setShowMobileMenu(false);
  };

  const handleBack = () => {
    navigate('/account');
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.actionRoute) {
      navigate(notification.actionRoute);
    }
    // Mark as read
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id ? { ...n, isRead: true } : n
      )
    );
  };

  const displayedNotifications = activeTab === 'NEW' ? newNotifications : seenNotifications;

  return (
    <>
      <div className="min-h-screen" style={{
        position: 'relative',
        backgroundImage: `url('/assets/marble-half.png')`,
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'repeat',
        backgroundAttachment: 'fixed'
      }}>
        {/* Scrollable Content */}
        <div className="relative z-10">
          {/* MAIN CONTENT */}
          <div className="flex flex-col py-5 px-4">
            {/* HEADER */}
            <div
              className="border-solid border-black flex justify-center items-center py-3 w-full mb-5 px-5 bg-white/60 backdrop-blur-sm relative"
              style={{ border: '1.3px solid black' }}
            >
              <div className="flex gap-5 absolute left-4">
                {showMobileMenu ? (
                  <>
                    <button 
                      onClick={() => navigate(isSignedIn ? '/account' : '/sign-in')}
                      className="cursor-pointer" 
                      style={{ height: '15px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(4px)' }}
                    >
                      <img
                        alt="Account icon"
                        width="16"
                        height="16"
                        src="/assets/NOIR/account-icon.svg"
                      />
                    </button>
                    <button 
                      onClick={() => navigate(isSignedIn ? '/wishlist' : '/sign-in')} 
                      className="cursor-pointer"
                      style={{ height: '21px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(2px)' }}
                    >
                      <img
                        alt="Wishlist"
                        width="18"
                        height="18"
                        src="/assets/wishlist-heart.svg"
                      />
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={handleBack} 
                      className="cursor-pointer"
                      style={{ height: '15px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important' }}
                    >
                      <img
                        alt="Back"
                        width="21"
                        height="15"
                        src="/assets/back-button.svg"
                      />
                    </button>
                    <button className="cursor-pointer" style={{ transform: 'translateX(-2px)' }}>
                      <img
                        alt="Search icon"
                        width="16"
                        height="15"
                        src="/assets/search-icon.svg"
                      />
                    </button>
                  </>
                )}
              </div>
              <p className="text-sm" style={{ fontFamily: '"Futura PT Book"', transform: 'translateY(1px)' }}>
                {showMobileMenu ? (
                  <>
                    <span 
                      style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }}
                      onClick={() => navigate('/build-a-wig')}
                    >
                      HOME &gt;
                    </span>{' '}
                    <span
                      style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
                    >
                      MENU
                    </span>
                  </>
                ) : (
                  <>
                    <span 
                      style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }}
                      onClick={() => navigate('/account')}
                    >
                      ACCOUNT &gt;
                    </span>{' '}
                    <span
                      style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
                    >
                      ALERTS
                    </span>
                  </>
                )}
              </p>
              <div className="gap-5 flex absolute" style={{ right: '17px' }}>
                <div style={{ transform: `translateX(${cartCount === 0 ? 7 : 5}px)` }}>
                  <DynamicCartIcon count={cartCount} width={22} height={19} />
                </div>
                <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg
                    width="17"
                    height="18"
                    viewBox="0 0 16 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="cursor-pointer"
                    onClick={handleMobileMenuToggle}
                    style={{ marginTop: '2px' }}
                  >
                    <path d="M0 0H15.75V0.7H7.875H0V0ZM5.25 6.7H10.5H15.375V7.4H10.5H5.25V6.7ZM0 13.1H15.75V13.8H0V13.1Z" fill="black"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* MAIN CONTENT AREA */}
            {showMobileMenu ? (
              /* MOBILE MENU CONTENT */
              <div
                className="border border-black flex flex-col pt-6 pb-4 px-5 bg-white/60 backdrop-blur-sm w-full"
                style={{ 
                  borderWidth: '1.3px', 
                  minWidth: '100%', 
                  maxWidth: 'none', 
                  overflow: 'visible',
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  minHeight: '560px'
                }}
              >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', paddingTop: '20px', height: '490px', position: 'relative' }}>
                {/* Navigation Links */}
                <div className="flex justify-center gap-8" style={{ marginBottom: '30px' }}>
                  <button
                    onClick={() => handleMobileMenuTabClick('SHOP')}
                    style={{ 
                      fontFamily: mobileMenuActiveTab === 'SHOP' ? '"Futura PT Medium"' : '"Futura PT Book"',
                      fontSize: '14px',
                      color: mobileMenuActiveTab === 'SHOP' ? '#EB1C24' : 'black',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      borderBottom: mobileMenuActiveTab === 'SHOP' ? '1px solid #EB1C24' : 'none',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      paddingBottom: '4px',
                      background: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    SHOP
                  </button>
                  <button
                    onClick={() => handleMobileMenuTabClick('TOOLS')}
                    style={{ 
                      fontFamily: mobileMenuActiveTab === 'TOOLS' ? '"Futura PT Medium"' : '"Futura PT Book"',
                      fontSize: '14px',
                      color: mobileMenuActiveTab === 'TOOLS' ? '#EB1C24' : 'black',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      borderBottom: mobileMenuActiveTab === 'TOOLS' ? '1px solid #EB1C24' : 'none',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      paddingBottom: '4px',
                      background: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    TOOLS
                  </button>
                  <button
                    onClick={() => handleMobileMenuTabClick('BRAND')}
                    style={{ 
                      fontFamily: mobileMenuActiveTab === 'BRAND' ? '"Futura PT Medium"' : '"Futura PT Book"',
                      fontSize: '14px',
                      color: mobileMenuActiveTab === 'BRAND' ? '#EB1C24' : 'black',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      borderBottom: mobileMenuActiveTab === 'BRAND' ? '1px solid #EB1C24' : 'none',
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      paddingBottom: '4px',
                      background: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    BRAND
                  </button>
                </div>

                {/* Menu Items */}
                <div style={{ flex: '1', overflowY: 'auto', marginBottom: '20px', minHeight: '0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                    {mobileMenuActiveTab === 'TOOLS' ? (
                      ['GIFT CARD'].map((item, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => navigate('/tools/gift-card')}
                        >
                          <span style={{ 
                            fontFamily: '"Futura PT Book"',
                            fontSize: '14px',
                            color: 'black',
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            transform: 'translateX(7px)'
                          }}>
                            {item}
                          </span>
                        </div>
                      ))
                    ) : mobileMenuActiveTab === 'BRAND' ? (
                      <BrandMenuLinks onClose={() => setShowMobileMenu(false)} />
                    ) : (
                      [
                        { label: 'UNITS', hasArrow: true, isExpandable: true, subItems: ['STRAIGHT', 'WAVY', 'CURLY'] },
                        { label: 'BOOKING', hasArrow: true, isExpandable: true, subItems: ['APPOINTMENT', 'CONSULTATION'] },
                        { label: 'BUILD-A-WIG', hasArrow: false },
                        { label: 'ORDER AUTHORIZATION FORM', hasArrow: false }
                      ].map((item, index) => (
                        <div key={index}>
                          <div 
                            className="flex items-center justify-between"
                            style={{ alignItems: 'center' }}
                          >
                            <span 
                              style={{ 
                                fontFamily: '"Futura PT Book"',
                                fontSize: '14px',
                                color: 'black',
                                fontWeight: '500',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                transform: 'translateX(7px)'
                              }}
                              onClick={() => {
                                if (item.isExpandable) {
                                  if (item.label === 'UNITS' && mobileMenuExpandedItems.includes(item.label)) {
                                    navigate('/shop/units');
                                  } else {
                                    handleMobileMenuItemToggle(item.label);
                                  }
                                } else if (item.label === 'ORDER AUTHORIZATION FORM') {
                                  navigate('/shop/order-form');
                                }
                              }}
                            >
                              {item.label}
                            </span>
                            {item.hasArrow && (
                              <img
                                src="/assets/NOIR/closed-arrow.svg"
                                alt="Arrow"
                                style={{ 
                                  width: '16px', 
                                  height: '16px',
                                  transform: `${mobileMenuExpandedItems.includes(item.label) ? 'translateX(-5px) translateY(-4px) rotate(90deg)' : 'translateX(-5px) translateY(-4px) rotate(0deg)'}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  cursor: 'pointer'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (item.isExpandable) {
                                    handleMobileMenuItemToggle(item.label);
                                  }
                                }}
                              />
                            )}
                          </div>
                          {item.isExpandable && mobileMenuExpandedItems.includes(item.label) && item.subItems && (
                            <div className="ml-4 mt-2 space-y-2">
                              {item.subItems.map((subItem, subIndex) => (
                                <div 
                                  key={subIndex} 
                                  className="flex items-center cursor-pointer"
                                  onClick={() => {
                                    if (subItem === 'STRAIGHT') {
                                      navigate('/units/straight');
                                    } else if (subItem === 'WAVY') {
                                      navigate('/units/wavy');
                                    } else if (subItem === 'CURLY') {
                                      navigate('/units/curly');
                                    }
                                  }}
                                >
                                  <span style={{ 
                                    fontFamily: '"Futura PT Book"',
                                    fontSize: '14px',
                                    color: '#EB1C24',
                                    fontWeight: '500',
                                    textTransform: 'uppercase'
                                  }}>
                                    {subItem}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Sign In/Out */}
                <div className="flex justify-center" style={{ marginBottom: '20px', marginTop: 'auto' }}>
                  <span 
                    onClick={handleMobileMenuSignInToggle}
                    style={{ 
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '14px',
                      color: '#EB1C24',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      cursor: 'pointer'
                    }}
                  >
                    {isSignedIn ? 'SIGN OUT' : 'SIGN IN'}
                  </span>
                </div>

                {/* Social Media Icons */}
                <SocialMenuIcons />
                </div>
              </div>
            ) : (
              /* NOTIFICATIONS CONTENT */
              <div className="flex flex-col gap-4 mb-5">
                {/* Notifications Card */}
                <div className="bg-white/60 backdrop-blur-sm border border-black p-4 flex flex-col overflow-hidden shadow-lg transition-all duration-300 ease-out" style={{ borderWidth: '1.3px', minHeight: '560px' }}>
                  {/* Header with tabs */}
                  <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200">
                    <button
                      onClick={() => setActiveTab('NEW')}
                      className={`text-red-500 font-bold text-lg tracking-wider truncate transition-colors text-left uppercase ${
                        activeTab === 'NEW' ? 'opacity-100' : 'opacity-50'
                      }`}
                      style={{ 
                        fontFamily: '"Futura PT Medium"', 
                        color: activeTab === 'NEW' ? '#EB1C24' : '#808080', 
                        fontSize: '12px', 
                        fontWeight: '500',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        transform: 'translateX(2px)'
                      }}
                    >
                      NEW
                    </button>
                    <button
                      onClick={() => setActiveTab('SEEN')}
                      className={`text-red-500 font-bold text-lg tracking-wider truncate transition-colors text-right uppercase ${
                        activeTab === 'SEEN' ? 'opacity-100' : 'opacity-50'
                      }`}
                      style={{ 
                        fontFamily: '"Futura PT Medium"', 
                        color: activeTab === 'SEEN' ? '#EB1C24' : '#808080', 
                        fontSize: '12px', 
                        fontWeight: '500',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        transform: 'translateX(-2px)'
                      }}
                    >
                      SEEN
                    </button>
                  </div>

                  {/* Notifications List */}
                  <div className="flex-1 flex flex-col overflow-y-auto mt-4" style={{ maxHeight: 'calc(560px - 100px)', scrollBehavior: 'smooth', width: '100%' }}>
                    {displayedNotifications.length === 0 ? (
                      <div className="flex flex-col justify-center items-center my-8 flex-shrink-0">
                        <p
                          style={{
                            fontFamily: '"Futura PT Medium"',
                            fontSize: '12px',
                            color: '#808080',
                            margin: 0,
                            textTransform: 'uppercase',
                            fontWeight: '500'
                          }}
                        >
                          NO {activeTab === 'NEW' ? 'NEW' : 'SEEN'} NOTIFICATIONS
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                        {displayedNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className="flex items-start gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            {/* Notification Icon - Profile Photo */}
                            <div
                              className="flex-shrink-0 rounded-full border border-black overflow-hidden"
                              style={{
                                width: '56px',
                                height: '56px',
                                borderWidth: '1px'
                              }}
                            >
                              <img
                                src={profileImage}
                                alt="Profile"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRadius: '50%'
                                }}
                                onError={(e) => {
                                  e.currentTarget.src = '/assets/profile-thumb.png';
                                }}
                              />
                            </div>

                            {/* Notification Content */}
                            <div className="flex-1 min-w-0" style={{ transform: 'translateY(6px)', marginLeft: '4px' }}>
                              {/* Primary Message with Archive Icon */}
                              <div className="flex items-center justify-between gap-2" style={{ marginBottom: '4px' }}>
                                <p
                                  style={{
                                    fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                                    fontSize: '14px',
                                    fontWeight: 'normal',
                                    color: 'black',
                                    margin: 0,
                                    lineHeight: '1.2',
                                    flex: 1
                                  }}
                                >
                                  {notification.title}
                                </p>
                                {!notification.isRead && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Show confirmation modal
                                      setNotificationToArchive(notification.id);
                                      setShowArchiveConfirm(true);
                                    }}
                                    style={{
                                      border: 'none',
                                      background: 'none',
                                      cursor: 'pointer',
                                      padding: 0,
                                      margin: 0,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0,
                                      transform: 'translate(-2px, -3px)'
                                    }}
                                  >
                                    <img
                                      src="/assets/seen-notif.svg"
                                      alt="Archive notification"
                                      style={{
                                        width: '16px',
                                        height: '16px'
                                      }}
                                    />
                                  </button>
                                )}
                                {notification.isRead && activeTab === 'SEEN' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Show delete confirmation modal
                                      setNotificationToDelete(notification.id);
                                      setShowDeleteConfirm(true);
                                    }}
                                    style={{
                                      border: 'none',
                                      background: 'none',
                                      cursor: 'pointer',
                                      padding: 0,
                                      margin: 0,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0,
                                      transform: 'translate(-2px, -3px)'
                                    }}
                                  >
                                    <img
                                      src="/assets/close-icon.svg"
                                      alt="Delete notification"
                                      style={{
                                        width: '16px',
                                        height: '16px',
                                        filter: 'brightness(0) saturate(100%) invert(20%) sepia(93%) saturate(7151%) hue-rotate(349deg) brightness(92%) contrast(92%)'
                                      }}
                                    />
                                  </button>
                                )}
                              </div>

                              {/* Secondary Message */}
                              <p
                                style={{
                                  fontFamily: '"Futura PT Demi"',
                                  fontSize: '10px',
                                  color: '#808080',
                                  margin: '0 0 3px 0',
                                  lineHeight: '1.3'
                                }}
                              >
                                {notification.message}
                              </p>

                              {/* Action Link */}
                              {notification.actionText && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (notification.actionRoute) {
                                      navigate(notification.actionRoute);
                                    }
                                  }}
                                  style={{
                                    fontFamily: '"Futura PT Medium"',
                                    fontSize: '10px',
                                    color: '#EB1C24',
                                    fontWeight: '500',
                                    textTransform: 'uppercase',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    padding: 0,
                                    margin: 0,
                                    transform: 'translateY(-2px)'
                                  }}
                                >
                                  {notification.actionText}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={handleSignOut}
        title="SIGN OUT"
        message="ARE YOU SURE YOU WANT TO SIGN OUT?"
        confirmText="CONFIRM"
        cancelText="CANCEL"
        dataAttribute="sign-out-confirm"
      />

      {/* Archive Notification Confirmation Modal */}
      <ConfirmationModal
        isOpen={showArchiveConfirm}
        onClose={() => {
          setShowArchiveConfirm(false);
          setNotificationToArchive(null);
        }}
        onConfirm={() => {
          if (notificationToArchive) {
            // Archive the notification
            setNotifications(prev => 
              prev.map(n => 
                n.id === notificationToArchive ? { ...n, isRead: true } : n
              )
            );
            // If we're on NEW tab and this was the last new notification, switch to SEEN
            if (activeTab === 'NEW' && newNotifications.length === 1) {
              setActiveTab('SEEN');
            }
          }
          setShowArchiveConfirm(false);
          setNotificationToArchive(null);
        }}
        title="ARCHIVE ALERT?"
        message="ARE YOU SURE YOU WANT TO ARCHIVE THIS NOTIFICATION?"
        confirmText="CONFIRM"
        cancelText="CANCEL"
        dataAttribute="archive-notification-confirm"
      />

      {/* Delete Notification Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setNotificationToDelete(null);
        }}
        onConfirm={() => {
          if (notificationToDelete) {
            // Delete the notification
            setNotifications(prev => 
              prev.filter(n => n.id !== notificationToDelete)
            );
          }
          setShowDeleteConfirm(false);
          setNotificationToDelete(null);
        }}
        title="REMOVE ALERT?"
        message="ARE YOU SURE YOU WANT TO DELETE THIS NOTIFICATION?"
        confirmText="CONFIRM"
        cancelText="CANCEL"
        dataAttribute="delete-notification-confirm"
      />
    </>
  );
}

export default NotificationsPage;

