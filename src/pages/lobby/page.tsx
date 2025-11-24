import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Lobby Component
const LobbyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-red-900 relative" style={{ height: '100vh', overflow: 'visible', display: 'flex', flexDirection: 'column', width: '100vw', flexShrink: 0 }}>
      {/* Background Image */}
      <div 
        style={{ 
          position: 'absolute', 
          top: '0', 
          right: '0', 
          bottom: '0', 
          left: '0', 
          backgroundImage: 'url(/assets/landing-background.png)',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Chat Icon - Upper Left */}
      <div className="absolute top-6 left-6 z-20">
        <img 
          src="/assets/chat-icon.svg" 
          alt="Chat" 
          style={{ width: '32px', height: '32px', cursor: 'pointer' }}
        />
      </div>
      
      {/* Menu Icon - Upper Right */}
      <div className="absolute top-6 right-6 z-20">
        <img 
          src="/assets/landing-menu-icon.svg" 
          alt="Menu" 
          style={{ width: '32px', height: '32px', cursor: 'pointer' }}
        />
      </div>
      
      {/* Main Content Container */}
      <div style={{ position: 'relative', zIndex: '10', paddingTop: '0px', display: 'block' }}>
        
        {/* Neon Logo - Center */}
        <div style={{ marginBottom: '0px', padding: '0px' }}>
          <img 
            src="/assets/neon-logo.png" 
            alt="Frontal Slayer" 
            style={{ width: 'auto', height: '60px', maxHeight: '60px', margin: '0', padding: '0' }}
          />
        </div>
        
        {/* Navigation Links */}
        <div style={{ margin: '0', padding: '0', position: 'relative', top: '-25px', marginBottom: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0px', margin: '0', padding: '0' }}>
            <img 
              src="/assets/neon-products.png" 
              alt="Products" 
              onClick={() => navigate('/build-a-wig')}
              style={{ width: 'auto', height: '44px', cursor: 'pointer', margin: '0', padding: '0', display: 'block', transform: 'translateX(0px)' }}
            />
            <img 
              src="/assets/neon-tools.png" 
              alt="Tools" 
              style={{ width: 'auto', height: '44px', cursor: 'pointer', margin: '0', padding: '0', display: 'block', transform: 'translateX(-50px)' }}
            />
            <img 
              src="/assets/neon-booking.png" 
              alt="Booking" 
              style={{ width: 'auto', height: '44px', cursor: 'pointer', margin: '0', padding: '0', display: 'block', transform: 'translateX(-100px)' }}
            />
          </div>
        </div>
        
      </div>
    </div>
  );
};

// Lounge Component
const LoungePage: React.FC = () => {
  return (
    <div className="bg-red-900 relative" style={{ height: '100vh', overflow: 'visible', display: 'flex', flexDirection: 'column', width: '100vw', flexShrink: 0 }}>
      {/* Background Image */}
      <div 
        style={{ 
          position: 'absolute', 
          top: '0', 
          right: '0', 
          bottom: '0', 
          left: '0', 
          backgroundImage: 'url(/assets/landing-background.png)',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Chat Icon - Upper Left */}
      <div className="absolute top-6 left-6 z-20">
        <img 
          src="/assets/chat-icon.svg" 
          alt="Chat" 
          style={{ width: '32px', height: '32px', cursor: 'pointer' }}
        />
      </div>
      
      {/* Menu Icon - Upper Right */}
      <div className="absolute top-6 right-6 z-20">
        <img 
          src="/assets/landing-menu-icon.svg" 
          alt="Menu" 
          style={{ width: '32px', height: '32px', cursor: 'pointer' }}
        />
      </div>
      
      {/* Main Content Container */}
      <div style={{ position: 'relative', zIndex: '10', paddingTop: '0px', display: 'block' }}>
        
        {/* Lounge Title - Center */}
        <div style={{ marginBottom: '0px', padding: '0px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <h1 style={{ 
            fontSize: '48px', 
            color: '#fff', 
            textShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6)',
            fontWeight: 'bold'
          }}>
            LOUNGE
          </h1>
        </div>
        
      </div>
    </div>
  );
};

// Main Lobby App Component with Slide Transition
const LobbyApp: React.FC = () => {
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
            background: '#ffffff !important',
            border: '3px solid #000000 !important',
            borderRadius: '50%',
            width: '70px',
            height: '70px',
            minWidth: '70px',
            minHeight: '70px',
            cursor: isTransitioning ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000000 !important',
            fontSize: '32px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            opacity: isTransitioning ? 0.5 : 1,
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5)',
            pointerEvents: 'auto',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
          onMouseEnter={(e) => {
            if (!isTransitioning) {
              e.currentTarget.style.background = '#f0f0f0';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.15)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          ←
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
            background: '#ffffff !important',
            border: '3px solid #000000 !important',
            borderRadius: '50%',
            width: '70px',
            height: '70px',
            minWidth: '70px',
            minHeight: '70px',
            cursor: isTransitioning ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000000 !important',
            fontSize: '32px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            opacity: isTransitioning ? 0.5 : 1,
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5)',
            pointerEvents: 'auto',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
          onMouseEnter={(e) => {
            if (!isTransitioning) {
              e.currentTarget.style.background = '#f0f0f0';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.15)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          →
        </button>
      )}

      {/* Page Indicators */}
      <div style={{
        position: 'fixed',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        gap: '10px'
      }}>
        {pages.map((_, index) => (
          <div
            key={index}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: index === currentPage ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.5)',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => {
              if (!isTransitioning) {
                setIsTransitioning(true);
                setCurrentPage(index);
                setTimeout(() => setIsTransitioning(false), 600);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LobbyApp;

