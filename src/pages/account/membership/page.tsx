import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';

function MembershipPage() {
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
  const [isSignedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('isSignedIn') === 'true';
      } catch (e) {
        return false;
      }
    }
    return false;
  });
  const [userData] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      try {
        const currentUser = localStorage.getItem('currentUser');
        return currentUser ? JSON.parse(currentUser) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Generate referral code from user data with conflict checking
  const generateReferralCode = (): string => {
    // If user already has a referral code stored, use it
    if (userData?.referralCode) {
      return userData.referralCode;
    }

    if (!userData) {
      return 'KA3047'; // Default/example code
    }

    // Get first initial of first name
    const firstInitial = userData.firstName && userData.firstName.length > 0 
      ? userData.firstName.charAt(0).toUpperCase() 
      : 'K';

    // Get first initial of last name
    const lastInitial = userData.lastName && userData.lastName.length > 0 
      ? userData.lastName.charAt(0).toUpperCase() 
      : 'A';

    // Extract day from birthday (format: MM/DD/YYYY)
    let day = '30'; // Default
    if (userData.birthday) {
      const birthdayParts = userData.birthday.split('/');
      if (birthdayParts.length >= 2) {
        day = birthdayParts[1].padStart(2, '0'); // Ensure 2 digits
      }
    }

    // Extract phone number digits
    let phoneDigits = '2647'; // Default
    if (userData.phoneNumber) {
      // Remove all non-digit characters
      phoneDigits = userData.phoneNumber.replace(/\D/g, '');
    }

    // Try primary code (last 2 digits)
    let lastTwoDigits = phoneDigits.length >= 2 ? phoneDigits.slice(-2) : '47';
    let primaryCode = `${firstInitial}${lastInitial}${day}${lastTwoDigits}`;

    // Check if code already exists in registeredUsers
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const codeExists = registeredUsers.some((user: any) => 
        user.referralCode === primaryCode && user.email !== userData.email
      );

      // If code is taken, use alternative (2 digits before last 2)
      if (codeExists && phoneDigits.length >= 4) {
        const alternativeDigits = phoneDigits.slice(-4, -2); // 2 digits before last 2
        return `${firstInitial}${lastInitial}${day}${alternativeDigits}`;
      }
    } catch (e) {
      // If error checking, just return primary code
    }

    return primaryCode;
  };

  // Listen for cart count changes
  useEffect(() => {
    const handleCartCountUpdate = (event: CustomEvent) => {
      setCartCount(event.detail);
    };

    const handleStorageChange = () => {
      try {
        const newCartCount = parseInt(localStorage.getItem('cartCount') || '0', 10);
        setCartCount(newCartCount);
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
  }, []);

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
      localStorage.setItem('isSignedIn', 'false');
      localStorage.removeItem('currentUser');
      window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'false' }));
      setShowMobileMenu(false);
      navigate('/sign-in');
    } else {
      navigate('/sign-in');
    }
  };

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      {/* Marble Background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/marble-half.png')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed'
        }}
      />
      
      {/* Scrollable Content */}
      <div className="relative z-10">
        <div className="flex flex-col py-5 px-4" style={{ minWidth: '100%', maxWidth: 'none', overflow: 'visible' }}>
          {/* NAV BAR CONTAINER */}
          <div
            className="border-solid border-black flex justify-center items-center py-3 w-full mb-5 px-5 bg-white/60 backdrop-blur-sm relative"
            style={{ border: '1.3px solid black' }}
          >
            {/* Left side buttons */}
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
                    onClick={() => navigate(-1)} 
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
                </>
              )}
            </div>

            {/* Text in the middle */}
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
                    MEMBERSHIP
                  </span>
                </>
              )}
            </p>

            {/* Right side icons */}
            <div className="gap-5 flex absolute" style={{ right: '17px' }}>
              <div>
                <DynamicCartIcon count={cartCount} width={22} height={19} />
              </div>
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

          {/* CONTENT */}
          <div
            className="flex flex-col pb-4 mb-2 w-full"
            style={{ 
              minWidth: '100%', 
              maxWidth: 'none', 
              overflow: 'visible',
              minHeight: showMobileMenu ? '560px' : 'auto'
            }}
          >
            {showMobileMenu ? (
              /* MENU CONTENT */
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
                      borderBottom: mobileMenuActiveTab === 'SHOP' ? '2px solid #EB1C24' : 'none',
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
                      borderBottom: mobileMenuActiveTab === 'TOOLS' ? '2px solid #EB1C24' : 'none',
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
                      borderBottom: mobileMenuActiveTab === 'BRAND' ? '2px solid #EB1C24' : 'none',
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

                {/* Menu Items - Fixed height with scroll if needed */}
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
                      ['ABOUT US', 'CONTACT', 'CARE & STORAGE', 'BECOME A MEMBER', 'FAQ', 'PAYMENT + SHIPPING', 'REVIEWS', 'TERMS OF SERVICE'].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
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
                    ) : (
                      // SHOP tab with dropdown functionality
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
                                  // If UNITS is already expanded, navigate to shop/units page
                                  if (item.label === 'UNITS' && mobileMenuExpandedItems.includes(item.label)) {
                                    navigate('/shop/units');
                                  } else {
                                    // Otherwise, toggle expansion
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

                {/* Sign In/Out - Fixed at bottom */}
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

                {/* Social Media Icons - Fixed at bottom */}
                <div className="flex justify-center" style={{ marginBottom: '0' }}>
                  <div className="flex" style={{ gap: '19px' }}>
                    <img
                      src="/assets/instagram-icon.svg"
                      alt="Instagram"
                      style={{ width: '20px', height: '20px' }}
                    />
                    <img
                      src="/assets/twitter-icon.svg"
                      alt="Twitter"
                      style={{ width: '20px', height: '20px' }}
                    />
                    <img
                      src="/assets/facebook-icon.svg"
                      alt="Facebook"
                      style={{ width: '20px', height: '20px' }}
                    />
                  </div>
                </div>
                </div>
              </div>
            ) : (
              /* MEMBERSHIP CONTENT */
              <div
                className="border border-black bg-white/60 backdrop-blur-sm w-full transition-all duration-300 ease-out"
                style={{
                  borderWidth: '1.3px',
                  padding: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.6)'
                }}
              >
                {/* REWARDS PROGRAM Section */}
                <div style={{ marginBottom: '32px' }}>
                  <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '12px' }}>
                    <h2
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        color: '#EB1C24',
                        fontSize: '12px',
                        fontWeight: '500',
                        margin: '0',
                        textTransform: 'uppercase'
                      }}
                    >
                      REWARDS PROGRAM
                    </h2>
                    <p
                      style={{
                        fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                        color: '#000000',
                        fontSize: '12px',
                        margin: '0',
                        textTransform: 'uppercase'
                      }}
                    >
                      {generateReferralCode()}
                    </p>
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <p
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        color: '#000000',
                        fontSize: '11px',
                        margin: '0 0 8px 0',
                        textTransform: 'uppercase',
                        fontWeight: '500'
                      }}
                    >
                      BASIC MEMBERSHIP
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            fontFamily: '"Futura PT Book"',
                            color: '#000000',
                            fontSize: '10px',
                            margin: '0 0 4px 0',
                            textTransform: 'uppercase'
                          }}
                        >
                          CURRENT TIER: <span style={{ color: '#EB1C24' }}>SILVER</span>
                        </p>
                        <p
                          style={{
                            fontFamily: '"Futura PT Book"',
                            color: '#000000',
                            fontSize: '10px',
                            margin: '0 0 4px 0',
                            textTransform: 'uppercase'
                          }}
                        >
                          BENEFITS INCLUDE: WELCOME DISCOUNT, BIRTHDAY GIFT
                        </p>
                        <p
                          style={{
                            fontFamily: '"Futura PT Book"',
                            color: '#EB1C24',
                            fontSize: '10px',
                            margin: '0 0 8px 0',
                            textTransform: 'uppercase',
                            cursor: 'pointer'
                          }}
                          onClick={() => {/* Navigate to rewards page */}}
                        >
                          VIEW REWARDS
                        </p>
                        <p
                          style={{
                            fontFamily: '"Futura PT Book"',
                            color: '#000000',
                            fontSize: '10px',
                            margin: '0',
                            textTransform: 'uppercase'
                          }}
                        >
                          NEXT TIER: <span style={{ color: '#EB1C24' }}>RED</span>
                        </p>
                        <p
                          style={{
                            fontFamily: '"Futura PT Book"',
                            color: '#000000',
                            fontSize: '10px',
                            margin: '4px 0 0 0',
                            textTransform: 'uppercase'
                          }}
                        >
                          EARN 2,500 MORE POINTS TO REACH
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p
                          style={{
                            fontFamily: '"Futura PT Medium"',
                            color: '#000000',
                            fontSize: '14px',
                            margin: '0',
                            fontWeight: '500'
                          }}
                        >
                          200 PTS
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BECOME AN AFFILIATE Section */}
                <div style={{ marginBottom: '32px' }}>
                  <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '16px' }}>
                    <h2
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        color: '#EB1C24',
                        fontSize: '12px',
                        fontWeight: '500',
                        margin: '0',
                        textTransform: 'uppercase'
                      }}
                    >
                      BECOME AN AFFILIATE
                    </h2>
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <p
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        color: '#EB1C24',
                        fontSize: '10px',
                        margin: '0 0 8px 0',
                        textTransform: 'uppercase',
                        fontWeight: '500'
                      }}
                    >
                      PHOTO + VIDEO TAG:
                    </p>
                    <p
                      style={{
                        fontFamily: '"Futura PT Book"',
                        color: '#000000',
                        fontSize: '10px',
                        margin: '0 0 12px 0',
                        textTransform: 'uppercase'
                      }}
                    >
                      RECEIVE <span style={{ color: '#EB1C24' }}>200 PTS</span> PER PRODUCT WHEN YOU TAG US ON SOCIALS*
                    </p>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <p
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        color: '#EB1C24',
                        fontSize: '10px',
                        margin: '0 0 8px 0',
                        textTransform: 'uppercase',
                        fontWeight: '500'
                      }}
                    >
                      CONTENT REVIEW:
                    </p>
                    <p
                      style={{
                        fontFamily: '"Futura PT Book"',
                        color: '#000000',
                        fontSize: '10px',
                        margin: '0 0 12px 0',
                        textTransform: 'uppercase'
                      }}
                    >
                      RECEIVE <span style={{ color: '#EB1C24' }}>150 PTS</span> PER PRODUCT WHEN YOU SUBMIT A CONTENT REVIEW
                    </p>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <p
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        color: '#EB1C24',
                        fontSize: '10px',
                        margin: '0 0 8px 0',
                        textTransform: 'uppercase',
                        fontWeight: '500'
                      }}
                    >
                      REFERRALS:
                    </p>
                    <p
                      style={{
                        fontFamily: '"Futura PT Book"',
                        color: '#000000',
                        fontSize: '10px',
                        margin: '0 0 12px 0',
                        textTransform: 'uppercase'
                      }}
                    >
                      RECEIVE <span style={{ color: '#EB1C24' }}>100 PTS</span> EVERY TIME YOU REFER SOMEONE WITH YOUR 5% OFF CODE
                    </p>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <p
                      style={{
                        fontFamily: '"Futura PT Book"',
                        color: '#000000',
                        fontSize: '9px',
                        margin: '0 0 4px 0',
                        fontStyle: 'italic'
                      }}
                    >
                      *TAG INCLUDES CONTENT VIA TWITTER, FACEBOOK, IG, TIKTOK + YOUTUBE, PER APPROVAL
                    </p>
                    <p
                      style={{
                        fontFamily: '"Futura PT Book"',
                        color: '#000000',
                        fontSize: '9px',
                        margin: '0 0 12px 0',
                        fontStyle: 'italic'
                      }}
                    >
                      *VIDEO MUST BE AT LEAST 10-60 SECONDS IN DURATION, PER APPROVAL
                    </p>
                  </div>

                  <p
                    style={{
                      fontFamily: '"Futura PT Book"',
                      color: '#000000',
                      fontSize: '9px',
                      margin: '0',
                      textTransform: 'uppercase'
                    }}
                  >
                    SUBMIT ALL CONTENT VIA THE AFFILIATE TAB LOCATED UNDER YOUR ACCOUNT. YOU CAN SUBMIT AS MUCH CONTENT AS YOU WANT, WHICH MAY OR MAY NOT BE FEATURED. YOU WILL ONLY RECEIVE POINTS ONCE PER PRODUCT, FOR PHOTOS OR VIDEOS ON EACH PLATFORM.
                  </p>
                </div>

                {/* UPGRADE YOUR BASIC MEMBERSHIP Section */}
                <div style={{ marginBottom: '24px' }}>
                  <p
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      color: '#EB1C24',
                      fontSize: '10px',
                      margin: '0 0 8px 0',
                      textTransform: 'uppercase',
                      fontWeight: '500'
                    }}
                  >
                    UPGRADE YOUR BASIC MEMBERSHIP TO
                  </p>
                  <p
                    style={{
                      fontFamily: '"Futura PT Book"',
                      color: '#000000',
                      fontSize: '10px',
                      margin: '0 0 20px 0',
                      textTransform: 'uppercase'
                    }}
                  >
                    UNLOCK THE FOLLOWING FEATURES PLUS MORE:
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Feature 1 */}
                    <div>
                      <h3
                        style={{
                          fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                          color: '#000000',
                          fontSize: '16px',
                          margin: '0 0 4px 0',
                          textTransform: 'uppercase'
                        }}
                      >
                        UNLIMITED ACCESS TO VIRTUAL 3D WIG GENERATOR
                      </h3>
                      <p
                        style={{
                          fontFamily: '"Futura PT Book"',
                          color: '#000000',
                          fontSize: '10px',
                          margin: '0',
                          textTransform: 'uppercase'
                        }}
                      >
                        ADDITIONAL, MORE EXTENSIVE CUSTOMIZATION OPTIONS
                      </p>
                    </div>

                    {/* Feature 2 */}
                    <div>
                      <h3
                        style={{
                          fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                          color: '#000000',
                          fontSize: '16px',
                          margin: '0 0 4px 0',
                          textTransform: 'uppercase'
                        }}
                      >
                        ENTRY PASS TO MEMBERS ONLY LOUNGE
                      </h3>
                      <p
                        style={{
                          fontFamily: '"Futura PT Book"',
                          color: '#000000',
                          fontSize: '10px',
                          margin: '0',
                          textTransform: 'uppercase'
                        }}
                      >
                        EARLY ACCESS TO SALES, NEW DROPS, RESTOCKS + BRAND RELATED CONTENT
                      </p>
                    </div>

                    {/* Feature 3 */}
                    <div>
                      <h3
                        style={{
                          fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                          color: '#000000',
                          fontSize: '16px',
                          margin: '0 0 4px 0',
                          textTransform: 'uppercase'
                        }}
                      >
                        FAST TRACK CUSTOMER SUPPORT
                      </h3>
                      <p
                        style={{
                          fontFamily: '"Futura PT Book"',
                          color: '#000000',
                          fontSize: '10px',
                          margin: '0',
                          textTransform: 'uppercase'
                        }}
                      >
                        PRIORITIZED CUSTOMER SUPPORT WITH A SIGNIFICANTLY REDUCED RESPONSE TIME
                      </p>
                    </div>

                    {/* Feature 4 */}
                    <div>
                      <h3
                        style={{
                          fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                          color: '#000000',
                          fontSize: '16px',
                          margin: '0 0 4px 0',
                          textTransform: 'uppercase'
                        }}
                      >
                        PRIORITY BOOKING + ORDER PROCESSING
                      </h3>
                      <p
                        style={{
                          fontFamily: '"Futura PT Book"',
                          color: '#000000',
                          fontSize: '10px',
                          margin: '0',
                          textTransform: 'uppercase'
                        }}
                      >
                        OPTION TO BOOK APPOINTMENTS IN ADVANCE, YOUR CUSTOM ORDERS GET HANDLED FIRST
                      </p>
                    </div>

                    {/* Feature 5 */}
                    <div>
                      <h3
                        style={{
                          fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                          color: '#000000',
                          fontSize: '16px',
                          margin: '0 0 4px 0',
                          textTransform: 'uppercase'
                        }}
                      >
                        SPECIAL GIFT WITH PURCHASE + FREE GIVEAWAYS
                      </h3>
                      <p
                        style={{
                          fontFamily: '"Futura PT Book"',
                          color: '#000000',
                          fontSize: '10px',
                          margin: '0',
                          textTransform: 'uppercase'
                        }}
                      >
                        ELIGIBLE FOR A CHANCE TO WIN RANDOM DISCOUNTS, STYLING VOUCHERS + EXCLUSIVE ITEMS
                      </p>
                    </div>

                    {/* Feature 6 */}
                    <div>
                      <h3
                        style={{
                          fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                          color: '#000000',
                          fontSize: '16px',
                          margin: '0 0 4px 0',
                          textTransform: 'uppercase'
                        }}
                      >
                        REDUCED SHIPPING FEE
                      </h3>
                      <p
                        style={{
                          fontFamily: '"Futura PT Book"',
                          color: '#000000',
                          fontSize: '10px',
                          margin: '0',
                          textTransform: 'uppercase'
                        }}
                      >
                        DISCOUNT APPLIED AUTOMATICALLY TO DOMESTIC + INTERNATIONAL ORDERS
                      </p>
                    </div>

                    {/* Feature 7 */}
                    <div>
                      <h3
                        style={{
                          fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                          color: '#000000',
                          fontSize: '16px',
                          margin: '0 0 4px 0',
                          textTransform: 'uppercase'
                        }}
                      >
                        DOUBLE YOUR POINTS
                      </h3>
                      <p
                        style={{
                          fontFamily: '"Futura PT Book"',
                          color: '#000000',
                          fontSize: '10px',
                          margin: '0',
                          textTransform: 'uppercase'
                        }}
                      >
                        EARN 2X LOYALTY POINTS FOR EACH ORDER, UNLOCKING DISCOUNTS & REWARDS FASTER
                      </p>
                    </div>
                  </div>
                </div>

                {/* UPGRADE SUBSCRIPTION Button */}
                <button
                  onClick={() => {/* Handle upgrade subscription */}}
                  className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                  style={{ 
                    borderWidth: '1.3px', 
                    color: '#EB1C24',
                    fontFamily: '"Futura PT Medium"',
                    backgroundColor: '#FFFFFF'
                  }}
                  type="button"
                >
                  UPGRADE SUBSCRIPTION
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MembershipPage;

