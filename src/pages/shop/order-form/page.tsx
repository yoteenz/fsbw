import React, { useState, useEffect, useRef } from 'react';
import { useSyncMenuToggleOpenState } from '../../../utils/menuToggleOpenState';
import type { CSSProperties } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import ConfirmationModal from '../../../components/ConfirmationModal';
import OrderFormIntroText from '../../../components/shop/OrderFormIntroText';
import PageHeroImage from '../../../components/PageHeroImage';
import {
  ORDER_FORM_HERO_IMAGE_SRC,
  ORDER_FORM_HERO_VIDEO_SRC,
} from '../../../constants/orderFormAssets';
import BrandMenuLinks from '../../../components/BrandMenuLinks';
import SocialMenuIcons from '../../../components/SocialMenuIcons';
import { signOutAppAndSupabaseSession } from '../../../utils/adminAuth';
import { ShopMobileMenuShopTab } from '../../../components/ShopMobileMenuShopTab';
import { ShopMobileMenuToolsTab } from '../../../components/ShopMobileMenuToolsTab';
import { signInHrefWithReturnTo } from '../../../utils/signInReturnTo';
import { useShopNavSearchBar } from '../../../components/shop/useShopNavSearchBar';
import {
  appendSignedOrderForm,
  fileToDataUrl,
  markOrderFormSignedInUserOrders,
} from '../../../utils/signedOrderFormsStorage';
import { getCurrentUserEmailFromStorage } from '../../../utils/perUserStorage';
import {
  loadLastOrderAuthorizationFormDraft,
  saveLastOrderAuthorizationFormDraft,
} from '../../../utils/lastOrderAuthorizationFormDraft';
import { postClientSubmission, getAccessToken } from '../../../utils/api';
import { isSupabaseConfigured } from '../../../utils/supabase';
import { syncProfileFromApi } from '../../../utils/syncFromApi';
import OrderFormFilePicker from '../../../components/OrderFormFilePicker';
import {
  ORDER_FORM_ACK_NO_CHARGEBACK,
  ORDER_FORM_ACK_NO_CHARGEBACK_NOTE,
  ORDER_FORM_ACK_RAW_HAIR,
  ORDER_FORM_PAYMENT_METHOD_OPTIONS,
  ORDER_FORM_UPLOAD_PRIVACY_NOTE,
  orderFormAckProcessingTimeline,
} from '../../../constants/orderFormAcknowledgments';
import {
  captureOrderFormClientSubmissionMeta,
  mapCheckoutPaymentMethodToFormValue,
  orderFormPaymentMethodLabel,
} from '../../../utils/orderFormSubmissionMeta';

function formatOrderTotalUsd(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Shared with PAYMENT METHOD USED rows — 16×16 box, 1.3px border, checkbox.svg mark. */
const ORDER_FORM_CHECKBOX_BOX_STYLE: CSSProperties = {
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
};

const ORDER_FORM_CHECKBOX_MARK_STYLE: CSSProperties = {
  width: '16px',
  height: '16px',
  position: 'absolute',
};

const ORDER_FORM_CHECKBOX_LABEL_STYLE: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '10px',
  color: '#000000',
  cursor: 'pointer',
  textTransform: 'uppercase',
  lineHeight: '1.3',
};

const ORDER_FORM_PAYMENT_METHOD_LABEL_STYLE: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '11px',
  color: '#808080',
  fontWeight: 500,
  cursor: 'pointer',
  textTransform: 'uppercase',
  lineHeight: '1.3',
};

function OrderFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { NavCenter, SearchTrigger } = useShopNavSearchBar();
  const [cartCount, setCartCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('cartCount') || '0', 10);
    } catch (e) {
      return 0;
    }
  });
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  useSyncMenuToggleOpenState(showMobileMenu);
  const [mobileMenuActiveTab, setMobileMenuActiveTab] = useState('TOOLS');
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
  const [ackNoChargeback, setAckNoChargeback] = useState(false);
  const [ackRawHairVariation, setAckRawHairVariation] = useState(false);
  const [ackProcessingTimeline, setAckProcessingTimeline] = useState(false);
  const [bySigningAgreement, setBySigningAgreement] = useState(false);
  const [photoIdFile, setPhotoIdFile] = useState<File | null>(null);
  const [lastFourDigitsFile, setLastFourDigitsFile] = useState<File | null>(null);
  const [photoIdPreview, setPhotoIdPreview] = useState<string | null>(null);
  const [lastFourDigitsPreview, setLastFourDigitsPreview] = useState<string | null>(null);
  const [addressDifferenceReason, setAddressDifferenceReason] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [orderFormDraftHydrateKey, setOrderFormDraftHydrateKey] = useState(0);
  const photoIdInputRef = useRef<HTMLInputElement>(null);
  const lastFourDigitsInputRef = useRef<HTMLInputElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Refs for input fields
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const orderNumberRef = useRef<HTMLInputElement>(null);
  const orderDateRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const orderTotalPaidRef = useRef<HTMLInputElement>(null);
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
    const stateData = location.state as {
      orderNumber?: string;
      orderDate?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      shippingAddress?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
      orderTotal?: number;
      paymentMethod?: string;
    } | null;
    const orderTotalRaw = stateData?.orderTotal;
    const orderTotalPaid =
      typeof orderTotalRaw === 'number' && orderTotalRaw > 0
        ? formatOrderTotalUsd(orderTotalRaw)
        : '';
    const paymentMethodUsed = mapCheckoutPaymentMethodToFormValue(stateData?.paymentMethod);
    return {
      orderNumber: stateData?.orderNumber || '',
      orderDate: stateData?.orderDate || '',
      firstName: stateData?.firstName || '',
      lastName: stateData?.lastName || '',
      email: stateData?.email || '',
      orderTotalPaid,
      paymentMethodUsed,
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

  const locationState = location.state as {
    processingTime?: string;
    orderId?: string;
  } | null;
  const processingTimelineLabel = String(locationState?.processingTime || '').trim();

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

  useEffect(() => {
    const bump = () => setOrderFormDraftHydrateKey((k) => k + 1);
    window.addEventListener('signedOrderFormsUpdated', bump);
    window.addEventListener('storage', bump);
    window.addEventListener('signInStateChanged', bump);
    return () => {
      window.removeEventListener('signedOrderFormsUpdated', bump);
      window.removeEventListener('storage', bump);
      window.removeEventListener('signInStateChanged', bump);
    };
  }, []);

  /** Repeat orders: pre-fill from last submitted authorization (per user). Order # / date from checkout always win. */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem('isSignedIn') !== 'true') return;
    const email = getCurrentUserEmailFromStorage();
    if (!email) return;
    const draft = loadLastOrderAuthorizationFormDraft(email);
    if (!draft) return;

    setFormData((prev) => {
      const d = draft.formFields;
      const next = { ...prev };
      const take = (k: keyof typeof next) => {
        const v = d[k as keyof typeof d];
        if (typeof v === 'string' && v.trim() && !String((next as any)[k] || '').trim()) {
          (next as any)[k] = v;
        }
      };
      take('firstName');
      take('lastName');
      take('email');
      take('orderTotalPaid');
      take('paymentMethodUsed');
      take('phone');
      take('address');
      take('city');
      take('state');
      take('zip');
      take('country');
      take('billingAddress');
      take('billingCity');
      take('billingState');
      take('billingZip');
      take('billingCountry');
      take('cardholderName');
      take('cardNumber');
      take('cardLastFour');
      take('cardType');
      take('expirationDate');
      return next;
    });

    setAddressDifferenceReason((prev) => {
      const v = draft.formFields.addressDifferenceReason;
      if (prev.trim() || !v?.trim()) return prev;
      return v;
    });

    if (draft.photoIdDataUrl?.startsWith('data:image')) {
      setPhotoIdPreview((p) => p || draft.photoIdDataUrl!);
    }
    if (draft.cardLastFourDataUrl?.startsWith('data:image')) {
      setLastFourDigitsPreview((p) => p || draft.cardLastFourDataUrl!);
    }
  }, [orderFormDraftHydrateKey, location.key]);

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
      navigate(signInHrefWithReturnTo(location));
    }
  };

  const handleSignOut = async () => {
    setIsSignedIn(false);
    await signOutAppAndSupabaseSession();
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

  // Signature canvas size + optional pre-fill from last submitted form (after layout)
  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      const canvas = signatureCanvasRef.current;
      if (!canvas) return;
      if (canvas.offsetWidth === 0) {
        requestAnimationFrame(run);
        return;
      }
      canvas.width = canvas.offsetWidth;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.strokeStyle = '#EB1C24';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (typeof window === 'undefined' || localStorage.getItem('isSignedIn') !== 'true') return;
      const email = getCurrentUserEmailFromStorage();
      if (!email) return;
      const draft = loadLastOrderAuthorizationFormDraft(email);
      const sig = draft?.signatureDataUrl;
      if (!sig || !sig.startsWith('data:image')) return;
      const img = new Image();
      img.onload = () => {
        if (cancelled) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = sig;
    };
    requestAnimationFrame(run);
    return () => {
      cancelled = true;
    };
  }, [orderFormDraftHydrateKey, location.key]);

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
    if (!formData.orderTotalPaid.trim()) {
      setValidationMessage('ORDER TOTAL PAID IS REQUIRED.');
      setFieldToFocus('orderTotalPaid');
      setInvalidFields(prev => new Set(prev).add('orderTotalPaid'));
      setShowValidationModal(true);
      return;
    }
    if (!formData.paymentMethodUsed.trim()) {
      setValidationMessage('PLEASE SELECT THE PAYMENT METHOD USED FOR THIS ORDER.');
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
    if (!ackNoChargeback) {
      setValidationMessage('PLEASE CONFIRM THAT YOU WILL CONTACT FRONTAL SLAYER BEFORE INITIATING A CHARGEBACK OR PAYMENT DISPUTE.');
      setShowValidationModal(true);
      return;
    }
    if (!ackRawHairVariation) {
      setValidationMessage('PLEASE CONFIRM THAT YOU UNDERSTAND RAW HUMAN HAIR MAY HAVE NATURAL VARIATIONS.');
      setShowValidationModal(true);
      return;
    }
    if (!ackProcessingTimeline) {
      setValidationMessage('PLEASE CONFIRM THAT YOU HAVE REVIEWED AND UNDERSTAND THE PROCESSING TIMELINE FOR YOUR ORDER.');
      setShowValidationModal(true);
      return;
    }
    
    // Validate required photo ID file
    const hasPhotoId =
      !!photoIdFile ||
      (!!photoIdPreview && photoIdPreview.startsWith('data:image'));
    if (!hasPhotoId) {
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
    
    void (async () => {
      try {
        const canvas = signatureCanvasRef.current;
        const signatureDataUrl = canvas ? canvas.toDataURL('image/png') : '';
        const photoIdDataUrl = photoIdFile
          ? await fileToDataUrl(photoIdFile)
          : photoIdPreview && photoIdPreview.startsWith('data:image')
            ? photoIdPreview
            : '';
        const cardLastFourDataUrl = lastFourDigitsFile
          ? await fileToDataUrl(lastFourDigitsFile)
          : lastFourDigitsPreview && lastFourDigitsPreview.startsWith('data:image')
            ? lastFourDigitsPreview
            : '';
        const stateData = location.state as { orderId?: string } | null | undefined;
        const orderId = stateData?.orderId != null ? String(stateData.orderId) : undefined;
        const cardDigits = formData.cardNumber.replace(/\D/g, '');
        const formFields: Record<string, string> = {};
        for (const [k, v] of Object.entries(formData)) {
          if (k === 'cvv') continue;
          if (k === 'cardNumber') {
            formFields.cardNumber =
              cardDigits.length >= 4 ? `ENDING IN ${cardDigits.slice(-4)}` : (v as string).trim();
            continue;
          }
          if (k === 'paymentMethodUsed') {
            formFields.paymentMethodUsed = orderFormPaymentMethodLabel(String(v || '').trim());
            continue;
          }
          formFields[k] = typeof v === 'string' ? v.trim() : String(v);
        }
        formFields.addressDifferenceReason = addressDifferenceReason.trim();
        formFields.ackNoChargeback = 'true';
        formFields.ackRawHairVariation = 'true';
        formFields.ackProcessingTimeline = 'true';
        if (processingTimelineLabel) {
          formFields.processingTimelineLabel = processingTimelineLabel;
        }
        const submissionMeta = captureOrderFormClientSubmissionMeta();
        const entryId =
          orderId ||
          `form-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const formSnapshot = {
          id: entryId,
          orderId,
          orderNumber: formData.orderNumber.trim(),
          orderDate: formData.orderDate.trim(),
          signedAt: Date.now(),
          email: formData.email.trim(),
          formFields,
          photoIdDataUrl: photoIdDataUrl || undefined,
          cardLastFourDataUrl: cardLastFourDataUrl || undefined,
          signatureDataUrl: signatureDataUrl || undefined,
          submissionMeta,
          adminApproved: false,
        };
        appendSignedOrderForm(formSnapshot);
        if (isSupabaseConfigured() && (await getAccessToken())) {
          try {
            await postClientSubmission({ kind: 'order_form', payload: formSnapshot });
            await syncProfileFromApi();
          } catch {
            /* offline / migration not run — local row still works */
          }
        }
        markOrderFormSignedInUserOrders(formData.email.trim(), formData.orderNumber.trim());
        saveLastOrderAuthorizationFormDraft(formData.email.trim(), {
          formFields,
          photoIdDataUrl: photoIdDataUrl || undefined,
          cardLastFourDataUrl: cardLastFourDataUrl || undefined,
          signatureDataUrl: signatureDataUrl || undefined,
        });
      } catch (e) {
        console.error('Order form persist failed:', e);
      }
    })();
  };

  return (
    <>
      <style>{`
        input::placeholder,
        textarea::placeholder {
          font-family: "Futura PT Demi", "Futura PT Medium", "Futura PT Book", "Covered By Your Grace", "Covered By Your Grace Preload" !important;
          font-weight: 500;
          color: #808080 !important;
        }
        input,
        textarea {
          font-family: "Futura PT Demi", "Futura PT Medium", "Futura PT Book", "Covered By Your Grace", "Covered By Your Grace Preload" !important;
          font-weight: 500 !important;
          color: #808080 !important;
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
          -webkit-text-fill-color: #808080 !important;
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
                    onClick={() => navigate(isSignedIn ? '/account' : signInHrefWithReturnTo(location))}
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
                    onClick={() => navigate(isSignedIn ? '/wishlist' : signInHrefWithReturnTo(location))} 
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
                  <SearchTrigger className="cursor-pointer" style={{ transform: 'translateX(-2px)' }}>
                <img
                  alt=""
                      width="16"
                      height="15"
                      src="/assets/search-icon.svg"
                    />
                  </SearchTrigger>
                </>
              )}
            </div>

            {/* Text in the middle */}
            <NavCenter showMobileMenu={showMobileMenu}>
              <p className="text-sm" style={{ fontFamily: '"Futura PT Book"', transform: 'translateY(1px)' }}>
              {showMobileMenu ? (
                <>
                  <span 
                    style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }}
                    onClick={() => navigate('/lobby')}
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
                    onClick={() => navigate('/tools')}
                  >
                    TOOLS &gt;
                  </span>{' '}
                  <span
                    style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}
                  >
                    ORDER FORM
                  </span>
                </>
              )}
            </p>
            </NavCenter>

            {/* Right side icons */}
            <div className="gap-5 flex absolute" style={{ right: '17px' }}>
<div style={{ transform: `translateX(${cartCount === 0 ? 7 : 5}px)` }}>
              <DynamicCartIcon count={cartCount} width={22} height={19} variant="nav" />
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

          {/* MAIN CARD - only apply menu-toggle-card when menu is open so main card height is not forced when showing order form */}
          <div
            className={showMobileMenu ? 'menu-toggle-card border border-black flex flex-col pt-6 pb-4 px-5 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out' : 'border border-black flex flex-col pt-6 pb-4 px-5 mb-2 bg-white/60 backdrop-blur-sm transition-all duration-300 ease-out'}
            style={{ 
              borderWidth: '1.3px', 
              minWidth: '100%', 
              maxWidth: 'none', 
              overflow: 'visible',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              minHeight: showMobileMenu ? 'calc(100dvh - 80px)' : 'auto',
              height: showMobileMenu ? 'calc(100dvh - 80px)' : 'auto'
            }}
          >
            {showMobileMenu ? (
              /* MENU CONTENT */
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', paddingTop: '20px', flex: 1, minHeight: 0, position: 'relative' }}>
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
                      borderBottom: mobileMenuActiveTab === 'SHOP' ? '1px solid #EB1C24' : 'none',
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
                      borderBottom: mobileMenuActiveTab === 'TOOLS' ? '1px solid #EB1C24' : 'none',
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
                      borderBottom: mobileMenuActiveTab === 'BRAND' ? '1px solid #EB1C24' : 'none',
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
                      <ShopMobileMenuToolsTab
                        navigate={navigate}
                        closeMenu={() => setShowMobileMenu(false)}
                        labelTranslateX="13px"
                      />
                    ) : mobileMenuActiveTab === 'BRAND' ? (
                      <BrandMenuLinks onClose={() => setShowMobileMenu(false)} />
                    ) : (
                                            <ShopMobileMenuShopTab
                                              navigate={navigate}
                                              mobileMenuExpandedItems={mobileMenuExpandedItems}
                                              handleMobileMenuItemToggle={handleMobileMenuItemToggle}
                                              closeSubItemMenu={() => setShowMobileMenu(false)}
                                              labelTranslateX="13px"
                                            />
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
                <div style={{ marginBottom: '20px' }}><SocialMenuIcons /></div>
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

                <PageHeroImage src={ORDER_FORM_HERO_IMAGE_SRC} videoSrc={ORDER_FORM_HERO_VIDEO_SRC} />

                <OrderFormIntroText />

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
                          color: '#808080',
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
                          color: '#808080',
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
                          color: '#808080',
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
                          color: '#808080',
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
                        color: '#808080',
                        boxSizing: 'border-box',
                        borderRadius: '0',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="orderTotalPaid"
                      style={{
                        fontFamily: '"Futura PT Book"',
                        fontSize: '11px',
                        color: '#000000',
                        textTransform: 'uppercase',
                        marginBottom: '5px',
                        display: 'block'
                      }}
                    >
                      ORDER TOTAL PAID<span style={{ color: '#EB1C24', fontWeight: 'normal' }}>*</span>
                    </label>
                    <input
                      type="text"
                      id="orderTotalPaid"
                      name="orderTotalPaid"
                      ref={orderTotalPaidRef}
                      value={formData.orderTotalPaid}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        height: '36px',
                        padding: '8px',
                        border: `1.3px solid ${invalidFields.has('orderTotalPaid') ? '#EB1C24' : '#000000'}`,
                        fontFamily: '"Futura PT Book"',
                        fontSize: '11px',
                        backgroundColor: '#FFFFFF',
                        color: '#808080',
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
                        style={ORDER_FORM_CHECKBOX_BOX_STYLE}
                      >
                        {authorizedPurchase && (
                          <img 
                            src="/assets/checkbox.svg" 
                            alt="checked" 
                            style={ORDER_FORM_CHECKBOX_MARK_STYLE}
                          />
                        )}
                      </div>
                      <label 
                        style={ORDER_FORM_CHECKBOX_LABEL_STYLE}
                        onClick={() => setAuthorizedPurchase(!authorizedPurchase)}
                      >
                        I HAVE AUTHORIZED THIS PURCHASE ON THE DATE LISTED ABOVE.<span style={{ color: '#EB1C24' }}>*</span>
                      </label>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        onClick={() => setBillingShippingMatch(!billingShippingMatch)}
                        style={ORDER_FORM_CHECKBOX_BOX_STYLE}
                      >
                        {billingShippingMatch && (
                          <img 
                            src="/assets/checkbox.svg" 
                            alt="checked" 
                            style={ORDER_FORM_CHECKBOX_MARK_STYLE}
                          />
                        )}
                      </div>
                      <label 
                        style={ORDER_FORM_CHECKBOX_LABEL_STYLE}
                        onClick={() => setBillingShippingMatch(!billingShippingMatch)}
                      >
                        THE BILLING/SHIPPING ADDRESS BELONGS TO THE CARDHOLDER.<span style={{ color: '#EB1C24' }}>*</span>
                      </label>
                    </div>
                  </div>

                  <div style={{ marginTop: '18px' }}>
                    <p
                      style={{
                        fontFamily: '"Futura PT Book"',
                        fontSize: '11px',
                        color: '#000000',
                        textTransform: 'uppercase',
                        marginBottom: '8px',
                        marginTop: 0
                      }}
                    >
                      PAYMENT METHOD USED<span style={{ color: '#EB1C24', fontWeight: 'normal' }}>*</span>
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {ORDER_FORM_PAYMENT_METHOD_OPTIONS.map((opt) => {
                        const selected = formData.paymentMethodUsed === opt.value;
                        const selectPaymentMethod = () => {
                          setFormData((prev) => ({ ...prev, paymentMethodUsed: opt.value }));
                          setInvalidFields((prev) => {
                            const next = new Set(prev);
                            next.delete('paymentMethodUsed');
                            return next;
                          });
                        };
                        return (
                          <div key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                              onClick={selectPaymentMethod}
                              style={ORDER_FORM_CHECKBOX_BOX_STYLE}
                            >
                              {selected && (
                                <img
                                  src="/assets/checkbox.svg"
                                  alt="checked"
                                  style={ORDER_FORM_CHECKBOX_MARK_STYLE}
                                />
                              )}
                            </div>
                            <label
                              style={ORDER_FORM_PAYMENT_METHOD_LABEL_STYLE}
                              onClick={selectPaymentMethod}
                            >
                              {opt.label}
                            </label>
                          </div>
                        );
                      })}
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
                        <span style={{ color: '#808080', fontFamily: '"Futura PT Medium"' }}>IDENTITY VERIFICATION</span> — CARDHOLDER NAME/ADDRESS SHOULD MATCH ORDER DETAILS. YOU MAY CENSOR OTHER INFO.<span style={{ color: '#EB1C24', fontWeight: 'normal' }}>*</span>
                      </label>
                      <p
                        style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#EB1C24',
                          textTransform: 'uppercase',
                          margin: '-2px 0 8px 0',
                          lineHeight: '1.35'
                        }}
                      >
                        {ORDER_FORM_UPLOAD_PRIVACY_NOTE}
                      </p>
                      <OrderFormFilePicker
                        id="photoId"
                        name="photoId"
                        inputRef={photoIdInputRef}
                        onChange={handlePhotoIdChange}
                        accept="image/*"
                        previewSrc={photoIdPreview}
                        showSelectedTint={!!photoIdFile}
                      />
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
                        <span style={{ color: '#808080', fontFamily: '"Futura PT Medium"' }}>PAYMENT VERIFICATION</span> — PHOTO SHOWING FULL NAME AND LAST 4 DIGITS OF CARD. YOU MAY CENSOR OTHER DIGITS. DISREGARD IF USING A PAYMENT PLAN.
                      </label>
                      <p
                        style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: '#EB1C24',
                          textTransform: 'uppercase',
                          margin: '-2px 0 8px 0',
                          lineHeight: '1.35'
                        }}
                      >
                        {ORDER_FORM_UPLOAD_PRIVACY_NOTE}
                      </p>
                      <OrderFormFilePicker
                        id="lastFourDigits"
                        name="lastFourDigits"
                        inputRef={lastFourDigitsInputRef}
                        onChange={handleLastFourDigitsChange}
                        accept="image/*"
                        previewSrc={lastFourDigitsPreview}
                        showSelectedTint={!!lastFourDigitsFile}
                      />
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

                    {/* Chargeback + product + processing acknowledgments (above signature) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <div
                          onClick={() => setAckNoChargeback(!ackNoChargeback)}
                          style={ORDER_FORM_CHECKBOX_BOX_STYLE}
                        >
                          {ackNoChargeback && (
                            <img
                              src="/assets/checkbox.svg"
                              alt="checked"
                              style={ORDER_FORM_CHECKBOX_MARK_STYLE}
                            />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <label
                            style={{ ...ORDER_FORM_CHECKBOX_LABEL_STYLE, display: 'block' }}
                            onClick={() => setAckNoChargeback(!ackNoChargeback)}
                          >
                            {ORDER_FORM_ACK_NO_CHARGEBACK}<span style={{ color: '#EB1C24' }}>*</span>
                          </label>
                          <p
                            style={{
                              fontFamily: '"Futura PT Book"',
                              fontSize: '10px',
                              color: '#EB1C24',
                              textTransform: 'uppercase',
                              margin: '6px 0 0 0',
                              lineHeight: '1.35'
                            }}
                          >
                            {ORDER_FORM_ACK_NO_CHARGEBACK_NOTE}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <div
                          onClick={() => setAckRawHairVariation(!ackRawHairVariation)}
                          style={ORDER_FORM_CHECKBOX_BOX_STYLE}
                        >
                          {ackRawHairVariation && (
                            <img
                              src="/assets/checkbox.svg"
                              alt="checked"
                              style={ORDER_FORM_CHECKBOX_MARK_STYLE}
                            />
                          )}
                        </div>
                        <label
                          style={ORDER_FORM_CHECKBOX_LABEL_STYLE}
                          onClick={() => setAckRawHairVariation(!ackRawHairVariation)}
                        >
                              {ORDER_FORM_ACK_RAW_HAIR}<span style={{ color: '#EB1C24' }}>*</span>
                            </label>
                          </div>

                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <div
                          onClick={() => setAckProcessingTimeline(!ackProcessingTimeline)}
                          style={ORDER_FORM_CHECKBOX_BOX_STYLE}
                        >
                          {ackProcessingTimeline && (
                            <img
                              src="/assets/checkbox.svg"
                              alt="checked"
                              style={ORDER_FORM_CHECKBOX_MARK_STYLE}
                            />
                          )}
                        </div>
                        <label
                          style={ORDER_FORM_CHECKBOX_LABEL_STYLE}
                          onClick={() => setAckProcessingTimeline(!ackProcessingTimeline)}
                        >
                              {orderFormAckProcessingTimeline(processingTimelineLabel)}<span style={{ color: '#EB1C24' }}>*</span>
                            </label>
                          </div>
                    </div>

                    {/* Signature Section */}
                    <div style={{ marginTop: '1px', marginBottom: '-6px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '24px' }}>
                        <div
                          onClick={() => setBySigningAgreement(!bySigningAgreement)}
                          style={ORDER_FORM_CHECKBOX_BOX_STYLE}
                        >
                          {bySigningAgreement && (
                            <img 
                              src="/assets/checkbox.svg" 
                              alt="checked" 
                              style={ORDER_FORM_CHECKBOX_MARK_STYLE}
                            />
                          )}
                        </div>
                        <p
                          style={{
                            ...ORDER_FORM_CHECKBOX_LABEL_STYLE,
                            margin: '0',
                            display: 'block',
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
                            textAlign: 'left',
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
                orderTotalPaid: orderTotalPaidRef,
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
                orderTotalPaid: orderTotalPaidRef,
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
        title="FORGETTING SOMETHING?"
        message={validationMessage}
        confirmText="OK"
        cancelText="CLOSE"
      />
      </div>
    </>
  );
}

export default OrderFormPage;

