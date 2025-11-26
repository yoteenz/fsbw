
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ThumbBox from '../../../components/ThumbBox';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import LoadingScreen from '../../../components/base/LoadingScreen';

interface HairlineOption {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  // Assuming a 'type' property may exist for filtering
  type?: number;
}

function HairlineSelection() {
  const navigate = useNavigate();
  const [showLoading, setShowLoading] = useState(true);
  const [selectedHairline, setSelectedHairline] = useState<string[]>(() => {
    const stored = localStorage.getItem('selectedHairline');
    return stored ? [stored] : ['NATURAL']; // Default to NATURAL as single selection
  });
  const [selectedView, setSelectedView] = useState(1); // Changed from 0 to 1 (middle image)

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

  // Dynamic hair views based on selected hairline
  const getWigViews = () => {
    const hasPeak = selectedHairline.includes('PEAK');
    const hasLagos = selectedHairline.includes('LAGOS');
    
    if (hasPeak) {
      // Peak hairline images
      return [
        '/assets/peak left.png', // Left thumbnail
        '/assets/peak front.png', // Middle thumbnail (hero)
        '/assets/peak right.png'  // Right thumbnail
      ];
    } else if (hasLagos) {
      // Lagos hairline images
      return [
        '/assets/lagos left.png', // Left thumbnail
        '/assets/lagos front.png', // Middle thumbnail (hero)
        '/assets/lagos right.png'  // Right thumbnail
      ];
    } else {
      // Natural hairline images (default) - using local PNG files for consistent aspect ratio
      return [
        '/assets/natural left.png',
        '/assets/natural front.png',
        '/assets/natural right.png'
      ];
    }
  };

  const wigViews = getWigViews();

  // Get hero mannequin size based on hairline selection
  const getHeroMannequinSize = () => {
    // All hairline selections use the same size for visual consistency
    return {
      imageWidth: 282,
      imageHeight: 387
    };
  };

  const heroSize = getHeroMannequinSize();
  
  // Debug logging
  console.log('Selected hairline:', selectedHairline);
  console.log('Hero size:', heroSize);

  // Hairline options - Updated with pricing (NATURAL is default)
  const hairlineOptions: HairlineOption[] = [
    {
      id: 'NATURAL',
      name: 'NATURAL',
      description: 'Natural hairline',
      price: 0, // Default option - included in base price
      image: '/assets/Natural Hairline-icon.svg'
    },
    {
      id: 'PEAK',
      name: 'PEAK',
      description: 'Peak hairline style',
      price: 40, // Additional cost for peak styling
      image: '/assets/Peak Hairline-icon.svg'
    },
    {
      id: 'LAGOS',
      name: 'LAGOS',
      description: 'Lagos hairline style',
      price: 60, // Additional cost for Lagos styling
      image: '/assets/Lagos Hairline-icon.svg'
    }
  ];

  const handleHairlineSelect = (hairlineId: string) => {
    const currentSelections = selectedHairline;
    
    if (currentSelections.includes(hairlineId)) {
      // Deselect the hairline option
      if (hairlineId === 'LAGOS') {
        // If deselecting Lagos, remove it but keep Peak if it exists
        const remainingSelections = currentSelections.filter(id => id !== 'LAGOS');
        if (remainingSelections.length === 0) {
          setSelectedHairline(['NATURAL']); // Default back to NATURAL
        } else {
          setSelectedHairline(remainingSelections);
        }
      } else if (hairlineId === 'PEAK') {
        // If deselecting Peak, remove it but keep Lagos if it exists
        const remainingSelections = currentSelections.filter(id => id !== 'PEAK');
        if (remainingSelections.length === 0) {
          setSelectedHairline(['NATURAL']); // Default back to NATURAL
        } else {
          setSelectedHairline(remainingSelections);
        }
      } else {
        // If deselecting NATURAL, default to NATURAL
        setSelectedHairline(['NATURAL']);
      }
    } else {
      // Add new hairline option with combination logic
      if (hairlineId === 'LAGOS') {
        // If selecting Lagos, it replaces current selection (no combo from other options)
        setSelectedHairline(['LAGOS']);
      } else if (hairlineId === 'PEAK') {
        // If selecting Peak, only create combo if Lagos is already selected
        if (currentSelections.includes('LAGOS')) {
          setSelectedHairline(['LAGOS', 'PEAK']);
        } else {
          // If Lagos is not selected, Peak replaces current selection
          setSelectedHairline(['PEAK']);
        }
      } else {
        // If selecting NATURAL, it replaces current selection (resets combo)
        setSelectedHairline(['NATURAL']);
      }
    }
  };

  const handleBack = () => {
    navigate('/build-a-wig');
  };

  const handleConfirmSelection = () => {
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
        console.log('Hairline page - No sourceRoute found, detected edit mode from localStorage');
      } else if (selectedCapSize) {
        sourceRoute = '/build-a-wig/noir/customize';
        console.log('Hairline page - No sourceRoute found, detected customize mode from localStorage');
      } else {
        sourceRoute = '/build-a-wig';
        console.log('Hairline page - No sourceRoute found, defaulting to main page');
      }
    }
    
    const isCustomizeMode = !isEditMode && sourceRoute === '/build-a-wig/noir/customize';
    
    // Save hairline (can be single selection or array)
    const hairlineValue = selectedHairline.length > 0 ? selectedHairline.join(',') : null;
    
    // Always save with 'selected' prefix
    if (hairlineValue) {
      localStorage.setItem('selectedHairline', hairlineValue);
    } else {
      localStorage.removeItem('selectedHairline');
    }
    localStorage.setItem('selectedHairlinePrice', price);
    
    // Also save with 'editSelected' prefix in edit mode
    if (isEditMode) {
      if (hairlineValue) {
        localStorage.setItem('editSelectedHairline', hairlineValue);
      } else {
        localStorage.removeItem('editSelectedHairline');
      }
      localStorage.setItem('editSelectedHairlinePrice', price);
    }
    
    // Also save with 'customizeSelected' prefix in customize mode
    if (isCustomizeMode) {
      if (hairlineValue) {
        localStorage.setItem('customizeSelectedHairline', hairlineValue);
      } else {
        localStorage.removeItem('customizeSelectedHairline');
      }
      localStorage.setItem('customizeSelectedHairlinePrice', price);
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
    
    console.log('Hairline page - Navigating back to route:', returnRoute);
    
    // Set flag to indicate we're returning from a sub-page
    sessionStorage.setItem('comingFromSubPage', 'true');
    
    // Dispatch custom event to notify main page of changes
    window.dispatchEvent(new CustomEvent('customStorageChange'));
    
    navigate(returnRoute);
  };

  const getSelectedPrice = () => {
    let total = selectedHairline.reduce((sum, hairlineId) => {
      const selected = hairlineOptions.find(option => option.id === hairlineId);
      return sum + (selected ? selected.price : 0);
    }, 0);
    
    // Apply $20 discount to Lagos when combined with Peak
    if (selectedHairline.includes('LAGOS') && selectedHairline.includes('PEAK')) {
      total -= 20;
    }
    
    return total;
  };

  // Get dynamic hairline note text based on selected hairline option
  const getHairlineNoteText = () => {
    // Check for lagos + peak combination first (before individual checks)
    if (selectedHairline.includes('LAGOS') && selectedHairline.includes('PEAK')) {
      return 'HAIRLINE HAS A WIDOW\'S PEAK WITH LOW TEMPLES.';
    }
    
    const currentHairline = selectedHairline[0]; // Get the first selected hairline
    
    // For natural hairline option
    if (currentHairline === 'NATURAL') {
      return 'HAIRLINE IS ROUNDED WITH SOFT EDGES.';
    }
    
    // For peak hairline option
    if (currentHairline === 'PEAK') {
      return 'HAIRLINE HAS A WIDOW\'S PEAK WITH SOFT EDGES.';
    }
    
    // For lagos hairline option
    if (currentHairline === 'LAGOS') {
      return 'NATURAL HAIRLINE WITH LOW TEMPLES ON BOTH SIDES.';
    }
    
    // For other hairline options, return default text
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
                  className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 text-5xl sm:text-6xl z-20 noir-text"
                    style={{
                      color: '#EB1C24',
                    }}
                >
                  NOIR
                </p>
                <img
                  src={wigViews[selectedView]}
                  alt="Selected Wig"
                  width={heroSize.imageWidth}
                  height={heroSize.imageHeight}
                  className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hero-mannequin-img"
                  style={{ 
                    top: 'calc(50% - 10.601px + 18px)',
                    '--hero-width': `${heroSize.imageWidth}px`,
                    '--hero-height': `${heroSize.imageHeight}px`
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

          {/* HAIRLINE SELECTION HEADER */}
          <p 
            className="text-xs sm:text-sm text-center text-red-500 mb-4"
            style={{ fontFamily: '"Covered By Your Grace", cursive', color: '#EB1C24', transform: 'translateY(18px)' }}
          >
            VENTILLATION EFFECT
          </p>

          {/* HAIRLINE OPTIONS - Centered 3-column layout */}
          <div className="grid grid-cols-3 gap-4 mx-auto justify-center mb-6 max-w-[240px]" style={{ marginTop: '15px' }}>
            {hairlineOptions.map((option) => (
              <ThumbBox
                key={option.id}
                image={option.image}
                title="HAIRLINE"
                label={option.name}
                isSelected={selectedHairline.includes(option.id)}
                onClick={() => handleHairlineSelect(option.id)}
                imgSize={75}
                containerSize={60}
                topPosition="50%"
              />
            ))}
          </div>

          {/* DYNAMIC HAIRLINE NOTE */}
          <p
            className="font-futura text-[10px] md:text-xs text-center my-6 w-[95%] mx-auto uppercase"
            style={{ color: '#EB1C24', fontFamily: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif', fontWeight: '500', transform: 'translateY(-7px)' }}
          >
            {getHairlineNoteText()}
          </p>

          {/* TOTAL PRICE */}
          <div className="text-center">
            <p className="font-futura text-[12px] font-medium" style={{ color: '#909090' }}>
              TOTAL DUE
            </p>
            <p 
              className="text-black font-medium text-base"
              style={{ fontFamily: '"Futura PT", "Futura PT Medium", Futura, Futura, Inter, sans-serif', fontWeight: '500' }}
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
    </>
  );
}

export default HairlineSelection;
