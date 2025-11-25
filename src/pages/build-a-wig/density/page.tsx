
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThumbBox from '../../../components/ThumbBox';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import LoadingScreen from '../../../components/base/LoadingScreen';

interface DensityOption {
  id: string;
  name: string;
  percentage: string;
  description: string;
  price: number;
  image: string;
}

function DensitySelection() {
  const navigate = useNavigate();
  const [selectedDensity, setSelectedDensity] = useState(() => {
    // Always start with default - useEffect will load from localStorage
    // This matches the customize pages pattern
    return '200%';
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

  // Density options with correct pricing structure
  const densityOptions: DensityOption[] = [
    {
      id: '130%',
      name: '130%',
      percentage: '130%',
      description: '130% EQUIVALENT TO 1 BUNDLE FOR LENGTHS OVER 16"',
      price: -60, // $60 cheaper than default
      image: '/assets/density.png'
    },
    {
      id: '150%',
      name: '150%',
      percentage: '150%',
      description: '150% EQUIVALENT TO 1-2 BUNDLES FOR LENGTHS OVER 16"',
      price: -40, // $40 cheaper than default
      image: '/assets/density.png'
    },
    {
      id: '180%',
      name: '180%',
      percentage: '180%',
      description: '180% EQUIVALENT TO 2 BUNDLES FOR LENGTHS OVER 18"',
      price: -20, // $20 cheaper than default
      image: '/assets/density.png'
    },
    {
      id: '200%',
      name: '200%',
      percentage: '200%',
      description: '200% EQUIVALENT TO 2-3 BUNDLES FOR LENGTHS OVER 22"',
      price: 0, // Default option - included in base price
      image: '/assets/density.png'
    },
    {
      id: '250%',
      name: '250%',
      percentage: '250%',
      description: '250% EQUIVALENT TO 3 BUNDLES FOR LENGTHS OVER 26"',
      price: 80, // $80 more than default
      image: '/assets/density.png'
    },
    {
      id: '300%',
      name: '300%',
      percentage: '300%',
      description: '300% EQUIVALENT TO 3-4 BUNDLES FOR LENGTHS OVER 30"',
      price: 160, // $160 more than default
      image: '/assets/density.png'
    },
    {
      id: '350%',
      name: '350%',
      percentage: '350%',
      description: '350% EQUIVALENT TO 4 BUNDLES FOR LENGTHS OVER 32"',
      price: 240, // $240 more than default
      image: '/assets/density.png'
    },
    {
      id: '400%',
      name: '400%',
      percentage: '400%',
      description: '400% EQUIVALENT TO 4-5 BUNDLES FOR LENGTHS OVER 40"',
      price: 320, // $320 more than default
      image: '/assets/density.png'
    }
  ];

  const handleDensitySelect = (densityId: string) => {
    setSelectedDensity(densityId);
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
    localStorage.setItem('selectedDensity', selectedDensity);
    localStorage.setItem('selectedDensityPrice', getSelectedPrice().toString());
    
    // Get the source route from sessionStorage (set by main page when navigating to sub-page)
    const sourceRoute = sessionStorage.getItem('sourceRoute') || '/build-a-wig';
    
    // Set flag to indicate we're returning from a sub-page
    sessionStorage.setItem('comingFromSubPage', 'true');
    
    // Dispatch custom event to notify main page of changes
    window.dispatchEvent(new CustomEvent('customStorageChange'));
    
    navigate(sourceRoute);
  };

  const getSelectedPrice = () => {
    const selected = densityOptions.find(option => option.id === selectedDensity);
    return selected ? selected.price : 0;
  };

  // Get dynamic density note text based on selected length and density
  const getDensityNoteText = () => {
    const selectedLength = localStorage.getItem('selectedLength') || '24"';
    // Use local state instead of localStorage for live updates
    const currentDensity = selectedDensity;
    
    // For 130% density, show grams based on length
    if (currentDensity === '130%') {
      const lengthToGrams: { [key: string]: string } = {
        '16"': '98',
        '18"': '112',
        '20"': '122',
        '22"': '125',
        '24"': '135',
        '26"': '140',
        '28"': '145',
        '30"': '150',
        '32"': '155',
        '34"': '160',
        '36"': '165',
        '40"': '175'
      };
      
      const grams = lengthToGrams[selectedLength] || '135'; // Default to 24" if not found
      return (
        <>
          EQUIVALENT TO {grams} GRAMS.<br />
          100 GRAMS = 1 BUNDLE, EXCLUDING LACE.
        </>
      );
    }
    
    // For 150% density, show grams based on length
    if (currentDensity === '150%') {
      const lengthToGrams: { [key: string]: string } = {
        '16"': '113',
        '18"': '129',
        '20"': '142',
        '22"': '145',
        '24"': '155',
        '26"': '160',
        '28"': '165',
        '30"': '170',
        '32"': '175',
        '34"': '180',
        '36"': '185',
        '40"': '195'
      };
      
      const grams = lengthToGrams[selectedLength] || '155'; // Default to 24" if not found
      return (
        <>
          EQUIVALENT TO {grams} GRAMS.<br />
          100 GRAMS = 1 BUNDLE, EXCLUDING LACE.
        </>
      );
    }
    
    // For 180% density, show grams based on length
    if (currentDensity === '180%') {
      const lengthToGrams: { [key: string]: string } = {
        '16"': '130',
        '18"': '147',
        '20"': '162',
        '22"': '165',
        '24"': '175',
        '26"': '180',
        '28"': '185',
        '30"': '190',
        '32"': '195',
        '34"': '200',
        '36"': '205',
        '40"': '215'
      };
      
      const grams = lengthToGrams[selectedLength] || '175'; // Default to 24" if not found
      return (
        <>
          EQUIVALENT TO {grams} GRAMS.<br />
          100 GRAMS = 1 BUNDLE, EXCLUDING LACE.
        </>
      );
    }
    
    // For 250% density, show grams based on length
    if (currentDensity === '250%') {
      const lengthToGrams: { [key: string]: string } = {
        '16"': '190',
        '18"': '217',
        '20"': '232',
        '22"': '245',
        '24"': '255',
        '26"': '264',
        '28"': '269',
        '30"': '274',
        '32"': '279',
        '34"': '284',
        '36"': '289',
        '40"': '297'
      };
      
      const grams = lengthToGrams[selectedLength] || '255'; // Default to 24" if not found
      return (
        <>
          EQUIVALENT TO {grams} GRAMS.<br />
          100 GRAMS = 1 BUNDLE, EXCLUDING LACE.
        </>
      );
    }
    
    // For 300% density, show grams based on length
    if (currentDensity === '300%') {
      const lengthToGrams: { [key: string]: string } = {
        '16"': '220',
        '18"': '252',
        '20"': '267',
        '22"': '285',
        '24"': '295',
        '26"': '306',
        '28"': '311',
        '30"': '316',
        '32"': '321',
        '34"': '326',
        '36"': '331',
        '40"': '341'
      };
      
      const grams = lengthToGrams[selectedLength] || '295'; // Default to 24" if not found
      return (
        <>
          EQUIVALENT TO {grams} GRAMS.<br />
          100 GRAMS = 1 BUNDLE, EXCLUDING LACE.
        </>
      );
    }
    
    // For 350% density, show grams based on length
    if (currentDensity === '350%') {
      const lengthToGrams: { [key: string]: string } = {
        '16"': '250',
        '18"': '287',
        '20"': '302',
        '22"': '325',
        '24"': '335',
        '26"': '348',
        '28"': '353',
        '30"': '358',
        '32"': '363',
        '34"': '368',
        '36"': '373',
        '40"': '383'
      };
      
      const grams = lengthToGrams[selectedLength] || '335'; // Default to 24" if not found
      return (
        <>
          EQUIVALENT TO {grams} GRAMS.<br />
          100 GRAMS = 1 BUNDLE, EXCLUDING LACE.
        </>
      );
    }
    
    // For 400% density, show grams based on length
    if (currentDensity === '400%') {
      const lengthToGrams: { [key: string]: string } = {
        '16"': '280',
        '18"': '322',
        '20"': '337',
        '22"': '365',
        '24"': '375',
        '26"': '390',
        '28"': '395',
        '30"': '400',
        '32"': '400',
        '34"': '400',
        '36"': '400',
        '40"': '400'
      };
      
      const grams = lengthToGrams[selectedLength] || '375'; // Default to 24" if not found
      return (
        <>
          EQUIVALENT TO {grams} GRAMS.<br />
          100 GRAMS = 1 BUNDLE, EXCLUDING LACE.
        </>
      );
    }
    
    // For 200% density, show grams based on length
    if (currentDensity === '200%') {
      const lengthToGrams: { [key: string]: string } = {
        '16"': '160',
        '18"': '182',
        '20"': '197',
        '22"': '205',
        '24"': '215',
        '26"': '222',
        '28"': '227',
        '30"': '232',
        '32"': '237',
        '34"': '242',
        '36"': '247',
        '40"': '257'
      };
      
      const grams = lengthToGrams[selectedLength] || '215'; // Default to 24" if not found
      return (
        <>
          EQUIVALENT TO {grams} GRAMS.<br />
          100 GRAMS = 1 BUNDLE, EXCLUDING LACE.
        </>
      );
    }
    
    // For other densities, return default text
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

  // Initialize with current selection from localStorage
  useEffect(() => {
    // CRITICAL: Check if we're ACTUALLY editing (not just stale edit data)
    // Only load from editingCartItem if we're on the edit route
    const isOnEditRoute = window.location.pathname.includes('/edit');
    const editingCartItem = localStorage.getItem('editingCartItem');
    
    // If we're editing, load from edit data
    if (isOnEditRoute && editingCartItem) {
      try {
        const item = JSON.parse(editingCartItem);
        console.log('Density page - loading edit mode density:', item.density);
        if (item.density) {
          setSelectedDensity(item.density);
          localStorage.setItem('selectedDensity', item.density);
          return; // Exit early - we're done
        }
      } catch (error) {
        console.error('Density page - Error parsing editingCartItem:', error);
      }
    }
    
    // NOT editing - load from main page's selectedDensity
    // CRITICAL: Clear any stale edit data first
    if (!isOnEditRoute && editingCartItem) {
      console.log('Density page - NOT editing, clearing stale edit data');
      // Don't clear editingCartItem (edit page needs it), but ensure we use selectedDensity
    }
    
    const currentDensity = localStorage.getItem('selectedDensity');
    console.log('Density page - useEffect loading from localStorage:', currentDensity, 'isOnEditRoute:', isOnEditRoute);
    
    // Always use localStorage value if it exists (should match main page)
    if (currentDensity) {
      console.log('Density page - Setting density from localStorage:', currentDensity);
      setSelectedDensity(currentDensity);
    } else {
      // If not in localStorage, use default and save it
      console.log('Density page - No value in localStorage, using default 200%');
      const defaultDensity = '200%';
      setSelectedDensity(defaultDensity);
      localStorage.setItem('selectedDensity', defaultDensity);
    }
    
    // Also listen for customStorageChange event in case main page updates after mount
    const handleCustomStorageChange = () => {
      // Only update if NOT editing
      if (!window.location.pathname.includes('/edit')) {
        const currentDensity = localStorage.getItem('selectedDensity');
        if (currentDensity) {
          console.log('Density page - Updated from customStorageChange:', currentDensity);
          setSelectedDensity(currentDensity);
        }
      }
    };
    
    window.addEventListener('customStorageChange', handleCustomStorageChange);
    
    return () => {
      window.removeEventListener('customStorageChange', handleCustomStorageChange);
    };
  }, []);

  // Listen for changes in selected length and density to update note text
  useEffect(() => {
    const handleStorageChange = () => {
      // Update density from localStorage
      const currentDensity = localStorage.getItem('selectedDensity');
      if (currentDensity) {
        setSelectedDensity(currentDensity);
      }
      // Force re-render when length or density changes
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('customStorageChange', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('customStorageChange', handleStorageChange);
    };
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

          {/* Back Button - Moved outside centered preview area */}
            <div className="flex justify-start ml-[calc(50%-131px)]">
          </div>

          {/* DENSITY SELECTION HEADER */}
          <p 
            className="text-xs sm:text-sm text-center text-red-500 mb-4"
            style={{ fontFamily: '"Covered By Your Grace", cursive', color: '#EB1C24', transform: 'translateY(18px)' }}
          >
            HAIR VOLUME
          </p>

          {/* DENSITY OPTIONS - Updated to fit 4 containers per row with centered layout */}
          <div className="grid grid-cols-4 gap-4 mx-auto justify-center mb-6 max-w-[320px]" style={{ marginTop: '15px' }}>
            {densityOptions.map((option) => (
              <ThumbBox
                key={option.id}
                image={option.image}
                title="DENSITY"
                label={option.name}
                isSelected={selectedDensity === option.id}
                onClick={() => handleDensitySelect(option.id)}
                imgSize={57}
                containerSize={60}
                topPosition="55%"
              />
            ))}
          </div>


          {/* DYNAMIC DENSITY NOTE */}
          <p
            className="font-futura text-[10px] md:text-xs text-center my-6 w-[95%] mx-auto uppercase"
            style={{ color: '#EB1C24', fontFamily: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif', fontWeight: '500', transform: 'translateY(-7px)' }}
          >
            {getDensityNoteText()}
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
      </div>
    </div>
    </>
  );
}

export default DensitySelection;
