import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicCartIcon from '../../components/DynamicCartIcon';

function SignInPage() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('cartCount') || '0', 10);
    } catch (e) {
      return 0;
    }
  });
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileMenuActiveTab, setMobileMenuActiveTab] = useState('SHOP');
  const [mobileMenuExpandedItems, setMobileMenuExpandedItems] = useState<string[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Sign In form state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Create Account form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [youtube, setYoutube] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [twitter, setTwitter] = useState('');

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
    setIsSignedIn(!isSignedIn);
  };

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      {/* Marble Background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/Marble Floor.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center calc(50% + 25px)',
          backgroundRepeat: 'no-repeat',
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
                  <button className="cursor-pointer" style={{ transform: 'translateX(0px)' }}>
                    <img
                      alt="Account icon"
                      width="16"
                      height="16"
                      src="/assets/NOIR/account-icon.svg"
                    />
                  </button>
                  <button 
                    onClick={() => navigate('/wishlist')} 
                    className="cursor-pointer"
                    style={{ height: '21px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(2px)' }}
                  >
                    <img
                      alt="Wishlist"
                      width="19"
                      height="19"
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
            <div className="gap-5 flex absolute" style={{ right: showMobileMenu ? '14px' : '17px' }}>
              <div style={{ transform: showMobileMenu ? 'translateY(0.7px)' : 'none' }}>
                <DynamicCartIcon count={cartCount} width={22} height={19} />
              </div>
              <img
                alt="Menu"
                width="21"
                height="21"
                className="cursor-pointer"
                src="/assets/menu-icon.svg"
                onClick={handleMobileMenuToggle}
              />
            </div>
          </div>

          {/* MAIN CARD */}
          <div
            className="border border-black flex flex-col pt-6 pb-4 px-5 mb-2 bg-white/60 backdrop-blur-sm"
            style={{ 
              borderWidth: '1.3px', 
              minWidth: '100%', 
              maxWidth: 'none', 
              overflow: 'visible',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              willChange: 'backdrop-filter',
              minHeight: showMobileMenu ? '560px' : 'auto'
            }}
          >
            {showMobileMenu ? (
              /* MENU CONTENT */
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
                      paddingBottom: '4px',
                      background: 'none',
                      border: 'none',
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
                      paddingBottom: '4px',
                      background: 'none',
                      border: 'none',
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
                      paddingBottom: '4px',
                      background: 'none',
                      border: 'none',
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
                            textTransform: 'uppercase'
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
                            textTransform: 'uppercase'
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
                            className="flex items-center justify-between cursor-pointer"
                            style={{ alignItems: 'center' }}
                            onClick={() => {
                              if (item.isExpandable) {
                                if (item.label === 'UNITS' && mobileMenuExpandedItems.includes(item.label)) {
                                  navigate('/products/units');
                                } else {
                                  handleMobileMenuItemToggle(item.label);
                                }
                              }
                            }}
                          >
                            <span style={{ 
                              fontFamily: '"Futura PT Book"',
                              fontSize: '14px',
                              color: 'black',
                              fontWeight: '500',
                              textTransform: 'uppercase'
                            }}>
                              {item.label}
                            </span>
                            {item.hasArrow && (
                              <img
                                src="/assets/NOIR/closed-arrow.svg"
                                alt="Arrow"
                                style={{ 
                                  width: '16px', 
                                  height: '16px',
                                  transform: `${mobileMenuExpandedItems.includes(item.label) ? 'rotate(90deg)' : 'rotate(0deg)'} translateY(-4px)`,
                                  display: 'flex',
                                  alignItems: 'center'
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
            ) : (
              /* SIGN IN CONTENT */
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '32px', paddingTop: '20px' }}>
                {/* SIGN IN TO YOUR ACCOUNT SECTION */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p
                    style={{
                      fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                      color: '#000000',
                      fontSize: '28px',
                      lineHeight: '1.1',
                      margin: '0',
                      textTransform: 'uppercase'
                    }}
                  >
                    SIGN IN TO YOUR ACCOUNT
                  </p>
                  <p
                    style={{
                      fontFamily: '"Futura PT Book"',
                      color: '#EB1C24',
                      fontSize: '10px',
                      margin: '0',
                      textTransform: 'uppercase',
                      fontWeight: '500'
                    }}
                  >
                    WELCOME BACK!
                  </p>
                  
                  {/* Email Input */}
                  <div style={{ marginTop: '8px' }}>
                    <input
                      type="email"
                      placeholder="EMAIL ADDRESS*"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1.3px solid #000',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '12px',
                        backgroundColor: 'transparent',
                        textTransform: 'uppercase',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Password Input */}
                  <div>
                    <input
                      type="password"
                      placeholder="PASSWORD*"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1.3px solid #000',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '12px',
                        backgroundColor: 'transparent',
                        textTransform: 'uppercase',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Remember Me and Sign In/Forgot Password */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer'
                        }}
                      />
                      <label
                        htmlFor="rememberMe"
                        style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '12px',
                          color: '#000000',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          margin: '0'
                        }}
                      >
                        REMEMBER ME
                      </label>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <button
                        type="button"
                        style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '12px',
                          color: '#000000',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0',
                          textTransform: 'uppercase'
                        }}
                      >
                        SIGN IN
                      </button>
                      <button
                        type="button"
                        style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '12px',
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

                {/* CREATE AN ACCOUNT SECTION */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
                  <p
                    style={{
                      fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                      color: '#000000',
                      fontSize: '28px',
                      lineHeight: '1.1',
                      margin: '0',
                      textTransform: 'uppercase'
                    }}
                  >
                    CREATE AN ACCOUNT
                  </p>
                  <p
                    style={{
                      fontFamily: '"Futura PT Book"',
                      color: '#EB1C24',
                      fontSize: '10px',
                      margin: '0',
                      textTransform: 'uppercase',
                      fontWeight: '500'
                    }}
                  >
                    ACCESS YOUR ORDER HISTORY
                  </p>

                  {/* Form Fields */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                    <input
                      type="text"
                      placeholder="FIRST NAME*"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1.3px solid #000',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '12px',
                        backgroundColor: 'transparent',
                        textTransform: 'uppercase',
                        outline: 'none'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="LAST NAME*"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1.3px solid #000',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '12px',
                        backgroundColor: 'transparent',
                        textTransform: 'uppercase',
                        outline: 'none'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="BIRTHDAY*"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1.3px solid #000',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '12px',
                        backgroundColor: 'transparent',
                        textTransform: 'uppercase',
                        outline: 'none'
                      }}
                    />
                    <input
                      type="tel"
                      placeholder="PHONE NUMBER*"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1.3px solid #000',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '12px',
                        backgroundColor: 'transparent',
                        textTransform: 'uppercase',
                        outline: 'none'
                      }}
                    />
                    <input
                      type="email"
                      placeholder="EMAIL ADDRESS*"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1.3px solid #000',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '12px',
                        backgroundColor: 'transparent',
                        textTransform: 'uppercase',
                        outline: 'none'
                      }}
                    />
                    <input
                      type="password"
                      placeholder="PASSWORD*"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1.3px solid #000',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '12px',
                        backgroundColor: 'transparent',
                        textTransform: 'uppercase',
                        outline: 'none'
                      }}
                    />
                    <input
                      type="password"
                      placeholder="CONFIRM PASSWORD*"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1.3px solid #000',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '12px',
                        backgroundColor: 'transparent',
                        textTransform: 'uppercase',
                        outline: 'none'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="FACEBOOK.COM/"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1.3px solid #000',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '12px',
                        backgroundColor: 'transparent',
                        textTransform: 'uppercase',
                        outline: 'none'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="@INSTAGRAM"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1.3px solid #000',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '12px',
                        backgroundColor: 'transparent',
                        textTransform: 'uppercase',
                        outline: 'none'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="@YOUTUBE"
                      value={youtube}
                      onChange={(e) => setYoutube(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1.3px solid #000',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '12px',
                        backgroundColor: 'transparent',
                        textTransform: 'uppercase',
                        outline: 'none'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="@TIKTOK"
                      value={tiktok}
                      onChange={(e) => setTiktok(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1.3px solid #000',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '12px',
                        backgroundColor: 'transparent',
                        textTransform: 'uppercase',
                        outline: 'none'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="@TWITTER"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1.3px solid #000',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '12px',
                        backgroundColor: 'transparent',
                        textTransform: 'uppercase',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Sign Up Button */}
                  <button
                    type="button"
                    style={{
                      fontFamily: '"Futura PT Book"',
                      fontSize: '12px',
                      color: '#EB1C24',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0',
                      textTransform: 'uppercase',
                      textAlign: 'left',
                      marginTop: '8px'
                    }}
                  >
                    SIGN UP
                  </button>

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

                  {/* Social Media Icons */}
                  <div className="flex justify-center" style={{ marginTop: '24px', gap: '19px' }}>
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInPage;

