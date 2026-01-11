import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  productName: string;
  productImage: string;
  total: number;
  items: number;
  pointsEarned?: number; // Points earned for this product's content
  pointsAvailable?: number; // Total points available to earn for this product
  contentStatus?: 'not_submitted' | 'pending' | 'approved' | 'rejected'; // Status of submitted content
  socialTags?: number; // Number of social tags submitted/approved
  pointsEarnedPeriod?: string; // Period when points were earned (e.g., "2024-Jan-Jun" or "2024-Jul-Dec")
  socialTagsPeriod?: string; // Period when social tags were earned
  pendingPhotos?: number; // Number of photos pending review
  pendingVideos?: number; // Number of videos pending review
  photo1ApprovedDate?: string; // Date when photo 1 was approved (ISO string)
  photo2ApprovedDate?: string; // Date when photo 2 was approved (ISO string)
  video1ApprovedDate?: string; // Date when video 1 was approved (ISO string)
  video2ApprovedDate?: string; // Date when video 2 was approved (ISO string)
  twitterApprovedDate?: string; // Date when Twitter content was approved (ISO string)
  instagramApprovedDate?: string; // Date when Instagram content was approved (ISO string)
  tiktokApprovedDate?: string; // Date when TikTok content was approved (ISO string)
  youtubeApprovedDate?: string; // Date when YouTube content was approved (ISO string)
  facebookApprovedDate?: string; // Date when Facebook content was approved (ISO string)
}

function AffiliatePage() {
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
  const [userData] = useState<any>(() => {
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

  // Helper function to get 2D mannequin image based on product name
  const getProductImage = (productName: string): string => {
    switch (productName.toUpperCase()) {
      case 'BLANCO':
        return '/assets/2D BLANCO FRONT.png';
      case 'SOFT WAVE':
      case 'BEACH WAVE':
        return '/assets/2D WAVY FRONT.png';
      case 'SOFT CURL':
      case 'OCEAN CURL':
        return '/assets/2D CURLY FRONT.png';
      case 'NOIR':
      default:
        return '/assets/natural front.png';
    }
  };

  // Helper function to check if current user is Kristin Watson (mock account)
  const isKristinWatson = () => {
    if (!userData) return false;
    return userData.email?.toLowerCase() === 'bruno203@gmail.com';
  };

  // Helper function to check if current user is Kateena Armstrong (admin account)
  const isKateenaArmstrong = () => {
    if (!userData) return false;
    const firstName = userData.firstName?.toLowerCase() || '';
    const lastName = userData.lastName?.toLowerCase() || '';
    const email = userData.email?.toLowerCase() || '';
    return (firstName === 'kateena' && lastName === 'armstrong') || 
           email.includes('kateena') || 
           email.includes('armstrong');
  };

  // Helper function to get a date X days ago
  const getDateDaysAgo = (daysAgo: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };
  
  // Helper function to get current 6-month period (must be defined before mock data)
  const getCurrentPeriod = (): string => {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11 (Jan = 0, Dec = 11)
    const currentYear = now.getFullYear();
    
    // Jan-Jun (months 0-5) or Jul-Dec (months 6-11)
    if (currentMonth < 6) {
      return `${currentYear}-Jan-Jun`;
    } else {
      return `${currentYear}-Jul-Dec`;
    }
  };

  // Helper function to get the points reset date
  const getPointsResetDate = (): string => {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11 (Jan = 0, Dec = 11)
    const currentYear = now.getFullYear();
    
    // If current period is Jan-Jun, reset is July 1 of current year
    // If current period is Jul-Dec, reset is January 1 of next year
    if (currentMonth < 6) {
      return `JULY 1, ${currentYear}`;
    } else {
      return `JANUARY 1, ${currentYear + 1}`;
    }
  };

  // Mock delivered orders for Kristin Watson (one per product)
  const kristinMockDeliveredOrders: Order[] = [
    {
      id: 'kristin-delivered-1',
      orderNumber: 'ORDER #250',
      date: getDateDaysAgo(5), // 5 days ago
      status: 'DELIVERED',
      productName: 'NOIR',
      productImage: getProductImage('NOIR'),
      total: 1640,
      items: 2,
      pointsEarned: 500, // Mock: earned 500 pts for approved photo
      pointsAvailable: 2000, // Max: 1,000 (photo + video) + 1,000 (social tags)
      contentStatus: 'approved', // Content approved
      socialTags: 0, // No social tags yet
      pointsEarnedPeriod: getCurrentPeriod(), // Current period
      socialTagsPeriod: undefined // No social tags yet
    },
    {
      id: 'kristin-delivered-2',
      orderNumber: 'ORDER #248',
      date: getDateDaysAgo(10), // 10 days ago
      status: 'DELIVERED',
      productName: 'BLANCO',
      productImage: getProductImage('BLANCO'),
      total: 820,
      items: 1,
      pointsEarned: 0, // Mock: no content submitted yet
      pointsAvailable: 2000, // Max: 1,000 (photo + video) + 1,000 (social tags)
      contentStatus: 'not_submitted', // No content submitted
      socialTags: 0 // No social tags
    },
    {
      id: 'kristin-delivered-3',
      orderNumber: 'ORDER #246',
      date: getDateDaysAgo(15), // 15 days ago
      status: 'DELIVERED',
      productName: 'SOFT CURL',
      productImage: getProductImage('SOFT CURL'),
      total: 1200,
      items: 1,
      pointsEarned: 1000, // Mock: earned 1000 pts (photo + video approved)
      pointsAvailable: 2000, // Max: 1,000 (photo + video) + 1,000 (social tags)
      contentStatus: 'approved', // Content approved
      socialTags: 2, // 2 social tags submitted
      pointsEarnedPeriod: getCurrentPeriod(), // Current period
      socialTagsPeriod: getCurrentPeriod() // Current period
    },
    {
      id: 'kristin-delivered-4',
      orderNumber: 'ORDER #245',
      date: getDateDaysAgo(3), // 3 days ago
      status: 'DELIVERED',
      productName: 'SOFT WAVE',
      productImage: getProductImage('SOFT WAVE'),
      total: 980,
      items: 1,
      pointsEarned: 0, // Mock: content submitted but pending review
      pointsAvailable: 2000,
      contentStatus: 'pending', // Content pending review
      socialTags: 1, // 1 social tag pending
      pendingPhotos: 1, // 1 photo pending (500 pts)
      pendingVideos: 0 // No videos pending
    },
    {
      id: 'kristin-delivered-5',
      orderNumber: 'ORDER #244',
      date: getDateDaysAgo(8), // 8 days ago
      status: 'DELIVERED',
      productName: 'OCEAN CURL',
      productImage: getProductImage('OCEAN CURL'),
      total: 1200,
      items: 1,
      pointsEarned: 0, // Mock: content rejected
      pointsAvailable: 2000,
      contentStatus: 'rejected', // Content rejected
      socialTags: 0 // No social tags (rejected)
    }
  ];

  // Mock delivered orders for Kateena Armstrong (one per product)
  const kateenaMockDeliveredOrders: Order[] = [
    {
      id: 'kateena-delivered-1',
      orderNumber: 'ORDER #344',
      date: getDateDaysAgo(7), // 7 days ago
      status: 'DELIVERED',
      productName: 'NOIR',
      productImage: getProductImage('NOIR'),
      total: 1640,
      items: 2,
      pointsEarned: 1000, // Mock: earned 1000 pts (photo + video approved)
      pointsAvailable: 2000, // Max: 1,000 (photo + video) + 1,000 (social tags)
      contentStatus: 'approved', // Content approved
      socialTags: 3, // 3 social tags approved (600 social points)
      pointsEarnedPeriod: getCurrentPeriod(), // Current period
      socialTagsPeriod: getCurrentPeriod() // Current period
    },
    {
      id: 'kateena-delivered-2',
      orderNumber: 'ORDER #342',
      date: getDateDaysAgo(12), // 12 days ago
      status: 'DELIVERED',
      productName: 'BLANCO',
      productImage: getProductImage('BLANCO'),
      total: 820,
      items: 1,
      pointsEarned: 500, // Mock: earned 500 pts (1 photo approved)
      pointsAvailable: 2000, // Max: 1,000 (photo + video) + 1,000 (social tags)
      contentStatus: 'approved', // Content approved
      socialTags: 1, // 1 social tag approved (200 social points)
      pointsEarnedPeriod: getCurrentPeriod(), // Current period
      socialTagsPeriod: getCurrentPeriod() // Current period
    },
    {
      id: 'kateena-delivered-3',
      orderNumber: 'ORDER #340',
      date: getDateDaysAgo(20), // 20 days ago
      status: 'DELIVERED',
      productName: 'SOFT WAVE',
      productImage: getProductImage('SOFT WAVE'),
      total: 980,
      items: 1,
      pointsEarned: 0, // Mock: no content submitted yet
      pointsAvailable: 2000, // Max: 1,000 (photo + video) + 1,000 (social tags)
      contentStatus: 'not_submitted', // No content submitted
      socialTags: 0 // No social tags
    },
    {
      id: 'kateena-delivered-4',
      orderNumber: 'ORDER #339',
      date: getDateDaysAgo(14), // 14 days ago
      status: 'DELIVERED',
      productName: 'SOFT CURL',
      productImage: getProductImage('SOFT CURL'),
      total: 1200,
      items: 1,
      pointsEarned: 2000, // Mock: all points earned
      pointsAvailable: 2000,
      contentStatus: 'approved', // All content approved
      socialTags: 5 // All 5 social tags approved
    },
    {
      id: 'kateena-delivered-5',
      orderNumber: 'ORDER #338',
      date: getDateDaysAgo(18), // 18 days ago
      status: 'DELIVERED',
      productName: 'OCEAN CURL',
      productImage: getProductImage('OCEAN CURL'),
      total: 1200,
      items: 1,
      pointsEarned: 0, // Mock: content pending review
      pointsAvailable: 2000,
      contentStatus: 'pending', // Content pending
      socialTags: 3, // 3 social tags pending
      pendingPhotos: 1, // 1 photo pending (500 pts)
      pendingVideos: 1 // 1 video pending (500 pts)
    },
    {
      id: 'kateena-delivered-6',
      orderNumber: 'ORDER #336',
      date: getDateDaysAgo(25), // 25 days ago
      status: 'DELIVERED',
      productName: 'BEACH WAVE',
      productImage: getProductImage('BEACH WAVE'),
      total: 980,
      items: 1,
      pointsEarned: 1000, // Mock: earned 1000 pts (photo + video approved)
      pointsAvailable: 2000,
      contentStatus: 'approved', // All content approved
      socialTags: 5, // All 5 social tags approved (1000 social points)
      pointsEarnedPeriod: getCurrentPeriod(), // Current period
      socialTagsPeriod: getCurrentPeriod(), // Current period
      photo1ApprovedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
      photo2ApprovedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
      video1ApprovedDate: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(), // 19 days ago
      video2ApprovedDate: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(), // 19 days ago
      twitterApprovedDate: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(), // 17 days ago
      instagramApprovedDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(), // 16 days ago
      tiktokApprovedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
      youtubeApprovedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
      facebookApprovedDate: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString() // 13 days ago
    }
  ];

  // Get delivered orders from localStorage
  const getDeliveredOrders = (): Order[] => {
    if (typeof window === 'undefined' || !userData) {
      return [];
    }

    // Return mock orders for Kristin Watson or Kateena Armstrong
    if (isKristinWatson()) {
      return kristinMockDeliveredOrders;
    } else if (isKateenaArmstrong()) {
      return kateenaMockDeliveredOrders;
    }

    try {
      const userOrdersKey = `userOrders_${userData.email}`;
      const storedOrders = localStorage.getItem(userOrdersKey);
      if (storedOrders) {
        const orders = JSON.parse(storedOrders);
        const allOrders = [...(orders.activeOrders || []), ...(orders.pastOrders || [])];
        // Filter only delivered orders that are eligible (delivered more than 24 hours ago)
        const now = Date.now();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        return allOrders
          .filter((order: any) => {
            if (order.status !== 'DELIVERED') return false;
            // If order has deliveredAt timestamp, check if it's been more than 24 hours
            if (order.deliveredAt) {
              const timeSinceDelivered = now - order.deliveredAt;
              return timeSinceDelivered >= twentyFourHours;
            }
            // If no timestamp, assume it's eligible (older orders)
            return true;
          })
          .map((order: Order) => ({
            ...order,
            productImage: order.productImage || getProductImage(order.productName || 'NOIR'),
            pointsAvailable: order.pointsAvailable !== undefined ? order.pointsAvailable : 2000 // Default to max 2,000 pts if not set
          }));
      }
    } catch (e) {
      console.error('Error loading delivered orders:', e);
    }

    return [];
  };

  const [deliveredOrders] = useState<Order[]>(() => getDeliveredOrders());
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  
  // File state for photo and video uploads
  const [photo1File, setPhoto1File] = useState<File | null>(null);
  const [photo1Preview, setPhoto1Preview] = useState<string | null>(null);
  const [photo2File, setPhoto2File] = useState<File | null>(null);
  const [photo2Preview, setPhoto2Preview] = useState<string | null>(null);
  const [video1File, setVideo1File] = useState<File | null>(null);
  const [video1Preview, setVideo1Preview] = useState<string | null>(null);
  const [video2File, setVideo2File] = useState<File | null>(null);
  const [video2Preview, setVideo2Preview] = useState<string | null>(null);
  
  // Refs for file inputs
  const photo1InputRef = useRef<HTMLInputElement>(null);
  const photo2InputRef = useRef<HTMLInputElement>(null);
  const video1InputRef = useRef<HTMLInputElement>(null);
  const video2InputRef = useRef<HTMLInputElement>(null);
  
  // File change handlers
  const handlePhoto1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto1File(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto1Preview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handlePhoto2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto2File(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto2Preview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleVideo1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideo1File(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideo1Preview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleVideo2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideo2File(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideo2Preview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Reset file states when expanded order changes
  useEffect(() => {
    if (expandedOrderId) {
      setPhoto1File(null);
      setPhoto1Preview(null);
      setPhoto2File(null);
      setPhoto2Preview(null);
      setVideo1File(null);
      setVideo1Preview(null);
      setVideo2File(null);
      setVideo2Preview(null);
    }
  }, [expandedOrderId]);
  
  // Helper function to check if points should be reset (new period started)
  const shouldResetPoints = (order: Order): boolean => {
    const currentPeriod = getCurrentPeriod();
    
    // If no period recorded, don't reset (points haven't been earned yet)
    if (!order.pointsEarnedPeriod && !order.socialTagsPeriod) {
      return false;
    }
    
    // Reset if the period has changed
    const pointsPeriod = order.pointsEarnedPeriod || order.socialTagsPeriod || '';
    return pointsPeriod !== currentPeriod;
  };
  
  // Helper function to get effective points (reset if period changed)
  const getEffectivePoints = (order: Order): { photoVideo: number; social: number } => {
    // If points were earned in a different period, reset them
    if (shouldResetPoints(order)) {
      return { photoVideo: 0, social: 0 };
    }
    
    // Otherwise return the stored points
    const photoVideoEarned = Math.min(1000, order.pointsEarned || 0);
    const socialPointsEarned = (order.socialTags || 0) * 200;
    
    return { photoVideo: photoVideoEarned, social: socialPointsEarned };
  };

  // Helper function to get the period for a given date
  const getPeriodForDate = (date: Date): string => {
    const month = date.getMonth(); // 0-11 (Jan = 0, Dec = 11)
    const year = date.getFullYear();
    
    // Jan-Jun (months 0-5) or Jul-Dec (months 6-11)
    if (month < 6) {
      return `${year}-Jan-Jun`;
    } else {
      return `${year}-Jul-Dec`;
    }
  };

  // Helper function to check if content can be submitted
  // Content can only be approved once per period (Jan-Jun or Jul-Dec)
  // If the period has changed since approval, content can be resubmitted
  const canSubmitContent = (approvedDate?: string): boolean => {
    if (!approvedDate) return true; // No approval date means content hasn't been approved yet
    
    const approved = new Date(approvedDate);
    // Check if date is valid
    if (isNaN(approved.getTime())) return true; // Invalid date, allow submission
    
    const currentPeriod = getCurrentPeriod();
    const approvalPeriod = getPeriodForDate(approved);
    
    // Can submit if approval was in a different period (period has reset)
    // If same period, cannot submit (already approved in this period)
    return approvalPeriod !== currentPeriod;
  };
  
  // Helper function to get cart dropdown style thumbnail
  const getCartThumbnail = (productName: string): string => {
    switch (productName.toUpperCase()) {
      case 'BLANCO':
        return '/assets/NOIR/blanco-thumb.png';
      case 'SOFT WAVE':
      case 'BEACH WAVE':
        return '/assets/NOIR/wave-thumb.png';
      case 'SOFT CURL':
      case 'OCEAN CURL':
        return '/assets/NOIR/curl-thumb.png';
      case 'NOIR':
      default:
        return '/assets/NOIR/noir-thumb.png';
    }
  };

  // Generate referral code from user data with conflict checking
  const generateReferralCode = (): string => {
    // If user already has a referral code stored, use it
    if (userData?.referralCode) {
      return userData.referralCode;
    }

    if (!userData) {
      return 'KA3047'; // Default/example code
    }

    // Get first initial of first name
    const firstInitial = userData.firstName && userData.firstName.length > 0 
      ? userData.firstName.charAt(0).toUpperCase() 
      : 'K';

    // Get first initial of last name
    const lastInitial = userData.lastName && userData.lastName.length > 0 
      ? userData.lastName.charAt(0).toUpperCase() 
      : 'A';

    // Extract day from birthday (format: MM/DD/YYYY)
    let day = '30'; // Default
    if (userData.birthday) {
      const birthdayParts = userData.birthday.split('/');
      if (birthdayParts.length >= 2) {
        day = birthdayParts[1].padStart(2, '0'); // Ensure 2 digits
      }
    }

    // Extract phone number digits
    let phoneDigits = '2647'; // Default
    if (userData.phoneNumber) {
      // Remove all non-digit characters
      phoneDigits = userData.phoneNumber.replace(/\D/g, '');
    }

    // Try primary code (last 2 digits)
    let lastTwoDigits = phoneDigits.length >= 2 ? phoneDigits.slice(-2) : '47';
    let primaryCode = `${firstInitial}${lastInitial}${day}${lastTwoDigits}`;

    // Check if code already exists in registeredUsers
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const codeExists = registeredUsers.some((user: any) => 
        user.referralCode === primaryCode && user.email !== userData.email
      );

      // If code is taken, use alternative (2 digits before last 2)
      if (codeExists && phoneDigits.length >= 4) {
        const alternativeDigits = phoneDigits.slice(-4, -2); // 2 digits before last 2
        return `${firstInitial}${lastInitial}${day}${alternativeDigits}`;
      }
    } catch (e) {
      // If error checking, just return primary code
    }

    return primaryCode;
  };

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
    const pathname = window.location.pathname;
    if (pathname.includes('/tools') || pathname === '/tools/gift-card') {
      setMobileMenuActiveTab('TOOLS');
    } else if (pathname.includes('/brand') || pathname.includes('/about') || pathname.includes('/contact') || pathname.includes('/faq') || pathname.includes('/reviews') || pathname.includes('/terms')) {
      setMobileMenuActiveTab('BRAND');
    } else {
      setMobileMenuActiveTab('SHOP');
    }
  }, []);

  // Ensure active tab is set correctly when menu opens
  useEffect(() => {
    if (showMobileMenu) {
      const pathname = window.location.pathname;
      if (pathname.includes('/tools') || pathname === '/tools/gift-card') {
        setMobileMenuActiveTab('TOOLS');
      } else if (pathname.includes('/brand') || pathname.includes('/about') || pathname.includes('/contact') || pathname.includes('/faq') || pathname.includes('/reviews') || pathname.includes('/terms')) {
        setMobileMenuActiveTab('BRAND');
      } else {
        setMobileMenuActiveTab('SHOP');
      }
    }
  }, [showMobileMenu]);

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
                    AFFILIATE
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
              <>
                 {/* AFFILIATE CONTENT */}
                 <div
                   className="border border-black bg-white/60 backdrop-blur-sm w-full transition-all duration-300 ease-out"
                   style={{
                     borderWidth: '1.3px',
                     padding: '20px',
                     backgroundColor: 'rgba(255, 255, 255, 0.6)'
                   }}
                 >
                   {expandedOrderId ? (
                     /* EXPANDED SUBMIT CONTENT VIEW */
                     (() => {
                       const expandedOrder = deliveredOrders.find(o => o.id === expandedOrderId);
                       if (!expandedOrder) return null;
                       
                       // Calculate total points (photo/video + social) with period reset
                       // Check if points should be reset due to period change
                       const effectivePoints = getEffectivePoints(expandedOrder);
                       const currentPeriod = getCurrentPeriod();
                       const socialTagsPeriod = expandedOrder.socialTagsPeriod || '';
                       const effectiveSocialTags = (socialTagsPeriod === currentPeriod) ? (expandedOrder.socialTags || 0) : 0;
                       const photoVideoEarned = effectivePoints.photoVideo;
                       const socialPointsEarned = effectiveSocialTags * 200;
                       const totalEarned = photoVideoEarned + socialPointsEarned;
                       const totalAvailable = 2000; // 1,000 photo/video + 1,000 social
                       const pointsText = totalEarned === 0
                         ? "YOU'VE EARNED 0 POINTS!"
                         : totalEarned >= totalAvailable 
                           ? "YOU'VE EARNED 2,000 POINTS!" 
                           : `YOU'VE EARNED ${totalEarned.toLocaleString()} POINTS!`;
                       
                       return (
                         <>
                           {/* SUBMIT CONTENT Header */}
                           <div style={{ marginBottom: '8px' }}>
                             <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '0' }}>
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
                                 SUBMIT CONTENT
                               </h2>
                               <button
                                 onClick={() => setExpandedOrderId(null)}
                                 style={{
                                   border: 'none',
                                   background: 'none',
                                   cursor: 'pointer',
                                   padding: 0,
                                   margin: 0,
                                   display: 'flex',
                                   alignItems: 'center',
                                   justifyContent: 'center',
                                   flexShrink: 0
                                 }}
                               >
                                 <img
                                   src="/assets/close-icon.svg"
                                   alt="Close"
                                   style={{
                                     width: '16px',
                                     height: '16px',
                                     filter: 'brightness(0) saturate(100%) invert(20%) sepia(93%) saturate(7151%) hue-rotate(349deg) brightness(92%) contrast(92%)'
                                   }}
                                 />
                               </button>
                             </div>
                           </div>
                           
                           {/* Product Thumbnail */}
                           <div className="flex flex-col items-center" style={{ marginTop: '0', marginBottom: '24px' }}>
                             <img
                               src={getCartThumbnail(expandedOrder.productName)}
                               alt={expandedOrder.productName}
                               style={{
                                 width: '254px',
                                 height: '254px',
                                 objectFit: 'contain'
                               }}
                             />
                             {/* Product Name */}
                             <p
                               style={{
                                 fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                                 fontSize: '30px',
                                 color: '#000000',
                                 margin: '-4px 0 0 0',
                                 textTransform: 'uppercase'
                               }}
                             >
                               {expandedOrder.productName}
                             </p>
                           </div>
                           
                           {/* Points Earned Text */}
                           <div style={{ marginBottom: '44px', marginTop: '-26px', textAlign: 'center' }}>
                             <p
                               style={{
                                 fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                                 fontSize: '11px',
                                 color: '#EB1C24',
                                 margin: 0,
                                 textTransform: 'uppercase'
                               }}
                             >
                               {pointsText}
                             </p>
                             {(() => {
                               // Calculate remaining total points (photo/video + social) with period reset
                               // Check if points should be reset due to period change
                               const effectivePoints = getEffectivePoints(expandedOrder);
                               const currentPeriod = getCurrentPeriod();
                               const socialTagsPeriod = expandedOrder.socialTagsPeriod || '';
                               const effectiveSocialTags = (socialTagsPeriod === currentPeriod) ? (expandedOrder.socialTags || 0) : 0;
                               const photoVideoEarned = effectivePoints.photoVideo;
                               const socialPointsEarned = effectiveSocialTags * 200;
                               const totalEarned = photoVideoEarned + socialPointsEarned;
                               const totalAvailable = 2000; // 1,000 photo/video + 1,000 social
                               const remaining = totalAvailable - totalEarned;
                               // Always show remaining text and reset date text
                               return (
                                 <>
                                   <p
                                     style={{
                                       fontFamily: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif',
                                       fontSize: '11px',
                                       color: '#909090',
                                       margin: '2px 0 -2px 0',
                                       textTransform: 'uppercase'
                                     }}
                                   >
                                     {remaining.toLocaleString()} POINTS AVAILABLE
                                   </p>
                                   <p
                                     style={{
                                       fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                                       fontSize: '11px',
                                       color: '#000000',
                                       margin: '4px 0 0 0',
                                       textTransform: 'uppercase'
                                     }}
                                   >
                                     POINTS RESET {getPointsResetDate()}
                                   </p>
                                 </>
                               );
                             })()}
                           </div>
                           
                           {/* Photo Submission */}
                           <div style={{ marginBottom: '24px' }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                               <p
                                 style={{
                                   fontFamily: '"Futura PT Medium"',
                                   color: '#EB1C24',
                                   fontSize: '10px',
                                   margin: '0',
                                   textTransform: 'uppercase',
                                   fontWeight: '500'
                                 }}
                               >
                                 PHOTOS:
                               </p>
                               <p
                                 style={{
                                   fontFamily: '"Futura PT Book"',
                                   color: '#000000',
                                   fontSize: '10px',
                                   margin: '0',
                                   textTransform: 'uppercase'
                                 }}
                               >
                                 {(() => {
                                   const photoVideoEarned = Math.min(1000, expandedOrder.pointsEarned || 0);
                                   const photoPointsEarned = photoVideoEarned >= 500 ? 500 : 0;
                                   return `${photoPointsEarned}/500`;
                                 })()}
                               </p>
                             </div>
                             {/* Photo 1 */}
                             <div style={{ marginBottom: '12px' }}>
                               <div style={{ position: 'relative', marginBottom: '8px' }}>
                                 <input
                                   type="file"
                                   accept="image/*"
                                   ref={photo1InputRef}
                                   onChange={(e) => {
                                     if (canSubmitContent(expandedOrder.photo1ApprovedDate)) {
                                       handlePhoto1Change(e);
                                     }
                                   }}
                                   style={{
                                     position: 'absolute',
                                     width: '100%',
                                     height: '36px',
                                     opacity: 0,
                                     cursor: 'pointer',
                                     zIndex: 3,
                                     top: 0,
                                     left: 0
                                   }}
                                 />
                                 <div
                                   onClick={() => {
                                     if (canSubmitContent(expandedOrder.photo1ApprovedDate)) {
                                       photo1InputRef.current?.click();
                                     }
                                   }}
                                   style={{
                                     width: '100%',
                                     minHeight: '36px',
                                     height: photo1Preview ? 'auto' : '36px',
                                     padding: '8px',
                                     border: '1.3px solid #000000',
                                     fontFamily: '"Futura PT Book"',
                                     fontSize: '11px',
                                     backgroundColor: !canSubmitContent(expandedOrder.photo1ApprovedDate) ? '#F5F5F5' : '#FFFFFF',
                                     color: photo1File ? '#909090' : '#EB1C24',
                                     boxSizing: 'border-box',
                                     borderRadius: '0',
                                     cursor: !canSubmitContent(expandedOrder.photo1ApprovedDate) ? 'not-allowed' : 'pointer',
                                     textTransform: 'uppercase',
                                     position: 'relative',
                                     overflow: photo1Preview ? 'visible' : 'hidden',
                                     display: photo1Preview ? 'block' : 'flex',
                                     alignItems: photo1Preview ? 'normal' : 'center',
                                     opacity: !canSubmitContent(expandedOrder.photo1ApprovedDate) ? 0.6 : 1,
                                     pointerEvents: !canSubmitContent(expandedOrder.photo1ApprovedDate) ? 'none' : 'auto'
                                   }}
                                 >
                                   {photo1Preview ? (
                                     <img 
                                       src={photo1Preview} 
                                       alt="Photo 1 preview" 
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
                             {/* Photo 2 */}
                             <div style={{ marginBottom: '12px' }}>
                               <div style={{ position: 'relative', marginBottom: '8px' }}>
                                 <input
                                   type="file"
                                   accept="image/*"
                                   ref={photo2InputRef}
                                   onChange={(e) => {
                                     if (canSubmitContent(expandedOrder.photo2ApprovedDate)) {
                                       handlePhoto2Change(e);
                                     }
                                   }}
                                   style={{
                                     position: 'absolute',
                                     width: '100%',
                                     height: '36px',
                                     opacity: 0,
                                     cursor: 'pointer',
                                     zIndex: 3,
                                     top: 0,
                                     left: 0
                                   }}
                                 />
                                 <div
                                   onClick={() => {
                                     if (canSubmitContent(expandedOrder.photo2ApprovedDate)) {
                                       photo2InputRef.current?.click();
                                     }
                                   }}
                                   style={{
                                     width: '100%',
                                     minHeight: '36px',
                                     height: photo2Preview ? 'auto' : '36px',
                                     padding: '8px',
                                     border: '1.3px solid #000000',
                                     fontFamily: '"Futura PT Book"',
                                     fontSize: '11px',
                                     backgroundColor: !canSubmitContent(expandedOrder.photo2ApprovedDate) ? '#F5F5F5' : '#FFFFFF',
                                     color: photo2File ? '#909090' : '#EB1C24',
                                     boxSizing: 'border-box',
                                     borderRadius: '0',
                                     cursor: !canSubmitContent(expandedOrder.photo2ApprovedDate) ? 'not-allowed' : 'pointer',
                                     textTransform: 'uppercase',
                                     position: 'relative',
                                     overflow: photo2Preview ? 'visible' : 'hidden',
                                     display: photo2Preview ? 'block' : 'flex',
                                     alignItems: photo2Preview ? 'normal' : 'center',
                                     opacity: !canSubmitContent(expandedOrder.photo2ApprovedDate) ? 0.6 : 1,
                                     pointerEvents: !canSubmitContent(expandedOrder.photo2ApprovedDate) ? 'none' : 'auto'
                                   }}
                                 >
                                   {photo2Preview ? (
                                     <img 
                                       src={photo2Preview} 
                                       alt="Photo 2 preview" 
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
                           </div>
                           
                           {/* Video Submission */}
                           <div style={{ marginBottom: '24px' }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                               <p
                                 style={{
                                   fontFamily: '"Futura PT Medium"',
                                   color: '#EB1C24',
                                   fontSize: '10px',
                                   margin: '0',
                                   textTransform: 'uppercase',
                                   fontWeight: '500'
                                 }}
                               >
                                 VIDEOS:
                               </p>
                               <p
                                 style={{
                                   fontFamily: '"Futura PT Book"',
                                   color: '#000000',
                                   fontSize: '10px',
                                   margin: '0',
                                   textTransform: 'uppercase'
                                 }}
                               >
                                 {(() => {
                                   const effectivePoints = getEffectivePoints(expandedOrder);
                                   const photoVideoEarned = effectivePoints.photoVideo;
                                   // If total is 1000, videos are approved (500 points); if 500, assume only photos approved
                                   const videoPointsEarned = photoVideoEarned === 1000 ? 500 : 0;
                                   return `${videoPointsEarned}/500`;
                                 })()}
                               </p>
                             </div>
                             {/* Video 1 */}
                             <div style={{ marginBottom: '12px' }}>
                               <div style={{ position: 'relative', marginBottom: '8px' }}>
                                 <input
                                   type="file"
                                   accept="video/*"
                                   ref={video1InputRef}
                                   onChange={(e) => {
                                     if (canSubmitContent(expandedOrder.video1ApprovedDate)) {
                                       handleVideo1Change(e);
                                     }
                                   }}
                                   style={{
                                     position: 'absolute',
                                     width: '100%',
                                     height: '36px',
                                     opacity: 0,
                                     cursor: 'pointer',
                                     zIndex: 3,
                                     top: 0,
                                     left: 0
                                   }}
                                 />
                                 <div
                                   onClick={() => {
                                     if (canSubmitContent(expandedOrder.video1ApprovedDate)) {
                                       video1InputRef.current?.click();
                                     }
                                   }}
                                   style={{
                                     width: '100%',
                                     minHeight: '36px',
                                     height: video1Preview ? 'auto' : '36px',
                                     padding: '8px',
                                     border: '1.3px solid #000000',
                                     fontFamily: '"Futura PT Book"',
                                     fontSize: '11px',
                                     backgroundColor: !canSubmitContent(expandedOrder.video1ApprovedDate) ? '#F5F5F5' : '#FFFFFF',
                                     color: video1File ? '#909090' : '#EB1C24',
                                     boxSizing: 'border-box',
                                     borderRadius: '0',
                                     cursor: !canSubmitContent(expandedOrder.video1ApprovedDate) ? 'not-allowed' : 'pointer',
                                     textTransform: 'uppercase',
                                     position: 'relative',
                                     overflow: video1Preview ? 'visible' : 'hidden',
                                     display: video1Preview ? 'block' : 'flex',
                                     alignItems: video1Preview ? 'normal' : 'center',
                                     opacity: !canSubmitContent(expandedOrder.video1ApprovedDate) ? 0.6 : 1,
                                     pointerEvents: !canSubmitContent(expandedOrder.video1ApprovedDate) ? 'none' : 'auto'
                                   }}
                                 >
                                   {video1Preview ? (
                                     <img 
                                       src={video1Preview} 
                                       alt="Video 1 preview" 
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
                             {/* Video 2 */}
                             <div style={{ marginBottom: '12px' }}>
                               <div style={{ position: 'relative', marginBottom: '8px' }}>
                                 <input
                                   type="file"
                                   accept="video/*"
                                   ref={video2InputRef}
                                   onChange={(e) => {
                                     if (canSubmitContent(expandedOrder.video2ApprovedDate)) {
                                       handleVideo2Change(e);
                                     }
                                   }}
                                   style={{
                                     position: 'absolute',
                                     width: '100%',
                                     height: '36px',
                                     opacity: 0,
                                     cursor: 'pointer',
                                     zIndex: 3,
                                     top: 0,
                                     left: 0
                                   }}
                                 />
                                 <div
                                   onClick={() => {
                                     if (canSubmitContent(expandedOrder.video2ApprovedDate)) {
                                       video2InputRef.current?.click();
                                     }
                                   }}
                                   style={{
                                     width: '100%',
                                     minHeight: '36px',
                                     height: video2Preview ? 'auto' : '36px',
                                     padding: '8px',
                                     border: '1.3px solid #000000',
                                     fontFamily: '"Futura PT Book"',
                                     fontSize: '11px',
                                     backgroundColor: !canSubmitContent(expandedOrder.video2ApprovedDate) ? '#F5F5F5' : '#FFFFFF',
                                     color: video2File ? '#909090' : '#EB1C24',
                                     boxSizing: 'border-box',
                                     borderRadius: '0',
                                     cursor: !canSubmitContent(expandedOrder.video2ApprovedDate) ? 'not-allowed' : 'pointer',
                                     textTransform: 'uppercase',
                                     position: 'relative',
                                     overflow: video2Preview ? 'visible' : 'hidden',
                                     display: video2Preview ? 'block' : 'flex',
                                     alignItems: video2Preview ? 'normal' : 'center',
                                     opacity: !canSubmitContent(expandedOrder.video2ApprovedDate) ? 0.6 : 1,
                                     pointerEvents: !canSubmitContent(expandedOrder.video2ApprovedDate) ? 'none' : 'auto'
                                   }}
                                 >
                                   {video2Preview ? (
                                     <img 
                                       src={video2Preview} 
                                       alt="Video 2 preview" 
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
                           </div>
                           
                           {/* Social Platform Links */}
                           <div style={{ marginBottom: '24px' }}>
                             {/* TWITTER */}
                             <div style={{ marginBottom: '12px' }}>
                               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                 <p
                                   style={{
                                     fontFamily: '"Futura PT Medium"',
                                     color: '#EB1C24',
                                     fontSize: '10px',
                                     margin: '0',
                                     textTransform: 'uppercase',
                                     fontWeight: '500'
                                   }}
                                 >
                                   TWITTER:
                                 </p>
                                 <p
                                   style={{
                                     fontFamily: '"Futura PT Book"',
                                     color: '#000000',
                                     fontSize: '10px',
                                     margin: '0',
                                     textTransform: 'uppercase'
                                   }}
                                 >
                                   {(() => {
                                     const currentPeriod = getCurrentPeriod();
                                     const socialTagsPeriod = expandedOrder.socialTagsPeriod || '';
                                     const effectiveSocialTags = (socialTagsPeriod === currentPeriod) ? (expandedOrder.socialTags || 0) : 0;
                                     return effectiveSocialTags >= 1 ? '200/200' : '0/200';
                                   })()}
                                 </p>
                               </div>
                               <input
                                 type="text"
                                 placeholder="LINK TO TWEET"
                                 disabled={!canSubmitContent(expandedOrder.twitterApprovedDate)}
                                 style={{
                                   width: '100%',
                                   padding: '8px',
                                   border: '1.3px solid #000000',
                                   fontFamily: '"Futura PT Book"',
                                   fontSize: '11px',
                                   backgroundColor: !canSubmitContent(expandedOrder.twitterApprovedDate) ? '#F5F5F5' : '#FFFFFF',
                                   color: '#909090',
                                   boxSizing: 'border-box',
                                   borderRadius: '0',
                                   textTransform: 'uppercase',
                                   opacity: !canSubmitContent(expandedOrder.twitterApprovedDate) ? 0.6 : 1,
                                   cursor: !canSubmitContent(expandedOrder.twitterApprovedDate) ? 'not-allowed' : 'text'
                                 }}
                               />
                             </div>
                             
                             {/* INSTAGRAM */}
                             <div style={{ marginBottom: '12px' }}>
                               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                 <p
                                   style={{
                                     fontFamily: '"Futura PT Medium"',
                                     color: '#EB1C24',
                                     fontSize: '10px',
                                     margin: '0',
                                     textTransform: 'uppercase',
                                     fontWeight: '500'
                                   }}
                                 >
                                   INSTAGRAM:
                                 </p>
                                 <p
                                   style={{
                                     fontFamily: '"Futura PT Book"',
                                     color: '#000000',
                                     fontSize: '10px',
                                     margin: '0',
                                     textTransform: 'uppercase'
                                   }}
                                 >
                                   {(() => {
                                     const currentPeriod = getCurrentPeriod();
                                     const socialTagsPeriod = expandedOrder.socialTagsPeriod || '';
                                     const effectiveSocialTags = (socialTagsPeriod === currentPeriod) ? (expandedOrder.socialTags || 0) : 0;
                                     return effectiveSocialTags >= 2 ? '200/200' : '0/200';
                                   })()}
                                 </p>
                               </div>
                               <input
                                 type="text"
                                 placeholder="LINK TO REEL"
                                 disabled={!canSubmitContent(expandedOrder.instagramApprovedDate)}
                                 style={{
                                   width: '100%',
                                   padding: '8px',
                                   border: '1.3px solid #000000',
                                   fontFamily: '"Futura PT Book"',
                                   fontSize: '11px',
                                   backgroundColor: !canSubmitContent(expandedOrder.instagramApprovedDate) ? '#F5F5F5' : '#FFFFFF',
                                   color: '#909090',
                                   boxSizing: 'border-box',
                                   borderRadius: '0',
                                   textTransform: 'uppercase',
                                   opacity: !canSubmitContent(expandedOrder.instagramApprovedDate) ? 0.6 : 1,
                                   cursor: !canSubmitContent(expandedOrder.instagramApprovedDate) ? 'not-allowed' : 'text'
                                 }}
                               />
                             </div>
                             
                             {/* TIKTOK */}
                             <div style={{ marginBottom: '12px' }}>
                               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                 <p
                                   style={{
                                     fontFamily: '"Futura PT Medium"',
                                     color: '#EB1C24',
                                     fontSize: '10px',
                                     margin: '0',
                                     textTransform: 'uppercase',
                                     fontWeight: '500'
                                   }}
                                 >
                                   TIK TOK:
                                 </p>
                                 <p
                                   style={{
                                     fontFamily: '"Futura PT Book"',
                                     color: '#000000',
                                     fontSize: '10px',
                                     margin: '0',
                                     textTransform: 'uppercase'
                                   }}
                                 >
                                   {(() => {
                                     const currentPeriod = getCurrentPeriod();
                                     const socialTagsPeriod = expandedOrder.socialTagsPeriod || '';
                                     const effectiveSocialTags = (socialTagsPeriod === currentPeriod) ? (expandedOrder.socialTags || 0) : 0;
                                     return effectiveSocialTags >= 3 ? '200/200' : '0/200';
                                   })()}
                                 </p>
                               </div>
                               <input
                                 type="text"
                                 placeholder="LINK TO TIK TOK"
                                 disabled={!canSubmitContent(expandedOrder.tiktokApprovedDate)}
                                 style={{
                                   width: '100%',
                                   padding: '8px',
                                   border: '1.3px solid #000000',
                                   fontFamily: '"Futura PT Book"',
                                   fontSize: '11px',
                                   backgroundColor: !canSubmitContent(expandedOrder.tiktokApprovedDate) ? '#F5F5F5' : '#FFFFFF',
                                   color: '#909090',
                                   boxSizing: 'border-box',
                                   borderRadius: '0',
                                   textTransform: 'uppercase',
                                   opacity: !canSubmitContent(expandedOrder.tiktokApprovedDate) ? 0.6 : 1,
                                   cursor: !canSubmitContent(expandedOrder.tiktokApprovedDate) ? 'not-allowed' : 'text'
                                 }}
                               />
                             </div>
                             
                             {/* YOUTUBE */}
                             <div style={{ marginBottom: '12px' }}>
                               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                 <p
                                   style={{
                                     fontFamily: '"Futura PT Medium"',
                                     color: '#EB1C24',
                                     fontSize: '10px',
                                     margin: '0',
                                     textTransform: 'uppercase',
                                     fontWeight: '500'
                                   }}
                                 >
                                   YOUTUBE:
                                 </p>
                                 <p
                                   style={{
                                     fontFamily: '"Futura PT Book"',
                                     color: '#000000',
                                     fontSize: '10px',
                                     margin: '0',
                                     textTransform: 'uppercase'
                                   }}
                                 >
                                   {(() => {
                                     const currentPeriod = getCurrentPeriod();
                                     const socialTagsPeriod = expandedOrder.socialTagsPeriod || '';
                                     const effectiveSocialTags = (socialTagsPeriod === currentPeriod) ? (expandedOrder.socialTags || 0) : 0;
                                     return effectiveSocialTags >= 4 ? '200/200' : '0/200';
                                   })()}
                                 </p>
                               </div>
                               <input
                                 type="text"
                                 placeholder="LINK TO VIDEO"
                                 disabled={!canSubmitContent(expandedOrder.youtubeApprovedDate)}
                                 style={{
                                   width: '100%',
                                   padding: '8px',
                                   border: '1.3px solid #000000',
                                   fontFamily: '"Futura PT Book"',
                                   fontSize: '11px',
                                   backgroundColor: !canSubmitContent(expandedOrder.youtubeApprovedDate) ? '#F5F5F5' : '#FFFFFF',
                                   color: '#909090',
                                   boxSizing: 'border-box',
                                   borderRadius: '0',
                                   textTransform: 'uppercase',
                                   opacity: !canSubmitContent(expandedOrder.youtubeApprovedDate) ? 0.6 : 1,
                                   cursor: !canSubmitContent(expandedOrder.youtubeApprovedDate) ? 'not-allowed' : 'text'
                                 }}
                               />
                             </div>
                             
                             {/* FACEBOOK */}
                             <div style={{ marginBottom: '12px' }}>
                               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                 <p
                                   style={{
                                     fontFamily: '"Futura PT Medium"',
                                     color: '#EB1C24',
                                     fontSize: '10px',
                                     margin: '0',
                                     textTransform: 'uppercase',
                                     fontWeight: '500'
                                   }}
                                 >
                                   FACEBOOK:
                                 </p>
                                 <p
                                   style={{
                                     fontFamily: '"Futura PT Book"',
                                     color: '#000000',
                                     fontSize: '10px',
                                     margin: '0',
                                     textTransform: 'uppercase'
                                   }}
                                 >
                                   {(() => {
                                     const currentPeriod = getCurrentPeriod();
                                     const socialTagsPeriod = expandedOrder.socialTagsPeriod || '';
                                     const effectiveSocialTags = (socialTagsPeriod === currentPeriod) ? (expandedOrder.socialTags || 0) : 0;
                                     return effectiveSocialTags >= 5 ? '200/200' : '0/200';
                                   })()}
                                 </p>
                               </div>
                               <input
                                 type="text"
                                 placeholder="LINK TO POST"
                                 disabled={!canSubmitContent(expandedOrder.facebookApprovedDate)}
                                 style={{
                                   width: '100%',
                                   padding: '8px',
                                   border: '1.3px solid #000000',
                                   fontFamily: '"Futura PT Book"',
                                   fontSize: '11px',
                                   backgroundColor: !canSubmitContent(expandedOrder.facebookApprovedDate) ? '#F5F5F5' : '#FFFFFF',
                                   color: '#909090',
                                   boxSizing: 'border-box',
                                   borderRadius: '0',
                                   textTransform: 'uppercase',
                                   opacity: !canSubmitContent(expandedOrder.facebookApprovedDate) ? 0.6 : 1,
                                   cursor: !canSubmitContent(expandedOrder.facebookApprovedDate) ? 'not-allowed' : 'text'
                                 }}
                               />
                             </div>
                             <p
                               style={{
                                 fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                                 color: '#EB1C24',
                                 fontSize: '10px',
                                 margin: '12px 0 0 0',
                                 textTransform: 'uppercase',
                                 fontWeight: '500',
                                 lineHeight: '1.4',
                                 textAlign: 'center'
                               }}
                             >
                               FOR ELIGIBILITY PURPOSES AND THE HIGHEST CHANCE FOR CONTENT APPROVAL: SUBMIT CLEAR + WELL LIT PHOTOS WITHOUT ANY FILTERS.
                             </p>
                           </div>
                         </>
                       );
                     })()
                   ) : (
                     <>
                       {/* REFERRAL CODE Section */}
                       <div style={{ marginBottom: '32px' }}>
                         <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '16px' }}>
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
                             REFERRAL CODE
                           </h2>
                           <p
                             style={{
                               fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                               color: '#000000',
                               fontSize: '13px',
                               margin: '0',
                               textTransform: 'uppercase'
                             }}
                           >
                             {generateReferralCode()}
                           </p>
                         </div>
                    
                    <div style={{ marginBottom: '12px' }}>
                      <p
                        style={{
                          fontFamily: '"Futura PT Book"',
                          color: '#000000',
                          fontSize: '10px',
                          margin: '0 0 12px 0',
                          textTransform: 'uppercase'
                        }}
                      >
                        ONCE YOU CREATE AN ACCOUNT, YOU'RE ASSIGNED A UNIQUE REFERRAL CODE. SHARE THIS CODE WITH FRIENDS & FAMILY TO EARN DIGITAL CASH EVERY TIME SOMEONE USES YOUR CODE AT CHECKOUT.
                      </p>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <p
                        style={{
                          fontFamily: '"Futura PT Medium"',
                          color: '#EB1C24',
                          fontSize: '10px',
                          margin: '0 0 8px 0',
                          textTransform: 'uppercase',
                          fontWeight: '500'
                        }}
                      >
                        HOW IT WORKS:
                      </p>
                      <p
                        style={{
                          fontFamily: '"Futura PT Book"',
                          color: '#000000',
                          fontSize: '10px',
                          margin: '0 0 12px 0',
                          textTransform: 'uppercase'
                        }}
                      >
                        WHEN SOMEONE MAKES A PURCHASE USING YOUR REFERRAL CODE, THEY RECEIVE <span style={{ color: '#EB1C24' }}>$20 OFF</span> THEIR ORDER AND YOU RECEIVE <span style={{ color: '#EB1C24' }}>$20</span> DEPOSITED INTO YOUR GIFT CARD BALANCE AFTER THEIR PURCHASE HAS BEEN CONFIRMED.
                      </p>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <p
                        style={{
                          fontFamily: '"Futura PT Medium"',
                          color: '#EB1C24',
                          fontSize: '10px',
                          margin: '0 0 8px 0',
                          textTransform: 'uppercase',
                          fontWeight: '500'
                        }}
                      >
                        IMPORTANT NOTES:
                      </p>
                      <p
                        style={{
                          fontFamily: '"Futura PT Book"',
                          color: '#000000',
                          fontSize: '10px',
                          margin: '0 0 4px 0',
                          textTransform: 'uppercase'
                        }}
                      >
                        • REFERRAL CODES CAN ONLY BE APPLIED ONCE PER ACCOUNT
                      </p>
                      <p
                        style={{
                          fontFamily: '"Futura PT Book"',
                          color: '#000000',
                          fontSize: '10px',
                          margin: '0 0 4px 0',
                          textTransform: 'uppercase'
                        }}
                      >
                        • YOU CANNOT USE YOUR OWN REFERRAL CODE UNDER YOUR ACCOUNT
                      </p>
                      <p
                        style={{
                          fontFamily: '"Futura PT Book"',
                          color: '#000000',
                          fontSize: '10px',
                          margin: '0 0 12px 0',
                          textTransform: 'uppercase'
                        }}
                      >
                        • YOU MUST CREATE AN ACCOUNT OR BE SIGNED IN TO CHECKOUT WITH A REFERRAL CODE (FOR TRACKING PURPOSES)
                      </p>
                    </div>
                  </div>

                  {/* BECOME AN AFFILIATE Section */}
                  <div style={{ marginBottom: '32px' }}>
                    <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '16px' }}>
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
                        BECOME AN AFFILIATE
                      </h2>
                    </div>
                    
                    <div style={{ marginBottom: '12px' }}>
                      <p
                        style={{
                          fontFamily: '"Futura PT Medium"',
                          color: '#EB1C24',
                          fontSize: '10px',
                          margin: '0 0 8px 0',
                          textTransform: 'uppercase',
                          fontWeight: '500'
                        }}
                      >
                        APPROVED PHOTO + VIDEO:
                      </p>
                      <p
                        style={{
                          fontFamily: '"Futura PT Book"',
                          color: '#000000',
                          fontSize: '10px',
                          margin: '0 0 12px 0',
                          textTransform: 'uppercase'
                        }}
                      >
                        RECEIVE <span style={{ color: '#EB1C24' }}>500 PTS</span> FOR EACH APPROVED PHOTO AND <span style={{ color: '#EB1C24' }}>500 PTS</span> FOR EACH APPROVED VIDEO PER PRODUCT (<span style={{ color: '#EB1C24' }}>1,000 PTS</span> TOTAL PER UNIT)*
                      </p>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <p
                        style={{
                          fontFamily: '"Futura PT Medium"',
                          color: '#EB1C24',
                          fontSize: '10px',
                          margin: '0 0 8px 0',
                          textTransform: 'uppercase',
                          fontWeight: '500'
                        }}
                      >
                        SOCIAL TAGS:
                      </p>
                      <p
                        style={{
                          fontFamily: '"Futura PT Book"',
                          color: '#000000',
                          fontSize: '10px',
                          margin: '0 0 12px 0',
                          textTransform: 'uppercase'
                        }}
                      >
                        EARN <span style={{ color: '#EB1C24' }}>200 PTS</span> PER SOCIAL PLATFORM WHEN YOU TAG US ON YOUR POSTS OR VIDEOS/REELS. PLATFORMS INCLUDE: TWITTER/X, INSTAGRAM, FACEBOOK, YOUTUBE, TIKTOK (<span style={{ color: '#EB1C24' }}>UP TO 1,000 PTS</span> PER PRODUCT)*
                      </p>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <p
                        style={{
                          fontFamily: '"Futura PT Book"',
                          color: '#000000',
                          fontSize: '9px',
                          margin: '0 0 4px 0'
                        }}
                      >
                        *SUBMITTED PHOTOS/VIDEOS THAT ARE APPROVED/ELIGIBLE FOR AFFILIATE POINTS SHOULD HAVE GOOD LIGHTING WITH NO FILTERS, IN CASE WE WANT TO FEATURE IT ON OUR SOCIALS OR FOR MARKETING.
                      </p>
                      <p
                        style={{
                          fontFamily: '"Futura PT Book"',
                          color: '#000000',
                          fontSize: '9px',
                          margin: '0 0 4px 0'
                        }}
                      >
                        *TAG INCLUDES CONTENT VIA TWITTER/X, FACEBOOK, INSTAGRAM, TIKTOK + YOUTUBE, PER APPROVAL
                      </p>
                      <p
                        style={{
                          fontFamily: '"Futura PT Book"',
                          color: '#000000',
                          fontSize: '9px',
                          margin: '0 0 12px 0'
                        }}
                      >
                        *VIDEO MUST BE AT LEAST 10-60 SECONDS IN DURATION, PER APPROVAL
                      </p>
                    </div>
                  </div>

                  {/* SUBMIT CONTENT Section */}
                  <div style={{ marginBottom: '32px' }}>
                    <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '16px' }}>
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
                        AFFILIATE REWARDS
                      </h2>
                    </div>
                    
                    {deliveredOrders.length === 0 ? (
                      <div className="flex flex-col justify-center items-center my-2 flex-shrink-0" style={{ minHeight: '200px' }}>
                        <p
                          style={{
                            fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                            fontSize: '11px',
                            color: '#909090',
                            margin: 0,
                            textTransform: 'uppercase',
                            textAlign: 'center',
                            lineHeight: '1.4'
                          }}
                        >
                          YOU DON'T HAVE ANY ORDERS ELIGIBLE FOR CONTENT YET, CHECK BACK SOON.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col justify-start items-start gap-4 my-2 flex-shrink-0">
                        {deliveredOrders.map((order) => (
                          <div key={order.id} className="flex items-center gap-3" style={{ flexShrink: 0 }}>
                            {/* Thumbnail */}
                            <div 
                              className="flex flex-col items-center" 
                              style={{ flexShrink: 0, cursor: 'pointer' }}
                              onClick={() => setExpandedOrderId(order.id)}
                            >
                              <img
                                src={order.productImage}
                                alt={order.productName}
                                style={{
                                  width: '102px',
                                  height: '102px',
                                  objectFit: 'contain',
                                  cursor: 'pointer'
                                }}
                                onClick={() => setExpandedOrderId(order.id)}
                              />
                               <p
                                 style={{
                                   fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                                   color: '#EB1C24',
                                   fontSize: '12px',
                                   margin: '2px 0 0 0',
                                   textTransform: 'uppercase',
                                   cursor: 'pointer'
                                 }}
                                 onClick={() => setExpandedOrderId(order.id)}
                               >
                                 SUBMIT CONTENT
                               </p>
                            </div>
                            
                            {/* Order Detail Text */}
                            <div className="flex flex-col gap-1" style={{ flexShrink: 0, transform: 'translateY(-6px)' }}>
                              <p style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '19px', color: '#000000', margin: 0, lineHeight: '1.2' }}>
                                {order.productName}
                              </p>
                              <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#EB1C24', margin: 0, lineHeight: '1.2' }}>
                                {(() => {
                                  // Calculate total points (photo/video + social) with period reset
                                  const effectivePoints = getEffectivePoints(order);
                                  const currentPeriod = getCurrentPeriod();
                                  const socialTagsPeriod = order.socialTagsPeriod || '';
                                  const effectiveSocialTags = (socialTagsPeriod === currentPeriod) ? (order.socialTags || 0) : 0;
                                  const photoVideoEarned = effectivePoints.photoVideo;
                                  const socialPointsEarned = effectiveSocialTags * 200;
                                  const totalEarned = photoVideoEarned + socialPointsEarned;
                                  if (totalEarned === 0) {
                                    return '0/2,000';
                                  } else {
                                    return `${totalEarned.toLocaleString()}/2,000`;
                                  }
                                })()}
                              </p>
                              <p style={{ fontFamily: '"Futura PT Demi", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#909090', margin: 0, lineHeight: '1.2' }}>
                                {(() => {
                                  // Calculate total points (photo/video + social) with period reset
                                  const effectivePoints = getEffectivePoints(order);
                                  const currentPeriod = getCurrentPeriod();
                                  const socialTagsPeriod = order.socialTagsPeriod || '';
                                  const effectiveSocialTags = (socialTagsPeriod === currentPeriod) ? (order.socialTags || 0) : 0;
                                  const photoVideoEarned = effectivePoints.photoVideo;
                                  const socialPointsEarned = effectiveSocialTags * 200;
                                  const totalEarned = photoVideoEarned + socialPointsEarned;
                                  const contentStatus = order.contentStatus || 'not_submitted';
                                  
                                  // If no content submitted yet
                                  if (contentStatus === 'not_submitted') {
                                    return '0 CONTENT SUBMITTED';
                                  }
                                  
                                  // If content is pending review
                                  if (contentStatus === 'pending') {
                                    const pendingPhotos = order.pendingPhotos || 0;
                                    const pendingVideos = order.pendingVideos || 0;
                                    const pendingSocialTags = order.socialTags || 0;
                                    const pendingPhotoVideoPoints = (pendingPhotos * 500) + (pendingVideos * 500);
                                    const pendingSocialPoints = pendingSocialTags * 200;
                                    const totalPendingPoints = pendingPhotoVideoPoints + pendingSocialPoints;
                                    return `+${totalPendingPoints.toLocaleString()} POINTS PENDING`;
                                  }
                                  
                                  // If content was rejected
                                  if (contentStatus === 'rejected') {
                                    return 'CONTENT REJECTED';
                                  }
                                  
                                  // If content is approved, show points earned
                                  if (contentStatus === 'approved') {
                                    const available = order.pointsAvailable || 2000;
                                    if (totalEarned >= available) {
                                      return 'ALL POINTS EARNED';
                                    } else {
                                      return `+${totalEarned.toLocaleString()} POINTS EARNED`;
                                    }
                                  }
                                  
                                  // Fallback
                                  return '0 CONTENT SUBMITTED';
                                })()}
                              </p>
                              <p style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '10px', color: '#000000', margin: 0, lineHeight: '1.2' }}>
                                {(() => {
                                  const currentPeriod = getCurrentPeriod();
                                  const socialTagsPeriod = order.socialTagsPeriod || '';
                                  const effectiveSocialTags = (socialTagsPeriod === currentPeriod) ? (order.socialTags || 0) : 0;
                                  return `${effectiveSocialTags}/5 SOCIALS`;
                                })()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                     )}
                   </div>
                 </>
               )}
                 </div>
                 
                 {/* Submit Button - Below main card */}
                 {expandedOrderId && (
                   <div className="px-0 md:px-0" style={{ marginTop: '12px', marginBottom: '10px', transform: 'translateY(-2px)' }}>
                     <button
                       className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                       style={{ 
                         borderWidth: '1.3px', 
                         color: '#EB1C24',
                         fontFamily: '"Futura PT Medium"',
                         backgroundColor: '#FFFFFF'
                       }}
                       type="button"
                     >
                       SUBMIT
                     </button>
                   </div>
                 )}
               </>
             )}
           </div>
         </div>
       </div>
     </div>
   );
 }
 
 export default AffiliatePage;
