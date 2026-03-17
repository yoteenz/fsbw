import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DynamicCartIcon from '../../components/DynamicCartIcon';
import ConfirmationModal from '../../components/ConfirmationModal';
import BrandMenuLinks from '../../components/BrandMenuLinks';
import SocialMenuIcons from '../../components/SocialMenuIcons';
import { isAdminEmail, ensureAuthRestoredFromBackup, onSignInSuccess } from '../../utils/adminAuth';
import { saveCartAndWishlistToUserKeys, swapCartAndWishlistToUser } from '../../utils/cartWishlistStorage';
import { normalizeEmail, normalizePassword } from '../../utils/credentialNormalize';
import { getSupabase, isSupabaseConfigured } from '../../utils/supabase';
import { syncAllFromApi, buildMinimalUserFromSupabaseSession, applyMinimalUserToStorage, buildProfilePayloadForBackend } from '../../utils/syncFromApi';
import { registerServerSessionCookie } from '../../utils/sessionRestore';
import { trackActivity } from '../../utils/activity';
import {
  getReviewsLastSeenShopCountKey,
  getReviewsLastSeenToolCountKey,
  MOCK_SHOP_REVIEWS_COUNT,
  MOCK_TOOL_REVIEWS_COUNT
} from '../../constants/reviews';

/** Fetch motherboard (canonical admin profile) from public/admin-profile.json so Chrome (and any browser) gets same name, photo, birthday etc. as Safari. Update motherboard via Account → Add to motherboard, then save the downloaded file as public/admin-profile.json. */
async function fetchCanonicalAdminProfile(): Promise<Record<string, unknown>> {
  try {
    const r = await fetch('/admin-profile.json');
    if (!r.ok) return {};
    const j = await r.json();
    return j && typeof j === 'object' ? j as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

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
  const [isSignedIn, setIsSignedIn] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('isSignedIn') === 'true';
  });
  const [emailError, setEmailError] = useState('');

  // Sign In form state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const signInEmailRef = useRef<HTMLInputElement | null>(null);
  const signInPasswordRef = useRef<HTMLInputElement | null>(null);

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
  const [showSignUpConfirmMessage, setShowSignUpConfirmMessage] = useState(false);
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

  // Format social media usernames with @ prefix only; empty or only @ becomes ''
  const formatSocialUsername = (value: string): string => {
    if (!value) return '';
    let cleaned = value.replace(/@/g, '');
    cleaned = cleaned.replace(/^(facebook|instagram|youtube|tiktok|twitter)/i, '').trim();
    if (!cleaned) return '';
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

  // If already signed in (localStorage), redirect so user is not shown the sign-in form after e.g. reopening browser
  useEffect(() => {
    ensureAuthRestoredFromBackup();
    if (localStorage.getItem('isSignedIn') !== 'true') return;
    const returnTo = new URLSearchParams(location.search).get('returnTo');
    const from = (location.state as { from?: string } | null)?.from;
    if (returnTo === 'checkout') navigate('/checkout', { replace: true });
    else if (returnTo?.startsWith('/admin')) navigate(returnTo, { replace: true });
    else if (from?.startsWith('/account') || from?.startsWith('/wishlist')) navigate(from, { replace: true });
    else navigate('/account', { replace: true });
  }, [navigate, location.search, location.state]);

  // When Supabase is configured: restore session on load (e.g. after email confirm redirect) so user is signed in
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabase();
    if (!supabase) return;
    let cancelled = false;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled || !session) return;
      syncAllFromApi().then(async (profile) => {
        if (cancelled) return;
        if (profile) {
          localStorage.setItem('isSignedIn', 'true');
          setIsSignedIn(true);
          onSignInSuccess('session_restore'); // Face ID / Supabase cookie auto-login — track and persist (Safari retries)
          window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
          const returnTo = new URLSearchParams(location.search).get('returnTo');
          const from = (location.state as { from?: string } | null)?.from;
          if (returnTo === 'checkout') navigate('/checkout');
          else if (returnTo?.startsWith('/admin')) navigate(returnTo);
          else if (from?.startsWith('/account') || from?.startsWith('/wishlist')) navigate(from, { replace: true });
          else navigate('/account', { replace: true });
          return;
        }
        // Session exists but getProfile failed (e.g. just confirmed email, API not ready): still sign in from session; create profile so user appears in admin clients
        const minimal = buildMinimalUserFromSupabaseSession(session.user);
        applyMinimalUserToStorage(minimal);
        onSignInSuccess('session_restore');
        const { patchProfile } = await import('../../utils/api');
        await patchProfile(buildProfilePayloadForBackend(minimal)).catch(() => {});
        setIsSignedIn(true);
        window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
        const returnTo = new URLSearchParams(location.search).get('returnTo');
        const from = (location.state as { from?: string } | null)?.from;
        if (returnTo === 'checkout') navigate('/checkout');
        else if (returnTo?.startsWith('/admin')) navigate(returnTo);
        else if (from?.startsWith('/account') || from?.startsWith('/wishlist')) navigate(from, { replace: true });
        else navigate('/account', { replace: true });
      });
    });
    return () => { cancelled = true; };
  }, [navigate, location.search, location.state]);

  // Passkey (WebAuthn) is NOT auto-run on load so that when you tap the email/password field,
  // the browser shows saved passwords and Face ID unlocks the keychain and fills the fields.
  // If we ran tryPasskeySignIn() here, Face ID would be used for passkey first and nothing would fill.

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

  /** Redirect URL after successful sign-in. Full-page navigation so Chrome can offer to save password. */
  const getSignInRedirectUrl = (): string => {
    const returnTo = new URLSearchParams(location.search).get('returnTo');
    const from = (location.state as { from?: string } | null)?.from;
    if (returnTo === 'checkout') return '/checkout';
    if (returnTo?.startsWith('/admin')) return returnTo;
    if (returnTo === 'account/settings') return '/account/settings';
    if (from?.startsWith('/account') || from?.startsWith('/wishlist')) return from;
    return '/account';
  };

  const doRedirectAfterSignIn = () => {
    const url = getSignInRedirectUrl();
    setTimeout(() => { window.location.href = url; }, 350);
  };

  /** After admin local sign-in: if a Supabase session exists for the same email, sync profile/orders/cart/wishlist from API so stored info loads. Preserves local password in registeredUsers. */
  const trySyncAdminStoredInfoIfSession = async (emailNorm: string, localPassword: string) => {
    if (!isAdminEmail(emailNorm) || !isSupabaseConfigured()) return;
    const supabase = getSupabase();
    if (!supabase) return;
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session?.user || normalizeEmail((data.session.user as { email?: string }).email || '') !== emailNorm) return;
      const profile = await syncAllFromApi();
      if (profile) {
        saveCartAndWishlistToUserKeys(emailNorm);
        const registeredUsers: unknown[] = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const idx = registeredUsers.findIndex((u: unknown) => normalizeEmail((u as { email?: string }).email || '') === emailNorm);
        if (idx !== -1 && localPassword) {
          (registeredUsers[idx] as { password?: string }).password = localPassword;
          localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        }
      }
    } catch (_) {
      // ignore
    }
  };

  const handleSignInSubmit = async () => {
    let email = (signInEmailRef.current?.value ?? signInEmail).trim();
    let password = signInPasswordRef.current?.value ?? signInPassword;
    if (!password && signInPasswordRef.current) {
      await new Promise((r) => requestAnimationFrame(r));
      password = signInPasswordRef.current?.value ?? signInPassword;
    }
    if (!email && signInEmailRef.current) {
      email = (signInEmailRef.current?.value ?? signInEmail).trim();
    }
    if (!email) {
      setValidationMessage('EMAIL ADDRESS IS REQUIRED.');
      setShowValidationModal(true);
      return;
    }
    if (!password) {
      setValidationMessage('PASSWORD IS REQUIRED.');
      setShowValidationModal(true);
      return;
    }
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const passwordTrimmed = typeof password === 'string' ? password.trim() : password;
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: passwordTrimmed
          });
          if (!error && data.session) {
            // Store the same password we sent to Supabase (trimmed) so "Sync my account" works
            const passwordToStore = passwordTrimmed;
            const emailNorm = normalizeEmail(email);
            try {
              const raw = localStorage.getItem('currentUser');
              if (raw) {
                const prev = JSON.parse(raw);
                if (prev?.email) saveCartAndWishlistToUserKeys((prev.email as string).trim().toLowerCase());
              }
            } catch (_) {}
            const profile = await syncAllFromApi();
            if (profile) {
              // Store password so "Sync my account" later uses the same Supabase password
              try {
                const cur = localStorage.getItem('currentUser');
                if (cur) {
                  const parsed = JSON.parse(cur) as Record<string, unknown>;
                  parsed.password = passwordToStore;
                  localStorage.setItem('currentUser', JSON.stringify(parsed));
                  const ru = JSON.parse(localStorage.getItem('registeredUsers') || '[]') as { email?: string; password?: string }[];
                  const idx = ru.findIndex((u) => normalizeEmail(u.email || '') === emailNorm);
                  if (idx !== -1) {
                    ru[idx] = { ...ru[idx], password: passwordToStore };
                    localStorage.setItem('registeredUsers', JSON.stringify(ru));
                  } else {
                    ru.push({ ...(parsed as Record<string, unknown>), email: String(parsed?.email ?? ''), password: passwordToStore });
                    localStorage.setItem('registeredUsers', JSON.stringify(ru));
                  }
                }
              } catch (_) {}
              localStorage.setItem('isSignedIn', 'true');
              setIsSignedIn(true);
              onSignInSuccess('password'); // user tapped Sign in — track and persist (Safari retries)
              trackActivity('sign_in');
              window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
              if (signInEmailRef.current) signInEmailRef.current.value = '';
              if (signInPasswordRef.current) signInPasswordRef.current.value = '';
              setSignInEmail('');
              setSignInPassword('');
              doRedirectAfterSignIn();
              return;
            }
            // Session valid but getProfile failed (e.g. no API or profile not ready): still sign in from session; create profile so user appears in admin clients
            const minimal = buildMinimalUserFromSupabaseSession(data.session.user) as Record<string, unknown>;
            minimal.password = passwordToStore;
            applyMinimalUserToStorage(minimal);
            try {
              const ru = JSON.parse(localStorage.getItem('registeredUsers') || '[]') as { email?: string; password?: string }[];
              const idx = ru.findIndex((u) => normalizeEmail(u.email || '') === emailNorm);
              if (idx !== -1) {
                ru[idx] = { ...ru[idx], password: passwordToStore };
                localStorage.setItem('registeredUsers', JSON.stringify(ru));
              }
            } catch (_) {}
            onSignInSuccess('password');
            const { patchProfile } = await import('../../utils/api');
            await patchProfile(buildProfilePayloadForBackend(minimal)).catch(() => {});
            setIsSignedIn(true);
            trackActivity('sign_in');
            window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
            if (signInEmailRef.current) signInEmailRef.current.value = '';
            if (signInPasswordRef.current) signInPasswordRef.current.value = '';
            setSignInEmail('');
            setSignInPassword('');
            doRedirectAfterSignIn();
            return;
          }
          if (error) {
            // Admin: allow fallback to existing local account only (no new bootstrap — prevents duplicates)
            if (isAdminEmail(email)) {
              // Fall through to local sign-in below; will only succeed if email+password match an existing registeredUsers entry
            } else {
              setValidationMessage(error.message === 'Invalid login credentials' ? 'INVALID EMAIL OR PASSWORD.' : error.message);
              setShowValidationModal(true);
              return;
            }
          }
        } catch (e) {
          if (isAdminEmail(email)) {
            // Fall through to local sign-in for admin
          } else {
            setValidationMessage('SIGN-IN FAILED. TRY AGAIN.');
            setShowValidationModal(true);
            return;
          }
        }
      }
    }
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const emailNorm = normalizeEmail(email);
      const passwordNorm = normalizePassword(password);
      const userByEmail = registeredUsers.find((u: any) => normalizeEmail(u.email || '') === emailNorm);
      const user = userByEmail && normalizePassword(userByEmail.password || '') === passwordNorm ? userByEmail : null;
      if (user) {
        const userToSet = { ...user };
        if (isAdminEmail(user.email || '')) userToSet.role = 'admin';
        const existingCurrentRaw = localStorage.getItem('currentUser');
        let previousEmail: string | null = null;
        if (existingCurrentRaw) {
          try {
            const existingUser = JSON.parse(existingCurrentRaw);
            if (existingUser?.email) previousEmail = (existingUser.email as string).trim().toLowerCase();
            if (existingUser && typeof existingUser === 'object' && user.email?.toLowerCase() === (existingUser.email || '').toLowerCase()) {
              const profileFields = ['firstName', 'lastName', 'phoneNumber', 'birthday', 'profileImage', 'facebook', 'instagram', 'youtube', 'tiktok', 'twitter', 'membershipType', 'subscriptionTier', 'referralCode', 'giftCardBalance', 'hasMadeFirstPurchase', 'loyaltyPoints', 'unlockedDiscounts', 'voucherList', 'voucherHistory', 'digitalCashHistory', 'welcomeDiscountTiersCreditedByPeriod', 'defaultAddress', 'shippingAddress', 'savedAddresses', 'createdAt', 'id'] as const;
              for (const key of profileFields) {
                const existingVal = existingUser[key];
                if (existingVal !== undefined && existingVal !== null) {
                  if (key === 'profileImage' && typeof existingVal === 'string' && existingVal.trim() === '') continue;
                  (userToSet as any)[key] = existingVal;
                }
              }
              if (typeof existingUser.giftCardBalance === 'number') userToSet.giftCardBalance = existingUser.giftCardBalance;
              if (typeof existingUser.loyaltyPoints === 'number') userToSet.loyaltyPoints = existingUser.loyaltyPoints;
              if (existingUser.hasMadeFirstPurchase !== undefined) userToSet.hasMadeFirstPurchase = Boolean(existingUser.hasMadeFirstPurchase);
              const userIndex = registeredUsers.findIndex((u: any) => u.email?.toLowerCase() === user.email?.toLowerCase());
              if (userIndex !== -1) {
                registeredUsers[userIndex] = { ...userToSet };
                delete (registeredUsers[userIndex] as any).role;
                localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
              }
            }
          } catch (_) {}
        }
        localStorage.setItem('currentUser', JSON.stringify(userToSet));
        swapCartAndWishlistToUser(previousEmail, emailNorm);
        if (userToSet.profileImage && String(userToSet.profileImage).trim()) localStorage.setItem('profileImage', String(userToSet.profileImage));
        else localStorage.removeItem('profileImage');
        localStorage.setItem('isSignedIn', 'true');
        onSignInSuccess('password');
        setIsSignedIn(true);
        trackActivity('sign_in');
        window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
        if (signInEmailRef.current) signInEmailRef.current.value = '';
        if (signInPasswordRef.current) signInPasswordRef.current.value = '';
        setSignInEmail('');
        setSignInPassword('');
        await trySyncAdminStoredInfoIfSession(emailNorm, passwordNorm);
        doRedirectAfterSignIn();
        return;
      }
      if (isAdminEmail(email)) {
        // When Supabase is configured, never create a new local admin (prevents duplicates); only existing local match is allowed
        if (isSupabaseConfigured()) {
          setValidationMessage('INVALID EMAIL OR PASSWORD. Use your Supabase password, or reset it in Supabase Dashboard.');
          setShowValidationModal(true);
          return;
        }
        const existingByEmail = registeredUsers.find((u: any) => normalizeEmail(u.email || '') === emailNorm);
        if (existingByEmail) {
          setValidationMessage('INVALID EMAIL OR PASSWORD.');
          setShowValidationModal(true);
          return;
        }
        let existingCurrent: Record<string, any> = {};
        try {
          const raw = localStorage.getItem('currentUser');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object' && normalizeEmail(parsed.email || '') === emailNorm) existingCurrent = parsed;
          }
        } catch (_) {}
        const canonical = await fetchCanonicalAdminProfile();
        const firstInitial = (email[0] || 'A').toUpperCase();
        const lastInitial = (email.split('@')[0]?.slice(1, 2) || 'A').toUpperCase();
        let referralCode = (existingCurrent.referralCode as string) || (canonical.referralCode as string) || firstInitial + lastInitial + '01' + Math.floor(10 + Math.random() * 90);
        while (registeredUsers.some((u: any) => u.referralCode === referralCode)) referralCode = firstInitial + lastInitial + '01' + Math.floor(10 + Math.random() * 90);
        const str = (a: unknown, b: unknown): string => (a != null && String(a).trim() !== '') ? String(a).trim() : (b != null && String(b).trim() !== '') ? String(b).trim() : '';
        const profileImageVal = str(existingCurrent.profileImage, canonical.profileImage) || (existingCurrent.profileImage as string) || (canonical.profileImage as string) || '';
        const bootstrapUser = {
          id: (existingCurrent.id as string) || (canonical.id as string) || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          firstName: str(existingCurrent.firstName, canonical.firstName) || ((existingCurrent.firstName as string) ?? (canonical.firstName as string) ?? ''),
          lastName: str(existingCurrent.lastName, canonical.lastName) || ((existingCurrent.lastName as string) ?? (canonical.lastName as string) ?? ''),
          email: emailNorm,
          phoneNumber: str(existingCurrent.phoneNumber, canonical.phoneNumber) || ((existingCurrent.phoneNumber as string) ?? (canonical.phoneNumber as string) ?? ''),
          birthday: str(existingCurrent.birthday, canonical.birthday) || ((existingCurrent.birthday as string) ?? (canonical.birthday as string) ?? ''),
          password: passwordNorm,
          facebook: str(existingCurrent.facebook, canonical.facebook) || ((existingCurrent.facebook as string) ?? (canonical.facebook as string) ?? ''),
          instagram: str(existingCurrent.instagram, canonical.instagram) || ((existingCurrent.instagram as string) ?? (canonical.instagram as string) ?? ''),
          youtube: str(existingCurrent.youtube, canonical.youtube) || ((existingCurrent.youtube as string) ?? (canonical.youtube as string) ?? ''),
          tiktok: str(existingCurrent.tiktok, canonical.tiktok) || ((existingCurrent.tiktok as string) ?? (canonical.tiktok as string) ?? ''),
          twitter: str(existingCurrent.twitter, canonical.twitter) || ((existingCurrent.twitter as string) ?? (canonical.twitter as string) ?? ''),
          profileImage: profileImageVal,
          membershipType: (existingCurrent.membershipType as string) ?? (canonical.membershipType as string) ?? 'STANDARD',
          subscriptionTier: (existingCurrent.subscriptionTier as string) ?? (canonical.subscriptionTier as string) ?? undefined,
          defaultAddress: existingCurrent.defaultAddress ?? canonical.defaultAddress ?? undefined,
          shippingAddress: existingCurrent.shippingAddress ?? canonical.shippingAddress ?? undefined,
          savedAddresses: Array.isArray(existingCurrent.savedAddresses) ? existingCurrent.savedAddresses : (Array.isArray(canonical.savedAddresses) ? canonical.savedAddresses : undefined),
          referralCode,
          giftCardBalance: typeof existingCurrent.giftCardBalance === 'number' ? existingCurrent.giftCardBalance : (typeof canonical.giftCardBalance === 'number' ? canonical.giftCardBalance : 10),
          hasMadeFirstPurchase: Boolean(existingCurrent.hasMadeFirstPurchase ?? canonical.hasMadeFirstPurchase),
          loyaltyPoints: typeof existingCurrent.loyaltyPoints === 'number' ? existingCurrent.loyaltyPoints : (typeof canonical.loyaltyPoints === 'number' ? canonical.loyaltyPoints : 0),
          unlockedDiscounts: Array.isArray(existingCurrent.unlockedDiscounts) ? existingCurrent.unlockedDiscounts : (Array.isArray(canonical.unlockedDiscounts) ? canonical.unlockedDiscounts : ['signup']),
          voucherList: Array.isArray(existingCurrent.voucherList) ? existingCurrent.voucherList : (Array.isArray(canonical.voucherList) ? canonical.voucherList : undefined),
          voucherHistory: Array.isArray(existingCurrent.voucherHistory) ? existingCurrent.voucherHistory : (Array.isArray(canonical.voucherHistory) ? canonical.voucherHistory : undefined),
          digitalCashHistory: Array.isArray(existingCurrent.digitalCashHistory) ? existingCurrent.digitalCashHistory : (Array.isArray(canonical.digitalCashHistory) ? canonical.digitalCashHistory : undefined),
          welcomeDiscountTiersCreditedByPeriod: existingCurrent.welcomeDiscountTiersCreditedByPeriod && typeof existingCurrent.welcomeDiscountTiersCreditedByPeriod === 'object' ? existingCurrent.welcomeDiscountTiersCreditedByPeriod : (canonical.welcomeDiscountTiersCreditedByPeriod && typeof canonical.welcomeDiscountTiersCreditedByPeriod === 'object' ? canonical.welcomeDiscountTiersCreditedByPeriod : undefined),
          createdAt: (existingCurrent.createdAt as string) || (canonical.createdAt as string) || new Date().toISOString()
        };
        registeredUsers.push(bootstrapUser);
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        let previousEmail: string | null = null;
        try {
          const raw = localStorage.getItem('currentUser');
          if (raw) {
            const prev = JSON.parse(raw);
            if (prev?.email) previousEmail = (prev.email as string).trim().toLowerCase();
          }
        } catch (_) {}
        const userToSet = { ...bootstrapUser, role: 'admin' };
        localStorage.setItem('currentUser', JSON.stringify(userToSet));
        swapCartAndWishlistToUser(previousEmail, emailNorm);
        if (userToSet.profileImage && String(userToSet.profileImage).trim()) localStorage.setItem('profileImage', String(userToSet.profileImage));
        else localStorage.removeItem('profileImage');
        localStorage.setItem('isSignedIn', 'true');
        onSignInSuccess('password');
        setIsSignedIn(true);
        trackActivity('sign_in');
        window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
        if (signInEmailRef.current) signInEmailRef.current.value = '';
        if (signInPasswordRef.current) signInPasswordRef.current.value = '';
        setSignInEmail('');
        setSignInPassword('');
        await trySyncAdminStoredInfoIfSession(emailNorm, passwordNorm);
        doRedirectAfterSignIn();
        return;
      }
      const hasAnyUsers = registeredUsers.length > 0;
      const hasMatchingEmail = registeredUsers.some((u: any) => normalizeEmail(u.email || '') === emailNorm);
      const message = !hasAnyUsers ? 'NO ACCOUNT IN THIS BROWSER. CREATE AN ACCOUNT ON THIS DEVICE FIRST.' : !hasMatchingEmail ? 'NO ACCOUNT FOR THIS EMAIL IN THIS BROWSER. CREATE AN ACCOUNT HERE WITH THE SAME EMAIL TO USE THIS DEVICE.' : 'INVALID EMAIL OR PASSWORD.';
      setValidationMessage(message);
      setShowValidationModal(true);
    } catch (error) {
      console.error('Error signing in:', error);
      setValidationMessage('AN ERROR OCCURRED. PLEASE TRY AGAIN.');
      setShowValidationModal(true);
    }
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
                            transform: 'translateX(13px)'
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
                                transform: 'translateX(13px)'
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
                                  transform: `${mobileMenuExpandedItems.includes(item.label) ? 'translateX(-11px) translateY(-4px) rotate(90deg)' : 'translateX(-11px) translateY(-4px) rotate(0deg)'}`,
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
                <div style={{ marginBottom: '20px' }}><SocialMenuIcons /></div>
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
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  minHeight: '220px'
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
                  
                  <form
                    id="signin-form"
                    method="post"
                    action="/account"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSignInSubmit();
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}
                    autoComplete="on"
                  >
                    {/* Email Input - uncontrolled so Chrome can autofill full value */}
                    <div style={{ marginTop: '8px' }}>
                      <label
                        htmlFor="signin-email"
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
                        ref={signInEmailRef}
                        id="signin-email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        onInput={() => { if (signInEmailRef.current) setSignInEmail(signInEmailRef.current.value); }}
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

                    {/* Password Input - uncontrolled so Chrome can autofill full value */}
                    <div>
                      <label
                        htmlFor="signin-password"
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
                          ref={signInPasswordRef}
                          id="signin-password"
                          type={showSignInPassword ? "text" : "password"}
                          name="password"
                          autoComplete="current-password"
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          onInput={() => { if (signInPasswordRef.current) setSignInPassword(signInPasswordRef.current.value); }}
                          className="password-field"
                          style={{
                            width: '100%',
                            height: '36px',
                            padding: '8px',
                            paddingRight: '40px',
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
                        <img
                          src={showSignInPassword ? '/assets/hide-password.svg' : '/assets/show-password.svg'}
                          alt={showSignInPassword ? 'Hide password' : 'Show password'}
                          role="button"
                          tabIndex={0}
                          onClick={() => setShowSignInPassword(!showSignInPassword)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowSignInPassword(!showSignInPassword); } }}
                          style={{
                            position: 'absolute',
                            right: '11px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                            userSelect: 'none',
                            pointerEvents: 'auto'
                          }}
                        />
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
                  </form>
                </div>
              </div>

            {/* SIGN IN BUTTON - Outside card */}
            <div className="px-0 md:px-0" style={{ marginTop: '2px', marginBottom: '20px' }}>
                <button
                  type="submit"
                  form="signin-form"
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
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    ...(showSignUpConfirmMessage ? { minHeight: '220px' } : {})
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

                  {showSignUpConfirmMessage ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', alignItems: 'center', textAlign: 'center' }}>
                      <p
                        style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '12px',
                          color: '#808080',
                          margin: 0,
                          lineHeight: 1.4,
                          textTransform: 'none'
                        }}
                      >
                        SIGN UP IS ALMOST COMPLETE!
                        <br />
                        CHECK YOUR EMAIL TO CONFIRM YOUR ACCOUNT.
                      </p>
                    </div>
                  ) : (
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
                          className="password-field"
                          style={{
                            width: '100%',
                            height: '36px',
                            padding: '8px',
                            paddingRight: '40px',
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
                        <img
                          src={showPassword ? '/assets/hide-password.svg' : '/assets/show-password.svg'}
                          alt={showPassword ? 'Hide password' : 'Show password'}
                          role="button"
                          tabIndex={0}
                          onClick={() => setShowPassword(!showPassword)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowPassword(!showPassword); } }}
                          style={{
                            position: 'absolute',
                            right: '11px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                            userSelect: 'none'
                          }}
                        />
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
                          className="password-field"
                          style={{
                            width: '100%',
                            height: '36px',
                            padding: '8px',
                            paddingRight: '40px',
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
                        <img
                          src={showConfirmPassword ? '/assets/hide-password.svg' : '/assets/show-password.svg'}
                          alt={showConfirmPassword ? 'Hide password' : 'Show password'}
                          role="button"
                          tabIndex={0}
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowConfirmPassword(!showConfirmPassword); } }}
                          style={{
                            position: 'absolute',
                            right: '11px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                            userSelect: 'none'
                          }}
                        />
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
                      placeholder={instagramFocused || instagram ? "@USERNAME" : "@INSTAGRAM"}
                      value={instagram}
                      onChange={(e) => {
                        const formatted = formatSocialUsername(e.target.value);
                        setInstagram(formatted);
                      }}
                      onFocus={() => setInstagramFocused(true)}
                      onBlur={() => {
                        setInstagramFocused(false);
                        if (!instagram || instagram === '@') {
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
                        outline: 'none',
                        marginTop: '16px'
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
                        if (!youtube || youtube === '@') {
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
                        if (!tiktok || tiktok === '@') {
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
                      placeholder={facebookFocused || facebook ? "@USERNAME" : "@FACEBOOK"}
                      value={facebook}
                      onChange={(e) => {
                        const formatted = formatSocialUsername(e.target.value);
                        setFacebook(formatted);
                      }}
                      onFocus={() => setFacebookFocused(true)}
                      onBlur={() => {
                        setFacebookFocused(false);
                        if (!facebook || facebook === '@') {
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
                        if (!twitter || twitter === '@') {
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
                        outline: 'none',
                        marginBottom: '8px'
                      }}
                    />
                      </div>
                    </div>
            )}
                </div>

            {/* SIGN UP BUTTON - Below card when showing confirm message (reverts to create account form) */}
            {showSignUpConfirmMessage && (
            <div className="px-0 md:px-0" style={{ marginTop: '2px', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowSignUpConfirmMessage(false)}
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
            )}

            {/* SIGN UP BUTTON - Outside card (hidden when showing confirm message) */}
            {!showSignUpConfirmMessage && (
            <div className="px-0 md:px-0" style={{ marginTop: '2px', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={async () => {
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
                      
                      // Check if email already exists in registered users (deleted accounts are not considered existing so they can re-create)
                      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                      const deletedList = JSON.parse(localStorage.getItem('deletedUsers') || '[]');
                      const deletedEmails = new Set((deletedList || []).map((d: any) => (d.email || '').toLowerCase().trim()));
                      const emailTrim = email.toLowerCase().trim();
                      const emailExists = existingUsers.some((user: any) => (user.email || '').toLowerCase() === emailTrim) && !deletedEmails.has(emailTrim);
                      if (emailExists) {
                        setEmailError('THIS EMAIL ALREADY EXISTS.');
                        return;
                      }

                      if (isSupabaseConfigured()) {
                        const supabase = getSupabase();
                        if (supabase) {
                          try {
                            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                              email: email.trim(),
                              password: password,
                              options: {
                                emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/account` : undefined,
                                data: {
                                  first_name: firstName.trim(),
                                  last_name: lastName.trim(),
                                  birthday: birthday.trim(),
                                  phone_number: phoneNumber.trim(),
                                },
                              },
                            });
                            if (signUpError) {
                              if (signUpError.message.includes('already registered')) {
                                setEmailError('THIS EMAIL IS ALREADY REGISTERED. SIGN IN ABOVE, OR IF YOU DELETED THIS ACCOUNT AND NEED TO RE-CREATE IT, CONTACT SUPPORT.');
                              } else {
                                setValidationMessage(signUpError.message.toUpperCase());
                                setShowValidationModal(true);
                              }
                              return;
                            }
                            if (signUpData.session) {
                              const { patchProfile } = await import('../../utils/api');
                              const referralCode = (() => {
                                const fi = (firstName.trim()[0] || 'K').toUpperCase();
                                const li = (lastName.trim()[0] || 'A').toUpperCase();
                                const day = birthday.split('/')[1]?.padStart(2, '0') || '30';
                                const digits = phoneNumber.replace(/\D/g, '').slice(-2) || '47';
                                return `${fi}${li}${day}${digits}`;
                              })();
                              await patchProfile({
                                firstName: firstName.trim(),
                                lastName: lastName.trim(),
                                email: normalizeEmail(email),
                                phoneNumber: phoneNumber.trim(),
                                birthday: birthday.trim(),
                                facebook: facebook.trim() || undefined,
                                instagram: instagram.trim() || undefined,
                                youtube: youtube.trim() || undefined,
                                tiktok: tiktok.trim() || undefined,
                                twitter: twitter.trim() || undefined,
                                profileImage: '/assets/profile-thumb.png',
                                membershipType: 'STANDARD',
                                referralCode,
                                giftCardBalance: 10,
                                hasMadeFirstPurchase: false,
                                loyaltyPoints: 0,
                                unlockedDiscounts: ['signup'],
                              });
                              // Add new user to registeredUsers immediately so admin clients page shows them (same browser)
                              const newUserEmail = normalizeEmail(email);
                              try {
                                const registeredUsers: unknown[] = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
                                const exists = (Array.isArray(registeredUsers) && registeredUsers.some((u: unknown) => ((u as { email?: string }).email || '').toLowerCase() === newUserEmail));
                                if (!exists && signUpData.session?.user) {
                                  const u = signUpData.session.user as { id?: string; email?: string };
                                  const newUser = {
                                    id: u.id || `user-${Date.now()}`,
                                    email: newUserEmail,
                                    firstName: firstName.trim(),
                                    lastName: lastName.trim(),
                                    phoneNumber: phoneNumber.trim(),
                                    birthday: birthday.trim(),
                                    profileImage: '/assets/profile-thumb.png',
                                    membershipType: 'STANDARD',
                                    referralCode,
                                    giftCardBalance: 10,
                                    hasMadeFirstPurchase: false,
                                    loyaltyPoints: 0,
                                    unlockedDiscounts: ['signup'],
                                  };
                                  registeredUsers.push(newUser);
                                  localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
                                }
                              } catch (_) {}
                              const profile = await syncAllFromApi();
                              if (profile) {
                                localStorage.setItem('isSignedIn', 'true');
                                setIsSignedIn(true);
                                trackActivity('sign_in');
                                window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
                                setFirstName(''); setLastName(''); setBirthday(''); setPhoneNumber(''); setEmail(''); setPassword(''); setConfirmPassword('');
                                setFacebook(''); setInstagram(''); setYoutube(''); setTiktok(''); setTwitter('');
                                navigate('/account');
                                return;
                              }
                            } else {
                              setShowSignUpConfirmMessage(true);
                              return;
                            }
                          } catch (e) {
                            setValidationMessage('SIGN-UP FAILED. TRY AGAIN.');
                            setShowValidationModal(true);
                            return;
                          }
                        }
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
                      
                      // Create user account (store normalized email/password so sign-in matches across browsers/autofill)
                      const newUser = {
                        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        firstName: firstName.trim(),
                        lastName: lastName.trim(),
                        email: normalizeEmail(email),
                        phoneNumber: phoneNumber.trim(),
                        birthday: birthday.trim(),
                        password: normalizePassword(password), // In production, this should be hashed
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
                      
                      // Swap cart/wishlist/lists to new user (saves previous user's data, loads new user's empty state)
                      let previousEmail: string | null = null;
                      try {
                        const raw = localStorage.getItem('currentUser');
                        if (raw) {
                          const prev = JSON.parse(raw);
                          if (prev?.email) previousEmail = (prev.email as string).trim().toLowerCase();
                        }
                      } catch (_) {}
                      localStorage.setItem('currentUser', JSON.stringify(newUser));
                      localStorage.setItem('profileImage', (newUser.profileImage && String(newUser.profileImage).trim()) ? String(newUser.profileImage) : '/assets/profile-thumb.png');
                      swapCartAndWishlistToUser(previousEmail, newUser.email.trim().toLowerCase());
                      
                      localStorage.removeItem('addToBagButtonState');
                      localStorage.removeItem('lastAddedItemId');
                      localStorage.removeItem('editingCartItem');
                      localStorage.removeItem('editingCartItemId');
                      try {
                        localStorage.setItem(`userOrders_${newUser.email.trim().toLowerCase()}`, JSON.stringify({ activeOrders: [], pastOrders: [] }));
                      } catch (_) {}
                      try {
                        const newEmail = newUser.email.trim().toLowerCase();
                        localStorage.setItem(`notifications_${newEmail}`, '[]');
                        localStorage.setItem(getReviewsLastSeenShopCountKey(newEmail), String(MOCK_SHOP_REVIEWS_COUNT));
                        localStorage.setItem(getReviewsLastSeenToolCountKey(newEmail), String(MOCK_TOOL_REVIEWS_COUNT));
                      } catch (_) {}
                      
                      localStorage.setItem('isSignedIn', 'true');
                      onSignInSuccess('password'); // new account = same persist + Safari retries
                      // Sign user in
                      setIsSignedIn(true);
                      trackActivity('sign_in');
                      
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
                      
                      // Navigate to account page or back to the account route they tried to open
                      const fromAccountGuard = (location.state as { from?: string } | null)?.from;
                      navigate(fromAccountGuard && (fromAccountGuard.startsWith('/account') || fromAccountGuard.startsWith('/wishlist')) ? fromAccountGuard : '/account', { replace: true });
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
            )}
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

