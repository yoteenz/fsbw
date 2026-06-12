import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import BrandMenuLinks from '../../../components/BrandMenuLinks';
import SocialMenuIcons from '../../../components/SocialMenuIcons';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { getDeletedPlatformFromUserAgent } from '../../../utils/platformDetection';
import { getPerUserKey, getCurrentUserEmailFromStorage, PER_USER_KEYS } from '../../../utils/perUserStorage';
import { deleteAccount } from '../../../utils/api';
import { patchProfileWithRetryQueue } from '../../../utils/profileSyncQueue';
import { trackActivity } from '../../../utils/activity';
import { getSupabase, isSupabaseConfigured } from '../../../utils/supabase';
import {
  clearAppAuth,
  isAyoteenzAdminAccount,
  isAdminEmail,
  isProtectedFromAccountDeletion,
  signOutAppAndSupabaseSession,
} from '../../../utils/adminAuth';
import { profileSocialStorageValue, stripSocialPlatformPrefixes, type SocialPlatform } from '../../../utils/socialLinks';
import { ShopMobileMenuShopTab } from '../../../components/ShopMobileMenuShopTab';
import { ShopMobileMenuToolsTab } from '../../../components/ShopMobileMenuToolsTab';
import { signInHrefWithReturnTo } from '../../../utils/signInReturnTo';
import { ACCOUNT_MAIN_COLUMN_MIN_HEIGHT, MENU_TOGGLE_PANEL_HEIGHT } from '../../../layouts/menuToggleHeights';

const inputBaseStyle: React.CSSProperties = {
  fontFamily: '"Futura PT Demi"',
  fontSize: '11px',
  color: 'black',
  width: '100%',
  height: '36px',
  padding: '8px',
  border: '1.3px solid black',
  borderRadius: 0,
  background: 'white',
  boxSizing: 'border-box'
};

const labelStyle: React.CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '11px',
  color: 'black',
  textTransform: 'uppercase',
  fontWeight: '500',
  marginBottom: '6px',
  display: 'block'
};

const sectionHeaderWrapperStyle = { marginBottom: '16px' };
const sectionHeaderTextStyle: React.CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  color: '#EB1C24',
  fontSize: '12px',
  fontWeight: '500',
  margin: 0,
  textTransform: 'uppercase'
};

const formatPhoneWithHyphens = (value: string): string => {
  const digits = (value || '').replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
};

function SettingsPage() {
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
  const [mobileMenuActiveTab, setMobileMenuActiveTab] = useState<'SHOP' | 'TOOLS' | 'BRAND'>(() => {
    const pathname = window.location.pathname;
    if (pathname.includes('/tools') || pathname === '/tools/gift-card') return 'TOOLS';
    if (pathname.includes('/brand') || pathname.includes('/about') || pathname.includes('/contact') || pathname.includes('/faq') || pathname.includes('/reviews') || pathname.includes('/terms')) return 'BRAND';
    return 'SHOP';
  });
  const [mobileMenuExpandedItems, setMobileMenuExpandedItems] = useState<string[]>([]);
  const [isSignedIn] = useState(() => {
    try {
      return typeof window !== 'undefined' && localStorage.getItem('isSignedIn') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [userData, setUserData] = useState<any>(() => {
    try {
      if (typeof window === 'undefined') return null;
      const currentUser = localStorage.getItem('currentUser');
      return currentUser ? JSON.parse(currentUser) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [youtube, setYoutube] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [twitter, setTwitter] = useState('');
  const [newsletter, setNewsletter] = useState(true);
  const [sales, setSales] = useState(true);
  const [orderTracking, setOrderTracking] = useState(true);

  const persistNotificationPrefs = (updates: { newsletter?: boolean; sales?: boolean; orderTracking?: boolean }) => {
    try {
      const email = (userData?.email || '').trim().toLowerCase();
      if (!email) return;
      const current = localStorage.getItem('currentUser');
      if (!current) return;
      const parsed = JSON.parse(current);
      if ((parsed.email || '').trim().toLowerCase() !== email) return;
      const stored: Record<string, boolean> = {};
      if (updates.newsletter !== undefined) stored.notificationNewsletter = updates.newsletter;
      if (updates.sales !== undefined) stored.notificationSales = updates.sales;
      if (updates.orderTracking !== undefined) stored.notificationOrderTracking = updates.orderTracking;
      if (Object.keys(stored).length === 0) return;
      const next = { ...parsed, ...stored };
      localStorage.setItem('currentUser', JSON.stringify(next));
      const registered = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const idx = registered.findIndex((u: any) => (u.email || '').trim().toLowerCase() === email);
      if (idx !== -1) {
        registered[idx] = { ...registered[idx], ...stored };
        localStorage.setItem('registeredUsers', JSON.stringify(registered));
      }
      setUserData((prev: any) => (prev ? { ...prev, ...stored } : prev));
      void pushFullSettingsProfileToCloud({
        notif: stored as Partial<{
          notificationNewsletter: boolean;
          notificationSales: boolean;
          notificationOrderTracking: boolean;
        }>,
      });
    } catch (_) {}
  };
  const [ordersAnimations, setOrdersAnimations] = useState(() => {
    try {
      if (typeof window === 'undefined') return true;
      const key = getPerUserKey(PER_USER_KEYS.ordersPageAnimationsEnabled, getCurrentUserEmailFromStorage());
      const v = localStorage.getItem(key);
      return v !== 'false';
    } catch {
      return true;
    }
  });
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);
  const [socialViewMode, setSocialViewMode] = useState<Record<string, boolean>>({ facebook: false, instagram: false, youtube: false, tiktok: false, twitter: false });
  const [resetOldPassword, setResetOldPassword] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetPasswordError, setResetPasswordError] = useState('');
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null);
  const [personalInfoSaveMessage, setPersonalInfoSaveMessage] = useState<string | null>(null);
  const canEditAdminBirthday = isAyoteenzAdminAccount(userData);

  /** Optional snapshots so we PATCH the value just saved (avoids stale React state on the same tick). */
  type PushFullOpts = {
    personal?: Partial<{ firstName: string; lastName: string; birthday: string; phoneNumber: string }>;
    notif?: Partial<{
      notificationNewsletter: boolean;
      notificationSales: boolean;
      notificationOrderTracking: boolean;
    }>;
    /** Default true. Set false for background “sync form to cloud” on mount so we don’t log a fake settings change. */
    recordActivity?: boolean;
  };

  /**
   * Push the full Settings form (personal + socials + notifications + admin role) to Supabase in one PATCH
   * so `profiles` matches what the Settings page shows for each client.
   */
  const pushFullSettingsProfileToCloud = useCallback(
    async (opts?: PushFullOpts): Promise<boolean> => {
      const email = (userData?.email || '').trim().toLowerCase();
      if (!email || !isSupabaseConfigured()) return false;
      const supabase = getSupabase();
      if (!supabase) return false;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return false;
      const social = {
        facebook: profileSocialStorageValue('facebook', facebook),
        instagram: profileSocialStorageValue('instagram', instagram),
        youtube: profileSocialStorageValue('youtube', youtube),
        tiktok: profileSocialStorageValue('tiktok', tiktok),
        twitter: profileSocialStorageValue('twitter', twitter),
      };
      const fn = (opts?.personal?.firstName ?? firstName).trim();
      const ln = (opts?.personal?.lastName ?? lastName).trim();
      const bd = (opts?.personal?.birthday ?? birthday).trim();
      const ph = (opts?.personal?.phoneNumber ?? phoneNumber).replace(/\D/g, '');
      const payload: Record<string, unknown> = {
        firstName: fn,
        lastName: ln,
        birthday: bd,
        phoneNumber: ph,
        ...social,
        notificationNewsletter: opts?.notif?.notificationNewsletter ?? newsletter,
        notificationSales: opts?.notif?.notificationSales ?? sales,
        notificationOrderTracking: opts?.notif?.notificationOrderTracking ?? orderTracking,
      };
      if (isAdminEmail(email)) {
        payload.role = 'admin';
      }
      try {
        const ok = await patchProfileWithRetryQueue(payload);
        if (ok && opts?.recordActivity !== false) {
          trackActivity('profile_update', { section: 'settings' });
        }
        return ok;
      } catch {
        return false;
      }
    },
    [
      userData?.email,
      firstName,
      lastName,
      birthday,
      phoneNumber,
      facebook,
      instagram,
      youtube,
      tiktok,
      twitter,
      newsletter,
      sales,
      orderTracking,
    ]
  );

  const settingsFullSyncOnceRef = useRef(false);
  useEffect(() => {
    if (!userData?.email || !isSignedIn) return;
    if (!isSupabaseConfigured()) return;
    if (settingsFullSyncOnceRef.current) return;
    const t = window.setTimeout(() => {
      settingsFullSyncOnceRef.current = true;
      void pushFullSettingsProfileToCloud({ recordActivity: false });
    }, 1200);
    return () => window.clearTimeout(t);
  }, [userData?.email, isSignedIn, pushFullSettingsProfileToCloud]);

  const socialPrefixes: Record<string, string> = {
    facebook: 'FACEBOOK.COM/',
    instagram: 'INSTAGRAM.COM/',
    youtube: 'YOUTUBE.COM/',
    tiktok: 'TIKTOK.COM/',
    twitter: 'X.COM/'
  };

  const persistSocials = () => {
    try {
      const email = (userData?.email || '').trim().toLowerCase();
      if (!email) return;
      const payload = {
        facebook: profileSocialStorageValue('facebook', facebook),
        instagram: profileSocialStorageValue('instagram', instagram),
        youtube: profileSocialStorageValue('youtube', youtube),
        tiktok: profileSocialStorageValue('tiktok', tiktok),
        twitter: profileSocialStorageValue('twitter', twitter),
      };
      const registered = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const idx = registered.findIndex((u: any) => (u.email || '').trim().toLowerCase() === email);
      if (idx !== -1) {
        registered[idx] = { ...registered[idx], ...payload };
        localStorage.setItem('registeredUsers', JSON.stringify(registered));
      }
      const current = localStorage.getItem('currentUser');
      if (current) {
        const parsed = JSON.parse(current);
        if ((parsed.email || '').trim().toLowerCase() === email) {
          localStorage.setItem('currentUser', JSON.stringify({ ...parsed, ...payload }));
        }
      }
      setUserData((prev: any) => (prev ? { ...prev, ...payload } : prev));
      pushFullSettingsProfileToCloud();
    } catch (_) {}
  };

  const persistPersonalInfo = (updates: { birthday?: string; firstName?: string; lastName?: string; phoneNumber?: string }) => {
    try {
      const email = (userData?.email || '').trim().toLowerCase();
      if (!email) return;
      const payload: Record<string, string> = {};
      if (updates.birthday !== undefined) payload.birthday = updates.birthday.trim();
      if (updates.firstName !== undefined) payload.firstName = updates.firstName.trim();
      if (updates.lastName !== undefined) payload.lastName = updates.lastName.trim();
      if (updates.phoneNumber !== undefined) payload.phoneNumber = updates.phoneNumber.trim();
      if (Object.keys(payload).length === 0) return;
      // Keep localStorage in sync with both camelCase and snake_case so form and API stay consistent
      const payloadWithSnake = { ...payload } as Record<string, string>;
      if (payload.firstName !== undefined) payloadWithSnake.first_name = payload.firstName;
      if (payload.lastName !== undefined) payloadWithSnake.last_name = payload.lastName;
      if (payload.phoneNumber !== undefined) payloadWithSnake.phone_number = payload.phoneNumber;
      const registered = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const idx = registered.findIndex((u: any) => (u.email || '').trim().toLowerCase() === email);
      if (idx !== -1) {
        registered[idx] = { ...registered[idx], ...payloadWithSnake };
        localStorage.setItem('registeredUsers', JSON.stringify(registered));
      }
      const current = localStorage.getItem('currentUser');
      if (current) {
        const parsed = JSON.parse(current);
        if ((parsed.email || '').trim().toLowerCase() === email) {
          localStorage.setItem('currentUser', JSON.stringify({ ...parsed, ...payloadWithSnake }));
        }
      }
      setUserData((prev: any) => (prev ? { ...prev, ...payloadWithSnake } : prev));
      // One full PATCH so Supabase matches the whole Settings form (use payload so names are not stale vs state).
      if (Object.keys(payload).length > 0) {
        void pushFullSettingsProfileToCloud({
          personal: {
            firstName: payload.firstName ?? firstName,
            lastName: payload.lastName ?? lastName,
            birthday: payload.birthday ?? birthday,
            phoneNumber: (payload.phoneNumber ?? phoneNumber).replace(/\D/g, ''),
          },
        })
          .then((ok) => {
            if (ok) setPersonalInfoSaveMessage('PERSONAL INFO SAVED.');
            else setPersonalInfoSaveMessage('PERSONAL INFO QUEUED. WILL SYNC WHEN ONLINE.');
          })
          .catch(() => setPersonalInfoSaveMessage('PERSONAL INFO SAVE FAILED.'));
      }
    } catch (_) {}
  };

  const handleResetPasswordSubmit = async () => {
    setResetPasswordError('');
    if (!isSupabaseConfigured()) {
      setResetPasswordError('Password changes require Supabase sign-in.');
      return;
    }
    const supabase = getSupabase();
    if (!supabase) {
      setResetPasswordError('Sign in again to change your password.');
      return;
    }
    const email = (userData?.email || '').trim().toLowerCase();
    if (!email) return;
    if (resetNewPassword.trim().length === 0) {
      setResetPasswordError('Enter a new password.');
      return;
    }
    if (resetNewPassword.trim() !== resetConfirmPassword.trim()) {
      setResetPasswordError('New password and confirm do not match.');
      return;
    }
    try {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email,
        password: resetOldPassword.trim(),
      });
      if (verifyError) {
        setResetPasswordError('Current password is incorrect.');
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({ password: resetNewPassword.trim() });
      if (updateError) {
        setResetPasswordError(updateError.message || 'Failed to update password.');
        return;
      }
      setResetOldPassword('');
      setResetNewPassword('');
      setResetConfirmPassword('');
      setShowResetPasswordForm(false);
    } catch {
      setResetPasswordError('Failed to update password.');
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteAccountError(null);
    setShowDeleteAccountConfirm(false);
    const currentUserForDelete = userData ?? (() => {
      try {
        const raw = localStorage.getItem('currentUser');
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    })();
    if (isProtectedFromAccountDeletion(currentUserForDelete)) {
      setDeleteAccountError('This admin account cannot be deleted.');
      return;
    }
    try {
      // Delete the user from Supabase Auth first (while still signed in) so they cannot sign back in
      if (isSupabaseConfigured()) {
        try {
          await deleteAccount({ deletedFrom: getDeletedPlatformFromUserAgent() });
        } catch (e) {
          console.error('Delete account API failed:', e);
          const msg = typeof (e as any)?.message === 'string' ? (e as any).message : String(e ?? '');
          const raw = (msg || '').trim().toLowerCase();
          const isNetworkError = /load\s*failed|failed\s*to\s*fetch|failed\s*to\s*load|network\s*error|networkrequestfailed|request\s*failed/i.test(raw) || raw === 'load failed';
          const isServerError = /function_invocation_failed|server\s*error|a server error has occurred/i.test(raw);
          let displayMsg: string;
          if (isNetworkError) {
            const isLocal = typeof window !== 'undefined' && /localhost|127\.0\.0\.1|^10\.|^192\.168\.|^172\.(1[6-9]|2[0-9]|3[01])\./i.test(window.location?.hostname || '');
            displayMsg = isLocal
              ? 'Network error. When running locally, set VITE_API_BASE or VITE_DEV_PROXY_TARGET in .env.local to your deployed app URL (e.g. https://your-app.vercel.app), then restart the dev server so Delete Account can reach the API.'
              : 'Network error. Check your connection and try again. If the problem continues, check that the app is using the correct API URL and that the delete-account API is deployed.';
          } else if (isServerError) {
            displayMsg = 'The server is temporarily unable to process account deletion. Please try again later or contact support.';
          } else {
            displayMsg = msg || 'Could not delete account. Try again or contact support.';
          }
          setDeleteAccountError(displayMsg);
          return;
        }
        const supabase = getSupabase();
        if (supabase) await supabase.auth.signOut().catch(() => {});
      }
      const currentUser = userData ? userData : (() => {
        try {
          const raw = localStorage.getItem('currentUser');
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      })();
      const email = (currentUser?.email || '').trim().toLowerCase();
      if (email) {
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const userToDelete = registeredUsers.find((u: any) => (u.email || '').toLowerCase() === email);
        const userRecord = userToDelete || currentUser;
        const deletedUsers = JSON.parse(localStorage.getItem('deletedUsers') || '[]');
        deletedUsers.push({
          ...userRecord,
          deletedAt: new Date().toISOString(),
          deletedFrom: getDeletedPlatformFromUserAgent()
        });
        localStorage.setItem('deletedUsers', JSON.stringify(deletedUsers));
        const filtered = registeredUsers.filter((u: any) => (u.email || '').toLowerCase() !== email);
        localStorage.setItem('registeredUsers', JSON.stringify(filtered));
      }
      clearAppAuth();
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('sb-') && k.endsWith('-auth-token')) keysToRemove.push(k);
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch (_) {}
      window.location.href = '/sign-in';
    } catch (e) {
      console.error('Delete account failed', e);
      const msg = typeof (e as any)?.message === 'string' ? (e as any).message : String(e ?? '');
      const raw = (msg || '').trim().toLowerCase();
      const isNetworkError = /load\s*failed|failed\s*to\s*fetch|failed\s*to\s*load|network\s*error|networkrequestfailed|request\s*failed/i.test(raw) || raw === 'load failed';
      const isServerError = /function_invocation_failed|server\s*error|a server error has occurred/i.test(raw);
      let displayMsg: string;
      if (isNetworkError) {
        const isLocal = typeof window !== 'undefined' && /localhost|127\.0\.0\.1|^10\.|^192\.168\.|^172\.(1[6-9]|2[0-9]|3[01])\./i.test(window.location?.hostname || '');
        displayMsg = isLocal
          ? 'Network error. When running locally, set VITE_API_BASE or VITE_DEV_PROXY_TARGET in .env.local to your deployed app URL (e.g. https://your-app.vercel.app), then restart the dev server so Delete Account can reach the API.'
          : 'Network error. Check your connection and try again. If the problem continues, check that the app is using the correct API URL and that the delete-account API is deployed.';
      } else if (isServerError) {
        displayMsg = 'The server is temporarily unable to process account deletion. Please try again later or contact support.';
      } else {
        displayMsg = msg || 'Could not delete account. Try again.';
      }
      setDeleteAccountError(displayMsg);
    }
  };

  const SETTINGS_SOCIAL_KEY_TO_PLATFORM: Record<string, SocialPlatform> = {
    facebook: 'facebook',
    instagram: 'instagram',
    youtube: 'youtube',
    tiktok: 'tiktok',
    twitter: 'twitter',
  };

  /** Show handle-only in inputs; strip https/www and repeated host segments (e.g. pasted URLs). */
  const parseSocialHandle = (key: string, raw: string): string => {
    const p = SETTINGS_SOCIAL_KEY_TO_PLATFORM[key];
    if (!p) return (raw || '').trim().replace(/^@/, '').trim();
    return stripSocialPlatformPrefixes(p, raw);
  };

  // Format birthday as MM/DD/YYYY (same as sign-in page)
  const formatBirthday = (value: string): string => {
    const numbers = (value || '').replace(/\D/g, '');
    const limited = numbers.slice(0, 8);
    if (limited.length <= 2) return limited;
    if (limited.length <= 4) return `${limited.slice(0, 2)}/${limited.slice(2)}`;
    return `${limited.slice(0, 2)}/${limited.slice(2, 4)}/${limited.slice(4)}`;
  };

  // Normalize stored birthday (e.g. "083089" or "08301989") to MM/DD/YYYY for display
  const normalizeBirthdayDisplay = (raw: string): string => {
    const v = (raw || '').trim();
    if (!v) return '';
    const numbers = v.replace(/\D/g, '');
    if (numbers.length === 6) {
      const mm = numbers.slice(0, 2);
      const dd = numbers.slice(2, 4);
      const yy = numbers.slice(4, 6);
      const year = parseInt(yy, 10) >= 50 ? `19${yy}` : `20${yy}`;
      return `${mm}/${dd}/${year}`;
    }
    if (numbers.length === 8) return formatBirthday(numbers);
    return v;
  };

  useEffect(() => {
    if (userData) {
      setFirstName((userData.firstName || userData.first_name || '').toString().toUpperCase());
      setLastName((userData.lastName || userData.last_name || '').toString().toUpperCase());
      setEmail((userData.email || '').toUpperCase());
      const normalizedBirthday = normalizeBirthdayDisplay(userData.birthday || '');
      setBirthday(normalizedBirthday);
      setPhoneNumber(formatPhoneWithHyphens((userData.phoneNumber || userData.phone_number || userData.phone || '').toString()));
      setFacebook(parseSocialHandle('facebook', userData.facebook || ''));
      setInstagram(parseSocialHandle('instagram', userData.instagram || ''));
      setYoutube(parseSocialHandle('youtube', userData.youtube || ''));
      setTiktok(parseSocialHandle('tiktok', userData.tiktok || ''));
      setTwitter(parseSocialHandle('twitter', userData.twitter || ''));
      setNewsletter(userData.notificationNewsletter !== false);
      setSales(userData.notificationSales !== false);
      setOrderTracking(userData.notificationOrderTracking !== false);
    } else if (!isSignedIn) {
      setEmail('BRUNO203@GMAIL.COM');
      setFirstName('KRISTIN');
      setLastName('WATSON');
      setBirthday('08/30/1989');
      setPhoneNumber('');
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
      setBirthday('');
      setPhoneNumber('');
      setFacebook('');
      setInstagram('');
      setYoutube('');
      setTiktok('');
      setTwitter('');
    }
  }, [userData, isSignedIn]);

  // Clear settings card badge when user visits this page
  useEffect(() => {
    try {
      const currentUser = localStorage.getItem('currentUser');
      const user = currentUser ? JSON.parse(currentUser) : null;
      const email = user?.email;
      if (email) {
        localStorage.removeItem(`settingsAlert_${email}`);
        window.dispatchEvent(new CustomEvent('accountCardAlertsViewed'));
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    const handleCartCountUpdate = (event: CustomEvent) => setCartCount(event.detail);
    const handleStorageChange = () => {
      try {
        setCartCount(parseInt(localStorage.getItem('cartCount') || '0', 10));
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) setUserData(JSON.parse(currentUser));
      } catch (e) {
        setCartCount(0);
      }
    };
    window.addEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
    window.addEventListener('cartUpdated', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('signInStateChanged', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    return () => {
      window.removeEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
      window.removeEventListener('cartUpdated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('signInStateChanged', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  const handleMobileMenuToggle = () => setShowMobileMenu(!showMobileMenu);
  const handleMobileMenuTabClick = (tab: 'SHOP' | 'TOOLS' | 'BRAND') => setMobileMenuActiveTab(tab);
  const handleMobileMenuItemToggle = (item: string) => {
    setMobileMenuExpandedItems(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };
  const handleMobileMenuSignInToggle = () => {
    if (!isSignedIn) {
      navigate(signInHrefWithReturnTo(location));
      return;
    }
    void (async () => {
      await signOutAppAndSupabaseSession();
      setShowMobileMenu(false);
      navigate(signInHrefWithReturnTo(location));
    })();
  };
  const handleBack = () => navigate('/account');

  const ToggleSwitch = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      style={{
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        border: '1px solid black',
        background: on ? '#ffffff' : '#e5e5e5',
        cursor: 'pointer',
        padding: 0,
        position: 'relative',
        flexShrink: 0
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '2px',
          left: on ? '22px' : '2px',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: on ? '#EB1C24' : 'white',
          border: '1px solid #000',
          transition: 'left 0.2s ease'
        }}
      />
    </button>
  );

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      <style>{`
        .social-input-no-focus-ring:focus {
          outline: none !important;
          box-shadow: none !important;
        }
        .settings-personal-input::placeholder {
          color: #000000;
          font-family: "Futura PT Demi", sans-serif;
          opacity: 1;
        }
      `}</style>
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
      <div className="relative z-10">
        <div className="flex flex-col py-5 px-4" style={{ minWidth: '100%', maxWidth: 'none', overflow: 'visible' }}>
          {/* HEADER */}
          <div
            className="border-solid border-black flex justify-center items-center py-3 w-full mb-5 px-5 bg-white/60 backdrop-blur-sm relative"
            style={{ border: '1.3px solid black' }}
          >
            <div className="flex gap-5 absolute left-4">
              {showMobileMenu ? (
                <>
                  <button onClick={() => navigate(isSignedIn ? '/account' : signInHrefWithReturnTo(location))} className="cursor-pointer" style={{ height: '15px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(4px)' }}>
                    <img alt="Account" width="16" height="16" src="/assets/NOIR/account-icon.svg" />
                  </button>
                  <button onClick={() => navigate(isSignedIn ? '/wishlist' : signInHrefWithReturnTo(location))} className="cursor-pointer" style={{ height: '21px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(2px)' }}>
                    <img alt="Wishlist" width="18" height="18" src="/assets/wishlist-heart.svg" />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleBack} className="cursor-pointer" style={{ height: '15px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important' }}>
                    <img alt="Back" width="21" height="15" src="/assets/back-button.svg" />
                  </button>
                </>
              )}
            </div>
            <p className="text-sm" style={{ fontFamily: '"Futura PT Book"', transform: 'translateY(1px)' }}>
              {showMobileMenu ? (
                <>
                  <span style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }} onClick={() => {
                  try {
                    navigate('/lobby');
                  } catch {
                    navigate('/lobby');
                  }
                }}>HOME &gt;</span>{' '}
                  <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>MENU</span>
                </>
              ) : (
                <>
                  <span style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }} onClick={() => navigate('/account')}>ACCOUNT &gt;</span>{' '}
                  <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>SETTINGS</span>
                </>
              )}
            </p>
            <div className="gap-5 flex absolute" style={{ right: '17px' }}>
              <div style={{ transform: `translateX(${cartCount === 0 ? 7 : 5}px)` }}>
                <DynamicCartIcon count={cartCount} width={22} height={19} variant="nav" />
              </div>
              <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="17" height="18" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="cursor-pointer" onClick={handleMobileMenuToggle} style={{ marginTop: '2px' }}>
                  <path d="M0 0H15.75V0.7H7.875H0V0ZM5.25 6.7H10.5H15.375V7.4H10.5H5.25V6.7ZM0 13.1H15.75V13.8H0V13.1Z" fill="black" />
                </svg>
              </div>
            </div>
          </div>

          {showMobileMenu ? (
            <div
              className="border border-black flex flex-col pt-6 pb-4 px-5 bg-white/60 backdrop-blur-sm w-full"
              style={{ borderWidth: '1.3px', minWidth: '100%', maxWidth: 'none', overflow: 'visible', backgroundColor: 'rgba(255, 255, 255, 0.6)', minHeight: MENU_TOGGLE_PANEL_HEIGHT, height: MENU_TOGGLE_PANEL_HEIGHT }}
            >
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', paddingTop: '20px', flex: 1, minHeight: 0, position: 'relative' }}>
                <div className="flex justify-center gap-8" style={{ marginBottom: '30px' }}>
                  {(['SHOP', 'TOOLS', 'BRAND'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => handleMobileMenuTabClick(tab)}
                      style={{
                        fontFamily: mobileMenuActiveTab === tab ? '"Futura PT Medium"' : '"Futura PT Book"',
                        fontSize: '14px',
                        color: mobileMenuActiveTab === tab ? '#EB1C24' : 'black',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        borderBottom: mobileMenuActiveTab === tab ? '1px solid #EB1C24' : 'none',
                        borderTop: 'none',
                        borderLeft: 'none',
                        borderRight: 'none',
                        paddingBottom: '4px',
                        background: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div style={{ flex: '1', overflowY: 'auto', marginBottom: '20px', minHeight: '0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                    {mobileMenuActiveTab === 'TOOLS' ? (

                      <ShopMobileMenuToolsTab

                        navigate={navigate}

                        closeMenu={() => setShowMobileMenu(false)}

                        labelTranslateX="13px"

                      />
                    ) : mobileMenuActiveTab === 'BRAND' ? (
                      <BrandMenuLinks onClose={() => setShowMobileMenu(false)} />
                    ) : (
                                            <ShopMobileMenuShopTab
                                              navigate={navigate}
                                              mobileMenuExpandedItems={mobileMenuExpandedItems}
                                              handleMobileMenuItemToggle={handleMobileMenuItemToggle}
                                              closeSubItemMenu={() => setShowMobileMenu(false)}
                                              labelTranslateX="13px"
                                            />
                    )}
                  </div>
                </div>
                <div className="flex justify-center" style={{ marginBottom: '20px', marginTop: 'auto' }}>
                  <span onClick={handleMobileMenuSignInToggle} style={{ fontFamily: '"Futura PT Medium"', fontSize: '14px', color: '#EB1C24', fontWeight: '500', textTransform: 'uppercase', cursor: 'pointer' }}>
                    {isSignedIn ? 'SIGN OUT' : 'SIGN IN'}
                  </span>
                </div>
                <div style={{ marginBottom: '20px' }}><SocialMenuIcons /></div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 mb-5">
              <div
                className="border border-black bg-white/60 backdrop-blur-sm p-4 w-full"
                style={{ borderWidth: '1.3px', minHeight: ACCOUNT_MAIN_COLUMN_MIN_HEIGHT }}
              >
                {/* Personal Information */}
                <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={sectionHeaderWrapperStyle}>
                  <h2 style={sectionHeaderTextStyle}>PERSONAL INFORMATION</h2>
                </div>
                <div style={{ marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ ...labelStyle, marginBottom: '4px' }}>FIRST NAME</label>
                    <input
                      type="text"
                      value={firstName}
                      placeholder="FIRST NAME"
                      className="settings-personal-input"
                      onChange={(e) => {
                        const nextFirst = e.target.value.toUpperCase();
                        setFirstName(nextFirst);
                        // Persist immediately so route changes/back nav do not lose edits before blur.
                        persistPersonalInfo({ firstName: nextFirst.trim(), lastName: lastName.trim() });
                      }}
                      onBlur={() => persistPersonalInfo({ firstName: firstName.trim(), lastName: lastName.trim() })}
                      style={{ ...inputBaseStyle, marginBottom: 0 }}
                    />
                  </div>
                  <div>
                    <label style={{ ...labelStyle, marginBottom: '4px' }}>LAST NAME</label>
                    <input
                      type="text"
                      value={lastName}
                      placeholder="LAST NAME"
                      className="settings-personal-input"
                      onChange={(e) => {
                        const nextLast = e.target.value.toUpperCase();
                        setLastName(nextLast);
                        // Persist immediately so route changes/back nav do not lose edits before blur.
                        persistPersonalInfo({ firstName: firstName.trim(), lastName: nextLast.trim() });
                      }}
                      onBlur={() => persistPersonalInfo({ firstName: firstName.trim(), lastName: lastName.trim() })}
                      style={{ ...inputBaseStyle, marginBottom: 0 }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: '20px', width: 'calc((100% - 12px) / 2)' }}>
                  <label style={{ ...labelStyle, marginBottom: '4px' }}>BIRTHDAY</label>
                  <input
                    type="text"
                    value={birthday}
                    placeholder="MM/DD/YYYY"
                    className="settings-personal-input"
                    readOnly={!canEditAdminBirthday}
                    onChange={(e) => canEditAdminBirthday && setBirthday(formatBirthday(e.target.value))}
                    onBlur={() => canEditAdminBirthday && persistPersonalInfo({ birthday })}
                    style={{ ...inputBaseStyle, marginBottom: 0, ...(!canEditAdminBirthday && { cursor: 'default', color: '#808080' }) }}
                  />
                </div>
                <div style={{ marginBottom: '20px', width: 'calc((100% - 12px) / 2)' }}>
                  <label style={{ ...labelStyle, marginBottom: '4px' }}>PHONE NUMBER</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    placeholder="(555) 555-5555"
                    className="settings-personal-input"
                    onChange={(e) => {
                      const nextPhone = formatPhoneWithHyphens(e.target.value);
                      setPhoneNumber(nextPhone);
                      persistPersonalInfo({ phoneNumber: nextPhone.trim() });
                    }}
                    onBlur={() => persistPersonalInfo({ phoneNumber: phoneNumber.trim() })}
                    style={{ ...inputBaseStyle, marginBottom: 0 }}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>EMAIL</label>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    placeholder="EMAIL@EXAMPLE.COM"
                    className="settings-personal-input"
                    style={{ ...inputBaseStyle, fontFamily: '"Futura PT Demi"', color: '#808080', textTransform: 'uppercase' }}
                  />
                </div>
                {personalInfoSaveMessage ? (
                  <p
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '9px',
                      margin: '-8px 0 14px 0',
                      textTransform: 'uppercase',
                      color: personalInfoSaveMessage.includes('FAILED') ? '#EB1C24' : '#808080',
                    }}
                  >
                    {personalInfoSaveMessage}
                  </p>
                ) : null}
                <div style={{ marginBottom: '20px' }}>
                  {!showResetPasswordForm && <label style={labelStyle}>PASSWORD</label>}
                  {!showResetPasswordForm ? (
                    <>
                      <input
                        type="password"
                        readOnly
                        value="••••••••••"
                        autoComplete="current-password"
                        aria-label="Password"
                        style={{ ...inputBaseStyle, marginBottom: 0 }}
                      />
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          width: '100%',
                          marginTop: '6px'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setShowResetPasswordForm(true)}
                          style={{
                            fontFamily: '"Futura PT Book"',
                            fontSize: '9px',
                            color: '#EB1C24',
                            textTransform: 'uppercase',
                            fontWeight: '500',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          RESET PASSWORD
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <label style={{ ...labelStyle, marginBottom: '4px' }}>CURRENT PASSWORD</label>
                      <input
                        type="text"
                        value={resetOldPassword}
                        onChange={(e) => setResetOldPassword(e.target.value)}
                        className="password-field"
                        style={{ ...inputBaseStyle, marginBottom: '12px' }}
                      />
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ ...labelStyle, marginBottom: '4px' }}>NEW PASSWORD</label>
                        <input
                          type="text"
                          value={resetNewPassword}
                          onChange={(e) => setResetNewPassword(e.target.value)}
                          className="password-field"
                          style={inputBaseStyle}
                        />
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ ...labelStyle, marginBottom: '4px' }}>CONFIRM PASSWORD</label>
                        <input
                          type="text"
                          value={resetConfirmPassword}
                          onChange={(e) => setResetConfirmPassword(e.target.value)}
                          className="password-field"
                          style={inputBaseStyle}
                        />
                      </div>
                      {resetPasswordError && (
                        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#EB1C24', margin: '0 0 8px 0' }}>
                          {resetPasswordError}
                        </p>
                      )}
                      <div className="flex justify-between items-center" style={{ marginTop: '8px', transform: 'translateY(-5px)' }}>
                        <button
                          type="button"
                          onClick={handleResetPasswordSubmit}
                          style={{
                            fontFamily: '"Futura PT Book"',
                            fontSize: '9px',
                            color: '#EB1C24',
                            textTransform: 'uppercase',
                            fontWeight: '500',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            transform: 'translateX(2px)'
                          }}
                        >
                          RESET PASSWORD
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowResetPasswordForm(false);
                            setResetOldPassword('');
                            setResetNewPassword('');
                            setResetConfirmPassword('');
                            setResetPasswordError('');
                          }}
                          style={{
                            fontFamily: '"Futura PT Book"',
                            fontSize: '9px',
                            color: '#EB1C24',
                            textTransform: 'uppercase',
                            fontWeight: '500',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            transform: 'translateX(-2px)'
                          }}
                        >
                          CANCEL
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>SOCIALS</label>
                  {(['instagram', 'twitter', 'tiktok', 'facebook', 'youtube'] as const).map((key) => {
                    const prefix = socialPrefixes[key];
                    const value = key === 'facebook' ? facebook : key === 'instagram' ? instagram : key === 'youtube' ? youtube : key === 'tiktok' ? tiktok : twitter;
                    const setValue = key === 'facebook' ? setFacebook : key === 'instagram' ? setInstagram : key === 'youtube' ? setYoutube : key === 'tiktok' ? setTiktok : setTwitter;
                    const isView = socialViewMode[key];
                    return (
                      <div key={key} style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', border: '1.3px solid black', background: 'white', boxSizing: 'border-box', minHeight: '36px', paddingLeft: '8px', paddingRight: '8px' }}>
                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000000', flexShrink: 0, textTransform: 'uppercase' }}>{prefix}</span>
                        {isView ? (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={() => setSocialViewMode((s) => ({ ...s, [key]: false }))}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSocialViewMode((s) => ({ ...s, [key]: false })); }}
                            style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#EB1C24', flex: 1, cursor: 'pointer', padding: '8px 0', minHeight: '36px', display: 'flex', alignItems: 'center', textTransform: 'uppercase' }}
                          >
                            {value ? value.replace(/^@/, '').toUpperCase() : '\u00A0'}
                          </span>
                        ) : (
                          <input
                            type="text"
                            value={value.replace(/^@/, '')}
                            onChange={(e) => setValue(e.target.value.replace(/^@/, '').toUpperCase())}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                persistSocials();
                                setSocialViewMode((s) => ({ ...s, [key]: true }));
                              }
                            }}
                            onBlur={() => { persistSocials(); setSocialViewMode((s) => ({ ...s, [key]: true })); }}
                            placeholder=""
                            style={{
                              ...inputBaseStyle,
                              fontFamily: '"Futura PT Medium"',
                              fontSize: '11px',
                              border: 'none',
                              marginBottom: 0,
                              paddingLeft: 0,
                              flex: 1,
                              minWidth: 0,
                              color: '#EB1C24',
                              textTransform: 'uppercase',
                              outline: 'none',
                              boxShadow: 'none'
                            }}
                            className="social-input-no-focus-ring"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Notifications */}
                <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ ...sectionHeaderWrapperStyle, marginTop: '8px' }}>
                  <h2 style={sectionHeaderTextStyle}>NOTIFICATIONS</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                  <div className="flex items-center justify-between" style={{ width: '100%' }}>
                    <span style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: 'black', textTransform: 'uppercase', fontWeight: '500', lineHeight: '1.2' }}>Newsletter</span>
                    <ToggleSwitch
                      on={newsletter}
                      onClick={() => {
                        const next = !newsletter;
                        setNewsletter(next);
                        persistNotificationPrefs({ newsletter: next });
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between" style={{ width: '100%' }}>
                    <span style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: 'black', textTransform: 'uppercase', fontWeight: '500', lineHeight: '1.2' }}>Alerts</span>
                    <ToggleSwitch
                      on={sales}
                      onClick={() => {
                        const next = !sales;
                        setSales(next);
                        persistNotificationPrefs({ sales: next });
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between" style={{ width: '100%' }}>
                    <span style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: 'black', textTransform: 'uppercase', fontWeight: '500', lineHeight: '1.2' }}>Order Tracking</span>
                    <ToggleSwitch
                      on={orderTracking}
                      onClick={() => {
                        const next = !orderTracking;
                        setOrderTracking(next);
                        persistNotificationPrefs({ orderTracking: next });
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between" style={{ width: '100%' }}>
                    <span style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: 'black', textTransform: 'uppercase', fontWeight: '500', lineHeight: '1.2' }}>Animations</span>
                    <ToggleSwitch
                      on={ordersAnimations}
                      onClick={() => {
                        const next = !ordersAnimations;
                        setOrdersAnimations(next);
                        try {
                          const email = userData?.email ?? getCurrentUserEmailFromStorage();
                          const key = getPerUserKey(PER_USER_KEYS.ordersPageAnimationsEnabled, email);
                          localStorage.setItem(key, next ? 'true' : 'false');
                          window.dispatchEvent(new CustomEvent('ordersAnimationsChanged', { detail: next }));
                        } catch (_) {}
                      }}
                    />
                  </div>
                </div>

                {/* Help Center */}
                <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ ...sectionHeaderWrapperStyle, marginTop: '8px' }}>
                  <h2 style={sectionHeaderTextStyle}>HELP CENTER</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '6px' }}>
                  <button
                    type="button"
                    onClick={() => navigate('/brand/faq')}
                    style={{
                      fontFamily: '"Futura PT Book"',
                      fontSize: '12px',
                      color: 'black',
                      textTransform: 'uppercase',
                      fontWeight: '500',
                      lineHeight: '1.2',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      textAlign: 'left'
                    }}
                  >
                    FAQ
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/brand/contact')}
                    style={{
                      fontFamily: '"Futura PT Book"',
                      fontSize: '12px',
                      color: 'black',
                      textTransform: 'uppercase',
                      fontWeight: '500',
                      lineHeight: '1.2',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      textAlign: 'left'
                    }}
                  >
                    CONTACT
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/brand/terms')}
                    style={{
                      fontFamily: '"Futura PT Book"',
                      fontSize: '12px',
                      color: 'black',
                      textTransform: 'uppercase',
                      fontWeight: '500',
                      lineHeight: '1.2',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      textAlign: 'left'
                    }}
                  >
                    TERMS OF SERVICE
                  </button>
                </div>
              </div>

              {/* Delete Account - below main card, matches account profile sign out button */}
              <div className="px-0 md:px-0" style={{ marginTop: '-4px', marginBottom: '20px' }}>
                {deleteAccountError && (
                  <p className="text-red-600 text-xs font-futura mb-2" style={{ textTransform: 'uppercase' }}>
                    {deleteAccountError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => { setDeleteAccountError(null); setShowDeleteAccountConfirm(true); }}
                  className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                  style={{
                    borderWidth: '1.3px',
                    color: '#EB1C24',
                    fontFamily: '"Futura PT Medium"',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  DELETE ACCOUNT
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteAccountConfirm}
        onClose={() => { setDeleteAccountError(null); setShowDeleteAccountConfirm(false); }}
        onConfirm={handleDeleteAccount}
        title="DELETE ACCOUNT"
        message={<>ARE YOU SURE YOU WANT TO DELETE YOUR ACCOUNT?<br />THIS ACTION IS PERMANENT & CANNOT BE UNDONE.</>}
        confirmText="CONFIRM"
        cancelText="CANCEL"
        dataAttribute="delete-account-confirm"
      />
    </div>
  );
}

export default SettingsPage;
