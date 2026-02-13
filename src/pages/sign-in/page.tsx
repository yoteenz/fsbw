import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DynamicCartIcon from '../../components/DynamicCartIcon';
import ConfirmationModal from '../../components/ConfirmationModal';
import BrandMenuLinks from '../../components/BrandMenuLinks';

function SignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Sign In form state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Validation modals
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  // Create Account form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signUpAttempted, setSignUpAttempted] = useState(false);
  const [signInPasswordFocused, setSignInPasswordFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [youtube, setYoutube] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [twitter, setTwitter] = useState('');
  const [facebookFocused, setFacebookFocused] = useState(false);
  const [instagramFocused, setInstagramFocused] = useState(false);
  const [youtubeFocused, setYoutubeFocused] = useState(false);
  const [tiktokFocused, setTiktokFocused] = useState(false);
  const [twitterFocused, setTwitterFocused] = useState(false);

  // Format birthday as MM/DD/YYYY
  const formatBirthday = (value: string): string => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Limit to 8 digits (MMDDYYYY)
    const limited = numbers.slice(0, 8);
    
    // Format as MM/DD/YYYY
    if (limited.length <= 2) {
      return limited;
    } else if (limited.length <= 4) {
      return `${limited.slice(0, 2)}/${limited.slice(2)}`;
    } else {
      return `${limited.slice(0, 2)}/${limited.slice(2, 4)}/${limited.slice(4)}`;
    }
  };

  // Format phone number as (XXX) XXX-XXXX
  const formatPhoneNumber = (value: string): string => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    const limited = numbers.slice(0, 10);
    
    // Format as (XXX) XXX-XXXX
    if (limited.length === 0) {
      return '';
    } else if (limited.length <= 3) {
      return `(${limited}`;
    } else if (limited.length <= 6) {
      return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
    } else {
      return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
    }
  };

  // Password validation checks
  const hasUppercase = (pwd: string) => /[A-Z]/.test(pwd);
  const hasLowercase = (pwd: string) => /[a-z]/.test(pwd);
  const hasNumber = (pwd: string) => /[0-9]/.test(pwd);

  // Format social media usernames with @ prefix only
  const formatSocialUsername = (value: string): string => {
    // If empty, return empty string
    if (!value) return '';
    
    // Remove any existing @ symbols and platform names, then add @ prefix
    let cleaned = value.replace(/@/g, '');
    // Remove common platform names if they appear at the start
    cleaned = cleaned.replace(/^(facebook|instagram|youtube|tiktok|twitter)/i, '');
    
    return '@' + cleaned;
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

  // Update active tab based on current route
  useEffect(() => {
    const pathname = location.pathname;
    if (pathname.includes('/tools') || pathname === '/tools/gift-card') {
      setMobileMenuActiveTab('TOOLS');
    } else if (pathname.includes('/brand') || pathname.includes('/about') || pathname.includes('/contact') || pathname.includes('/faq') || pathname.includes('/reviews') || pathname.includes('/terms')) {
      setMobileMenuActiveTab('BRAND');
    } else {
      setMobileMenuActiveTab('SHOP');
    }
  }, [location.pathname]);

  // Ensure active tab is set correctly when menu opens
  useEffect(() => {
    if (showMobileMenu) {
      const pathname = location.pathname;
      if (pathname.includes('/tools') || pathname === '/tools/gift-card') {
        setMobileMenuActiveTab('TOOLS');
      } else if (pathname.includes('/brand') || pathname.includes('/about') || pathname.includes('/contact') || pathname.includes('/faq') || pathname.includes('/reviews') || pathname.includes('/terms')) {
        setMobileMenuActiveTab('BRAND');
      } else {
        setMobileMenuActiveTab('SHOP');
      }
    }
  }, [showMobileMenu, location.pathname]);

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
    // Already on sign-in page, do nothing (or could scroll to form)
    // The sign-in button on the page will handle authentication
  };

  return (
    <>
      <style>{`
        input::placeholder,
        textarea::placeholder {
          font-family: "Futura PT Demi", "Futura PT Medium", "Futura PT Book", "Covered By Your Grace", "Covered By Your Grace Preload" !important;
          font-weight: 500;
          color: #808080 !important;
        }
        input,
        textarea {
          font-family: "Futura PT Demi", "Futura PT Medium", "Futura PT Book", "Covered By Your Grace", "Covered By Your Grace Preload" !important;
          font-weight: 500 !important;
          color: #808080 !important;
          text-transform: uppercase !important;
          background-color: #FFFFFF !important;
        }
        input[type="password"],
        input.password-field {
          text-transform: none !important;
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #FFFFFF inset !important;
          -webkit-text-fill-color: #808080 !important;
          box-shadow: 0 0 0 30px #FFFFFF inset !important;
          background-color: #FFFFFF !important;
        }
      `}</style>
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
                    onClick={() => navigate('/build-a-wig')} 
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

            {/* Text in the middle */}
            <p className="text-sm" style={{ fontFamily: '"Futura PT Book"', transform: 'translateY(1px)' }}>
              {showMobileMenu ? (
                <>
                  <span 
                    style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }}
                    onClick={() => {
                      // Check if user is premium member
                      try {
                        const isSignedIn = localStorage.getItem('isSignedIn') === 'true';
                        if (isSignedIn) {
                          const currentUser = localStorage.getItem('currentUser');
                          if (currentUser) {
                            const user = JSON.parse(currentUser);
                            const isPremium = user?.membershipType === 'PREMIUM' || user?.membershipType === 'Premium';
                            if (isPremium) {
                              navigate('/'); // Lobby for premium members
                            } else {
                              navigate('/home/shop'); // Shop for standard/non-members
                            }
                          } else {
                            navigate('/home/shop'); // Default to shop if not signed in
                          }
                        } else {
                          navigate('/home/shop'); // Default to shop if not signed in
                        }
                      } catch (e) {
                        navigate('/home/shop'); // Default to shop on error
                      }
                    }}
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
                    onClick={() => navigate('/build-a-wig')}
                  >
                    ACCOUNT &gt;
                  </span>{' '}
                  <span
                    style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
                  >
                    SIGN IN
                  </span>
                </>
              )}
            </p>

            {/* Right side icons */}
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

          {showMobileMenu ? (
            /* MENU CONTENT */
            <div
              className="menu-toggle-card border border-black flex flex-col pt-6 pb-4 px-5 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out"
              style={{ 
                borderWidth: '1.3px', 
                minWidth: '100%', 
                maxWidth: 'none', 
                overflow: 'visible',
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                minHeight: 'calc(100dvh - 80px)',
                height: 'calc(100dvh - 80px)'
              }}
            >
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', paddingTop: '20px', flex: 1, minHeight: 0, position: 'relative' }}>
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
                      <BrandMenuLinks onClose={() => setShowMobileMenu(false)} />
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
            <>
              {/* SIGN IN CONTENT */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0' }}>
              {/* SIGN IN TO YOUR ACCOUNT CARD */}
              <div
                className="border border-black flex flex-col p-4 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out"
                style={{ 
                  borderWidth: '1.3px', 
                  minWidth: '100%', 
                  maxWidth: 'none', 
                  overflow: 'visible',
                  backgroundColor: 'rgba(255, 255, 255, 0.6)'
                }}
              >
                  <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200">
                    <button
                      className="text-red-500 font-bold text-lg tracking-wider truncate hover:text-red-600 transition-colors text-left uppercase"
                      style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px', fontWeight: '500' }}
                    >
                      SIGN IN TO YOUR ACCOUNT
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                    {/* Email Input */}
                    <div style={{ marginTop: '8px' }}>
                      <label
                        style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          display: 'block',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                        EMAIL ADDRESS<span style={{ color: '#EB1C24', fontWeight: 'normal' }}>*</span>
                      </label>
                      <input
                        type="email"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          boxSizing: 'border-box',
                          borderRadius: '0',
                          outline: 'none'
                        }}
                      />
                    </div>

                    {/* Password Input */}
                    <div>
                      <label
                        style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          display: 'block',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                        PASSWORD<span style={{ color: '#EB1C24', fontWeight: 'normal' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showSignInPassword ? "text" : "password"}
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          onFocus={() => setSignInPasswordFocused(true)}
                          onBlur={() => setSignInPasswordFocused(false)}
                          className="password-field"
                          style={{
                            width: '100%',
                            height: '36px',
                            padding: '8px',
                            paddingRight: signInPasswordFocused ? '8px' : '120px',
                            border: '1.3px solid #000000',
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            boxSizing: 'border-box',
                            borderRadius: '0',
                            outline: 'none',
                            textTransform: 'none'
                          }}
                        />
                        {!signInPasswordFocused && signInPassword && (
                          <span
                            onClick={() => setShowSignInPassword(!showSignInPassword)}
                            style={{
                              position: 'absolute',
                              right: '8px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              fontFamily: '"Futura PT Book"',
                              fontSize: '9px',
                              color: '#EB1C24',
                              cursor: 'pointer',
                              textTransform: 'uppercase',
                              userSelect: 'none'
                            }}
                          >
                            {showSignInPassword ? 'HIDE PASSWORD' : 'SHOW PASSWORD'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Remember Me and Forgot Password */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '3px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div
                          onClick={() => setRememberMe(!rememberMe)}
                          style={{
                            width: '12.8px',
                            height: '12.8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1.3px solid #000000',
                            backgroundColor: 'transparent',
                            position: 'relative'
                          }}
                        >
                          {rememberMe && (
                            <img 
                              src="/assets/checkbox.svg" 
                              alt="checked" 
                              style={{ width: '12.8px', height: '12.8px', position: 'absolute' }}
                            />
                          )}
                        </div>
                        <label
                          onClick={() => setRememberMe(!rememberMe)}
                          style={{
                            fontFamily: '"Futura PT Book"',
                            fontSize: '10px',
                            color: '#EB1C24',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            margin: '0'
                          }}
                        >
                          REMEMBER ME
                        </label>
                      </div>
                      <button
                        type="button"
                        style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#EB1C24',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0',
                          textTransform: 'uppercase'
                        }}
                      >
                        FORGOT PASSWORD?
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            {/* SIGN IN BUTTON - Outside card */}
            <div className="px-0 md:px-0" style={{ marginTop: '2px', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (!signInEmail.trim()) {
                      setValidationMessage('EMAIL ADDRESS IS REQUIRED.');
                      setShowValidationModal(true);
                      return;
                    }
                    if (!signInPassword.trim()) {
                      setValidationMessage('PASSWORD IS REQUIRED.');
                      setShowValidationModal(true);
                      return;
                    }
                    // Validate credentials against registered users
                    try {
                      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                      const user = registeredUsers.find((u: any) => 
                        u.email.toLowerCase() === signInEmail.toLowerCase().trim() && 
                        u.password === signInPassword.trim()
                      );
                      
                      if (user) {
                        // Authentication successful
                        // Create a copy to avoid mutating the original
                        const userToSet = { ...user };
                        
                        // Check if there's an existing currentUser with updated membership type
                        const existingCurrentUser = localStorage.getItem('currentUser');
                        if (existingCurrentUser) {
                          try {
                            const existingUser = JSON.parse(existingCurrentUser);
                            // If existing user has premium membership, preserve it
                            if (existingUser.membershipType === 'PREMIUM' && user.email?.toLowerCase() === existingUser.email?.toLowerCase()) {
                              userToSet.membershipType = 'PREMIUM';
                              // Also update in registeredUsers to persist
                              const userIndex = registeredUsers.findIndex((u: any) => u.email?.toLowerCase() === user.email?.toLowerCase());
                              if (userIndex !== -1) {
                                registeredUsers[userIndex].membershipType = 'PREMIUM';
                                localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
                              }
                            }
                          } catch (e) {
                            // If parsing fails, just use the user from registeredUsers
                          }
                        }
                        localStorage.setItem('currentUser', JSON.stringify(userToSet));
                        localStorage.setItem('isSignedIn', 'true');
                        setIsSignedIn(true);
                        
                        // Dispatch event to update other pages
                        window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
                        
                        // Clear form
                        setSignInEmail('');
                        setSignInPassword('');
                        
                        // Determine where to route based on URL parameter or default to account
                        const searchParams = new URLSearchParams(location.search);
                        const returnTo = searchParams.get('returnTo');
                        
                        if (returnTo === 'checkout') {
                          navigate('/checkout');
                        } else {
                          // Default to account page (menu)
                          navigate('/account');
                        }
                      } else {
                        // Invalid credentials
                        setValidationMessage('INVALID EMAIL OR PASSWORD.');
                        setShowValidationModal(true);
                      }
                    } catch (error) {
                      console.error('Error signing in:', error);
                      setValidationMessage('AN ERROR OCCURRED. PLEASE TRY AGAIN.');
                      setShowValidationModal(true);
                    }
                  }}
                  className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                  style={{
                    borderWidth: '1.3px', 
                    color: '#EB1C24',
                    fontFamily: '"Futura PT Medium"',
                    backgroundColor: '#FFFFFF',
                    textTransform: 'uppercase'
                  }}
                >
                  SIGN IN
                </button>
              </div>

            {/* CREATE AN ACCOUNT CARD */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0' }}>
                <div
                  className="border border-black flex flex-col p-4 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out"
                  style={{ 
                    borderWidth: '1.3px', 
                    minWidth: '100%', 
                    maxWidth: 'none', 
                    overflow: 'visible',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)'
                  }}
                >
                  <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200">
                    <button
                      className="text-red-500 font-bold text-lg tracking-wider truncate hover:text-red-600 transition-colors text-left uppercase"
                      style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px', fontWeight: '500' }}
                    >
                      CREATE AN ACCOUNT
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                    {/* Form Fields */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                    <div>
                      <label
                        style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          display: 'block',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                        FIRST NAME<span style={{ color: '#EB1C24', fontWeight: 'normal' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          boxSizing: 'border-box',
                          borderRadius: '0',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          display: 'block',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                        LAST NAME<span style={{ color: '#EB1C24', fontWeight: 'normal' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          boxSizing: 'border-box',
                          borderRadius: '0',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          display: 'block',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                        DATE OF BIRTH<span style={{ color: '#EB1C24', fontWeight: 'normal' }}>*</span>
                      </label>
                      <input
                        type="tel"
                        value={birthday}
                        onChange={(e) => setBirthday(formatBirthday(e.target.value))}
                        maxLength={10}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          boxSizing: 'border-box',
                          borderRadius: '0',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          display: 'block',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                        PHONE NUMBER<span style={{ color: '#EB1C24', fontWeight: 'normal' }}>*</span>
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                        maxLength={14}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          boxSizing: 'border-box',
                          borderRadius: '0',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          display: 'block',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                        EMAIL ADDRESS<span style={{ color: '#EB1C24', fontWeight: 'normal' }}>*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailError(''); // Clear error when user types
                        }}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          boxSizing: 'border-box',
                          borderRadius: '0',
                          outline: 'none'
                        }}
                      />
                      {emailError && (
                        <p
                          style={{
                            fontFamily: '"Futura PT Medium"',
                            fontSize: '9px',
                            color: '#EB1C24',
                            margin: '4px 0 0 3px',
                            textTransform: 'uppercase'
                          }}
                        >
                          {emailError}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          display: 'block',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                        PASSWORD<span style={{ color: '#EB1C24', fontWeight: 'normal' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onFocus={() => setPasswordFocused(true)}
                          onBlur={() => setPasswordFocused(false)}
                          className="password-field"
                          style={{
                            width: '100%',
                            height: '36px',
                            padding: '8px',
                            paddingRight: passwordFocused ? '8px' : '120px',
                            border: '1.3px solid #000000',
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            boxSizing: 'border-box',
                            borderRadius: '0',
                            outline: 'none',
                            textTransform: 'none'
                          }}
                        />
                        {!passwordFocused && password && (
                          <span
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                              position: 'absolute',
                              right: '8px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              fontFamily: '"Futura PT Book"',
                              fontSize: '9px',
                              color: '#EB1C24',
                              cursor: 'pointer',
                              textTransform: 'uppercase',
                              userSelect: 'none'
                            }}
                          >
                            {showPassword ? 'HIDE PASSWORD' : 'SHOW PASSWORD'}
                          </span>
                        )}
                      </div>
                      {/* Password Requirements - Only show when sign up is attempted and password doesn't meet requirements */}
                      {signUpAttempted && (
                      <div style={{ marginTop: '4px' }}>
                        {!hasUppercase(password) && (
                          <p
                            style={{
                              fontFamily: '"Futura PT Medium"',
                              fontSize: '8px',
                              color: '#EB1C24',
                              margin: '0 0 2px 3px',
                              textTransform: 'uppercase'
                            }}
                          >
                            PASSWORD MUST CONTAIN UPPERCASE LETTERS.
                          </p>
                        )}
                        {!hasLowercase(password) && (
                          <p
                            style={{
                              fontFamily: '"Futura PT Medium"',
                              fontSize: '8px',
                              color: '#EB1C24',
                              margin: '0 0 2px 3px',
                              textTransform: 'uppercase'
                            }}
                          >
                            PASSWORD MUST CONTAIN LOWERCASE LETTERS.
                          </p>
                        )}
                        {!hasNumber(password) && (
                          <p
                            style={{
                              fontFamily: '"Futura PT Medium"',
                              fontSize: '8px',
                              color: '#EB1C24',
                              margin: '0 0 0 3px',
                              textTransform: 'uppercase'
                            }}
                          >
                            PASSWORD MUST CONTAIN NUMBERS.
                          </p>
                        )}
                      </div>
                      )}
                    </div>
                    <div>
                      <label
                        style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          display: 'block',
                          marginBottom: '4px',
                          textTransform: 'uppercase'
                        }}
                      >
                        CONFIRM PASSWORD<span style={{ color: '#EB1C24', fontWeight: 'normal' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onFocus={() => setConfirmPasswordFocused(true)}
                          onBlur={() => setConfirmPasswordFocused(false)}
                          className="password-field"
                          style={{
                            width: '100%',
                            height: '36px',
                            padding: '8px',
                            paddingRight: confirmPasswordFocused ? '8px' : '120px',
                            border: '1.3px solid #000000',
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            boxSizing: 'border-box',
                            borderRadius: '0',
                            outline: 'none',
                            textTransform: 'none'
                          }}
                        />
                        {!confirmPasswordFocused && confirmPassword && (
                          <span
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={{
                              position: 'absolute',
                              right: '8px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              fontFamily: '"Futura PT Book"',
                              fontSize: '9px',
                              color: '#EB1C24',
                              cursor: 'pointer',
                              textTransform: 'uppercase',
                              userSelect: 'none'
                            }}
                          >
                            {showConfirmPassword ? 'HIDE PASSWORD' : 'SHOW PASSWORD'}
                          </span>
                        )}
                      </div>
                      {/* Confirm Password Requirements - Only show when sign up is attempted and password doesn't meet requirements */}
                      {signUpAttempted && (
                      <div style={{ marginTop: '4px' }}>
                        {!hasUppercase(confirmPassword) && (
                          <p
                            style={{
                              fontFamily: '"Futura PT Medium"',
                              fontSize: '8px',
                              color: '#EB1C24',
                              margin: '0 0 2px 3px',
                              textTransform: 'uppercase'
                            }}
                          >
                            PASSWORD MUST CONTAIN UPPERCASE LETTERS.
                          </p>
                        )}
                        {!hasLowercase(confirmPassword) && (
                          <p
                            style={{
                              fontFamily: '"Futura PT Medium"',
                              fontSize: '8px',
                              color: '#EB1C24',
                              margin: '0 0 2px 3px',
                              textTransform: 'uppercase'
                            }}
                          >
                            PASSWORD MUST CONTAIN LOWERCASE LETTERS.
                          </p>
                        )}
                        {!hasNumber(confirmPassword) && (
                          <p
                            style={{
                              fontFamily: '"Futura PT Medium"',
                              fontSize: '8px',
                              color: '#EB1C24',
                              margin: '0 0 0 3px',
                              textTransform: 'uppercase'
                            }}
                          >
                            PASSWORD MUST CONTAIN NUMBERS.
                          </p>
                        )}
                      </div>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder={facebookFocused || facebook ? "@USERNAME" : "@FACEBOOK"}
                      value={facebook}
                      onChange={(e) => {
                        const formatted = formatSocialUsername(e.target.value);
                        setFacebook(formatted);
                      }}
                      onFocus={() => setFacebookFocused(true)}
                      onBlur={() => {
                        setFacebookFocused(false);
                        if (!facebook) {
                          setFacebook('');
                        }
                      }}
                      style={{
                        width: '100%',
                        height: '36px',
                        padding: '8px',
                        border: '1.3px solid #000000',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '11px',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        boxSizing: 'border-box',
                        borderRadius: '0',
                        outline: 'none',
                        marginTop: '16px'
                      }}
                    />
                    <input
                      type="text"
                      placeholder={instagramFocused || instagram ? "@USERNAME" : "@INSTAGRAM"}
                      value={instagram}
                      onChange={(e) => {
                        const formatted = formatSocialUsername(e.target.value);
                        setInstagram(formatted);
                      }}
                      onFocus={() => setInstagramFocused(true)}
                      onBlur={() => {
                        setInstagramFocused(false);
                        if (!instagram) {
                          setInstagram('');
                        }
                      }}
                      style={{
                        width: '100%',
                        height: '36px',
                        padding: '8px',
                        border: '1.3px solid #000000',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '11px',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        boxSizing: 'border-box',
                        borderRadius: '0',
                        outline: 'none'
                      }}
                    />
                    <input
                      type="text"
                      placeholder={youtubeFocused || youtube ? "@USERNAME" : "@YOUTUBE"}
                      value={youtube}
                      onChange={(e) => {
                        const formatted = formatSocialUsername(e.target.value);
                        setYoutube(formatted);
                      }}
                      onFocus={() => setYoutubeFocused(true)}
                      onBlur={() => {
                        setYoutubeFocused(false);
                        if (!youtube) {
                          setYoutube('');
                        }
                      }}
                      style={{
                        width: '100%',
                        height: '36px',
                        padding: '8px',
                        border: '1.3px solid #000000',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '11px',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        boxSizing: 'border-box',
                        borderRadius: '0',
                        outline: 'none'
                      }}
                    />
                    <input
                      type="text"
                      placeholder={tiktokFocused || tiktok ? "@USERNAME" : "@TIKTOK"}
                      value={tiktok}
                      onChange={(e) => {
                        const formatted = formatSocialUsername(e.target.value);
                        setTiktok(formatted);
                      }}
                      onFocus={() => setTiktokFocused(true)}
                      onBlur={() => {
                        setTiktokFocused(false);
                        if (!tiktok) {
                          setTiktok('');
                        }
                      }}
                      style={{
                        width: '100%',
                        height: '36px',
                        padding: '8px',
                        border: '1.3px solid #000000',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '11px',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        boxSizing: 'border-box',
                        borderRadius: '0',
                        outline: 'none'
                      }}
                    />
                    <input
                      type="text"
                      placeholder={twitterFocused || twitter ? "@USERNAME" : "@TWITTER"}
                      value={twitter}
                      onChange={(e) => {
                        const formatted = formatSocialUsername(e.target.value);
                        setTwitter(formatted);
                      }}
                      onFocus={() => setTwitterFocused(true)}
                      onBlur={() => {
                        setTwitterFocused(false);
                        if (!twitter) {
                          setTwitter('');
                        }
                      }}
                      style={{
                        width: '100%',
                        height: '36px',
                        padding: '8px',
                        border: '1.3px solid #000000',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '11px',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        boxSizing: 'border-box',
                        borderRadius: '0',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Social Sign Up Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                    <button
                      type="button"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1.3px solid #000',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '12px',
                        backgroundColor: 'transparent',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        justifyContent: 'flex-start'
                      }}
                    >
                      <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '16px', fontWeight: '500' }}>f</span>
                      <span>SIGN UP WITH FACEBOOK ACCOUNT</span>
                    </button>
                    <button
                      type="button"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1.3px solid #000',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '12px',
                        backgroundColor: 'transparent',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        justifyContent: 'flex-start'
                      }}
                    >
                      <span style={{ fontFamily: '"Futura PT Medium"', fontSize: '16px', fontWeight: '500' }}>G</span>
                      <span>SIGN UP WITH GOOGLE ACCOUNT</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SIGN UP BUTTON - Outside card */}
            <div className="px-0 md:px-0" style={{ marginTop: '2px', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      setSignUpAttempted(true);
                      
                      if (!firstName.trim()) {
                        setValidationMessage('FIRST NAME IS REQUIRED.');
                        setShowValidationModal(true);
                        return;
                      }
                      if (!lastName.trim()) {
                        setValidationMessage('LAST NAME IS REQUIRED.');
                        setShowValidationModal(true);
                        return;
                      }
                      if (!birthday.trim()) {
                        setValidationMessage('BIRTHDAY IS REQUIRED.');
                        setShowValidationModal(true);
                        return;
                      }
                      if (!phoneNumber.trim()) {
                        setValidationMessage('PHONE NUMBER IS REQUIRED.');
                        setShowValidationModal(true);
                        return;
                      }
                      if (!email.trim()) {
                        setValidationMessage('EMAIL ADDRESS IS REQUIRED.');
                        setShowValidationModal(true);
                        return;
                      }
                      if (!password.trim()) {
                        setValidationMessage('PASSWORD IS REQUIRED.');
                        setShowValidationModal(true);
                        return;
                      }
                      if (!confirmPassword.trim()) {
                        setValidationMessage('CONFIRM PASSWORD IS REQUIRED.');
                        setShowValidationModal(true);
                        return;
                      }
                      // Check password requirements
                      if (!hasUppercase(password) || !hasLowercase(password) || !hasNumber(password)) {
                        // Error messages will show below the password fields
                        return;
                      }
                      if (!hasUppercase(confirmPassword) || !hasLowercase(confirmPassword) || !hasNumber(confirmPassword)) {
                        // Error messages will show below the confirm password fields
                        return;
                      }
                      if (password !== confirmPassword) {
                        setValidationMessage('PASSWORDS DO NOT MATCH.');
                        setShowValidationModal(true);
                        return;
                      }
                      
                      // Check if email already exists
                      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                      const emailExists = existingUsers.some((user: any) => user.email.toLowerCase() === email.toLowerCase().trim());
                      
                      if (emailExists) {
                        setEmailError('THIS EMAIL ALREADY EXISTS.');
                        return;
                      }
                      
                      // Generate referral code with conflict checking
                      const generateReferralCode = (firstName: string, lastName: string, birthday: string, phoneNumber: string): string => {
                        // Get first initial of first name
                        const firstInitial = firstName && firstName.length > 0 
                          ? firstName.charAt(0).toUpperCase() 
                          : 'K';

                        // Get first initial of last name
                        const lastInitial = lastName && lastName.length > 0 
                          ? lastName.charAt(0).toUpperCase() 
                          : 'A';

                        // Extract day from birthday (format: MM/DD/YYYY)
                        let day = '30'; // Default
                        if (birthday) {
                          const birthdayParts = birthday.split('/');
                          if (birthdayParts.length >= 2) {
                            day = birthdayParts[1].padStart(2, '0'); // Ensure 2 digits
                          }
                        }

                        // Extract phone number digits
                        let phoneDigits = '2647'; // Default
                        if (phoneNumber) {
                          // Remove all non-digit characters
                          phoneDigits = phoneNumber.replace(/\D/g, '');
                        }

                        // Try primary code (last 2 digits)
                        let lastTwoDigits = phoneDigits.length >= 2 ? phoneDigits.slice(-2) : '47';
                        let primaryCode = `${firstInitial}${lastInitial}${day}${lastTwoDigits}`;

                        // Check if code already exists in registeredUsers
                        const codeExists = existingUsers.some((user: any) => 
                          user.referralCode === primaryCode
                        );

                        // If code is taken, use alternative (2 digits before last 2)
                        if (codeExists && phoneDigits.length >= 4) {
                          const alternativeDigits = phoneDigits.slice(-4, -2); // 2 digits before last 2
                          return `${firstInitial}${lastInitial}${day}${alternativeDigits}`;
                        }

                        return primaryCode;
                      };

                      const referralCode = generateReferralCode(
                        firstName.trim(),
                        lastName.trim(),
                        birthday.trim(),
                        phoneNumber.trim()
                      );
                      
                      // Create user account
                      const newUser = {
                        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        firstName: firstName.trim(),
                        lastName: lastName.trim(),
                        email: email.trim().toLowerCase(),
                        phoneNumber: phoneNumber.trim(),
                        birthday: birthday.trim(),
                        password: password, // In production, this should be hashed
                        facebook: facebook.trim(),
                        instagram: instagram.trim(),
                        youtube: youtube.trim(),
                        tiktok: tiktok.trim(),
                        twitter: twitter.trim(),
                        profileImage: '/assets/profile-thumb.png',
                        membershipType: 'STANDARD',
                        referralCode: referralCode,
                        giftCardBalance: 10, // Welcome gift card balance for new accounts
                        hasMadeFirstPurchase: false, // Referral code becomes active after first purchase
                        unlockedDiscounts: ['signup'], // Track which discounts have been unlocked
                        createdAt: new Date().toISOString()
                      };
                      
                      // Save user to registered users list
                      const updatedUsers = [...existingUsers, newUser];
                      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
                      
                      // New account: empty cart and empty orders (no mock/pre-existing content)
                      localStorage.setItem('cartItems', '[]');
                      localStorage.setItem('cartCount', '0');
                      try {
                        localStorage.setItem(`userOrders_${newUser.email.trim().toLowerCase()}`, JSON.stringify({ activeOrders: [], pastOrders: [] }));
                      } catch (_) {}
                      window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: 0 }));
                      window.dispatchEvent(new CustomEvent('cartUpdated'));
                      
                      // Set current user session
                      localStorage.setItem('currentUser', JSON.stringify(newUser));
                      localStorage.setItem('isSignedIn', 'true');
                      
                      // Sign user in
                      setIsSignedIn(true);
                      
                      // Clear form
                      setFirstName('');
                      setLastName('');
                      setEmail('');
                      setPhoneNumber('');
                      setBirthday('');
                      setPassword('');
                      setConfirmPassword('');
                      setFacebook('');
                      setInstagram('');
                      setYoutube('');
                      setTiktok('');
                      setTwitter('');
                      setSignUpAttempted(false);
                      setEmailError('');
                      
                      // Navigate to account page
                      navigate('/account');
                    } catch (error) {
                      console.error('Error creating account:', error);
                      setValidationMessage('AN ERROR OCCURRED. PLEASE TRY AGAIN.');
                      setShowValidationModal(true);
                    }
                  }}
                  className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                  style={{
                    borderWidth: '1.3px', 
                    color: '#EB1C24',
                    fontFamily: '"Futura PT Medium"',
                    backgroundColor: '#FFFFFF',
                    textTransform: 'uppercase'
                  }}
                >
                  SIGN UP
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
    
    {/* Validation Modal */}
    <ConfirmationModal
      isOpen={showValidationModal}
      onClose={() => setShowValidationModal(false)}
      onConfirm={() => setShowValidationModal(false)}
      title="INPUT FIELD REQUIRED"
      message={validationMessage}
      confirmText="OK"
      cancelText="CLOSE"
      messageTextTransform="uppercase"
    />
    </>
  );
}

export default SignInPage;

