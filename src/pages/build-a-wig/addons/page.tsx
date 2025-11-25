
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThumbBox from '../../../components/ThumbBox';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import LoadingScreen from '../../../components/base/LoadingScreen';

export default function AddOnsSelectionPage() {
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>(() => {
    const saved = localStorage.getItem('selectedAddOns');
    return saved ? JSON.parse(saved) : [];
  });
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

  const wigViews = getWigViews();

  // Add-ons options with local assets
  const addOnOptions = [
    {
      id: 'BLEACH',
      name: 'BLEACH',
      image: '/assets/Bleach-icon.svg',
      price: 80
    },
    {
      id: 'PLUCK',
      name: 'PLUCK',
      image: '/assets/Pluck-icon.svg',
      price: 120
    },
    {
      id: 'BLUNT CUT',
      name: 'BLUNT CUT',
      image: '/assets/clip ends-icon.svg',
      price: 20
    }
  ];

  const handleAddOnToggle = (addOnId: string) => {
    setSelectedAddOns(prev => {
      if (prev.includes(addOnId)) {
        // Remove the add-on
        return prev.filter(id => id !== addOnId);
      } else {
        // Add the add-on in the correct order based on sub-page sequence
        const correctOrder = ['BLEACH', 'PLUCK', 'BLUNT CUT'];
        const newSelections = [...prev, addOnId];
        
        // Sort the selections according to the correct order
        return newSelections.sort((a, b) => {
          const indexA = correctOrder.indexOf(a);
          const indexB = correctOrder.indexOf(b);
          return indexA - indexB;
        });
      }
    });
  };

  const getTotalAddOnPrice = () => {
    // Get selected lace size from localStorage
    const selectedLace = localStorage.getItem('selectedLace') || '';
    const discountedLaceSizes = ['2X6', '4X4', '5X5', '6X6', '7X7'];
    const hasLaceDiscount = discountedLaceSizes.includes(selectedLace);
    
    return selectedAddOns.reduce((total, addOnId) => {
      const addOn = addOnOptions.find(opt => opt.id === addOnId);
      let price = addOn?.price || 0;
      
      // Apply $20 discount for bleach and pluck when specific lace sizes are selected
      if (hasLaceDiscount && (addOnId === 'BLEACH' || addOnId === 'PLUCK')) {
        price -= 20;
      }
      
      return total + price;
    }, 0);
  };

  const totalPrice = getTotalAddOnPrice();

  // Get dynamic add-ons note text based on selected add-ons
  const getAddOnsNoteText = () => {
    const hasBleach = selectedAddOns.includes('BLEACH');
    const hasPluck = selectedAddOns.includes('PLUCK');
    const hasBluntCut = selectedAddOns.includes('BLUNT CUT');
    
    // When no add-ons are selected
    if (selectedAddOns.length === 0) {
      return (
        <>
          LACE IS PRE-PLUCKED WITH LIGHTLY BLEACHED KNOTS.<br />
          STANDARD PROCESSING TIME APPLIES.
        </>
      );
    }
    
    // For bleach only
    if (hasBleach && !hasPluck && !hasBluntCut) {
      return (
        <>
          KNOTS WILL BE LIFTED + TONED.<br />
          EXPECT AN ADDITIONAL WEEK OF PROCESSING TIME.
        </>
      );
    }
    
    // For pluck only
    if (hasPluck && !hasBleach && !hasBluntCut) {
      return (
        <>
          HAIRLINE WILL BE FULLY CUSTOMIZED.<br />
          EXPECT AN ADDITIONAL WEEK OF PROCESSING TIME.
        </>
      );
    }
    
    // For blunt cut only
    if (hasBluntCut && !hasBleach && !hasPluck) {
      return (
        <>
          ENDS WILL BE CUT BLUNT.<br />
          STANDARD PROCESSING TIME APPLIES.
        </>
      );
    }
    
    // For bleach + pluck combination
    if (hasBleach && hasPluck && !hasBluntCut) {
      return (
        <>
          FULLY CUSTOMIZED LACE.<br />
          EXPECT AN ADDITIONAL WEEK OF PROCESSING TIME.
        </>
      );
    }
    
    // For bleach + blunt cut combination
    if (hasBleach && hasBluntCut && !hasPluck) {
      return (
        <>
          KNOTS WILL BE LIFTED + TONED WITH BLUNT ENDS.<br />
          EXPECT AN ADDITIONAL WEEK OF PROCESSING TIME.
        </>
      );
    }
    
    // For pluck + blunt cut combination
    if (hasPluck && hasBluntCut && !hasBleach) {
      return (
        <>
          FULLY CUSTOMIZED HAIRLINE WITH BLUNT ENDS.<br />
          EXPECT AN ADDITIONAL WEEK OF PROCESSING TIME.
        </>
      );
    }
    
    // For bleach + pluck + blunt cut combination (all three)
    if (hasBleach && hasPluck && hasBluntCut) {
      return (
        <>
          FULLY CUSTOMIZED LACE WITH BLUNT ENDS.<br />
          EXPECT AN ADDITIONAL WEEK OF PROCESSING TIME.
        </>
      );
    }
    
    // For other add-ons combinations, return default text
    return 'LACE IS PRE-PLUCKED WITH LIGHTLY BLEACHED KNOTS. STANDARD PROCESSING TIME APPLIES.';
  };

  const getAddOnsThumbnailTopPosition = (addOnId: string) => {
    // Always move bleach thumbnail up by 2px (2.5% of 80px container) regardless of selection state
    if (addOnId === 'BLEACH') {
      return '52.5%'; // Moved up 2px
    }
    
    // If no add-ons are selected, return original position for none icon
    if (selectedAddOns.length === 0) {
      return '55%'; // Original position for none icon
    }
    
    // Return original position for other add-on icons
    return '55%';
  };

  const handleBack = () => {
    navigate('/build-a-wig');
  };

  const handleConfirmSelection = () => {
    localStorage.setItem('selectedAddOns', JSON.stringify(selectedAddOns));
    localStorage.setItem('selectedAddOnsPrice', getTotalAddOnPrice().toString());
    
    // Get the source route from sessionStorage (set by main page when navigating to sub-page)
    // Also check if we're in edit or customize mode as fallback
    let sourceRoute = sessionStorage.getItem('sourceRoute');
    
    // Fallback: check localStorage for edit mode or customize mode
    if (!sourceRoute) {
      const editingCartItem = localStorage.getItem('editingCartItem');
      const selectedCapSize = localStorage.getItem('selectedCapSize');
      
      if (editingCartItem) {
        sourceRoute = '/build-a-wig/edit';
        console.log('Addons page - No sourceRoute found, detected edit mode from localStorage');
      } else if (selectedCapSize) {
        sourceRoute = '/build-a-wig/noir/customize';
        console.log('Addons page - No sourceRoute found, detected customize mode from localStorage');
      } else {
        sourceRoute = '/build-a-wig';
        console.log('Addons page - No sourceRoute found, defaulting to main page');
      }
    }
    
    console.log('Addons page - Navigating back to source route:', sourceRoute);
    
    // Set flag to indicate we're returning from a sub-page
    sessionStorage.setItem('comingFromSubPage', 'true');
    
    // Dispatch custom event to notify main page of changes
    window.dispatchEvent(new CustomEvent('customStorageChange'));
    
    navigate(sourceRoute);
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

            {/* SELECTION AREA */}
            <div className="w-full flex flex-col lg:mt-0 mt-0">
              {/* ADD-ONS OPTIONS HEADER */}
            <p
              className="text-xs sm:text-sm text-center text-red-500 mb-4"
              style={{ fontFamily: '"Covered By Your Grace", cursive', color: '#EB1C24', transform: 'translateY(18px)' }}
            >
              CUSTOMIZATION KIT
            </p>

            {/* ADDON OPTIONS */}
            <div className="grid grid-cols-3 gap-4 mx-auto justify-center mb-6 max-w-[240px]" style={{ marginTop: '13px' }}>
              {addOnOptions.map((option) => (
                <ThumbBox
                  key={option.id}
                  image={option.image}
                  title="ADD-ONS"
                  label={option.name}
                  isSelected={selectedAddOns.includes(option.id)}
                  onClick={() => handleAddOnToggle(option.id)}
                  imgSize={75}
                  containerSize={60}
                  topPosition={getAddOnsThumbnailTopPosition(option.id)}
                />
              ))}
            </div>

            {/* NOTE AND TOTAL PRICE SECTION */}
            <div style={{ transform: 'translateY(15px)' }}>
            {/* DYNAMIC ADD-ONS NOTE */}
            <p
              className="font-futura text-[10px] text-center w-[95%] mx-auto uppercase"
              style={{ color: '#EB1C24', fontFamily: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif', fontWeight: '500', transform: 'translateY(-7px)', marginTop: '10px', marginBottom: '1.5rem' }}
            >
              {getAddOnsNoteText()}
            </p>

            {/* TOTAL PRICE */}
            <div className="text-center mb-4">
              <p className="font-futura text-[12px] font-medium" style={{ color: '#909090' }}>
                TOTAL DUE
              </p>
              <p 
                className="text-black font-medium text-base"
                style={{ fontFamily: '"Futura PT", "Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontWeight: '500' }}
              >
                {totalPrice < 0 ? '-' : totalPrice > 0 ? '+' : ''}${Math.abs(totalPrice)} USD
              </p>
            </div>
            </div>

          </div>
        </div>

        {/* CONFIRM SELECTION BUTTON */}
        <div className="px-0 md:px-0 flex justify-center" style={{ marginTop: '2px', transform: 'translateY(0px)' }}>
          <button
            onClick={handleConfirmSelection}
            className="border border-black font-futura text-center py-2 text-[12px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
            style={{ borderWidth: '1.3px', color: '#EB1C24', width: '358px' }}
          >
            CONFIRM SELECTION
          </button>
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
      </div>
    </>
  );
}
