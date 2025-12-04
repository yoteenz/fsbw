import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function BlancoSelection() {
  const navigate = useNavigate();
  const [selectedCustomCap, setSelectedCustomCap] = useState('M');
  const [selectedFlexibleCap, setSelectedFlexibleCap] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showChartModal, setShowChartModal] = useState(false);
  const [addToBagState, setAddToBagState] = useState<'idle' | 'adding' | 'added'>('idle');
  const [selectedMannequinView, setSelectedMannequinView] = useState(0);
  const [is3DView, setIs3DView] = useState(() => {
    // Check localStorage for saved 3D view preference, default to false (2D view)
    const saved3DView = localStorage.getItem('noir-3d-view');
    return saved3DView === 'true';
  });
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollPosition, setStartScrollPosition] = useState(0);
  const [activeTab, setActiveTab] = useState('DETAILS');
  const [similarProductsScroll, setSimilarProductsScroll] = useState(0);
  const [recentlyViewedScroll, setRecentlyViewedScroll] = useState(0);

  const handleBack = () => {
    navigate(-1);
  };

  const handleCustomCapSelect = (capSize: string) => {
    setSelectedCustomCap(capSize);
    setSelectedFlexibleCap('');
  };

  const handleFlexibleCapSelect = (capSize: string) => {
    setSelectedFlexibleCap(capSize);
    setSelectedCustomCap('');
  };

  const handleQuantityIncrease = () => {
    setQuantity(prev => Math.min(prev + 1, 10));
  };

  const handleQuantityDecrease = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  const handleChartClick = () => {
    setShowChartModal(true);
  };

  const handleCloseChart = () => {
    setShowChartModal(false);
  };

  // Mannequin images for blanco product (using noir images for now)
  const mannequinImages = [
    '/assets/natural front.png',  // View 1 (default)
    '/assets/natural left.png',  // View 2 (top thumbnail)
    '/assets/natural right.png'  // View 3 (bottom thumbnail)
  ];

  // Get current mannequin images based on selected view
  const getCurrentImages = () => {
    if (selectedMannequinView === 0) {
      // Default state: natural front in hero
      return {
        hero: mannequinImages[0], // natural front
        top: mannequinImages[1], // natural left
        bottom: mannequinImages[2] // natural right
      };
    } else if (selectedMannequinView === 1) {
      // Top thumbnail clicked: natural left in hero, natural front in top
      return {
        hero: mannequinImages[1], // natural left
        top: mannequinImages[0], // natural front
        bottom: mannequinImages[2] // natural right (stays in bottom)
      };
    } else {
      // Bottom thumbnail clicked: natural right in hero, natural front in bottom
      return {
        hero: mannequinImages[2], // natural right
        top: mannequinImages[1], // natural left (stays in top)
        bottom: mannequinImages[0] // natural front
      };
    }
  };

  const currentImages = getCurrentImages();

  // Get current 3D view images based on selected view
  const get3DViewImages = () => {
    if (selectedMannequinView === 0) {
      // Default state: noir front in hero
      return {
        hero: 'noir front.png',
        top: 'noir right.png',
        bottom: 'noir left.png'
      };
    } else if (selectedMannequinView === 1) {
      // Top thumbnail clicked: noir right in hero, noir front in top
      return {
        hero: 'noir right.png',
        top: 'noir front.png',
        bottom: 'noir left.png'
      };
    } else {
      // Bottom thumbnail clicked: noir left in hero, noir front in bottom
      return {
        hero: 'noir left.png',
        top: 'noir right.png',
        bottom: 'noir front.png'
      };
    }
  };

  const current3DImages = get3DViewImages();

  const handleTopThumbnailClick = () => {
    if (selectedMannequinView === 0) {
      setSelectedMannequinView(1);
    } else if (selectedMannequinView === 1) {
      setSelectedMannequinView(0);
    } else {
      setSelectedMannequinView(1);
    }
  };

  const handleBottomThumbnailClick = () => {
    if (selectedMannequinView === 0) {
      setSelectedMannequinView(2);
    } else if (selectedMannequinView === 1) {
      setSelectedMannequinView(2);
    } else {
      setSelectedMannequinView(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setStartScrollPosition(scrollPosition);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const currentX = e.clientX;
    const diff = currentX - startX;
    const newPosition = startScrollPosition - diff;
    const maxScroll = 0;
    const minScroll = -window.innerWidth * 0.6;
    setScrollPosition(Math.max(minScroll, Math.min(maxScroll, newPosition)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setStartScrollPosition(scrollPosition);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    const newPosition = startScrollPosition + diff;
    const maxScroll = 0;
    const minScroll = -window.innerWidth * 0.6;
    setScrollPosition(Math.max(minScroll, Math.min(maxScroll, newPosition)));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  const handleSimilarProductsLeftArrow = () => {
    setSimilarProductsScroll(0);
  };

  const handleSimilarProductsRightArrow = () => {
    setSimilarProductsScroll(-window.innerWidth * 0.713);
  };

  const handleRecentlyViewedLeftArrow = () => {
    setRecentlyViewedScroll(0);
  };

  const handleRecentlyViewedRightArrow = () => {
    setRecentlyViewedScroll(-window.innerWidth * 0.713);
  };

  const getTotalPrice = () => {
    const capSize = selectedCustomCap || selectedFlexibleCap || 'M';
    let basePrice = 820; // Default for standard caps (XS, S, M, L)
    if (capSize === 'XXS/XS/S' || capSize === 'S/M/L') {
      basePrice = 860; // Flexible cap options base price is $860
    }
    return basePrice;
  };

  const formatPrice = (price: number) => {
    return {
      __html: '$' + price.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }) + ' USD'
    };
  };

  const handleAddToBag = async () => {
    if (addToBagState === 'adding' || addToBagState === 'added') return;
    
    setAddToBagState('adding');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const defaultLength = '24"';
      const defaultDensity = '200%';
      const defaultLace = '13X6';
      const defaultTexture = 'SILKY';
      const defaultColor = 'OFF BLACK';
      const defaultHairline = 'NATURAL';
      const defaultStyling = 'NONE';
      const defaultAddOns: string[] = [];
      
      let capSize: string;
      let capSizePrice: number;
      if (selectedCustomCap) {
        capSize = selectedCustomCap;
        capSizePrice = 0;
      } else if (selectedFlexibleCap) {
        capSize = selectedFlexibleCap;
        capSizePrice = 40;
      } else {
        capSize = 'M';
        capSizePrice = 0;
      }
      
      const basePrice = 820;
      const totalPrice = basePrice + capSizePrice;
      
      const cartItem = {
        id: `blanco-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: 'BLANCO',
        price: totalPrice,
        quantity: quantity,
        image: '/assets/NOIR/blanco-thumb.png',
        capSize: capSize,
        capSizePrice: capSizePrice,
        length: defaultLength,
        density: defaultDensity,
        color: defaultColor,
        texture: defaultTexture,
        lace: defaultLace,
        hairline: defaultHairline,
        styling: defaultStyling,
        partSelection: 'MIDDLE',
        addOns: defaultAddOns
      };
      
      const existingCartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
      const updatedCartItems = [...existingCartItems, cartItem];
      localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
      
      const currentCount = parseInt(localStorage.getItem('cartCount') || '0');
      const newCount = currentCount + quantity;
      localStorage.setItem('cartCount', newCount.toString());
      
      window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      setAddToBagState('added');
    } catch (error) {
      console.error('Error adding to bag:', error);
      setAddToBagState('idle');
    }
  };

  const totalPrice = getTotalPrice();

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      {/* Marble Floor Background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/Marble Floor.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center calc(50% + 25px)',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      />
      
      {/* Scrollable Content */}
      <div className="relative z-10">
        <div className="flex flex-col py-5 px-4" style={{ minWidth: '100%', maxWidth: 'none', overflow: 'visible' }}>
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
                onClick={() => navigate('/units/straight')}
              >
                STRAIGHT &gt;
              </span>{' '}
              <span
                style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontWeight: '500' }}
              >
                BLANCO
              </span>
            </p>
            <div className="gap-5 flex absolute" style={{ right: '17px' }}>
              <div style={{ position: 'relative', width: '22px', height: '19px' }}>
                <img 
                  src="/assets/inactive cart-icon.svg"
                  alt="Cart"
                  width={22}
                  height={19}
                  style={{ width: '22px', height: '19px' }}
                />
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
            style={{ 
              borderWidth: '1.3px', 
              minWidth: '100%', 
              maxWidth: 'none', 
              overflow: 'visible',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              willChange: 'backdrop-filter'
            }}
          >
            {/* WIG PREVIEW */}
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', flexDirection: 'column', marginBottom: '24px', transform: 'translateY(20px)', overflow: 'visible', minWidth: '100%', maxWidth: 'none' }}>
              {/* ADD TO WISHLIST & 2D/3D VIEW TOGGLE */}
              <div style={{ position: 'relative', width: '100%', marginBottom: '10px', transform: 'translateY(-31px)' }}>
                {/* ADD TO WISHLIST - Top Left */}
                <p 
                  style={{ 
                    position: 'absolute', 
                    left: '8px', 
                    top: '2px', 
                    color: '#909090', 
                    fontFamily: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '10px',
                    fontWeight: '600',
                    margin: '0'
                  }}
                >
                  + ADD TO WISHLIST
                </p>
                
                {/* 2D VIEW/3D VIEW TOGGLE - Top Right */}
                <div 
                  style={{ 
                    position: 'absolute', 
                    right: '8px', 
                    top: '1px', 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    cursor: 'pointer'
                  }}
                onClick={() => {
                  const new3DView = !is3DView;
                  setIs3DView(new3DView);
                  localStorage.setItem('noir-3d-view', new3DView.toString());
                }}
                >
                  <span 
                    style={{ 
                      color: is3DView ? '#000000' : '#EB1C24', 
                      fontFamily: is3DView ? '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif' : '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                      fontSize: '11px',
                      fontWeight: is3DView ? '400' : '500',
                      margin: '0'
                    }}
                  >
                    2D VIEW
                  </span>
                  <span 
                    style={{ 
                      color: '#000000', 
                      fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
                      fontSize: '11px',
                      fontWeight: '400',
                      margin: '0'
                    }}
                  >
                    /
                  </span>
                  <span 
                    style={{ 
                      color: is3DView ? '#EB1C24' : '#000000', 
                      fontFamily: is3DView ? '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' : '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
                      fontSize: '11px',
                      fontWeight: is3DView ? '500' : '400',
                      margin: '0'
                    }}
                  >
                    3D VIEW
                  </span>
                </div>
              </div>
              
              {/* MANNEQUIN LAYOUT - Hero on left, Top + Bottom stacked on right */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: is3DView ? '10px' : '5px', marginBottom: '16px', overflow: 'visible', margin: '0 auto', transform: 'translateY(-19px)' }}>
                {/* Hero Mannequin - Left Side */}
                <div style={{ position: 'relative', overflow: 'visible', flexShrink: '0' }}>
                  <div
                    style={{
                      position: 'relative',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '200px',
                      height: '290px',
                      backgroundImage: `url('/assets/NOIR/${is3DView ? current3DImages.hero : 'leaf-brick.png'}')`,
                      backgroundRepeat: 'no-repeat',
                      overflow: 'visible'
                    }}
                  >
                    <img
                      src={currentImages.hero}
                      alt=""
                      style={{ 
                        position: 'absolute',
                        left: '50%',
                        top: 'calc(50% - 10.601px + 12px)',
                        transform: 'translateX(-50%) translateY(-50%)',
                        zIndex: '10',
                        width: '230px',
                        height: 'auto',
                        maxHeight: '610px',
                        minWidth: '230px',
                        minHeight: 'auto',
                        display: is3DView ? 'none' : 'block'
                      }}
                    />
                  </div>
                </div>
                
                {/* Top and Bottom Mannequins - Right Side */}
                <div className="flex flex-col" style={{ height: '290px', justifyContent: 'space-between', gap: '10px' }}>
                  {/* Top Mannequin */}
                  <div className="flex-shrink-0 relative">
                    <div
                      className="relative bg-cover bg-center flex items-center justify-center cursor-pointer"
                      style={{
                        width: '100px',
                        height: '140px',
                        backgroundImage: `url('/assets/NOIR/${is3DView ? current3DImages.top : 'leaf-brick.png'}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                      onClick={handleTopThumbnailClick}
                    >
                      <img
                        src={currentImages.top}
                        alt=""
                        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                        style={{ 
                          top: 'calc(50% - 6.1px + 7.2px + 10px - 3px - 6px - 0.6px)',
                          width: '112px',
                          height: '137px',
                          maxWidth: 'none',
                          maxHeight: 'none',
                          minWidth: '112px',
                          minHeight: '137px',
                          display: is3DView ? 'none' : 'block'
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Bottom Mannequin */}
                  <div className="flex-shrink-0 relative">
                    <div
                      className="relative bg-cover bg-center flex items-center justify-center cursor-pointer"
                      style={{
                        width: '100px',
                        height: '140px',
                        backgroundImage: `url('/assets/NOIR/${is3DView ? current3DImages.bottom : 'leaf-brick.png'}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                      onClick={handleBottomThumbnailClick}
                    >
                      <img
                        src={currentImages.bottom}
                        alt=""
                        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                        style={{ 
                          top: 'calc(50% - 6.1px + 7.2px + 10px - 3px - 6px - 0.6px)',
                          width: '112px',
                          height: '137px',
                          maxWidth: 'none',
                          maxHeight: 'none',
                          minWidth: '112px',
                          minHeight: '137px',
                          display: is3DView ? 'none' : 'block'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* DISCLAIMER TEXT */}
              <p
                className="text-center uppercase mb-2"
                style={{ 
                  fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
                  fontSize: '11px',
                  fontWeight: '400',
                  transform: 'translateY(-13px)',
                  color: 'black'
                }}
              >
                (2D MODEL IS FOR <span style={{ color: '#909090', fontFamily: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif' }}>VISUAL & AESTHETIC</span> PURPOSES ONLY)
              </p>
            </div>

            {/* PRODUCT NAME */}
            <p
              className="text-center text-black mb-2"
              style={{ 
                fontFamily: '"Covered By Your Grace", cursive',
                fontSize: '50px',
                fontWeight: '400',
                lineHeight: '1.2',
                margin: '0',
                padding: '0',
                transform: 'translateY(-8px)'
              }}
            >
              BLANCO
            </p>

            {/* PRODUCT SPECIFICATION */}
            <p
              className="text-center text-red-500 uppercase mb-2"
              style={{ 
                fontFamily: '"Futura PT", futuristic-pt, Futura, Inter, sans-serif',
                fontSize: '10px',
                fontWeight: '500',
                transform: 'translateY(-8px)'
              }}
            >
              24" RAW RUSSIAN
            </p>

            {/* PRICE */}
            <p
              className="text-center text-black mb-1"
              style={{ 
                fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                fontSize: '21px',
                fontWeight: '500',
                transform: 'translateY(-16px)'
              }}
              dangerouslySetInnerHTML={formatPrice(totalPrice)}
            />

            {/* TAX DISCLAIMER */}
            <p
              className="text-center text-black mb-3"
              style={{ 
                fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                fontSize: '10px',
                fontWeight: '500',
                transform: 'translateY(-21px)'
              }}
            >
              (EXCLUDING SALES TAX)
            </p>

            {/* STAR RATINGS */}
            <div className="flex justify-center mb-4 gap-1" style={{ transform: 'translateY(-27px)' }}>
              {[...Array(5)].map((_, index) => (
                <img
                  key={index}
                  src="/assets/NOIR/star-symbol.png"
                  alt="Star Rating"
                  style={{ 
                    width: '15px', 
                    height: '15px',
                    filter: 'drop-shadow(0 0 0 1px black)',
                    stroke: '1px black'
                  }}
                />
              ))}
            </div>

            {/* PAYMENT PLAN */}
            <p
              className="text-center uppercase"
              style={{ 
                fontFamily: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif',
                fontSize: '10px',
                fontWeight: '600',
                color: '#909090',
                transform: 'translateY(-34px)'
              }}
            >
              OR 4 PAYMENTS OF <span dangerouslySetInnerHTML={formatPrice(Math.ceil(totalPrice / 4))} /> WITH <span style={{ fontWeight: '600', color: '#EB1C24' }}>KLARNA</span>
            </p>

            {/* CAP SIZE SELECTION HEADER */}
            <div style={{ transform: 'translateY(-10px)' }}>
              <p
                className="text-center text-black uppercase mb-4"
                style={{ 
                  fontFamily: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif',
                  fontSize: '11px',
                  fontWeight: '500',
                  transform: 'translateY(0px)'
                }}
              >
                SELECT CAP SIZE
              </p>

              {/* CAP SIZE MEASUREMENTS */}
              <div className="flex justify-center gap-4 mb-6" style={{ transform: 'translateY(-7px)' }}>
                <span className="text-red-500 font-bold" style={{ fontSize: '10px', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>XXS: 19"</span>
                <span className="text-red-500 font-bold" style={{ fontSize: '10px', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>XS: 20"</span>
                <span className="text-red-500 font-bold" style={{ fontSize: '10px', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>S: 21"</span>
                <span className="text-red-500 font-bold" style={{ fontSize: '10px', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>M: 22"</span>
                <span className="text-red-500 font-bold" style={{ fontSize: '10px', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif' }}>L: 23"</span>
              </div>

              {/* CUSTOM CAP SECTION */}
              <div className="mb-6">
                <p
                  className="text-center text-black mb-4"
                  style={{ 
                    fontFamily: '"Bohemy", cursive',
                    fontSize: '20px',
                    fontWeight: '400',
                    transform: 'translateY(-16px)'
                  }}
                >
                  custom cap
                </p>
                <div className="flex justify-center gap-3" style={{ transform: 'translateY(-24px)' }}>
                  <button 
                    onClick={() => handleCustomCapSelect('XS')}
                    className={`border border-black px-6 py-1 ${selectedCustomCap === 'XS' ? 'text-red-500 bg-white' : 'text-black bg-white hover:bg-gray-50'}`}
                    style={{ 
                      borderWidth: '1.3px',
                      fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                      fontWeight: '500',
                      minWidth: '60px',
                      fontSize: '11px'
                    }}
                  >
                    XS
                  </button>
                  <button 
                    onClick={() => handleCustomCapSelect('S')}
                    className={`border border-black px-6 py-1 ${selectedCustomCap === 'S' ? 'text-red-500 bg-white' : 'text-black bg-white hover:bg-gray-50'}`}
                    style={{ 
                      borderWidth: '1.3px',
                      fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                      fontWeight: '500',
                      minWidth: '60px',
                      fontSize: '11px'
                    }}
                  >
                    S
                  </button>
                  <button 
                    onClick={() => handleCustomCapSelect('M')}
                    className={`border border-black px-6 py-1 ${selectedCustomCap === 'M' ? 'text-red-500 bg-white' : 'text-black bg-white hover:bg-gray-50'}`}
                    style={{ 
                      borderWidth: '1.3px',
                      fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                      fontWeight: '500',
                      minWidth: '60px',
                      fontSize: '11px'
                    }}
                  >
                    M
                  </button>
                  <button 
                    onClick={() => handleCustomCapSelect('L')}
                    className={`border border-black px-6 py-1 ${selectedCustomCap === 'L' ? 'text-red-500 bg-white' : 'text-black bg-white hover:bg-gray-50'}`}
                    style={{ 
                      borderWidth: '1.3px',
                      fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                      fontWeight: '500',
                      minWidth: '60px',
                      fontSize: '11px'
                    }}
                  >
                    L
                  </button>
                </div>
              </div>

              {/* FLEXIBLE CAP SECTION */}
              <div className="mb-6">
                <p
                  className="text-center text-black mb-4"
                  style={{ 
                    fontFamily: '"Bohemy", cursive',
                    fontSize: '20px',
                    fontWeight: '400',
                    transform: 'translateY(-24px)'
                  }}
                >
                  flexible cap
                </p>
                <div className="flex justify-center gap-3" style={{ transform: 'translateY(-32px)' }}>
                  <button 
                    onClick={() => handleFlexibleCapSelect('XXS/XS/S')}
                    style={{ 
                      border: '1.3px solid black',
                      paddingTop: '4px',
                      paddingBottom: '4px',
                      paddingLeft: '8px',
                      paddingRight: '8px',
                      fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                      fontWeight: '500',
                      width: '108px',
                      minWidth: '108px',
                      maxWidth: '108px',
                      fontSize: '11px',
                      boxSizing: 'border-box' as const,
                      backgroundColor: 'white',
                      color: selectedFlexibleCap === 'XXS/XS/S' ? '#EB1C24' : 'black',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center'
                    }}
                  >
                    XXS/XS/S
                  </button>
                  <button 
                    onClick={() => handleFlexibleCapSelect('S/M/L')}
                    style={{ 
                      border: '1.3px solid black',
                      paddingTop: '4px',
                      paddingBottom: '4px',
                      paddingLeft: '8px',
                      paddingRight: '8px',
                      fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                      fontWeight: '500',
                      width: '108px',
                      minWidth: '108px',
                      maxWidth: '108px',
                      fontSize: '11px',
                      boxSizing: 'border-box' as const,
                      backgroundColor: 'white',
                      color: selectedFlexibleCap === 'S/M/L' ? '#EB1C24' : 'black',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center'
                    }}
                  >
                    S/M/L
                  </button>
                </div>
              </div>

              {/* QUANTITY SELECTOR */}
              <div className="flex justify-center mb-6" style={{ transform: 'translateY(-30px)' }}>
                <button 
                  onClick={handleQuantityDecrease}
                  disabled={quantity <= 1}
                  className={`px-3 py-1 text-red-500 bg-white hover:bg-gray-50 flex items-center justify-center ${quantity <= 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  style={{ 
                    borderTop: '1.3px solid black',
                    borderLeft: '1.3px solid black', 
                    borderBottom: '1.3px solid black',
                    borderRight: 'none',
                    height: '27px',
                    minHeight: '27px',
                    maxHeight: '27px',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                >
                  <span style={{ fontFamily: 'Cascadia Code, monospace', fontSize: '11px' }}>-</span>
                </button>
                <div 
                  className="px-4 py-1 text-black bg-white flex items-center justify-center relative" 
                  style={{ 
                    borderTop: '1.3px solid black',
                    borderBottom: '1.3px solid black',
                    borderLeft: 'none',
                    borderRight: 'none',
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', 
                    fontWeight: '500', 
                    fontSize: '12px', 
                    height: '27px',
                    minHeight: '27px',
                    maxHeight: '27px',
                    boxSizing: 'border-box'
                  }}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-black"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-px bg-black"></div>
                  {quantity}
                </div>
                <button 
                  onClick={handleQuantityIncrease}
                  disabled={quantity >= 10}
                  className={`px-3 py-1 text-red-500 bg-white hover:bg-gray-50 flex items-center justify-center ${quantity >= 10 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  style={{ 
                    borderTop: '1.3px solid black',
                    borderRight: '1.3px solid black',
                    borderBottom: '1.3px solid black',
                    borderLeft: 'none',
                    height: '27px',
                    minHeight: '27px',
                    maxHeight: '27px',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                >
                  <span style={{ fontFamily: 'Cascadia Code, monospace', fontSize: '11px' }}>+</span>
                </button>
              </div>

              {/* CAP SIZE CHART IMAGE */}
              <div className="flex justify-center mt-4" style={{ transform: 'translateX(4px) translateY(-27px)' }}>
                <img
                  src="/assets/NOIR/cap-size-chart.png"
                  alt="Cap Size Chart"
                  style={{ maxWidth: '194px', maxHeight: '154px', cursor: 'pointer' }}
                  onClick={handleChartClick}
                />
              </div>

              {/* CHART MODAL */}
              {showChartModal && (
                <div 
                  style={{
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                  }}
                  onClick={handleCloseChart}
                >
                  <div 
                    style={{
                      position: 'relative',
                      maxWidth: '90%',
                      maxHeight: '90%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img
                      src="/assets/NOIR/chart.png"
                      alt="Enlarged Cap Size Chart"
                      style={{ 
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        borderRadius: '4px'
                      }}
                    />
                    <button
                      onClick={handleCloseChart}
                      style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        backgroundColor: 'white',
                        border: '2px solid black',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PRODUCT SHOTS SECTION */}
            <div className="mt-8 mb-6" style={{ transform: 'translateY(-34px)' }}>
              {/* Product Images with Drag/Swipe Scroll */}
              <div className="relative overflow-hidden" style={{ height: '300px' }}>
                <div 
                  className="flex transition-transform duration-300 ease-out"
                  style={{ 
                    width: '300%',
                    transform: `translateX(${scrollPosition}px)`,
                    gap: '11px'
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <img
                    src="/assets/NOIR/noir front.png"
                    alt="NOIR Front View"
                    className="h-full object-cover"
                    style={{ width: '18%' }}
                    draggable={false}
                  />
                  <img
                    src="/assets/NOIR/noir left.png"
                    alt="NOIR Left View"
                    className="h-full object-cover"
                    style={{ width: '18%' }}
                    draggable={false}
                  />
                  <img
                    src="/assets/NOIR/noir right.png"
                    alt="NOIR Right View"
                    className="h-full object-cover"
                    style={{ width: '18%' }}
                    draggable={false}
                  />
                </div>
                
                {/* Product Shots Text Overlay */}
                <div 
                  className="absolute left-1/2 transform -translate-x-1/2"
                  style={{
                    bottom: '14px',
                    fontFamily: '"Bohemy", cursive',
                    fontSize: '43px',
                    color: 'white',
                    textShadow: '1px 1px 0px black, -1px 1px 0px black, 1px -1px 0px black, -1px -1px 0px black, 1px 0px 0px black, -1px 0px 0px black, 0px 1px 0px black, 0px -1px 0px black',
                    fontWeight: '400',
                    textAlign: 'center',
                    zIndex: 10,
                    width: '200px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  product shots
                </div>
              </div>

              {/* Tabs Section */}
              <div className="mt-6" style={{ transform: 'translateY(-35px)' }}>
                {/* Tab Navigation */}
                <div className="flex justify-center">
                  <button
                    onClick={() => handleTabClick('DETAILS')}
                    className={`px-2 py-1 text-xs font-medium ${activeTab === 'DETAILS' ? 'border-b border-red-500 text-red-500' : 'text-black hover:text-red-500'}`}
                    style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px' }}
                  >
                    DETAILS
                  </button>
                  <button
                    onClick={() => handleTabClick('SHIPPING')}
                    className={`px-2 py-1 text-xs font-medium ${activeTab === 'SHIPPING' ? 'border-b border-red-500 text-red-500' : 'text-black hover:text-red-500'}`}
                    style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px' }}
                  >
                    SHIPPING
                  </button>
                  <button
                    onClick={() => handleTabClick('POLICY')}
                    className={`px-2 py-1 text-xs font-medium ${activeTab === 'POLICY' ? 'border-b border-red-500 text-red-500' : 'text-black hover:text-red-500'}`}
                    style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px' }}
                  >
                    POLICY
                  </button>
                  <button
                    onClick={() => handleTabClick('CARE & STORAGE')}
                    className={`px-2 py-1 text-xs font-medium ${activeTab === 'CARE & STORAGE' ? 'border-b border-red-500 text-red-500' : 'text-black hover:text-red-500'}`}
                    style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px' }}
                  >
                    CARE & STORAGE
                  </button>
                  <button
                    onClick={() => handleTabClick('REVIEWS')}
                    className={`px-2 py-1 text-xs font-medium ${activeTab === 'REVIEWS' ? 'border-b border-red-500 text-red-500' : 'text-black hover:text-red-500'}`}
                    style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px' }}
                  >
                    REVIEWS
                  </button>
                </div>

                {/* Tab Content */}
                <div className="mt-4 space-y-4" style={{ maxWidth: 'none', width: '100%', marginBottom: '-93px' }}>
                  {activeTab === 'DETAILS' && (
                    <>
                      <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                        13X6 ULTRA THIN HD FILM LACE, RAW RUSSIAN STRAIGHT 250% DENSITY.
                      </p>
                      <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                        HANDMADE UNIT MEASURING 24 INCHES IN LENGTH, OFF BLACK HAIR COLOR.
                      </p>
                      <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                        100% RAW HUMAN HAIR EXTENSIONS USING SINGLE DONOR BUNDLES.
                      </p>
                      <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                        STRETCHY, BREATHABLE CAP WITH REMOVABLE COMBS + ELASTIC BAND FOR A SNUG FIT.
                      </p>
                      <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                        SINGLE STRAND KNOTS ARE LIGHTLY BLEACHED FOR A SEAMLESS, READY TO WEAR APPLICATION.
                      </p>
                      <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                        UNIT COMES CO-WASHED IN ITS NATURAL STATE. CAN BE BLEACHED, DYED OR COLORED.
                      </p>
                      <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                        USE 3D WIG GENERATOR TO CUSTOMIZE UNIT AS PICTURED, FOR MEMBERS ONLY.
                      </p>
                      <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap', marginBottom: '-8px' }}>
                        PROPER VERIFICATION IS REQUIRED TO FINALIZE THE PURCHASE OF ALL UNITS.
                      </p>
                    </>
                  )}
                  
                  {activeTab === 'SHIPPING' && (
                    <>
                      <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                        STANDARD PROCESSING IS 6 TO 8 WEEKS AND UP TO 10 WEEKS FOR CUSTOMIZED UNITS.
                      </p>
                      <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                        EXPRESS PROCESSING IS 4 TO 6 WEEKS WITH RUSH SHIPPING FOR AN ADDITIONAL $120 USD.
                      </p>
                      <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                        custom color, styling & add-ons are not applicable for express processing.
                      </p>
                      <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap', marginBottom: '-8px' }}>
                        PROCESSING TIME DOES NOT INCLUDE WEEKENDS AND MAJOR US HOLIDAYS.
                      </p>
                    </>
                  )}
                  
                  {activeTab === 'POLICY' && (
                    <>
                      <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                        WE ARE UNABLE TO ACCEPT RETURNS OR REFUNDS AT THIS TIME. ALL SALES ARE FINAL.
                      </p>
                      <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                        WHEN APPLICABLE, WE DO OFFER STORE CREDIT TO GO TOWARDS A FUTURE PURCHASE.
                      </p>
                      <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap', marginBottom: '-8px' }}>
                        IF THERE IS AN ISSUE WITH YOUR ORDER, REACH OUT TO CONTACT@FRONTALSLAYER.COM
                      </p>
                    </>
                  )}
                  
                  {activeTab === 'CARE & STORAGE' && (
                    <>
                      <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                        WASH WITH MILD SHAMPOO, AVOID GETTING CONDITIONER DIRECTLY ON THE LACE.
                      </p>
                      <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                        only apply light oils & serums to your raw hair extensions.
                      </p>
                      <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap' }}>
                        ROUTINELY BRUSH HAIR WITH A PADDLE BRUSH TO AVOID MATTING & SHEDDING.
                      </p>
                      <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '7.7px', color: 'black', whiteSpace: 'nowrap', marginBottom: '-8px' }}>
                        CAREFULLY STORE UNIT INSIDE SATIN LINED DUST BAG TO MINIMIZE DAMAGE, FRIZZ + DEBRIS.
                      </p>
                    </>
                  )}
                  
                  {activeTab === 'REVIEWS' && (
                    <div style={{ textAlign: 'center', padding: '20px 0 0px 0', transform: 'translateY(-12px)' }}>
                      <div style={{ marginBottom: '40px' }}>
                        <h3 style={{ 
                          fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', 
                          fontSize: '11px', 
                          color: '#EB1C24', 
                          fontWeight: '500',
                          marginBottom: '15px',
                          textTransform: 'uppercase'
                        }}>
                          LEAVE A REVIEW!
                        </h3>
                        
                        <div className="flex justify-center mb-4 gap-1">
                          {[...Array(5)].map((_, index) => (
                            <img
                              key={index}
                              src="/assets/NOIR/filled-star.png"
                              alt="Star Rating"
                              className="w-auto h-auto cursor-pointer"
                              style={{ 
                                width: '14px', 
                                height: '14px',
                                filter: 'drop-shadow(0 0 0 1px black)',
                                stroke: '1px black'
                              }}
                            />
                          ))}
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ 
                            fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', 
                            fontSize: '11px', 
                            color: 'black',
                            textTransform: 'uppercase',
                            margin: '0'
                          }}>
                            4.97 OUT OF 5 STARS
                          </p>
                          <p style={{ 
                            fontFamily: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif', 
                            fontSize: '9px', 
                            color: '#909090',
                            textTransform: 'uppercase',
                            margin: '0',
                            transform: 'translateY(3px)'
                          }}>
                            BASED ON 14 VERIFIED REVIEWS
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ADD TO BAG BUTTON */}
          <div className="px-0 md:px-0" style={{ marginTop: '2px' }}>
            <button
              onClick={handleAddToBag}
              disabled={addToBagState === 'adding'}
              className={`border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold ${
                addToBagState === 'adding' ? 'bg-white cursor-not-allowed' : 
                addToBagState === 'added' ? 'bg-white cursor-pointer' : 'bg-white cursor-pointer hover:bg-gray-50'
              }`}
              style={{ 
                borderWidth: '1.3px', 
                color: '#EB1C24',
                fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                backgroundColor: '#FFFFFF'
              }}
            >
              {addToBagState === 'idle' && 'ADD TO BAG'}
              {addToBagState === 'adding' && 'ADDING...'}
              {addToBagState === 'added' && (
                <span className="flex items-center justify-center gap-1">
                  <img src="/assets/check.svg" alt="Check" width="9" height="9" />
                  <span style={{ color: '#909090' }}>IN THE BAG</span>
                </span>
              )}
            </button>
          </div>

          {/* CUSTOMIZE IN BUILD-A-WIG BUTTON */}
          <div className="px-0 md:px-0" style={{ marginTop: '10px' }}>
            <button
              onClick={() => {
                const capSizeToSave = selectedCustomCap || selectedFlexibleCap;
                if (capSizeToSave) {
                  localStorage.setItem('selectedCapSize', capSizeToSave);
                  localStorage.setItem('customizeSelectedCapSize', capSizeToSave);
                  localStorage.setItem('selectedCapSizePrice', '0');
                  localStorage.setItem('customizeSelectedCapSizePrice', '0');
                }
                navigate('/build-a-wig/blanco/customize');
              }}
              className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
              style={{ 
                borderWidth: '1.3px', 
                color: '#EB1C24',
                fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif'
              }}
            >
              CUSTOMIZE IN BUILD-A-WIG
            </button>
          </div>

          {/* SIMILAR PRODUCTS SECTION */}
          <div className="px-0 md:px-0" style={{ marginTop: '20px', marginBottom: '20px' }}>
            <div style={{ 
              border: '1.3px solid black', 
              backgroundColor: 'rgba(255, 255, 255, 0.6)', 
              backdropFilter: 'blur(10px)',
              padding: '0px',
              maxWidth: '100%',
              margin: '0 auto'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                <div style={{ 
                  width: '1px', 
                  height: '15px', 
                  backgroundColor: 'black',
                  margin: '0 auto 8px auto'
                }}></div>
                <h3 style={{ 
                  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                  fontSize: '12px',
                  color: '#EB1C24',
                  textTransform: 'uppercase',
                  margin: '0',
                  fontWeight: '500'
                }}>
                  SIMILAR PRODUCTS
                </h3>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <button 
                  onClick={handleSimilarProductsLeftArrow}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    padding: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    minHeight: '50px',
                    transform: `translateX(10px) translateY(${is3DView ? '-26px' : '-10px'})`
                  }}>
                  <img
                    src="/assets/NOIR/left-facing-arrow.svg"
                    alt="Left Arrow"
                    style={{ width: '14px', height: '14px' }}
                  />
                </button>
                
                <div style={{ flex: '1', position: 'relative' }}>
                  <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '0',
                    bottom: '0',
                    width: '1px',
                    backgroundColor: 'black',
                    zIndex: 20,
                    transform: 'translateX(-50%)'
                  }}></div>
                  
                  <div style={{ 
                    overflowX: 'hidden',
                    width: '100%',
                    position: 'relative',
                    maxWidth: '100%'
                  }}>
                    <div 
                      style={{ 
                        display: 'flex', 
                        gap: '0',
                        transform: `translateX(${similarProductsScroll}px) translateY(-15px)`,
                        transition: 'none',
                        width: 'calc(200% - 20px)'
                      }}
                    >
                {/* Product 1 - BLANCO */}
                <div 
                  onClick={() => navigate('/straight/blanco')}
                  style={{ 
                    padding: is3DView ? '10px 10px 4px 10px' : '10px 10px 4px 0px',
                    textAlign: 'center',
                    transform: is3DView ? 'translateX(1px)' : 'translateX(-2.5px)',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={is3DView ? "/assets/NOIR/blanco front.png" : "/assets/NOIR/blanco-thumb.png"}
                    alt="BLANCO"
                    style={{ 
                        width: is3DView ? 'calc(100% - 24px)' : '100%', 
                        height: is3DView ? 'calc(auto - 24px)' : 'auto',
                      marginBottom: '10px',
                      marginLeft: '10px'
                    }}
                  />
                  <p style={{ 
                    fontFamily: '"Covered By Your Grace", cursive',
                    fontSize: '18px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '-10px 0 -3px 0',
                    fontWeight: '500',
                    transform: !is3DView ? 'translateX(10px)' : undefined
                  }}>
                    BLANCO
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                    transform: !is3DView ? 'translateX(10px)' : undefined
                  }}>
                    24" RAW RUSSIAN
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '12px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                    transform: !is3DView ? 'translateX(10px)' : undefined
                  }}>
                    $820 USD
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px', transform: !is3DView ? 'translateX(10px)' : undefined }}>
                    {[...Array(5)].map((_, index) => (
                      <img
                        key={index}
                        src="/assets/NOIR/star-symbol.png"
                        alt="Star Rating"
                        style={{ 
                          width: '10px', 
                          height: '10px',
                          filter: 'drop-shadow(0 0 0 1px black)',
                          stroke: '1px black'
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Product 2 - SOFT WAVE */}
                <div 
                  onClick={() => navigate('/wavy/soft-wave')}
                  style={{ 
                    padding: '10px 10px 4px 10px',
                    textAlign: 'center',
                    transform: 'translateX(13px)',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={is3DView ? "/assets/NOIR/wave front.png" : "/assets/NOIR/wave-thumb.png"}
                    alt="SOFT WAVE"
                    style={{ 
                        width: is3DView ? 'calc(100% - 24px)' : '100%', 
                        height: is3DView ? 'calc(auto - 24px)' : 'auto',
                      marginBottom: '10px',
                      marginLeft: '10px'
                    }}
                  />
                  <p style={{ 
                    fontFamily: '"Covered By Your Grace", cursive',
                    fontSize: '18px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '-10px 0 -3px 0',
                    fontWeight: '500',
                    transform: !is3DView ? 'translateX(10px)' : undefined
                  }}>
                    SOFT WAVE
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                    transform: !is3DView ? 'translateX(10px)' : undefined
                  }}>
                    24" RAW INDONESIAN
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '12px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                    transform: !is3DView ? 'translateX(10px)' : undefined
                  }}>
                    $760 USD
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px', transform: !is3DView ? 'translateX(10px)' : undefined }}>
                    {[...Array(5)].map((_, index) => (
                      <img
                        key={index}
                        src="/assets/NOIR/star-symbol.png"
                        alt="Star Rating"
                        style={{ 
                          width: '10px', 
                          height: '10px',
                          filter: 'drop-shadow(0 0 0 1px black)',
                          stroke: '1px black'
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Product 3 - NOIR */}
                <div 
                  onClick={() => navigate('/straight/noir')}
                  style={{ 
                    padding: '10px 10px 4px 10px',
                    textAlign: 'center',
                    transform: is3DView ? 'translateX(-9.3px)' : 'translateX(-8.3px)',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={is3DView ? "/assets/NOIR/noir front.png" : "/assets/NOIR/noir-thumb.png"}
                    alt="NOIR"
                    style={{ 
                        width: is3DView ? 'calc(100% - 24px)' : '100%', 
                        height: is3DView ? 'calc(auto - 24px)' : 'auto',
                      marginBottom: '10px',
                      marginLeft: is3DView ? '10px' : '10px'
                    }}
                  />
                  <p style={{ 
                    fontFamily: '"Covered By Your Grace", cursive',
                    fontSize: '18px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '-10px 0 -3px 0',
                    fontWeight: '500',
                    transform: !is3DView ? 'translateX(10.5px)' : undefined
                  }}>
                    NOIR
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                    transform: !is3DView ? 'translateX(10.5px)' : undefined
                  }}>
                    24" RAW CAMBODIAN
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '12px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                    transform: !is3DView ? 'translateX(10.5px)' : undefined
                  }}>
                    $740 USD
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px', transform: !is3DView ? 'translateX(10.5px)' : undefined }}>
                    {[...Array(5)].map((_, index) => (
                      <img
                        key={index}
                        src="/assets/NOIR/star-symbol.png"
                        alt="Star Rating"
                        style={{ 
                          width: '10px', 
                          height: '10px',
                          filter: 'drop-shadow(0 0 0 1px black)',
                          stroke: '1px black'
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Product 4 - SOFT CURL */}
                <div 
                  onClick={() => navigate('/curly/soft-curl')}
                  style={{ 
                    padding: '10px 10px 4px 10px',
                    textAlign: 'center',
                    transform: is3DView ? 'translateX(2.9px)' : 'translateX(7.7px)',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={is3DView ? "/assets/NOIR/wave front.png" : "/assets/NOIR/curl-thumb.png"}
                    alt="SOFT CURL"
                    style={{ 
                        width: is3DView ? 'calc(100% - 24px)' : '100%', 
                        height: is3DView ? 'calc(auto - 24px)' : 'auto',
                      marginBottom: '10px',
                      marginLeft: is3DView ? '10px' : '10px'
                    }}
                  />
                  <p style={{ 
                    fontFamily: '"Covered By Your Grace", cursive',
                    fontSize: '18px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '-10px 0 -3px 0',
                    fontWeight: '500',
                    transform: is3DView ? 'translateX(-0.5px)' : 'translateX(10px)'
                  }}>
                    SOFT CURL
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                    transform: is3DView ? 'translateX(-0.5px)' : 'translateX(10px)'
                  }}>
                    24" RAW VIETNAMESE
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '12px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                    transform: is3DView ? 'translateX(-0.5px)' : 'translateX(10px)'
                  }}>
                    $780 USD
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px', transform: is3DView ? 'translateX(-0.5px)' : 'translateX(10px)' }}>
                    {[...Array(5)].map((_, index) => (
                      <img
                        key={index}
                        src="/assets/NOIR/star-symbol.png"
                        alt="Star Rating"
                        style={{ 
                          width: '10px', 
                          height: '10px',
                          filter: 'drop-shadow(0 0 0 1px black)',
                          stroke: '1px black'
                        }}
                      />
                    ))}
                  </div>
                </div>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleSimilarProductsRightArrow}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    padding: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    minHeight: '50px',
                    transform: `translateX(-10px) translateY(${is3DView ? '-26px' : '-10px'})`
                  }}>
                  <img
                    src="/assets/NOIR/right-facing-arrow.svg"
                    alt="Right Arrow"
                    style={{ width: '14px', height: '14px' }}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* RECENTLY VIEWED SECTION */}
          <div className="px-0 md:px-0" style={{ marginTop: '20px', marginBottom: '20px', transform: 'translateY(-17px)' }}>
            <div style={{ 
              border: '1.3px solid black', 
              backgroundColor: 'rgba(255, 255, 255, 0.6)', 
              backdropFilter: 'blur(10px)',
              padding: '0px',
              maxWidth: '100%',
              margin: '0 auto'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                <div style={{ 
                  width: '1px', 
                  height: '15px', 
                  backgroundColor: 'black',
                  margin: '0 auto 8px auto'
                }}></div>
                <h3 style={{ 
                  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                  fontSize: '12px',
                  color: '#EB1C24',
                  textTransform: 'uppercase',
                  margin: '0',
                  fontWeight: '500'
                }}>
                  RECENTLY VIEWED
                </h3>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <button 
                  onClick={handleRecentlyViewedLeftArrow}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    padding: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    minHeight: '50px',
                    transform: `translateX(10px) translateY(${is3DView ? '-26px' : '-10px'})`
                  }}>
                  <img
                    src="/assets/NOIR/left-facing-arrow.svg"
                    alt="Left Arrow"
                    style={{ width: '14px', height: '14px' }}
                  />
                </button>
                
              {/* Product Thumbnails Container with Static Vertical Line */}
              <div style={{ flex: '1', position: 'relative' }}>
                {/* Single Center Line with Masking */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: '0',
                  bottom: '0',
                  width: '1px',
                  backgroundColor: 'black',
                  zIndex: 20,
                  transform: 'translateX(-50%)'
                }}></div>
                
                {/* Masking Overlay for Tunnel Effect */}
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: '0',
                  bottom: '0',
                  width: '10px',
                  backgroundColor: 'transparent',
                  zIndex: 15,
                  transform: 'translateX(-50%)',
                  pointerEvents: 'none'
                }}></div>
                
                {/* Scrolling Product Thumbnails Container */}
                <div style={{ 
                  overflowX: 'hidden',
                  width: '100%',
                  position: 'relative',
                  maxWidth: '100%'
                }}>
                  <div 
                    style={{ 
                      display: 'flex', 
                      gap: '0',
                      transform: `translateX(${recentlyViewedScroll}px) translateY(-15px)`,
                      transition: 'none',
                      width: 'calc(200% - 20px)'
                    }}
                  >
                {/* Product 1 - BEACH WAVE */}
                <div 
                  onClick={() => navigate('/wavy/soft-wave')}
                  style={{ 
                    padding: is3DView ? '10px 10px 4px 10px' : '10px 10px 4px 0px',
                    textAlign: 'center',
                    transform: is3DView ? 'translateX(1px)' : 'translateX(-2.5px)',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={is3DView ? "/assets/NOIR/wave front.png" : "/assets/NOIR/wave-thumb.png"}
                    alt="SOFT WAVE"
                    style={{ 
                        width: is3DView ? 'calc(100% - 24px)' : '100%', 
                        height: is3DView ? 'calc(auto - 24px)' : 'auto',
                      marginBottom: '10px',
                      marginLeft: '10px'
                    }}
                  />
                  <p style={{ 
                    fontFamily: '"Covered By Your Grace", cursive',
                    fontSize: '18px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '-10px 0 -3px 0',
                    fontWeight: '500',
                    transform: !is3DView ? 'translateX(10px)' : undefined
                  }}>
                    SOFT WAVE
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                    transform: !is3DView ? 'translateX(10px)' : undefined
                  }}>
                    24" RAW INDONESIAN
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '12px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                    transform: !is3DView ? 'translateX(10px)' : undefined
                  }}>
                    $760 USD
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px', transform: !is3DView ? 'translateX(10px)' : undefined }}>
                    {[...Array(5)].map((_, index) => (
                      <img
                        key={index}
                        src="/assets/NOIR/star-symbol.png"
                        alt="Star Rating"
                        style={{ 
                          width: '10px', 
                          height: '10px',
                          filter: 'drop-shadow(0 0 0 1px black)',
                          stroke: '1px black'
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Product 2 - SOFT CURL */}
                <div 
                  onClick={() => navigate('/curly/soft-curl')}
                  style={{ 
                    padding: '10px 10px 4px 10px',
                    textAlign: 'center',
                    transform: 'translateX(13px)',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={is3DView ? "/assets/NOIR/wave front.png" : "/assets/NOIR/curl-thumb.png"}
                    alt="SOFT CURL"
                    style={{ 
                        width: is3DView ? 'calc(100% - 24px)' : '100%', 
                        height: is3DView ? 'calc(auto - 24px)' : 'auto',
                      marginBottom: '10px',
                      marginLeft: '10px'
                    }}
                  />
                  <p style={{ 
                    fontFamily: '"Covered By Your Grace", cursive',
                    fontSize: '18px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '-10px 0 -3px 0',
                    fontWeight: '500',
                    transform: !is3DView ? 'translateX(10px)' : undefined
                  }}>
                    SOFT CURL
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                    transform: !is3DView ? 'translateX(10px)' : undefined
                  }}>
                    24" RAW VIETNAMESE
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '12px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                    transform: !is3DView ? 'translateX(10px)' : undefined
                  }}>
                    $780 USD
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px', transform: !is3DView ? 'translateX(10px)' : undefined }}>
                    {[...Array(5)].map((_, index) => (
                      <img
                        key={index}
                        src="/assets/NOIR/star-symbol.png"
                        alt="Star Rating"
                        style={{ 
                          width: '10px', 
                          height: '10px',
                          filter: 'drop-shadow(0 0 0 1px black)',
                          stroke: '1px black'
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Product 3 - NOIR */}
                <div 
                  onClick={() => navigate('/straight/noir')}
                  style={{ 
                    padding: '10px 10px 4px 10px',
                    textAlign: 'center',
                    transform: is3DView ? 'translateX(-9.3px)' : 'translateX(-8.3px)',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={is3DView ? "/assets/NOIR/noir front.png" : "/assets/NOIR/noir-thumb.png"}
                    alt="NOIR"
                    style={{ 
                        width: is3DView ? 'calc(100% - 24px)' : '100%', 
                        height: is3DView ? 'calc(auto - 24px)' : 'auto',
                      marginBottom: '10px',
                      marginLeft: '10px'
                    }}
                  />
                  <p style={{ 
                    fontFamily: '"Covered By Your Grace", cursive',
                    fontSize: '18px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '-10px 0 -3px 0',
                    fontWeight: '500',
                    transform: !is3DView ? 'translateX(10.5px)' : undefined
                  }}>
                    NOIR
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                    transform: !is3DView ? 'translateX(10.5px)' : undefined
                  }}>
                    24" RAW CAMBODIAN
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '12px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                    transform: !is3DView ? 'translateX(10.5px)' : undefined
                  }}>
                    $740 USD
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px', transform: !is3DView ? 'translateX(10.5px)' : undefined }}>
                    {[...Array(5)].map((_, index) => (
                      <img
                        key={index}
                        src="/assets/NOIR/star-symbol.png"
                        alt="Star Rating"
                        style={{ 
                          width: '10px', 
                          height: '10px',
                          filter: 'drop-shadow(0 0 0 1px black)',
                          stroke: '1px black'
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Product 4 - BLANCO */}
                <div 
                  onClick={() => navigate('/straight/blanco')}
                  style={{ 
                    padding: '10px 10px 4px 10px',
                    textAlign: 'center',
                    transform: is3DView ? 'translateX(2.9px)' : 'translateX(7.7px)',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={is3DView ? "/assets/NOIR/blanco front.png" : "/assets/NOIR/blanco-thumb.png"}
                    alt="BLANCO"
                    style={{ 
                        width: is3DView ? 'calc(100% - 24px)' : '100%', 
                        height: is3DView ? 'calc(auto - 24px)' : 'auto',
                      marginBottom: '10px',
                      marginLeft: '10px'
                    }}
                  />
                  <p style={{ 
                    fontFamily: '"Covered By Your Grace", cursive',
                    fontSize: '18px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '-10px 0 -3px 0',
                    fontWeight: '500',
                    transform: is3DView ? 'translateX(-0.5px)' : 'translateX(10px)'
                  }}>
                    BLANCO
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '10px',
                    color: '#EB1C24',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                    transform: is3DView ? 'translateX(-0.5px)' : 'translateX(10px)'
                  }}>
                    24" RAW RUSSIAN
                  </p>
                  <p style={{ 
                    fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                    fontSize: '12px',
                    color: 'black',
                    textTransform: 'uppercase',
                    margin: '0 0 5px 0',
                    fontWeight: '500',
                    lineHeight: '0.84',
                    transform: is3DView ? 'translateX(-0.5px)' : 'translateX(10px)'
                  }}>
                    $820 USD
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px', transform: is3DView ? 'translateX(-0.5px)' : 'translateX(10px)' }}>
                    {[...Array(5)].map((_, index) => (
                      <img
                        key={index}
                        src="/assets/NOIR/star-symbol.png"
                        alt="Star Rating"
                        style={{ 
                          width: '10px', 
                          height: '10px',
                          filter: 'drop-shadow(0 0 0 1px black)',
                          stroke: '1px black'
                        }}
                      />
                    ))}
                  </div>
                </div>
                  </div>
                </div>
              </div>
                
                <button 
                  onClick={handleRecentlyViewedRightArrow}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer',
                    padding: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    minHeight: '50px',
                    transform: `translateX(-10px) translateY(${is3DView ? '-26px' : '-10px'})`
                  }}>
                  <img
                    src="/assets/NOIR/right-facing-arrow.svg"
                    alt="Right Arrow"
                    style={{ width: '14px', height: '14px' }}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlancoSelection;
