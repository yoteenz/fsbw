import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import ConfirmationModal from '../../../components/ConfirmationModal';
import BrandMenuLinks from '../../../components/BrandMenuLinks';
import SocialMenuIcons from '../../../components/SocialMenuIcons';
import { loadUserLists, saveUserLists, type UserList } from '../../../components/AddToListModal';
import CreateNewListModal from '../../../components/CreateNewListModal';
import ShareListLinkModal from '../../../components/ShareListLinkModal';
import { getCurrentUser } from '../../../utils/adminAuth';
import {
  getUserListVisibilityLabel,
  prepareListForShare,
  publishSharedListSnapshot,
  syncUserListsSharedStatus,
} from '../../../utils/wishlistListShare';
import { PageActionsBelowCard, pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';
import { ShopMobileMenuShopTab } from '../../../components/ShopMobileMenuShopTab';
import { ShopMobileMenuToolsTab } from '../../../components/ShopMobileMenuToolsTab';
import { signInHrefWithReturnTo } from '../../../utils/signInReturnTo';

/** Build-a-wig style: front view image in front of leaf-brick (same as wigViews[1] on build-a-wig page). */
function getLeafBrickFrontImage(item: any): string {
  if (!item) return '/assets/natural front.png';
  const name = (item.name || item.productName || 'NOIR').toString().toUpperCase();
  if (name === 'GIFT CARD' || item.type === 'gift-card') return '/assets/gift-card asset.png';
  const hairline = (item.hairline || 'NATURAL').toUpperCase();
  const hasPeak = hairline.includes('PEAK');
  const hasLagos = hairline.includes('LAGOS');
  if (name === 'BLANCO') return '/assets/2D BLANCO FRONT.png';
  if (name === 'SOFT WAVE' || name === 'BEACH WAVE') return '/assets/2D WAVY FRONT.png';
  if (name === 'SOFT CURL' || name === 'OCEAN CURL') return '/assets/2D CURLY FRONT.png';
  if (name === 'NOIR') {
    if (hasPeak) return '/assets/peak front.png';
    if (hasLagos) return '/assets/lagos front.png';
    return '/assets/natural front.png';
  }
  return '/assets/natural front.png';
}

/** Canonical empty-list thumb (Supabase live-preview). */
const EMPTY_LIST_THUMB_SUPABASE_URL =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/3D%20images/6KLNd6QdTtVWqfXcnpOsc_cChNXN8z.jpeg';

/** Thumbnail when a user list has no items (lists overview row only). */
const EMPTY_LIST_THUMB_SRC = EMPTY_LIST_THUMB_SUPABASE_URL;

/** List / expanded line rows: nudge right so thumbs are not clipped by card overflow. */
const LIST_ROW_CONTENT_OFFSET_LEFT_PX = 10;

/** Inset white ring + inner art area (non-empty list thumbs). */
const LIST_THUMB_FRAME_INSET_PX = 3;

/** Empty list thumb white ring (thinner than non-empty). */
const EMPTY_LIST_THUMB_FRAME_INSET_PX = 1;

/** Empty-list thumb art sits low in frame; nudge up inside the inner art area. */
const EMPTY_LIST_THUMB_OFFSET_UP_PX = 0;
/** Empty-list thumb scale (1 − 12% = 88%). */
const EMPTY_LIST_THUMB_SCALE = 0.88;

/** Route to product/unit page. */
function getProductRoute(name: string): string {
  const n = (name || 'NOIR').toString().toUpperCase();
  const routes: Record<string, string> = {
    NOIR: '/straight/noir',
    BLANCO: '/straight/blanco',
    'SOFT WAVE': '/wavy/soft-wave',
    'BEACH WAVE': '/wavy/beach-wave',
    'SOFT CURL': '/curly/soft-curl',
    'OCEAN CURL': '/curly/ocean-curl',
    'GIFT CARD': '/tools/gift-card'
  };
  return routes[n] || '/build-a-wig';
}

function getHairOrigin(productName: string): string {
  switch (productName) {
    case 'NOIR': return 'CAMBODIAN';
    case 'BLANCO': return 'RUSSIAN';
    case 'SOFT WAVE': return 'INDIAN';
    case 'BEACH WAVE': return 'INDONESIAN';
    case 'SOFT CURL': return 'VIETNAMESE';
    case 'OCEAN CURL': return 'FILIPINO';
    default: return 'CAMBODIAN';
  }
}

export default function ViewListsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [lists, setLists] = useState<UserList[]>([]);
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
    if (pathname.includes('/brand')) return 'BRAND';
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
  const [showDeleteListConfirm, setShowDeleteListConfirm] = useState(false);
  const [listToDelete, setListToDelete] = useState<string | null>(null);
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  /** list.id = expanded list; null = show list of lists */
  const [expandedListId, setExpandedListId] = useState<string | null>(null);
  const [expandedViewMode, setExpandedViewMode] = useState<'grid' | 'line'>('grid');
  const [showShareListModal, setShowShareListModal] = useState(false);
  const [shareListUrl, setShareListUrl] = useState('');

  const refreshLists = () => {
    const loaded = loadUserLists();
    const synced = syncUserListsSharedStatus(loaded);
    if (synced !== loaded) saveUserLists(synced);
    setLists(synced);
  };

  const handleMobileMenuToggle = () => setShowMobileMenu((m) => !m);
  const handleMobileMenuTabClick = (tab: 'SHOP' | 'TOOLS' | 'BRAND') => setMobileMenuActiveTab(tab);
  const handleMobileMenuItemToggle = (label: string) => {
    setMobileMenuExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );
  };
  const handleMobileMenuSignInToggle = () => {
    if (isSignedIn) navigate('/account');
    else navigate(signInHrefWithReturnTo(location));
  };
  const handleDeleteList = () => {
    if (listToDelete) {
      const next = lists.filter((l) => l.id !== listToDelete);
      saveUserLists(next);
      setLists(next);
      setListToDelete(null);
      setShowDeleteListConfirm(false);
      if (expandedListId === listToDelete) setExpandedListId(null);
    }
  };

  const handleShareListClick = () => {
    if (!expandedListId) return;
    const list = lists.find((l) => l.id === expandedListId);
    if (!list) return;
    const ownerEmail = getCurrentUser()?.email;
    if (!ownerEmail) {
      navigate(signInHrefWithReturnTo(location));
      return;
    }
    const { list: updated, shareUrl } = prepareListForShare(list, ownerEmail);
    const next = lists.map((l) => (l.id === updated.id ? updated : l));
    saveUserLists(next);
    setLists(next);
    setShareListUrl(shareUrl);
    setShowShareListModal(true);
  };

  useEffect(() => {
    refreshLists();
    const handleUpdate = () => refreshLists();
    window.addEventListener('userListsUpdated', handleUpdate);
    window.addEventListener('wishlistSharedRegistryUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('userListsUpdated', handleUpdate);
      window.removeEventListener('wishlistSharedRegistryUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (expandedListId && !lists.some((l) => l.id === expandedListId)) {
      setExpandedListId(null);
    }
  }, [expandedListId, lists]);

  useEffect(() => {
    const handleCartCountUpdate = (e: CustomEvent) => setCartCount(e.detail);
    const handleStorage = () => {
      try {
        setCartCount(parseInt(localStorage.getItem('cartCount') || '0', 10));
      } catch {
        setCartCount(0);
      }
    };
    window.addEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
    window.addEventListener('cartUpdated', handleStorage);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
      window.removeEventListener('cartUpdated', handleStorage);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ position: 'relative', minHeight: '100vh' }}>
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
          {/* Nav bar - same pattern as wishlist */}
          <div
            className="border-solid border-black flex justify-center items-center py-3 w-full mb-5 px-5 bg-white/60 backdrop-blur-sm relative"
            style={{ border: '1.3px solid black' }}
          >
            <div className="flex gap-5 absolute left-4">
              {showMobileMenu ? (
                <>
                  <button
                    onClick={() => navigate(isSignedIn ? '/account' : signInHrefWithReturnTo(location))}
                    className="cursor-pointer"
                    style={{ height: '15px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(4px)' }}
                  >
                    <img alt="Account" width="16" height="16" src="/assets/NOIR/account-icon.svg" />
                  </button>
                  <button
                    onClick={() => navigate(isSignedIn ? '/wishlist' : signInHrefWithReturnTo(location))}
                    className="cursor-pointer"
                    style={{ height: '21px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(2px)' }}
                  >
                    <img alt="Wishlist" width="18" height="18" src="/assets/wishlist-heart.svg" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => (expandedListId ? setExpandedListId(null) : navigate('/wishlist'))}
                  className="cursor-pointer"
                  style={{ height: '15px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important' }}
                >
                  <img alt="Back" width="21" height="15" src="/assets/back-button.svg" />
                </button>
              )}
            </div>
            <p className="text-sm" style={{ fontFamily: '"Futura PT Book"', transform: 'translateY(1px)' }}>
              {showMobileMenu ? (
                <>
                  <span style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }} onClick={() => navigate('/lobby')}>
                    HOME &gt;
                  </span>{' '}
                  <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>MENU</span>
                </>
              ) : expandedListId ? (
                <>
                  <span style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }} onClick={() => setExpandedListId(null)}>
                    LISTS &gt;
                  </span>{' '}
                  <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>
                    {(lists.find((l) => l.id === expandedListId)?.name ?? '').toUpperCase()}
                  </span>
                </>
              ) : (
                <>
                  <span style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }} onClick={() => navigate('/wishlist')}>
                    WISHLIST &gt;
                  </span>{' '}
                  <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>LISTS</span>
                </>
              )}
            </p>
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
                  <path d="M0 0H15.75V0.7H7.875H0V0ZM5.25 6.7H10.5H15.375V7.4H10.5H5.25V6.7ZM0 13.1H15.75V13.8H0V13.1Z" fill="black" />
                </svg>
              </div>
            </div>
          </div>

          {/* Main content box - menu when open, lists when closed */}
          <div
            className={showMobileMenu ? 'menu-toggle-card border border-black flex flex-col pt-6 pb-4 px-5 mb-2 bg-white/60 backdrop-blur-sm' : 'border border-black flex flex-col p-4 mb-2 bg-white/60 backdrop-blur-sm'}
            style={{
              borderWidth: '1.3px',
              minWidth: '100%',
              maxWidth: 'none',
              overflow: showMobileMenu ? 'visible' : 'hidden',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              ...(showMobileMenu
                ? {
                    minHeight: 'calc(100dvh - 80px)',
                    height: 'calc(100dvh - 80px)',
                  }
                : {
                    /* Same proportion as 520px on a 745px-tall viewport */
                    height: 'calc(100vh * 520 / 745)',
                    minHeight: 'calc(100vh * 520 / 745)',
                    maxHeight: 'calc(100vh * 520 / 745)',
                  }),
            }}
          >
            {showMobileMenu ? (
              /* Full menu - same as wishlist */
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
                                              duplicateRowClickForStaticLinks
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
            ) : (
              <>
                {/* Page-specific header: list name when expanded (e.g. VACATION), otherwise LISTS */}
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
                {(() => {
                  const expandedList = expandedListId ? lists.find((l) => l.id === expandedListId) : null;
                  const expandedItemCount = expandedList ? (expandedList.items?.length ?? 0) : 0;
                  const headerLabel = expandedListId && expandedList ? (expandedList.name ?? '').toUpperCase() : 'LISTS';
                  const headerCount =
                    expandedListId && expandedList ? expandedItemCount : lists.length;
                  return (
                    <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ flexShrink: 0 }}>
                      <span
                        className="text-red-500 font-bold text-lg tracking-wider truncate text-left uppercase"
                        style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px', fontWeight: '500' }}
                      >
                        {headerLabel}
                      </span>
                      <span
                        className="text-black font-bold text-lg flex-shrink-0 ml-2 uppercase"
                        style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '17px' }}
                      >
                        {headerCount}
                      </span>
                    </div>
                  );
                })()}

                {/* Scrollable lists/content area */}
                <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {expandedListId ? (
                  (() => {
                    const expandedList = lists.find((l) => l.id === expandedListId);
                    if (!expandedList) return null;
                    const expandedItems: any[] = expandedList.items ?? [];
                    const removeFromList = (item: any) => {
                      const nextItems = (expandedList.items || []).filter((i: any) => i.id !== item.id);
                      const ownerEmail = getCurrentUser()?.email;
                      const nextLists = lists.map((l) => {
                        if (l.id !== expandedList.id) return l;
                        let updated: UserList = { ...l, items: nextItems };
                        if (updated.shareToken && ownerEmail) {
                          updated = publishSharedListSnapshot(updated, ownerEmail);
                        }
                        return updated;
                      });
                      saveUserLists(nextLists);
                      setLists(nextLists);
                      if (nextItems.length === 0) setExpandedListId(null);
                    };
                    return (
                      <div
                        style={{
                          paddingTop: '8px',
                          flex: 1,
                          minHeight: 0,
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            marginTop: '2px',
                            marginBottom: expandedItems.length === 0 ? 0 : '16px',
                            flexShrink: 0,
                          }}
                        >
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button type="button" onClick={() => setExpandedViewMode('line')} style={{ padding: '4px', border: expandedViewMode === 'line' ? '1px solid #EB1C24' : '1px solid #ccc', background: 'none', cursor: 'pointer', borderRadius: 0, color: expandedViewMode === 'line' ? '#EB1C24' : '#000' }} aria-label="Line view">
                              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '12px', gap: '3px' }}>
                                <div style={{ width: '12px', height: '1px', backgroundColor: 'currentColor' }} />
                                <div style={{ width: '12px', height: '1px', backgroundColor: 'currentColor' }} />
                                <div style={{ width: '12px', height: '1px', backgroundColor: 'currentColor' }} />
                              </div>
                            </button>
                            <button type="button" onClick={() => setExpandedViewMode('grid')} style={{ padding: '4px', border: expandedViewMode === 'grid' ? '1px solid #EB1C24' : '1px solid #ccc', background: 'none', cursor: 'pointer', borderRadius: 0, color: expandedViewMode === 'grid' ? '#EB1C24' : '#000' }} aria-label="Grid view">
                              <div style={{ width: '12px', height: '12px', border: '1px solid currentColor', backgroundColor: 'white', position: 'relative' }}>
                                <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '1px', transform: 'translateY(-50%)', backgroundColor: 'currentColor' }} />
                                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', transform: 'translateX(-50%)', backgroundColor: 'currentColor' }} />
                              </div>
                            </button>
                          </div>
                        </div>
                        {expandedItems.length === 0 ? (
                          <div
                            style={{
                              flex: 1,
                              minHeight: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <p
                              style={{
                                fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                                fontSize: '11px',
                                color: '#808080',
                                textAlign: 'center',
                                textTransform: 'uppercase',
                                margin: 0,
                                padding: '0 20px',
                              }}
                            >
                              THERE ARE NO ITEMS IN THIS LIST.
                            </p>
                          </div>
                        ) : expandedViewMode === 'line' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {expandedItems.map((item: any, index: number) => {
                              const itemName = (item.name || item.productName || 'NOIR').toString().toUpperCase();
                              const itemLength = item.length || '24"';
                              const itemHairOrigin = item.hairOrigin || getHairOrigin(itemName);
                              return (
                                <div key={item.id || index} style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingLeft: LIST_ROW_CONTENT_OFFSET_LEFT_PX, paddingBottom: '16px', marginBottom: '16px', borderBottom: index < expandedItems.length - 1 ? '1px solid #e5e5e5' : 'none' }}>
                                  <div role="button" tabIndex={0} onClick={() => navigate(getProductRoute(itemName))} onKeyDown={(e) => e.key === 'Enter' && navigate(getProductRoute(itemName))} className="relative bg-cover bg-center flex items-center justify-center cursor-pointer flex-shrink-0" style={{ width: '88px', height: '110px', backgroundImage: "url('/assets/leaf-brick-resize.png')", backgroundSize: 'cover', backgroundPosition: 'center', border: '1.3px solid #000', boxShadow: 'inset 0 0 0 3px #fff', overflow: 'hidden' }}>
                                    <img src={getLeafBrickFrontImage(item)} alt="" style={{ position: 'absolute', left: '50%', bottom: 3, transform: 'translateX(-50%)', width: 'auto', height: '96%', maxWidth: '106%', objectFit: 'contain', objectPosition: 'bottom', zIndex: 1 }} />
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", cursive', fontSize: '18px', color: '#000', margin: '0 0 4px 0', textTransform: 'uppercase' }}>{itemName.replace(/WIG/gi, '').trim()}</p>
                                    <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#EB1C24', margin: '0 0 6px 0', textTransform: 'uppercase' }}>{itemLength} RAW {itemHairOrigin}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginBottom: '4px' }}>
                                      {[...Array(5)].map((_, idx) => (
                                        <img key={idx} src="/assets/NOIR/filled-star.png" alt="Star" style={{ width: '14px', height: '14px', filter: 'drop-shadow(0 0 0 1px black)' }} />
                                      ))}
                                    </div>
                                    <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: 'black', margin: '0', textTransform: 'uppercase' }}>4.9 OUT OF 5 STARS</p>
                                  </div>
                                  <button type="button" onClick={() => removeFromList(item)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Remove from list">
                                    <img src="/assets/close-icon.svg" alt="Remove" style={{ width: '16px', height: '16px', filter: 'brightness(0) saturate(100%) invert(20%) sepia(93%) saturate(7151%) hue-rotate(349deg) brightness(92%) contrast(92%)' }} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '20px 16px', paddingLeft: LIST_ROW_CONTENT_OFFSET_LEFT_PX }}>
                            {expandedItems.map((item: any, index: number) => {
                              const itemName = (item.name || item.productName || 'NOIR').toString().toUpperCase();
                              return (
                                <div key={item.id || index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <div role="button" tabIndex={0} onClick={() => navigate(getProductRoute(itemName))} onKeyDown={(e) => e.key === 'Enter' && navigate(getProductRoute(itemName))} className="relative bg-cover bg-center flex items-center justify-center cursor-pointer" style={{ width: '88px', height: '110px', backgroundImage: "url('/assets/leaf-brick-resize.png')", backgroundSize: 'cover', backgroundPosition: 'center', border: '1.3px solid #000', boxShadow: 'inset 0 0 0 3px #fff', overflow: 'hidden' }}>
                                    <img src={getLeafBrickFrontImage(item)} alt="" style={{ position: 'absolute', left: '50%', bottom: 3, transform: 'translateX(-50%)', width: 'auto', height: '96%', maxWidth: '106%', objectFit: 'contain', objectPosition: 'bottom', zIndex: 1 }} />
                                  </div>
                                  <p style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", cursive', fontSize: '14px', color: '#000', margin: '8px 0 2px 0', textAlign: 'center', textTransform: 'uppercase' }}>{itemName.replace(/WIG/gi, '').trim()}</p>
                                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginBottom: '4px' }}>
                                    {[...Array(5)].map((_, idx) => (
                                      <img key={idx} src="/assets/NOIR/filled-star.png" alt="Star" style={{ width: '14px', height: '14px', filter: 'drop-shadow(0 0 0 1px black)' }} />
                                    ))}
                                  </div>
                                  <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: 'black', margin: '0 0 4px 0', textAlign: 'center', textTransform: 'uppercase' }}>4.9 OUT OF 5 STARS</p>
                                  <button type="button" onClick={() => removeFromList(item)} style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#999', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textTransform: 'uppercase' }}>REMOVE</button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                <>
                {/* List rows: user-created lists only (main wishlist lives on /wishlist) */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0,
                    paddingTop: '20.8px',
                    ...(lists.length === 0
                      ? { flex: 1, alignItems: 'center', justifyContent: 'center' }
                      : {}),
                  }}
                >
                  {lists.length === 0 && !showCreateListModal ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#000' }}>
                      <p
                        style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '11px', color: '#808080', textTransform: 'uppercase', margin: '0' }}
                      >
                        YOU DON&apos;T HAVE ANY LISTS YET.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {lists.map((list) => {
                        const firstItem = list.items?.[0];
                        const thumbSrc = firstItem ? getLeafBrickFrontImage(firstItem) : EMPTY_LIST_THUMB_SRC;
                        const count = list.items?.length ?? 0;
                        return (
                          <div
                            key={list.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setExpandedListId(list.id)}
                            onKeyDown={(e) => e.key === 'Enter' && setExpandedListId(list.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '16px',
                              paddingLeft: LIST_ROW_CONTENT_OFFSET_LEFT_PX,
                              paddingBottom: '16px',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={(e) => { e.stopPropagation(); setExpandedListId(list.id); }}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setExpandedListId(list.id); } }}
                                className="relative bg-cover bg-center flex items-center justify-center cursor-pointer"
                                style={{
                                  width: '88px',
                                  height: '110px',
                                  ...(firstItem
                                    ? {
                                        backgroundImage: "url('/assets/leaf-brick-resize.png')",
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                      }
                                    : { backgroundColor: '#fff' }),
                                  border: '1.3px solid #000',
                                  boxShadow: `inset 0 0 0 ${LIST_THUMB_FRAME_INSET_PX}px #fff`,
                                  overflow: 'hidden'
                                }}
                              >
                                {firstItem ? (
                                  <img
                                    src={thumbSrc}
                                    alt=""
                                    style={{
                                      position: 'absolute',
                                      left: '50%',
                                      bottom: LIST_THUMB_FRAME_INSET_PX,
                                      transform: 'translateX(-50%)',
                                      width: 'auto',
                                      height: '96%',
                                      maxWidth: '106%',
                                      objectFit: 'contain',
                                      objectPosition: 'bottom',
                                      zIndex: 1,
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      position: 'absolute',
                                      top: LIST_THUMB_FRAME_INSET_PX,
                                      left: LIST_THUMB_FRAME_INSET_PX,
                                      right: LIST_THUMB_FRAME_INSET_PX,
                                      bottom: LIST_THUMB_FRAME_INSET_PX,
                                      overflow: 'hidden',
                                    }}
                                  >
                                    <img
                                      src={thumbSrc}
                                      alt=""
                                      style={{
                                        display: 'block',
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        objectPosition: 'center',
                                        transform: `translateY(-${EMPTY_LIST_THUMB_OFFSET_UP_PX}px) scale(${EMPTY_LIST_THUMB_SCALE})`,
                                        transformOrigin: 'center center',
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                              <span style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", cursive', fontSize: '12px', color: '#000', textTransform: 'uppercase', marginTop: '6px' }}>
                                {count} {count === 1 ? 'ITEM' : 'ITEMS'}
                              </span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0, paddingTop: '4px' }} onClick={() => setExpandedListId(list.id)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setExpandedListId(list.id)}>
                              <span style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", cursive', fontSize: '18px', color: '#000', textTransform: 'uppercase' }}>{list.name}</span>
                              <p style={{ fontFamily: '"Futura PT Medium", Futura, sans-serif', fontSize: '11px', color: '#666', margin: '2px 0 0 0', textTransform: 'uppercase' }}>{getUserListVisibilityLabel(list)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                </>
                )}
                </div>
                </div>
              </>
            )}
          </div>

          {/* PAGE ACTIONS: below card only (PAGE_LAYOUT.md) */}
          {!showMobileMenu && (
            <PageActionsBelowCard>
              {expandedListId ? (
                <>
                  <button
                    type="button"
                    onClick={handleShareListClick}
                    className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                    style={pageActionButtonStyle}
                  >
                    SHARE LIST
                  </button>
                  <PageActionsBelowCard.Spacer />
                  <button
                    type="button"
                    onClick={() => { setListToDelete(expandedListId); setShowDeleteListConfirm(true); }}
                    className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                    style={pageActionButtonStyle}
                  >
                    DELETE LIST
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCreateListModal(true)}
                  className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                  style={pageActionButtonStyle}
                >
                  CREATE NEW LIST
                </button>
              )}
            </PageActionsBelowCard>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteListConfirm}
        onClose={() => { setShowDeleteListConfirm(false); setListToDelete(null); }}
        onConfirm={handleDeleteList}
        title="DELETE LIST"
        message="ARE YOU SURE YOU WANT TO DELETE THIS LIST?"
        confirmText="CONFIRM"
        cancelText="CANCEL"
        dataAttribute="delete-list-confirm"
      />
      <CreateNewListModal
        isOpen={showCreateListModal}
        onClose={() => setShowCreateListModal(false)}
        onCreated={() => { refreshLists(); setShowCreateListModal(false); }}
      />
      <ShareListLinkModal
        isOpen={showShareListModal}
        onClose={() => setShowShareListModal(false)}
        shareUrl={shareListUrl}
        listName={lists.find((l) => l.id === expandedListId)?.name}
      />
    </div>
  );
}
