import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import ConfirmationModal from '../../../components/ConfirmationModal';

function ConciergePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('cartCount') || '0', 10);
    } catch (e) {
      return 0;
    }
  });
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileMenuActiveTab, setMobileMenuActiveTab] = useState('SHOP');
  const [mobileMenuExpandedItems, setMobileMenuExpandedItems] = useState<string[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('isSignedIn') === 'true';
      } catch (e) {
        return false;
      }
    }
    return false;
  });

  // Priority message state
  const [priorityMessage, setPriorityMessage] = useState('');
  const [specialRequest, setSpecialRequest] = useState('');
  const [orderChangeRequest, setOrderChangeRequest] = useState('');
  const [bookingRequest, setBookingRequest] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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

  // Update active tab based on current route
  useEffect(() => {
    const pathname = location.pathname;
    if (pathname.includes('/tools') || pathname === '/tools/gift-card') {
      setMobileMenuActiveTab('TOOLS');
    } else if (pathname.includes('/brand') || pathname.includes('/about') || pathname.includes('/contact') || pathname.includes('/faq') || pathname.includes('/reviews') || pathname.includes('/terms')) {
      setMobileMenuActiveTab('BRAND');
    } else {
      setMobileMenuActiveTab('SHOP');
    }
  }, [location.pathname]);

  const handleMobileMenuToggle = () => {
    setShowMobileMenu(!showMobileMenu);
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
    if (isSignedIn) {
      setIsSignedIn(false);
      localStorage.setItem('isSignedIn', 'false');
      localStorage.removeItem('currentUser');
      window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'false' }));
      setShowMobileMenu(false);
      navigate('/sign-in');
    } else {
      navigate('/sign-in');
    }
  };

  const handleSubmitPriorityMessage = () => {
    if (!priorityMessage.trim()) {
      return;
    }
    
    // Save to localStorage for admin dashboard
    try {
      const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const messages = JSON.parse(localStorage.getItem('adminPriorityMessages') || '[]');
      const newMessage = {
        id: Date.now().toString(),
        userId: userData.email || 'unknown',
        userName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Unknown User',
        message: priorityMessage,
        type: 'priority',
        timestamp: new Date().toISOString(),
        status: 'new'
      };
      messages.unshift(newMessage);
      localStorage.setItem('adminPriorityMessages', JSON.stringify(messages));
      
      setPriorityMessage('');
      setSuccessMessage('PRIORITY MESSAGE SUBMITTED SUCCESSFULLY');
      setShowSuccessModal(true);
    } catch (e) {
      console.error('Error saving priority message:', e);
    }
  };

  const handleSubmitSpecialRequest = () => {
    if (!specialRequest.trim()) {
      return;
    }
    
    try {
      const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const requests = JSON.parse(localStorage.getItem('adminSpecialRequests') || '[]');
      const newRequest = {
        id: Date.now().toString(),
        userId: userData.email || 'unknown',
        userName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Unknown User',
        request: specialRequest,
        type: 'special_request',
        timestamp: new Date().toISOString(),
        status: 'new'
      };
      requests.unshift(newRequest);
      localStorage.setItem('adminSpecialRequests', JSON.stringify(requests));
      
      setSpecialRequest('');
      setSuccessMessage('SPECIAL REQUEST SUBMITTED SUCCESSFULLY');
      setShowSuccessModal(true);
    } catch (e) {
      console.error('Error saving special request:', e);
    }
  };

  const handleSubmitOrderChange = () => {
    if (!orderChangeRequest.trim()) {
      return;
    }
    
    try {
      const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const requests = JSON.parse(localStorage.getItem('adminOrderChanges') || '[]');
      const newRequest = {
        id: Date.now().toString(),
        userId: userData.email || 'unknown',
        userName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Unknown User',
        request: orderChangeRequest,
        type: 'order_change',
        timestamp: new Date().toISOString(),
        status: 'new'
      };
      requests.unshift(newRequest);
      localStorage.setItem('adminOrderChanges', JSON.stringify(requests));
      
      setOrderChangeRequest('');
      setSuccessMessage('ORDER CHANGE REQUEST SUBMITTED SUCCESSFULLY');
      setShowSuccessModal(true);
    } catch (e) {
      console.error('Error saving order change request:', e);
    }
  };

  const handleSubmitBookingRequest = () => {
    if (!bookingRequest.trim()) {
      return;
    }
    
    try {
      const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const bookings = JSON.parse(localStorage.getItem('adminPriorityBookings') || '[]');
      const newBooking = {
        id: Date.now().toString(),
        userId: userData.email || 'unknown',
        userName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Unknown User',
        request: bookingRequest,
        type: 'priority_booking',
        timestamp: new Date().toISOString(),
        status: 'new'
      };
      bookings.unshift(newBooking);
      localStorage.setItem('adminPriorityBookings', JSON.stringify(bookings));
      
      setBookingRequest('');
      setSuccessMessage('PRIORITY BOOKING REQUEST SUBMITTED SUCCESSFULLY');
      setShowSuccessModal(true);
    } catch (e) {
      console.error('Error saving booking request:', e);
    }
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
                      src={typeof window !== 'undefined' && localStorage.getItem('isSignedIn') === 'true' ? '/assets/wishlist-account.svg' : '/assets/wishlist-heart.svg'}
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
                    CONCIERGE
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
              /* MENU CONTENT - Same as account page */
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
                {/* Menu content would go here - same as account page */}
              </div>
            ) : (
              /* CONCIERGE CONTENT */
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Priority Messages Section */}
                <div
                  className="border border-black bg-white/60 backdrop-blur-sm w-full"
                  style={{
                    borderWidth: '1.3px',
                    padding: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)'
                  }}
                >
                  <h2
                    style={{
                      fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                      color: '#000000',
                      fontSize: '22px',
                      margin: '0 0 12px 0',
                      textTransform: 'uppercase'
                    }}
                  >
                    PRIORITY MESSAGES
                  </h2>
                  <p
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      color: '#EB1C24',
                      fontSize: '10px',
                      margin: '0 0 16px 0',
                      textTransform: 'uppercase',
                      fontWeight: '500'
                    }}
                  >
                    SEND PRIORITY MESSAGES TO ADMIN
                  </p>
                  <textarea
                    value={priorityMessage}
                    onChange={(e) => setPriorityMessage(e.target.value)}
                    placeholder="Type your priority message here..."
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1.3px solid #000000',
                      fontFamily: '"Futura PT Book"',
                      fontSize: '11px',
                      resize: 'vertical',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    onClick={handleSubmitPriorityMessage}
                    disabled={!priorityMessage.trim()}
                    className="border border-black font-futura w-full text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50 mt-4"
                    style={{
                      borderWidth: '1.3px',
                      color: priorityMessage.trim() ? '#EB1C24' : '#909090',
                      fontFamily: '"Futura PT Medium"',
                      backgroundColor: '#FFFFFF',
                      textTransform: 'uppercase',
                      cursor: priorityMessage.trim() ? 'pointer' : 'not-allowed',
                      opacity: priorityMessage.trim() ? 1 : 0.6
                    }}
                    type="button"
                  >
                    SUBMIT MESSAGE
                  </button>
                </div>

                {/* Special Requests / Order Changes Section */}
                <div
                  className="border border-black bg-white/60 backdrop-blur-sm w-full"
                  style={{
                    borderWidth: '1.3px',
                    padding: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)'
                  }}
                >
                  <h2
                    style={{
                      fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                      color: '#000000',
                      fontSize: '22px',
                      margin: '0 0 12px 0',
                      textTransform: 'uppercase'
                    }}
                  >
                    SPECIAL REQUESTS
                  </h2>
                  <p
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      color: '#EB1C24',
                      fontSize: '10px',
                      margin: '0 0 16px 0',
                      textTransform: 'uppercase',
                      fontWeight: '500'
                    }}
                  >
                    SUBMIT SPECIAL REQUESTS OR ORDER CHANGES
                  </p>
                  <textarea
                    value={specialRequest}
                    onChange={(e) => setSpecialRequest(e.target.value)}
                    placeholder="Describe your special request..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1.3px solid #000000',
                      fontFamily: '"Futura PT Book"',
                      fontSize: '11px',
                      resize: 'vertical',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                      marginBottom: '16px'
                    }}
                  />
                  <textarea
                    value={orderChangeRequest}
                    onChange={(e) => setOrderChangeRequest(e.target.value)}
                    placeholder="Describe your order change request..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1.3px solid #000000',
                      fontFamily: '"Futura PT Book"',
                      fontSize: '11px',
                      resize: 'vertical',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                    <button
                      onClick={handleSubmitSpecialRequest}
                      disabled={!specialRequest.trim()}
                      className="border border-black font-futura flex-1 text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                      style={{
                        borderWidth: '1.3px',
                        color: specialRequest.trim() ? '#EB1C24' : '#909090',
                        fontFamily: '"Futura PT Medium"',
                        backgroundColor: '#FFFFFF',
                        textTransform: 'uppercase',
                        cursor: specialRequest.trim() ? 'pointer' : 'not-allowed',
                        opacity: specialRequest.trim() ? 1 : 0.6
                      }}
                      type="button"
                    >
                      SUBMIT REQUEST
                    </button>
                    <button
                      onClick={handleSubmitOrderChange}
                      disabled={!orderChangeRequest.trim()}
                      className="border border-black font-futura flex-1 text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                      style={{
                        borderWidth: '1.3px',
                        color: orderChangeRequest.trim() ? '#EB1C24' : '#909090',
                        fontFamily: '"Futura PT Medium"',
                        backgroundColor: '#FFFFFF',
                        textTransform: 'uppercase',
                        cursor: orderChangeRequest.trim() ? 'pointer' : 'not-allowed',
                        opacity: orderChangeRequest.trim() ? 1 : 0.6
                      }}
                      type="button"
                    >
                      SUBMIT CHANGE
                    </button>
                  </div>
                </div>

                {/* Priority Booking Section */}
                <div
                  className="border border-black bg-white/60 backdrop-blur-sm w-full"
                  style={{
                    borderWidth: '1.3px',
                    padding: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)'
                  }}
                >
                  <h2
                    style={{
                      fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                      color: '#000000',
                      fontSize: '22px',
                      margin: '0 0 12px 0',
                      textTransform: 'uppercase'
                    }}
                  >
                    PRIORITY BOOKING
                  </h2>
                  <p
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      color: '#EB1C24',
                      fontSize: '10px',
                      margin: '0 0 16px 0',
                      textTransform: 'uppercase',
                      fontWeight: '500'
                    }}
                  >
                    REQUEST PRIORITY BOOKING APPOINTMENT
                  </p>
                  <textarea
                    value={bookingRequest}
                    onChange={(e) => setBookingRequest(e.target.value)}
                    placeholder="Describe your booking request, preferred dates, and any special requirements..."
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1.3px solid #000000',
                      fontFamily: '"Futura PT Book"',
                      fontSize: '11px',
                      resize: 'vertical',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    onClick={handleSubmitBookingRequest}
                    disabled={!bookingRequest.trim()}
                    className="border border-black font-futura w-full text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50 mt-4"
                    style={{
                      borderWidth: '1.3px',
                      color: bookingRequest.trim() ? '#EB1C24' : '#909090',
                      fontFamily: '"Futura PT Medium"',
                      backgroundColor: '#FFFFFF',
                      textTransform: 'uppercase',
                      cursor: bookingRequest.trim() ? 'pointer' : 'not-allowed',
                      opacity: bookingRequest.trim() ? 1 : 0.6
                    }}
                    type="button"
                  >
                    SUBMIT BOOKING REQUEST
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <ConfirmationModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={() => setShowSuccessModal(false)}
        title="SUCCESS"
        message={successMessage}
        confirmText="OK"
        cancelText=""
        messageTextTransform="uppercase"
      />
    </div>
  );
}

export default ConciergePage;

