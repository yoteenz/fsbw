import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';

function LoadCardPage() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('cartCount') || '0', 10);
    } catch (e) {
      return 0;
    }
  });
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileMenuActiveTab, setMobileMenuActiveTab] = useState(() => {
    const pathname = window.location.pathname;
    if (pathname.includes('/tools') || pathname === '/tools/gift-card') {
      return 'TOOLS';
    } else if (pathname.includes('/brand') || pathname.includes('/about') || pathname.includes('/contact') || pathname.includes('/faq') || pathname.includes('/reviews') || pathname.includes('/terms')) {
      return 'BRAND';
    }
    return 'SHOP';
  });
  const [isSignedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('isSignedIn') === 'true';
      } catch (e) {
        return false;
      }
    }
    return false;
  });
  const [userData] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const currentUser = localStorage.getItem('currentUser');
        return currentUser ? JSON.parse(currentUser) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [barcodes, setBarcodes] = useState(['', '', '']);

  // Listen for cart count changes
  useEffect(() => {
    const handleCartCountUpdate = (event: CustomEvent) => {
      setCartCount(event.detail);
    };

    const handleStorageChange = () => {
      try {
        const newCartCount = parseInt(localStorage.getItem('cartCount') || '0', 10);
        setCartCount(newCartCount);
      } catch (e) {
        setCartCount(0);
      }
    };

    window.addEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
    window.addEventListener('cartUpdated', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
      window.removeEventListener('cartUpdated', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  const handleMobileMenuToggle = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleMobileMenuTabClick = (tab: string) => {
    setMobileMenuActiveTab(tab);
  };


  const handleMobileMenuSignInToggle = () => {
    if (isSignedIn) {
      localStorage.setItem('isSignedIn', 'false');
      localStorage.removeItem('currentUser');
      window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'false' }));
      setShowMobileMenu(false);
      navigate('/sign-in');
    } else {
      navigate('/sign-in');
    }
  };

  const handleBarcodeChange = (index: number, value: string) => {
    const newBarcodes = [...barcodes];
    newBarcodes[index] = value;
    setBarcodes(newBarcodes);
  };

  const handleSubmit = () => {
    // Handle barcode submission logic here
    const validBarcodes = barcodes.filter(barcode => barcode.trim() !== '');
    if (validBarcodes.length > 0) {
      // Process barcodes
      console.log('Submitting barcodes:', validBarcodes);
      // TODO: Add actual barcode processing logic
      alert('Gift card codes submitted successfully!');
      setBarcodes(['', '', '']);
    }
  };

  const formatPrice = (amount: number) => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
  };

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      {/* Marble Background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/marble-half.png')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed'
        }}
      />
      
      {/* Scrollable Content */}
      <div className="relative z-10">
        <div className="flex flex-col py-5 px-4" style={{ minWidth: '100%', maxWidth: 'none', overflow: 'visible' }}>
          {/* NAV BAR CONTAINER */}
          <div
            className="border-solid border-black flex justify-center items-center py-3 w-full mb-5 px-5 bg-white/60 backdrop-blur-sm relative"
            style={{ border: '1.3px solid black' }}
          >
            {/* Left side buttons */}
            <div className="flex gap-5 absolute left-4">
              {showMobileMenu ? (
                <>
                  <button 
                    onClick={() => navigate(isSignedIn ? '/account' : '/sign-in')}
                    className="cursor-pointer" 
                    style={{ height: '15px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(4px)' }}
                  >
                    <img
                      alt="Account icon"
                      width="16"
                      height="16"
                      src="/assets/NOIR/account-icon.svg"
                    />
                  </button>
                  <button 
                    onClick={() => navigate(isSignedIn ? '/wishlist' : '/sign-in')} 
                    className="cursor-pointer"
                    style={{ height: '21px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(2px)' }}
                  >
                    <img
                      alt="Wishlist"
                      width="18"
                      height="18"
                      src="/assets/wishlist-heart.svg"
                    />
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>

            {/* Text in the middle */}
            <p className="text-sm" style={{ fontFamily: '"Futura PT Book"', transform: 'translateY(1px)' }}>
              {showMobileMenu ? (
                <>
                  <span 
                    style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }}
                    onClick={() => navigate('/build-a-wig')}
                  >
                    HOME &gt;
                  </span>{' '}
                  <span
                    style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
                  >
                    MENU
                  </span>
                </>
              ) : (
                <>
                  <span 
                    style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }}
                    onClick={() => navigate('/account')}
                  >
                    ACCOUNT &gt;
                  </span>{' '}
                  <span
                    style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
                  >
                    GIFT CARD
                  </span>
                </>
              )}
            </p>

            {/* Right side icons */}
            <div className="gap-5 flex absolute" style={{ right: '17px' }}>
              <div>
                <DynamicCartIcon count={cartCount} width={22} height={19} />
              </div>
              <svg
                width="17"
                height="18"
                viewBox="0 0 16 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="cursor-pointer"
                onClick={handleMobileMenuToggle}
                style={{ marginTop: '2px' }}
              >
                <path d="M0 0H15.75V0.7H7.875H0V0ZM5.25 6.7H10.5H15.375V7.4H10.5H5.25V6.7ZM0 13.1H15.75V13.8H0V13.1Z" fill="black"/>
              </svg>
            </div>
          </div>

          {/* CONTENT */}
          <div
            className="flex flex-col pb-4 mb-2 w-full"
            style={{ 
              minWidth: '100%', 
              maxWidth: 'none', 
              overflow: 'visible',
              minHeight: showMobileMenu ? '560px' : 'auto'
            }}
          >
            {showMobileMenu ? (
              /* MENU CONTENT - Same as other account pages */
              <div
                className="border border-black flex flex-col pt-6 pb-4 px-5 bg-white/60 backdrop-blur-sm w-full"
                style={{ 
                  borderWidth: '1.3px', 
                  minWidth: '100%', 
                  maxWidth: 'none', 
                  overflow: 'visible',
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  minHeight: '560px'
                }}
              >
                {/* Mobile menu content - same structure as account page */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', paddingTop: '20px', height: '490px', position: 'relative' }}>
                  {/* Navigation Links */}
                  <div className="flex justify-center gap-8" style={{ marginBottom: '30px' }}>
                    <button
                      onClick={() => handleMobileMenuTabClick('SHOP')}
                      style={{ 
                        fontFamily: mobileMenuActiveTab === 'SHOP' ? '"Futura PT Medium"' : '"Futura PT Book"',
                        fontSize: '14px',
                        color: mobileMenuActiveTab === 'SHOP' ? '#EB1C24' : 'black',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        borderBottom: mobileMenuActiveTab === 'SHOP' ? '2px solid #EB1C24' : 'none',
                        borderTop: 'none',
                        borderLeft: 'none',
                        borderRight: 'none',
                        paddingBottom: '4px',
                        background: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      SHOP
                    </button>
                    <button
                      onClick={() => handleMobileMenuTabClick('TOOLS')}
                      style={{ 
                        fontFamily: mobileMenuActiveTab === 'TOOLS' ? '"Futura PT Medium"' : '"Futura PT Book"',
                        fontSize: '14px',
                        color: mobileMenuActiveTab === 'TOOLS' ? '#EB1C24' : 'black',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        borderBottom: mobileMenuActiveTab === 'TOOLS' ? '2px solid #EB1C24' : 'none',
                        borderTop: 'none',
                        borderLeft: 'none',
                        borderRight: 'none',
                        paddingBottom: '4px',
                        background: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      TOOLS
                    </button>
                    <button
                      onClick={() => handleMobileMenuTabClick('BRAND')}
                      style={{ 
                        fontFamily: mobileMenuActiveTab === 'BRAND' ? '"Futura PT Medium"' : '"Futura PT Book"',
                        fontSize: '14px',
                        color: mobileMenuActiveTab === 'BRAND' ? '#EB1C24' : 'black',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        borderBottom: mobileMenuActiveTab === 'BRAND' ? '2px solid #EB1C24' : 'none',
                        borderTop: 'none',
                        borderLeft: 'none',
                        borderRight: 'none',
                        paddingBottom: '4px',
                        background: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      BRAND
                    </button>
                  </div>
                  {/* Menu items would go here - simplified for now */}
                  <div className="flex justify-center" style={{ marginBottom: '20px', marginTop: 'auto' }}>
                    <span 
                      onClick={handleMobileMenuSignInToggle}
                      style={{ 
                        fontFamily: '"Futura PT Medium"',
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
                </div>
              </div>
            ) : (
              /* MAIN CONTENT */
              <div
                className="border border-black bg-white/60 backdrop-blur-sm w-full"
                style={{
                  borderWidth: '1.3px',
                  padding: '40px 20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  maxWidth: '600px',
                  margin: '0 auto'
                }}
              >
                {/* Back to Account Link */}
                <p
                  onClick={() => navigate('/account')}
                  style={{
                    fontFamily: '"Futura PT Book"',
                    fontSize: '11px',
                    color: '#000000',
                    margin: '0 0 30px 0',
                    cursor: 'pointer',
                    textTransform: 'uppercase'
                  }}
                >
                  &lt; BACK TO ACCOUNT
                </p>

                {/* Title */}
                <h1
                  style={{
                    fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                    fontSize: '32px',
                    color: '#000000',
                    margin: '0 0 8px 0',
                    textAlign: 'center',
                    fontWeight: '400'
                  }}
                >
                  GIFT CARD
                </h1>

                {/* Subtitle */}
                <p
                  style={{
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '12px',
                    color: '#EB1C24',
                    margin: '0 0 30px 0',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    fontWeight: '500'
                  }}
                >
                  ADD FUNDS TO YOUR ACCOUNT
                </p>

                {/* Gift Card Image */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                  <img
                    src="/assets/gift-card.png"
                    alt="Gift Card"
                    style={{
                      width: '100%',
                      maxWidth: '400px',
                      height: 'auto',
                      borderRadius: '8px',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </div>

                {/* Current Balance */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                  <p
                    style={{
                      fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                      fontSize: '18px',
                      color: '#000000',
                      margin: '0 0 8px 0',
                      fontWeight: '400'
                    }}
                  >
                    CURRENT BALANCE:
                  </p>
                  <p
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '20px',
                      color: '#EB1C24',
                      margin: '0',
                      fontWeight: '500'
                    }}
                  >
                    {formatPrice(userData?.giftCardBalance || 0)}
                  </p>
                </div>

                {/* Barcode Input Section */}
                <div style={{ marginBottom: '30px' }}>
                  <p
                    style={{
                      fontFamily: '"Futura PT Book"',
                      fontSize: '11px',
                      color: '#000000',
                      margin: '0 0 12px 0',
                      textTransform: 'uppercase',
                      fontWeight: '500'
                    }}
                  >
                    ENTER BARCODE(S)
                  </p>
                  {barcodes.map((barcode, index) => (
                    <input
                      key={index}
                      type="text"
                      value={barcode}
                      onChange={(e) => handleBarcodeChange(index, e.target.value)}
                      placeholder=""
                      style={{
                        width: '100%',
                        padding: '12px',
                        marginBottom: '12px',
                        border: '1.3px solid #000000',
                        backgroundColor: '#FFFFFF',
                        fontFamily: '"Futura PT Book"',
                        fontSize: '12px',
                        color: '#000000',
                        boxSizing: 'border-box'
                      }}
                    />
                  ))}
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: '#EB1C24',
                    color: '#FFFFFF',
                    border: '1.3px solid #000000',
                    fontFamily: '"Futura PT Medium"',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#d0161e';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#EB1C24';
                  }}
                >
                  SUBMIT CODE
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadCardPage;

