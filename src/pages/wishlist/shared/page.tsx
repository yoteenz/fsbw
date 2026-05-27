import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getSharedListByToken,
  recordSharedListView,
} from '../../../utils/wishlistListShare';

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

export default function SharedWishlistListPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);

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

  const items: any[] = snapshot?.items ?? [];

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
          className="border border-black flex justify-center items-center py-3 w-full mb-5 px-5 bg-white/60 backdrop-blur-sm relative"
          style={{ borderWidth: '1.3px' }}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute left-4 cursor-pointer"
            style={{
              height: '15px',
              width: '21px',
              padding: 0,
              border: 'none',
              background: 'none',
            }}
            aria-label="Go back"
          >
            <img src="/assets/back-arrow.svg" alt="" style={{ width: '100%', height: '100%' }} />
          </button>
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
                    fontFamily: '"Covered By Your Grace", cursive',
                    fontSize: '17px',
                  }}
                >
                  {items.length}
                </span>
              </div>
              <div style={{ paddingTop: '16px', flex: 1, overflowY: 'auto' }}>
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
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {items.map((item: any, index: number) => {
                      const itemName = (item.name || item.productName || 'NOIR').toString().toUpperCase();
                      const itemLength = item.length || '24"';
                      const itemHairOrigin = item.hairOrigin || getHairOrigin(itemName);
                      return (
                        <div
                          key={item.id || index}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            paddingBottom: '16px',
                            marginBottom: '16px',
                            borderBottom: index < items.length - 1 ? '1px solid #e5e5e5' : 'none',
                          }}
                        >
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate(getProductRoute(itemName))}
                            onKeyDown={(e) => e.key === 'Enter' && navigate(getProductRoute(itemName))}
                            className="relative bg-cover bg-center flex items-center justify-center cursor-pointer flex-shrink-0"
                            style={{
                              width: '88px',
                              height: '110px',
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
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                              style={{
                                fontFamily: '"Covered By Your Grace", cursive',
                                fontSize: '18px',
                                color: '#000',
                                margin: '0 0 4px 0',
                                textTransform: 'uppercase',
                              }}
                            >
                              {itemName.replace(/WIG/gi, '').trim()}
                            </p>
                            <p
                              style={{
                                fontFamily: '"Futura PT Book"',
                                fontSize: '10px',
                                color: '#EB1C24',
                                margin: '0 0 6px 0',
                                textTransform: 'uppercase',
                              }}
                            >
                              {itemLength} RAW {itemHairOrigin}
                            </p>
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
    </div>
  );
}
