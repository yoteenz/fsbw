import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import ConfirmationModal from '../../../components/ConfirmationModal';

function OrderFormPage() {
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
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [fieldToFocus, setFieldToFocus] = useState<string | null>(null);
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const [authorizedPurchase, setAuthorizedPurchase] = useState(false);
  const [billingShippingMatch, setBillingShippingMatch] = useState(false);
  const [bySigningAgreement, setBySigningAgreement] = useState(false);
  const [photoIdFile, setPhotoIdFile] = useState<File | null>(null);
  const [lastFourDigitsFile, setLastFourDigitsFile] = useState<File | null>(null);
  const [photoIdPreview, setPhotoIdPreview] = useState<string | null>(null);
  const [lastFourDigitsPreview, setLastFourDigitsPreview] = useState<string | null>(null);
  const [addressDifferenceReason, setAddressDifferenceReason] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const photoIdInputRef = useRef<HTMLInputElement>(null);
  const lastFourDigitsInputRef = useRef<HTMLInputElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Refs for input fields
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const orderNumberRef = useRef<HTMLInputElement>(null);
  const orderDateRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const stateRef = useRef<HTMLInputElement>(null);
  const zipRef = useRef<HTMLInputElement>(null);
  const countryRef = useRef<HTMLInputElement>(null);
  const billingAddressRef = useRef<HTMLInputElement>(null);
  const billingCityRef = useRef<HTMLInputElement>(null);
  const billingStateRef = useRef<HTMLInputElement>(null);
  const billingZipRef = useRef<HTMLInputElement>(null);
  const billingCountryRef = useRef<HTMLInputElement>(null);
  const cardholderNameRef = useRef<HTMLInputElement>(null);
  const cardNumberRef = useRef<HTMLInputElement>(null);
  const expirationDateRef = useRef<HTMLInputElement>(null);
  const cvvRef = useRef<HTMLInputElement>(null);

  // Form state - initialize with data from location.state if available
  const [formData, setFormData] = useState(() => {
    const stateData = location.state as any;
    return {
      orderNumber: stateData?.orderNumber || '',
      orderDate: stateData?.orderDate || '',
      firstName: stateData?.firstName || '',
      lastName: stateData?.lastName || '',
      email: stateData?.email || '',
      phone: '',
      address: stateData?.shippingAddress || '',
      city: stateData?.city || '',
      state: stateData?.state || '',
      zip: stateData?.zip || '',
      country: stateData?.country || '',
      billingAddress: '',
      billingCity: '',
      billingState: '',
      billingZip: '',
      billingCountry: '',
      cardholderName: '',
      cardNumber: '',
      cardLastFour: '',
      cardType: '',
      expirationDate: '',
      cvv: ''
    };
  });

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

  // Check sign-in status on mount and listen for changes
  useEffect(() => {
    const checkSignInStatus = () => {
      try {
        const signedIn = localStorage.getItem('isSignedIn') === 'true';
        setIsSignedIn(prev => {
          // Only update if value has changed to prevent unnecessary re-renders
          if (prev !== signedIn) {
            return signedIn;
          }
          return prev;
        });
      } catch (e) {
        setIsSignedIn(prev => {
          if (prev !== false) {
            return false;
          }
          return prev;
        });
      }
    };

    // Skip initial check since useState already reads from localStorage
    // Only set up listeners for future changes

    const handleStorageChange = () => {
      checkSignInStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    window.addEventListener('signInStateChanged', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
      window.removeEventListener('signInStateChanged', handleStorageChange as EventListener);
    };
  }, []);

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
      setShowSignOutConfirm(true);
    } else {
      navigate('/sign-in');
    }
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    localStorage.setItem('isSignedIn', 'false');
    localStorage.removeItem('currentUser');
    window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'false' }));
    setShowSignOutConfirm(false);
    setShowMobileMenu(false);
  };

  // Format order date as MM/DD/YYYY
  const formatOrderDate = (value: string): string => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // Limit to 8 digits (MMDDYYYY)
    const limited = numbers.slice(0, 8);
    
    // Format as MM/DD/YYYY
    if (limited.length === 0) {
      return '--/--/----';
    } else if (limited.length <= 2) {
      return limited + '/--/----';
    } else if (limited.length <= 4) {
      return `${limited.slice(0, 2)}/${limited.slice(2)}/----`;
    } else {
      return `${limited.slice(0, 2)}/${limited.slice(2, 4)}/${limited.slice(4)}`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Remove from invalidFields when field is filled
    if (value.trim()) {
      setInvalidFields(prev => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
    }
  };

  const handleOrderDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // If user is deleting and we're at the mask or empty, clear it
    if (value === '--/--/----' || value === '') {
      setFormData(prev => ({
        ...prev,
        orderDate: ''
      }));
      return;
    }
    const formatted = formatOrderDate(value);
    setFormData(prev => ({
      ...prev,
      orderDate: formatted
    }));
  };

  const handlePhotoIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoIdFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setPhotoIdPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLastFourDigitsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLastFourDigitsFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setLastFourDigitsPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Signature canvas handlers
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    const coords = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.strokeStyle = '#EB1C24';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Initialize canvas
  useEffect(() => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 150;
    
    // Set drawing style
    ctx.strokeStyle = '#EB1C24';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const isSignatureEmpty = (): boolean => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return true;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return true;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Check if all pixels are transparent (no drawing)
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] !== 0) { // Alpha channel - if any pixel is not transparent, signature exists
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate fields in sequence
    if (!formData.firstName.trim()) {
      setValidationMessage('FIRST NAME IS REQUIRED.');
      setFieldToFocus('firstName');
      setInvalidFields(prev => new Set(prev).add('firstName'));
      setShowValidationModal(true);
      return;
    }
    if (!formData.lastName.trim()) {
      setValidationMessage('LAST NAME IS REQUIRED.');
      setFieldToFocus('lastName');
      setInvalidFields(prev => new Set(prev).add('lastName'));
      setShowValidationModal(true);
      return;
    }
    if (!formData.orderNumber.trim()) {
      setValidationMessage('ORDER NUMBER IS REQUIRED.');
      setFieldToFocus('orderNumber');
      setInvalidFields(prev => new Set(prev).add('orderNumber'));
      setShowValidationModal(true);
      return;
    }
    if (!formData.orderDate.trim() || formData.orderDate === '--/--/----') {
      setValidationMessage('ORDER DATE IS REQUIRED.');
      setFieldToFocus('orderDate');
      setInvalidFields(prev => new Set(prev).add('orderDate'));
      setShowValidationModal(true);
      return;
    }
    if (!formData.email.trim()) {
      setValidationMessage('CONFIRMATION EMAIL IS REQUIRED.');
      setFieldToFocus('email');
      setInvalidFields(prev => new Set(prev).add('email'));
      setShowValidationModal(true);
      return;
    }
    if (!formData.phone.trim()) {
      setValidationMessage('PHONE NUMBER IS REQUIRED.');
      setFieldToFocus('phone');
      setInvalidFields(prev => new Set(prev).add('phone'));
      setShowValidationModal(true);
      return;
    }
    if (!formData.address.trim()) {
      setValidationMessage('ADDRESS IS REQUIRED.');
      setFieldToFocus('address');
      setInvalidFields(prev => new Set(prev).add('address'));
      setShowValidationModal(true);
      return;
    }
    if (!formData.city.trim()) {
      setValidationMessage('CITY IS REQUIRED.');
      setFieldToFocus('city');
      setInvalidFields(prev => new Set(prev).add('city'));
      setShowValidationModal(true);
      return;
    }
    if (!formData.state.trim()) {
      setValidationMessage('STATE IS REQUIRED.');
      setFieldToFocus('state');
      setInvalidFields(prev => new Set(prev).add('state'));
      setShowValidationModal(true);
      return;
    }
    if (!formData.zip.trim()) {
      setValidationMessage('ZIP CODE IS REQUIRED.');
      setFieldToFocus('zip');
      setInvalidFields(prev => new Set(prev).add('zip'));
      setShowValidationModal(true);
      return;
    }
    if (!formData.country.trim()) {
      setValidationMessage('COUNTRY IS REQUIRED.');
      setFieldToFocus('country');
      setInvalidFields(prev => new Set(prev).add('country'));
      setShowValidationModal(true);
      return;
    }
    if (!formData.billingAddress.trim()) {
      setValidationMessage('BILLING ADDRESS IS REQUIRED.');
      setFieldToFocus('billingAddress');
      setInvalidFields(prev => new Set(prev).add('billingAddress'));
      setShowValidationModal(true);
      return;
    }
    if (!formData.billingCity.trim()) {
      setValidationMessage('BILLING CITY IS REQUIRED.');
      setFieldToFocus('billingCity');
      setInvalidFields(prev => new Set(prev).add('billingCity'));
      setShowValidationModal(true);
      return;
    }
    if (!formData.billingState.trim()) {
      setValidationMessage('BILLING STATE IS REQUIRED.');
      setFieldToFocus('billingState');
      setInvalidFields(prev => new Set(prev).add('billingState'));
      setShowValidationModal(true);
      return;
    }
    if (!formData.billingZip.trim()) {
      setValidationMessage('BILLING ZIP CODE IS REQUIRED.');
      setFieldToFocus('billingZip');
      setInvalidFields(prev => new Set(prev).add('billingZip'));
      setShowValidationModal(true);
      return;
    }
    if (!formData.billingCountry.trim()) {
      setValidationMessage('BILLING COUNTRY IS REQUIRED.');
      setFieldToFocus('billingCountry');
      setInvalidFields(prev => new Set(prev).add('billingCountry'));
      setShowValidationModal(true);
      return;
    }
    if (!formData.cardholderName.trim()) {
      setValidationMessage('CARDHOLDER NAME IS REQUIRED.');
      setFieldToFocus('cardholderName');
      setInvalidFields(prev => new Set(prev).add('cardholderName'));
      setShowValidationModal(true);
      return;
    }
    if (!formData.cardNumber.trim()) {
      setValidationMessage('CARD NUMBER IS REQUIRED.');
      setFieldToFocus('cardNumber');
      setInvalidFields(prev => new Set(prev).add('cardNumber'));
      setShowValidationModal(true);
      return;
    }
    if (!formData.expirationDate.trim()) {
      setValidationMessage('EXPIRATION DATE IS REQUIRED.');
      setFieldToFocus('expirationDate');
      setInvalidFields(prev => new Set(prev).add('expirationDate'));
      setShowValidationModal(true);
      return;
    }
    if (!formData.cvv.trim()) {
      setValidationMessage('CVV IS REQUIRED.');
      setFieldToFocus('cvv');
      setInvalidFields(prev => new Set(prev).add('cvv'));
      setShowValidationModal(true);
      return;
    }
    
    // Validate required checkboxes
    if (!authorizedPurchase) {
      setValidationMessage('PLEASE CONFIRM THAT YOU HAVE AUTHORIZED THIS PURCHASE ON THE DATE LISTED ABOVE.');
      setShowValidationModal(true);
      return;
    }
    if (!billingShippingMatch) {
      setValidationMessage('PLEASE CONFIRM THAT THE BILLING/SHIPPING ADDRESS BELONGS TO THE CARDHOLDER.');
      setShowValidationModal(true);
      return;
    }
    if (!bySigningAgreement) {
      setValidationMessage('PLEASE CONFIRM THE AGREEMENT BY CHECKING THE "BY SIGNING" CHECKBOX.');
      setShowValidationModal(true);
      return;
    }
    
    // Validate required photo ID file
    if (!photoIdFile) {
      setValidationMessage('PLEASE UPLOAD A PHOTO ID SHOWING THE CARDHOLDER NAME/ADDRESS.');
      setShowValidationModal(true);
      return;
    }
    
    // Validate signature
    if (isSignatureEmpty()) {
      setValidationMessage('PLEASE SIGN THE FORM TO CONFIRM YOUR ORDER.');
      setShowValidationModal(true);
      return;
    }
    
    // Handle form submission here
    console.log('Form submitted:', formData, { photoIdFile, lastFourDigitsFile });
    // You can add navigation or success message here
  };

  return (
    <>
      <style>{`
        input::placeholder,
        textarea::placeholder {
          font-family: "Futura PT Demi", "Futura PT", Futura, Inter, sans-serif !important;
          font-weight: 500;
          color: #909090 !important;
        }
        input,
        textarea {
          font-family: "Futura PT Demi", "Futura PT", Futura, Inter, sans-serif !important;
          font-weight: 500 !important;
          color: #909090 !important;
          text-transform: uppercase !important;
          background-color: #FFFFFF !important;
        }
        input:focus,
        textarea:focus {
          outline: none !important;
          box-shadow: none !important;
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #FFFFFF inset !important;
          -webkit-text-fill-color: #909090 !important;
          box-shadow: 0 0 0 30px #FFFFFF inset !important;
          background-color: #FFFFFF !important;
        }
      `}</style>
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
                  <button className="cursor-pointer" style={{ transform: 'translateX(-2px)' }}>
                    <img
                      alt="Search icon"
                      width="16"
                      height="15"
                      src="/assets/search-icon.svg"
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
                    onClick={() => navigate('/products')}
                  >
                    SHOP &gt;
                  </span>{' '}
                  <span
                    style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
                  >
                    ORDER FORM
                  </span>
                </>
              )}
            </p>

            {/* Right side icons */}
            <div className="gap-5 flex absolute" style={{ right: '17px' }}>
              <div>
                <DynamicCartIcon count={cartCount} width={22} height={19} />
              </div>
              <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
          </div>

          {/* MAIN CARD */}
          <div
            className="border border-black flex flex-col pt-6 pb-4 px-5 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out"
            style={{ 
              borderWidth: '1.3px', 
              minWidth: '100%', 
              maxWidth: 'none', 
              overflow: 'visible',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              minHeight: showMobileMenu ? '560px' : 'auto'
            }}
          >
            {showMobileMenu ? (
              /* MENU CONTENT */
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

                {/* Menu Items */}
                <div style={{ flex: '1', overflowY: 'auto', marginBottom: '20px', minHeight: '0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                    {mobileMenuActiveTab === 'TOOLS' ? (
                      ['GIFT CARD'].map((item, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => navigate('/tools/gift-card')}
                        >
                          <span style={{ 
                            fontFamily: '"Futura PT Book"',
                            fontSize: '14px',
                            color: 'black',
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            transform: 'translateX(7px)'
                          }}>
                            {item}
                          </span>
                        </div>
                      ))
                    ) : mobileMenuActiveTab === 'BRAND' ? (
                      ['ABOUT US', 'CONTACT', 'CARE & STORAGE', 'BECOME A MEMBER', 'FAQ', 'PAYMENT + SHIPPING', 'REVIEWS', 'TERMS OF SERVICE'].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span style={{ 
                            fontFamily: '"Futura PT Book"',
                            fontSize: '14px',
                            color: 'black',
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            transform: 'translateX(7px)'
                          }}>
                            {item}
                          </span>
                        </div>
                      ))
                    ) : (
                      [
                        { label: 'UNITS', hasArrow: true, isExpandable: true, subItems: ['STRAIGHT', 'WAVY', 'CURLY'] },
                        { label: 'BOOKING', hasArrow: true, isExpandable: true, subItems: ['APPOINTMENT', 'CONSULTATION'] },
                        { label: 'BUILD-A-WIG', hasArrow: false },
                        { label: 'ORDER AUTHORIZATION FORM', hasArrow: false }
                      ].map((item, index) => (
                        <div key={index}>
                          <div 
                            className="flex items-center justify-between"
                            style={{ alignItems: 'center' }}
                          >
                            <span 
                              style={{ 
                                fontFamily: '"Futura PT Book"',
                                fontSize: '14px',
                                color: 'black',
                                fontWeight: '500',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                transform: 'translateX(7px)'
                              }}
                              onClick={() => {
                                if (item.isExpandable) {
                                  if (item.label === 'UNITS' && mobileMenuExpandedItems.includes(item.label)) {
                                    navigate('/shop/units');
                                  } else {
                                    handleMobileMenuItemToggle(item.label);
                                  }
                                } else if (item.label === 'ORDER AUTHORIZATION FORM') {
                                  navigate('/shop/order-form');
                                }
                              }}
                            >
                              {item.label}
                            </span>
                            {item.hasArrow && (
                              <img
                                src="/assets/NOIR/closed-arrow.svg"
                                alt="Arrow"
                                style={{ 
                                  width: '16px', 
                                  height: '16px',
                                  transform: `${mobileMenuExpandedItems.includes(item.label) ? 'translateX(-5px) translateY(-4px) rotate(90deg)' : 'translateX(-5px) translateY(-4px) rotate(0deg)'}`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  cursor: 'pointer'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (item.isExpandable) {
                                    handleMobileMenuItemToggle(item.label);
                                  }
                                }}
                              />
                            )}
                          </div>
                          {item.isExpandable && mobileMenuExpandedItems.includes(item.label) && item.subItems && (
                            <div className="ml-4 mt-2 space-y-2">
                              {item.subItems.map((subItem, subIndex) => (
                                <div 
                                  key={subIndex} 
                                  className="flex items-center cursor-pointer"
                                  onClick={() => {
                                    if (subItem === 'STRAIGHT') {
                                      navigate('/units/straight');
                                    } else if (subItem === 'WAVY') {
                                      navigate('/units/wavy');
                                    } else if (subItem === 'CURLY') {
                                      navigate('/units/curly');
                                    }
                                  }}
                                >
                                  <span style={{ 
                                    fontFamily: '"Futura PT Book"',
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

                {/* Social Media Icons */}
                <div className="flex justify-center" style={{ marginBottom: '0' }}>
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
            ) : (
              /* ORDER FORM CONTENT */
              <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* ORDER AUTHORIZATION FORM HEADER */}
                <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '-1px', marginTop: '-12px' }}>
                  <h2
                    style={{ 
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '12px',
                      color: '#EB1C24',
                      margin: '0',
                      textTransform: 'uppercase',
                      fontWeight: '500'
                    }}
                  >
                    ORDER AUTHORIZATION FORM
                  </h2>
                </div>

                {/* Paragraph 1 */}
                <p
                  style={{
                    fontFamily: '"Futura PT Book"',
                    fontSize: '12px',
                    color: '#000000',
                    lineHeight: '1.8',
                    margin: '18px 0 20px 0',
                    textAlign: 'center',
                    maxWidth: 'calc(100% - 24px)',
                    marginLeft: 'auto',
                    marginRight: 'auto'
                  }}
                >
                  THIS FORM SERVES AS PROTECTION AGAINST FRAUD, CHARGEBACKS & AS AN AUTHORIZATION OF PURCHASE FROM THE CLIENT TO FRONTAL SLAYER. THIS FORM MUST BE COMPLETED AFTER PURCHASING HAIR RELATED PRODUCTS TO ENSURE A SMOOTH PROCESS & TO AVOID CANCELLATIONS OR DELAYS. ALL PROVIDED INFORMATION MUST MATCH YOUR ORDER DETAILS.
                </p>

                {/* Paragraph 2 */}
                <p
                  style={{
                    fontFamily: '"Futura PT Book"',
                    fontSize: '12px',
                    color: '#000000',
                    lineHeight: '1.8',
                    margin: '0 0 20px 0',
                    textAlign: 'center',
                    maxWidth: 'calc(100% - 26px)',
                    marginLeft: 'auto',
                    marginRight: 'auto'
                  }}
                >
                  YOUR ORDER WILL NOT BE PROCESSED OR SHIPPED UNTIL THIS FORM IS COMPLETED & SUBMITTED. IF THIS FORM IS NOT FILLED OUT WITHIN 24 HOURS OF PURCHASE, YOUR ORDER WILL BE REFUNDED & CANCELLED. IF YOU HAVE ANY INQUIRIES, SUGGESTIONS OR CONCERNS PLEASE REACH OUT TO <span style={{ color: '#EB1C24', fontWeight: '600' }}>CONTACT@FRONTALSLAYER.COM</span>
                </p>

                {/* Paragraph 3 */}
                <p
                  style={{
                    fontFamily: '"Futura PT Book"',
                    fontSize: '12px',
                    color: '#000000',
                    lineHeight: '1.8',
                    margin: '0 0 30px 0',
                    textAlign: 'center',
                    maxWidth: 'calc(100% - 26px)',
                    marginLeft: 'auto',
                    marginRight: 'auto'
                  }}
                >
                  THIS DOCUMENT WILL BE RECORDED & A COPY WILL BE SENT TO YOU UPON REQUEST. AS ALWAYS, YOUR BUSINESS IS GREATLY APPRECIATED. THANK YOU SO MUCH FOR SHOPPING WITH US!
                </p>

                {/* Form Inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <label
                        htmlFor="firstName"
                        style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          color: '#000000',
                          textTransform: 'uppercase',
                          marginBottom: '5px',
                          display: 'block'
                        }}
                      >
                        FIRST NAME<span style={{ color: '#EB1C24', fontWeight: 'normal' }}>*</span>
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        ref={firstNameRef}
                        value={formData.firstName}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: `1.3px solid ${invalidFields.has('firstName') ? '#EB1C24' : '#000000'}`,
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: '#FFFFFF',
                          color: '#909090',
                          boxSizing: 'border-box',
                          borderRadius: '0',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label
                        htmlFor="lastName"
                        style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          color: '#000000',
                          textTransform: 'uppercase',
                          marginBottom: '5px',
                          display: 'block'
                        }}
                      >
                        LAST NAME<span style={{ color: '#EB1C24', fontWeight: 'normal' }}>*</span>
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        ref={lastNameRef}
                        value={formData.lastName}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: `1.3px solid ${invalidFields.has('lastName') ? '#EB1C24' : '#000000'}`,
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: '#FFFFFF',
                          color: '#909090',
                          boxSizing: 'border-box',
                          borderRadius: '0',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <label
                        htmlFor="orderNumber"
                        style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          color: '#000000',
                          textTransform: 'uppercase',
                          marginBottom: '5px',
                          display: 'block'
                        }}
                      >
                        ORDER NUMBER<span style={{ color: '#EB1C24', fontWeight: 'normal' }}>*</span>
                      </label>
                      <input
                        type="text"
                        id="orderNumber"
                        name="orderNumber"
                        ref={orderNumberRef}
                        value={formData.orderNumber}
                        onChange={handleInputChange}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: `1.3px solid ${invalidFields.has('orderNumber') ? '#EB1C24' : '#000000'}`,
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: '#FFFFFF',
                          color: '#909090',
                          boxSizing: 'border-box',
                          borderRadius: '0',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label
                        htmlFor="orderDate"
                        style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          color: '#000000',
                          textTransform: 'uppercase',
                          marginBottom: '5px',
                          display: 'block'
                        }}
                      >
                        ORDER DATE<span style={{ color: '#EB1C24', fontWeight: 'normal' }}>*</span>
                      </label>
                      <input
                        type="tel"
                        id="orderDate"
                        name="orderDate"
                        ref={orderDateRef}
                        value={formData.orderDate}
                        onChange={handleOrderDateChange}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          border: `1.3px solid ${invalidFields.has('orderDate') ? '#EB1C24' : '#000000'}`,
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: '#FFFFFF',
                          color: '#909090',
                          boxSizing: 'border-box',
                          borderRadius: '0',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      style={{
                        fontFamily: '"Futura PT Book"',
                        fontSize: '11px',
                        color: '#000000',
                        textTransform: 'uppercase',
                        marginBottom: '5px',
                        display: 'block'
                      }}
                    >
                      CONFIRMATION EMAIL<span style={{ color: '#EB1C24', fontWeight: 'normal' }}>*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      ref={emailRef}
                      value={formData.email}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        height: '36px',
                        padding: '8px',
                        border: `1.3px solid ${invalidFields.has('email') ? '#EB1C24' : '#000000'}`,
                        fontFamily: '"Futura PT Book"',
                        fontSize: '11px',
                        backgroundColor: '#FFFFFF',
                        color: '#909090',
                        boxSizing: 'border-box',
                        borderRadius: '0',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Authorization Checkboxes */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        onClick={() => setAuthorizedPurchase(!authorizedPurchase)}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1.3px solid #000000',
                          backgroundColor: 'transparent',
                          position: 'relative',
                          flexShrink: 0
                        }}
                      >
                        {authorizedPurchase && (
                          <img 
                            src="/assets/checkbox.svg" 
                            alt="checked" 
                            style={{ width: '16px', height: '16px', position: 'absolute' }}
                          />
                        )}
                      </div>
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                          lineHeight: '1.3'
                        }}
                        onClick={() => setAuthorizedPurchase(!authorizedPurchase)}
                      >
                        I HAVE AUTHORIZED THIS PURCHASE ON THE DATE LISTED ABOVE.<span style={{ color: '#EB1C24' }}>*</span>
                      </label>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        onClick={() => setBillingShippingMatch(!billingShippingMatch)}
                        style={{
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1.3px solid #000000',
                          backgroundColor: 'transparent',
                          position: 'relative',
                          flexShrink: 0
                        }}
                      >
                        {billingShippingMatch && (
                          <img 
                            src="/assets/checkbox.svg" 
                            alt="checked" 
                            style={{ width: '16px', height: '16px', position: 'absolute' }}
                          />
                        )}
                      </div>
                      <label 
                        style={{ 
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#000000',
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                          lineHeight: '1.3'
                        }}
                        onClick={() => setBillingShippingMatch(!billingShippingMatch)}
                      >
                        THE BILLING/SHIPPING ADDRESS BELONGS TO THE CARDHOLDER.<span style={{ color: '#EB1C24' }}>*</span>
                      </label>
                    </div>
                  </div>

                  {/* Photo ID Upload Fields */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px', transform: 'translateY(-6px)' }}>
                    {/* Required Photo ID Field */}
                    <div>
                      <label
                        htmlFor="photoId"
                        style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          color: '#000000',
                          textTransform: 'uppercase',
                          marginBottom: '5px',
                          display: 'block'
                        }}
                      >
                        <span style={{ color: '#EB1C24' }}>PHOTO ID</span> (CARDHOLDER) NAME/ADDRESS SHOULD MATCH ORDER DETAILS. YOU MAY CENSOR OTHER INFO.<span style={{ color: '#EB1C24', fontWeight: 'normal' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="file"
                          id="photoId"
                          name="photoId"
                          ref={photoIdInputRef}
                          onChange={handlePhotoIdChange}
                          accept="image/*"
                          style={{
                            position: 'absolute',
                            width: '100%',
                            height: '36px',
                            opacity: 0,
                            cursor: 'pointer',
                            zIndex: 2
                          }}
                        />
                        <div
                          onClick={() => photoIdInputRef.current?.click()}
                          style={{
                            width: '100%',
                            minHeight: '36px',
                            height: photoIdPreview ? 'auto' : '36px',
                            padding: '8px',
                            border: '1.3px solid #000000',
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                            backgroundColor: '#FFFFFF',
                            color: photoIdFile ? '#909090' : '#EB1C24',
                            boxSizing: 'border-box',
                            borderRadius: '0',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            position: 'relative',
                            overflow: photoIdPreview ? 'visible' : 'hidden',
                            display: photoIdPreview ? 'block' : 'flex',
                            alignItems: photoIdPreview ? 'normal' : 'center'
                          }}
                        >
                          {photoIdPreview ? (
                            <img 
                              src={photoIdPreview} 
                              alt="Photo ID preview" 
                              style={{
                                width: '100%',
                                height: 'auto',
                                objectFit: 'contain',
                                objectPosition: 'left center',
                                display: 'block'
                              }}
                            />
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <span style={{ 
                                padding: '4px 8px',
                                border: '1px solid #909090',
                                borderRadius: '4px',
                                backgroundColor: '#F5F5F5',
                                color: '#000000',
                                textTransform: 'uppercase',
                                fontSize: '11px',
                                fontFamily: '"Futura PT Book"'
                              }}>
                                CHOOSE FILE
                              </span>
                              <span style={{ marginLeft: '8px', color: '#909090', fontFamily: '"Futura PT Book"', fontSize: '10px' }}>
                                NO FILE SELECTED
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Optional Last 4 Digits Field */}
                    <div style={{ transform: 'translateY(7px)' }}>
                      <label
                        htmlFor="lastFourDigits"
                        style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          color: '#000000',
                          textTransform: 'uppercase',
                          marginBottom: '5px',
                          display: 'block'
                        }}
                      >
                        <span style={{ color: '#EB1C24' }}>LAST 4 DIGITS</span> (CARDHOLDER) PHOTO IDENTIFICATION SHOWING FULL NAME AND LAST 4 DIGITS OF CARD. YOU MAY CENSOR OTHER DIGITS. DISREGARD THIS BOX IF USING A PAYMENT PLAN.
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="file"
                          id="lastFourDigits"
                          name="lastFourDigits"
                          ref={lastFourDigitsInputRef}
                          onChange={handleLastFourDigitsChange}
                          accept="image/*"
                          style={{
                            position: 'absolute',
                            width: '100%',
                            height: '36px',
                            opacity: 0,
                            cursor: 'pointer',
                            zIndex: 2
                          }}
                        />
                        <div
                          onClick={() => lastFourDigitsInputRef.current?.click()}
                          style={{
                            width: '100%',
                            minHeight: '36px',
                            height: lastFourDigitsPreview ? 'auto' : '36px',
                            padding: '8px',
                            border: '1.3px solid #000000',
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                            backgroundColor: '#FFFFFF',
                            color: lastFourDigitsFile ? '#909090' : '#EB1C24',
                            boxSizing: 'border-box',
                            borderRadius: '0',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            position: 'relative',
                            overflow: lastFourDigitsPreview ? 'visible' : 'hidden',
                            display: lastFourDigitsPreview ? 'block' : 'flex',
                            alignItems: lastFourDigitsPreview ? 'normal' : 'center'
                          }}
                        >
                          {lastFourDigitsPreview ? (
                            <img 
                              src={lastFourDigitsPreview} 
                              alt="Last 4 digits preview" 
                              style={{
                                width: '100%',
                                height: 'auto',
                                objectFit: 'contain',
                                objectPosition: 'left center',
                                display: 'block'
                              }}
                            />
                          ) : (
                            <>
                              <span style={{ 
                                padding: '4px 8px',
                                border: '1px solid #909090',
                                borderRadius: '4px',
                                backgroundColor: '#F5F5F5',
                                color: '#000000',
                                textTransform: 'uppercase',
                                fontSize: '11px',
                                fontFamily: '"Futura PT Book"'
                              }}>
                                CHOOSE FILE
                              </span>
                              <span style={{ marginLeft: '8px', color: '#909090', fontFamily: '"Futura PT Book"', fontSize: '10px' }}>
                                NO FILE SELECTED
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Address Difference Reason Section */}
                    <div style={{ marginTop: '15px' }}>
                      <label
                        htmlFor="addressDifferenceReason"
                        style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          color: '#000000',
                          textTransform: 'uppercase',
                          marginBottom: '12px',
                          display: 'block'
                        }}
                      >
                        IF THE ADDRESS ON YOUR PHOTO ID DIFFERS, PROVIDE THE REASON WHY BELOW. IF NO REASON IS PROVIDED YOUR ORDER MAY BE SUBJECT TO CANCELLATION.
                      </label>
                      <textarea
                        id="addressDifferenceReason"
                        name="addressDifferenceReason"
                        rows={4}
                        value={addressDifferenceReason}
                        onChange={(e) => setAddressDifferenceReason(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          resize: 'vertical',
                          borderRadius: '0',
                          boxSizing: 'border-box',
                          outline: 'none'
                        }}
                      />
                    </div>

                    {/* Signature Section */}
                    <div style={{ marginTop: '13px', marginBottom: '-6px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '12px' }}>
                        <div
                          onClick={() => setBySigningAgreement(!bySigningAgreement)}
                          style={{
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1.3px solid #000000',
                            backgroundColor: 'transparent',
                            position: 'relative',
                            flexShrink: 0,
                            marginTop: '2px'
                          }}
                        >
                          {bySigningAgreement && (
                            <img 
                              src="/assets/checkbox.svg" 
                              alt="checked" 
                              style={{ width: '16px', height: '16px', position: 'absolute' }}
                            />
                          )}
                        </div>
                        <p
                          style={{
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                            color: '#000000',
                            textTransform: 'uppercase',
                            margin: '0',
                            display: 'block',
                            cursor: 'pointer',
                            lineHeight: '1.3'
                          }}
                          onClick={() => setBySigningAgreement(!bySigningAgreement)}
                        >
                          BY SIGNING + SUBMITTING THIS FORM, YOU AGREE THAT ALL SALES ARE FINAL AND THE INFORMATION SUBMITTED HAS BEEN VERIFIED AND IS ACCURATE. YOU ARE CONFIRMING YOUR ORDER AND YOU HAVE AUTHORIZED THIS PURCHASE.<span style={{ color: '#EB1C24', fontWeight: 'normal' }}>*</span>
                        </p>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <canvas
                          ref={signatureCanvasRef}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                          style={{
                            width: '100%',
                            height: '150px',
                            border: '1.3px solid #000000',
                            borderRadius: '0',
                            cursor: 'crosshair',
                            touchAction: 'none'
                          }}
                        />
                        <p
                          onClick={clearSignature}
                          style={{
                            fontFamily: '"Futura PT Book"',
                            fontSize: '10px',
                            color: '#000000',
                            textTransform: 'uppercase',
                            marginTop: '6px',
                            marginBottom: '-18px',
                            textAlign: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          CLEAR SIGNATURE
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* SUBMIT BUTTON - Outside main card */}
          {!showMobileMenu && (
            <div className="px-0 md:px-0" style={{ marginTop: '2px', marginBottom: '20px' }}>
              <button
                onClick={handleSubmit}
                className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                style={{
                  borderWidth: '1.3px', 
                  color: '#EB1C24',
                  fontFamily: '"Futura PT Medium"',
                  backgroundColor: '#FFFFFF',
                  textTransform: 'uppercase'
                }}
                type="button"
              >
                SUBMIT
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={handleSignOut}
        title="SIGN OUT"
        message="ARE YOU SURE YOU WANT TO SIGN OUT?"
        confirmText="CONFIRM"
        cancelText="CANCEL"
        dataAttribute="sign-out-confirm"
      />
      
      {/* Validation Modal */}
      <ConfirmationModal
        isOpen={showValidationModal}
        onClose={() => {
          setShowValidationModal(false);
          // Focus the field after modal closes
          setTimeout(() => {
            if (fieldToFocus) {
              const refMap: { [key: string]: React.RefObject<HTMLInputElement> } = {
                firstName: firstNameRef,
                lastName: lastNameRef,
                orderNumber: orderNumberRef,
                orderDate: orderDateRef,
                email: emailRef,
                phone: phoneRef,
                address: addressRef,
                city: cityRef,
                state: stateRef,
                zip: zipRef,
                country: countryRef,
                billingAddress: billingAddressRef,
                billingCity: billingCityRef,
                billingState: billingStateRef,
                billingZip: billingZipRef,
                billingCountry: billingCountryRef,
                cardholderName: cardholderNameRef,
                cardNumber: cardNumberRef,
                expirationDate: expirationDateRef,
                cvv: cvvRef
              };
              const ref = refMap[fieldToFocus];
              if (ref?.current) {
                ref.current.focus();
              }
            }
          }, 100);
        }}
        onConfirm={() => {
          setShowValidationModal(false);
          // Focus the field after modal closes
          setTimeout(() => {
            if (fieldToFocus) {
              const refMap: { [key: string]: React.RefObject<HTMLInputElement> } = {
                firstName: firstNameRef,
                lastName: lastNameRef,
                orderNumber: orderNumberRef,
                orderDate: orderDateRef,
                email: emailRef,
                phone: phoneRef,
                address: addressRef,
                city: cityRef,
                state: stateRef,
                zip: zipRef,
                country: countryRef,
                billingAddress: billingAddressRef,
                billingCity: billingCityRef,
                billingState: billingStateRef,
                billingZip: billingZipRef,
                billingCountry: billingCountryRef,
                cardholderName: cardholderNameRef,
                cardNumber: cardNumberRef,
                expirationDate: expirationDateRef,
                cvv: cvvRef
              };
              const ref = refMap[fieldToFocus];
              if (ref?.current) {
                ref.current.focus();
              }
            }
          }, 100);
        }}
        title="INPUT FIELD REQUIRED"
        message={validationMessage}
        confirmText="OK"
        cancelText="CLOSE"
        messageTextTransform="uppercase"
      />
      </div>
    </>
  );
}

export default OrderFormPage;

