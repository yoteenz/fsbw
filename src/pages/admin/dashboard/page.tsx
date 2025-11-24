
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import StatsCard from '../components/StatsCard';
import RecentActivity from '../components/RecentActivity';
import ActivityFeed from '../components/ActivityFeed';

// Mock data types and functions to replace Supabase imports
type DashboardStats = {
  activeClients: number;
  referralCount: number;
};

type Client = {
  tier: string;
};

type Booking = {
  status: string;
  appointment_date: string;
  service_name: string;
  client_name: string;
};

type Revenue = {
  transaction_date: string;
  amount: number;
  status: string;
};

type Notification = {
  id: number;
  text: string;
};

// Mock API functions
const mockAPI = {
  setupDatabase: async () => Promise.resolve(),
  seedData: async () => Promise.resolve(),
  getDashboardData: async () => ({
    stats: { activeClients: 89, referralCount: 23 },
    clients: [
      { tier: 'Premium' }, { tier: 'Premium' }, { tier: 'Premium' },
      { tier: 'Standard' }, { tier: 'Standard' }, { tier: 'Standard' }, { tier: 'Standard' },
      { tier: 'Basic' }, { tier: 'Basic' }, { tier: 'Basic' }, { tier: 'Basic' }, { tier: 'Basic' }
    ],
    bookings: [
      { status: 'Scheduled', appointment_date: '2025-01-24T10:00:00', service_name: 'Install', client_name: 'Sarah J.' },
      { status: 'Scheduled', appointment_date: '2025-01-24T14:00:00', service_name: 'Consultation', client_name: 'Maria R.' }
    ],
    revenue: [
      { transaction_date: '2025-01-15', amount: 15000, status: 'Completed' },
      { transaction_date: '2025-01-10', amount: 8500, status: 'Completed' },
      { transaction_date: '2025-01-20', amount: 3200, status: 'Pending' },
      { transaction_date: '2024-10-15', amount: 12000, status: 'Completed' },
      { transaction_date: '2024-07-10', amount: 9500, status: 'Completed' },
      { transaction_date: '2024-04-20', amount: 11200, status: 'Completed' }
    ],
    notifications: []
  })
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [notificationViewMode, setNotificationViewMode] = useState('list');
  const [dashboardData, setDashboardData] = useState<{
    stats: DashboardStats;
    clients: Client[];
    bookings: Booking[];
    revenue: Revenue[];
    notifications: Notification[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize database and load data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Use mock API instead of Supabase
        await mockAPI.setupDatabase();
        await mockAPI.seedData();
        const data = await mockAPI.getDashboardData();
        setDashboardData(data);
        
      } catch (err) {
        console.error('Failed to initialize dashboard:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Helper function to check if appointment is within 24 hours
  const isWithin24Hours = (appointmentDate: string) => {
    const appointment = new Date(appointmentDate);
    const now = new Date();
    const diffHours = (appointment.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours <= 24;
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('en-US')}`;
  };

  // Helper function to format currency for K format
  const formatCurrencyK = (amount: number) => {
    if (amount >= 1000) {
      return `$${Math.round(amount / 1000).toLocaleString('en-US')}K`;
    }
    return `$${amount.toLocaleString('en-US')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        position: 'relative'
      }}>
        {/* Fixed Background Layer */}
        <div 
          className="fixed inset-0 -z-10"
          style={{
            backgroundImage: `url('/assets/Marble Floor.jpg')`,
            backgroundSize: '500% auto',
            backgroundPosition: 'right 140%',
            backgroundRepeat: 'repeat-y'
          }}
        ></div>
        <div className="bg-white/60 backdrop-blur-sm border border-black px-6 py-4" style={{ borderWidth: '1.4px' }}>
          <p className="text-sm font-bold">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        position: 'relative'
      }}>
        {/* Fixed Background Layer */}
        <div 
          className="fixed inset-0 -z-10"
          style={{
            backgroundImage: `url('/assets/Marble Floor.jpg')`,
            backgroundSize: '500% auto',
            backgroundPosition: 'right 140%',
            backgroundRepeat: 'repeat-y'
          }}
        ></div>
        <div className="bg-white/60 backdrop-blur-sm border border-red-500 px-6 py-4" style={{ borderWidth: '1.4px' }}>
          <p className="text-sm font-bold text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { stats, clients, revenue } = dashboardData;

  // Get recent completed bookings for meeting display with diverse appointment types
  const diverseBookings = [
    { service_name: 'NEW BOOKING: INSTALL', appointment_date: '2025-02-07T10:00:00', client_name: 'SARAH S.' },
    { service_name: 'NEW CONSULT: WIG & INSTALL', appointment_date: '2025-02-07T14:30:00', client_name: 'MARIA R.' },
    { service_name: 'VIRTUAL CLASS', appointment_date: '2025-02-08T09:15:00', client_name: 'ASHLEY W.' },
    { service_name: 'NEW CONSULT: WIG ONLY', appointment_date: '2025-02-08T16:45:00', client_name: 'JENNIFER D.' },
    { service_name: 'NEW BOOKING: REINSTALL', appointment_date: '2025-02-09T11:30:00', client_name: 'LISA M.' }
  ];

  // Filter only upcoming meetings (future dates)
  const upcomingMeetings = diverseBookings.filter(booking => {
    const appointmentDate = new Date(booking.appointment_date);
    const now = new Date();
    return appointmentDate > now;
  });

  // Get client tier distribution
  const clientTiers = clients.reduce((acc, client) => {
    acc[client.tier] = (acc[client.tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate quarterly revenue
  const currentYear = new Date().getFullYear();
  const quarterlyRevenue = revenue
    .filter(r => new Date(r.transaction_date).getFullYear() === currentYear)
    .reduce((acc, r) => {
      const quarter = Math.floor(new Date(r.transaction_date).getMonth() / 3) + 1;
      acc[`Q${quarter}`] = (acc[`Q${quarter}`] || 0) + r.amount;
      return acc;
    }, {} as Record<string, number>);

  // Calculate current year revenue for header count
  const currentYearRevenue = revenue
    .filter(r => new Date(r.transaction_date).getFullYear() === currentYear)
    .reduce((sum, r) => sum + r.amount, 0);

  // Calculate actual taxes paid on completed orders
  const taxesPaid = revenue
    .filter(r => r.status === 'Completed')
    .reduce((sum, r) => sum + (r.amount * 0.15), 0); // 15% tax rate on completed transactions

  // Calculate net income (gross revenue minus business expenses)
  const businessExpenses = currentYearRevenue * 0.35; // 35% for inventory, overhead, taxes, etc.
  const netIncome = currentYearRevenue - businessExpenses;
  const quarterlyNetIncome = Math.max(0, netIncome); // Ensure non-negative

  // Helper function to format date without year (M/D format)
  const formatDateWithoutYear = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1; // getMonth() returns 0-based month
    const day = date.getDate();
    return `${month}/${day}`;
  };

  const statsData = [
    {
      title: 'CLIENTS',
      count: stats.activeClients,
      items: [
        { label: 'EMAIL MARKETING', value: '1,247', color: 'text-gray-500' },
        { label: 'BASIC MEMBERS', value: (clientTiers.Basic || 0).toString(), color: 'text-red-500' },
        { label: 'PREMIUM MEMBERS', value: (clientTiers.Standard || 0).toString(), color: 'text-red-500' },
        { label: 'REFERRALS', value: stats.referralCount.toString(), color: 'text-gray-500' }
      ],
      actions: [
        { label: 'Preferences', action: 'preferences' },
        { label: 'Settings', action: 'settings' }
      ],
      tiers: [
        { label: 'PREM', value: (clientTiers.Premium || 0).toString(), color: 'text-black' },
        { label: 'STD', value: (clientTiers.Standard || 0).toString(), color: 'text-red-500' },
        { label: 'BASIC', value: (clientTiers.Basic || 0).toString(), color: 'text-gray-500' }
      ]
    },

    {
      title: 'REVENUE',
      count: formatCurrencyK(currentYearRevenue),
      items: [
        { label: 'INVENTORY', value: '145/250', color: 'text-gray-500' },
        { label: 'ORDERS RECEIVED', value: stats.activeClients.toString(), color: 'text-red-500' },
        { label: 'QUARTERLY SALES', value: formatCurrencyK(quarterlyNetIncome), color: 'text-gray-500' },
        { label: 'TAX DEDUCTIONS', value: formatCurrency(Math.round(taxesPaid)), color: 'text-gray-500' }
      ],
      highlight: 'PERFORMANCE STRONG - ON TRACK TO EXCEED TARGETS',
      tiers: [
        { label: 'Q1', value: `${Math.round((quarterlyRevenue.Q1 || 0) / 1000).toLocaleString('en-US')}K`, color: 'text-red-500' },
        { label: 'Q2', value: `${Math.round((quarterlyRevenue.Q2 || 0) / 1000).toLocaleString('en-US')}K`, color: 'text-red-500' },
        { label: 'Q3', value: `${Math.round((quarterlyRevenue.Q3 || 0) / 1000).toLocaleString('en-US')}K`, color: 'text-red-500' }
      ]
    },

    {
      title: 'PENDING',
      count: revenue.filter(r => r.status === 'Pending').length.toString(),
      items: [
        { label: 'REVIEWS', value: '12', color: 'text-gray-500' },
        { label: 'ORDER FORMS', value: '8', color: 'text-red-500' },
        { label: 'TIER UPGRADES', value: '23', color: 'text-red-500' },
        { label: 'AFFILIATE', value: '47', color: 'text-gray-500' }
      ],
      activity: revenue.filter(r => r.status === 'Pending').length > 0 ? 'URGENT: REVIEWS AND APPROVALS REQUIRE ATTENTION' : 'ALL APPROVALS UP TO DATE'
    },

    {
      title: 'MEETINGS',
      count: upcomingMeetings.length,
      items: diverseBookings.map(booking => ({
        label: booking.service_name.toUpperCase(),
        value: `${formatDateWithoutYear(booking.appointment_date)} ${booking.client_name}`,
        color: isWithin24Hours(booking.appointment_date) ? 'text-red-500' : 'text-gray-500'
      })),
      highlight: upcomingMeetings.length > 0 ? `${upcomingMeetings.length} UPCOMING APPOINTMENTS SCHEDULED` : 'NO UPCOMING APPPOINTMENTS'
    },

    {
      title: 'REVIEWS',
      count: '4.8',
      items: [
        { label: 'TOTAL REVIEWS', value: '247', color: 'text-gray-500' },
        { label: 'PHOTOS/VIDEOS', value: '34', color: 'text-red-500' },
        { label: 'REVIEWS PER MONTH', value: '18', color: 'text-gray-500' },
        { label: 'POSITIVE SENTIMENT', value: '94%', color: 'text-gray-500' }
      ],
      activity: 'EXCELLENT CLIENT FEEDBACK - HIGH SATISFACTION RATINGS'
    },

    {
      title: 'BRAND',
      count: '94%',
      items: [
        { label: 'CLIENT RETENTION', value: '94%', color: 'text-gray-500' },
        { label: 'REFERRAL RATE', value: '23%', color: 'text-gray-500' },
        { label: 'REPEAT BOOKINGS', value: '78%', color: 'text-gray-500' },
        { label: 'GROWTH RATE', value: '+15%', color: 'text-gray-500' }
      ],
      highlight: 'BRAND GROWTH STRONG - EXCELLENT CLIENT RETENTION'
    }
  ];

  // Handle card click navigation
  const handleCardClick = (cardTitle: string) => {
    switch (cardTitle) {
      case 'CLIENTS':
        navigate('/admin/clients');
        break;
      case 'REVENUE':
        navigate('/admin/revenue');
        break;
      case 'PENDING':
        navigate('/admin/pending');
        break;
      case 'MEETINGS':
        navigate('/admin/meetings');
        break;
      case 'REVIEWS':
        navigate('/admin/reviews');
        break;
      case 'BRAND':
        navigate('/admin/product-editor');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen" style={{
      position: 'relative'
    }}>
      {/* Fixed Background Layer */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('https://www.dropbox.com/scl/fi/u4m42t2levejhysa3mnby/Marble-Floor.jpg?rlkey=j87posj7qo7fed7v6vihe09kr&st=uzmjl2p3&dl=1')`,
          backgroundSize: '500% auto',
          backgroundPosition: 'right 140%',
          backgroundRepeat: 'repeat-y'
        }}
      ></div>
      
      {/* Scrollable Content */}
      <div className="relative z-10">
        <AdminHeader title="DASHBOARD" />
        
        <div className="pb-6 px-4">
          <div className="max-w-md mx-auto">
            <div className="grid grid-cols-2 gap-4">
              {statsData.map((stat, index) => (
                <StatsCard key={index} data={stat} onCardClick={handleCardClick} />
              ))}
            </div>
            
            <div className="mt-6">
              <RecentActivity onViewModeChange={setNotificationViewMode} />
            </div>
            
            {notificationViewMode === 'list' && (
              <div className="mt-6">
                <ActivityFeed />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

