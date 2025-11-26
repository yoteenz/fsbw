
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ThumbBox from '../../../components/ThumbBox';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import LoadingScreen from '../../../components/base/LoadingScreen';

interface LaceOption {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

function LaceSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedLace, setSelectedLace] = useState(() => {
    return localStorage.getItem('selectedLace') || '13X6';
  });
  const [selectedView, setSelectedView] = useState(1); // Changed from 0 to 1 (middle image)
  const [showLoading, setShowLoading] = useState(true);
  
  // Mobile menu state
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileMenuActiveTab, setMobileMenuActiveTab] = useState('SHOP');
  const [mobileMenuExpandedItems, setMobileMenuExpandedItems] = useState<string[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  
  // Cart count state
  const [cartCount, setCartCount] = useState(() => {
    return parseInt(localStorage.getItem('cartCount') || '0');
  });

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

  // Get wig views based on selected hairline from localStorage
  const getWigViews = () => {
    const selectedHairline = localStorage.getItem('selectedHairline') || 'NATURAL';
    const hasPeak = selectedHairline.includes('PEAK');
    const hasLagos = selectedHairline.includes('LAGOS');
    
    if (hasPeak) {
      return [
        '/assets/peak left.png',
        '/assets/peak front.png', 
        '/assets/peak right.png'
      ];
    } else if (hasLagos) {
      return [
        '/assets/lagos left.png',
        '/assets/lagos front.png',
        '/assets/lagos right.png'
      ];
    } else {
      // Default to natural images
      return [
        '/assets/natural left.png',
        '/assets/natural front.png',
        '/assets/natural right.png'
      ];
    }
  };

  const wigViews = getWigViews();

  // Lace options - Updated with exact order and pricing (13X6 is default)
  const laceOptions: LaceOption[] = [
    {
      id: '2X6',
      name: '2X6',
      description: 'Small lace area',
      price: -40, // Less than default, discount
      image:
        'https://hair-saloon-one.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimage4.ea33a249.png&w=256&q=75',
    },
    {
      id: '4X4',
      name: '4X4',
      description: 'Square closure',
      price: -40, // Less than default, discount
      image:
        'https://hair-saloon-one.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimage4.ea33a249.png&w=256&q=75',
    },
    {
      id: '5X5',
      name: '5X5',
      description: 'Medium closure',
      price: -20, // Less than default, discount
      image:
        'https://hair-saloon-one.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimage4.ea33a249.png&w=256&q=75',
    },
    {
      id: '6X6',
      name: '6X6',
      description: 'Large closure',
      price: 60, // Additional cost for 6X6 lace
      image:
        'https://hair-saloon-one.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimage4.ea33a249.png&w=256&q=75',
    },
    {
      id: '9X6',
      name: '9X6',
      description: 'Wide frontal',
      price: 80, // Additional cost for 9X6 lace
      image:
        'https://hair-saloon-one.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimage4.ea33a249.png&w=256&q=75',
    },
    {
      id: '7X7',
      name: '7X7',
      description: 'Extra large closure',
      price: 100, // Additional cost for 7X7 lace
      image:
        'https://hair-saloon-one.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimage4.ea33a249.png&w=256&q=75',
    },
    {
      id: '13X4',
      name: '13X4',
      description: 'Standard frontal',
      price: -20, // Less than default
      image:
        'https://hair-saloon-one.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimage4.ea33a249.png&w=256&q=75',
    },
    {
      id: '13X6',
      name: '13X6',
      description: 'Deep frontal',
      price: 0, // Default option - included in base price
      image:
        'https://hair-saloon-one.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimage4.ea33a249.png&w=256&q=75',
    },
    {
      id: '360',
      name: '360',
      description: '360 degree lace',
      price: 160, // Additional cost for 360 lace
      image:
        'https://hair-saloon-one.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimage4.ea33a249.png&w=256&q=75',
    },
    {
      id: 'FULL',
      name: 'FULL',
      description: 'Full lace wig',
      price: 240, // Additional cost for full lace
      image:
        'https://hair-saloon-one.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fimage4.ea33a249.png&w=256&q=75',
    },
  ];

  const handleLaceSelect = (laceId: string) => {
    setSelectedLace(laceId);
  };

  const handleBack = () => {
    navigate('/build-a-wig');
  };

  // Mobile menu handlers
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

  const handleConfirmSelection = () => {
    try {
      const price = getSelectedPrice().toString();
      
      // Check if we're in edit mode or customize mode
      const isEditMode = localStorage.getItem('editingCartItem') !== null;
      
      // Get the source route from sessionStorage (set by main page when navigating to sub-page)
      // Also check if we're in edit or customize mode as fallback
      let sourceRoute = sessionStorage.getItem('sourceRoute');
      
      // Fallback: check localStorage for edit mode or customize mode
      if (!sourceRoute) {
        const editingCartItem = localStorage.getItem('editingCartItem');
        const selectedCapSize = localStorage.getItem('selectedCapSize');
        
        if (editingCartItem) {
          sourceRoute = '/build-a-wig/edit';
          console.log('Lace page - No sourceRoute found, detected edit mode from localStorage');
        } else if (selectedCapSize) {
          sourceRoute = '/build-a-wig/noir/customize';
          console.log('Lace page - No sourceRoute found, detected customize mode from localStorage');
        } else {
          sourceRoute = '/build-a-wig';
          console.log('Lace page - No sourceRoute found, defaulting to main page');
        }
      }
      
      const isCustomizeMode = !isEditMode && sourceRoute === '/build-a-wig/noir/customize';
      
      // Always save with 'selected' prefix
      localStorage.setItem('selectedLace', selectedLace);
      localStorage.setItem('selectedLacePrice', price);
      
      // Also save with 'editSelected' prefix in edit mode
      if (isEditMode) {
        localStorage.setItem('editSelectedLace', selectedLace);
        localStorage.setItem('editSelectedLacePrice', price);
      }
      
      // Also save with 'customizeSelected' prefix in customize mode
      if (isCustomizeMode) {
        localStorage.setItem('customizeSelectedLace', selectedLace);
        localStorage.setItem('customizeSelectedLacePrice', price);
      }
      
      // Determine the correct route to navigate back to based on current pathname
      let returnRoute = '/build-a-wig'; // Default
      if (location.pathname.startsWith('/build-a-wig/edit/')) {
        returnRoute = '/build-a-wig/edit';
      } else if (location.pathname.startsWith('/build-a-wig/noir/customize/')) {
        returnRoute = '/build-a-wig/noir/customize';
      } else if (sourceRoute) {
        returnRoute = sourceRoute;
      }
      
      console.log('Lace page - Navigating back to route:', returnRoute);
      
      // Set flag to indicate we're returning from a sub-page
      sessionStorage.setItem('comingFromSubPage', 'true');
      
      // Dispatch custom event to notify main page of changes
      window.dispatchEvent(new CustomEvent('customStorageChange'));
      
      navigate(returnRoute);
    } catch (e) {
      console.error('Unable to save selected lace to localStorage', e);
    }
  };

  const getSelectedPrice = () => {
    const selected = laceOptions.find((option) => option.id === selectedLace);
    return selected ? selected.price : 0;
  };

  // Get dynamic lace note text based on selected lace option
  const getLaceNoteText = () => {
    const currentLace = selectedLace;
    
    // For 2x6 lace option
    if (currentLace === '2X6') {
      return (
        <>
          GLUELESS CLOSURE UNIT.<br />
          2" EAR TO EAR + 6" FRONT TO BACK.
        </>
      );
    }
    
    // For 4x4 lace option
    if (currentLace === '4X4') {
      return (
        <>
          GLUELESS CLOSURE UNIT.<br />
          4" EAR TO EAR + 4" FRONT TO BACK.
        </>
      );
    }
    
    // For 5x5 lace option
    if (currentLace === '5X5') {
      return (
        <>
          GLUELESS CLOSURE UNIT.<br />
          5" EAR TO EAR + 5" FRONT TO BACK.
        </>
      );
    }
    
    // For 6x6 lace option
    if (currentLace === '6X6') {
      return (
        <>
          GLUELESS CLOSURE UNIT.<br />
          6" EAR TO EAR + 6" FRONT TO BACK.
        </>
      );
    }
    
    // For 9x6 lace option
    if (currentLace === '9X6') {
      return (
        <>
          GLUELESS CLOSURE UNIT.<br />
          9" EAR TO EAR + 6" FRONT TO BACK.
        </>
      );
    }
    
    // For 7x7 lace option
    if (currentLace === '7X7') {
      return (
        <>
          GLUELESS CLOSURE UNIT.<br />
          7" EAR TO EAR + 7" FRONT TO BACK.
        </>
      );
    }
    
    // For 13x4 lace option
    if (currentLace === '13X4') {
      return (
        <>
          GLUELESS FRONTAL UNIT.<br />
          13" EAR TO EAR + 4" FRONT TO BACK.
        </>
      );
    }
    
    // For 13x6 lace option
    if (currentLace === '13X6') {
      return (
        <>
          GLUELESS FRONTAL UNIT.<br />
          13" EAR TO EAR + 6" FRONT TO BACK.
        </>
      );
    }
    
    // For 360 lace option
    if (currentLace === '360') {
      return (
        <>
          FRONTAL UNIT WITH LACE AROUND THE PERIMETER.<br />
          EXPECT AN ADDITIONAL WEEK OF PROCESSING TIME.
        </>
      );
    }
    
    // For full lace option
    if (currentLace === 'FULL') {
      return (
        <>
          HD LACE THROUGHOUT THE ENTIRE CAP.<br />
          EXPECT AN ADDITIONAL WEEK OF PROCESSING TIME.
        </>
      );
    }
    
    // For other lace options, return default text
    return 'PLEASE NOTE: EACH CUSTOM UNIT IS MADE TO ORDER. WE ENSURE ALL DETAILS ARE ACCURATE + PRECISE. EXPECT 6 - 8 WEEKS OF PROCESSING TIME FOR THIS UNIT.';
  };

  const totalPrice = getSelectedPrice();

  useEffect(() => {
    // Hide loading screen after 2 seconds
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

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
              onClick={handleBack} 
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
                style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontWeight: '500', cursor: 'pointer' }}
                onClick={() => navigate('/units/noir')}
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

        {/* MAIN BUILD AREA */}
        <div
          className="border border-black flex flex-col pt-6 pb-4 px-5 mb-2 bg-white/60 backdrop-blur-sm"
          style={{ borderWidth: '1.3px' }}
        >
          {/* WIG PREVIEW */}
          <div className="w-full flex items-center flex-col mb-6 md:mb-8" style={{ transform: 'translateY(20px)' }}>
            <div className="leaf-stack hero-thumb">
              <div className="leaf-bg" aria-hidden="true"></div>
              <div
                className="relative bg-cover bg-center flex items-center justify-center"
                style={{
                  width: '262px',
                  height: '367px',
                  backgroundImage: `url('/assets/leaf-brick.png')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                  <p
                    className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 text-5xl sm:text-6xl z-20 noir-text cursor-pointer"
                    style={{
                      color: '#EB1C24',
                    }}
                    onClick={() => navigate('/units/noir')}
                  >
                    NOIR
                  </p>
                <img
                  src={wigViews[selectedView]}
                  alt="Selected Wig"
                  width="282"
                  height="387"
                  className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hero-mannequin-img"
                  style={{ 
                    top: 'calc(50% - 10.601px + 18px)',
                    '--hero-width': '282px',
                    '--hero-height': '387px'
                  } as React.CSSProperties}
                />
              </div>
            </div>

            {/* THUMBNAILS */}
            <div className="flex justify-center mb-3 mt-2" style={{ transform: 'translateY(10px)', gap: '2px' }}>
              {wigViews.map((view, index) => (
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

          {/* Back Button */}
            <div className="flex justify-start ml-[calc(50%-131px)]">
          </div>

          {/* LACE SELECTION HEADER */}
          <p
            className="text-xs sm:text-sm text-center text-red-500"
            style={{ fontFamily: '"Covered By Your Grace", cursive', color: '#EB1C24', transform: 'translateY(18px)', marginBottom: '31px' }}
          >
            HD TOPPER SIZE
          </p>

          {/* LACE OPTIONS - Updated to fit 4 containers per row with centered layout */}
          <div className="grid grid-cols-4 gap-3 mx-auto justify-center mb-6 max-w-[320px]">
            {laceOptions.map((option) => (
              <ThumbBox
                key={option.id}
                image={option.image}
                title="LACE"
                label={option.name}
                isSelected={selectedLace === option.id}
                onClick={() => handleLaceSelect(option.id)}
                imgSize={74}
                containerSize={54}
                topPosition="52%"
                customTransform="translateX(calc(-50% - 3px)) translateY(-50%)"
              />
            ))}
          </div>

          {/* DYNAMIC LACE NOTE */}
          <p
            className="font-futura text-[10px] md:text-xs text-center w-[95%] mx-auto uppercase"
            style={{ color: '#EB1C24', fontFamily: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif', fontWeight: '500', transform: 'translateY(-7px)', marginTop: '19px', marginBottom: '19px' }}
          >
            {getLaceNoteText()}
          </p>

          {/* TOTAL PRICE */}
          <div className="text-center">
            <p className="font-futura text-[12px] font-medium" style={{ color: '#909090' }}>
              TOTAL DUE
            </p>
            <p
              className="text-black font-medium text-base"
              style={{
                fontFamily:
                  '"Futura PT", "Futura PT Medium", Futura, Futura, Inter, sans-serif',
                fontWeight: '500',
              }}
            >
              {totalPrice < 0 ? '-' : totalPrice > 0 ? '+' : ''}${Math.abs(totalPrice)} USD
            </p>
          </div>

        </div>

        {/* CONFIRM SELECTION BUTTON */}
        <div className="px-0 md:px-0" style={{ marginTop: '2px' }}>
          <button
            onClick={handleConfirmSelection}
            className="border border-black font-futura w-full max-w-m text-center py-2 text-[12px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
            style={{ borderWidth: '1.3px', color: '#EB1C24' }}
          >
            CONFIRM SELECTION
          </button>
        </div>
      </div>
        </div>
      </div>
      {/* MOBILE MENU POP-UP */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 z-50"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(5px)'
          }}
          onClick={handleCloseMobileMenu}
        >
          <div 
            className="fixed inset-0 w-full h-full"
            style={{
              backgroundImage: 'url("/assets/Marble Floor.jpg")',
              backgroundSize: '500%',
              backgroundPosition: 'center 60%',
              backgroundRepeat: 'no-repeat'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glassmorphism Container */}
            <div 
              className="border border-black bg-white/60 backdrop-blur-sm"
              style={{ 
                borderWidth: '1.3px',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                height: 'calc(80% + 120px)',
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                willChange: 'backdrop-filter'
              }}
            >
              {/* Close Button */}
              <button
                onClick={handleCloseMobileMenu}
                className="absolute z-10"
                style={{
                  top: '9px',
                  right: '9px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px'
                }}
              >
                <img
                  src="/assets/close-icon.svg"
                  alt="Close"
                  style={{ width: '21px', height: '21px' }}
                />
              </button>

              {/* Top Icons and Currency */}
              <div className="absolute top-16 left-6 right-6 flex justify-between items-center z-10">
                {/* Top Icons */}
                <div className="flex gap-4">
                <div className="flex items-center" style={{ transform: 'translateY(1px)' }}>
                  <DynamicCartIcon count={cartCount} width={28} height={23} />
                </div>
                {isSignedIn ? (
                  <img
                    src="/assets/NOIR/account-wishlist.svg"
                    alt="Wishlist"
                    style={{ width: '21px', height: '21px', transform: 'translateY(4px) translateX(-1px)' }}
                  />
                ) : (
                  <img
                    src="/assets/wishlist-heart.svg"
                    alt="Wishlist"
                    style={{ width: '21px', height: '21px', transform: 'translateY(4px) translateX(-1px)' }}
                  />
                )}
                <img
                  src="/assets/NOIR/account-icon.svg"
                  alt="Account"
                  style={{ width: '21px', height: '21px', transform: 'translateY(4px)' }}
                />
                </div>
                
                {/* Currency Selector */}
                <div className="flex items-center gap-2">
                  <span style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '14px',
                    color: 'black',
                    fontWeight: '500'
                  }}>
                    $ USD
                  </span>
                  <img
                    src="/assets/NOIR/down-arrow.svg"
                    alt="Currency"
                    style={{ width: '14px', height: '14px' }}
                  />
                </div>
              </div>

              {/* Navigation Links */}
              <div className="absolute top-24 left-1/2 transform -translate-x-1/2 flex gap-8 z-10" style={{ marginTop: '30px' }}>
                <button
                  onClick={() => handleMobileMenuTabClick('SHOP')}
                  style={{ 
                    fontFamily: mobileMenuActiveTab === 'SHOP' ? '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' : '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
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
                    fontFamily: mobileMenuActiveTab === 'TOOLS' ? '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' : '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
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
                    fontFamily: mobileMenuActiveTab === 'BRAND' ? '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' : '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
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

              {/* Menu Items */}
              <div className="absolute top-40 right-6 z-10" style={{ marginTop: '15px', left: '27px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                  {mobileMenuActiveTab === 'TOOLS' ? (
                    ['GIFT CARD'].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span style={{ 
                          fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
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
                          fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
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
                          onClick={() => item.isExpandable ? handleMobileMenuItemToggle(item.label) : null}
                        >
                          <span style={{ 
                            fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
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
                              <div key={subIndex} className="flex items-center">
                                <span style={{ 
                                  fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
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

              {/* Sign In/Out */}
              <div className="absolute left-1/2 transform -translate-x-1/2 z-10" style={{ bottom: '86px' }}>
                <span 
                  onClick={handleMobileMenuSignInToggle}
                  style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
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

                {/* Social Media Icons */}
                <div className="absolute left-1/2 transform -translate-x-1/2 z-10" style={{ bottom: '37px' }}>
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
            </div>
          </div>
        )}
    </>
  );
}

export default LaceSelection;
