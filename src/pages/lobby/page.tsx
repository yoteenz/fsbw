import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Lobby Component
const LobbyPage: React.FC = () => {
  const navigate = useNavigate();
  console.log('✅✅✅ LobbyPage component rendering - ROOT ROUTE');
  
  // Ensure we're on the root route
  useEffect(() => {
    console.log('✅ LobbyPage useEffect - pathname:', window.location.pathname);
    if (window.location.pathname !== '/') {
      console.warn('⚠️ LobbyPage rendered but pathname is not /:', window.location.pathname);
    }
  }, []);

  const handleNext = useCallback(() => {
    // This will be handled by parent component
    window.dispatchEvent(new CustomEvent('lobby-navigate-next'));
  }, []);

  return (
    <div className="bg-red-900 relative" style={{ minHeight: '100vh', width: '100vw', flexShrink: 0, backgroundColor: 'white' }}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(/assets/landing-background.png)',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center center',
          backgroundColor: 'white',
          willChange: 'auto',
          contain: 'layout style paint'
        }}
      />
      
      {/* Chat Icon - Upper Left */}
      <div className="absolute z-20" style={{ top: '54px', left: '20px' }}>
        <img 
          src="/assets/chat-icon.svg" 
          alt="Chat" 
          className="cursor-pointer hover:opacity-80 transition-opacity"
          style={{ width: '22px', height: '22px' }}
        />
      </div>
      
      {/* Menu Icon - Upper Right */}
      <div className="absolute right-6 z-20" style={{ top: '59px' }}>
        <img 
          src="/assets/landing-menu-icon.svg" 
          alt="Menu" 
          className="cursor-pointer hover:opacity-80 transition-opacity"
          style={{ width: '16px', height: '16px' }}
        />
      </div>
      
      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen" style={{ overflow: 'visible' }}>
        {/* Placeholder for logo to maintain flex flow */}
        <div style={{ height: '288px', width: '1px', opacity: 0, flexShrink: 0 }}>
          {/* Invisible spacer to maintain layout */}
        </div>
        
        {/* Neon Logo - Center - Absolute positioned to escape container */}
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, calc(-50% - 240px))', 
          zIndex: 20,
          width: 'fit-content'
        }}>
          <div style={{ display: 'inline-block', position: 'relative', width: 'fit-content' }}>
            <img 
              src="/assets/neon-logo.png" 
              alt="Frontal Slayer" 
              onClick={() => navigate('/build-a-wig')}
              style={{ width: 'auto', height: '268px', maxWidth: 'none', display: 'block', cursor: 'pointer' }}
            />
          </div>
        </div>
        
        {/* Navigation Links Container */}
        <div className="flex flex-row justify-center items-center" style={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(calc(-50% + 51px), calc(-50% - 131px))',
          zIndex: 20,
          margin: 0,
          padding: 0
        }}>
          <img 
            src="/assets/neon-products.png" 
            alt="Products" 
            onClick={() => navigate('/build-a-wig')}
            className="w-auto cursor-pointer hover:opacity-80 transition-opacity"
            style={{ margin: 0, padding: 0, display: 'block', transform: 'translateX(4px)', height: '41px' }}
          />
          <img 
            src="/assets/neon-tools.png" 
            alt="Tools" 
            className="w-auto cursor-pointer hover:opacity-80 transition-opacity"
            style={{ margin: 0, padding: 0, display: 'block', transform: 'translateX(-50px)', height: '41px' }}
          />
          <img 
            src="/assets/neon-booking.png" 
            alt="Booking" 
            className="w-auto cursor-pointer hover:opacity-80 transition-opacity"
            style={{ margin: 0, padding: 0, display: 'block', transform: 'translateX(-104px)', height: '41px' }}
          />
        </div>
        
        {/* Product Display Shelves */}
        <div className="flex flex-col" style={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, calc(-50% + 2px))',
          zIndex: 20,
          gap: '16px'
        }}>
          {/* HD LACE Shelf */}
          <div className="flex flex-col items-center">
            <img 
              src="/assets/hd-group.png" 
              alt="HD Lace Collection" 
              className="w-auto md:h-20 lg:h-24"
              style={{ height: '56px' }}
            />
          </div>
          
          {/* TRANSPARENT LACE Shelf */}
          <div className="flex flex-col items-center">
            <img 
              src="/assets/transparent-group.png" 
              alt="Transparent Lace Collection" 
              className="w-auto md:h-20 lg:h-24"
              style={{ height: '56px' }}
            />
          </div>
          
          {/* CUSTOM UNITS Shelf */}
          <div className="flex flex-col items-center">
            <img 
              src="/assets/custom-group.png" 
              alt="Custom Units Collection" 
              className="w-auto md:h-20 lg:h-24"
              style={{ height: '56px' }}
            />
          </div>
        </div>
        
        {/* Bottom Display Case and Accessories */}
        <div className="relative w-3/5" style={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(calc(-50% + 4px), calc(-50% + 255px))',
          zIndex: 20,
          maxWidth: '753px'
        }}>
          {/* Acrylic Case */}
          <div className="relative">
            <img 
              src="/assets/CASE.png" 
              alt="Display Case" 
              className="h-auto"
              style={{ display: 'block', width: '230px', maxWidth: '230px' }}
            />
            
            {/* Register - Left side of case */}
            <div className="absolute left-8" style={{ top: '-39px' }}>
            <img 
              src="/assets/REGISTER.png" 
              alt="Register" 
              className="md:w-10 md:h-8"
              style={{ width: '52px', height: '44px' }}
            />
            </div>
            
            {/* Phone - Right side of case */}
            <div className="absolute right-8" style={{ top: '-31px' }}>
              <img 
                src="/assets/PHONE.png" 
                alt="Phone" 
                className="md:w-10 md:h-8"
                style={{ width: '32px', height: '34px' }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Arrow Button - Part of page design, scrolls with content */}
      <div style={{
        position: 'absolute',
        right: '20px',
        top: 'calc(50vh - 5px)',
        transform: 'translate(19px, -50%)',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1px',
        pointerEvents: 'auto'
      }}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleNext();
          }}
          disabled={false}
          aria-label="Next page"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 10px 0px 10px',
            transition: 'all 0.3s ease',
            opacity: 0.6,
            pointerEvents: 'auto',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.6';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <svg 
            width="27" 
            height="19" 
            viewBox="0 0 32 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}
          >
            <path 
              d="M14 18L20 12L14 6" 
              stroke="white" 
              strokeWidth="3.5" 
              strokeOpacity="0.9"
              strokeLinecap="square" 
              strokeLinejoin="miter"
            />
            <path 
              d="M6 18L12 12L6 6" 
              stroke="white" 
              strokeWidth="2.5" 
              strokeOpacity="0.9"
              strokeLinecap="square" 
              strokeLinejoin="miter"
            />
          </svg>
        </button>
        <div style={{
          fontFamily: 'Futura PT Medium, Futura PT, Futura, sans-serif',
          fontSize: '8px',
          color: 'white',
          opacity: 0.6,
          letterSpacing: '1px',
          textAlign: 'center',
          width: '100%',
          transform: 'translateX(-2px)',
          textTransform: 'uppercase'
        }}>
          lobby
        </div>
      </div>
    </div>
  );
};

// Lounge Component
const LoungePage: React.FC = () => {
  console.log('LoungePage component is rendering');
  
  const handlePrevious = useCallback(() => {
    // This will be handled by parent component
    window.dispatchEvent(new CustomEvent('lobby-navigate-previous'));
  }, []);
  
  return (
    <div className="bg-white relative" style={{ minHeight: '105vh', width: '100vw', overflow: 'visible', display: 'block', margin: 0, padding: 0, flexShrink: 0, backgroundColor: 'white' }}>
      {/* Background Image - Using landing2-background */}
      <div 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(/assets/landing2-background.png)',
          backgroundSize: '100% auto',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          backgroundColor: 'white',
          willChange: 'auto',
          contain: 'layout style paint'
        }}
      />
      
      {/* Menu Icon - Upper Right */}
      <div className="absolute right-6 z-20" style={{ top: '104px' }}>
        <img 
          src="/assets/landing-menu-icon.svg" 
          alt="Menu" 
          style={{ width: '16px', height: '16px', cursor: 'pointer' }}
        />
      </div>
      
      {/* Neon Logo - Independent container with absolute positioning */}
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(calc(-50% + 56px), calc(-50% - 160px))', 
        zIndex: 10, 
        width: 'fit-content'
      }}>
        <div style={{ display: 'inline-block', position: 'relative', width: 'fit-content' }}>
          <img 
            src="/assets/neon-logo.png" 
            alt="Frontal Slayer" 
            style={{ 
              width: 'auto', 
              height: '265px', 
              maxWidth: 'none',
              maxHeight: '265px', 
              margin: 0, 
              padding: 0,
              display: 'block',
              visibility: 'visible',
              opacity: 1
            }}
          />
        </div>
      </div>
      
      {/* TV Screen - Independent container with absolute positioning */}
       <div style={{ 
         position: 'absolute', 
         top: '50%', 
         left: '50%', 
         transform: 'translate(calc(-50% + 58px), calc(-50% + 50px))', 
         zIndex: 10, 
         width: 'fit-content'
       }}>
         <div style={{ display: 'inline-block', position: 'relative', width: 'fit-content' }}>
           <img 
             src="/assets/tv-screen.png" 
             alt="TV Screen" 
             style={{ 
               width: 'auto', 
               height: '146px', 
               cursor: 'pointer', 
               margin: 0, 
               padding: 0, 
               display: 'block',
               maxWidth: 'none'
             }}
           />
         </div>
       </div>
      
      {/* Play Button - Independent container with absolute positioning */}
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(calc(-50% + 60px), calc(-50% + 49px))', 
        zIndex: 10, 
        width: 'fit-content'
      }}>
        <div style={{ display: 'inline-block', position: 'relative', width: 'fit-content' }}>
          <img 
            src="/assets/play-button.png" 
            alt="Play Button" 
            style={{ width: 'auto', height: '15px', cursor: 'pointer', margin: 0, padding: 0, display: 'block' }}
          />
        </div>
      </div>
      
      {/* Salon Chairs - Independent container with absolute positioning */}
      <div style={{ 
        position: 'absolute', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(calc(-50% + 25px), calc(-50% + 290px))', 
        zIndex: 10, 
        width: 'fit-content'
      }}>
        <div style={{ display: 'inline-block', position: 'relative', width: 'fit-content' }}>
          <img 
            src="/assets/salon-chairs.png" 
            alt="Salon Chairs" 
            style={{ width: 'auto', height: '160px', cursor: 'pointer', margin: 0, padding: 0, display: 'block' }}
          />
        </div>
      </div>
      
      {/* Left Arrow Button - Part of page design, scrolls with content */}
      <div style={{
        position: 'absolute',
        left: '20px',
        top: 'calc(50vh - 5px)',
        transform: 'translate(-17px, -50%)',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1px',
        pointerEvents: 'auto'
      }}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handlePrevious();
          }}
          disabled={false}
          aria-label="Previous page"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 10px 0px 10px',
            transition: 'all 0.3s ease',
            opacity: 0.6,
            pointerEvents: 'auto',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.6';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <svg 
            width="27" 
            height="19" 
            viewBox="0 0 32 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}
          >
            <path 
              d="M18 18L12 12L18 6" 
              stroke="white" 
              strokeWidth="3.5" 
              strokeOpacity="0.9"
              strokeLinecap="square" 
              strokeLinejoin="miter"
            />
            <path 
              d="M26 18L20 12L26 6" 
              stroke="white" 
              strokeWidth="2.5" 
              strokeOpacity="0.9"
              strokeLinecap="square" 
              strokeLinejoin="miter"
            />
          </svg>
        </button>
        <div style={{
          fontFamily: 'Futura PT Medium, Futura PT, Futura, sans-serif',
          fontSize: '8px',
          color: 'white',
          opacity: 0.6,
          letterSpacing: '1px',
          textAlign: 'center',
          width: '100%',
          transform: 'translateX(4px)',
          textTransform: 'uppercase'
        }}>
          lounge
        </div>
      </div>
    </div>
  );
};

// Main Lobby App Component with Slide Transition
const LobbyApp: React.FC = () => {
  console.log('🎯 LOBBY PAGE LOADING - This should show when visiting root path');
  const [currentPage, setCurrentPage] = useState<number>(0); // 0 = Lobby, 1 = Lounge
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const pages = [<LobbyPage key="lobby" />, <LoungePage key="lounge" />];

  const handlePrevious = useCallback(() => {
    if (currentPage > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentPage(currentPage - 1);
      setTimeout(() => setIsTransitioning(false), 800);
    }
  }, [currentPage, isTransitioning]);

  const handleNext = useCallback(() => {
    if (currentPage < pages.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentPage(currentPage + 1);
      setTimeout(() => setIsTransitioning(false), 800);
    }
  }, [currentPage, isTransitioning, pages.length]);

  // Handle keyboard arrow keys
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlePrevious, handleNext]);

  // Listen for navigation events from page components
  useEffect(() => {
    const handleNext = () => {
      if (currentPage < pages.length - 1 && !isTransitioning) {
        setIsTransitioning(true);
        setCurrentPage(currentPage + 1);
        setTimeout(() => setIsTransitioning(false), 800);
      }
    };
    
    const handlePrevious = () => {
      if (currentPage > 0 && !isTransitioning) {
        setIsTransitioning(true);
        setCurrentPage(currentPage - 1);
        setTimeout(() => setIsTransitioning(false), 800);
      }
    };

    window.addEventListener('lobby-navigate-next', handleNext);
    window.addEventListener('lobby-navigate-previous', handlePrevious);
    
    return () => {
      window.removeEventListener('lobby-navigate-next', handleNext);
      window.removeEventListener('lobby-navigate-previous', handlePrevious);
    };
  }, [currentPage, isTransitioning, pages.length]);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh',
      overflowX: 'hidden',
      overflowY: 'auto',
      position: 'relative',
      backgroundColor: 'transparent',
      WebkitOverflowScrolling: 'touch',
      scrollBehavior: 'auto'
    }}>
      {/* Slide Container */}
      <div 
        style={{
          display: 'flex',
          width: `${pages.length * 100}vw`,
          minHeight: '105vh',
          transform: `translateX(-${currentPage * 100}vw)`,
          transition: isTransitioning ? 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          willChange: isTransitioning ? 'transform' : 'auto'
        }}
      >
        {pages.map((page, index) => (
          <div
            key={index}
            style={{
              width: '100vw',
              flexShrink: 0,
              minHeight: index === 0 ? '100vh' : '105vh'
            }}
          >
            {page}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LobbyApp;
