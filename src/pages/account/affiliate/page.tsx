import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import ConfirmationModal from '../../../components/ConfirmationModal';
import ImageViewerModal from '../../../components/ImageViewerModal';

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
  submittedPhotos?: Array<{ id: string; file: File | string; preview: string; status: 'pending' | 'approved' | 'rejected'; points?: number; submittedDate: string; rejectionReason?: string }>;
  submittedVideos?: Array<{ id: string; file: File | string; preview: string; status: 'pending' | 'approved' | 'rejected'; points?: number; submittedDate: string; rejectionReason?: string }>;
  submittedSocials?: Array<{ id: string; platform: string; link: string; status: 'pending' | 'approved' | 'rejected'; points?: number; submittedDate: string; rejectionReason?: string }>;
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
      pointsEarned: 400, // Mock: earned 400 pts for approved photo
      pointsAvailable: 5000, // Max: 2,000 (800 photos + 1,200 videos) + 3,000 (5 social tags × 600)
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
      pointsAvailable: 5000, // Max: 2,000 (800 photos + 1,200 videos) + 3,000 (5 social tags × 600)
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
      pointsEarned: 2000, // Mock: earned 2000 pts (2 photos + 2 videos approved)
      pointsAvailable: 5000, // Max: 2,000 (800 photos + 1,200 videos) + 3,000 (5 social tags × 600)
      contentStatus: 'approved', // Content approved
      socialTags: 2, // 2 social tags submitted (800 social points)
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
      pointsAvailable: 5000,
      contentStatus: 'pending', // Content pending review
      socialTags: 1, // 1 social tag pending
      pendingPhotos: 1, // 1 photo pending (400 pts)
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
      pointsAvailable: 5000,
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
      pointsEarned: 2000, // Mock: earned 2000 pts (2 photos + 2 videos approved)
      pointsAvailable: 5000, // Max: 2,000 (800 photos + 1,200 videos) + 3,000 (5 social tags × 600)
      contentStatus: 'approved', // Content approved
      socialTags: 3, // 3 social tags approved (1,200 social points)
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
      pointsEarned: 400, // Mock: earned 400 pts (1 photo approved)
      pointsAvailable: 5000, // Max: 2,000 (800 photos + 1,200 videos) + 3,000 (5 social tags × 600)
      contentStatus: 'approved', // Content approved
      socialTags: 1, // 1 social tag approved (600 social points)
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
      pointsAvailable: 5000, // Max: 2,000 (800 photos + 1,200 videos) + 3,000 (5 social tags × 600)
      contentStatus: 'not_submitted', // No content submitted
      socialTags: 0 // No social tags
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
      pointsEarned: 2000, // Mock: earned 2000 pts (2 photos + 2 videos approved)
      pointsAvailable: 5000,
      contentStatus: 'approved', // All content approved
      socialTags: 5, // All 5 social tags approved (3,000 social points)
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
      pointsEarned: 2000, // Mock: all photo/video points earned (2 photos + 2 videos)
      pointsAvailable: 5000,
      contentStatus: 'approved', // All content approved
      socialTags: 5, // All 5 social tags approved (3,000 social points)
      pointsEarnedPeriod: getCurrentPeriod(), // Current period
      socialTagsPeriod: getCurrentPeriod(), // Current period
      photo1ApprovedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
      photo2ApprovedDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(), // 11 days ago
      video1ApprovedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      video2ApprovedDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), // 9 days ago
      twitterApprovedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
      instagramApprovedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      tiktokApprovedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
      youtubeApprovedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      facebookApprovedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // 4 days ago
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
      pointsAvailable: 5000,
      contentStatus: 'pending', // Content pending
      socialTags: 3, // 3 social tags pending
      pendingPhotos: 1, // 1 photo pending (400 pts)
      pendingVideos: 1 // 1 video pending (600 pts)
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
            pointsAvailable: order.pointsAvailable !== undefined ? order.pointsAvailable : 5000 // Default to max 5,000 pts if not set
          }));
      }
    } catch (e) {
      console.error('Error loading delivered orders:', e);
    }

    return [];
  };

  const [deliveredOrders] = useState<Order[]>(() => getDeliveredOrders());
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [galleryActiveTab, setGalleryActiveTab] = useState<'photos' | 'videos' | 'socials'>('photos');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: 'photo' | 'video' | 'social'; id: string } | null>(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [submitDebugMessage, setSubmitDebugMessage] = useState<string>('');
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerCurrentIndex, setViewerCurrentIndex] = useState(0);
  
  // State for submitted content gallery (stored per order) - Load from localStorage and merge with mock data
  const [submittedContent, setSubmittedContent] = useState<{ [orderId: string]: { photos: Array<{ id: string; file: File | string; preview: string; status: 'pending' | 'approved' | 'rejected'; points?: number; submittedDate: string; rejectionReason?: string }>; videos: Array<{ id: string; file: File | string; preview: string; status: 'pending' | 'approved' | 'rejected'; points?: number; submittedDate: string; rejectionReason?: string }>; socials: Array<{ id: string; platform: string; link: string; status: 'pending' | 'approved' | 'rejected'; points?: number; submittedDate: string; rejectionReason?: string }> } }>(() => {
    // Load from localStorage first
    let storedContent: { [orderId: string]: { photos: Array<{ id: string; file: File | string; preview: string; status: 'pending' | 'approved' | 'rejected'; points?: number; submittedDate: string; rejectionReason?: string }>; videos: Array<{ id: string; file: File | string; preview: string; status: 'pending' | 'approved' | 'rejected'; points?: number; submittedDate: string; rejectionReason?: string }>; socials: Array<{ id: string; platform: string; link: string; status: 'pending' | 'approved' | 'rejected'; points?: number; submittedDate: string; rejectionReason?: string }> } } = {};
    
    try {
      const stored = localStorage.getItem('affiliateSubmittedContent');
      if (stored) {
        storedContent = JSON.parse(stored);
        console.log('✅ Loaded submitted content from localStorage:', Object.keys(storedContent).length, 'orders');
      }
    } catch (e) {
      console.error('❌ Error loading submitted content from localStorage:', e);
    }
    
    // Mock data for admin account (Kateena Armstrong) orders only - merge with stored content
    const mockContent: { [orderId: string]: { photos: Array<{ id: string; file: File | string; preview: string; status: 'pending' | 'approved' | 'rejected'; points?: number; submittedDate: string; rejectionReason?: string }>; videos: Array<{ id: string; file: File | string; preview: string; status: 'pending' | 'approved' | 'rejected'; points?: number; submittedDate: string; rejectionReason?: string }>; socials: Array<{ id: string; platform: string; link: string; status: 'pending' | 'approved' | 'rejected'; points?: number; submittedDate: string; rejectionReason?: string }> } } = {};
    
    // Mock data for NOIR order (kateena-delivered-1) - has some approved content
    mockContent['kateena-delivered-1'] = {
      photos: [
        {
          id: 'photo-noir-1',
          file: '/assets/gallery-mock.png',
          preview: '/assets/gallery-mock.png',
          status: 'approved',
          points: 400,
          submittedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
        },
        {
          id: 'photo-noir-2',
          file: '/assets/gallery-mock.png',
          preview: '/assets/gallery-mock.png',
          status: 'pending',
          submittedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        }
      ],
      videos: [],
      socials: [
        {
          id: 'social-noir-twitter',
          platform: 'Twitter',
          link: 'https://twitter.com/user/status/1234567890',
          status: 'approved',
          points: 400,
          submittedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // 4 days ago
        },
        {
          id: 'social-noir-instagram',
          platform: 'Instagram',
          link: 'https://instagram.com/p/abcdefghij',
          status: 'approved',
          points: 400,
          submittedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
        },
        {
          id: 'social-noir-tiktok',
          platform: 'TikTok',
          link: 'https://tiktok.com/@user/video/1234567890',
          status: 'approved',
          points: 400,
          submittedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
        }
      ]
    };
    
    // Mock data for BLANCO order (kateena-delivered-2) - has some approved content and rejected content
    mockContent['kateena-delivered-2'] = {
      photos: [
        {
          id: 'photo-blanco-1',
          file: '/assets/gallery-mock.png',
          preview: '/assets/gallery-mock.png',
          status: 'approved',
          points: 400,
          submittedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
        },
        {
          id: 'photo-blanco-2',
          file: '/assets/gallery-mock.png',
          preview: '/assets/gallery-mock.png',
          status: 'rejected',
          rejectionReason: 'LIGHTING',
          submittedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() // 8 days ago
        }
      ],
      videos: [
        {
          id: 'video-blanco-1',
          file: '/assets/gallery-mock.png',
          preview: '/assets/gallery-mock.png',
          status: 'rejected',
          rejectionReason: 'DUPLICATE CONTENT',
          submittedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
        }
      ],
      socials: [
        {
          id: 'social-blanco-instagram',
          platform: 'Instagram',
          link: 'https://instagram.com/p/xyz123456',
          status: 'approved',
          points: 400,
          submittedDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() // 9 days ago
        },
        {
          id: 'social-blanco-twitter',
          platform: 'Twitter',
          link: 'https://twitter.com/user/status/blanco456',
          status: 'rejected',
          rejectionReason: 'LIGHTING',
          submittedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() // 6 days ago
        }
      ]
    };
    
    // Mock data for SOFT WAVE order (kateena-delivered-3) - no content submitted
    mockContent['kateena-delivered-3'] = {
      photos: [],
      videos: [],
      socials: []
    };
    
    // Mock data for SOFT CURL order (kateena-delivered-4) - all approved (4,000 points)
    mockContent['kateena-delivered-4'] = {
      photos: [
        {
          id: 'photo-curl-1',
          file: '/assets/gallery-mock.png',
          preview: '/assets/gallery-mock.png',
          status: 'approved',
          points: 400,
          submittedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() // 12 days ago
        },
        {
          id: 'photo-curl-2',
          file: '/assets/gallery-mock.png',
          preview: '/assets/gallery-mock.png',
          status: 'approved',
          points: 400,
          submittedDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString() // 11 days ago
        }
      ],
      videos: [
        {
          id: 'video-curl-1',
          file: '/assets/gallery-mock.png',
          preview: '/assets/gallery-mock.png',
          status: 'approved',
          points: 600,
          submittedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
        },
        {
          id: 'video-curl-2',
          file: '/assets/gallery-mock.png',
          preview: '/assets/gallery-mock.png',
          status: 'approved',
          points: 600,
          submittedDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() // 9 days ago
        }
      ],
      socials: [
        {
          id: 'social-curl-twitter',
          platform: 'Twitter',
          link: 'https://twitter.com/user/status/9876543210',
          status: 'approved',
          points: 400,
          submittedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() // 8 days ago
        },
        {
          id: 'social-curl-instagram',
          platform: 'Instagram',
          link: 'https://instagram.com/p/xyz123456',
          status: 'approved',
          points: 400,
          submittedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
        },
        {
          id: 'social-curl-tiktok',
          platform: 'TikTok',
          link: 'https://tiktok.com/@user/video/9876543210',
          status: 'approved',
          points: 400,
          submittedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() // 6 days ago
        },
        {
          id: 'social-curl-youtube',
          platform: 'YouTube',
          link: 'https://youtube.com/watch?v=9876543210',
          status: 'approved',
          points: 400,
          submittedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
        },
        {
          id: 'social-curl-facebook',
          platform: 'Facebook',
          link: 'https://facebook.com/user/posts/9876543210',
          status: 'approved',
          points: 400,
          submittedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // 4 days ago
        }
      ]
    };
    
    // Mock data for OCEAN CURL order (kateena-delivered-5) - has pending content
    mockContent['kateena-delivered-5'] = {
      photos: [
        {
          id: 'photo-ocean-1',
          file: '/assets/gallery-mock.png',
          preview: '/assets/gallery-mock.png',
          status: 'pending',
          submittedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
        }
      ],
      videos: [
        {
          id: 'video-ocean-1',
          file: '/assets/gallery-mock.png',
          preview: '/assets/gallery-mock.png',
          status: 'pending',
          submittedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        }
      ],
      socials: [
        {
          id: 'social-ocean-twitter',
          platform: 'Twitter',
          link: 'https://twitter.com/user/status/1111111111',
          status: 'pending',
          submittedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
        },
        {
          id: 'social-ocean-instagram',
          platform: 'Instagram',
          link: 'https://instagram.com/p/aaaa1111',
          status: 'pending',
          submittedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
        },
        {
          id: 'social-ocean-tiktok',
          platform: 'TikTok',
          link: 'https://tiktok.com/@user/video/1111111111',
          status: 'pending',
          submittedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
        }
      ]
    };
    
    // Mock data for BEACH WAVE order (kateena-delivered-6) - all approved (4,000 points)
    mockContent['kateena-delivered-6'] = {
      photos: [
        {
          id: 'photo-beach-1',
          file: '/assets/gallery-mock.png',
          preview: '/assets/gallery-mock.png',
          status: 'approved',
          points: 400,
          submittedDate: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString() // 23 days ago
        },
        {
          id: 'photo-beach-2',
          file: '/assets/gallery-mock.png',
          preview: '/assets/gallery-mock.png',
          status: 'approved',
          points: 400,
          submittedDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString() // 22 days ago
        }
      ],
      videos: [
        {
          id: 'video-beach-1',
          file: '/assets/gallery-mock.png',
          preview: '/assets/gallery-mock.png',
          status: 'approved',
          points: 600,
          submittedDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString() // 21 days ago
        },
        {
          id: 'video-beach-2',
          file: '/assets/gallery-mock.png',
          preview: '/assets/gallery-mock.png',
          status: 'approved',
          points: 600,
          submittedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() // 20 days ago
        }
      ],
      socials: [
        {
          id: 'social-beach-twitter',
          platform: 'Twitter',
          link: 'https://twitter.com/user/status/2222222222',
          status: 'approved',
          points: 400,
          submittedDate: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString() // 19 days ago
        },
        {
          id: 'social-beach-instagram',
          platform: 'Instagram',
          link: 'https://instagram.com/p/bbbb2222',
          status: 'approved',
          points: 400,
          submittedDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString() // 18 days ago
        },
        {
          id: 'social-beach-tiktok',
          platform: 'TikTok',
          link: 'https://tiktok.com/@user/video/2222222222',
          status: 'approved',
          points: 400,
          submittedDate: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString() // 17 days ago
        },
        {
          id: 'social-beach-youtube',
          platform: 'YouTube',
          link: 'https://youtube.com/watch?v=2222222222',
          status: 'approved',
          points: 400,
          submittedDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString() // 16 days ago
        },
        {
          id: 'social-beach-facebook',
          platform: 'Facebook',
          link: 'https://facebook.com/user/posts/2222222222',
          status: 'approved',
          points: 400,
          submittedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days ago
        }
      ]
    };
    
    // Merge stored content with mock content - stored content takes precedence
    // This ensures user-submitted content is preserved while keeping mock data for demo
    const mergedContent = { ...mockContent };
    
    // Overwrite with stored content (user submissions take priority)
    Object.keys(storedContent).forEach(orderId => {
      if (storedContent[orderId]) {
        // Merge arrays, keeping all items from stored content
        mergedContent[orderId] = {
          photos: storedContent[orderId].photos || [],
          videos: storedContent[orderId].videos || [],
          socials: storedContent[orderId].socials || []
        };
      }
    });
    
    // Also preserve any stored content for orders not in mock data
    Object.keys(storedContent).forEach(orderId => {
      if (!mergedContent[orderId]) {
        mergedContent[orderId] = storedContent[orderId];
      }
    });
    
    console.log('✅ Merged content (stored + mock):', Object.keys(mergedContent).length, 'orders');
    // Log pending content count
    let pendingCount = 0;
    Object.values(mergedContent).forEach(order => {
      pendingCount += (order.photos?.filter((p: any) => p.status === 'pending').length || 0);
      pendingCount += (order.videos?.filter((v: any) => v.status === 'pending').length || 0);
    });
    if (pendingCount > 0) {
      console.log('📸 Found', pendingCount, 'pending items in merged content');
    }
    return mergedContent;
  });
  
  // Reset inputs when order changes
  useEffect(() => {
    setPhoto1File(null);
    setPhoto1Preview(null);
    setPhoto2File(null);
    setPhoto2Preview(null);
    setVideo1File(null);
    setVideo1Preview(null);
    setVideo2File(null);
    setVideo2Preview(null);
    setTwitterLink('');
    setInstagramLink('');
    setTiktokLink('');
    setYoutubeLink('');
    setFacebookLink('');
    setGalleryActiveTab('photos');
    if (photo1InputRef.current) photo1InputRef.current.value = '';
    if (photo2InputRef.current) photo2InputRef.current.value = '';
    if (video1InputRef.current) video1InputRef.current.value = '';
    if (video2InputRef.current) video2InputRef.current.value = '';
  }, [expandedOrderId]);
  
  // File state for photo and video uploads
  const [photo1File, setPhoto1File] = useState<File | null>(null);
  const [photo1Preview, setPhoto1Preview] = useState<string | null>(null);
  const [photo2File, setPhoto2File] = useState<File | null>(null);
  const [photo2Preview, setPhoto2Preview] = useState<string | null>(null);
  const [video1File, setVideo1File] = useState<File | null>(null);
  const [video1Preview, setVideo1Preview] = useState<string | null>(null);
  const [video2File, setVideo2File] = useState<File | null>(null);
  const [video2Preview, setVideo2Preview] = useState<string | null>(null);
  
  // State for social link inputs
  const [twitterLink, setTwitterLink] = useState<string>('');
  const [instagramLink, setInstagramLink] = useState<string>('');
  const [tiktokLink, setTiktokLink] = useState<string>('');
  const [youtubeLink, setYoutubeLink] = useState<string>('');
  const [facebookLink, setFacebookLink] = useState<string>('');
  
  // Refs for file inputs
  const photo1InputRef = useRef<HTMLInputElement>(null);
  const photo2InputRef = useRef<HTMLInputElement>(null);
  const video1InputRef = useRef<HTMLInputElement>(null);
  const video2InputRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  
  // File change handlers - only set preview, don't auto-submit
  const handlePhoto1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto1File(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        setPhoto1Preview(preview);
      };
      reader.onerror = () => {
        console.error('Error reading photo1 file');
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
        const preview = reader.result as string;
        setPhoto2Preview(preview);
      };
      reader.onerror = () => {
        console.error('Error reading photo2 file');
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
        const preview = reader.result as string;
        setVideo1Preview(preview);
      };
      reader.onerror = () => {
        console.error('Error reading video1 file');
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
        const preview = reader.result as string;
        setVideo2Preview(preview);
      };
      reader.onerror = () => {
        console.error('Error reading video2 file');
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Helper function to save submittedContent to localStorage
  const saveSubmittedContentToStorage = (content: { [orderId: string]: { photos: Array<{ id: string; file: File | string; preview: string; status: 'pending' | 'approved' | 'rejected'; points?: number; submittedDate: string; rejectionReason?: string }>; videos: Array<{ id: string; file: File | string; preview: string; status: 'pending' | 'approved' | 'rejected'; points?: number; submittedDate: string; rejectionReason?: string }>; socials: Array<{ id: string; platform: string; link: string; status: 'pending' | 'approved' | 'rejected'; points?: number; submittedDate: string; rejectionReason?: string }> } }) => {
    try {
      const contentToStore = JSON.parse(JSON.stringify(content, (_key, value) => {
        // Convert File objects to their preview URLs for storage
        if (value instanceof File) {
          return null; // We'll use preview instead
        }
        return value;
      }));
      
      // Ensure all file references and previews use strings (data URLs)
      Object.keys(contentToStore).forEach(orderId => {
        if (contentToStore[orderId].photos) {
          contentToStore[orderId].photos = contentToStore[orderId].photos.map((photo: any) => {
            // Ensure preview is always a string (data URL)
            const previewString = typeof photo.preview === 'string' ? photo.preview : (typeof photo.file === 'string' ? photo.file : '');
            return {
              ...photo,
              file: typeof photo.file === 'string' ? photo.file : previewString,
              preview: previewString
            };
          }).filter((photo: any) => photo.preview && photo.preview.length > 0); // Remove any items without valid previews
        }
        if (contentToStore[orderId].videos) {
          contentToStore[orderId].videos = contentToStore[orderId].videos.map((video: any) => {
            // Ensure preview is always a string (data URL)
            const previewString = typeof video.preview === 'string' ? video.preview : (typeof video.file === 'string' ? video.file : '');
            return {
              ...video,
              file: typeof video.file === 'string' ? video.file : previewString,
              preview: previewString
            };
          }).filter((video: any) => video.preview && video.preview.length > 0); // Remove any items without valid previews
        }
      });
      
      console.log('💾 Saving to localStorage:', Object.keys(contentToStore).length, 'orders');
      
      localStorage.setItem('affiliateSubmittedContent', JSON.stringify(contentToStore));
    } catch (e) {
      console.error('Error saving submitted content to localStorage:', e);
    }
  };
  
  // Submit handler - adds all pending content to submittedContent
  const handleSubmitContent = async (e?: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Visual debug feedback - shows on mobile screen
    setSubmitDebugMessage('Button clicked! Processing...');
    
    if (!expandedOrderId) {
      setSubmitDebugMessage('Error: No order selected');
      setTimeout(() => setSubmitDebugMessage(''), 3000);
      return;
    }
    
    // Check for content - also check file inputs directly as fallback for mobile
    const hasPhoto1 = !!photo1File || (photo1InputRef.current?.files && photo1InputRef.current.files.length > 0);
    const hasPhoto2 = !!photo2File || (photo2InputRef.current?.files && photo2InputRef.current.files.length > 0);
    const hasVideo1 = !!video1File || (video1InputRef.current?.files && video1InputRef.current.files.length > 0);
    const hasVideo2 = !!video2File || (video2InputRef.current?.files && video2InputRef.current.files.length > 0);
    const hasSocialLinks = !!(twitterLink.trim() || instagramLink.trim() || tiktokLink.trim() || 
      youtubeLink.trim() || facebookLink.trim());
    
    const hasContent = hasPhoto1 || hasPhoto2 || hasVideo1 || hasVideo2 || hasSocialLinks;
    
    // Debug info
    const debugInfo = `Files: P1=${!!photo1File}, P2=${!!photo2File}, V1=${!!video1File}, V2=${!!video2File}, Inputs: P1=${hasPhoto1}, P2=${hasPhoto2}, V1=${hasVideo1}, V2=${hasVideo2}, Social=${hasSocialLinks}`;
    console.log('Content check:', debugInfo);
    
    if (!hasContent) {
      setSubmitDebugMessage(`No content found. ${debugInfo}`);
      setTimeout(() => setSubmitDebugMessage(''), 5000);
      return;
    }
    
    // If files exist in input but not in state, get them from input directly (mobile fallback)
    // We'll use these in the submission logic below
    const photo1FileToUse = photo1File || (photo1InputRef.current?.files?.[0] || null);
    const photo2FileToUse = photo2File || (photo2InputRef.current?.files?.[0] || null);
    const video1FileToUse = video1File || (video1InputRef.current?.files?.[0] || null);
    const video2FileToUse = video2File || (video2InputRef.current?.files?.[0] || null);
    
    try {
        const orderContent = submittedContent[expandedOrderId] || { photos: [], videos: [], socials: [] };
        const filteredContent = getFilteredContent(expandedOrderId);
      // Use filteredContent (current period) as base, but preserve content from other periods
      // This ensures we only work with current period content when submitting
      const updatedContent = { 
        photos: [...(orderContent.photos || [])], 
        videos: [...(orderContent.videos || [])], 
        socials: [...(orderContent.socials || [])] 
      };
    
    // Helper to create preview if missing
    const createPreview = (file: File, existingPreview: string | null): Promise<string> => {
      return new Promise((resolve, reject) => {
        if (existingPreview) {
          resolve(existingPreview);
        } else {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) {
              resolve(reader.result as string);
            } else {
              reject(new Error('Failed to read file'));
            }
          };
          reader.onerror = () => {
            reject(new Error('Error reading file'));
          };
          reader.readAsDataURL(file);
        }
      });
    };
    
    // Submit photos
    if (photo1FileToUse) {
      // Ensure we have a preview string before saving
      const preview = photo1Preview || await createPreview(photo1FileToUse as File, photo1Preview);
      const rejectedPhoto = filteredContent.photos.find(p => p.status === 'rejected');
        if (rejectedPhoto) {
        updatedContent.photos = updatedContent.photos.map(p => 
                p.id === rejectedPhoto.id 
            ? { ...p, file: preview, preview: preview, status: 'pending' as const, submittedDate: new Date().toISOString() }
                  : p
        );
        } else {
        updatedContent.photos = [...updatedContent.photos, {
                id: `photo-${Date.now()}-1`,
          file: preview,
          preview: preview,
                status: 'pending' as const,
                submittedDate: new Date().toISOString()
        }];
            }
        setPhoto1File(null);
        setPhoto1Preview(null);
        if (photo1InputRef.current) photo1InputRef.current.value = '';
    }
    
    if (photo2FileToUse) {
      // Ensure we have a preview string before saving
      const preview2 = photo2Preview || await createPreview(photo2FileToUse as File, photo2Preview);
        const rejectedPhotos = filteredContent.photos.filter(p => p.status === 'rejected');
        const rejectedPhoto = rejectedPhotos.length > 1 ? rejectedPhotos[1] : rejectedPhotos[0];
        if (rejectedPhoto && rejectedPhotos.length > 1) {
        updatedContent.photos = updatedContent.photos.map(p => 
                p.id === rejectedPhoto.id 
            ? { ...p, file: preview2, preview: preview2, status: 'pending' as const, submittedDate: new Date().toISOString() }
                  : p
        );
        } else if (rejectedPhoto) {
        const alreadyReplaced = updatedContent.photos.find(p => p.status === 'pending' && p.id !== rejectedPhoto.id);
          if (!alreadyReplaced) {
          updatedContent.photos = updatedContent.photos.map(p => 
                  p.id === rejectedPhoto.id 
              ? { ...p, file: preview2, preview: preview2, status: 'pending' as const, submittedDate: new Date().toISOString() }
                    : p
          );
          } else {
          updatedContent.photos = [...updatedContent.photos, {
                  id: `photo-${Date.now()}-2`,
            file: preview2,
            preview: preview2,
                  status: 'pending' as const,
                  submittedDate: new Date().toISOString()
          }];
          }
        } else {
        updatedContent.photos = [...updatedContent.photos, {
                id: `photo-${Date.now()}-2`,
          file: preview2,
          preview: preview2,
                status: 'pending' as const,
                submittedDate: new Date().toISOString()
        }];
            }
        setPhoto2File(null);
        setPhoto2Preview(null);
        if (photo2InputRef.current) photo2InputRef.current.value = '';
    }
    
    // Submit videos
    if (video1FileToUse) {
      // Ensure we have a preview string before saving
      const videoPreview1 = video1Preview || await createPreview(video1FileToUse as File, video1Preview);
        const rejectedVideo = filteredContent.videos.find(v => v.status === 'rejected');
        if (rejectedVideo) {
        updatedContent.videos = updatedContent.videos.map(v => 
                v.id === rejectedVideo.id 
            ? { ...v, file: videoPreview1, preview: videoPreview1, status: 'pending' as const, submittedDate: new Date().toISOString() }
                  : v
        );
        } else {
        updatedContent.videos = [...updatedContent.videos, {
                id: `video-${Date.now()}-1`,
          file: videoPreview1,
          preview: videoPreview1,
                status: 'pending' as const,
                submittedDate: new Date().toISOString()
        }];
            }
        setVideo1File(null);
        setVideo1Preview(null);
        if (video1InputRef.current) video1InputRef.current.value = '';
    }
    
    if (video2FileToUse) {
      // Ensure we have a preview string before saving
      const videoPreview2 = video2Preview || await createPreview(video2FileToUse as File, video2Preview);
        const rejectedVideos = filteredContent.videos.filter(v => v.status === 'rejected');
        const rejectedVideo = rejectedVideos.length > 1 ? rejectedVideos[1] : rejectedVideos[0];
        if (rejectedVideo && rejectedVideos.length > 1) {
        updatedContent.videos = updatedContent.videos.map(v => 
                v.id === rejectedVideo.id 
            ? { ...v, file: videoPreview2, preview: videoPreview2, status: 'pending' as const, submittedDate: new Date().toISOString() }
                  : v
        );
        } else if (rejectedVideo) {
        const alreadyReplaced = updatedContent.videos.find(v => v.status === 'pending' && v.id !== rejectedVideo.id);
          if (!alreadyReplaced) {
          updatedContent.videos = updatedContent.videos.map(v => 
                  v.id === rejectedVideo.id 
              ? { ...v, file: videoPreview2, preview: videoPreview2, status: 'pending' as const, submittedDate: new Date().toISOString() }
                    : v
          );
          } else {
          updatedContent.videos = [...updatedContent.videos, {
                  id: `video-${Date.now()}-2`,
            file: videoPreview2,
            preview: videoPreview2,
                  status: 'pending' as const,
                  submittedDate: new Date().toISOString()
          }];
          }
        } else {
        updatedContent.videos = [...updatedContent.videos, {
                id: `video-${Date.now()}-2`,
          file: videoPreview2,
          preview: videoPreview2,
                status: 'pending' as const,
                submittedDate: new Date().toISOString()
        }];
            }
        setVideo2File(null);
        setVideo2Preview(null);
        if (video2InputRef.current) video2InputRef.current.value = '';
    }
    
    // Submit social links
    const expandedOrder = deliveredOrders.find(o => o.id === expandedOrderId);
    if (twitterLink.trim() && expandedOrder && !hasSocialContent(expandedOrder.id, 'Twitter')) {
      const rejectedTwitter = filteredContent.socials.find(s => s.platform.toLowerCase() === 'twitter' && s.status === 'rejected');
      if (rejectedTwitter) {
        updatedContent.socials = updatedContent.socials.map(s => 
          s.id === rejectedTwitter.id 
            ? { ...s, link: twitterLink.trim(), status: 'pending' as const, submittedDate: new Date().toISOString() }
            : s
        );
      } else {
        updatedContent.socials = [...updatedContent.socials, {
          id: `social-${Date.now()}-twitter`,
          platform: 'Twitter',
          link: twitterLink.trim(),
          status: 'pending' as const,
          submittedDate: new Date().toISOString()
        }];
      }
      setTwitterLink('');
    }
    
    if (instagramLink.trim() && expandedOrder && !hasSocialContent(expandedOrder.id, 'Instagram')) {
      const rejectedInstagram = filteredContent.socials.find(s => s.platform.toLowerCase() === 'instagram' && s.status === 'rejected');
      if (rejectedInstagram) {
        updatedContent.socials = updatedContent.socials.map(s => 
          s.id === rejectedInstagram.id 
            ? { ...s, link: instagramLink.trim(), status: 'pending' as const, submittedDate: new Date().toISOString() }
            : s
        );
      } else {
        updatedContent.socials = [...updatedContent.socials, {
          id: `social-${Date.now()}-instagram`,
          platform: 'Instagram',
          link: instagramLink.trim(),
          status: 'pending' as const,
          submittedDate: new Date().toISOString()
        }];
      }
      setInstagramLink('');
    }
    
    if (tiktokLink.trim() && expandedOrder && !hasSocialContent(expandedOrder.id, 'TikTok')) {
      const rejectedTiktok = filteredContent.socials.find(s => s.platform.toLowerCase() === 'tiktok' && s.status === 'rejected');
      if (rejectedTiktok) {
        updatedContent.socials = updatedContent.socials.map(s => 
          s.id === rejectedTiktok.id 
            ? { ...s, link: tiktokLink.trim(), status: 'pending' as const, submittedDate: new Date().toISOString() }
            : s
        );
      } else {
        updatedContent.socials = [...updatedContent.socials, {
          id: `social-${Date.now()}-tiktok`,
          platform: 'TikTok',
          link: tiktokLink.trim(),
          status: 'pending' as const,
          submittedDate: new Date().toISOString()
        }];
      }
      setTiktokLink('');
    }
    
    if (youtubeLink.trim() && expandedOrder && !hasSocialContent(expandedOrder.id, 'YouTube')) {
      const rejectedYoutube = filteredContent.socials.find(s => s.platform.toLowerCase() === 'youtube' && s.status === 'rejected');
      if (rejectedYoutube) {
        updatedContent.socials = updatedContent.socials.map(s => 
          s.id === rejectedYoutube.id 
            ? { ...s, link: youtubeLink.trim(), status: 'pending' as const, submittedDate: new Date().toISOString() }
            : s
        );
      } else {
        updatedContent.socials = [...updatedContent.socials, {
          id: `social-${Date.now()}-youtube`,
          platform: 'YouTube',
          link: youtubeLink.trim(),
          status: 'pending' as const,
          submittedDate: new Date().toISOString()
        }];
      }
      setYoutubeLink('');
    }
    
    if (facebookLink.trim() && expandedOrder && !hasSocialContent(expandedOrder.id, 'Facebook')) {
      const rejectedFacebook = filteredContent.socials.find(s => s.platform.toLowerCase() === 'facebook' && s.status === 'rejected');
      if (rejectedFacebook) {
        updatedContent.socials = updatedContent.socials.map(s => 
          s.id === rejectedFacebook.id 
            ? { ...s, link: facebookLink.trim(), status: 'pending' as const, submittedDate: new Date().toISOString() }
            : s
        );
      } else {
        updatedContent.socials = [...updatedContent.socials, {
          id: `social-${Date.now()}-facebook`,
          platform: 'Facebook',
          link: facebookLink.trim(),
          status: 'pending' as const,
          submittedDate: new Date().toISOString()
        }];
      }
      setFacebookLink('');
    }
    
      // Update submittedContent using functional update to avoid stale state
      setSubmittedContent(prev => {
        const newContent = {
          ...prev,
          [expandedOrderId]: updatedContent
        };
        
        // Save to localStorage
        saveSubmittedContentToStorage(newContent);
        
        return newContent;
      });
      
      // Success feedback
      setSubmitDebugMessage('Content submitted successfully!');
      setTimeout(() => setSubmitDebugMessage(''), 3000);
    } catch (error) {
      setSubmitDebugMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setSubmitDebugMessage(''), 3000);
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
      setTwitterLink('');
      setInstagramLink('');
      setTiktokLink('');
      setYoutubeLink('');
      setFacebookLink('');
      setGalleryActiveTab('photos');
      if (photo1InputRef.current) photo1InputRef.current.value = '';
      if (photo2InputRef.current) photo2InputRef.current.value = '';
      if (video1InputRef.current) video1InputRef.current.value = '';
      if (video2InputRef.current) video2InputRef.current.value = '';
    }
  }, [expandedOrderId]);
  
  // Add native event listeners for mobile button click (fallback)
  useEffect(() => {
    // Wait for button to be rendered in DOM
    let cleanup: (() => void) | null = null;
    const timer = setTimeout(() => {
      const button = submitButtonRef.current;
      if (!button || !expandedOrderId || showMobileMenu) return;
      
      const handleNativeClick = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        // Call handleSubmitContent directly - it will have access to current state via closure
        handleSubmitContent();
      };
      
      const handleNativeTouch = (e: TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Call handleSubmitContent directly - it will have access to current state via closure
        handleSubmitContent();
      };
      
      // Add both click and touchend listeners
      button.addEventListener('click', handleNativeClick, { passive: false });
      button.addEventListener('touchend', handleNativeTouch, { passive: false });
      
      // Store cleanup function
      cleanup = () => {
        button.removeEventListener('click', handleNativeClick);
        button.removeEventListener('touchend', handleNativeTouch);
      };
    }, 0);
    
    return () => {
      clearTimeout(timer);
      if (cleanup) cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedOrderId, showMobileMenu]); // Re-run when order changes or menu state changes
  
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
    // Photos: 400 each (2 max = 800), Videos: 600 each (2 max = 1,200), Total photo/video: 2,000 max
    const photoVideoEarned = Math.min(2000, order.pointsEarned || 0);
    const socialPointsEarned = (order.socialTags || 0) * 600;
    
    return { photoVideo: photoVideoEarned, social: socialPointsEarned };
  };

  // Helper function to get the period for a given date
  const getPeriodForDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const month = dateObj.getMonth(); // 0-11 (Jan = 0, Dec = 11)
    const year = dateObj.getFullYear();
    
    // Jan-Jun (months 0-5) or Jul-Dec (months 6-11)
    if (month < 6) {
      return `${year}-Jan-Jun`;
    } else {
      return `${year}-Jul-Dec`;
    }
  };
  
  // Helper function to filter content by current period (only show content from current 6-month cycle)
  const getFilteredContent = (orderId: string) => {
    const orderContent = submittedContent[orderId] || { photos: [], videos: [], socials: [] };
    const currentPeriod = getCurrentPeriod();
    
    // Filter content to only include items from the current period
    const filteredPhotos = orderContent.photos.filter(p => {
      const contentPeriod = getPeriodForDate(p.submittedDate);
      return contentPeriod === currentPeriod;
    });
    
    const filteredVideos = orderContent.videos.filter(v => {
      const contentPeriod = getPeriodForDate(v.submittedDate);
      return contentPeriod === currentPeriod;
    });
    
    const filteredSocials = orderContent.socials.filter(s => {
      const contentPeriod = getPeriodForDate(s.submittedDate);
      return contentPeriod === currentPeriod;
    });
    
    return {
      photos: filteredPhotos,
      videos: filteredVideos,
      socials: filteredSocials
    };
  };
  
  // Helper function to count content statuses from gallery (filtered by current period)
  const getContentCounts = (orderId: string) => {
    const filteredContent = getFilteredContent(orderId);
    
    const photoCounts = {
      approved: filteredContent.photos.filter(p => p.status === 'approved').length,
      pending: filteredContent.photos.filter(p => p.status === 'pending').length,
      rejected: filteredContent.photos.filter(p => p.status === 'rejected').length
    };
    
    const videoCounts = {
      approved: filteredContent.videos.filter(v => v.status === 'approved').length,
      pending: filteredContent.videos.filter(v => v.status === 'pending').length,
      rejected: filteredContent.videos.filter(v => v.status === 'rejected').length
    };
    
    const socialCounts = {
      approved: filteredContent.socials.filter(s => s.status === 'approved').length,
      pending: filteredContent.socials.filter(s => s.status === 'pending').length,
      rejected: filteredContent.socials.filter(s => s.status === 'rejected').length
    };
    
    return { photoCounts, videoCounts, socialCounts };
  };
  
  // Helper function to check if a photo input box should be enabled
  const canSubmitPhoto = (orderId: string, inputIndex: 1 | 2): boolean => {
    // First check if the input is disabled due to approved content
    if (hasPhotoContent(orderId, inputIndex)) {
      return false;
    }
    
    const { photoCounts } = getContentCounts(orderId);
    const maxPhotos = 2;
    const approvedPendingCount = photoCounts.approved + photoCounts.pending;
    const availableSlots = maxPhotos - approvedPendingCount;
    
    // Enable input boxes if:
    // 1. There are available slots (not all slots filled with approved/pending)
    // 2. There are rejected items to replace
    // Note: Pending content disables the input (must delete first), so we don't check for pending here
      return availableSlots > 0 || photoCounts.rejected > 0;
  };
  
  // Helper function to check if a video input box should be enabled
  const canSubmitVideo = (orderId: string, inputIndex: 1 | 2): boolean => {
    // First check if the input is disabled due to approved content
    if (hasVideoContent(orderId, inputIndex)) {
      return false;
    }
    
    const { videoCounts } = getContentCounts(orderId);
    const maxVideos = 2;
    const approvedPendingCount = videoCounts.approved + videoCounts.pending;
    const availableSlots = maxVideos - approvedPendingCount;
    
    // Enable input boxes if:
    // 1. There are available slots (not all slots filled with approved/pending)
    // 2. There are rejected items to replace
    // Note: Pending content disables the input (must delete first), so we don't check for pending here
      return availableSlots > 0 || videoCounts.rejected > 0;
  };
  
  // Helper function to check if a photo input box has approved or pending content (should be disabled)
  const hasPhotoContent = (orderId: string, inputIndex: 1 | 2): boolean => {
    const order = deliveredOrders.find(o => o.id === orderId);
    if (!order) return false;
    
    // Check approved dates from order (like membership page) - if approved, disable
    if (inputIndex === 1) {
      if (order.photo1ApprovedDate) return true;
    } else {
      if (order.photo2ApprovedDate) return true;
    }
    
    // Check for approved or pending content in submittedContent state
    // Disable if there's approved OR pending content (both can't be replaced, must delete first)
    const { photoCounts } = getContentCounts(orderId);
    const pendingCount = photoCounts.pending;
    const approvedPendingCount = photoCounts.approved + pendingCount;
    
    // Disable if there's approved or pending content in the slots
    if (inputIndex === 1) {
      // Disable if there's at least 1 approved or pending photo (slot 1 is filled, can't replace)
      return approvedPendingCount >= 1;
    } else {
      // Disable if there are 2 approved/pending photos (both slots filled, can't replace slot 2)
      return approvedPendingCount >= 2;
    }
  };
  
  // Helper function to check if a video input box has approved or pending content (should be disabled)
  const hasVideoContent = (orderId: string, inputIndex: 1 | 2): boolean => {
    const order = deliveredOrders.find(o => o.id === orderId);
    if (!order) return false;
    
    // Check approved dates from order (like membership page) - if approved, disable
    if (inputIndex === 1) {
      if (order.video1ApprovedDate) return true;
    } else {
      if (order.video2ApprovedDate) return true;
    }
    
    // Check for approved or pending content in submittedContent state
    // Disable if there's approved OR pending content (both can't be replaced, must delete first)
    const { videoCounts } = getContentCounts(orderId);
    const approvedCount = videoCounts.approved;
    const pendingCount = videoCounts.pending;
    const approvedPendingCount = approvedCount + pendingCount;
    
    // Disable if there's approved or pending content in the slots
    if (inputIndex === 1) {
      // Disable if there's at least 1 approved or pending video (slot 1 is filled, can't replace)
      return approvedPendingCount >= 1;
    } else {
      // Disable if there are 2 approved/pending videos (both slots filled, can't replace slot 2)
      return approvedPendingCount >= 2;
    }
  };
  
  // Helper function to check if a social platform has approved or pending content (should be disabled)
  const hasSocialContent = (orderId: string, platform: string): boolean => {
    const order = deliveredOrders.find(o => o.id === orderId);
    if (!order) return false;
    
    // Check approved dates from order (like membership page)
    const platformLower = platform.toLowerCase();
    if (platformLower === 'twitter' && order.twitterApprovedDate) {
      return true;
    } else if (platformLower === 'instagram' && order.instagramApprovedDate) {
      return true;
    } else if (platformLower === 'tiktok' && order.tiktokApprovedDate) {
      return true;
    } else if (platformLower === 'youtube' && order.youtubeApprovedDate) {
      return true;
    } else if (platformLower === 'facebook' && order.facebookApprovedDate) {
      return true;
    }
    
    // Also check for pending content in submittedContent state
    const filteredContent = getFilteredContent(orderId);
    const platformContent = filteredContent.socials.filter(s => 
      s.platform.toLowerCase() === platformLower && 
      (s.status === 'approved' || s.status === 'pending')
    );
    return platformContent.length > 0;
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
      <style>{`
        input::placeholder {
          font-size: 10px !important;
          font-family: "Futura PT Book", "Futura PT Medium", "Covered By Your Grace", "Covered By Your Grace Preload" !important;
        }
      `}</style>
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
<div style={{ transform: `translateX(${cartCount === 0 ? 7 : 5}px)` }}>
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
              minHeight: showMobileMenu ? 'calc(100dvh - 80px)' : 'auto',
              height: showMobileMenu ? 'calc(100dvh - 80px)' : 'auto'
            }}
          >
            {showMobileMenu ? (
              /* MENU CONTENT */
              <div
                className="menu-toggle-card border border-black flex flex-col pt-6 pb-4 px-5 bg-white/60 backdrop-blur-sm w-full"
                style={{ 
                  borderWidth: '1.3px', 
                  minWidth: '100%', 
                  maxWidth: 'none', 
                  overflow: 'visible',
                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  minHeight: 'calc(100dvh - 80px)'
                }}
              >
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
                   className="border border-black bg-white/60 backdrop-blur-sm w-full pt-6 pb-4 px-5 mb-2 transition-all duration-300 ease-out"
                   style={{
                     borderWidth: '1.3px',
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
                       const socialPointsEarned = effectiveSocialTags * 600;
                       const totalEarned = photoVideoEarned + socialPointsEarned;
                       const totalAvailable = 5000; // 2,000 photo/video (800 photos + 1,200 videos) + 3,000 social (5 tags × 600)
                       const pointsText = totalEarned === 0
                         ? "YOU'VE EARNED 0 LOYALTY POINTS!"
                         : totalEarned >= totalAvailable 
                           ? "YOU'VE EARNED 5,000 LOYALTY POINTS!" 
                           : `YOU'VE EARNED ${totalEarned.toLocaleString()} LOYALTY POINTS!`;
                       
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
                               const socialPointsEarned = effectiveSocialTags * 600;
                               const totalEarned = photoVideoEarned + socialPointsEarned;
                               const totalAvailable = 5000; // 2,000 photo/video (800 photos + 1,200 videos) + 3,000 social (5 tags × 600)
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
                                      fontFamily: '"Futura PT Book", "Futura PT Medium", "Covered By Your Grace", "Covered By Your Grace Preload"',
                                      fontSize: '10px',
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
                                   fontFamily: '"Futura PT Book"',
                                   color: '#000000',
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
                                   const photoVideoEarned = Math.min(2000, expandedOrder.pointsEarned || 0);
                                   // Photos: 400 each, 2 max = 800 total
                                   // Calculate photo points: if earned <= 800, it's photos; if > 800, photos are maxed at 800
                                   const photoPointsEarned = Math.min(800, photoVideoEarned);
                                   return `${photoPointsEarned}/800`;
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
                                   disabled={hasPhotoContent(expandedOrder.id, 1)}
                                   onChange={(e) => {
                                     if (canSubmitPhoto(expandedOrder.id, 1)) {
                                       handlePhoto1Change(e);
                                     }
                                   }}
                                   style={{
                                     position: 'absolute',
                                     width: '100%',
                                     height: '36px',
                                     opacity: 0,
                                     cursor: hasPhotoContent(expandedOrder.id, 1) ? 'not-allowed' : 'pointer',
                                     zIndex: 3,
                                     top: 0,
                                     left: 0,
                                     pointerEvents: hasPhotoContent(expandedOrder.id, 1) ? 'none' : 'auto'
                                   }}
                                 />
                                 <div
                                   onClick={() => {
                                     if (canSubmitPhoto(expandedOrder.id, 1) && !hasPhotoContent(expandedOrder.id, 1)) {
                                       photo1InputRef.current?.click();
                                     }
                                   }}
                                   style={{
                                     width: '100%',
                                     minHeight: '36px',
                                     height: '36px',
                                     padding: '8px',
                                     border: '1px solid #000000',
                                     fontFamily: '"Futura PT Book"',
                                     fontSize: '11px',
                                     backgroundColor: '#FFFFFF',
                                     color: photo1File ? '#909090' : '#EB1C24',
                                     boxSizing: 'border-box',
                                     borderRadius: '0',
                                     cursor: hasPhotoContent(expandedOrder.id, 1) ? 'not-allowed' : 'pointer',
                                     textTransform: 'uppercase',
                                     position: 'relative',
                                     overflow: 'hidden',
                                     display: 'flex',
                                     alignItems: 'center',
                                     opacity: 1,
                                     pointerEvents: hasPhotoContent(expandedOrder.id, 1) ? 'none' : 'auto'
                                   }}
                                 >
                                  {photo1File ? (
                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', minWidth: 0 }}>
                                      <span style={{ 
                                        padding: '4px 8px',
                                        border: '1px solid #909090',
                                        borderRadius: '4px',
                                        backgroundColor: '#F5F5F5',
                                        color: '#000000',
                                        textTransform: 'uppercase',
                                        fontSize: '11px',
                                        fontFamily: '"Futura PT Book"',
                                        flexShrink: 0,
                                        whiteSpace: 'nowrap'
                                      }}>
                                        CHOOSE FILE
                                      </span>
                                      <span style={{ 
                                        marginLeft: '8px', 
                                        color: '#000000', 
                                        fontFamily: '"Futura PT Book"', 
                                        fontSize: '11px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        flex: 1,
                                        minWidth: 0
                                      }}>
                                        {photo1File.name}
                                      </span>
                                    </div>
                                  ) : hasPhotoContent(expandedOrder.id, 1) ? (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                      <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Book"', fontSize: '10px' }}>
                                        CONTENT SUBMITTED
                                      </span>
                                      <div
                                        style={{
                                          width: '16px',
                                          height: '16px',
                                          borderRadius: '50%',
                                          backgroundColor: '#FFFFFF',
                                          border: '0.7px solid #EB1C24',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          flexShrink: 0,
                                          marginLeft: '8px'
                                        }}
                                      >
                                        <img
                                          src="/assets/premium-check.svg"
                                          alt="Content submitted"
                                          style={{ width: '7.8px', height: '7.8px' }}
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', minWidth: 0 }}>
                                      <span style={{ 
                                        padding: '4px 8px',
                                        border: '1px solid #909090',
                                        borderRadius: '4px',
                                        backgroundColor: '#F5F5F5',
                                        color: '#000000',
                                        textTransform: 'uppercase',
                                        fontSize: '11px',
                                        fontFamily: '"Futura PT Book"',
                                        flexShrink: 0,
                                        whiteSpace: 'nowrap'
                                      }}>
                                        CHOOSE FILE
                                      </span>
                                      <span style={{ marginLeft: '8px', color: '#909090', fontFamily: '"Futura PT Book"', fontSize: '10px', whiteSpace: 'nowrap' }}>
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
                                   disabled={hasPhotoContent(expandedOrder.id, 2)}
                                   onChange={(e) => {
                                     if (canSubmitPhoto(expandedOrder.id, 2)) {
                                       handlePhoto2Change(e);
                                     }
                                   }}
                                   style={{
                                     position: 'absolute',
                                     width: '100%',
                                     height: '36px',
                                     opacity: 0,
                                     cursor: hasPhotoContent(expandedOrder.id, 2) ? 'not-allowed' : 'pointer',
                                     zIndex: 3,
                                     top: 0,
                                     left: 0,
                                     pointerEvents: hasPhotoContent(expandedOrder.id, 2) ? 'none' : 'auto'
                                   }}
                                 />
                                 <div
                                   onClick={() => {
                                     if (canSubmitPhoto(expandedOrder.id, 2) && !hasPhotoContent(expandedOrder.id, 2)) {
                                       photo2InputRef.current?.click();
                                     }
                                   }}
                                   style={{
                                     width: '100%',
                                     minHeight: '36px',
                                     height: '36px',
                                     padding: '8px',
                                     border: '1px solid #000000',
                                     fontFamily: '"Futura PT Book"',
                                     fontSize: '11px',
                                     backgroundColor: '#FFFFFF',
                                     color: photo2File ? '#909090' : '#EB1C24',
                                     boxSizing: 'border-box',
                                     borderRadius: '0',
                                     cursor: hasPhotoContent(expandedOrder.id, 2) ? 'not-allowed' : 'pointer',
                                     textTransform: 'uppercase',
                                     position: 'relative',
                                     overflow: 'hidden',
                                     display: 'flex',
                                     alignItems: 'center',
                                     opacity: 1,
                                     pointerEvents: hasPhotoContent(expandedOrder.id, 2) ? 'none' : 'auto'
                                   }}
                                 >
                                  {photo2File ? (
                                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', minWidth: 0 }}>
                                      <span style={{ 
                                        padding: '4px 8px',
                                        border: '1px solid #909090',
                                        borderRadius: '4px',
                                        backgroundColor: '#F5F5F5',
                                        color: '#000000',
                                        textTransform: 'uppercase',
                                        fontSize: '11px',
                                        fontFamily: '"Futura PT Book"',
                                        flexShrink: 0,
                                        whiteSpace: 'nowrap'
                                      }}>
                                        CHOOSE FILE
                                      </span>
                                      <span style={{ 
                                        marginLeft: '8px', 
                                        color: '#000000', 
                                        fontFamily: '"Futura PT Book"', 
                                        fontSize: '11px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        flex: 1,
                                        minWidth: 0
                                      }}>
                                        {photo2File.name}
                                      </span>
                                    </div>
                                   ) : hasPhotoContent(expandedOrder.id, 2) ? (
                                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                       <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Book"', fontSize: '10px' }}>
                                         CONTENT SUBMITTED
                                       </span>
                                       <div
                                         style={{
                                           width: '16px',
                                           height: '16px',
                                           borderRadius: '50%',
                                           backgroundColor: '#FFFFFF',
                                           border: '0.7px solid #EB1C24',
                                           display: 'flex',
                                           alignItems: 'center',
                                           justifyContent: 'center',
                                           flexShrink: 0,
                                           marginLeft: '8px'
                                         }}
                                       >
                                         <img
                                           src="/assets/premium-check.svg"
                                           alt="Content submitted"
                                           style={{ width: '7.8px', height: '7.8px' }}
                                         />
                                       </div>
                                     </div>
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
                                   fontFamily: '"Futura PT Book"',
                                   color: '#000000',
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
                                   // Videos: 600 each, 2 max = 1,200 total
                                   // Calculate video points: if earned > 800, the excess is video points (capped at 1,200)
                                   const videoPointsEarned = photoVideoEarned > 800 ? Math.min(1200, photoVideoEarned - 800) : 0;
                                   return `${videoPointsEarned.toLocaleString()}/1,200`;
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
                                   disabled={hasVideoContent(expandedOrder.id, 1)}
                                   onChange={(e) => {
                                     if (canSubmitVideo(expandedOrder.id, 1)) {
                                       handleVideo1Change(e);
                                     }
                                   }}
                                   style={{
                                     position: 'absolute',
                                     width: '100%',
                                     height: '36px',
                                     opacity: 0,
                                     cursor: hasVideoContent(expandedOrder.id, 1) ? 'not-allowed' : 'pointer',
                                     zIndex: 3,
                                     top: 0,
                                     left: 0,
                                     pointerEvents: hasVideoContent(expandedOrder.id, 1) ? 'none' : 'auto'
                                   }}
                                 />
                                 <div
                                   onClick={() => {
                                     if (canSubmitVideo(expandedOrder.id, 1) && !hasVideoContent(expandedOrder.id, 1)) {
                                       video1InputRef.current?.click();
                                     }
                                   }}
                                   style={{
                                     width: '100%',
                                     minHeight: '36px',
                                     height: '36px',
                                     padding: '8px',
                                     border: '1px solid #000000',
                                     fontFamily: '"Futura PT Book"',
                                     fontSize: '11px',
                                     backgroundColor: '#FFFFFF',
                                     color: video1File ? '#909090' : '#EB1C24',
                                     boxSizing: 'border-box',
                                     borderRadius: '0',
                                     cursor: hasVideoContent(expandedOrder.id, 1) ? 'not-allowed' : 'pointer',
                                     textTransform: 'uppercase',
                                     position: 'relative',
                                     overflow: 'hidden',
                                     display: 'flex',
                                     alignItems: 'center',
                                     opacity: 1,
                                     pointerEvents: hasVideoContent(expandedOrder.id, 1) ? 'none' : 'auto'
                                   }}
                                 >
                                   {video1File ? (
                                     <div style={{ display: 'flex', alignItems: 'center', width: '100%', minWidth: 0 }}>
                                       <span style={{ 
                                         padding: '4px 8px',
                                         border: '1px solid #909090',
                                         borderRadius: '4px',
                                         backgroundColor: '#F5F5F5',
                                         color: '#000000',
                                         textTransform: 'uppercase',
                                         fontSize: '11px',
                                         fontFamily: '"Futura PT Book"',
                                         flexShrink: 0,
                                         whiteSpace: 'nowrap'
                                       }}>
                                         CHOOSE FILE
                                       </span>
                                       <span style={{ 
                                         marginLeft: '8px', 
                                         color: '#000000', 
                                         fontFamily: '"Futura PT Book"', 
                                         fontSize: '11px',
                                         overflow: 'hidden',
                                         textOverflow: 'ellipsis',
                                         whiteSpace: 'nowrap',
                                         flex: 1,
                                         minWidth: 0
                                       }}>
                                         {video1File.name}
                                       </span>
                                     </div>
                                   ) : hasVideoContent(expandedOrder.id, 1) ? (
                                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                       <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Book"', fontSize: '10px' }}>
                                         CONTENT SUBMITTED
                                       </span>
                                       <div
                                         style={{
                                           width: '16px',
                                           height: '16px',
                                           borderRadius: '50%',
                                           backgroundColor: '#FFFFFF',
                                           border: '0.7px solid #EB1C24',
                                           display: 'flex',
                                           alignItems: 'center',
                                           justifyContent: 'center',
                                           flexShrink: 0,
                                           marginLeft: '8px'
                                         }}
                                       >
                                         <img
                                           src="/assets/premium-check.svg"
                                           alt="Content submitted"
                                           style={{ width: '7.8px', height: '7.8px' }}
                                         />
                                       </div>
                                     </div>
                                   ) : (
                                     <div style={{ display: 'flex', alignItems: 'center', width: '100%', minWidth: 0 }}>
                                       <span style={{ 
                                         padding: '4px 8px',
                                         border: '1px solid #909090',
                                         borderRadius: '4px',
                                         backgroundColor: '#F5F5F5',
                                         color: '#000000',
                                         textTransform: 'uppercase',
                                         fontSize: '11px',
                                         fontFamily: '"Futura PT Book"',
                                         flexShrink: 0,
                                         whiteSpace: 'nowrap'
                                       }}>
                                         CHOOSE FILE
                                       </span>
                                       <span style={{ marginLeft: '8px', color: '#909090', fontFamily: '"Futura PT Book"', fontSize: '10px', whiteSpace: 'nowrap' }}>
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
                                   disabled={hasVideoContent(expandedOrder.id, 2)}
                                   onChange={(e) => {
                                     if (canSubmitVideo(expandedOrder.id, 2)) {
                                       handleVideo2Change(e);
                                     }
                                   }}
                                   style={{
                                     position: 'absolute',
                                     width: '100%',
                                     height: '36px',
                                     opacity: 0,
                                     cursor: hasVideoContent(expandedOrder.id, 2) ? 'not-allowed' : 'pointer',
                                     zIndex: 3,
                                     top: 0,
                                     left: 0,
                                     pointerEvents: hasVideoContent(expandedOrder.id, 2) ? 'none' : 'auto'
                                   }}
                                 />
                                 <div
                                   onClick={() => {
                                     if (canSubmitVideo(expandedOrder.id, 2) && !hasVideoContent(expandedOrder.id, 2)) {
                                       video2InputRef.current?.click();
                                     }
                                   }}
                                   style={{
                                     width: '100%',
                                     minHeight: '36px',
                                     height: '36px',
                                     padding: '8px',
                                     border: '1px solid #000000',
                                     fontFamily: '"Futura PT Book"',
                                     fontSize: '11px',
                                     backgroundColor: '#FFFFFF',
                                     color: video2File ? '#909090' : '#EB1C24',
                                     boxSizing: 'border-box',
                                     borderRadius: '0',
                                     cursor: hasVideoContent(expandedOrder.id, 2) ? 'not-allowed' : 'pointer',
                                     textTransform: 'uppercase',
                                     position: 'relative',
                                     overflow: 'hidden',
                                     display: 'flex',
                                     alignItems: 'center',
                                     opacity: 1,
                                     pointerEvents: hasVideoContent(expandedOrder.id, 2) ? 'none' : 'auto'
                                   }}
                                 >
                                   {video2File ? (
                                     <div style={{ display: 'flex', alignItems: 'center', width: '100%', minWidth: 0 }}>
                                       <span style={{ 
                                         padding: '4px 8px',
                                         border: '1px solid #909090',
                                         borderRadius: '4px',
                                         backgroundColor: '#F5F5F5',
                                         color: '#000000',
                                         textTransform: 'uppercase',
                                         fontSize: '11px',
                                         fontFamily: '"Futura PT Book"',
                                         flexShrink: 0,
                                         whiteSpace: 'nowrap'
                                       }}>
                                         CHOOSE FILE
                                       </span>
                                       <span style={{ 
                                         marginLeft: '8px', 
                                         color: '#000000', 
                                         fontFamily: '"Futura PT Book"', 
                                         fontSize: '11px',
                                         overflow: 'hidden',
                                         textOverflow: 'ellipsis',
                                         whiteSpace: 'nowrap',
                                         flex: 1,
                                         minWidth: 0
                                       }}>
                                         {video2File.name}
                                       </span>
                                     </div>
                                   ) : hasVideoContent(expandedOrder.id, 2) ? (
                                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                       <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Book"', fontSize: '10px' }}>
                                         CONTENT SUBMITTED
                                       </span>
                                       <div
                                         style={{
                                           width: '16px',
                                           height: '16px',
                                           borderRadius: '50%',
                                           backgroundColor: '#FFFFFF',
                                           border: '0.7px solid #EB1C24',
                                           display: 'flex',
                                           alignItems: 'center',
                                           justifyContent: 'center',
                                           flexShrink: 0,
                                           marginLeft: '8px'
                                         }}
                                       >
                                         <img
                                           src="/assets/premium-check.svg"
                                           alt="Content submitted"
                                           style={{ width: '7.8px', height: '7.8px' }}
                                         />
                                       </div>
                                     </div>
                                   ) : (
                                     <div style={{ display: 'flex', alignItems: 'center', width: '100%', minWidth: 0 }}>
                                       <span style={{ 
                                         padding: '4px 8px',
                                         border: '1px solid #909090',
                                         borderRadius: '4px',
                                         backgroundColor: '#F5F5F5',
                                         color: '#000000',
                                         textTransform: 'uppercase',
                                         fontSize: '11px',
                                         fontFamily: '"Futura PT Book"',
                                         flexShrink: 0,
                                         whiteSpace: 'nowrap'
                                       }}>
                                         CHOOSE FILE
                                       </span>
                                       <span style={{ marginLeft: '8px', color: '#909090', fontFamily: '"Futura PT Book"', fontSize: '10px', whiteSpace: 'nowrap' }}>
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
                                     fontFamily: '"Futura PT Book"',
                                     color: '#000000',
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
                                     // Check if Twitter specifically has been approved
                                     const currentPeriod = getCurrentPeriod();
                                     const socialTagsPeriod = expandedOrder.socialTagsPeriod || '';
                                     const isCurrentPeriod = socialTagsPeriod === currentPeriod;
                                     
                                     // Check if Twitter has approved date
                                     if (isCurrentPeriod && expandedOrder.twitterApprovedDate) {
                                       return '600/600';
                                     }
                                     
                                     // Check if Twitter has approved content in submittedContent
                                     const filteredContent = getFilteredContent(expandedOrder.id);
                                     const twitterContent = filteredContent.socials.find(s => 
                                       s.platform.toLowerCase() === 'twitter' && s.status === 'approved'
                                     );
                                     
                                     if (twitterContent) {
                                       return '600/600';
                                     }
                                     
                                     return '0/600';
                                   })()}
                                 </p>
                               </div>
                              <div style={{ position: 'relative', width: '100%' }}>
                                <input
                                  type="text"
                                  placeholder={hasSocialContent(expandedOrder.id, 'Twitter') ? '' : 'LINK TO TWEET'}
                                  value={hasSocialContent(expandedOrder.id, 'Twitter') ? 'CONTENT SUBMITTED' : twitterLink}
                                  onChange={(e) => {
                                    if (!hasSocialContent(expandedOrder.id, 'Twitter')) {
                                      setTwitterLink(e.target.value);
                                    }
                                  }}
                                  disabled={hasSocialContent(expandedOrder.id, 'Twitter')}
                                  readOnly={hasSocialContent(expandedOrder.id, 'Twitter')}
                                  style={{
                                    width: '100%',
                                    padding: '8px',
                                    paddingRight: hasSocialContent(expandedOrder.id, 'Twitter') ? '36px' : '8px',
                                    border: '1px solid #000000',
                                    fontFamily: '"Futura PT Book"',
                                    fontSize: '10px',
                                    backgroundColor: '#FFFFFF',
                                    color: hasSocialContent(expandedOrder.id, 'Twitter') ? '#EB1C24' : '#909090',
                                    boxSizing: 'border-box',
                                    borderRadius: '0',
                                    textTransform: 'uppercase',
                                    opacity: 1,
                                    cursor: hasSocialContent(expandedOrder.id, 'Twitter') ? 'not-allowed' : 'text'
                                  }}
                                />
                                {hasSocialContent(expandedOrder.id, 'Twitter') && (
                                  <div
                                    style={{
                                      position: 'absolute',
                                      right: '8px',
                                      top: '50%',
                                      transform: 'translateY(-50%)',
                                      width: '16px',
                                      height: '16px',
                                      borderRadius: '50%',
                                      backgroundColor: '#FFFFFF',
                                      border: '0.7px solid #EB1C24',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0
                                    }}
                                  >
                                    <img
                                      src="/assets/premium-check.svg"
                                      alt="Content submitted"
                                      style={{ width: '7.8px', height: '7.8px' }}
                                    />
                                  </div>
                                )}
                              </div>
                             </div>
                             
                             {/* INSTAGRAM */}
                             <div style={{ marginBottom: '12px' }}>
                               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                 <p
                                   style={{
                                     fontFamily: '"Futura PT Book"',
                                     color: '#000000',
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
                                     // Check if Instagram specifically has been approved
                                     const currentPeriod = getCurrentPeriod();
                                     const socialTagsPeriod = expandedOrder.socialTagsPeriod || '';
                                     const isCurrentPeriod = socialTagsPeriod === currentPeriod;
                                     
                                     // Check if Instagram has approved date
                                     if (isCurrentPeriod && expandedOrder.instagramApprovedDate) {
                                       return '600/600';
                                     }
                                     
                                     // Check if Instagram has approved content in submittedContent
                                     const filteredContent = getFilteredContent(expandedOrder.id);
                                     const instagramContent = filteredContent.socials.find(s => 
                                       s.platform.toLowerCase() === 'instagram' && s.status === 'approved'
                                     );
                                     
                                     if (instagramContent) {
                                       return '600/600';
                                     }
                                     
                                     return '0/600';
                                   })()}
                                 </p>
                               </div>
                              <div style={{ position: 'relative', width: '100%' }}>
                                <input
                                  type="text"
                                  placeholder={hasSocialContent(expandedOrder.id, 'Instagram') ? '' : 'LINK TO REEL'}
                                  value={hasSocialContent(expandedOrder.id, 'Instagram') ? 'CONTENT SUBMITTED' : instagramLink}
                                  onChange={(e) => {
                                    if (!hasSocialContent(expandedOrder.id, 'Instagram')) {
                                      setInstagramLink(e.target.value);
                                    }
                                  }}
                                  disabled={hasSocialContent(expandedOrder.id, 'Instagram')}
                                  readOnly={hasSocialContent(expandedOrder.id, 'Instagram')}
                                  style={{
                                    width: '100%',
                                    padding: '8px',
                                    paddingRight: hasSocialContent(expandedOrder.id, 'Instagram') ? '36px' : '8px',
                                    border: '1px solid #000000',
                                    fontFamily: '"Futura PT Book"',
                                    fontSize: '10px',
                                    backgroundColor: '#FFFFFF',
                                    color: hasSocialContent(expandedOrder.id, 'Instagram') ? '#EB1C24' : '#909090',
                                    boxSizing: 'border-box',
                                    borderRadius: '0',
                                    textTransform: 'uppercase',
                                    opacity: 1,
                                    cursor: hasSocialContent(expandedOrder.id, 'Instagram') ? 'not-allowed' : 'text'
                                  }}
                                />
                                {hasSocialContent(expandedOrder.id, 'Instagram') && (
                                  <div
                                    style={{
                                      position: 'absolute',
                                      right: '8px',
                                      top: '50%',
                                      transform: 'translateY(-50%)',
                                      width: '16px',
                                      height: '16px',
                                      borderRadius: '50%',
                                      backgroundColor: '#FFFFFF',
                                      border: '0.7px solid #EB1C24',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0
                                    }}
                                  >
                                    <img
                                      src="/assets/premium-check.svg"
                                      alt="Content submitted"
                                      style={{ width: '7.8px', height: '7.8px' }}
                                    />
                                  </div>
                                )}
                              </div>
                             </div>
                             
                             {/* TIKTOK */}
                             <div style={{ marginBottom: '12px' }}>
                               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                 <p
                                   style={{
                                     fontFamily: '"Futura PT Book"',
                                     color: '#000000',
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
                                     // Check if TikTok specifically has been approved
                                     const currentPeriod = getCurrentPeriod();
                                     const socialTagsPeriod = expandedOrder.socialTagsPeriod || '';
                                     const isCurrentPeriod = socialTagsPeriod === currentPeriod;
                                     
                                     // Check if TikTok has approved date
                                     if (isCurrentPeriod && expandedOrder.tiktokApprovedDate) {
                                       return '600/600';
                                     }
                                     
                                     // Check if TikTok has approved content in submittedContent
                                     const filteredContent = getFilteredContent(expandedOrder.id);
                                     const tiktokContent = filteredContent.socials.find(s => 
                                       s.platform.toLowerCase() === 'tiktok' && s.status === 'approved'
                                     );
                                     
                                     if (tiktokContent) {
                                       return '600/600';
                                     }
                                     
                                     return '0/600';
                                   })()}
                                 </p>
                               </div>
                              <div style={{ position: 'relative', width: '100%' }}>
                                <input
                                  type="text"
                                  placeholder={hasSocialContent(expandedOrder.id, 'TikTok') ? '' : 'LINK TO TIK TOK'}
                                  value={hasSocialContent(expandedOrder.id, 'TikTok') ? 'CONTENT SUBMITTED' : tiktokLink}
                                  onChange={(e) => {
                                    if (!hasSocialContent(expandedOrder.id, 'TikTok')) {
                                      setTiktokLink(e.target.value);
                                    }
                                  }}
                                  disabled={hasSocialContent(expandedOrder.id, 'TikTok')}
                                  readOnly={hasSocialContent(expandedOrder.id, 'TikTok')}
                                  style={{
                                    width: '100%',
                                    padding: '8px',
                                    paddingRight: hasSocialContent(expandedOrder.id, 'TikTok') ? '36px' : '8px',
                                    border: '1px solid #000000',
                                    fontFamily: '"Futura PT Book"',
                                    fontSize: '10px',
                                    backgroundColor: '#FFFFFF',
                                    color: hasSocialContent(expandedOrder.id, 'TikTok') ? '#EB1C24' : '#909090',
                                    boxSizing: 'border-box',
                                    borderRadius: '0',
                                    textTransform: 'uppercase',
                                    opacity: 1,
                                    cursor: hasSocialContent(expandedOrder.id, 'TikTok') ? 'not-allowed' : 'text'
                                  }}
                                />
                                {hasSocialContent(expandedOrder.id, 'TikTok') && (
                                  <div
                                    style={{
                                      position: 'absolute',
                                      right: '8px',
                                      top: '50%',
                                      transform: 'translateY(-50%)',
                                      width: '16px',
                                      height: '16px',
                                      borderRadius: '50%',
                                      backgroundColor: '#FFFFFF',
                                      border: '0.7px solid #EB1C24',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0
                                    }}
                                  >
                                    <img
                                      src="/assets/premium-check.svg"
                                      alt="Content submitted"
                                      style={{ width: '7.8px', height: '7.8px' }}
                                    />
                                  </div>
                                )}
                              </div>
                             </div>
                             
                             {/* YOUTUBE */}
                             <div style={{ marginBottom: '12px' }}>
                               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                 <p
                                   style={{
                                     fontFamily: '"Futura PT Book"',
                                     color: '#000000',
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
                                     // Check if YouTube specifically has been approved
                                     const currentPeriod = getCurrentPeriod();
                                     const socialTagsPeriod = expandedOrder.socialTagsPeriod || '';
                                     const isCurrentPeriod = socialTagsPeriod === currentPeriod;
                                     
                                     // Check if YouTube has approved date
                                     if (isCurrentPeriod && expandedOrder.youtubeApprovedDate) {
                                       return '600/600';
                                     }
                                     
                                     // Check if YouTube has approved content in submittedContent
                                     const filteredContent = getFilteredContent(expandedOrder.id);
                                     const youtubeContent = filteredContent.socials.find(s => 
                                       s.platform.toLowerCase() === 'youtube' && s.status === 'approved'
                                     );
                                     
                                     if (youtubeContent) {
                                       return '600/600';
                                     }
                                     
                                     return '0/600';
                                   })()}
                                 </p>
                               </div>
                              <div style={{ position: 'relative', width: '100%' }}>
                                <input
                                  type="text"
                                  placeholder={hasSocialContent(expandedOrder.id, 'YouTube') ? '' : 'LINK TO VIDEO'}
                                  value={hasSocialContent(expandedOrder.id, 'YouTube') ? 'CONTENT SUBMITTED' : youtubeLink}
                                  onChange={(e) => {
                                    if (!hasSocialContent(expandedOrder.id, 'YouTube')) {
                                      setYoutubeLink(e.target.value);
                                    }
                                  }}
                                  disabled={hasSocialContent(expandedOrder.id, 'YouTube')}
                                  readOnly={hasSocialContent(expandedOrder.id, 'YouTube')}
                                  style={{
                                    width: '100%',
                                    padding: '8px',
                                    paddingRight: hasSocialContent(expandedOrder.id, 'YouTube') ? '36px' : '8px',
                                    border: '1px solid #000000',
                                    fontFamily: '"Futura PT Book"',
                                    fontSize: '10px',
                                    backgroundColor: '#FFFFFF',
                                    color: hasSocialContent(expandedOrder.id, 'YouTube') ? '#EB1C24' : '#909090',
                                    boxSizing: 'border-box',
                                    borderRadius: '0',
                                    textTransform: 'uppercase',
                                    opacity: 1,
                                    cursor: hasSocialContent(expandedOrder.id, 'YouTube') ? 'not-allowed' : 'text'
                                  }}
                                />
                                {hasSocialContent(expandedOrder.id, 'YouTube') && (
                                  <div
                                    style={{
                                      position: 'absolute',
                                      right: '8px',
                                      top: '50%',
                                      transform: 'translateY(-50%)',
                                      width: '16px',
                                      height: '16px',
                                      borderRadius: '50%',
                                      backgroundColor: '#FFFFFF',
                                      border: '0.7px solid #EB1C24',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0
                                    }}
                                  >
                                    <img
                                      src="/assets/premium-check.svg"
                                      alt="Content submitted"
                                      style={{ width: '7.8px', height: '7.8px' }}
                                    />
                                  </div>
                                )}
                              </div>
                             </div>
                             
                             {/* FACEBOOK */}
                             <div style={{ marginBottom: '12px' }}>
                               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                 <p
                                   style={{
                                     fontFamily: '"Futura PT Book"',
                                     color: '#000000',
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
                                     // Check if Facebook specifically has been approved
                                     const currentPeriod = getCurrentPeriod();
                                     const socialTagsPeriod = expandedOrder.socialTagsPeriod || '';
                                     const isCurrentPeriod = socialTagsPeriod === currentPeriod;
                                     
                                     // Check if Facebook has approved date
                                     if (isCurrentPeriod && expandedOrder.facebookApprovedDate) {
                                       return '600/600';
                                     }
                                     
                                     // Check if Facebook has approved content in submittedContent
                                     const filteredContent = getFilteredContent(expandedOrder.id);
                                     const facebookContent = filteredContent.socials.find(s => 
                                       s.platform.toLowerCase() === 'facebook' && s.status === 'approved'
                                     );
                                     
                                     if (facebookContent) {
                                       return '600/600';
                                     }
                                     
                                     return '0/600';
                                   })()}
                                 </p>
                               </div>
                              <input
                                type="text"
                                placeholder={hasSocialContent(expandedOrder.id, 'Facebook') ? '' : 'LINK TO POST'}
                                value={hasSocialContent(expandedOrder.id, 'Facebook') ? 'CONTENT SUBMITTED' : facebookLink}
                                onChange={(e) => {
                                  if (!hasSocialContent(expandedOrder.id, 'Facebook')) {
                                    setFacebookLink(e.target.value);
                                  }
                                }}
                                disabled={hasSocialContent(expandedOrder.id, 'Facebook')}
                                readOnly={hasSocialContent(expandedOrder.id, 'Facebook')}
                                style={{
                                  width: '100%',
                                  padding: '8px',
                                  border: '1px solid #000000',
                                  fontFamily: '"Futura PT Book"',
                                  fontSize: '10px',
                                  backgroundColor: '#FFFFFF',
                                  color: hasSocialContent(expandedOrder.id, 'Facebook') ? '#EB1C24' : '#909090',
                                  boxSizing: 'border-box',
                                  borderRadius: '0',
                                  textTransform: 'uppercase',
                                  opacity: 1,
                                  cursor: hasSocialContent(expandedOrder.id, 'Facebook') ? 'not-allowed' : 'text'
                                }}
                              />
                             </div>
                           </div>
                           
                           {/* GALLERY Section */}
                           <div style={{ marginTop: '24px', marginBottom: '8px' }}>
                             <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ marginBottom: '16px' }}>
                             </div>
                             
                             {/* Gallery Tabs */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '26px' }}>
                               <button
                                 onClick={() => setGalleryActiveTab('photos')}
                                 style={{
                                   fontFamily: galleryActiveTab === 'photos' ? '"Futura PT Medium"' : '"Futura PT Book"',
                                   fontSize: '10px',
                                   color: galleryActiveTab === 'photos' ? '#EB1C24' : '#000000',
                                   backgroundColor: 'transparent',
                                   borderTop: 'none',
                                   borderLeft: 'none',
                                   borderRight: 'none',
                                   borderBottom: galleryActiveTab === 'photos' ? '1px solid #EB1C24' : 'none',
                                   paddingTop: '8px',
                                   paddingLeft: '0',
                                   paddingRight: '0',
                                   paddingBottom: galleryActiveTab === 'photos' ? '6px' : '8px',
                                   cursor: 'pointer',
                                   textTransform: 'uppercase',
                                   fontWeight: galleryActiveTab === 'photos' ? '500' : '400'
                                 }}
                               >
                                 PHOTOS
                               </button>
                               <button
                                 onClick={() => setGalleryActiveTab('videos')}
                                 style={{
                                   fontFamily: galleryActiveTab === 'videos' ? '"Futura PT Medium"' : '"Futura PT Book"',
                                   fontSize: '10px',
                                   color: galleryActiveTab === 'videos' ? '#EB1C24' : '#000000',
                                   backgroundColor: 'transparent',
                                   borderTop: 'none',
                                   borderLeft: 'none',
                                   borderRight: 'none',
                                   borderBottom: galleryActiveTab === 'videos' ? '1px solid #EB1C24' : 'none',
                                   paddingTop: '8px',
                                   paddingLeft: '0',
                                   paddingRight: '0',
                                   paddingBottom: galleryActiveTab === 'videos' ? '6px' : '8px',
                                   cursor: 'pointer',
                                   textTransform: 'uppercase',
                                   fontWeight: galleryActiveTab === 'videos' ? '500' : '400'
                                 }}
                               >
                                 VIDEOS
                               </button>
                               <button
                                 onClick={() => setGalleryActiveTab('socials')}
                                 style={{
                                   fontFamily: galleryActiveTab === 'socials' ? '"Futura PT Medium"' : '"Futura PT Book"',
                                   fontSize: '10px',
                                   color: galleryActiveTab === 'socials' ? '#EB1C24' : '#000000',
                                   backgroundColor: 'transparent',
                                   borderTop: 'none',
                                   borderLeft: 'none',
                                   borderRight: 'none',
                                   borderBottom: galleryActiveTab === 'socials' ? '1px solid #EB1C24' : 'none',
                                   paddingTop: '8px',
                                   paddingLeft: '0',
                                   paddingRight: '0',
                                   paddingBottom: galleryActiveTab === 'socials' ? '6px' : '8px',
                                   cursor: 'pointer',
                                   textTransform: 'uppercase',
                                   fontWeight: galleryActiveTab === 'socials' ? '500' : '400'
                                 }}
                               >
                                 SOCIALS
                               </button>
                             </div>
                             
                             {/* Gallery Content */}
                             <div style={{ minHeight: '100px' }}>
                               {galleryActiveTab === 'photos' && (
                                 <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '26px' }}>
                                   {(() => {
                                     const filteredContent = getFilteredContent(expandedOrder.id);
                                     const photos = filteredContent.photos || [];
                                     
                                     if (photos.length === 0) {
                                       return (
                                         <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#909090', textTransform: 'uppercase', margin: '20px 0', textAlign: 'center', width: '100%' }}>
                                           NO PHOTOS SUBMITTED YET.
                                         </p>
                                       );
                                     }
                                     
                                    // Sort photos: pending first (most recent first), then rejected (most recent first), then approved (always last)
                                    const sortedPhotos = [...photos].sort((a, b) => {
                                      // First sort by status: pending first, then rejected, then approved (always last)
                                      if (a.status === 'pending' && b.status !== 'pending') return -1;
                                      if (a.status !== 'pending' && b.status === 'pending') return 1;
                                      if (a.status === 'rejected' && b.status === 'approved') return -1;
                                      if (a.status === 'approved' && b.status === 'rejected') return 1;
                                      
                                      // Within the same status, sort by date (most recent first)
                                      // For rejected items, this ensures newly rejected items appear before older rejected items
                                      if (a.status === b.status) {
                                        const dateA = new Date(a.submittedDate).getTime();
                                        const dateB = new Date(b.submittedDate).getTime();
                                        return dateB - dateA; // Most recent first
                                      }
                                      
                                      return 0;
                                    });
                                     
                                    return sortedPhotos.map((photo, photoIndex) => {
                                      // For SOFT CURL product: first photo uses 'cover', second uses custom blend
                                      const isSoftCurl = expandedOrder.productName === 'SOFT CURL';
                                      const useCustomBlend = isSoftCurl && photoIndex === 1;
                                      
                                      return (
                                      <div key={photo.id} style={{ 
                                        width: '120px', 
                                        flexShrink: 0,
                                        position: 'relative'
                                      }}>
                                        {(photo.status === 'pending' || photo.status === 'rejected') && (
                                          <button
                                            onClick={() => setShowDeleteConfirm({ type: 'photo', id: photo.id })}
                                            style={{
                                              position: 'absolute',
                                              top: '-10px',
                                              right: '-10px',
                                              width: '20px',
                                              height: '20px',
                                              backgroundColor: '#FFFFFF',
                                              border: '0.97px solid #000000',
                                              borderRadius: '50%',
                                              cursor: 'pointer',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              zIndex: 10,
                                              padding: 0,
                                              flexShrink: 0
                                            }}
                                          >
                                            <img
                                              src="/assets/close-icon.svg"
                                              alt="Close"
                                              style={{
                                                width: '12px',
                                                height: '12px',
                                                objectFit: 'contain',
                                                display: 'block',
                                                flexShrink: 0,
                                                filter: 'brightness(0) saturate(100%) invert(20%) sepia(93%) saturate(7151%) hue-rotate(349deg) brightness(92%) contrast(92%)'
                                              }}
                                            />
                                          </button>
                                        )}
                                        <div style={{ 
                                          position: 'relative', 
                                          padding: '1px', 
                                          border: '3px solid white', 
                                          boxShadow: '0 0 0 1.1px black', 
                                          boxSizing: 'border-box',
                                          width: '120px',
                                          height: '120px',
                                          display: 'flex',
                                          justifyContent: 'center',
                                          alignItems: 'center',
                                          backgroundColor: '#f5f5f5',
                                          overflow: 'hidden'
                                        }}>
                                         <img 
                                           src={typeof photo.preview === 'string' ? photo.preview : (typeof photo.file === 'string' ? photo.file : URL.createObjectURL(photo.file as File))} 
                                           alt="Submitted photo"
                                           onLoad={(e) => {
                                             if (useCustomBlend) {
                                               const img = e.currentTarget;
                                               // Custom blend: always use cover to fill container without letterboxing
                                               // Cover scales up small images and scales down/crops large images
                                               // This ensures no empty space while maintaining aspect ratio
                                               img.style.objectFit = 'cover';
                                               img.style.objectPosition = 'center';
                                             }
                                           }}
                                           style={{ 
                                             width: '100%', 
                                             height: '100%',
                                             objectFit: isSoftCurl && photoIndex === 0 ? 'cover' : (useCustomBlend ? 'cover' : 'cover'),
                                             objectPosition: 'center',
                                             display: 'block', 
                                             cursor: 'pointer'
                                           }}
                                            onClick={() => {
                                              const filteredContent = getFilteredContent(expandedOrder.id);
                                              const photos = filteredContent.photos || [];
                                              const photoUrls = photos.map(p => typeof p.preview === 'string' ? p.preview : URL.createObjectURL(p.file as File));
                                              const clickedIndex = photos.findIndex(p => p.id === photo.id);
                                              setViewerImages(photoUrls);
                                              setViewerCurrentIndex(clickedIndex >= 0 ? clickedIndex : 0);
                                              setShowImageViewer(true);
                                            }}
                                          />
                                         </div>
                                         <p style={{ fontFamily: photo.status === 'pending' ? '"Futura PT Demi"' : photo.status === 'rejected' ? '"Futura PT Medium"' : '"Futura PT Book"', fontSize: '10px', color: photo.status === 'approved' ? '#000000' : photo.status === 'rejected' ? '#EB1C24' : '#909090', textTransform: 'uppercase', margin: '8px 0 0 0', whiteSpace: 'nowrap', width: 'max-content', position: 'relative', left: '50%', transform: 'translateX(-50%)' }}>
                                           {photo.status === 'pending' ? 'PENDING: IN REVIEW' : photo.status === 'approved' ? (
                                             <>APPROVED: <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"' }}>{photo.points || 400} POINTS</span></>
                                           ) : <>REJECTED: {photo.rejectionReason || 'LIGHTING'}</>}
                                         </p>
                                       </div>
                                     );
                                     });
                                   })()}
                                 </div>
                               )}
                               
                               {galleryActiveTab === 'videos' && (
                                 <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '26px' }}>
                                   {(() => {
                                     const filteredContent = getFilteredContent(expandedOrder.id);
                                     const videos = filteredContent.videos || [];
                                     
                                     if (videos.length === 0) {
                                       return (
                                         <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#909090', textTransform: 'uppercase', margin: '20px 0', textAlign: 'center' }}>
                                           NO VIDEOS SUBMITTED YET.
                                         </p>
                                       );
                                     }
                                     
                                    // Sort videos: pending first (most recent first), then rejected (most recent first), then approved (always last)
                                    const sortedVideos = [...videos].sort((a, b) => {
                                      // First sort by status: pending first, then rejected, then approved (always last)
                                      if (a.status === 'pending' && b.status !== 'pending') return -1;
                                      if (a.status !== 'pending' && b.status === 'pending') return 1;
                                      if (a.status === 'rejected' && b.status === 'approved') return -1;
                                      if (a.status === 'approved' && b.status === 'rejected') return 1;
                                      
                                      // Within the same status, sort by date (most recent first)
                                      // For rejected items, this ensures newly rejected items appear before older rejected items
                                      if (a.status === b.status) {
                                        const dateA = new Date(a.submittedDate).getTime();
                                        const dateB = new Date(b.submittedDate).getTime();
                                        return dateB - dateA; // Most recent first
                                      }
                                      
                                      return 0;
                                    });
                                     
                                    return sortedVideos.map((video) => (
                                      <div key={video.id} style={{ 
                                        width: '120px', 
                                        flexShrink: 0,
                                        position: 'relative'
                                      }}>
                                        {(video.status === 'pending' || video.status === 'rejected') && (
                                          <button
                                            onClick={() => setShowDeleteConfirm({ type: 'video', id: video.id })}
                                            style={{
                                              position: 'absolute',
                                              top: '-10px',
                                              right: '-10px',
                                              width: '20px',
                                              height: '20px',
                                              backgroundColor: '#FFFFFF',
                                              border: '0.97px solid #000000',
                                              borderRadius: '50%',
                                              cursor: 'pointer',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              zIndex: 10,
                                              padding: 0,
                                              flexShrink: 0
                                            }}
                                          >
                                            <img
                                              src="/assets/close-icon.svg"
                                              alt="Close"
                                              style={{
                                                width: '12px',
                                                height: '12px',
                                                objectFit: 'contain',
                                                display: 'block',
                                                flexShrink: 0,
                                                filter: 'brightness(0) saturate(100%) invert(20%) sepia(93%) saturate(7151%) hue-rotate(349deg) brightness(92%) contrast(92%)'
                                              }}
                                            />
                                          </button>
                                        )}
                                        <div style={{ 
                                          position: 'relative', 
                                          padding: '1px', 
                                          border: '3px solid white', 
                                          boxShadow: '0 0 0 1.1px black', 
                                          boxSizing: 'border-box',
                                          width: '120px',
                                          height: '120px',
                                          display: 'flex',
                                          justifyContent: 'center',
                                          alignItems: 'center',
                                          backgroundColor: '#f5f5f5',
                                          overflow: 'hidden'
                                        }}>
                                          <video 
                                            src={typeof video.preview === 'string' ? video.preview : (typeof video.file === 'string' ? video.file : URL.createObjectURL(video.file as File))} 
                                            controls
                                            style={{ 
                                              width: '100%', 
                                              height: '100%',
                                              objectFit: 'cover',
                                              objectPosition: 'center',
                                              display: 'block', 
                                              cursor: 'pointer'
                                            }}
                                            onClick={() => {
                                              const filteredContent = getFilteredContent(expandedOrder.id);
                                              const videos = filteredContent.videos || [];
                                              const videoUrls = videos.map(v => typeof v.preview === 'string' ? v.preview : URL.createObjectURL(v.file as File));
                                              const clickedIndex = videos.findIndex(v => v.id === video.id);
                                              setViewerImages(videoUrls);
                                              setViewerCurrentIndex(clickedIndex >= 0 ? clickedIndex : 0);
                                              setShowImageViewer(true);
                                            }}
                                          />
                                         </div>
                                         <p style={{ fontFamily: video.status === 'pending' ? '"Futura PT Demi"' : video.status === 'rejected' ? '"Futura PT Medium"' : '"Futura PT Book"', fontSize: '10px', color: video.status === 'approved' ? '#000000' : video.status === 'rejected' ? '#EB1C24' : '#909090', textTransform: 'uppercase', margin: '8px 0 0 0', whiteSpace: 'nowrap', width: 'max-content', position: 'relative', left: '50%', transform: 'translateX(-50%)' }}>
                                           {video.status === 'pending' ? 'PENDING: IN REVIEW' : video.status === 'approved' ? (
                                             <>APPROVED: <span style={{ color: '#EB1C24' }}>{video.points || 600} POINTS</span></>
                                           ) : <>REJECTED: {video.rejectionReason || 'LIGHTING'}</>}
                                         </p>
                                       </div>
                                     ));
                                   })()}
                                 </div>
                               )}
                               
                               {galleryActiveTab === 'socials' && (
                                 <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                   {(() => {
                                     const filteredContent = getFilteredContent(expandedOrder.id);
                                     const socials = filteredContent.socials || [];
                                     
                                     if (socials.length === 0) {
                                       return (
                                         <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', color: '#909090', textTransform: 'uppercase', margin: '20px 0', textAlign: 'center' }}>
                                           NO SOCIAL TAGS SUBMITTED YET.
                                         </p>
                                       );
                                     }
                                     
                                     return socials.map((social) => (
                                       <div key={social.id} style={{ position: 'relative' }}>
                                         {(social.status === 'pending' || social.status === 'rejected') && (
                                           <button
                                             onClick={() => setShowDeleteConfirm({ type: 'social', id: social.id })}
                                             style={{
                                               position: 'absolute',
                                               top: '0',
                                               right: '0',
                                               backgroundColor: 'transparent',
                                               border: 'none',
                                               cursor: 'pointer',
                                               display: 'flex',
                                               alignItems: 'center',
                                               justifyContent: 'center',
                                               zIndex: 10,
                                               padding: 0
                                             }}
                                           >
                                             <img
                                               src="/assets/close-icon.svg"
                                               alt="Close"
                                               style={{
                                                 width: '11px',
                                                 height: '11px',
                                                 objectFit: 'contain',
                                                 display: 'block',
                                                 flexShrink: 0,
                                                 filter: 'brightness(0) saturate(100%) invert(20%) sepia(93%) saturate(7151%) hue-rotate(349deg) brightness(92%) contrast(92%)'
                                               }}
                                             />
                                           </button>
                                         )}
                                         <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#EB1C24', textTransform: 'uppercase', margin: '0 0 8px 0', fontWeight: '500' }}>
                                           {social.platform.toUpperCase()}:
                                         </p>
                                         <a 
                                           href={social.link} 
                                           target="_blank" 
                                           rel="noopener noreferrer"
                                           style={{ fontFamily: '"Futura PT Demi"', fontSize: '10px', color: '#909090', textDecoration: 'underline', wordBreak: 'break-all', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}
                                         >
                                           {social.link.toUpperCase()}
                                         </a>
                                         <p style={{ fontFamily: social.status === 'pending' ? '"Futura PT Demi"' : social.status === 'rejected' ? '"Futura PT Medium"' : '"Futura PT Book"', fontSize: '10px', color: social.status === 'approved' ? '#000000' : social.status === 'rejected' ? '#EB1C24' : '#909090', textTransform: 'uppercase', margin: '0', textAlign: 'left', whiteSpace: 'nowrap' }}>
                                           {social.status === 'pending' ? 'PENDING: IN REVIEW' : social.status === 'approved' ? (
                                             <>APPROVED: <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"' }}>{social.points || 600} POINTS</span></>
                                           ) : <>REJECTED: {social.rejectionReason || 'LIGHTING'}</>}
                                         </p>
                                       </div>
                                     ));
                                   })()}
                                 </div>
                               )}
                             </div>
                           </div>
                         </>
                       );
                     })()
                   ) : (
                     <>
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

                  {/* Content Approval Instructions */}
                  <div style={{ marginBottom: '24px' }}>
                    <p
                      style={{
                        fontFamily: '"Futura PT Book", "Futura PT Medium", "Covered By Your Grace", "Covered By Your Grace Preload"',
                        color: '#000000',
                        fontSize: '10px',
                        margin: '-4px 0 24px 0',
                        textTransform: 'uppercase',
                        fontWeight: '500',
                        lineHeight: '1.4',
                        textAlign: 'left'
                      }}
                    >
                      IN ORDER TO HAVE THE HIGHEST CHANCE FOR CONTENT APPROVAL PLEASE SUBMIT CLEAR, WELL LIT PHOTOS/VIDEOS. PREFERABLY WITH NO FILTERS OR EDITS IN ORDER TO SHOWCASE THE PRODUCT IN ITS MOST AUTHENTIC STATE. ALLOW UP TO 72 HOURS FOR YOUR CONTENT TO BE REVIEWED AND APPROVED.
                    </p>
                  </div>

                  {/* SUBMIT CONTENT Section */}
                  <div style={{ marginBottom: '8px' }}>
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
                        AFFILIATE PROGRAM
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
                                  width: '133px',
                                  height: '133px',
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
                                 VIEW POINTS
                               </p>
                            </div>
                            
                            {/* Order Detail Text */}
                            <div className="flex flex-col gap-1" style={{ flexShrink: 0, transform: 'translateY(-14px)' }}>
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
                                  const socialPointsEarned = effectiveSocialTags * 600;
                                  const totalEarned = photoVideoEarned + socialPointsEarned;
                                  if (totalEarned === 0) {
                                    return '0/5,000 PTS';
                                  } else {
                                    return `${totalEarned.toLocaleString()}/5,000 PTS`;
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
                                  const socialPointsEarned = effectiveSocialTags * 600;
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
                                    const pendingPhotoVideoPoints = (pendingPhotos * 400) + (pendingVideos * 600);
                                    const pendingSocialPoints = pendingSocialTags * 600;
                                    const totalPendingPoints = pendingPhotoVideoPoints + pendingSocialPoints;
                                    return `+${totalPendingPoints.toLocaleString()} POINTS PENDING`;
                                  }
                                  
                                  // If content was rejected
                                  if (contentStatus === 'rejected') {
                                    return 'CONTENT REJECTED';
                                  }
                                  
                                  // If content is approved, show points earned
                                  if (contentStatus === 'approved') {
                                    const available = order.pointsAvailable || 5000;
                                    if (totalEarned >= available) {
                                      return 'ALL POINTS EARNED!';
                                    } else {
                                      return `+${totalEarned.toLocaleString()} POINTS EARNED!`;
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
                                  return `${effectiveSocialTags}/5 TAGS`;
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
               </>
             )}
           </div>
         </div>
       </div>
       
      {/* Submit Button - Outside card */}
      {expandedOrderId && !showMobileMenu && (
        <div className="px-0 md:px-0 -mx-4" style={{ marginTop: '-40px', marginBottom: '20px', position: 'relative', zIndex: 10 }}>
          <button
            ref={submitButtonRef}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSubmitContent(e);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSubmitContent(e as any);
            }}
            onMouseDown={(_e) => {
              // Don't prevent default here, let onClick handle it
            }}
            className="border border-black font-futura text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50 active:bg-gray-100"
            style={{
              borderWidth: '1.3px', 
              color: '#EB1C24',
              fontFamily: '"Futura PT Medium"',
              backgroundColor: '#FFFFFF',
              textTransform: 'uppercase',
              width: 'calc(100% - 64px)',
              margin: '0 auto',
              display: 'block',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              position: 'relative',
              zIndex: 10,
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitTouchCallout: 'none',
              cursor: 'pointer'
            }}
            type="button"
          >
            SUBMIT CONTENT
          </button>
          {/* Debug message - visible on mobile */}
          {submitDebugMessage && (
            <div
              style={{
                marginTop: '10px',
                padding: '8px',
                backgroundColor: submitDebugMessage.includes('Error') || submitDebugMessage.includes('✗') 
                  ? '#ffebee' 
                  : submitDebugMessage.includes('✓') 
                    ? '#e8f5e9' 
                    : '#fff3e0',
                border: `1px solid ${submitDebugMessage.includes('Error') || submitDebugMessage.includes('✗') 
                  ? '#f44336' 
                  : submitDebugMessage.includes('✓') 
                    ? '#4caf50' 
                    : '#ff9800'}`,
                color: submitDebugMessage.includes('Error') || submitDebugMessage.includes('✗') 
                  ? '#c62828' 
                  : submitDebugMessage.includes('✓') 
                    ? '#2e7d32' 
                    : '#e65100',
                fontSize: '11px',
                fontFamily: '"Futura PT Book"',
                textAlign: 'center',
                borderRadius: '4px',
                width: 'calc(100% - 64px)',
                margin: '0 auto'
              }}
            >
              {submitDebugMessage}
            </div>
          )}
         </div>
       )}
       
       {/* Delete Confirmation Modal */}
       {showDeleteConfirm && expandedOrderId && (
         <ConfirmationModal
           isOpen={true}
           onClose={() => setShowDeleteConfirm(null)}
           onConfirm={() => {
             if (!expandedOrderId || !showDeleteConfirm) return;
             const expandedOrder = deliveredOrders.find(o => o.id === expandedOrderId);
             if (!expandedOrder) return;
             
             const orderContent = submittedContent[expandedOrder.id] || { photos: [], videos: [], socials: [] };
             
            if (showDeleteConfirm.type === 'photo') {
              setSubmittedContent(prev => {
                const newContent = {
                  ...prev,
                  [expandedOrder.id]: {
                    ...orderContent,
                    photos: orderContent.photos.filter(p => p.id !== showDeleteConfirm.id)
                  }
                };
                saveSubmittedContentToStorage(newContent);
                return newContent;
              });
              // Clear photo file states when deleting photo content
              // This ensures a new file selection will use fresh state
              setPhoto1File(null);
              setPhoto1Preview(null);
              setPhoto2File(null);
              setPhoto2Preview(null);
              if (photo1InputRef.current) photo1InputRef.current.value = '';
              if (photo2InputRef.current) photo2InputRef.current.value = '';
            } else if (showDeleteConfirm.type === 'video') {
              setSubmittedContent(prev => {
                const newContent = {
                  ...prev,
                  [expandedOrder.id]: {
                    ...orderContent,
                    videos: orderContent.videos.filter(v => v.id !== showDeleteConfirm.id)
                  }
                };
                saveSubmittedContentToStorage(newContent);
                return newContent;
              });
              // Clear video file states when deleting video content
              // This ensures a new file selection will use fresh state
              setVideo1File(null);
              setVideo1Preview(null);
              setVideo2File(null);
              setVideo2Preview(null);
              if (video1InputRef.current) video1InputRef.current.value = '';
              if (video2InputRef.current) video2InputRef.current.value = '';
            } else if (showDeleteConfirm.type === 'social') {
              setSubmittedContent(prev => {
                const newContent = {
                  ...prev,
                  [expandedOrder.id]: {
                    ...orderContent,
                    socials: orderContent.socials.filter(s => s.id !== showDeleteConfirm.id)
                  }
                };
                saveSubmittedContentToStorage(newContent);
                return newContent;
              });
            }
            
            setShowDeleteConfirm(null);
           }}
           title={(() => {
             if (!expandedOrderId || !showDeleteConfirm) return "DELETE CONTENT";
             const expandedOrder = deliveredOrders.find(o => o.id === expandedOrderId);
             if (!expandedOrder) return "DELETE CONTENT";
             const orderContent = submittedContent[expandedOrder.id] || { photos: [], videos: [], socials: [] };
             let contentItem = null;
             if (showDeleteConfirm.type === 'photo') {
               contentItem = orderContent.photos?.find(p => p.id === showDeleteConfirm.id);
             } else if (showDeleteConfirm.type === 'video') {
               contentItem = orderContent.videos?.find(v => v.id === showDeleteConfirm.id);
             } else if (showDeleteConfirm.type === 'social') {
               contentItem = orderContent.socials?.find(s => s.id === showDeleteConfirm.id);
             }
             return contentItem?.status === 'pending' ? "CANCEL SUBMISSION" : "DELETE CONTENT";
           })()}
           message={(() => {
             if (!expandedOrderId || !showDeleteConfirm) return "ARE YOU SURE YOU WANT TO DELETE THIS CONTENT?";
             const expandedOrder = deliveredOrders.find(o => o.id === expandedOrderId);
             if (!expandedOrder) return "ARE YOU SURE YOU WANT TO DELETE THIS CONTENT?";
             const orderContent = submittedContent[expandedOrder.id] || { photos: [], videos: [], socials: [] };
             let contentItem = null;
             if (showDeleteConfirm.type === 'photo') {
               contentItem = orderContent.photos?.find(p => p.id === showDeleteConfirm.id);
             } else if (showDeleteConfirm.type === 'video') {
               contentItem = orderContent.videos?.find(v => v.id === showDeleteConfirm.id);
             } else if (showDeleteConfirm.type === 'social') {
               contentItem = orderContent.socials?.find(s => s.id === showDeleteConfirm.id);
             }
             return contentItem?.status === 'pending' ? "ARE YOU SURE YOU WANT TO CANCEL THIS SUBMISSION?" : "ARE YOU SURE YOU WANT TO DELETE THIS CONTENT?";
           })()}
           confirmText={(() => {
             if (!expandedOrderId || !showDeleteConfirm) return "DELETE";
             const expandedOrder = deliveredOrders.find(o => o.id === expandedOrderId);
             if (!expandedOrder) return "DELETE";
             const orderContent = submittedContent[expandedOrder.id] || { photos: [], videos: [], socials: [] };
             let contentItem = null;
             if (showDeleteConfirm.type === 'photo') {
               contentItem = orderContent.photos?.find(p => p.id === showDeleteConfirm.id);
             } else if (showDeleteConfirm.type === 'video') {
               contentItem = orderContent.videos?.find(v => v.id === showDeleteConfirm.id);
             } else if (showDeleteConfirm.type === 'social') {
               contentItem = orderContent.socials?.find(s => s.id === showDeleteConfirm.id);
             }
             return contentItem?.status === 'pending' ? "CONFIRM" : "DELETE";
           })()}
           cancelText="CANCEL"
         />
       )}

       {/* Image Viewer Modal */}
       <ImageViewerModal
         isOpen={showImageViewer}
         onClose={() => setShowImageViewer(false)}
         images={viewerImages}
         currentIndex={viewerCurrentIndex}
         onNavigate={setViewerCurrentIndex}
       />
     </div>
   );
 }
 
 export default AffiliatePage;
