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

  return (
    <div className="h-screen bg-red-900 relative" style={{ width: '100vw', flexShrink: 0 }}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/assets/landing-background.png)',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center center'
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
          transform: 'translate(calc(-50% + 51px), calc(-50% - 138px))',
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
              style={{ height: '64px' }}
            />
          </div>
          
          {/* TRANSPARENT LACE Shelf */}
          <div className="flex flex-col items-center">
            <img 
              src="/assets/transparent-group.png" 
              alt="Transparent Lace Collection" 
              className="w-auto md:h-20 lg:h-24"
              style={{ height: '64px' }}
            />
          </div>
          
          {/* CUSTOM UNITS Shelf */}
          <div className="flex flex-col items-center">
            <img 
              src="/assets/custom-group.png" 
              alt="Custom Units Collection" 
              className="w-auto md:h-20 lg:h-24"
              style={{ height: '64px' }}
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
    </div>
  );
};

// Lounge Component
const LoungePage: React.FC = () => {
  console.log('LoungePage component is rendering');
  return (
    <div className="bg-white relative" style={{ minHeight: '105vh', width: '100vw', height: '100vh', overflow: 'visible', display: 'block', margin: 0, padding: 0, flexShrink: 0 }}>
      {/* Background Image - Using landing2-background */}
      <div 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%',
          height: '100%',
          minHeight: '105vh',
          backgroundImage: 'url(/assets/landing2-background.png)',
          backgroundSize: '100% auto',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat'
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
        transform: 'translate(calc(-50% + 25px), calc(-50% + 310px))', 
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
      setTimeout(() => setIsTransitioning(false), 600);
    }
  }, [currentPage, isTransitioning]);

  const handleNext = useCallback(() => {
    if (currentPage < pages.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentPage(currentPage + 1);
      setTimeout(() => setIsTransitioning(false), 600);
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

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      overflow: 'hidden', 
      position: 'relative',
      backgroundColor: '#000'
    }}>
      {/* Slide Container */}
      <div 
        style={{
          display: 'flex',
          width: `${pages.length * 100}vw`,
          height: '100vh',
          transform: `translateX(-${currentPage * 100}vw)`,
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform'
        }}
      >
        {pages}
      </div>

      {/* Left Arrow Button - Show on lounge page */}
      {currentPage === 1 && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handlePrevious();
          }}
          disabled={isTransitioning}
          aria-label="Previous page"
          style={{
            position: 'fixed',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 999999,
            background: 'transparent',
            border: 'none',
            cursor: isTransitioning ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
            transition: 'all 0.3s ease',
            opacity: isTransitioning ? 0.5 : 1,
            pointerEvents: 'auto',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
          onMouseEnter={(e) => {
            if (!isTransitioning) {
              e.currentTarget.style.opacity = '0.8';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          <svg 
            width="32" 
            height="24" 
            viewBox="0 0 32 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}
          >
            <path 
              d="M18 18L12 12L18 6" 
              stroke="white" 
              strokeWidth="3.5" 
              strokeLinecap="square" 
              strokeLinejoin="miter"
            />
            <path 
              d="M26 18L20 12L26 6" 
              stroke="white" 
              strokeWidth="2.5" 
              strokeLinecap="square" 
              strokeLinejoin="miter"
            />
          </svg>
        </button>
      )}

      {/* Right Arrow Button - Always show on lobby page */}
      {currentPage === 0 && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleNext();
          }}
          disabled={isTransitioning}
          aria-label="Next page"
          style={{
            position: 'fixed',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 999999,
            background: 'transparent',
            border: 'none',
            cursor: isTransitioning ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
            transition: 'all 0.3s ease',
            opacity: isTransitioning ? 0.5 : 1,
            pointerEvents: 'auto',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
          onMouseEnter={(e) => {
            if (!isTransitioning) {
              e.currentTarget.style.opacity = '0.8';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          <svg 
            width="32" 
            height="24" 
            viewBox="0 0 32 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}
          >
            <path 
              d="M14 18L20 12L14 6" 
              stroke="white" 
              strokeWidth="3.5" 
              strokeLinecap="square" 
              strokeLinejoin="miter"
            />
            <path 
              d="M6 18L12 12L6 6" 
              stroke="white" 
              strokeWidth="2.5" 
              strokeLinecap="square" 
              strokeLinejoin="miter"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default LobbyApp;
