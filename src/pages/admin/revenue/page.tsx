import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import StatsCard from '../components/StatsCard';

export default function AdminRevenue() {
  const navigate = useNavigate();

  const revenueStats = [
    {
      title: 'TOTAL REVENUE',
      count: '$45.7K',
      items: [
        { label: 'THIS MONTH', value: '$45,670', color: 'text-gray-500' },
        { label: 'LAST MONTH', value: '$40,650', color: 'text-red-500' },
        { label: 'THIS YEAR', value: '$467,890', color: 'text-red-500' },
        { label: 'GROWTH RATE', value: '+12.5%', color: 'text-gray-500' }
      ],
      highlight: 'REVENUE PERFORMANCE STRONG - EXCEEDING TARGETS',
      tiers: [
        { label: 'Q1', value: '$89K', color: 'text-red-500' },
        { label: 'Q2', value: '$95K', color: 'text-red-500' },
        { label: 'Q3', value: '$112K', color: 'text-gray-500' }
      ]
    },
    {
      title: 'ORDERS',
      count: '53',
      items: [
        { label: 'THIS MONTH', value: '53', color: 'text-gray-500' },
        { label: 'LAST MONTH', value: '47', color: 'text-red-500' },
        { label: 'AVERAGE ORDER', value: '$861', color: 'text-red-500' },
        { label: 'CONVERSION RATE', value: '8.3%', color: 'text-gray-500' }
      ],
      activity: 'ORDER VOLUME INCREASING - STRONG CUSTOMER DEMAND'
    },
    {
      title: 'TOP PRODUCTS',
      count: '4',
      items: [
        { label: 'PREMIUM NOIR WIG', value: '23 sales', color: 'text-gray-500' },
        { label: 'BODY WAVE COLLECTION', value: '18 sales', color: 'text-red-500' },
        { label: 'CURLY GODDESS SERIES', value: '12 sales', color: 'text-red-500' },
        { label: 'SILKY STRAIGHT LINE', value: '8 sales', color: 'text-gray-500' }
      ],
      highlight: 'PREMIUM NOIR WIG LEADING SALES - HIGH DEMAND'
    },
    {
      title: 'PAYMENT METHODS',
      count: '5',
      items: [
        { label: 'CREDIT CARD', value: '68%', color: 'text-gray-500' },
        { label: 'PAYPAL', value: '22%', color: 'text-red-500' },
        { label: 'BANK TRANSFER', value: '8%', color: 'text-red-500' },
        { label: 'CASH', value: '2%', color: 'text-gray-500' }
      ],
      activity: 'DIGITAL PAYMENTS DOMINANT - SECURE TRANSACTIONS'
    },
    {
      title: 'MONTHLY BREAKDOWN',
      count: '6',
      items: [
        { label: 'JANUARY', value: '$42,300', color: 'text-gray-500' },
        { label: 'FEBRUARY', value: '$38,900', color: 'text-red-500' },
        { label: 'MARCH', value: '$45,600', color: 'text-red-500' },
        { label: 'APRIL', value: '$41,200', color: 'text-gray-500' }
      ],
      highlight: 'CONSISTENT MONTHLY PERFORMANCE - STABLE GROWTH'
    },
    {
      title: 'FINANCIAL HEALTH',
      count: 'A+',
      items: [
        { label: 'PROFIT MARGIN', value: '35%', color: 'text-gray-500' },
        { label: 'CASH FLOW', value: 'Positive', color: 'text-gray-500' },
        { label: 'DEBT RATIO', value: 'Low', color: 'text-gray-500' },
        { label: 'INVESTMENT RETURN', value: '18%', color: 'text-gray-500' }
      ],
      activity: 'FINANCIAL HEALTH EXCELLENT - STRONG PROFITABILITY'
    }
  ];

  // Handle card click navigation
  const handleCardClick = (cardTitle: string) => {
    switch (cardTitle) {
      case 'TOTAL REVENUE':
        navigate('/admin/dashboard');
        break;
      case 'ORDERS':
        navigate('/admin/pending');
        break;
      case 'TOP PRODUCTS':
        navigate('/admin/product-editor');
        break;
      case 'PAYMENT METHODS':
        navigate('/admin/settings');
        break;
      case 'MONTHLY BREAKDOWN':
        navigate('/admin/visual-overview');
        break;
      case 'FINANCIAL HEALTH':
        navigate('/admin/settings');
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
          backgroundImage: `url('/assets/Marble Floor.jpg')`,
          backgroundSize: '500% auto',
          backgroundPosition: 'right 140%',
          backgroundRepeat: 'repeat-y'
        }}
      ></div>
      
      {/* Scrollable Content */}
      <div className="relative z-10">
        <AdminHeader title="REVENUE" showBack onBack={() => window.history.back()} />
        
        <div className="pb-6 px-4">
          <div className="max-w-md mx-auto">
            <div className="grid grid-cols-2 gap-4">
              {revenueStats.map((stat, index) => (
                <StatsCard key={index} data={stat} onCardClick={handleCardClick} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

