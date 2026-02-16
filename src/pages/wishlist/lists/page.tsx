import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import ConfirmationModal from '../../../components/ConfirmationModal';
import BrandMenuLinks from '../../../components/BrandMenuLinks';
import SocialMenuIcons from '../../../components/SocialMenuIcons';
import { loadUserLists, saveUserLists, type UserList } from '../../../components/AddToListModal';
import CreateNewListModal from '../../../components/CreateNewListModal';
import { PageActionsBelowCard, pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';

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
  const [lists, setLists] = useState<UserList[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
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

  const refreshLists = () => {
    setLists(loadUserLists());
  };

  const refreshWishlistCount = () => {
    try {
      const raw = localStorage.getItem('wishlistItems');
      const arr = raw ? JSON.parse(raw) : [];
      setWishlistCount(Array.isArray(arr) ? arr.length : 0);
    } catch {
      setWishlistCount(0);
    }
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
    else navigate('/sign-in');
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

  useEffect(() => {
    refreshLists();
    refreshWishlistCount();
    const handleUpdate = () => {
      refreshLists();
      refreshWishlistCount();
    };
    window.addEventListener('userListsUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('wishlistUpdated', handleUpdate);
    return () => {
      window.removeEventListener('userListsUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('wishlistUpdated', handleUpdate);
    };
  }, []);

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
    <div className="min-h-screen" style={{ position: 'relative' }}>
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
                    onClick={() => navigate(isSignedIn ? '/account' : '/sign-in')}
                    className="cursor-pointer"
                    style={{ height: '15px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(4px)' }}
                  >
                    <img alt="Account" width="16" height="16" src="/assets/NOIR/account-icon.svg" />
                  </button>
                  <button
                    onClick={() => navigate(isSignedIn ? '/wishlist' : '/sign-in')}
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
                  <span style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }} onClick={() => navigate('/build-a-wig')}>
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
              overflow: 'visible',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              minHeight: showMobileMenu ? 'calc(100dvh - 80px)' : '560px',
              height: showMobileMenu ? 'calc(100dvh - 80px)' : 'auto'
            }}
          >
            {showMobileMenu ? (
              /* Full menu - same as wishlist */
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', paddingTop: '20px', height: '490px', position: 'relative' }}>
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
                      <div className="flex items-center justify-between cursor-pointer" onClick={() => navigate('/tools/gift-card')}>
                        <span style={{ fontFamily: '"Futura PT Book"', fontSize: '14px', color: 'black', fontWeight: '500', textTransform: 'uppercase', transform: 'translateX(7px)' }}>GIFT CARD</span>
                      </div>
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
                          <div className="flex items-center justify-between" style={{ alignItems: 'center', cursor: item.label === 'ORDER AUTHORIZATION FORM' ? 'pointer' : 'default' }}>
                            <span
                              style={{ fontFamily: '"Futura PT Book"', fontSize: '14px', color: 'black', fontWeight: '500', textTransform: 'uppercase', cursor: 'pointer', transform: 'translateX(7px)' }}
                              onClick={() => {
                                if (!item.isExpandable && item.label === 'ORDER AUTHORIZATION FORM') navigate('/shop/order-form');
                                else if (!item.isExpandable && item.label === 'BUILD-A-WIG') navigate('/build-a-wig');
                                else if (item.isExpandable && item.label === 'UNITS' && mobileMenuExpandedItems.includes(item.label)) navigate('/shop/units');
                                else if (item.isExpandable) handleMobileMenuItemToggle(item.label);
                              }}
                            >
                              {item.label}
                            </span>
                            {item.hasArrow && (
                              <img
                                src="/assets/NOIR/closed-arrow.svg"
                                alt="Arrow"
                                style={{ width: '16px', height: '16px', transform: mobileMenuExpandedItems.includes(item.label) ? 'translateX(-5px) translateY(-4px) rotate(90deg)' : 'translateX(-5px) translateY(-4px) rotate(0deg)', cursor: 'pointer' }}
                                onClick={(e) => { e.stopPropagation(); if (item.isExpandable) handleMobileMenuItemToggle(item.label); }}
                              />
                            )}
                          </div>
                          {item.isExpandable && mobileMenuExpandedItems.includes(item.label) && item.subItems && (
                            <div className="ml-4 mt-2 space-y-2">
                              {item.subItems.map((subItem, subIndex) => (
                                <div key={subIndex} className="flex items-center cursor-pointer" onClick={() => { if (subItem === 'STRAIGHT') navigate('/units/straight'); else if (subItem === 'WAVY') navigate('/units/wavy'); else if (subItem === 'CURLY') navigate('/units/curly'); }}>
                                  <span style={{ fontFamily: '"Futura PT Book"', fontSize: '14px', color: '#EB1C24', fontWeight: '500', textTransform: 'uppercase' }}>{subItem}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="flex justify-center" style={{ marginBottom: '20px', marginTop: 'auto' }}>
                  <span onClick={handleMobileMenuSignInToggle} style={{ fontFamily: '"Futura PT Medium"', fontSize: '14px', color: '#EB1C24', fontWeight: '500', textTransform: 'uppercase', cursor: 'pointer' }}>
                    {isSignedIn ? 'SIGN OUT' : 'SIGN IN'}
                  </span>
                </div>
                <SocialMenuIcons />
              </div>
            ) : (
              <>
                {/* Page-specific header: list name when expanded (e.g. VACATION), otherwise LISTS */}
                {(() => {
                  const expandedList = expandedListId ? lists.find((l) => l.id === expandedListId) : null;
                  const expandedItemCount = expandedList ? (expandedList.items?.length ?? 0) : 0;
                  const headerLabel = expandedListId && expandedList ? (expandedList.name ?? '').toUpperCase() : 'LISTS';
                  const headerCount = expandedListId && expandedList ? expandedItemCount : lists.length + 1;
                  return (
                    <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200">
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

                {expandedListId ? (
                  (() => {
                    const isWishlist = expandedListId === 'wishlist';
                    const expandedList = isWishlist ? null : lists.find((l) => l.id === expandedListId);
                    const expandedItems: any[] = isWishlist
                      ? (() => { try { return JSON.parse(localStorage.getItem('wishlistItems') || '[]'); } catch { return []; } })()
                      : (expandedList?.items ?? []);
                    const removeFromList = (item: any) => {
                      if (isWishlist) {
                        const raw = localStorage.getItem('wishlistItems');
                        const arr = raw ? JSON.parse(raw) : [];
                        const next = Array.isArray(arr) ? arr.filter((i: any) => i.id !== item.id) : [];
                        localStorage.setItem('wishlistItems', JSON.stringify(next));
                        window.dispatchEvent(new CustomEvent('wishlistUpdated'));
                        refreshWishlistCount();
                        if (next.length === 0) setExpandedListId(null);
                      } else if (expandedList) {
                        const nextItems = (expandedList.items || []).filter((i: any) => i.id !== item.id);
                        const nextLists = lists.map((l) => l.id === expandedList.id ? { ...l, items: nextItems } : l);
                        saveUserLists(nextLists);
                        setLists(nextLists);
                        if (nextItems.length === 0) setExpandedListId(null);
                      }
                    };
                    return (
                      <div style={{ paddingTop: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '16px' }}>
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
                          <p style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: '#666', textAlign: 'center', padding: '24px 0', textTransform: 'uppercase' }}>NO ITEMS IN THIS LIST</p>
                        ) : expandedViewMode === 'line' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                            {expandedItems.map((item: any, index: number) => {
                              const itemName = (item.name || item.productName || 'NOIR').toString().toUpperCase();
                              const itemLength = item.length || '24"';
                              const itemHairOrigin = item.hairOrigin || getHairOrigin(itemName);
                              return (
                                <div key={item.id || index} style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', marginBottom: '16px', borderBottom: index < expandedItems.length - 1 ? '1px solid #e5e5e5' : 'none' }}>
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
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '20px 16px' }}>
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
                {/* List rows: WISHLIST (primary) first, then user lists with delete */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0, paddingTop: '20.8px' }}>
                  {/* Primary list: WISHLIST */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate('/wishlist')}
                    onKeyDown={(e) => e.key === 'Enter' && navigate('/wishlist')}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px',
                      cursor: 'pointer',
                      paddingBottom: '16px'
                    }}
                  >
                    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateX(-2px)' }}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={(e) => { e.stopPropagation(); navigate('/wishlist'); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); navigate('/wishlist'); } }}
                        className="relative bg-cover bg-center flex items-center justify-center cursor-pointer"
                        style={{
                          width: '88px',
                          height: '110px',
                          backgroundImage: "url('/assets/leaf-brick-resize.png')",
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          border: '1.3px solid #000',
                          boxShadow: 'inset 0 0 0 3px #fff',
                          overflow: 'hidden'
                        }}
                      >
                        {(() => {
                          try {
                            const wi = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
                            const first = wi[0];
                            const src = first ? getLeafBrickFrontImage(first) : '/assets/natural front.png';
                            return <img src={src} alt="" style={{ position: 'absolute', left: '50%', bottom: 3, transform: 'translateX(-50%)', width: 'auto', height: '96%', maxWidth: '106%', objectFit: 'contain', objectPosition: 'bottom', zIndex: 1 }} />;
                          } catch {
                            return <img src="/assets/natural front.png" alt="" style={{ position: 'absolute', left: '50%', bottom: 3, transform: 'translateX(-50%)', width: 'auto', height: '96%', maxWidth: '106%', objectFit: 'contain', objectPosition: 'bottom', zIndex: 1 }} />;
                          }
                        })()}
                      </div>
                      <span style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", cursive', fontSize: '12px', color: '#000', textTransform: 'uppercase', marginTop: '6px' }}>
                        {wishlistCount} {wishlistCount === 1 ? 'ITEM' : 'ITEMS'}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0, paddingTop: '4px', transform: 'translateX(-2px)' }}>
                      <span style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", cursive', fontSize: '18px', color: '#000', textTransform: 'uppercase' }}>WISHLIST</span>
                      <p style={{ fontFamily: '"Futura PT Medium", Futura, sans-serif', fontSize: '11px', color: '#EB1C24', margin: '2px 0 0 0', textTransform: 'uppercase' }}>DEFAULT</p>
                    </div>
                  </div>

                  {/* Secondary lists (user-created) with delete */}
                  {lists.length === 0 ? null : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {lists.map((list) => {
                        const firstItem = list.items?.[0];
                        const isVacation = list.name?.toLowerCase() === 'vacation';
                        const emptyThumb = isVacation ? '/assets/2D WAVY FRONT.png' : '/assets/natural front.png';
                        const thumbSrc = firstItem ? getLeafBrickFrontImage(firstItem) : emptyThumb;
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
                              paddingBottom: '16px',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateX(-2px)' }}>
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={(e) => { e.stopPropagation(); setExpandedListId(list.id); }}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setExpandedListId(list.id); } }}
                                className="relative bg-cover bg-center flex items-center justify-center cursor-pointer"
                                style={{
                                  width: '88px',
                                  height: '110px',
                                  backgroundImage: "url('/assets/leaf-brick-resize.png')",
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                  backgroundRepeat: 'no-repeat',
                                  border: '1.3px solid #000',
                                  boxShadow: 'inset 0 0 0 3px #fff',
                                  overflow: 'hidden'
                                }}
                              >
                                <img src={thumbSrc} alt="" style={{ position: 'absolute', left: '50%', bottom: 3, transform: 'translateX(-50%)', width: 'auto', height: '96%', maxWidth: '106%', objectFit: 'contain', objectPosition: 'bottom', zIndex: 1 }} />
                              </div>
                              <span style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", cursive', fontSize: '12px', color: '#000', textTransform: 'uppercase', marginTop: '6px' }}>
                                {count} {count === 1 ? 'ITEM' : 'ITEMS'}
                              </span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0, paddingTop: '4px', transform: 'translateX(-2px)' }} onClick={() => setExpandedListId(list.id)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setExpandedListId(list.id)}>
                              <span style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", cursive', fontSize: '18px', color: '#000', textTransform: 'uppercase' }}>{list.name}</span>
                              <p style={{ fontFamily: '"Futura PT Medium", Futura, sans-serif', fontSize: '11px', color: '#666', margin: '2px 0 0 0', textTransform: 'uppercase' }}>{list.hasBeenShared ? 'SHARED' : 'PRIVATE'}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {lists.length === 0 && (
                    <p style={{ fontFamily: '"Futura PT Book"', fontSize: '12px', color: '#000', textAlign: 'center', padding: '24px 0', textTransform: 'uppercase' }}>
                      YOU DON&apos;T HAVE ANY OTHER LISTS YET. CREATE ONE FROM THE WISHLIST.
                    </p>
                  )}
                </div>
                </>
                )}
              </>
            )}
          </div>

          {/* PAGE ACTIONS: below card only (PAGE_LAYOUT.md) */}
          {!showMobileMenu && (
            <PageActionsBelowCard>
              {expandedListId && expandedListId !== 'wishlist' ? (
                <>
                  <button
                    type="button"
                    onClick={() => { setListToDelete(expandedListId); setShowDeleteListConfirm(true); }}
                    className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                    style={pageActionButtonStyle}
                  >
                    DELETE LIST
                  </button>
                  <PageActionsBelowCard.Spacer />
                  <button
                    type="button"
                    className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                    style={pageActionButtonStyle}
                  >
                    SHARE LIST
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
        title="DELETE LIST?"
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
    </div>
  );
}
