import { useState, useEffect, useCallback, useRef } from 'react';
import { useSyncMenuToggleOpenState } from '../../../utils/menuToggleOpenState';
import BrandRedCloseIcon from '../../../components/BrandRedCloseIcon';
import { useNavigate, useLocation } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import BrandMenuLinks from '../../../components/BrandMenuLinks';
import SocialMenuIcons from '../../../components/SocialMenuIcons';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { clearAppAuth, FOUNDER_ACCOUNT_VIEW_AS_CLIENT_KEY, isAdminEmail } from '../../../utils/adminAuth';
import {
  findGiftPromoByNormalizedCode,
  giftPromoRedeemBlockReason,
  parseGiftCardDollars,
  updateBrandPromoCode,
} from '../../../utils/adminBrandCodes';
import { appendDigitalCashDepositAccountAlert } from '../../../utils/orderAccountAlerts';
import { GIFT_CARD_LOAD_CARD_THUMBNAIL_SRC } from '../../../constants/giftCardAssets';
import { ShopMobileMenuShopTab } from '../../../components/ShopMobileMenuShopTab';
import { ShopMobileMenuToolsTab } from '../../../components/ShopMobileMenuToolsTab';
import { signInHrefWithReturnTo } from '../../../utils/signInReturnTo';
import { MENU_TOGGLE_PANEL_HEIGHT } from '../../../layouts/menuToggleHeights';
import { patchProfileWithRetryQueue } from '../../../utils/profileSyncQueue';
import { syncAllFromApi } from '../../../utils/syncFromApi';

/** Uppercase A–Z / 0–9 only, max 12 chars, shown as XXXX-XXXX-XXXX */
function formatGiftBarcodeInput(raw: string): string {
  const alnum = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
  const a = alnum.slice(0, 4);
  const b = alnum.slice(4, 8);
  const c = alnum.slice(8, 12);
  return [a, b, c].filter((p) => p.length > 0).join('-');
}

function toCanonicalBarcode(value: string): string {
  const alnum = value.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 12);
  if (alnum.length !== 12) return '';
  return `${alnum.slice(0, 4)}-${alnum.slice(4, 8)}-${alnum.slice(8, 12)}`;
}

type DigitalCashHistoryEntry = { date: string; transaction: string; amount: number };
type AddToBalanceUiState =
  | { phase: 'idle' }
  | { phase: 'adding'; current: number; total: number }
  | { phase: 'added'; succeeded: number; total: number };
const ADMIN_TEST_DIGITAL_CASH_MIN = 80;
const ADD_TO_BALANCE_SUCCESS_RESET_MS = 2000;
const ADD_TO_BALANCE_MIN_ADDING_MS = 800;
const ADD_TO_BALANCE_PER_CODE_MS = 450;

type GiftBarcodeRedeemResult =
  | { ok: true; dollars: number }
  | { ok: false; error: string };

function redeemGiftBarcode(full: string, seen: Set<string>): GiftBarcodeRedeemResult {
  const key = full.toUpperCase();
  if (seen.has(key)) {
    return { ok: false, error: 'DUPLICATE ENTRY' };
  }
  seen.add(key);
  const promo = findGiftPromoByNormalizedCode(full);
  if (!promo) {
    return { ok: false, error: 'INVALID CODE' };
  }
  const block = giftPromoRedeemBlockReason(promo);
  if (block) {
    return { ok: false, error: block };
  }
  const dollars = parseGiftCardDollars(promo.valueLabel);
  if (dollars == null) {
    return { ok: false, error: 'INVALID CODE VALUE' };
  }
  updateBrandPromoCode(promo.id, { uses: promo.uses + 1 });
  return { ok: true, dollars };
}

function addToBalanceAddingLabel(current: number, total: number): string {
  if (total <= 1) return 'ADDING...';
  return `ADDING ${current}/${total}...`;
}

function addToBalanceAddedLabel(succeeded: number, total: number): string {
  if (total <= 1) return 'ADDED TO BALANCE';
  return `ADDED ${succeeded}/${total}`;
}

function pickPreferredDigitalCashHistory(
  currentHistory: unknown,
  registeredHistory: unknown
): DigitalCashHistoryEntry[] {
  const current = Array.isArray(currentHistory) ? (currentHistory as DigitalCashHistoryEntry[]) : [];
  const registered = Array.isArray(registeredHistory) ? (registeredHistory as DigitalCashHistoryEntry[]) : [];
  if (registered.length > current.length) return registered;
  return current;
}

function pickPreferredDigitalCashBalance(
  currentBalance: unknown,
  registeredBalance: unknown
): number {
  const current = typeof currentBalance === 'number' ? currentBalance : 0;
  const registered = typeof registeredBalance === 'number' ? registeredBalance : 0;
  return Math.max(current, registered);
}

function shouldApplyAdminTestDigitalCash(user: Record<string, unknown> | null | undefined): boolean {
  if (!user || !isAdminEmail(String(user.email || ''))) return false;
  try {
    return localStorage.getItem(FOUNDER_ACCOUNT_VIEW_AS_CLIENT_KEY) !== 'true';
  } catch {
    return true;
  }
}

function readStoredSignedInUser(): Record<string, unknown> | null {
  if (typeof window === 'undefined') return null;
  try {
    const signedIn = localStorage.getItem('isSignedIn') === 'true';
    if (!signedIn) return null;
    const currentRaw = localStorage.getItem('currentUser');
    const currentUser = currentRaw ? (JSON.parse(currentRaw) as Record<string, unknown>) : null;
    const currentEmail = String(currentUser?.email || '')
      .trim()
      .toLowerCase();
    const registered = JSON.parse(localStorage.getItem('registeredUsers') || '[]') as Array<Record<string, unknown>>;
    const registeredUser = currentEmail
      ? registered.find((user) => String(user?.email || '').trim().toLowerCase() === currentEmail) ?? null
      : null;

    if (!currentUser && registeredUser) return registeredUser;
    if (!currentUser) return null;
    if (!registeredUser) return currentUser;

    const merged = {
      ...registeredUser,
      ...currentUser,
      giftCardBalance: pickPreferredDigitalCashBalance(
        currentUser.giftCardBalance,
        registeredUser.giftCardBalance
      ),
      digitalCashHistory: pickPreferredDigitalCashHistory(
        currentUser.digitalCashHistory,
        registeredUser.digitalCashHistory
      ),
    };
    if (shouldApplyAdminTestDigitalCash(merged)) {
      merged.giftCardBalance = Math.max(
        ADMIN_TEST_DIGITAL_CASH_MIN,
        typeof merged.giftCardBalance === 'number' ? merged.giftCardBalance : 0
      );
    }

    const needsCurrentRepair =
      currentUser.giftCardBalance !== merged.giftCardBalance ||
      currentUser.digitalCashHistory !== merged.digitalCashHistory;
    if (needsCurrentRepair) {
      localStorage.setItem('currentUser', JSON.stringify(merged));
      const registeredIdx = registered.findIndex(
        (user) => String(user?.email || '').trim().toLowerCase() === currentEmail
      );
      if (registeredIdx !== -1) {
        registered[registeredIdx] = merged;
        localStorage.setItem('registeredUsers', JSON.stringify(registered));
      }
    }
    return merged;
  } catch {
    return null;
  }
}

function LoadCardPage() {
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
  useSyncMenuToggleOpenState(showMobileMenu);
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
  const [userData, setUserData] = useState(() => {
    return readStoredSignedInUser();
  });
  const [barcodes, setBarcodes] = useState(['', '']);
  const [addToBalanceUi, setAddToBalanceUi] = useState<AddToBalanceUiState>({ phase: 'idle' });
  const addToBalanceResetTimerRef = useRef<number | null>(null);

  type LoadCardNotice = {
    title: string;
    message: string;
    preserveLineBreaks?: boolean;
    afterClose?: () => void;
  };
  const [loadCardNotice, setLoadCardNotice] = useState<LoadCardNotice | null>(null);

  const dismissLoadCardNotice = useCallback(() => {
    setLoadCardNotice((prev) => {
      const fn = prev?.afterClose;
      if (fn) queueMicrotask(fn);
      return null;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (addToBalanceResetTimerRef.current != null) {
        window.clearTimeout(addToBalanceResetTimerRef.current);
      }
    };
  }, []);

  const scheduleAddToBalanceIdleReset = useCallback(() => {
    if (addToBalanceResetTimerRef.current != null) {
      window.clearTimeout(addToBalanceResetTimerRef.current);
    }
    addToBalanceResetTimerRef.current = window.setTimeout(() => {
      setAddToBalanceUi({ phase: 'idle' });
      addToBalanceResetTimerRef.current = null;
    }, ADD_TO_BALANCE_SUCCESS_RESET_MS);
  }, []);

  // Keep userData in sync with signed-in user so new accounts see their own data, not a previous (e.g. admin) user's
  useEffect(() => {
    const syncUser = () => {
      try {
        setUserData(readStoredSignedInUser());
      } catch {
        setUserData(null);
      }
    };
    syncUser();
    window.addEventListener('storage', syncUser);
    window.addEventListener('signInStateChanged', syncUser);
    window.addEventListener('focus', syncUser);
    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('signInStateChanged', syncUser);
      window.removeEventListener('focus', syncUser);
    };
  }, []);

  // Rehydrate the signed-in profile so Add Funds shows the same digital cash amount as Account.
  useEffect(() => {
    let cancelled = false;
    if (!isSignedIn) return;
    const preSyncUser = readStoredSignedInUser();
    const preSyncBalance =
      typeof preSyncUser?.giftCardBalance === 'number' ? (preSyncUser.giftCardBalance as number) : 0;
    const preSyncHistory = pickPreferredDigitalCashHistory(preSyncUser?.digitalCashHistory, []);

    syncAllFromApi()
      .catch(() => null)
      .finally(() => {
        if (cancelled) return;
        const syncedUser = readStoredSignedInUser();
        const syncedBalance =
          typeof syncedUser?.giftCardBalance === 'number' ? (syncedUser.giftCardBalance as number) : 0;
        const syncedHistory = pickPreferredDigitalCashHistory(syncedUser?.digitalCashHistory, []);

        // Guard against a stale profile sync wiping out a richer local digital-cash balance/history.
        if ((preSyncBalance > syncedBalance || preSyncHistory.length > syncedHistory.length) && preSyncUser?.email) {
          void persistUserBalance(
            String(preSyncUser.email),
            Math.max(preSyncBalance, syncedBalance),
            // When restoring after stale sync, do not append a new transaction row.
            { date: '', transaction: '', amount: 0 }
          );
          const repaired: Record<string, unknown> = {
            ...(syncedUser || preSyncUser),
            giftCardBalance: Math.max(preSyncBalance, syncedBalance),
            digitalCashHistory:
              preSyncHistory.length >= syncedHistory.length ? preSyncHistory : syncedHistory,
          };
          try {
            localStorage.setItem('currentUser', JSON.stringify(repaired));
            const registered = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            const idx = registered.findIndex(
              (user: { email?: string }) =>
                String(user.email || '').trim().toLowerCase() === String(repaired.email || '').trim().toLowerCase()
            );
            if (idx !== -1) {
              registered[idx] = repaired;
              localStorage.setItem('registeredUsers', JSON.stringify(registered));
            }
          } catch {
            /* ignore */
          }
          setUserData(repaired);
          return;
        }

        setUserData(syncedUser);
      });
    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

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
      clearAppAuth();
      window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'false' }));
      setShowMobileMenu(false);
      navigate(signInHrefWithReturnTo(location));
    } else {
      navigate(signInHrefWithReturnTo(location));
    }
  };

  const handleBarcodeChange = (index: number, value: string) => {
    const next = [...barcodes];
    next[index] = formatGiftBarcodeInput(value);
    setBarcodes(next);
  };

  const persistUserBalance = async (email: string, newBalance: number, historyEntry: { date: string; transaction: string; amount: number }) => {
    const u = readStoredSignedInUser();
    if (!u) throw new Error('no signed-in user');
    if (String(u.email || '').toLowerCase() !== email.toLowerCase()) throw new Error('user email mismatch');
    const updatedHistory = [...(Array.isArray(u.digitalCashHistory) ? u.digitalCashHistory : []), ...(historyEntry.date ? [historyEntry] : [])];
    const updated = {
      ...u,
      giftCardBalance: newBalance,
      digitalCashHistory: updatedHistory,
    };
    localStorage.setItem('currentUser', JSON.stringify(updated));
    setUserData(updated);
    const registered = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const idx = registered.findIndex((x: { email?: string }) => (x.email || '').toLowerCase() === email.toLowerCase());
    if (idx !== -1) {
      registered[idx] = updated;
      localStorage.setItem('registeredUsers', JSON.stringify(registered));
    }
    window.dispatchEvent(new CustomEvent('customStorageChange'));
    try {
      await patchProfileWithRetryQueue({
        giftCardBalance: newBalance,
        digitalCashHistory: updatedHistory,
      });
      appendDigitalCashDepositAccountAlert(email, historyEntry.amount);
    } catch {
      /* local balance already updated */
    }
  };

  const handleSubmit = async () => {
    if (addToBalanceUi.phase !== 'idle') return;
    if (!isSignedIn || !userData?.email) {
      setLoadCardNotice({
        title: 'FORGETTING SOMETHING?',
        message: 'PLEASE SIGN IN TO ADD FUNDS.',
        afterClose: () => navigate(signInHrefWithReturnTo(location)),
      });
      return;
    }
    const codesToTry = barcodes
      .map((s) => toCanonicalBarcode(s))
      .filter(Boolean);
    if (codesToTry.length === 0) {
      setLoadCardNotice({
        title: 'INCOMPLETE BARCODES',
        message: 'ENTER COMPLETE BARCODES (XXXX-XXXX-XXXX).',
      });
      return;
    }
    const seen = new Set<string>();
    let totalAdded = 0;
    let succeededCount = 0;
    const errors: string[] = [];
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}-${now.getDate()}-${now.getFullYear()}`;
    const email = String(userData.email || '');
    const latestStoredUser = readStoredSignedInUser();
    let runningBalance =
      typeof latestStoredUser?.giftCardBalance === 'number'
        ? (latestStoredUser.giftCardBalance as number)
        : typeof userData.giftCardBalance === 'number'
          ? userData.giftCardBalance
          : 0;
    const totalCodes = codesToTry.length;
    const perCodeDelayMs = Math.max(
      ADD_TO_BALANCE_PER_CODE_MS,
      Math.floor(ADD_TO_BALANCE_MIN_ADDING_MS / Math.max(totalCodes, 1))
    );

    for (let index = 0; index < codesToTry.length; index++) {
      const full = codesToTry[index];
      setAddToBalanceUi({ phase: 'adding', current: index + 1, total: totalCodes });

      const result = redeemGiftBarcode(full, seen);
      if (!result.ok) {
        errors.push(`${full}: ${result.error}`);
        if (index < codesToTry.length - 1) {
          await new Promise<void>((resolve) => {
            window.setTimeout(resolve, perCodeDelayMs);
          });
        }
        continue;
      }

      runningBalance += result.dollars;
      totalAdded += result.dollars;

      try {
        await Promise.all([
          persistUserBalance(email, runningBalance, {
            date: dateStr,
            transaction: 'GIFT CARD BARCODE',
            amount: result.dollars,
          }),
          new Promise<void>((resolve) => {
            window.setTimeout(resolve, perCodeDelayMs);
          }),
        ]);
        succeededCount += 1;
      } catch {
        runningBalance -= result.dollars;
        totalAdded -= result.dollars;
        errors.push(`${full}: UNABLE TO SAVE BALANCE`);
      }
    }

    if (succeededCount > 0) {
      setAddToBalanceUi({ phase: 'added', succeeded: succeededCount, total: totalCodes });
      setBarcodes(['', '']);
      scheduleAddToBalanceIdleReset();
    } else {
      setAddToBalanceUi({ phase: 'idle' });
    }

    if (errors.length && succeededCount === 0) {
      setLoadCardNotice({
        title: 'UNABLE TO ADD FUNDS',
        message: `THE FOLLOWING CARD(S) COULD NOT BE LOADED:\n${errors.join('\n')}`,
        preserveLineBreaks: true,
      });
      return;
    }
    if (errors.length) {
      setLoadCardNotice({
        title: 'PARTIALLY ADDED',
        message: `ADDED ${formatPrice(totalAdded)}.\n\nTHE FOLLOWING CARD(S) COULD NOT BE LOADED:\n${errors.join('\n')}`,
        preserveLineBreaks: true,
      });
    } else if (succeededCount > 0) {
      setLoadCardNotice({
        title: 'FUNDS ADDED',
        message: `ADDED ${formatPrice(totalAdded)} TO YOUR ACCOUNT.`,
      });
    }
  };

  const formatPrice = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
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
                    onClick={() => navigate(isSignedIn ? '/account' : signInHrefWithReturnTo(location))}
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
                    onClick={() => navigate(isSignedIn ? '/wishlist' : signInHrefWithReturnTo(location))} 
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
                    onClick={() => navigate('/lobby')}
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
                    BALANCE
                  </span>
                </>
              )}
            </p>

            {/* Right side icons */}
            <div className="gap-5 flex absolute" style={{ right: '17px' }}>
              <div style={{ transform: `translateX(${cartCount === 0 ? 7 : 5}px)` }}>
                <DynamicCartIcon count={cartCount} width={22} height={19} variant="nav" />
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
              /* MENU CONTENT - Same as other account pages */
              <div
                className="border border-black flex flex-col pt-6 pb-4 px-5 bg-white/60 backdrop-blur-sm w-full"
                style={{ 
                  borderWidth: '1.3px', 
                  minWidth: '100%', 
                  maxWidth: 'none', 
                  overflow: 'visible',
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  minHeight: MENU_TOGGLE_PANEL_HEIGHT,
                  height: MENU_TOGGLE_PANEL_HEIGHT
                }}
              >
                {/* Mobile menu content - same structure as account page */}
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
                        <ShopMobileMenuToolsTab
                          navigate={navigate}
                          closeMenu={() => setShowMobileMenu(false)}
                          labelTranslateX="13px"
                        />
                      ) : mobileMenuActiveTab === 'BRAND' ? (
                        <BrandMenuLinks onClose={() => setShowMobileMenu(false)} />
                      ) : (
                        // SHOP tab
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
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  maxWidth: '600px',
                  margin: '0 auto'
                }}
              >
                <div
                  className="border border-black bg-white/60 backdrop-blur-sm w-full mb-2 transition-all duration-300 ease-out"
                  style={{
                    borderWidth: '1.3px',
                    paddingTop: '20px',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    paddingBottom: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      width: '100%',
                      alignItems: 'stretch'
                    }}
                  >
                  <div style={{ marginBottom: 0, flexShrink: 0 }}>
                    <div
                      className="flex items-center justify-between"
                      style={{ margin: '0 0 8px 0' }}
                    >
                      <p
                        style={{
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '12px',
                          color: '#EB1C24',
                          margin: 0,
                          textTransform: 'uppercase',
                          fontWeight: '500'
                        }}
                      >
                        ADD FUNDS
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate('/account')}
                        aria-label="Back to account profile"
                        style={{
                          padding: 0,
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          flexShrink: 0,
                          lineHeight: 0
                        }}
                      >
                        <BrandRedCloseIcon size={'14.5px'} />
                      </button>
                    </div>
                    <div style={{ borderBottom: '1px solid #e5e7eb' }} />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignSelf: 'center',
                      width: '100%',
                      maxWidth: '400px',
                      marginTop: '-24px',
                      marginBottom: '6px',
                      lineHeight: 0,
                      flexShrink: 0
                    }}
                  >
                    <img
                      src={GIFT_CARD_LOAD_CARD_THUMBNAIL_SRC}
                      alt="Gift card"
                      decoding="async"
                      style={{
                        width: '100%',
                        maxWidth: '400px',
                        height: 'auto',
                        display: 'block',
                        margin: 0,
                        padding: 0,
                        border: 'none',
                        borderRadius: 0
                      }}
                    />
                  </div>

                  <div
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      marginTop: '8px',
                      marginBottom: 0,
                      flexShrink: 0
                    }}
                  >
                    <p
                      style={{
                        fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                        fontSize: '18px',
                        color: '#000000',
                        margin: '0 0 2px 0',
                        fontWeight: '400',
                        textAlign: 'center',
                        width: '100%'
                      }}
                    >
                      CURRENT BALANCE
                    </p>
                    <p
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '16px',
                        color: '#EB1C24',
                        margin: '-2px 0 14px 0',
                        fontWeight: '500',
                        textAlign: 'center',
                        width: '100%'
                      }}
                    >
                      {formatPrice(typeof userData?.giftCardBalance === 'number' ? userData.giftCardBalance : 0)}
                    </p>
                    <p
                      style={{
                        fontFamily: '"Futura PT Book"',
                        fontSize: '10px',
                        color: '#000000',
                        margin: '0 0 22px 0',
                        fontWeight: '400',
                        lineHeight: '1.35',
                        textAlign: 'left',
                        textTransform: 'uppercase',
                        width: '100%'
                      }}
                    >
                      LOAD GIFT CARDS TO ADD FUNDS TO YOUR ACCOUNT. YOUR AVAILABLE DIGITAL CASH BALANCE WILL BE AUTOMATICALLY APPLIED AT CHECKOUT, WITH NO CODE NEEDED. AVAILABLE FUNDS CAN BE APPLIED TOWARD ANY ELIGIBLE PURCHASE. FOR ADDED FLEXIBILITY, YOU MAY CHOOSE EXACTLY HOW MUCH DIGITAL CASH TO APPLY TO EACH ORDER.
                    </p>
                  </div>

                  <div
                    style={{
                      marginTop: 0,
                      marginBottom: 0,
                      paddingTop: 0,
                      flexShrink: 0,
                      width: '100%'
                    }}
                  >
                    <p
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        fontSize: '10px',
                        color: '#808080',
                        margin: '0 0 12px 0',
                        textTransform: 'uppercase',
                        fontWeight: '500'
                      }}
                    >
                      ENTER BARCODE(S):
                    </p>
                    {barcodes.map((barcode, index) => (
                      <input
                        key={index}
                        type="text"
                        inputMode="text"
                        autoCapitalize="characters"
                        autoCorrect="off"
                        spellCheck={false}
                        maxLength={14}
                        value={barcode}
                        onChange={(e) => handleBarcodeChange(index, e.target.value)}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          marginBottom: index < barcodes.length - 1 ? '12px' : '10px',
                          border: '1.3px solid #000000',
                          backgroundColor: '#FFFFFF',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '12px',
                          color: '#000000',
                          boxSizing: 'border-box',
                          borderRadius: 0,
                          textTransform: 'uppercase'
                        }}
                      />
                    ))}
                  </div>
                  </div>
                </div>
                <div
                  className="px-0 md:px-0 w-full"
                  style={{
                    marginTop: '2px',
                    marginBottom: '20px',
                    transform: 'translateY(-2px)'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => void handleSubmit()}
                    disabled={addToBalanceUi.phase === 'adding'}
                    className={`border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold ${
                      addToBalanceUi.phase === 'adding'
                        ? 'bg-white cursor-not-allowed'
                        : 'bg-white cursor-pointer hover:bg-gray-50'
                    }`}
                    style={{
                      borderWidth: '1.3px',
                      color: '#EB1C24',
                      fontFamily: '"Futura PT Medium"',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    {addToBalanceUi.phase === 'idle' && 'ADD TO BALANCE'}
                    {addToBalanceUi.phase === 'adding' &&
                      addToBalanceAddingLabel(addToBalanceUi.current, addToBalanceUi.total)}
                    {addToBalanceUi.phase === 'added' && (
                      <span className="flex items-center justify-center gap-1">
                        <img src="/assets/check.svg" alt="Check" width="9" height="9" />
                        <span style={{ color: '#808080' }}>
                          {addToBalanceAddedLabel(addToBalanceUi.succeeded, addToBalanceUi.total)}
                        </span>
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={loadCardNotice !== null}
        onClose={dismissLoadCardNotice}
        onConfirm={dismissLoadCardNotice}
        title={loadCardNotice?.title ?? ''}
        message={loadCardNotice?.message ?? ''}
        confirmText="OK"
        cancelText=""
        dataAttribute="load-card-notice"
        messagePreserveLineBreaks={loadCardNotice?.preserveLineBreaks ?? false}
      />
    </div>
  );
}

export default LoadCardPage;

