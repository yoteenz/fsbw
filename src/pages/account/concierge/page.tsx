import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import ConfirmationModal from '../../../components/ConfirmationModal';

// Add pulsating animation style (recording indicator style)
const pulsateStyle = `
  @keyframes pulsate {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.2;
    }
  }
`;

function ConciergePage() {
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
  const [mobileMenuExpandedItems, setMobileMenuExpandedItems] = useState<string[]>([]);
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

  // Priority message state
  const [priorityMessage, setPriorityMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isOrderRelated, setIsOrderRelated] = useState<'yes' | 'no'>('no');
  const [isUrgent, setIsUrgent] = useState<'yes' | 'no'>('no');
  const [relatedOrderId, setRelatedOrderId] = useState<string>('');
  
  // Gift confirmation modal state
  const [showFreeGiftModal, setShowFreeGiftModal] = useState(false);
  const [showBirthdayGiftModal, setShowBirthdayGiftModal] = useState(false);
  const [freeGiftModalMessage, setFreeGiftModalMessage] = useState('');
  const [birthdayGiftModalMessage, setBirthdayGiftModalMessage] = useState('');
  
  // Free gift state - load from localStorage
  const [selectedFreeGift, setSelectedFreeGift] = useState<'melt-band' | 'wig-brush' | ''>(() => {
    try {
      const saved = localStorage.getItem('selectedFreeGift');
      return (saved === 'melt-band' || saved === 'wig-brush') ? saved : '';
    } catch (e) {
      return '';
    }
  });
  
  // Birthday gift state - load from localStorage
  const [selectedBirthdayGift, setSelectedBirthdayGift] = useState<'points' | 'gift-card' | ''>(() => {
    try {
      const saved = localStorage.getItem('selectedBirthdayGift');
      return (saved === 'points' || saved === 'gift-card') ? saved : '';
    } catch (e) {
      return '';
    }
  });
  
  // Check if user is eligible for birthday gift (within 12 months of premium membership start)
  const isEligibleForBirthdayGift = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (!userData?.membershipType || userData.membershipType !== 'PREMIUM') {
        return false;
      }
      
      // Check if user has subscriptionPurchasedAt date
      if (!userData.subscriptionPurchasedAt) {
        return false;
      }
      
      const startDate = new Date(userData.subscriptionPurchasedAt);
      const now = new Date();
      const twelveMonthsLater = new Date(startDate);
      twelveMonthsLater.setMonth(twelveMonthsLater.getMonth() + 12);
      
      // Eligible if current date is within 12 months of premium membership start
      return now <= twelveMonthsLater;
    } catch (e) {
      console.error('Error checking birthday gift eligibility:', e);
      return false;
    }
  };
  
  // Check if user is eligible for birthday gift
  // Note: This is calculated but may not be used in current render logic
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // @ts-ignore - intentionally unused, may be used in future
  const _eligibleForBirthdayGift = isEligibleForBirthdayGift();
  
  // Order tracking state
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [expandedStages, setExpandedStages] = useState<Set<number>>(new Set());
  
  // Get active orders for tracking
  useEffect(() => {
    const getActiveOrders = () => {
      try {
        const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (!userData?.email) {
          setActiveOrders([]);
          return;
        }
        
        const userOrdersKey = `userOrders_${userData.email}`;
        let storedOrders = localStorage.getItem(userOrdersKey);
        
        // If no orders exist, create test orders for UI testing
        if (!storedOrders) {
          // Create order date 13 days ago to show 20% progress in CONSTRUCTING UNIT stage
          // Constructing starts at day 7 (after sourcing ends: 2 + 5 = 7), takes 28 days. To be at 20%: 7 + (28 * 0.2) = 12.6 days ? 13 days
          const constructingOrderDate = new Date();
          constructingOrderDate.setDate(constructingOrderDate.getDate() - 13);
          // Format as MM-DD-YYYY for consistent parsing
          const month = String(constructingOrderDate.getMonth() + 1).padStart(2, '0');
          const day = String(constructingOrderDate.getDate()).padStart(2, '0');
          const year = constructingOrderDate.getFullYear();
          const formattedDate = `${month}-${day}-${year}`;
          
          const testOrder = {
            id: 'test-order-1',
            orderNumber: 'ORDER #999',
            date: formattedDate,
            status: 'PREPARING',
            productName: 'NOIR',
            productImage: '/assets/natural front.png',
            total: 740,
            items: 1,
            trackingStage: 2, // Set to stage 2 (CONSTRUCTING UNIT) for testing 20% progress
            // Selection data for icons
            length: '16"',
            density: '200%',
            texture: 'SILKY',
            capSize: 'L',
            lace: '13X6',
            hairline: 'NATURAL',
            color: 'OFF BLACK',
            styling: 'BANGS',
            addOns: ['BLEACH']
          };
          
          const deliveredOrder = {
            id: 'test-order-2',
            orderNumber: 'ORDER #888',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: 'DELIVERED',
            productName: 'NOIR',
            productImage: '/assets/natural front.png',
            total: 740,
            items: 1,
            trackingStage: 8, // All stages completed for delivered order
            trackingNumber: '1Z999AA10123456784',
            deliveryDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            deliveryTime: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            deliveryLocation: 'FRONT DOOR',
            requiresSignature: true,
            // Selection data for icons
            length: '24"',
            density: '250%',
            texture: 'SILKY',
            capSize: 'M',
            lace: '13X6',
            hairline: 'LAGOS',
            color: 'OFF BLACK',
            styling: 'NONE', // No styling selected - icon should not appear
            addOns: [] // No add-ons selected - icon should not appear
          };
          
          const testOrdersData = {
            activeOrders: [testOrder, deliveredOrder],
            pastOrders: []
          };
          
          localStorage.setItem(userOrdersKey, JSON.stringify(testOrdersData));
          storedOrders = JSON.stringify(testOrdersData);
        }
        
        if (storedOrders) {
          const orders = JSON.parse(storedOrders);
          const active = orders.activeOrders || [];
          const past = orders.pastOrders || [];
          
          // Check if there's already a test order for testing
          const existingTestOrderIndex = [...active, ...past].findIndex((order: any) => 
            order.id === 'test-order-1' || (order.orderNumber === 'ORDER #999')
          );
          
          // Check if there's already a delivered order for testing
          const existingDeliveredOrderIndex = [...active, ...past].findIndex((order: any) => 
            order.id === 'test-order-2' || (order.status === 'DELIVERED' && order.orderNumber === 'ORDER #888')
          );
          
          // Check if there's already a multi-unit test order
          const existingMultiUnitOrderIndex = [...active, ...past].findIndex((order: any) => 
            order.id === 'test-order-3' || order.orderNumber === 'ORDER #777'
          );
          
          // Create or update the test order with 20% progress in CONSTRUCTING UNIT
          // Constructing starts at day 7 (after sourcing ends: 2 + 5 = 7), takes 28 days. To be at 20%: 7 + (28 * 0.2) = 12.6 days ? 13 days
          const constructingOrderDate = new Date();
          constructingOrderDate.setDate(constructingOrderDate.getDate() - 13);
          // Format as MM-DD-YYYY for consistent parsing
          const month = String(constructingOrderDate.getMonth() + 1).padStart(2, '0');
          const day = String(constructingOrderDate.getDate()).padStart(2, '0');
          const year = constructingOrderDate.getFullYear();
          const formattedDate = `${month}-${day}-${year}`;
          
          const testOrder = {
            id: 'test-order-1',
            orderNumber: 'ORDER #999',
            date: formattedDate,
            status: 'PREPARING',
            productName: 'NOIR',
            productImage: '/assets/natural front.png',
            total: 740,
            items: 1,
            trackingStage: 2, // Set to stage 2 (CONSTRUCTING UNIT) for testing 20% progress
            // Selection data for icons
            length: '16"',
            density: '200%',
            texture: 'SILKY',
            capSize: 'L',
            lace: '13X6',
            hairline: 'NATURAL',
            color: 'OFF BLACK',
            styling: 'BANGS',
            addOns: ['BLEACH']
          };
          
          if (existingTestOrderIndex >= 0) {
            // Update existing test order
            if (existingTestOrderIndex < active.length) {
              active[existingTestOrderIndex] = testOrder;
            } else {
              const pastIndex = existingTestOrderIndex - active.length;
              past[pastIndex] = testOrder;
            }
          } else {
            // Add new test order if it doesn't exist
            active.push(testOrder);
          }
          
          // Create or update the delivered test order with correct signature and location
          const deliveredOrder = {
            id: 'test-order-2',
            orderNumber: 'ORDER #888',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: 'DELIVERED',
            productName: 'NOIR',
            productImage: '/assets/natural front.png',
            total: 740,
            items: 1,
            trackingStage: 8, // All stages completed for delivered order
            trackingNumber: '1Z999AA10123456784',
            deliveryDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            deliveryTime: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            deliveryLocation: 'FRONT DOOR',
            requiresSignature: true,
            // Selection data for icons
            length: '24"',
            density: '250%',
            texture: 'SILKY',
            capSize: 'M',
            lace: '13X6',
            hairline: 'LAGOS',
            color: 'OFF BLACK',
            styling: 'NONE', // No styling selected - icon should not appear
            addOns: [] // No add-ons selected - icon should not appear
          };
          
          if (existingDeliveredOrderIndex >= 0) {
            // Update existing order
            if (existingDeliveredOrderIndex < active.length) {
              active[existingDeliveredOrderIndex] = deliveredOrder;
            } else {
              const pastIndex = existingDeliveredOrderIndex - active.length;
              past[pastIndex] = deliveredOrder;
            }
          } else {
            // Add new order
            active.push(deliveredOrder);
          }
          
          // Create or update multi-unit test order for icon positioning/design testing
          const multiUnitOrderDate = new Date();
          multiUnitOrderDate.setDate(multiUnitOrderDate.getDate() - 20);
          const multiUnitMonth = String(multiUnitOrderDate.getMonth() + 1).padStart(2, '0');
          const multiUnitDay = String(multiUnitOrderDate.getDate()).padStart(2, '0');
          const multiUnitYear = multiUnitOrderDate.getFullYear();
          const multiUnitFormattedDate = `${multiUnitMonth}-${multiUnitDay}-${multiUnitYear}`;
          
          const multiUnitOrder = {
            id: 'test-order-3',
            orderNumber: 'ORDER #777',
            date: multiUnitFormattedDate,
            status: 'PREPARING',
            productName: 'NOIR',
            productImage: '/assets/natural front.png',
            total: 1480,
            items: 2,
            trackingStage: 1, // Set to SOURCING stage to test icon display
            // Multi-unit selection data - array of units with different selections
            units: [
              {
                // Unit 1
                length: '16"',
                density: '200%',
                texture: 'SILKY',
                capSize: 'L',
                lace: '13X6',
                hairline: 'NATURAL',
                color: 'OFF BLACK',
                styling: 'BANGS',
                addOns: ['BLEACH']
              },
              {
                // Unit 2 - different selections
                length: '20"',
                density: '250%',
                texture: 'SILKY',
                capSize: 'M',
                lace: '13X4',
                hairline: 'LAGOS',
                color: 'JET BLACK',
                styling: 'CRIMPS',
                addOns: ['PLUCK', 'BLEACH']
              }
            ],
            // For backward compatibility, also set first unit's values at root level
            length: '16"',
            density: '200%',
            texture: 'SILKY',
            capSize: 'L',
            lace: '13X6',
            hairline: 'NATURAL',
            color: 'OFF BLACK',
            styling: 'BANGS',
            addOns: ['BLEACH']
          };
          
          if (existingMultiUnitOrderIndex >= 0) {
            // Update existing multi-unit order
            if (existingMultiUnitOrderIndex < active.length) {
              active[existingMultiUnitOrderIndex] = multiUnitOrder;
            } else {
              const pastIndex = existingMultiUnitOrderIndex - active.length;
              past[pastIndex] = multiUnitOrder;
            }
          } else {
            // Add new multi-unit order
            active.push(multiUnitOrder);
          }
          
          // Save back to localStorage
          const updatedOrders = {
            activeOrders: active,
            pastOrders: past
          };
          localStorage.setItem(userOrdersKey, JSON.stringify(updatedOrders));
          
          // Include all orders (active + past, including DELIVERED)
          const allOrders = [...active, ...past];
          setActiveOrders(allOrders);
          
          // Auto-select first order if none selected
          if (allOrders.length > 0 && !selectedOrderId) {
            setSelectedOrderId(allOrders[0].id);
          }
        } else {
          setActiveOrders([]);
        }
      } catch (e) {
        console.error('Error loading active orders:', e);
        setActiveOrders([]);
      }
    };
    
    getActiveOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Get current order's tracking stage
  const getOrderTrackingStage = (orderId: string): number => {
    if (!orderId) return 0;
    const order = activeOrders.find((o: any) => o.id === orderId);
    if (!order) return 0;
    
    // If order is DELIVERED, all stages are completed (stage 8)
    if (order.status === 'DELIVERED') {
      return 8;
    }
    
    // Map order status to tracking stage (0-8)
    const statusMap: { [key: string]: number } = {
      'PLACED': 0, // confirmation
      'CONFIRMED': 1, // sourcing
      'PREPARING': 2, // constructing
      'SHIPPED_TO_HUB': 3, // shipped to hub
      'IN_TRANSIT': 4, // arrived at hub
      'PROCESSING': 5, // prep
      'CUSTOMIZING': 6, // customize
      'FINALIZING': 7, // finalize
      'SHIPPED': 8 // shipped
    };
    
    // Default to stage based on status, or use custom trackingStage if available
    if (order.trackingStage !== undefined) {
      return Math.min(Math.max(0, order.trackingStage), 8);
    }
    
    return statusMap[order.status] || 0;
  };
  
  const currentTrackingStage = getOrderTrackingStage(selectedOrderId);
  
  // Helper function to get stage duration in days
  const getStageDuration = (stageIndex: number, hasCustomization: boolean = true, shippingMethod?: string): number => {
    switch (stageIndex) {
      case 0: // ORDER CONFIRMED
        return 0; // Pending
      case 1: // SOURCING + COLLECTING
        return 5; // 5 days
      case 2: // CONSTRUCTING UNIT
        return 28; // 4 weeks (28 days)
      case 3: // SHIPPED TO HUB
        return 5; // 5 days
      case 4: // ARRIVED AT HUB
        return 2; // 2 days
      case 5: // PREPPING
        return 2; // 2 days
      case 6: // CUSTOMIZING
        return hasCustomization ? 10 : 0; // 10 days if customization
      case 7: // FINALIZING
        return 2; // 2 days
      case 8: // PACKAGING
        return 3; // 3 days
      case 9: // ORDER SHIPPED
        // 3-5 days depending on shipping method (default to 3 if not specified)
        if (shippingMethod?.toLowerCase().includes('express') || shippingMethod?.toLowerCase().includes('rush')) {
          return 3;
        } else if (shippingMethod?.toLowerCase().includes('standard')) {
          return 5;
        }
        return 3; // Default to 3 days
      default:
        return 0;
    }
  };
  
  // Helper function to calculate progress percentage for current stage
  const getStageProgress = (stageIndex: number, orderDate: string | undefined, hasCustomization: boolean = true): number => {
    if (!orderDate || stageIndex !== currentTrackingStage) {
      return stageIndex < currentTrackingStage ? 100 : 0;
    }
    
    try {
      // Parse order date
      let orderDateObj: Date;
      if (orderDate.includes('-')) {
        const [month, day, year] = orderDate.split('-').map(Number);
        orderDateObj = new Date(year, month - 1, day);
      } else if (orderDate.includes(',')) {
        // Handle format like "Jan 15, 2024"
        orderDateObj = new Date(orderDate);
      } else {
        orderDateObj = new Date(orderDate);
      }
      
      // Validate date
      if (isNaN(orderDateObj.getTime())) {
        return stageIndex < currentTrackingStage ? 100 : 0;
      }
      
      // Normalize order date to midnight for accurate calculation
      orderDateObj.setHours(0, 0, 0, 0);
      
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Normalize to midnight for consistent calculation
      const _selectedOrder = activeOrders.find((o: any) => o.id === selectedOrderId);
      void _selectedOrder; // Intentionally unused, kept for future use
      const stageStartDate = getStageStartDate(stageIndex, orderDateObj, hasCustomization);
      const stageEndDate = getStageEndDate(stageIndex, orderDateObj, hasCustomization);
      
      if (now <= stageStartDate) return 0;
      if (now >= stageEndDate) return 100;
      
      const totalDuration = stageEndDate.getTime() - stageStartDate.getTime();
      const elapsed = now.getTime() - stageStartDate.getTime();
      return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
    } catch (e) {
      return 0;
    }
  };
  
  // Helper function to get stage start date (matches getStageTimestamp logic)
  const getStageStartDate = (stageIndex: number, orderDate: Date, hasCustomization: boolean): Date => {
    const startDate = new Date(orderDate);
    
    if (stageIndex === 0) {
      // ORDER CONFIRMED - same day
      return new Date(orderDate);
    } else if (stageIndex === 1) {
      // SOURCING + COLLECTING - starts 2 days after order (for payment processing), takes 5 days
      startDate.setDate(startDate.getDate() + 2);
    } else if (stageIndex === 2) {
      // CONSTRUCTING UNIT - starts after sourcing (2 + 5 = 7 days), takes 28 days (4 weeks)
      startDate.setDate(startDate.getDate() + 2 + 5);
    } else if (stageIndex === 3) {
      // SHIPPED TO HUB - starts after construction (2 + 5 + 28 = 35 days), takes 5 days
      startDate.setDate(startDate.getDate() + 2 + 5 + 28);
    } else if (stageIndex === 4) {
      // ARRIVED AT HUB - starts after shipped (35 + 5 = 40 days), takes 2 days
      startDate.setDate(startDate.getDate() + 2 + 5 + 28 + 5);
    } else if (stageIndex === 5) {
      // PREPPING - starts after arrived (40 + 2 = 42 days), takes 2 days
      startDate.setDate(startDate.getDate() + 2 + 5 + 28 + 5 + 2);
    } else if (stageIndex === 6) {
      // CUSTOMIZING - starts after prepping (42 + 2 = 44 days), takes 10 days (if customization)
      if (!hasCustomization) return new Date(orderDate);
      startDate.setDate(startDate.getDate() + 2 + 5 + 28 + 5 + 2 + 2);
    } else if (stageIndex === 7) {
      // FINALIZING - starts after customizing/prepping, takes 4 days
      const baseDays = 2 + 5 + 28 + 5 + 2 + 2; // up to prepping
      if (hasCustomization) {
        startDate.setDate(startDate.getDate() + baseDays + 10); // after customizing
      } else {
        startDate.setDate(startDate.getDate() + baseDays); // after prepping
      }
    } else if (stageIndex === 8) {
      // ORDER SHIPPED - starts after finalizing, takes 3-5 days
      const baseDays = 2 + 5 + 28 + 5 + 2 + 2; // up to prepping
      if (hasCustomization) {
        startDate.setDate(startDate.getDate() + baseDays + 10 + 4); // after finalizing (4 days)
      } else {
        startDate.setDate(startDate.getDate() + baseDays + 4); // after finalizing (4 days)
      }
    }
    
    return startDate;
  };
  
  // Helper function to get stage end date
  const getStageEndDate = (stageIndex: number, orderDate: Date, hasCustomization: boolean): Date => {
    const startDate = getStageStartDate(stageIndex, orderDate, hasCustomization);
    const endDate = new Date(startDate);
    const duration = getStageDuration(stageIndex, hasCustomization);
    
    if (stageIndex === 4) {
      // ARRIVED AT HUB uses business days
      return addBusinessDays(startDate, duration);
    } else {
      endDate.setDate(endDate.getDate() + duration);
    }
    
    return endDate;
  };
  
  // Toggle stage expansion
  const toggleStageExpansion = (stageIndex: number) => {
    setExpandedStages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stageIndex)) {
        newSet.delete(stageIndex);
      } else {
        newSet.add(stageIndex);
      }
      return newSet;
    });
  };
  
  // Helper function to format date as "FEBRUARY 21"
  const formatDate = (date: Date): string => {
    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    return `${month} ${day}`;
  };
  
  // Helper function to get the current ORDER SHIPPED sub-status
  // Returns: 'PREPARING LABEL' | tracking number string | 'DELIVERED'
  const getOrderShippedSubStatus = (order: any): string => {
    if (!order) return 'PREPARING LABEL';
    
    // If delivered, show "DELIVERED"
    if (order.status === 'DELIVERED' || order.trackingStage === 9) {
      return 'DELIVERED';
    }
    
    // If tracking number exists, show it
    if (order.trackingNumber) {
      return order.trackingNumber;
    }
    
    // Otherwise, show "PREPARING LABEL"
    return 'PREPARING LABEL';
  };
  
  // Helper function to get the current ORDER CONFIRMED sub-status
  // Returns: 'PENDING' | 'AWAITING ORDER FORM' | 'ORDER FORM PENDING' | 'ORDER FORM APPROVED'
  const getOrderConfirmedSubStatus = (order: any): string => {
    if (!order || !order.date) return 'PENDING';
    
    // Parse order date
    let orderDate: Date;
    try {
      // Try parsing MM-DD-YYYY format first
      if (order.date.includes('-')) {
        const [month, day, year] = order.date.split('-').map(Number);
        orderDate = new Date(year, month - 1, day);
      } else {
        // Try parsing locale date string
        orderDate = new Date(order.date);
      }
    } catch (e) {
      return 'PENDING';
    }
    
    // Check if order has explicit orderFormStatus (for future use)
    if (order.orderFormStatus) {
      return order.orderFormStatus;
    }
    
    // Calculate time elapsed since order confirmation
    const now = new Date();
    const hoursElapsed = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
    
    // Check if order form has been submitted (stored in order data)
    if (order.orderFormSubmitted) {
      // If submitted but not approved yet
      if (!order.orderFormApproved) {
        return 'ORDER FORM PENDING';
      } else {
        return 'ORDER FORM APPROVED';
      }
    }
    
    // Time-based progression (for demo/testing purposes)
    // After 1 hour, show "AWAITING ORDER FORM"
    if (hoursElapsed >= 1) {
      return 'AWAITING ORDER FORM';
    }
    
    // Within first hour, show "PENDING"
    return 'PENDING';
  };
  
  // Helper function to format time as "9:07 PM"
  const formatTime = (date: Date): string => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  // Helper functions to get icon paths for selections
  const getLengthIcon = (length: string, productName: string): string => {
    if (['16"', '18"', '20"', '22"'].includes(length)) {
      return '/assets/back length-icon.svg';
    } else if (['24"', '26"', '28"', '30"'].includes(length)) {
      return '/assets/b length thumb.png';
    } else {
      return '/assets/thigh length thumb.png';
    }
  };

  const getDensityIcon = (productName: string): string => {
    if (productName === 'BLANCO') {
      return '/assets/density-blanco.png';
    }
    return '/assets/density.png';
  };

  const getTextureIcon = (productName: string): string => {
    if (productName === 'BLANCO') {
      return '/assets/blanco texture.svg';
    }
    return '/assets/Texture-icon.svg';
  };

  const getLineIcon = (): string => {
    // Line icon for prepping stage - bottles icon
    return '/assets/prep-stage.svg';
  };

  const getHubIcon = (): string => {
    // Line icon for arrived at hub stage
    return '/assets/hub-icon.svg';
  };

  const getShippingIcon = (): string => {
    // Line icon for shipping stages - airplane and parcel box
    return '/assets/shipping-icon.svg';
  };

  const getCapSizeIcon = (): string => {
    return '/assets/cap size-icon.svg';
  };

  const getLaceIcon = (productName: string): string => {
    if (productName === 'BLANCO') {
      return '/assets/lace-blanco.png';
    }
    return '/assets/lace-icon.svg';
  };

  const getHairlineIcon = (hairline: string): string => {
    const hairlineArray = hairline.split(',');
    const correctOrder = ['NATURAL', 'LAGOS', 'PEAK'];
    const sortedSelections = hairlineArray.sort((a, b) => {
      const indexA = correctOrder.indexOf(a);
      const indexB = correctOrder.indexOf(b);
      return indexA - indexB;
    });
    const firstHairline = sortedSelections[0];
    
    switch (firstHairline) {
      case 'NATURAL':
        return '/assets/Natural Hairline-icon.svg';
      case 'LAGOS':
        return '/assets/Lagos Hairline-icon.svg';
      case 'PEAK':
        return '/assets/Peak Hairline-icon.svg';
      default:
        return '/assets/Natural Hairline-icon.svg';
    }
  };

  const getColorIcon = (color: string): string => {
    // Color uses a color circle, return a placeholder or use a generic icon
    return '/assets/none-icon.svg'; // Placeholder - colors typically use color swatches
  };

  const getStylingIcon = (styling: string): string => {
    if (!styling || styling === 'NONE') {
      return '/assets/none-icon.svg';
    }
    const stylingArray = styling.split(',');
    const correctOrder = ['BANGS', 'CRIMPS', 'FLAT IRON', 'LAYERS'];
    const sortedSelections = stylingArray.sort((a, b) => {
      const indexA = correctOrder.indexOf(a);
      const indexB = correctOrder.indexOf(b);
      return indexA - indexB;
    });
    const firstStyling = sortedSelections[0];
    
    const hairStylingIconMap: { [key: string]: string } = {
      'BANGS': '/assets/Bangs-icon.svg',
      'CRIMPS': '/assets/Crimps-icon.svg',
      'FLAT IRON': '/assets/Flat iron-icon.svg',
      'LAYERS': '/assets/Layers-icon.svg'
    };
    
    return hairStylingIconMap[firstStyling] || '/assets/none-icon.svg';
  };

  const getAddOnsIcon = (addOns: string[]): string => {
    if (!addOns || addOns.length === 0) {
      return '/assets/none-icon.svg';
    }
    // Addon icon mapping based on the addon sub page
    const addOnIconMap: { [key: string]: string } = {
      'BLEACH': '/assets/Bleach-icon.svg',
      'PLUCK': '/assets/Pluck-icon.svg',
      'BLUNT CUT': '/assets/clip ends-icon.svg'
    };
    
    // Show the first selected addon icon
    const firstAddOn = addOns[0];
    return firstAddOn ? (addOnIconMap[firstAddOn] || '/assets/none-icon.svg') : '/assets/none-icon.svg';
  };

  // Helper functions to get display text for selections
  const getLengthDisplayText = (length: string): string => {
    return length || '24"';
  };

  const getDensityDisplayText = (density: string): string => {
    return density || '200%';
  };

  const getTextureDisplayText = (texture: string): string => {
    return texture || 'SILKY';
  };

  const getCapSizeDisplayText = (capSize: string): string => {
    return capSize || 'M';
  };

  const getLaceDisplayText = (lace: string): string => {
    return lace || '13X6';
  };

  const getHairlineDisplayText = (hairline: string): string => {
    if (!hairline) return 'NATURAL';
    const hairlineArray = hairline.split(',');
    const correctOrder = ['NATURAL', 'LAGOS', 'PEAK'];
    const sortedSelections = hairlineArray.sort((a, b) => {
      const indexA = correctOrder.indexOf(a);
      const indexB = correctOrder.indexOf(b);
      return indexA - indexB;
    });
    return sortedSelections[0];
  };

  const getColorDisplayText = (color: string): string => {
    return color || 'OFF BLACK';
  };

  const getStylingDisplayText = (styling: string): string => {
    if (!styling || styling === 'NONE') return 'NONE';
    const stylingArray = styling.split(',');
    const correctOrder = ['BANGS', 'CRIMPS', 'FLAT IRON', 'LAYERS'];
    const sortedSelections = stylingArray.sort((a, b) => {
      const indexA = correctOrder.indexOf(a);
      const indexB = correctOrder.indexOf(b);
      return indexA - indexB;
    });
    return sortedSelections[0];
  };

  const getAddOnsDisplayText = (addOns: string[]): string => {
    if (!addOns || addOns.length === 0) return 'NONE';
    return addOns[0]; // Show first add-on
  };

  // Helper function to get color hex code
  const getColorCode = (color: string, productName: string): string => {
    const isBlanco = productName === 'BLANCO';
    const selectedColor = color || (isBlanco ? 'PLATINUM' : 'OFF BLACK');
    
    // Color mapping based on the color sub page
    const colorMap: { [key: string]: string } = {
      // Blanco colors
      'GOLDEN': '#FBF08B',
      'PLATINUM': '#F6F3D2',
      'ASH': '#E5E3CB',
      // Noir/other colors
      'JET BLACK': '#000000',
      'OFF BLACK': '#2A2424',
      'ESPRESSO': '#3B1301',
      'CHESTNUT': '#6C2D11',
      'HONEY': '#C58628',
      'AUBURN': '#9C5617',
      'COPPER': '#802F02',
      'GINGER': '#F64F07',
      'SANGRIA': '#7E0A1E',
      'CHERRY': '#D70808',
      'RASPBERRY': '#EF0461',
      'PLUM': '#640E82',
      'COBALT': '#290481',
      'TEAL': '#46EBCA',
      'SLIME': '#03D92A',
      'CITRINE': '#E2E91C'
    };
    
    // Default to PLATINUM for blanco routes, OFF BLACK for others
    return colorMap[selectedColor] || (isBlanco ? '#F6F3D2' : '#2A2424');
  };
  
  // Helper function to add business days to a date
  const addBusinessDays = (date: Date, businessDays: number): Date => {
    const result = new Date(date);
    let added = 0;
    while (added < businessDays) {
      result.setDate(result.getDate() + 1);
      if (result.getDay() !== 0 && result.getDay() !== 6) {
        added++;
      }
    }
    return result;
  };

  // Helper function to get timestamp for a stage based on order date
  const getStageTimestamp = (stageIndex: number, orderDate: string | undefined, hasCustomization: boolean = true): { date: string; time: string } | null => {
    if (!orderDate) return null;
    
    try {
      // Parse order date (could be MM-DD-YYYY or other formats)
      let orderDateObj: Date;
      if (orderDate.includes('-')) {
        const [month, day, year] = orderDate.split('-').map(Number);
        orderDateObj = new Date(year, month - 1, day);
      } else {
        orderDateObj = new Date(orderDate);
      }
      
      let stageDate = new Date(orderDateObj);
      
      // Calculate cumulative days for each stage based on timeline
      // Stage 0: ORDER CONFIRMED - same day (0 days)
      // Stage 1: SOURCING + COLLECTING - starts 2 days after order (for payment processing), takes 5 days
      // Stage 2: CONSTRUCTING UNIT - starts after sourcing ends (2 + 5 = 7 days)
      // Stage 3: SHIPPED TO USA - 4 weeks (28 days) from constructing
      // Stage 4: ARRIVED AT HUB - 5 business days from shipped
      // Stage 5: PREPPING + WASHING - 2 days from arrived
      // Stage 6: CUSTOMIZING - 2 days from prepping (only if customization)
      // Stage 7: FINALIZING - 10 days from customizing (or 0 if no customization)
      // Stage 8: PACKAGING - 2 days from finalizing
      // Stage 9: ORDER SHIPPED - 3 days from packaging
      
      if (stageIndex === 0) {
        // ORDER CONFIRMED - same day
        stageDate = new Date(orderDateObj);
      } else if (stageIndex === 1) {
        // SOURCING + COLLECTING - starts 2 days after order (for payment processing), takes 5 days
        stageDate = new Date(orderDateObj);
        stageDate.setDate(stageDate.getDate() + 2);
      } else if (stageIndex === 2) {
        // CONSTRUCTING UNIT - starts after sourcing (2 + 5 = 7 days), takes 28 days (4 weeks)
        stageDate = new Date(orderDateObj);
        stageDate.setDate(stageDate.getDate() + 2 + 5);
      } else if (stageIndex === 3) {
        // SHIPPED TO HUB - starts after construction (2 + 5 + 28 = 35 days), takes 5 days
        stageDate = new Date(orderDateObj);
        stageDate.setDate(stageDate.getDate() + 2 + 5 + 28);
      } else if (stageIndex === 4) {
        // ARRIVED AT HUB - starts after shipped (35 + 5 = 40 days), takes 2 days
        stageDate = new Date(orderDateObj);
        stageDate.setDate(stageDate.getDate() + 2 + 5 + 28 + 5);
      } else if (stageIndex === 5) {
        // PREPPING - starts after arrived (40 + 2 = 42 days), takes 2 days
        stageDate = new Date(orderDateObj);
        stageDate.setDate(stageDate.getDate() + 2 + 5 + 28 + 5 + 2);
      } else if (stageIndex === 6) {
        // CUSTOMIZING - starts after prepping (42 + 2 = 44 days), takes 10 days (only if customization)
        if (!hasCustomization) {
          return null; // Skip this stage
        }
        stageDate = new Date(orderDateObj);
        stageDate.setDate(stageDate.getDate() + 2 + 5 + 28 + 5 + 2 + 2);
      } else if (stageIndex === 7) {
        // FINALIZING - starts after customizing/prepping, takes 2 days
        const baseDays = 2 + 5 + 28 + 5 + 2 + 2; // up to prepping
        stageDate = new Date(orderDateObj);
        if (hasCustomization) {
          stageDate.setDate(stageDate.getDate() + baseDays + 10); // after customizing
        } else {
          stageDate.setDate(stageDate.getDate() + baseDays); // after prepping
        }
      } else if (stageIndex === 8) {
        // PACKAGING - starts after finalizing, takes 3 days
        const baseDays = 2 + 5 + 28 + 5 + 2 + 2; // up to prepping
        stageDate = new Date(orderDateObj);
        if (hasCustomization) {
          stageDate.setDate(stageDate.getDate() + baseDays + 10 + 2); // after customizing + finalizing
        } else {
          stageDate.setDate(stageDate.getDate() + baseDays + 2); // after prepping + finalizing
        }
      } else if (stageIndex === 9) {
        // ORDER SHIPPED - starts after packaging, takes 3-5 days (default to 3)
        const baseDays = 5 + 28 + 5 + 2 + 2; // up to prepping
        stageDate = new Date(orderDateObj);
        const shippingDays = 3; // Default, could be 3-5 based on shipping method
        if (hasCustomization) {
          stageDate.setDate(stageDate.getDate() + baseDays + 10 + 2 + 3 + shippingDays); // after packaging + shipping
        } else {
          stageDate.setDate(stageDate.getDate() + baseDays + 2 + 3 + shippingDays); // after packaging + shipping
        }
      }
      
      stageDate.setHours(9 + (stageIndex % 12), 7 + (stageIndex * 3) % 60); // Vary time slightly
      
      return {
        date: formatDate(stageDate),
        time: formatTime(stageDate)
      };
    } catch (e) {
      return null;
    }
  };
  
  const trackingStages = [
    { name: 'CONFIRMED', description: 'PROCESSING YOUR ORDER.' },
    { name: 'SOURCING', description: 'GATHERING RAW MATERIALS.' },
    { name: 'CONSTRUCTING', description: 'WEFTING TRACKS + VENTILATING THE LACE.' },
    { name: 'SHIPPED TO HUB', description: 'HEADED TO HUB.' },
    { name: 'ARRIVED AT HUB', description: 'PERFORMING QUALITY CHECK.' },
    { name: 'WASHING', description: 'DEEP CONDITIONING THE HAIR.' },
    { name: 'CUSTOMIZING', description: 'COLORING, PLUCKING, BLEACHING & STYLING.' },
    { name: 'FINALIZING', description: 'PREPARING TO SHIP YOUR ORDER.' },
    { name: 'PACKAGE SHIPPED', description: 'YOUR ORDER HAS BEEN SHIPPED.' }
  ];

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

  const handleMobileMenuItemToggle = (item: string) => {
    setMobileMenuExpandedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
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

  // Helper function to get gift display name
  const getFreeGiftDisplayName = (giftType: string): string => {
    switch (giftType) {
      case 'melt-band':
        return 'MELT BAND';
      case 'wig-brush':
        return 'WIG BRUSH';
      default:
        return '';
    }
  };
  
  const getBirthdayGiftDisplayName = (giftType: string): string => {
    switch (giftType) {
      case 'points':
        return '200 LOYALTY POINTS';
      case 'gift-card':
        return '$20 GIFT CARD';
      default:
        return '';
    }
  };

  const handleSubmitFreeGift = () => {
    try {
      // Save selection to localStorage (can be empty string to clear)
      if (selectedFreeGift) {
        localStorage.setItem('selectedFreeGift', selectedFreeGift);
        
        // Also save to adminFreeGifts for admin dashboard
      const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const freeGifts = JSON.parse(localStorage.getItem('adminFreeGifts') || '[]');
        const newGift = {
        id: Date.now().toString(),
        userId: userData.email || 'unknown',
        userName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Unknown User',
          giftType: selectedFreeGift,
          type: 'free_gift',
        timestamp: new Date().toISOString(),
        status: 'new'
      };
        freeGifts.unshift(newGift);
        localStorage.setItem('adminFreeGifts', JSON.stringify(freeGifts));
        
        // Show confirmation modal with selection message
        const giftName = getFreeGiftDisplayName(selectedFreeGift);
        setFreeGiftModalMessage(`YOU'LL RECEIVE A ${giftName} WITH YOUR NEXT PURCHASE.`);
        setShowFreeGiftModal(true);
      } else {
        // Clear selection
        localStorage.removeItem('selectedFreeGift');
        
        // Show confirmation modal with deselection message
        setFreeGiftModalMessage("YOU WON'T RECEIVE A FREE GIFT WITH YOUR NEXT PURCHASE.");
        setShowFreeGiftModal(true);
      }
    } catch (e) {
      console.error('Error saving free gift request:', e);
    }
  };
  
  const handleSubmitBirthdayGift = () => {
    try {
      // Save selection to localStorage (can be empty string to clear)
      if (selectedBirthdayGift) {
        localStorage.setItem('selectedBirthdayGift', selectedBirthdayGift);
        
        // Also save to adminBirthdayGifts for admin dashboard
      const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const birthdayGifts = JSON.parse(localStorage.getItem('adminBirthdayGifts') || '[]');
        const newGift = {
        id: Date.now().toString(),
        userId: userData.email || 'unknown',
        userName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Unknown User',
          giftType: selectedBirthdayGift,
          type: 'birthday_gift',
        timestamp: new Date().toISOString(),
        status: 'new'
      };
        birthdayGifts.unshift(newGift);
        localStorage.setItem('adminBirthdayGifts', JSON.stringify(birthdayGifts));
        
        // Show confirmation modal with selection message
        const giftName = getBirthdayGiftDisplayName(selectedBirthdayGift);
        // Only add "A" for gift card, not for loyalty points
        const message = selectedBirthdayGift === 'gift-card' 
          ? `YOU'LL RECEIVE A ${giftName} AS YOUR BIRTHDAY GIFT.`
          : `YOU'LL RECEIVE ${giftName} AS YOUR BIRTHDAY GIFT.`;
        setBirthdayGiftModalMessage(message);
        setShowBirthdayGiftModal(true);
      } else {
        // Clear selection
        localStorage.removeItem('selectedBirthdayGift');
        
        // Show confirmation modal with deselection message
        setBirthdayGiftModalMessage("YOU WON'T RECEIVE A FREE GIFT FOR YOUR BIRTHDAY THIS YEAR.");
        setShowBirthdayGiftModal(true);
      }
    } catch (e) {
      console.error('Error saving birthday gift request:', e);
    }
  };

  return (
    <>
      <style>{pulsateStyle}</style>
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
                    onClick={() => {
                      // Check if user is premium member
                      try {
                        const isSignedIn = localStorage.getItem('isSignedIn') === 'true';
                        if (isSignedIn) {
                          const currentUser = localStorage.getItem('currentUser');
                          if (currentUser) {
                            const user = JSON.parse(currentUser);
                            const isPremium = user?.membershipType === 'PREMIUM' || user?.membershipType === 'Premium';
                            if (isPremium) {
                              navigate('/'); // Lobby for premium members
                            } else {
                              navigate('/home/shop'); // Shop for standard/non-members
                            }
                          } else {
                            navigate('/home/shop'); // Default to shop if not signed in
                          }
                        } else {
                          navigate('/home/shop'); // Default to shop if not signed in
                        }
                      } catch (e) {
                        navigate('/home/shop'); // Default to shop on error
                      }
                    }}
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
              <div style={{ transform: 'translateX(5px)' }}>
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
              /* MENU CONTENT */
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

                {/* Menu Items - Fixed height with scroll if needed */}
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
                      // SHOP tab with dropdown functionality
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
                                  // If UNITS is already expanded, navigate to shop/units page
                                  if (item.label === 'UNITS' && mobileMenuExpandedItems.includes(item.label)) {
                                    navigate('/shop/units');
                                  } else {
                                    // Otherwise, toggle expansion
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

                {/* Sign In/Out - Fixed at bottom */}
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

                {/* Social Media Icons - Fixed at bottom */}
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
              </div>
            ) : (
              /* CONCIERGE CONTENT */
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {/* Priority Messages Section */}
                <div
                  className="border border-black bg-white/60 backdrop-blur-sm w-full mb-2 transition-all duration-300 ease-out"
                  style={{
                    borderWidth: '1.3px',
                    paddingTop: '20px',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    paddingBottom: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)'
                  }}
                >
                  <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '22px' }}>
                    <h2
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        color: '#EB1C24',
                        fontSize: '12px',
                        fontWeight: '500',
                        margin: '0',
                        textTransform: 'uppercase'
                      }}
                    >
                      PRIORITY MESSAGES
                    </h2>
                  </div>
                  
                  {/* IS THIS ORDER RELATED? Prompt */}
                  <div style={{ marginBottom: '12px' }}>
                  <p
                    style={{
                        fontFamily: '"Futura PT Book"',
                        color: '#000000',
                      fontSize: '10px',
                        margin: '0 0 8px 0',
                        textTransform: 'uppercase'
                      }}
                    >
                      IS THIS ORDER RELATED?
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => setIsOrderRelated('yes')}
                        style={{
                          flex: 1,
                          height: '32px',
                          border: isOrderRelated === 'yes' ? '1.3px solid #EB1C24' : '1.3px solid #000000',
                          backgroundColor: '#FFFFFF',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: isOrderRelated === 'yes' ? '#EB1C24' : '#000000',
                      textTransform: 'uppercase',
                          cursor: 'pointer',
                          borderRadius: '0'
                        }}
                      >
                        YES
                      </button>
                      <button
                        onClick={() => setIsOrderRelated('no')}
                        style={{
                          flex: 1,
                          height: '32px',
                          border: isOrderRelated === 'no' ? '1.3px solid #EB1C24' : '1.3px solid #000000',
                          backgroundColor: '#FFFFFF',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: isOrderRelated === 'no' ? '#EB1C24' : '#000000',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          borderRadius: '0'
                        }}
                      >
                        NO
                      </button>
                    </div>
                    
                    {/* Order Selection - Show when YES is selected */}
                    {isOrderRelated === 'yes' && (
                      <div style={{ marginTop: '12px' }}>
                        <select
                          value={relatedOrderId}
                          onChange={(e) => setRelatedOrderId(e.target.value)}
                          style={{
                            width: '100%',
                            height: '36px',
                            padding: '8px',
                            paddingLeft: '12px',
                            border: '1.3px solid #000000',
                            fontFamily: '"Futura PT Book"',
                            fontSize: '11px',
                            backgroundColor: '#FFFFFF',
                            boxSizing: 'border-box',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            borderRadius: '0',
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            MozAppearance: 'none',
                            backgroundImage: 'url("/assets/dropdown.svg")',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 12px center',
                            backgroundSize: '7.2px',
                            paddingRight: '28px'
                          }}
                        >
                          <option value="">SELECT AN ORDER</option>
                          {activeOrders.map((order: any) => (
                            <option key={order.id} value={order.id}>
                              {order.orderNumber}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  
                  {/* IS THIS URGENT? Prompt */}
                  <div style={{ marginBottom: '20px' }}>
                    <p
                      style={{
                        fontFamily: '"Futura PT Book"',
                        color: '#000000',
                        fontSize: '10px',
                        margin: '0 0 8px 0',
                        textTransform: 'uppercase'
                      }}
                    >
                      IS THIS URGENT?
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => setIsUrgent('yes')}
                        style={{
                          flex: 1,
                          height: '32px',
                          border: isUrgent === 'yes' ? '1.3px solid #EB1C24' : '1.3px solid #000000',
                          backgroundColor: '#FFFFFF',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: isUrgent === 'yes' ? '#EB1C24' : '#000000',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          borderRadius: '0'
                        }}
                      >
                        YES
                      </button>
                      <button
                        onClick={() => setIsUrgent('no')}
                        style={{
                          flex: 1,
                          height: '32px',
                          border: isUrgent === 'no' ? '1.3px solid #EB1C24' : '1.3px solid #000000',
                          backgroundColor: '#FFFFFF',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '10px',
                          color: isUrgent === 'no' ? '#EB1C24' : '#000000',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          borderRadius: '0'
                        }}
                      >
                        NO
                      </button>
                    </div>
                  </div>
                  
                  <textarea
                    value={priorityMessage}
                    onChange={(e) => setPriorityMessage(e.target.value.toUpperCase())}
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1.3px solid #000000',
                      fontFamily: '"Futura PT Book"',
                      fontSize: '11px',
                      resize: 'vertical',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                      textTransform: 'uppercase',
                      borderRadius: '0'
                    }}
                  />
                </div>
                <div className="px-0 md:px-0" style={{ marginTop: '2px', marginBottom: '20px', transform: 'translateY(-2px)' }}>
                  <button
                    onClick={handleSubmitPriorityMessage}
                    className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                    style={{
                      borderWidth: '1.3px',
                      color: '#EB1C24',
                      fontFamily: '"Futura PT Medium"',
                      backgroundColor: '#FFFFFF'
                    }}
                    type="button"
                  >
                    SUBMIT MESSAGE
                  </button>
                </div>

                {/* Order Tracking Section */}
                <div
                  className="border border-black bg-white/60 backdrop-blur-sm w-full mb-2 transition-all duration-300 ease-out"
                  style={{
                    borderWidth: '1.3px',
                    paddingTop: '20px',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    paddingBottom: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)'
                  }}
                >
                  <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '12px' }}>
                    <h2
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        color: '#EB1C24',
                        fontSize: '12px',
                        fontWeight: '500',
                        margin: '0',
                        textTransform: 'uppercase'
                      }}
                    >
                      ORDER TRACKING
                    </h2>
                  </div>
                  {(activeOrders.length > 0) ? (
                    <>
                      <select
                        value={selectedOrderId}
                        onChange={(e) => setSelectedOrderId(e.target.value)}
                        style={{
                          width: '100%',
                          height: '36px',
                          padding: '8px',
                          paddingLeft: '12px',
                          border: '1.3px solid #000000',
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          backgroundColor: '#FFFFFF',
                          boxSizing: 'border-box',
                          marginTop: '10px',
                          marginBottom: selectedOrderId ? '16px' : '10px',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          borderRadius: '0',
                          appearance: 'none',
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          backgroundImage: 'url("/assets/dropdown.svg")',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 12px center',
                          backgroundSize: '7.2px',
                          paddingRight: '28px'
                        }}
                      >
                        <option value="">SELECT AN ORDER</option>
                        {activeOrders.map((order: any) => (
                          <option key={order.id} value={order.id}>
                            {order.orderNumber}
                          </option>
                        ))}
                      </select>
                      
                      {/* Tracking Stages - Show when order is selected */}
                      {selectedOrderId && (
                        <div style={{ marginTop: '16px' }}>
                          {/* Order Number or Delivery Estimate Display */}
                          {currentTrackingStage === 9 ? (
                            // Show delivery estimate when status is "shipped" or "PACKAGE DELIVERED" for delivered orders
                            (() => {
                              const selectedOrder = activeOrders.find((o: any) => o.id === selectedOrderId);
                              const isDelivered = selectedOrder?.status === 'DELIVERED';
                              
                              // If delivered, show "PACKAGE DELIVERED" with date, time, and location
                              if (isDelivered) {
                                // Format delivery date to get weekday, month, and day
                                const formatDeliveryDate = (dateStr: string | undefined) => {
                                  if (!dateStr) return null;
                                  try {
                                    const date = new Date(dateStr);
                                    // Check if date is valid
                                    if (isNaN(date.getTime())) {
                                      return null;
                                    }
                                    const weekdays = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
                                    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
                                    return {
                                      weekday: weekdays[date.getDay()],
                                      month: months[date.getMonth()],
                                      day: date.getDate()
                                    };
                                  } catch (e) {
                                    return null;
                                  }
                                };
                                
                                const formatDeliveryTime = (timeStr: string | undefined) => {
                                  if (!timeStr) return null;
                                  // Format time with space between time and AM/PM (e.g., "9:07 AM")
                                  return timeStr.replace(/(\d+:\d+)\s*(AM|PM)/i, '$1 $2').toUpperCase();
                                };
                                
                                // Use deliveryDate if available, otherwise use order date as fallback
                                const dateToFormat = selectedOrder?.deliveryDate || selectedOrder?.date;
                                const deliveryDateInfo = formatDeliveryDate(dateToFormat);
                                const deliveryTimeFormatted = formatDeliveryTime(selectedOrder?.deliveryTime);
                                
                                // Format delivery location with signature information
                                const formatDeliveryLocation = () => {
                                  const location = selectedOrder?.deliveryLocation;
                                  const requiresSignature = selectedOrder?.requiresSignature;
                                  
                                  if (!location) {
                                    // Fallback to tracking number if available
                                    if (selectedOrder?.trackingNumber) {
                                      return `NO SIGNATURE: ${selectedOrder.trackingNumber}`;
                                    }
                                    return 'LOCATION UNAVAILABLE';
                                  }
                                  
                                  const signatureText = requiresSignature === true ? 'SIGNATURE' : 'NO SIGNATURE';
                                  return `${signatureText}: ${location.toUpperCase()}`;
                                };
                                
                                const deliveryLocation = formatDeliveryLocation();
                                
                                return (
                                  <div style={{ textAlign: 'center', marginBottom: '16px', marginTop: '-10px' }}>
                                    <p
                                      style={{
                                        fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
                                        color: '#909090',
                                        fontSize: '13px',
                                        margin: '0 0 2px 0',
                                        textTransform: 'uppercase'
                                      }}
                                    >
                                      PACKAGE DELIVERED
                                    </p>
                                    {deliveryDateInfo && (
                                      <>
                                        <p
                                          style={{
                                            fontFamily: '"Futura PT Medium"',
                                            color: '#000000',
                                            fontSize: '12px',
                                            margin: '0 0 0 0',
                                            textTransform: 'uppercase'
                                          }}
                                        >
                                          {deliveryDateInfo.month}
                                        </p>
                                        <p
                                          style={{
                                            fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                      color: '#EB1C24',
                                            fontSize: '20px',
                                            margin: '-2px 0 4px 0',
                                            textTransform: 'none'
                                          }}
                                        >
                                          {deliveryDateInfo.day}
                                        </p>
                                      </>
                                    )}
                                    {deliveryTimeFormatted && (
                                      <p
                                        style={{
                                          fontFamily: '"Futura PT Medium"',
                                          color: '#909090',
                                          fontSize: '11px',
                                          margin: '-2px 0 4px 0',
                                          textTransform: 'uppercase'
                                        }}
                                      >
                                        {deliveryTimeFormatted}
                                      </p>
                                    )}
                                    <p
                                      style={{
                                        fontFamily: '"Futura PT Medium"',
                                        color: '#EB1C24',
                                        fontSize: '9px',
                                        margin: '0',
                                        textTransform: 'uppercase'
                                      }}
                                    >
                                      {deliveryLocation}
                                    </p>
                                  </div>
                                );
                              }
                              
                              // Calculate delivery date based on order date and processing time
                              const calculateDeliveryDate = () => {
                                if (!selectedOrder?.date) {
                                  // Fallback: 5-7 business days from now
                                  const today = new Date();
                                  let deliveryDate = new Date(today);
                                  deliveryDate.setDate(today.getDate() + 5);
                                  while (deliveryDate.getDay() === 0 || deliveryDate.getDay() === 6) {
                                    deliveryDate.setDate(deliveryDate.getDate() + 1);
                                  }
                                  return deliveryDate;
                                }
                                
                                try {
                                  // Parse order date
                                  let orderDate: Date;
                                  if (selectedOrder.date.includes('-')) {
                                    const [month, day, year] = selectedOrder.date.split('-').map(Number);
                                    orderDate = new Date(year, month - 1, day);
                                  } else {
                                    orderDate = new Date(selectedOrder.date);
                                  }
                                  
                                  // Determine weeks based on processing time
                                  // Base timeline: 8 weeks with customization, 6 weeks without
                                  const processingTime = selectedOrder.processingTime || '6-8 WEEKS';
                                  let maxWeeks = 8; // Default: with customization
                                  
                                  if (processingTime.includes('4')) {
                                    // Rush processing: 4-6 weeks (no customization)
                                    maxWeeks = 6;
                                  } else if (processingTime.includes('10')) {
                                    // Customized units: up to 10 weeks
                                    maxWeeks = 10;
                                  } else {
                                    // Default 6-8 weeks: assume customization (8 weeks)
                                    maxWeeks = 8;
                                  }
                                  
                                  // Calculate max delivery date
                                  const deliveryDate = new Date(orderDate);
                                  deliveryDate.setDate(deliveryDate.getDate() + (maxWeeks * 7));
                                  
                                  // Ensure it's a weekday
                                  while (deliveryDate.getDay() === 0 || deliveryDate.getDay() === 6) {
                                    deliveryDate.setDate(deliveryDate.getDate() + 1);
                                  }
                                  
                                  return deliveryDate;
                                } catch (e) {
                                  // Fallback
                                  const today = new Date();
                                  let deliveryDate = new Date(today);
                                  deliveryDate.setDate(today.getDate() + 5);
                                  while (deliveryDate.getDay() === 0 || deliveryDate.getDay() === 6) {
                                    deliveryDate.setDate(deliveryDate.getDate() + 1);
                                  }
                                  return deliveryDate;
                                }
                              };
                              
                              const deliveryDate = calculateDeliveryDate();
                              const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
                              
                              const month = months[deliveryDate.getMonth()];
                              const day = deliveryDate.getDate();
                              
                              return (
                                <div style={{ textAlign: 'center', marginBottom: '16px', marginTop: '-10px' }}>
                                  <p
                                    style={{
                                      fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
                                      color: '#909090',
                                      fontSize: '13px',
                                      margin: '0 0 2px 0',
                                      textTransform: 'uppercase'
                                    }}
                                  >
                                    DELIVERY ESTIMATE
                                  </p>
                                  <p
                    style={{
                                      fontFamily: '"Futura PT Medium"',
                                      color: '#000000',
                                      fontSize: '12px',
                                      margin: '0 0 0 0',
                                      textTransform: 'uppercase'
                                    }}
                                  >
                                    {month}
                                  </p>
                                  <p
                                    style={{
                      fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                                      color: '#EB1C24',
                                      fontSize: '22px',
                                      margin: '-2px 0 0 0',
                      textTransform: 'none'
                    }}
                                  >
                                    {day}
                                  </p>
                                </div>
                              );
                            })()
                          ) : (
                            // Show "ESTIMATED DELIVERY" with date or "DELIVERED" for delivered orders
                            (() => {
                              const selectedOrder = activeOrders.find((o: any) => o.id === selectedOrderId);
                              const isDelivered = selectedOrder?.status === 'DELIVERED';
                              
                              if (isDelivered) {
                                // Format delivery date to get weekday, month, and day
                                const formatDeliveryDate = (dateStr: string | undefined) => {
                                  if (!dateStr) return null;
                                  try {
                                    const date = new Date(dateStr);
                                    // Check if date is valid
                                    if (isNaN(date.getTime())) {
                                      return null;
                                    }
                                    const weekdays = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
                                    const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
                                    return {
                                      weekday: weekdays[date.getDay()],
                                      month: months[date.getMonth()],
                                      day: date.getDate()
                                    };
                                  } catch (e) {
                                    return null;
                                  }
                                };
                                
                                const formatDeliveryTime = (timeStr: string | undefined) => {
                                  if (!timeStr) return null;
                                  // Format time with space between time and AM/PM (e.g., "9:07 AM")
                                  return timeStr.replace(/(\d+:\d+)\s*(AM|PM)/i, '$1 $2').toUpperCase();
                                };
                                
                                // Use deliveryDate if available, otherwise use order date as fallback
                                const dateToFormat = selectedOrder?.deliveryDate || selectedOrder?.date;
                                const deliveryDateInfo = formatDeliveryDate(dateToFormat);
                                const deliveryTimeFormatted = formatDeliveryTime(selectedOrder?.deliveryTime);
                                
                                // Format delivery location with signature information
                                const formatDeliveryLocation = () => {
                                  const location = selectedOrder?.deliveryLocation;
                                  const requiresSignature = selectedOrder?.requiresSignature;
                                  
                                  if (!location) {
                                    // Fallback to tracking number if available
                                    if (selectedOrder?.trackingNumber) {
                                      return `NO SIGNATURE: ${selectedOrder.trackingNumber}`;
                                    }
                                    return 'LOCATION UNAVAILABLE';
                                  }
                                  
                                  const signatureText = requiresSignature === true ? 'SIGNATURE' : 'NO SIGNATURE';
                                  return `${signatureText}: ${location.toUpperCase()}`;
                                };
                                
                                const deliveryLocation = formatDeliveryLocation();
                                
                                return (
                                  <div style={{ marginBottom: '16px', marginTop: '-10px', textAlign: 'center' }}>
                                    <p
                    style={{
                                        fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
                                        color: '#909090',
                                        fontSize: '12px',
                                        margin: '0 0 2px 0',
                                        textTransform: 'uppercase'
                                      }}
                                    >
                                      PACKAGE DELIVERED
                                    </p>
                                    {deliveryDateInfo && (
                                      <>
                                        <p
                    style={{
                                            fontFamily: '"Futura PT Medium"',
                                            color: '#000000',
                                            fontSize: '12px',
                                            margin: '0 0 0 0',
                                            textTransform: 'uppercase'
                                          }}
                                        >
                                          {deliveryDateInfo.month}
                                        </p>
                                        <p
                                          style={{
                      fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                                            color: '#EB1C24',
                                            fontSize: '20px',
                                            margin: '-2px 0 4px 0',
                                            textTransform: 'none'
                                          }}
                                        >
                                          {deliveryDateInfo.day}
                                        </p>
                                      </>
                                    )}
                                    {deliveryTimeFormatted && (
                                      <p
                                        style={{
                                          fontFamily: '"Futura PT Demi"',
                                          color: '#909090',
                      fontSize: '11px',
                                          margin: '-2px 0 4px 0',
                      textTransform: 'uppercase'
                                        }}
                                      >
                                        {deliveryTimeFormatted}
                                      </p>
                                    )}
                                    <p
                                      style={{
                                        fontFamily: '"Futura PT Medium"',
                                        color: '#EB1C24',
                                        fontSize: '9px',
                                        margin: '0',
                                        textTransform: 'uppercase'
                                      }}
                                    >
                                      {deliveryLocation}
                                    </p>
                                  </div>
                                );
                              }
                              
                              // Calculate estimated delivery date based on order date and processing time
                              const calculateEstimatedDelivery = () => {
                                if (!selectedOrder?.date) return null;
                                
                                try {
                                  // Parse order date (could be MM-DD-YYYY or other formats)
                                  let orderDate: Date;
                                  if (selectedOrder.date.includes('-')) {
                                    const [month, day, year] = selectedOrder.date.split('-').map(Number);
                                    orderDate = new Date(year, month - 1, day);
                                  } else {
                                    orderDate = new Date(selectedOrder.date);
                                  }
                                  
                                  // Determine weeks based on processing time
                                  // Base timeline: 8 weeks with customization, 6 weeks without
                                  const processingTime = selectedOrder.processingTime || '6-8 WEEKS';
                                  let maxWeeks = 8; // Default: with customization
                                  
                                  if (processingTime.includes('4')) {
                                    // Rush processing: 4-6 weeks (no customization)
                                    maxWeeks = 6;
                                  } else if (processingTime.includes('10')) {
                                    // Customized units: up to 10 weeks
                                    maxWeeks = 10;
                                  } else {
                                    // Default 6-8 weeks: assume customization (8 weeks)
                                    maxWeeks = 8;
                                  }
                                  
                                  // Calculate max delivery date
                                  const deliveryDate = new Date(orderDate);
                                  deliveryDate.setDate(deliveryDate.getDate() + (maxWeeks * 7));
                                  
                                  // Ensure it's a weekday (Monday-Friday)
                                  while (deliveryDate.getDay() === 0 || deliveryDate.getDay() === 6) {
                                    deliveryDate.setDate(deliveryDate.getDate() + 1);
                                  }
                                  
                                  const weekdays = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
                                  const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
                                  
                                  return {
                                    weekday: weekdays[deliveryDate.getDay()],
                                    month: months[deliveryDate.getMonth()],
                                    day: deliveryDate.getDate()
                                  };
                                } catch (e) {
                                  return null;
                                }
                              };
                              
                              const deliveryInfo = calculateEstimatedDelivery();
                              
                              return (
                                <div style={{ marginBottom: '16px', marginTop: '-10px', textAlign: 'center' }}>
                                  <p
                    style={{
                                      fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif',
                                      color: '#909090',
                                      fontSize: '13px',
                                      margin: '0 0 2px 0',
                                      textTransform: 'uppercase'
                                    }}
                                  >
                                    DELIVERY ESTIMATE
                                  </p>
                                  {deliveryInfo && (
                                    <>
                                      <p
                                        style={{
                                          fontFamily: '"Futura PT Medium"',
                                          color: '#000000',
                                          fontSize: '12px',
                                          margin: '0 0 0 0',
                                          textTransform: 'uppercase'
                                        }}
                                      >
                                        {deliveryInfo.month}
                                      </p>
                                      <p
                                        style={{
                                          fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                                          color: '#EB1C24',
                                          fontSize: '22px',
                                          margin: '-2px 0 0 0',
                                          textTransform: 'none'
                                        }}
                                      >
                                        {deliveryInfo.day}
                                      </p>
                                    </>
                                  )}
                                </div>
                              );
                            })()
                          )}
                          
                          {/* Tracking Stages */}
                          <div style={{ position: 'relative', paddingLeft: '12px' }}>
                            {(() => {
                              const selectedOrder = activeOrders.find((o: any) => o.id === selectedOrderId);
                              const processingTime = selectedOrder?.processingTime || '6-8 WEEKS';
                              const hasCustomization = !processingTime.includes('4'); // Rush (4-6 weeks) = no customization
                              
                              // Filter out customizing stage (index 6) if no customization
                              const filteredStages = trackingStages.map((stage, originalIndex) => ({ stage, originalIndex }))
                                .filter(({ originalIndex }) => {
                                  if (originalIndex === 6) { // CUSTOMIZING stage
                                    return hasCustomization;
                                  }
                                  return true;
                                });
                              
                              // Adjust currentTrackingStage to account for filtered stages
                              let adjustedCurrentStage = currentTrackingStage;
                              if (!hasCustomization && currentTrackingStage > 6) {
                                adjustedCurrentStage = currentTrackingStage - 1;
                              } else if (!hasCustomization && currentTrackingStage === 6) {
                                adjustedCurrentStage = 5; // Move to prepping stage
                              }
                              
                              return filteredStages.map(({ stage, originalIndex: index }) => {
                                // Adjust stage indices for display
                                const displayIndex = filteredStages.findIndex(s => s.originalIndex === index);
                                const isCompleted = displayIndex < adjustedCurrentStage;
                                const isCurrent = displayIndex === adjustedCurrentStage;
                                const isUpcoming = displayIndex > adjustedCurrentStage;
                                const isExpanded = expandedStages.has(index);
                                
                                // Check if this is the last stage and order is delivered
                                const isLastStage = index === 8; // ORDER SHIPPED is the last stage
                                const isDelivered = selectedOrder?.status === 'DELIVERED';
                                const isDeliveredLastStage = isLastStage && isDelivered;
                                
                                // Get stage duration and progress
                                const stageDuration = getStageDuration(index, hasCustomization);
                                const progress = isDeliveredLastStage ? 100 : getStageProgress(index, selectedOrder?.date, hasCustomization);
                                const durationText = index === 0 ? 'PENDING' : (stageDuration === 0 ? 'SAME DAY' : stageDuration === 1 ? '1 DAY' : stageDuration === 28 ? '4 WEEKS' : `${stageDuration} DAYS`);
                                
                                // Only allow expansion for completed or current steps, not upcoming ones
                                const isExpandable = isCompleted || isCurrent || isDeliveredLastStage;

                              return (
                                <div key={index} style={{ position: 'relative', marginBottom: displayIndex < filteredStages.length - 1 ? '0' : '0' }}>
                                  {/* Connector Line (before each stage except first) */}
                                  {displayIndex > 0 && (
                                    <div
                                      style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '-21px',
                                        width: '2px',
                                        height: '20px',
                                        backgroundColor: isCompleted ? '#EB1C24' : '#E0E0E0',
                                        zIndex: 0
                                      }}
                                    />
                                  )}

                                  <div
                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '0',
                                      border: (isCurrent || isDeliveredLastStage) ? '1.3px solid #EB1C24' : '1.3px solid #000000',
                                      backgroundColor: 'transparent',
                                      marginTop: displayIndex > 0 ? '12px' : '0',
                                      marginBottom: '20px',
                                      position: 'relative',
                                      zIndex: 1,
                                      cursor: isExpandable ? 'pointer' : 'default'
                                    }}
                                    onClick={() => {
                                      if (isExpandable) {
                                        toggleStageExpansion(index);
                                      }
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px' }}>
                                    {/* Stage Indicator */}
                                    <div
                                      style={{
                                        width: '21.6px',
                                        height: '21.6px',
                                        borderRadius: '50%',
                                        backgroundColor: isCompleted || isCurrent || isDeliveredLastStage
                                          ? '#FFFFFF'
                                          : '#E0E0E0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        border: (isCompleted || isCurrent || isDeliveredLastStage) ? '1px solid #000000' : 'none'
                                      }}
                                    >
                                      {isCompleted || isDeliveredLastStage ? (
                                        <img
                                          src="/assets/premium-check.svg"
                                          alt="Completed"
                                          style={{ width: '10.5px', height: '10.5px' }}
                                        />
                                      ) : isCurrent ? (
                                        <span 
                                          style={{ 
                                            color: '#EB1C24', 
                                            fontSize: '10px', 
                                            fontWeight: 'bold',
                                            animation: 'pulsate 1s ease-in-out infinite',
                                            display: 'block',
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            backgroundColor: '#EB1C24'
                                          }}
                                        />
                                      ) : null}
                </div>

                                    {/* Stage Label */}
                                    <div style={{ flex: 1 }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <p
                                          style={{
                                            fontFamily: isCurrent ? '"Futura PT Medium"' : '"Futura PT Book"',
                                            color: isCompleted ? '#000000' : (isCurrent ? '#EB1C24' : '#909090'),
                      fontSize: '10px',
                                            margin: '0',
                                            textTransform: 'uppercase',
                                            fontWeight: isCurrent ? '500' : '400'
                                          }}
                                        >
                                          {stage.name}
                                        </p>
                                        {(isCurrent || isCompleted) && (() => {
                                          const selectedOrder = activeOrders.find((o: any) => o.id === selectedOrderId);
                                          const processingTime = selectedOrder?.processingTime || '6-8 WEEKS';
                                          const hasCustomization = !processingTime.includes('4'); // Rush (4-6 weeks) = no customization
                                          const timestamp = getStageTimestamp(index, selectedOrder?.date, hasCustomization);
                                          return timestamp ? (
                                            <p
                                              style={{
                      fontFamily: '"Futura PT Book"',
                                                color: '#000000',
                                                fontSize: '9px',
                                                margin: '0',
                                                textTransform: 'uppercase',
                                                marginLeft: '12px'
                                              }}
                                            >
                                              {timestamp.date}
                                            </p>
                                          ) : null;
                                        })()}
                                      </div>
                                      {(isCurrent || isCompleted) && (
                                        <p
                                          style={{
                          fontFamily: '"Futura PT Book"',
                                            color: '#909090',
                                            fontSize: '9px',
                                            margin: '4px 0 0 0',
                                            textTransform: 'uppercase',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start'
                                          }}
                                        >
                                          <span>{stage.description}</span>
                                          {(() => {
                                            const selectedOrder = activeOrders.find((o: any) => o.id === selectedOrderId);
                                            const processingTime = selectedOrder?.processingTime || '6-8 WEEKS';
                                            const hasCustomization = !processingTime.includes('4'); // Rush (4-6 weeks) = no customization
                                            const timestamp = getStageTimestamp(index, selectedOrder?.date, hasCustomization);
                                            return timestamp ? (
                                              <span
                                                style={{
                                                  fontFamily: '"Futura PT Medium"',
                                                  color: '#EB1C24',
                                                  marginLeft: '12px',
                                                  whiteSpace: 'nowrap'
                                                }}
                                              >
                                                {timestamp.time}
                                              </span>
                                            ) : null;
                                          })()}
                                        </p>
                                      )}
                                    </div>
                                    </div>
                                    
                                    {/* Expanded Content */}
                                    {isExpanded && isExpandable && (
                                      <div style={{ 
                                        padding: '0 12px 12px 12px', 
                                        marginTop: '0px',
                                        paddingTop: '6px'
                                      }}>
                                        {/* Selection Icons for specific statuses */}
                                        {(() => {
                                          const selectedOrder = activeOrders.find((o: any) => o.id === selectedOrderId);
                                          if (!selectedOrder) return null;
                                          const productName = selectedOrder.productName || 'NOIR';
                                          
                                          // Helper functions to check if a selection is non-default
                                          const isNonDefaultCapSize = (capSize: string) => {
                                            // Default is 'M', flexible caps (XXS/XS/S, S/M/L) are always non-default
                                            return capSize && capSize !== 'M' && (capSize === 'XXS/XS/S' || capSize === 'S/M/L' || capSize === 'L' || capSize === 'S' || capSize === 'XS' || capSize === 'XXS');
                                          };
                                          
                                          const isNonDefaultLength = (length: string) => {
                                            // Default is '24"'
                                            return length && length !== '24"';
                                          };
                                          
                                          const isNonDefaultDensity = (density: string, productName: string) => {
                                            // Default is '200%' for most products, '250%' for BLANCO
                                            const defaultDensity = productName === 'BLANCO' ? '250%' : '200%';
                                            return density && density !== defaultDensity;
                                          };
                                          
                                          const isNonDefaultLace = (lace: string) => {
                                            // Default is '13X6'
                                            return lace && lace !== '13X6';
                                          };
                                          
                                          const isNonDefaultTexture = (texture: string) => {
                                            // Default is 'SILKY', so 'KINKY' and others are non-default
                                            return texture && texture !== 'SILKY';
                                          };
                                          
                                          const isNonDefaultHairline = (hairline: string) => {
                                            // Default is 'NATURAL'
                                            return hairline && hairline !== 'NATURAL';
                                          };
                                          
                                          const isNonDefaultColor = (color: string, productName: string) => {
                                            // Default is 'OFF BLACK' for most products, 'PLATINUM' for BLANCO
                                            const defaultColor = productName === 'BLANCO' ? 'PLATINUM' : 'OFF BLACK';
                                            return color && color !== defaultColor;
                                          };
                                          
                                          // Helper to render icon box
                                          const renderIconBox = (label: string, iconSrc: string, displayText: string, iconSize: string = '57px', iconTop: string = '55%') => (
                                            <div
                                              className="border relative text-center border-black bg-white"
                                              style={{
                                                borderWidth: '1.3px',
                                                width: '50px',
                                                height: '80px',
                                                boxSizing: 'border-box',
                                                padding: '0',
                                                overflow: 'visible'
                                              }}
                                            >
                                              <p
                                                className="text-[10px] text-black absolute top-0 left-1/2 transform -translate-x-1/2 w-full"
                                                style={{ fontFamily: '"Covered By Your Grace", cursive' }}
                                              >
                                                {label}
                                              </p>
                                              <div
                                                className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center"
                                                style={{
                                                  width: iconSize,
                                                  height: iconSize,
                                                  overflow: 'visible',
                                                  top: iconTop,
                                                  transform: 'translateX(-50%) translateY(-50%)'
                                                }}
                                              >
                                                <img
                                                  alt={label}
                                                  src={iconSrc}
                                                  style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'contain',
                                                    display: 'block',
                                                    position: 'relative'
                                                  }}
                                                />
                                              </div>
                                              <p 
                                                className="absolute bottom-[-6.9px] left-1/2 transform -translate-x-1/2 text-[9px] w-full font-medium text-center" 
                                                style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", Futura, Inter, sans-serif' }}
                                              >
                                                {displayText}
                                              </p>
                                            </div>
                                          );
                                          
                                          // SOURCING (index 1): length, density, texture (only non-defaults)
                                          if (index === 1) {
                                            // Check if order has multiple units
                                            const hasMultipleUnits = selectedOrder.units && Array.isArray(selectedOrder.units) && selectedOrder.units.length > 1;
                                            
                                            if (hasMultipleUnits) {
                                              // Render icons for all units side-by-side (show defaults except silky texture)
                                              const icons: JSX.Element[] = [];
                                              selectedOrder.units.forEach((unit: any) => {
                                                // Show length (including default)
                                                if (unit.length) {
                                                  const lengthSize = ['16"', '18"', '20"', '22"'].includes(unit.length) ? '72px' : '42px';
                                                  const lengthTop = ['16"', '18"', '20"', '22"'].includes(unit.length) ? '50%' : 'calc(58% - 1px)';
                                                  icons.push(
                                                    renderIconBox('LENGTH', getLengthIcon(unit.length, productName), getLengthDisplayText(unit.length), lengthSize, lengthTop)
                                                  );
                                                }
                                                // Show density (including default)
                                                if (unit.density) {
                                                  const densitySize = productName === 'BLANCO' ? '80px' : '57px';
                                                  icons.push(
                                                    renderIconBox('DENSITY', getDensityIcon(productName), getDensityDisplayText(unit.density), densitySize)
                                                  );
                                                }
                                                // Only show texture if non-default (not SILKY)
                                                if (unit.texture && isNonDefaultTexture(unit.texture)) {
                                                  icons.push(
                                                    renderIconBox('TEXTURE', getTextureIcon(productName), getTextureDisplayText(unit.texture), productName === 'BLANCO' ? '35.48px' : '83px', productName === 'BLANCO' ? 'calc(50% + 5px)' : 'calc(50% + 2px)')
                                                  );
                                                }
                                              });
                                              
                                              if (icons.length > 0) {
                                                return (
                                                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', justifyContent: 'flex-start', marginLeft: '2px' }}>
                                                    {icons}
                                                  </div>
                                                );
                                              }
                                            } else {
                                              // Single unit - show defaults except silky texture
                                              const icons: JSX.Element[] = [];
                                              
                                              // Show length (including default)
                                              if (selectedOrder.length) {
                                                const lengthSize = ['16"', '18"', '20"', '22"'].includes(selectedOrder.length) ? '72px' : '42px';
                                                const lengthTop = ['16"', '18"', '20"', '22"'].includes(selectedOrder.length) ? '50%' : 'calc(58% - 1px)';
                                                icons.push(
                                                  renderIconBox('LENGTH', getLengthIcon(selectedOrder.length, productName), getLengthDisplayText(selectedOrder.length), lengthSize, lengthTop)
                                                );
                                              }
                                              
                                              // Show density (including default)
                                              if (selectedOrder.density) {
                                                const densitySize = productName === 'BLANCO' ? '80px' : '57px';
                                                icons.push(
                                                  renderIconBox('DENSITY', getDensityIcon(productName), getDensityDisplayText(selectedOrder.density), densitySize)
                                                );
                                              }
                                              
                                              // Only show texture if non-default (not SILKY)
                                              if (selectedOrder.texture && isNonDefaultTexture(selectedOrder.texture)) {
                                                icons.push(
                                                  renderIconBox('TEXTURE', getTextureIcon(productName), getTextureDisplayText(selectedOrder.texture), productName === 'BLANCO' ? '35.48px' : '83px', productName === 'BLANCO' ? 'calc(50% + 5px)' : 'calc(50% + 2px)')
                                                );
                                              }
                                              
                                              if (icons.length > 0) {
                                                return (
                                                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', justifyContent: 'flex-start', marginLeft: '2px' }}>
                                                    {icons}
                                                  </div>
                                                );
                                              }
                                            }
                                          }
                                          
                                          // CONSTRUCTING UNIT (index 2): cap size, lace, hairline (only non-defaults)
                                          if (index === 2) {
                                            // Check if order has multiple units
                                            const hasMultipleUnits = selectedOrder.units && Array.isArray(selectedOrder.units) && selectedOrder.units.length > 1;
                                            
                                            if (hasMultipleUnits) {
                                              // Render icons for all units side-by-side (show defaults except natural hairline)
                                              const icons: JSX.Element[] = [];
                                              selectedOrder.units.forEach((unit: any) => {
                                                // Show cap size (including default)
                                                if (unit.capSize) {
                                                  icons.push(
                                                    renderIconBox('CAP SIZE', getCapSizeIcon(), getCapSizeDisplayText(unit.capSize), '78px', '53%')
                                                  );
                                                }
                                                // Show lace (including default)
                                                if (unit.lace) {
                                                  const laceSize = productName === 'BLANCO' ? '44px' : '74px';
                                                  icons.push(
                                                    renderIconBox('LACE', getLaceIcon(productName), getLaceDisplayText(unit.lace), laceSize, '52%')
                                                  );
                                                }
                                                // Only show hairline if non-default (not NATURAL)
                                                if (unit.hairline && isNonDefaultHairline(unit.hairline)) {
                                                  const hairlineSize = productName === 'BLANCO' ? '45px' : '75px';
                                                  icons.push(
                                                    renderIconBox('HAIRLINE', getHairlineIcon(unit.hairline), getHairlineDisplayText(unit.hairline), hairlineSize)
                                                  );
                                                }
                                              });
                                              
                                              if (icons.length > 0) {
                                                return (
                                                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                                    {icons}
                                                  </div>
                                                );
                                              }
                                            } else {
                                              // Single unit - show defaults except natural hairline
                                              const icons: JSX.Element[] = [];
                                              
                                              // Show cap size (including default)
                                              if (selectedOrder.capSize) {
                                                icons.push(
                                                  renderIconBox('CAP SIZE', getCapSizeIcon(), getCapSizeDisplayText(selectedOrder.capSize), '78px', '53%')
                                                );
                                              }
                                              
                                              // Show lace (including default)
                                              if (selectedOrder.lace) {
                                                const laceSize = productName === 'BLANCO' ? '44px' : '74px';
                                                icons.push(
                                                  renderIconBox('LACE', getLaceIcon(productName), getLaceDisplayText(selectedOrder.lace), laceSize, '52%')
                                                );
                                              }
                                              
                                              // Only show hairline if non-default (not NATURAL)
                                              if (selectedOrder.hairline && isNonDefaultHairline(selectedOrder.hairline)) {
                                                const hairlineSize = productName === 'BLANCO' ? '45px' : '75px';
                                                icons.push(
                                                  renderIconBox('HAIRLINE', getHairlineIcon(selectedOrder.hairline), getHairlineDisplayText(selectedOrder.hairline), hairlineSize)
                                                );
                                              }
                                              
                                              if (icons.length > 0) {
                                                return (
                                                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', justifyContent: 'flex-start', marginLeft: '2px' }}>
                                                    {icons}
                                                  </div>
                                                );
                                              }
                                            }
                                          }
                                          
                                          // CUSTOMIZING (index 6): color, styling, add ons (only non-defaults)
                                          if (index === 6) {
                                            // Check if order has multiple units
                                            const hasMultipleUnits = selectedOrder.units && Array.isArray(selectedOrder.units) && selectedOrder.units.length > 1;
                                            
                                            // Color icon needs special handling - it's a color circle
                                            const renderColorIconBox = (unitColor: string) => {
                                              const colorCode = getColorCode(unitColor, productName);
                                              return (
                                                <div
                                                  className="border relative text-center border-black bg-white"
                                                  style={{
                                                    borderWidth: '1.3px',
                                                    width: '50px',
                                                    height: '80px',
                                                    boxSizing: 'border-box',
                                                    padding: '0',
                                                    overflow: 'visible'
                                                  }}
                                                >
                                                  <p
                                                    className="text-[10px] text-black absolute top-0 left-1/2 transform -translate-x-1/2 w-full"
                                                    style={{ fontFamily: '"Covered By Your Grace", cursive' }}
                                                  >
                                                    COLOR
                                                  </p>
                                                  <div
                                                    className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center"
                                                    style={{
                                                      width: '35px',
                                                      height: '35px',
                                                      overflow: 'visible',
                                                      top: '55%',
                                                      transform: 'translateX(-50%) translateY(-50%)'
                                                    }}
                                                  >
                                                    <div
                                                      style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        backgroundColor: '#909090',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        position: 'relative'
                                                      }}
                                                    >
                                                      <div
                                                        style={{
                                                          width: '81%',
                                                          height: '81%',
                                                          backgroundColor: '#FFFFFF',
                                                          borderRadius: '50%',
                                                          display: 'flex',
                                                          alignItems: 'center',
                                                          justifyContent: 'center'
                                                        }}
                                                      >
                                                        <div
                                                          style={{
                                                            width: '76%',
                                                            height: '76%',
                                                            backgroundColor: colorCode,
                                                            borderRadius: '50%'
                                                          }}
                                                        />
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <p 
                                                    className="absolute bottom-[-6.9px] left-1/2 transform -translate-x-1/2 text-[9px] w-full font-medium text-center" 
                                                    style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", Futura, Inter, sans-serif' }}
                                                  >
                                                    {getColorDisplayText(unitColor)}
                                                  </p>
                                                </div>
                                              );
                                            };
                                            
                                            if (hasMultipleUnits) {
                                              // Render icons for all units side-by-side (only non-defaults)
                                              const icons: JSX.Element[] = [];
                                              selectedOrder.units.forEach((unit: any) => {
                                                // Only show color if non-default
                                                if (unit.color && isNonDefaultColor(unit.color, productName)) {
                                                  icons.push(renderColorIconBox(unit.color));
                                                }
                                                
                                                // Only add styling icon if it has a selection (not "NONE")
                                                const hasStyling = unit.styling && unit.styling !== 'NONE';
                                                if (hasStyling) {
                                                  icons.push(renderIconBox('STYLING', getStylingIcon(unit.styling), getStylingDisplayText(unit.styling), '80px', '52.5%'));
                                                }
                                                
                                                // Only add add-ons icon if it has selections
                                                const hasAddOns = unit.addOns && Array.isArray(unit.addOns) && unit.addOns.length > 0;
                                                if (hasAddOns) {
                                                  icons.push(renderIconBox('ADD-ONS', getAddOnsIcon(unit.addOns), getAddOnsDisplayText(unit.addOns), '80px', '52.5%'));
                                                }
                                              });
                                              
                                              if (icons.length > 0) {
                                                return (
                                                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', justifyContent: 'flex-start', marginLeft: '2px' }}>
                                                    {icons}
                                                  </div>
                                                );
                                              }
                                            } else {
                                              // Single unit - only show non-default selections
                                              const icons: JSX.Element[] = [];
                                              
                                              // Only show color if non-default
                                              if (selectedOrder.color && isNonDefaultColor(selectedOrder.color, productName)) {
                                                icons.push(renderColorIconBox(selectedOrder.color));
                                              }
                                              
                                              // Only add styling icon if it has a selection (not "NONE")
                                              const hasStyling = selectedOrder.styling && selectedOrder.styling !== 'NONE';
                                              if (hasStyling) {
                                                icons.push(renderIconBox('STYLING', getStylingIcon(selectedOrder.styling), getStylingDisplayText(selectedOrder.styling), '80px', '52.5%'));
                                              }
                                              
                                              // Only add add-ons icon if it has selections
                                              const hasAddOns = selectedOrder.addOns && Array.isArray(selectedOrder.addOns) && selectedOrder.addOns.length > 0;
                                              if (hasAddOns) {
                                                icons.push(renderIconBox('ADD-ONS', getAddOnsIcon(selectedOrder.addOns), getAddOnsDisplayText(selectedOrder.addOns), '80px', '52.5%'));
                                              }
                                              
                                              if (icons.length > 0) {
                                                return (
                                                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', justifyContent: 'flex-start', marginLeft: '2px' }}>
                                                    {icons}
                                                  </div>
                                                );
                                              }
                                            }
                                          }
                                          
                                          // For all other stages (0, 3, 4, 5, 7, 8), show silky texture icon as base design
                                          // Stages with icons: 1 (SOURCING), 2 (CONSTRUCTING), 6 (CUSTOMIZING)
                                          // Prepping stage (index 5), Arrived at Hub (index 4), Shipped to Hub (index 3), and Package Shipped (index 8) use line icons instead
                                          if (index !== 1 && index !== 2 && index !== 6) {
                                            // Prepping stage (index 5) uses line icon
                                            if (index === 5) {
                                              return (
                                                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', justifyContent: 'flex-start', marginLeft: '2px' }}>
                                                  {renderIconBox('', getLineIcon(), '', '40px', '55%')}
                                                </div>
                                              );
                                            }
                                            // Arrived at Hub stage (index 4) uses shipping icon
                                            if (index === 4) {
                                              return (
                                                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', justifyContent: 'flex-start', marginLeft: '2px' }}>
                                                  {renderIconBox('', getShippingIcon(), '', '40px', '55%')}
                                                </div>
                                              );
                                            }
                                            // Shipped to Hub (index 3) and Package Shipped (index 8) use shipping icon
                                            if (index === 3 || index === 8) {
                                              return (
                                                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', justifyContent: 'flex-start', marginLeft: '2px' }}>
                                                  {renderIconBox('', getShippingIcon(), '', '40px', '55%')}
                                                </div>
                                              );
                                            }
                                            // Other stages use silky texture icon
                                            const textureIconSize = productName === 'BLANCO' ? '35.48px' : '83px';
                                            const textureIconTop = productName === 'BLANCO' ? 'calc(50% + 5px)' : 'calc(50% + 2px)';
                                            return (
                                              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', justifyContent: 'flex-start', marginLeft: '2px' }}>
                                                {renderIconBox('TEXTURE', getTextureIcon(productName), 'SILKY', textureIconSize, textureIconTop)}
                                              </div>
                                            );
                                          }
                                          
                                          return null;
                                        })()}
                                        
                                        {/* Gray line above estimated duration */}
                                        <div
                                          style={{
                                            width: 'calc(100% - 4px)',
                                            height: '1px',
                                            backgroundColor: '#E0E0E0',
                                            margin: '0 auto 8px auto'
                                          }}
                                        />
                                        {/* Timeframe */}
                                        <p
                                          style={{
                                            fontFamily: '"Futura PT Book"',
                                            color: '#909090',
                                            fontSize: '9px',
                                            margin: '0 0 5px 0',
                      textTransform: 'uppercase'
                                          }}
                                        >
                                          ESTIMATED DURATION: {durationText}
                                        </p>
                                        
                                        {/* Progress Bar */}
                                        {(isCurrent || isCompleted || isDeliveredLastStage) && (
                                          <div style={{ marginTop: '3px' }}>
                                            <div
                    style={{
                      width: '100%',
                                                height: '7px',
                                                backgroundColor: '#E0E0E0',
                                                borderRadius: '0',
                                                overflow: 'hidden',
                                                position: 'relative',
                                                border: progress === 0 ? '1px solid #909090' : 'none'
                                              }}
                                            >
                                              <div
                                                style={{
                                                  width: `${progress}%`,
                                                  height: '100%',
                                                  backgroundColor: isCompleted || isDeliveredLastStage ? '#EB1C24' : '#EB1C24',
                                                  transition: 'width 0.3s ease',
                                                  borderRadius: '4px'
                    }}
                  />
                </div>
                                            {!(isDeliveredLastStage && index === 8) && (
                                              <p
                                                style={{
                          fontFamily: '"Futura PT Book"',
                                                    color: isCompleted ? '#EB1C24' : '#000000',
                                                    fontSize: '9px',
                                                    margin: '4px 0 0 0',
                          textTransform: 'uppercase'
                                                }}
                                              >
                                                {isDeliveredLastStage ? 'STATUS: DELIVERED' : (isCompleted ? 'STATUS: COMPLETE' : `STATUS: ${Math.round(progress)}% COMPLETE`)}
                                              </p>
                                            )}
                                          </div>
                                        )}
                                        
                                        {isUpcoming && index !== 0 && (
                                          <p
                                            style={{
                                              fontFamily: '"Futura PT Book"',
                                              color: '#909090',
                                              fontSize: '9px',
                                              margin: '8px 0 0 0',
                                              textTransform: 'uppercase'
                                            }}
                                          >
                                            PENDING
                                          </p>
                                        )}
                                        
                                        {/* Tracking Number and Shipping Status for ORDER SHIPPED */}
                                        {index === 8 && (isCurrent || isCompleted || isDeliveredLastStage) && (() => {
                                          const selectedOrder = activeOrders.find((o: any) => o.id === selectedOrderId);
                                          const subStatus = getOrderShippedSubStatus(selectedOrder);
                                          
                                          const isPreparing = subStatus === 'PREPARING LABEL';
                                          const isTrackingNumber = subStatus !== 'PREPARING LABEL' && subStatus !== 'DELIVERED';
                                          const isDelivered = subStatus === 'DELIVERED';
                                          
                                          return (
                                            <div style={{ marginTop: isDelivered ? '1px' : '6px' }}>
                                              {!isDelivered && (
                                                <div
                                                  style={{
                                                    width: 'calc(100% - 4px)',
                                                    height: '1px',
                                                    backgroundColor: '#E0E0E0',
                                                    margin: '0 auto 12px auto'
                                                  }}
                                                />
                                              )}
                                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {/* Show only the current status */}
                                                {isPreparing && (
                                                  <p
                                                    style={{
                                                      fontFamily: '"Futura PT Book"',
                                                      color: isCurrent ? '#EB1C24' : '#909090',
                                                      fontSize: '9px',
                                                      margin: '4px 0 0 0',
                                                      textTransform: 'uppercase'
                                                    }}
                                                  >
                                                    STATUS: PREPARING LABEL
                                                  </p>
                                                )}
                                                {isTrackingNumber && (
                                                  <p
                                                    style={{
                                                      fontFamily: '"Futura PT Book"',
                                                      color: isCurrent ? '#EB1C24' : '#000000',
                                                      fontSize: '9px',
                                                      margin: '4px 0 0 0',
                                                      textTransform: 'uppercase'
                                                    }}
                                                  >
                                                    STATUS: {subStatus}
                                                  </p>
                                                )}
                                                {isDelivered && (
                                                  <p
                                                    style={{
                                                      fontFamily: '"Futura PT Book"',
                                                      color: '#EB1C24',
                                                      fontSize: '9px',
                                                      margin: '4px 0 0 0',
                                                      textTransform: 'uppercase'
                                                    }}
                                                  >
                                                    STATUS: DELIVERED
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })()}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                              });
                            })()}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p
                      style={{
                        fontFamily: '"Futura PT Book"',
                        color: '#909090',
                      fontSize: '11px',
                        margin: '0 0 16px 0',
                        textTransform: 'uppercase',
                        textAlign: 'center',
                        padding: '12px'
                      }}
                    >
                      NO ACTIVE ORDERS TO TRACK.
                    </p>
                  )}
                </div>
                <div className="px-0 md:px-0" style={{ marginTop: '2px', marginBottom: '20px', transform: 'translateY(-2px)' }}>
                  <button
                    onClick={() => {
                      // Button action - could navigate or trigger tracking
                      if (!selectedOrderId) {
                        // If no order selected, focus on select
                        return;
                      }
                    }}
                    className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                    style={{
                      borderWidth: '1.3px',
                      color: '#EB1C24',
                      fontFamily: '"Futura PT Medium"',
                      backgroundColor: '#FFFFFF'
                    }}
                    type="button"
                  >
                    TRACK ORDER
                  </button>
                  <button
                    onClick={() => {
                      navigate('/account/orders');
                    }}
                    className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                    style={{
                      borderWidth: '1.3px',
                      color: '#EB1C24',
                      fontFamily: '"Futura PT Medium"',
                      backgroundColor: '#FFFFFF',
                      marginTop: '8px'
                    }}
                    type="button"
                  >
                    VIEW ALL ORDERS
                  </button>
                </div>

                {/* Free Gift Section */}
                <div
                  className="border border-black bg-white/60 backdrop-blur-sm w-full mb-2 transition-all duration-300 ease-out"
                  style={{
                    borderWidth: '1.3px',
                    paddingTop: '20px',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    paddingBottom: '7px',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)'
                  }}
                >
                  <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '22px' }}>
                    <h2
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        color: '#EB1C24',
                        fontSize: '12px',
                        fontWeight: '500',
                        margin: '0',
                        textTransform: 'uppercase'
                      }}
                    >
                      GIFT WITH PURCHASE
                    </h2>
                  </div>
                  
                  <p
                    style={{
                      fontFamily: '"Futura PT Book"',
                      color: '#000000',
                      fontSize: '10px',
                      margin: '0 0 16px 0',
                      textAlign: 'center',
                      textTransform: 'uppercase'
                    }}
                  >
                    choose which gift you'd like to be included in your next order:
                  </p>
                  
                  {/* Gift Selection Options */}
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    {/* Melt Band Option */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div
                        onClick={() => setSelectedFreeGift(selectedFreeGift === 'melt-band' ? '' : 'melt-band')}
                        style={{
                          border: selectedFreeGift === 'melt-band' ? '1.3px solid #EB1C24' : '1.3px solid #000000',
                          padding: '12px',
                          cursor: 'pointer',
                      backgroundColor: '#FFFFFF',
                          textAlign: 'center',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 'calc(100% - 20px)',
                          height: '144px'
                        }}
                      >
                        <img
                          src="/assets/melt-band.png"
                          alt="Melt Band"
                          style={{
                            maxWidth: '78px',
                            maxHeight: '118px',
                            width: 'auto',
                            height: 'auto',
                            objectFit: 'contain'
                          }}
                        />
                      </div>
                      <p
                        style={{
                          fontFamily: selectedFreeGift === 'melt-band' ? '"Futura PT Medium"' : '"Futura PT Book"',
                          color: selectedFreeGift === 'melt-band' ? '#EB1C24' : '#000000',
                          fontSize: '10px',
                          margin: '0',
                          textAlign: 'center',
                      textTransform: 'uppercase'
                        }}
                      >
                        MELT BAND
                      </p>
                    </div>
                    
                    {/* Wig Brush Option */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div
                        onClick={() => setSelectedFreeGift(selectedFreeGift === 'wig-brush' ? '' : 'wig-brush')}
                        style={{
                          border: selectedFreeGift === 'wig-brush' ? '1.3px solid #EB1C24' : '1.3px solid #000000',
                          padding: '12px',
                          cursor: 'pointer',
                          backgroundColor: '#FFFFFF',
                          textAlign: 'center',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 'calc(100% - 20px)',
                          height: '144px'
                        }}
                      >
                        <img
                          src="/assets/wig-brush.png"
                          alt="Wig Brush"
                          style={{
                            maxWidth: '42px',
                            maxHeight: '126px',
                            width: 'auto',
                            height: 'auto',
                            objectFit: 'contain'
                    }}
                  />
                </div>
                      <p
                    style={{
                          fontFamily: selectedFreeGift === 'wig-brush' ? '"Futura PT Medium"' : '"Futura PT Book"',
                          color: selectedFreeGift === 'wig-brush' ? '#EB1C24' : '#000000',
                          fontSize: '10px',
                          margin: '0',
                          textAlign: 'center',
                          textTransform: 'uppercase'
                        }}
                      >
                        WIG BRUSH
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-0 md:px-0" style={{ marginTop: '2px', marginBottom: '20px', transform: 'translateY(-2px)' }}>
                  <button
                    onClick={handleSubmitFreeGift}
                    className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                    style={{
                      borderWidth: '1.3px',
                      color: '#EB1C24',
                      fontFamily: '"Futura PT Medium"',
                      backgroundColor: '#FFFFFF'
                    }}
                    type="button"
                  >
                    SAVE SELECTION
                  </button>
                </div>

                {/* Birthday Gift Section */}
                <div
                  className="border border-black bg-white/60 backdrop-blur-sm w-full mb-2 transition-all duration-300 ease-out"
                  style={{
                    borderWidth: '1.3px',
                    paddingTop: '20px',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    paddingBottom: '7px',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)'
                  }}
                >
                  <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '22px' }}>
                    <h2
                      style={{
                        fontFamily: '"Futura PT Medium"',
                        color: '#EB1C24',
                        fontSize: '12px',
                        fontWeight: '500',
                        margin: '0',
                        textTransform: 'uppercase'
                      }}
                    >
                      BIRTHDAY GIFT
                    </h2>
                  </div>
                  
                  <p
                    style={{
                      fontFamily: '"Futura PT Book"',
                      color: '#000000',
                      fontSize: '10px',
                      margin: '0 0 16px 0',
                      textAlign: 'center',
                      textTransform: 'uppercase'
                    }}
                  >
                    choose which gift you'd like to receive for your birthday:
                  </p>
                  
                  {/* Birthday Gift Selection Options */}
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', minWidth: 0 }}>
                    {/* $20 Gift Card Option */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
                      <div
                        onClick={() => setSelectedBirthdayGift(selectedBirthdayGift === 'gift-card' ? '' : 'gift-card')}
                    style={{
                          border: selectedBirthdayGift === 'gift-card' ? '1.3px solid #EB1C24' : '1.3px solid #000000',
                      padding: '12px',
                          cursor: 'pointer',
                      backgroundColor: '#FFFFFF',
                          textAlign: 'center',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 'calc(100% - 20px)',
                          height: '144px',
                          overflow: 'hidden',
                          boxSizing: 'border-box'
                        }}
                      >
                        <img
                          src="/assets/gift-card asset.png"
                          alt="$20 Gift Card"
                          style={{
                            maxWidth: '130px',
                            maxHeight: '194px',
                            width: 'auto',
                            height: 'auto',
                            objectFit: 'contain',
                            display: 'block'
                          }}
                        />
                      </div>
                      <p
                        style={{
                          fontFamily: selectedBirthdayGift === 'gift-card' ? '"Futura PT Medium"' : '"Futura PT Book"',
                          color: selectedBirthdayGift === 'gift-card' ? '#EB1C24' : '#000000',
                          fontSize: '10px',
                          margin: '0',
                          textAlign: 'center',
                      textTransform: 'uppercase'
                        }}
                      >
                        $20 GIFT CARD
                      </p>
                    </div>
                    
                    {/* 200 Loyalty Points Option */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 0 }}>
                      <div
                        onClick={() => setSelectedBirthdayGift(selectedBirthdayGift === 'points' ? '' : 'points')}
                        style={{
                          border: selectedBirthdayGift === 'points' ? '1.3px solid #EB1C24' : '1.3px solid #000000',
                          padding: '12px',
                          cursor: 'pointer',
                          backgroundColor: '#FFFFFF',
                          textAlign: 'center',
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 'calc(100% - 20px)',
                          height: '144px',
                          overflow: 'hidden',
                          boxSizing: 'border-box'
                        }}
                      >
                        <img
                          src="/assets/points-loyalty.png"
                          alt="200 Loyalty Points"
                          style={{
                            maxWidth: '119px',
                            maxHeight: '173px',
                            width: 'auto',
                            height: 'auto',
                            objectFit: 'contain',
                            display: 'block',
                            marginTop: '10px',
                            transform: 'translateX(7px)'
                          }}
                        />
                  </div>
                  <p
                    style={{
                          fontFamily: selectedBirthdayGift === 'points' ? '"Futura PT Medium"' : '"Futura PT Book"',
                          color: selectedBirthdayGift === 'points' ? '#EB1C24' : '#000000',
                      fontSize: '10px',
                          margin: '0',
                          textAlign: 'center',
                      textTransform: 'uppercase'
                        }}
                      >
                        200 LOYALTY POINTS
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-0 md:px-0" style={{ marginTop: '2px', transform: 'translateY(-2px)' }}>
                  <button
                    onClick={handleSubmitBirthdayGift}
                    className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                    style={{
                      borderWidth: '1.3px',
                      color: '#EB1C24',
                      fontFamily: '"Futura PT Medium"',
                      backgroundColor: '#FFFFFF'
                    }}
                    type="button"
                  >
                    SAVE SELECTION
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
      
      {/* Free Gift Confirmation Modal */}
      <ConfirmationModal
        isOpen={showFreeGiftModal}
        onClose={() => setShowFreeGiftModal(false)}
        onConfirm={() => setShowFreeGiftModal(false)}
        title="SELECTION SAVED"
        message={freeGiftModalMessage}
        confirmText="CLOSE"
        cancelText=""
        messageTextTransform="uppercase"
      />
      
      {/* Birthday Gift Confirmation Modal */}
      <ConfirmationModal
        isOpen={showBirthdayGiftModal}
        onClose={() => setShowBirthdayGiftModal(false)}
        onConfirm={() => setShowBirthdayGiftModal(false)}
        title="SELECTION SAVED"
        message={birthdayGiftModalMessage}
        confirmText="CLOSE"
        cancelText=""
        messageTextTransform="uppercase"
      />

    </div>
    </>
  );
}

export default ConciergePage;

