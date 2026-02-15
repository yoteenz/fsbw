import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DynamicCartIcon from '../../components/DynamicCartIcon';
import ConfirmationModal from '../../components/ConfirmationModal';
import BrandMenuLinks from '../../components/BrandMenuLinks';
import SocialMenuIcons from '../../components/SocialMenuIcons';
import { isAdminEmail, isPreviewEnvironment } from '../../utils/adminAuth';
import {
  getReviewsLastSeenShopCountKey,
  getReviewsLastSeenToolCountKey,
  MOCK_SHOP_REVIEWS_COUNT,
  MOCK_TOOL_REVIEWS_COUNT
} from '../../constants/reviews';

// OAuth callback types (match globals from vite-env.d.ts)
type FbLoginResponse = { status: string; authResponse?: { accessToken: string; userID: string } };
type GoogleTokenResp = { access_token: string };

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

  const fbAppId = import.meta.env.VITE_FACEBOOK_APP_ID as string | undefined;
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const [socialAuthError, setSocialAuthError] = useState('');
  const [socialLoading, setSocialLoading] = useState<'facebook' | 'google' | null>(null);

  /** Normalize email for OAuth lookup so Gmail dotted variants (user.name@gmail.com vs username@gmail.com) match. */
  const normalizeEmailForOAuthLookup = (raw: string): string => {
    const e = (raw || '').trim().toLowerCase();
    if (!e) return e;
    const at = e.indexOf('@');
    if (at <= 0) return e;
    const local = e.slice(0, at);
    const domain = e.slice(at);
    if (domain === '@gmail.com' || domain === '@googlemail.com') {
      return local.replace(/\./g, '') + domain;
    }
    return e;
  };

  const createOrUpdateOAuthUser = (profile: {
    provider: 'facebook' | 'google';
    id?: string;
    name: string;
    email: string;
    picture?: string;
    link?: string;
  }) => {
    const registeredUsers: any[] = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const email = (profile.email || '').trim().toLowerCase();
    if (!email) {
      setSocialAuthError('Email is required. Please grant email permission.');
      return;
    }
    const nameParts = (profile.name || '').trim().split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    const normalizedEmail = normalizeEmailForOAuthLookup(email);
    let existingIdx = registeredUsers.findIndex((u: any) => normalizeEmailForOAuthLookup(u.email || '') === normalizedEmail);
    if (existingIdx < 0 && profile.id) {
      existingIdx = registeredUsers.findIndex((u: any) => (u.oauthId === profile.id || u.authProviderId === profile.id) && u.authProvider === profile.provider);
    }
    let user: any;
    if (existingIdx >= 0) {
      user = { ...registeredUsers[existingIdx], authProvider: profile.provider, oauthId: profile.id, authProviderId: profile.id, firstName: firstName || registeredUsers[existingIdx].firstName, lastName: lastName || registeredUsers[existingIdx].lastName };
      if (profile.provider === 'facebook' && profile.link) user.facebook = profile.link;
      registeredUsers[existingIdx] = user;
    } else {
      const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : 'U';
      const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : 'S';
      let referralCode = firstInitial + lastInitial + '01' + Math.floor(10 + Math.random() * 90);
      while (registeredUsers.some((u: any) => u.referralCode === referralCode)) {
        referralCode = firstInitial + lastInitial + '01' + Math.floor(10 + Math.random() * 90);
      }
      user = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        firstName,
        lastName,
        email,
        phoneNumber: '',
        birthday: '',
        password: '',
        facebook: profile.provider === 'facebook' && profile.link ? profile.link : '',
        instagram: '',
        youtube: '',
        tiktok: '',
        twitter: '',
        profileImage: profile.picture || '/assets/profile-thumb.png',
        membershipType: 'STANDARD',
        referralCode,
        giftCardBalance: 10, // Standard member welcome discount $10 USD (per premium chart)
        hasMadeFirstPurchase: false,
        loyaltyPoints: 0,
        unlockedDiscounts: ['signup'],
        authProvider: profile.provider,
        oauthId: profile.id,
        authProviderId: profile.id,
        createdAt: new Date().toISOString()
      };
      registeredUsers.push(user);
      try {
        localStorage.setItem(`userOrders_${email}`, JSON.stringify({ activeOrders: [], pastOrders: [] }));
      } catch (_) {}
      // New account: clear cart, wishlist, bag state so they don't see previous guest data
      localStorage.setItem('cartItems', '[]');
      localStorage.setItem('cartCount', '0');
      localStorage.setItem('wishlistItems', '[]');
      localStorage.removeItem('addToBagButtonState');
      localStorage.removeItem('lastAddedItemId');
      localStorage.removeItem('editingCartItem');
      localStorage.removeItem('editingCartItemId');
      // Clear all mock data for new OAuth account: empty notifications, no mock review alerts
      try {
        localStorage.setItem(`notifications_${email}`, '[]');
        localStorage.setItem(getReviewsLastSeenShopCountKey(email), String(MOCK_SHOP_REVIEWS_COUNT));
        localStorage.setItem(getReviewsLastSeenToolCountKey(email), String(MOCK_TOOL_REVIEWS_COUNT));
      } catch (_) {}
      window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: 0 }));
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    }
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    localStorage.setItem('currentUser', JSON.stringify(user));
    if (user.profileImage) {
      localStorage.setItem('profileImage', user.profileImage);
    } else {
      localStorage.removeItem('profileImage');
    }
    localStorage.setItem('isSignedIn', 'true');
    window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
    setSocialLoading(null);
    setSocialAuthError('');
    navigate('/account/settings');
  };

  const handleFacebookSignIn = () => {
    setSocialAuthError('');
    if (!fbAppId) {
      setSocialAuthError('Facebook sign-in is not configured. Add VITE_FACEBOOK_APP_ID to your environment.');
      return;
    }
    setSocialLoading('facebook');
    if (window.FB) {
      window.FB.login((response: FbLoginResponse) => {
        if (response.status !== 'connected' || !response.authResponse) {
          setSocialLoading(null);
          setSocialAuthError('Facebook sign-in was cancelled or failed.');
          return;
        }
        window.FB!.api('/me', { fields: 'id,name,email,link' }, (profile: { id?: string; name?: string; email?: string; link?: string }) => {
          if (profile.email) {
            createOrUpdateOAuthUser({ provider: 'facebook', id: profile.id, name: profile.name || '', email: profile.email, link: profile.link });
          } else {
            setSocialLoading(null);
            setSocialAuthError('Email permission is required. Please try again and grant email access.');
          }
        });
      }, { scope: 'email,public_profile' });
      return;
    }
    window.fbAsyncInit = () => {
      window.FB!.init({ appId: fbAppId, cookie: true, xfbml: true, version: 'v18.0' });
      window.FB!.login((response: FbLoginResponse) => {
        if (response.status !== 'connected' || !response.authResponse) {
          setSocialLoading(null);
          setSocialAuthError('Facebook sign-in was cancelled or failed.');
          return;
        }
        window.FB!.api('/me', { fields: 'id,name,email,link' }, (profile: { id?: string; name?: string; email?: string; link?: string }) => {
          if (profile.email) {
            createOrUpdateOAuthUser({ provider: 'facebook', id: profile.id, name: profile.name || '', email: profile.email, link: profile.link });
          } else {
            setSocialLoading(null);
            setSocialAuthError('Email permission is required. Please try again and grant email access.');
          }
        });
      }, { scope: 'email,public_profile' });
    };
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      if (!window.FB) {
        setSocialLoading(null);
        setSocialAuthError('Facebook sign-in failed to load.');
      }
    };
    script.onerror = () => {
      setSocialLoading(null);
      setSocialAuthError('Facebook sign-in failed to load.');
    };
    document.body.appendChild(script);
  };

  const handleGoogleSignIn = () => {
    setSocialAuthError('');
    if (!googleClientId) {
      setSocialAuthError('Google sign-in is not configured. Add VITE_GOOGLE_CLIENT_ID to your environment.');
      return;
    }
    setSocialLoading('google');
    const doGoogleTokenRequest = () => {
      if (!window.google?.accounts?.oauth2) {
        setSocialLoading(null);
        setSocialAuthError('Google sign-in failed to load.');
        return;
      }
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: 'email profile',
        callback: async (tokenResponse: GoogleTokenResp) => {
          try {
            const res = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${encodeURIComponent(tokenResponse.access_token)}`);
            const data = await res.json();
            const name = data.name || '';
            const email = data.email || '';
            const picture = data.picture;
            if (email) {
              createOrUpdateOAuthUser({ provider: 'google', id: data.sub, name, email, picture });
            } else {
              setSocialLoading(null);
              setSocialAuthError('Email permission is required.');
            }
          } catch (_) {
            setSocialLoading(null);
            setSocialAuthError('Google sign-in failed.');
          }
        }
      });
      tokenClient.requestAccessToken();
    };
    if (window.google?.accounts?.oauth2) {
      doGoogleTokenRequest();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => doGoogleTokenRequest();
    script.onerror = () => {
      setSocialLoading(null);
      setSocialAuthError('Google sign-in failed to load.');
    };
    document.body.appendChild(script);
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
                <SocialMenuIcons />
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1px' }}>
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
                          textTransform: 'uppercase',
                          transform: 'translateX(-2px)'
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
                        // Grant admin role only if email is in the allowed admin list
                        if (isAdminEmail(user.email || '')) {
                          userToSet.role = 'admin';
                        }
                        
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
                        if (userToSet.profileImage) {
                          localStorage.setItem('profileImage', userToSet.profileImage);
                        } else {
                          localStorage.removeItem('profileImage');
                        }
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
                        } else if (returnTo && returnTo.startsWith('/admin') && (userToSet.role === 'admin' || isPreviewEnvironment())) {
                          navigate(returnTo);
                        } else {
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
                      placeholder={twitterFocused || twitter ? "@USERNAME" : "@X"}
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
                    {socialAuthError && (
                      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24', margin: 0 }}>{socialAuthError}</p>
                    )}
                    <button
                      type="button"
                      onClick={handleFacebookSignIn}
                      disabled={!!socialLoading}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1.3px solid #000',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '12px',
                        backgroundColor: 'transparent',
                        textTransform: 'uppercase',
                        cursor: socialLoading ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        justifyContent: 'center',
                        opacity: socialLoading === 'facebook' ? 0.7 : 1
                      }}
                    >
                      <svg width="22" height="22" viewBox="0 0 33 29" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                        <path d="M27.3913 29H21.0274C20.8544 29 20.6885 28.9389 20.5662 28.8301C20.4439 28.7214 20.3752 28.5738 20.3752 28.42L20.3941 18.4713C20.3941 18.3174 20.4628 18.1699 20.5851 18.0611C20.7074 17.9524 20.8733 17.8913 21.0463 17.8913H24.913L25.3741 14.6583L21.0306 14.6247C20.8577 14.6247 20.6918 14.5636 20.5695 14.4548C20.4472 14.3461 20.3785 14.1985 20.3785 14.0447V11.3622C20.3785 10.2353 20.6889 8.73654 23.372 8.73654H25.1876L25.2215 6.003L22.228 5.97284C18.8315 5.97284 16.8039 7.83232 16.8039 10.9469V14.0453C16.8039 14.1991 16.7352 14.3466 16.6129 14.4554C16.4906 14.5642 16.3247 14.6253 16.1517 14.6253H13.2476L13.228 17.8623L16.168 17.8918C16.341 17.8918 16.5069 17.9529 16.6292 18.0617C16.7515 18.1705 16.8202 18.318 16.8202 18.4718L16.8006 28.42C16.8006 28.5738 16.7319 28.7214 16.6096 28.8301C16.4873 28.9389 16.3214 29 16.1485 29H5.21739C3.83413 28.9986 2.50797 28.5093 1.52985 27.6394C0.55174 26.7696 0.00155355 25.5902 0 24.36L0 4.64C0.00155355 3.40982 0.55174 2.23042 1.52985 1.36055C2.50797 0.490681 3.83413 0.00138162 5.21739 0L27.3913 0C28.7746 0.00138162 30.1007 0.490681 31.0788 1.36055C32.0569 2.23042 32.6071 3.40982 32.6087 4.64V24.36C32.6071 25.5902 32.0569 26.7696 31.0788 27.6394C30.1007 28.5093 28.7746 28.9986 27.3913 29ZM21.6809 27.84H27.3913C28.4287 27.8389 29.4233 27.4719 30.1569 26.8195C30.8905 26.1671 31.3031 25.2826 31.3043 24.36V4.64C31.3031 3.71738 30.8905 2.83285 30.1569 2.18046C29.4233 1.52806 28.4287 1.16107 27.3913 1.16H5.21739C4.1799 1.16092 3.18521 1.52786 2.4516 2.18029C1.71798 2.83271 1.30538 3.71733 1.30435 4.64V24.36C1.30556 25.2826 1.71821 26.1671 2.45179 26.8195C3.18536 27.4719 4.17996 27.8389 5.21739 27.84H15.4976L15.5146 19.0513H13.2613C12.9072 19.0506 12.5678 18.9254 12.3171 18.703C12.0665 18.4805 11.9251 18.1789 11.9237 17.864L11.91 14.6572C11.9091 14.5005 11.9431 14.3452 12.01 14.2003C12.0768 14.0553 12.1752 13.9235 12.2995 13.8125C12.4238 13.7014 12.5716 13.6134 12.7343 13.5533C12.897 13.4932 13.0714 13.4623 13.2476 13.4624H15.4963V10.9463C15.4963 7.163 18.0743 4.814 22.2248 4.814H25.185C25.5397 4.81446 25.8797 4.94002 26.1305 5.16313C26.3812 5.38625 26.5223 5.6887 26.5226 6.00416V8.70812C26.5221 9.02337 26.3811 9.32559 26.1305 9.54857C25.8799 9.77154 25.5401 9.89709 25.1856 9.8977H23.3693C21.9143 9.8977 21.6796 10.3304 21.6796 11.3634V13.4659H25.3376C25.5266 13.4658 25.7135 13.5014 25.8859 13.5703C26.0583 13.6392 26.2123 13.7397 26.3378 13.8654C26.4633 13.991 26.5575 14.1389 26.6141 14.2993C26.6707 14.4597 26.6884 14.6289 26.6661 14.7958L26.2389 18.0026C26.2001 18.2919 26.0434 18.5585 25.7985 18.752C25.5536 18.9455 25.2374 19.0523 24.9098 19.0524H21.6978L21.6809 27.84Z" fill="#808080"/>
                      </svg>
                      <span>{socialLoading === 'facebook' ? 'SIGNING IN...' : 'SIGN UP WITH FACEBOOK ACCOUNT'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={!!socialLoading}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1.3px solid #000',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '12px',
                        backgroundColor: 'transparent',
                        textTransform: 'uppercase',
                        cursor: socialLoading ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        justifyContent: 'center',
                        opacity: socialLoading === 'google' ? 0.7 : 1
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#808080"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#808080"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#808080"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#808080"/>
                      </svg>
                      <span>{socialLoading === 'google' ? 'SIGNING IN...' : 'SIGN UP WITH GOOGLE ACCOUNT'}</span>
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
                        giftCardBalance: 10, // Standard member welcome discount $10 USD (per premium chart)
                        hasMadeFirstPurchase: false, // Referral code becomes active after first purchase
                        loyaltyPoints: 0,
                        unlockedDiscounts: ['signup'], // Track which discounts have been unlocked
                        createdAt: new Date().toISOString()
                      };
                      
                      // Save user to registered users list
                      const updatedUsers = [...existingUsers, newUser];
                      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
                      
                      // New account: clear cart, wishlist, bag state, orders (no mock or guest data)
                      localStorage.setItem('cartItems', '[]');
                      localStorage.setItem('cartCount', '0');
                      localStorage.setItem('wishlistItems', '[]');
                      localStorage.removeItem('addToBagButtonState');
                      localStorage.removeItem('lastAddedItemId');
                      localStorage.removeItem('editingCartItem');
                      localStorage.removeItem('editingCartItemId');
                      try {
                        localStorage.setItem(`userOrders_${newUser.email.trim().toLowerCase()}`, JSON.stringify({ activeOrders: [], pastOrders: [] }));
                      } catch (_) {}
                      // Clear all mock data for new sign-up: empty notifications, no mock review alerts
                      try {
                        const newEmail = newUser.email.trim().toLowerCase();
                        localStorage.setItem('notifications', '[]');
                        localStorage.setItem(getReviewsLastSeenShopCountKey(newEmail), String(MOCK_SHOP_REVIEWS_COUNT));
                        localStorage.setItem(getReviewsLastSeenToolCountKey(newEmail), String(MOCK_TOOL_REVIEWS_COUNT));
                      } catch (_) {}
                      window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: 0 }));
                      window.dispatchEvent(new CustomEvent('cartUpdated'));
                      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
                      
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

