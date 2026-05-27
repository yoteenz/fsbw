import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageActionsBelowCard, pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';
import { trackActivity } from '../../../utils/activity';
import {
  getSharedListByToken,
  recordSharedListView,
} from '../../../utils/wishlistListShare';

const LIST_ROW_CONTENT_OFFSET_LEFT_PX = 10;
const SHARED_LIST_ROW_DIVIDER_STYLE = '1px solid #e5e5e5';
const SHARED_LIST_ROW_GAP_BELOW_DIVIDER_PX = 18;
const EXPANDED_LIST_ITEM_THUMB_WIDTH_PX = 88 * 1.2;
const EXPANDED_LIST_ITEM_THUMB_HEIGHT_PX = 110 * 1.2;
const EXPANDED_LIST_LINE_NAME_FONT_PX = 22;
const EXPANDED_LIST_STAR_SIZE_PX = 14 * 0.8;
const EXPANDED_LIST_RATING_FONT_PX = 9;

const EXPANDED_LIST_RAW_TEXT_STYLE: React.CSSProperties = {
  fontFamily: '"Futura PT Medium", Futura, sans-serif',
  fontSize: '10px',
  color: '#EB1C24',
  textTransform: 'uppercase',
};

const EXPANDED_LIST_RATING_TEXT_STYLE: React.CSSProperties = {
  fontFamily: '"Futura PT Medium", Futura, sans-serif',
  fontSize: `${EXPANDED_LIST_RATING_FONT_PX}px`,
  color: '#000000',
  textTransform: 'uppercase',
};

/** Matches unit PDPs (Noir, Blanco, etc.). */
const UNIT_STAR_RATING_LABEL = '4.97 OUT OF 5 STARS';

const LIST_LINE_BAG_LINK_STYLE: React.CSSProperties = {
  fontFamily: '"Futura PT Book"',
  color: '#EB1C24',
  textTransform: 'uppercase',
  fontSize: '8.5px',
  marginTop: '8px',
  marginBottom: 0,
  lineHeight: '1.1',
  textAlign: 'center',
  cursor: 'pointer',
  width: `${EXPANDED_LIST_ITEM_THUMB_WIDTH_PX}px`,
};

const LIST_LINE_BAG_REMOVE_LINK_STYLE: React.CSSProperties = {
  ...LIST_LINE_BAG_LINK_STYLE,
  color: '#808080',
};

function readCartItems(): any[] {
  try {
    const parsed = JSON.parse(localStorage.getItem('cartItems') || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

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

function getProductRoute(name: string): string {
  const n = (name || 'NOIR').toString().toUpperCase();
  const routes: Record<string, string> = {
    NOIR: '/straight/noir',
    BLANCO: '/straight/blanco',
    'SOFT WAVE': '/wavy/soft-wave',
    'BEACH WAVE': '/wavy/beach-wave',
    'SOFT CURL': '/curly/soft-curl',
    'OCEAN CURL': '/curly/ocean-curl',
    'GIFT CARD': '/tools/gift-card',
  };
  return routes[n] || '/build-a-wig';
}

function getHairOrigin(productName: string): string {
  switch (productName) {
    case 'NOIR':
      return 'CAMBODIAN';
    case 'BLANCO':
      return 'RUSSIAN';
    case 'SOFT WAVE':
      return 'INDIAN';
    case 'BEACH WAVE':
      return 'INDONESIAN';
    case 'SOFT CURL':
      return 'VIETNAMESE';
    case 'OCEAN CURL':
      return 'FILIPINO';
    default:
      return 'CAMBODIAN';
  }
}

function isItemOutOfStock(item: any): boolean {
  return (item.stockStatus || 'in_stock') === 'out_of_stock';
}

function cartItemKey(item: any, index: number): string {
  if (item?.id != null && item.id !== '') return String(item.id);
  const name = (item?.name || item?.productName || 'NOIR').toString();
  const length = item?.length || '24"';
  return `shared-${name}-${length}-${index}`;
}

export default function SharedWishlistListPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);
  const [cartCount, setCartCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('cartCount') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [cartSyncVersion, setCartSyncVersion] = useState(0);
  const cartItems = useMemo(() => readCartItems(), [cartCount, cartSyncVersion]);

  const snapshot = useMemo(() => {
    if (!token) return null;
    return getSharedListByToken(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh when registry updates
  }, [token, tick]);

  useEffect(() => {
    if (!token) return;
    recordSharedListView(token);
    const onRegistryUpdate = () => setTick((t) => t + 1);
    window.addEventListener('wishlistSharedRegistryUpdated', onRegistryUpdate);
    return () => window.removeEventListener('wishlistSharedRegistryUpdated', onRegistryUpdate);
  }, [token]);

  useEffect(() => {
    const handleCartCountUpdate = (e: CustomEvent) => {
      setCartCount(e.detail);
      setCartSyncVersion((v) => v + 1);
    };
    const handleStorage = () => {
      try {
        setCartCount(parseInt(localStorage.getItem('cartCount') || '0', 10));
      } catch {
        setCartCount(0);
      }
      setCartSyncVersion((v) => v + 1);
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

  const items: any[] = snapshot?.items ?? [];

  const persistCart = (updatedItems: any[]) => {
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    const newCount = updatedItems.reduce((sum: number, ci: any) => sum + (ci.quantity || 1), 0);
    localStorage.setItem('cartCount', newCount.toString());
    setCartCount(newCount);
    setCartSyncVersion((v) => v + 1);
    window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  const isInBag = (item: any, index: number) =>
    cartItems.some((ci: any) => ci.id === cartItemKey(item, index));

  const handleAddToBag = (item: any, index: number) => {
    try {
      const cartId = cartItemKey(item, index);
      const payload = { ...item, id: cartId };
      const existing = cartItems.find((ci: any) => ci.id === cartId);
      const updatedItems = existing
        ? cartItems.map((ci: any) =>
            ci.id === cartId ? { ...ci, quantity: (ci.quantity || 1) + (item.quantity || 1) } : ci
          )
        : [{ ...payload, quantity: item.quantity || 1 }, ...cartItems];
      persistCart(updatedItems);
      const pname = (item?.name || item?.productName || '').toString();
      trackActivity('add_to_cart', { source: 'wishlist_shared', productName: pname || undefined });
    } catch (e) {
      console.error('Error adding to bag:', e);
    }
  };

  const handleRemoveFromBag = (item: any, index: number) => {
    try {
      const cartId = cartItemKey(item, index);
      const pname = (item?.name || item?.productName || '').toString().trim();
      persistCart(cartItems.filter((ci: any) => ci.id !== cartId));
      trackActivity('remove_from_cart', {
        source: 'wishlist_shared',
        change: 'removed_line',
        productName: pname || undefined,
      });
    } catch (e) {
      console.error('Error removing from bag:', e);
    }
  };

  const handleAddAllToBag = () => {
    try {
      let updatedItems = [...cartItems];
      let added = 0;
      items.forEach((item: any, index: number) => {
        if (isItemOutOfStock(item)) return;
        const cartId = cartItemKey(item, index);
        if (updatedItems.some((ci: any) => ci.id === cartId)) return;
        updatedItems = [{ ...item, id: cartId, quantity: item.quantity || 1 }, ...updatedItems];
        added += 1;
      });
      if (added > 0) {
        persistCart(updatedItems);
        trackActivity('add_to_cart', { source: 'wishlist_shared', change: 'add_all' });
      }
    } catch (e) {
      console.error('Error adding all to bag:', e);
    }
  };

  const hasAddableItems = items.some((item, index) => !isItemOutOfStock(item) && !isInBag(item, index));

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/marble-half.png')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="relative z-10 flex flex-col py-5 px-4">
        <div
          className="border border-black flex justify-center items-center py-3 w-full mb-5 px-5 bg-white/60 backdrop-blur-sm"
          style={{ borderWidth: '1.3px' }}
        >
          <span
            style={{
              fontFamily: '"Futura PT Medium"',
              fontSize: '12px',
              color: '#EB1C24',
              fontWeight: 500,
              textTransform: 'uppercase',
            }}
          >
            SHARED LIST
          </span>
        </div>

        <div
          className="border border-black flex flex-col p-4 mb-2 bg-white/60 backdrop-blur-sm"
          style={{
            borderWidth: '1.3px',
            minHeight: 'calc(100vh * 520 / 745)',
          }}
        >
          {!snapshot ? (
            <p
              style={{
                fontFamily: '"Futura PT Medium"',
                fontSize: '11px',
                color: '#808080',
                textTransform: 'uppercase',
                textAlign: 'center',
                margin: '40px 20px',
              }}
            >
              THIS SHARED LIST LINK IS INVALID OR HAS EXPIRED.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                <span
                  style={{
                    fontFamily: '"Futura PT Medium"',
                    color: '#EB1C24',
                    fontSize: '12px',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                  }}
                >
                  {(snapshot.name || 'LIST').toUpperCase()}
                </span>
                <span
                  style={{
                    fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", cursive',
                    fontSize: '17px',
                  }}
                >
                  {items.length}
                </span>
              </div>
              <div style={{ paddingTop: '10px', flex: 1, overflowY: 'auto' }}>
                {items.length === 0 ? (
                  <p
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '11px',
                      color: '#808080',
                      textTransform: 'uppercase',
                      textAlign: 'center',
                      margin: '32px 20px',
                    }}
                  >
                    THERE ARE NO ITEMS IN THIS LIST.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {items.map((item: any, index: number) => {
                      const itemName = (item.name || item.productName || 'NOIR').toString().toUpperCase();
                      const itemLength = item.length || '24"';
                      const itemHairOrigin = item.hairOrigin || getHairOrigin(itemName);
                      const inBag = isInBag(item, index);
                      const outOfStock = isItemOutOfStock(item);
                      return (
                        <div
                          key={item.id || index}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            paddingLeft: LIST_ROW_CONTENT_OFFSET_LEFT_PX,
                            paddingBottom: '16px',
                            marginBottom:
                              index < items.length - 1 ? `${SHARED_LIST_ROW_GAP_BELOW_DIVIDER_PX}px` : 0,
                            borderBottom:
                              index < items.length - 1 ? SHARED_LIST_ROW_DIVIDER_STYLE : 'none',
                          }}
                        >
                          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => navigate(getProductRoute(itemName))}
                              onKeyDown={(e) => e.key === 'Enter' && navigate(getProductRoute(itemName))}
                              className="relative bg-cover bg-center flex items-center justify-center cursor-pointer"
                              style={{
                                width: `${EXPANDED_LIST_ITEM_THUMB_WIDTH_PX}px`,
                                height: `${EXPANDED_LIST_ITEM_THUMB_HEIGHT_PX}px`,
                                backgroundImage: "url('/assets/leaf-brick-resize.png')",
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                border: '1.3px solid #000',
                                boxShadow: 'inset 0 0 0 3px #fff',
                                overflow: 'hidden',
                              }}
                            >
                              <img
                                src={getLeafBrickFrontImage(item)}
                                alt=""
                                style={{
                                  position: 'absolute',
                                  left: '50%',
                                  bottom: 3,
                                  transform: 'translateX(-50%)',
                                  width: 'auto',
                                  height: '96%',
                                  maxWidth: '106%',
                                  objectFit: 'contain',
                                  objectPosition: 'bottom',
                                  zIndex: 1,
                                }}
                              />
                            </div>
                            {outOfStock ? (
                              <p style={{ ...LIST_LINE_BAG_LINK_STYLE, color: '#808080', cursor: 'default' }}>
                                OUT OF STOCK
                              </p>
                            ) : inBag ? (
                              <p
                                className="font-bold hover:opacity-80 transition-opacity"
                                style={LIST_LINE_BAG_REMOVE_LINK_STYLE}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFromBag(item, index);
                                }}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.stopPropagation();
                                    handleRemoveFromBag(item, index);
                                  }
                                }}
                              >
                                REMOVE FROM BAG
                              </p>
                            ) : (
                              <p
                                className="font-bold hover:opacity-80 transition-opacity"
                                style={LIST_LINE_BAG_LINK_STYLE}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToBag(item, index);
                                }}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.stopPropagation();
                                    handleAddToBag(item, index);
                                  }
                                }}
                              >
                                ADD TO BAG
                              </p>
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                              style={{
                                fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", cursive',
                                fontSize: `${EXPANDED_LIST_LINE_NAME_FONT_PX}px`,
                                color: '#000',
                                margin: '0 0 4px 0',
                                textTransform: 'uppercase',
                              }}
                            >
                              {itemName.replace(/WIG/gi, '').trim()}
                            </p>
                            <p style={{ ...EXPANDED_LIST_RAW_TEXT_STYLE, margin: '0 0 6px 0' }}>
                              {itemLength} RAW {itemHairOrigin}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginBottom: '4px' }}>
                              {[...Array(5)].map((_, idx) => (
                                <img
                                  key={idx}
                                  src="/assets/NOIR/filled-star.png"
                                  alt="Star"
                                  style={{
                                    width: `${EXPANDED_LIST_STAR_SIZE_PX}px`,
                                    height: `${EXPANDED_LIST_STAR_SIZE_PX}px`,
                                    filter: 'drop-shadow(0 0 0 1px black)',
                                  }}
                                />
                              ))}
                            </div>
                            <p style={{ ...EXPANDED_LIST_RATING_TEXT_STYLE, margin: 0 }}>{UNIT_STAR_RATING_LABEL}</p>
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

        {snapshot && items.length > 0 && (
          <PageActionsBelowCard>
            <button
              type="button"
              onClick={handleAddAllToBag}
              disabled={!hasAddableItems}
              className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              style={pageActionButtonStyle}
            >
              ADD ITEMS TO BAG
            </button>
          </PageActionsBelowCard>
        )}
      </div>
    </div>
  );
}
