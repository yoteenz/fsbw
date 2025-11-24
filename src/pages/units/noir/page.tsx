import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import LoadingScreen from '../../../components/base/LoadingScreen';

export default function NoirUnitPage() {
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState(1);
  const [showLoading, setShowLoading] = useState(true);
  
  // Cart count state
  const [cartCount, setCartCount] = useState(() => {
    return parseInt(localStorage.getItem('cartCount') || '0');
  });

  // Mobile menu state
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileMenuActiveTab, setMobileMenuActiveTab] = useState('SHOP');
  const [mobileMenuExpandedItems, setMobileMenuExpandedItems] = useState<string[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Listen for cart count changes
  useEffect(() => {
    const handleCartCountUpdate = (event: CustomEvent) => {
      setCartCount(event.detail);
    };

    const handleStorageChange = () => {
      const newCartCount = parseInt(localStorage.getItem('cartCount') || '0');
      setCartCount(newCartCount);
    };

    window.addEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    // Hide loading screen after 2 seconds
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // NOIR product views
  const noirViews = [
    '/assets/NOIR/noir left.png',
    '/assets/NOIR/noir front.png',
    '/assets/NOIR/noir right.png'
  ];

  const handleMobileMenuToggle = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleCloseMobileMenu = () => {
    setShowMobileMenu(false);
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

  const handleBuildAWig = () => {
    navigate('/build-a-wig');
  };

  return (
    <>
      {showLoading && <LoadingScreen />}
      <div className="min-h-screen" style={{
        position: 'relative'
      }}>
        {/* Fixed Background Layer */}
        <div 
          className="fixed inset-0 -z-10"
          style={{
            backgroundImage: `url('/assets/Marble Floor.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center calc(50% + 25px)',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
          }}
        ></div>
        
        {/* Scrollable Content */}
        <div className="relative z-10">
          {/* MAIN CONTENT */}
          <div className="flex flex-col py-5 px-4">
            {/* HEADER */}
            <div
              className="border-solid border-black flex justify-center items-center py-3 w-full mb-5 px-5 bg-white/60 backdrop-blur-sm relative"
              style={{ border: '1.3px solid black' }}
            >
              <div className="flex gap-5 absolute left-4">
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
                <button className="cursor-pointer" style={{ transform: 'translateX(-2px)' }}>
                  <img
                    alt="Search icon"
                    width="16"
                    height="15"
                    src="/assets/search-icon.svg"
                  />
                </button>
              </div>
              <p className="text-sm" style={{ fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif' }}>
                <span 
                  style={{ fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif', fontWeight: '400', cursor: 'pointer' }}
                  onClick={() => navigate('/build-a-wig')}
                >
                  BUILD-A-WIG &gt;
                </span>{' '}
                <span
                  style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontWeight: '500' }}
                >
                  NOIR
                </span>
              </p>
              <div className="gap-5 flex absolute" style={{ right: '17px' }}>
                <div>
                  <DynamicCartIcon count={cartCount} width={22} height={19} />
                </div>
                <img
                  alt="Menu"
                  width="17"
                  height="18"
                  className="cursor-pointer"
                  src="/assets/menu-icon.svg"
                  onClick={handleMobileMenuToggle}
                />
              </div>
            </div>

            {/* PRODUCT DETAIL AREA */}
            <div
              className="border border-black flex flex-col pt-6 pb-4 px-5 mb-2 bg-white/60 backdrop-blur-sm"
              style={{ borderWidth: '1.3px' }}
            >
              {/* PRODUCT PREVIEW */}
              <div className="w-full flex items-center flex-col mb-6 md:mb-8" style={{ transform: 'translateY(20px)' }}>
                <div className="leaf-stack hero-thumb">
                  <div className="leaf-bg" aria-hidden="true"></div>
                  <div
                    className="relative bg-cover bg-center flex items-center justify-center"
                    style={{
                      width: '262px',
                      height: '367px',
                      backgroundImage: `url('/assets/NOIR/leaf-brick.png')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    <p
                      className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 text-5xl sm:text-6xl z-20 noir-text"
                      style={{
                        color: '#EB1C24',
                      }}
                    >
                      NOIR
                    </p>
                    <img
                      src={noirViews[selectedView]}
                      alt="NOIR Wig"
                      width="282"
                      height="387"
                      className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hero-mannequin-img"
                      style={{ 
                        top: 'calc(50% - 10.601px + 18px)',
                        '--hero-width': '282px',
                        '--hero-height': '387px'
                      } as React.CSSProperties & { '--hero-width'?: string; '--hero-height'?: string }}
                    />
                  </div>
                </div>

                {/* THUMBNAILS */}
                <div className="flex justify-center mb-3 mt-2" style={{ transform: 'translateY(10px)', gap: '2px' }}>
                  {noirViews.map((view, index) => (
                    <div className="leaf-stack thumb" key={index}>
                      <div 
                        className={`leaf-bg ${
                          selectedView === index ? 'border-black' : 'border-transparent'
                        }`} 
                        aria-hidden="true"
                      ></div>
                      <div
                        className="border-transparent p-1 cursor-pointer"
                        onClick={() => setSelectedView(index)}
                      >
                        <div
                          className="relative bg-cover bg-center"
                          data-thumb-index={index}
                          style={{
                            width: '72px',
                            height: '95px',
                            position: 'relative',
                            zIndex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <img
                            alt={`Thumbnail ${index + 1}`}
                            width="63"
                            height="84"
                            src={view}
                            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 thumbnail-mannequin-img"
                            style={{ 
                              '--thumb-top': 'calc(50% - 6.1px + 7.2px)',
                              ...(index === 0 && { left: 'calc(50% - 6px)' })
                            } as React.CSSProperties}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PRODUCT INFORMATION */}
              <div className="w-full flex flex-col items-center mb-6">
                <h1 
                  className="text-4xl sm:text-5xl mb-4"
                  style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontWeight: '500',
                    color: '#EB1C24'
                  }}
                >
                  NOIR
                </h1>
                <p 
                  className="text-sm text-center mb-4 px-4"
                  style={{ 
                    fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
                    lineHeight: '1.6'
                  }}
                >
                  Customize your NOIR wig with our build-a-wig tool. Choose from a variety of lengths, colors, textures, and more to create your perfect look.
                </p>
                
                {/* BUILD A WIG BUTTON */}
                <button
                  onClick={handleBuildAWig}
                  className="border border-black px-8 py-3 mt-4 cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontWeight: '500',
                    backgroundColor: '#EB1C24',
                    color: 'white',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                >
                  BUILD YOUR NOIR
                </button>
              </div>
            </div>

            {/* MOBILE MENU */}
            {showMobileMenu && (
              <div 
                className="fixed inset-0 bg-white z-50 overflow-y-auto"
                style={{ paddingTop: '60px' }}
              >
                <div className="flex flex-col">
                  <div className="flex justify-between items-center px-5 py-3 border-b border-black">
                    <p className="text-lg font-bold">MENU</p>
                    <button onClick={handleCloseMobileMenu}>
                      <img src="/assets/closed-arrow.svg" alt="Close" width="20" height="20" />
                    </button>
                  </div>
                  
                  <div className="flex border-b border-black">
                    <button
                      onClick={() => handleMobileMenuTabClick('SHOP')}
                      className={`flex-1 py-3 text-center ${mobileMenuActiveTab === 'SHOP' ? 'border-b-2 border-black font-bold' : ''}`}
                      style={{ fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif' }}
                    >
                      SHOP
                    </button>
                    <button
                      onClick={() => handleMobileMenuTabClick('ACCOUNT')}
                      className={`flex-1 py-3 text-center ${mobileMenuActiveTab === 'ACCOUNT' ? 'border-b-2 border-black font-bold' : ''}`}
                      style={{ fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif' }}
                    >
                      ACCOUNT
                    </button>
                  </div>

                  {mobileMenuActiveTab === 'SHOP' && (
                    <div className="px-5 py-4">
                      <div 
                        className="py-3 border-b border-gray-200 cursor-pointer flex justify-between items-center"
                        onClick={() => handleMobileMenuItemToggle('WIGS')}
                      >
                        <span style={{ fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif' }}>WIGS</span>
                        <img 
                          src={mobileMenuExpandedItems.includes('WIGS') ? '/assets/NOIR/down-arrow.svg' : '/assets/NOIR/right-facing-arrow.svg'} 
                          alt="Toggle" 
                          width="12" 
                          height="12" 
                        />
                      </div>
                      {mobileMenuExpandedItems.includes('WIGS') && (
                        <div className="pl-4 py-2">
                          <div 
                            className="py-2 cursor-pointer"
                            onClick={() => {
                              navigate('/build-a-wig');
                              handleCloseMobileMenu();
                            }}
                            style={{ fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif' }}
                          >
                            BUILD-A-WIG
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {mobileMenuActiveTab === 'ACCOUNT' && (
                    <div className="px-5 py-4">
                      <div className="flex items-center gap-3 py-3 border-b border-gray-200">
                        <img src="/assets/NOIR/account-icon.svg" alt="Account" width="20" height="20" />
                        <span style={{ fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif' }}>
                          {isSignedIn ? 'SIGN OUT' : 'SIGN IN'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

