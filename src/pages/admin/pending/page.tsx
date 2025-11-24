import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import StatsCard from '../components/StatsCard';

export default function AdminPending() {
  const navigate = useNavigate();

  const pendingStats = [
    {
      title: 'PENDING REVIEWS',
      count: '12',
      items: [
        { label: 'NEW REVIEWS', value: '8', color: 'text-gray-500' },
        { label: 'PHOTO REVIEWS', value: '4', color: 'text-red-500' },
        { label: 'VIDEO REVIEWS', value: '2', color: 'text-red-500' },
        { label: 'RATING REVIEWS', value: '6', color: 'text-gray-500' }
      ],
      highlight: 'URGENT: REVIEWS REQUIRE IMMEDIATE ATTENTION',
      tiers: [
        { label: 'HIGH', value: '4', color: 'text-red-500' },
        { label: 'MED', value: '5', color: 'text-red-500' },
        { label: 'LOW', value: '3', color: 'text-gray-500' }
      ]
    },
    {
      title: 'ORDER FORMS',
      count: '8',
      items: [
        { label: 'INCOMPLETE FORMS', value: '5', color: 'text-gray-500' },
        { label: 'MISSING INFO', value: '3', color: 'text-red-500' },
        { label: 'PENDING APPROVAL', value: '2', color: 'text-red-500' },
        { label: 'REQUIRES FOLLOW-UP', value: '1', color: 'text-gray-500' }
      ],
      activity: 'ORDER FORMS NEED COMPLETION - CUSTOMER CONTACT REQUIRED'
    },
    {
      title: 'TIER UPGRADES',
      count: '23',
      items: [
        { label: 'BASIC TO PREMIUM', value: '12', color: 'text-gray-500' },
        { label: 'PREMIUM TO VIP', value: '8', color: 'text-red-500' },
        { label: 'VIP TO BLACK TIER', value: '3', color: 'text-red-500' },
        { label: 'PENDING PAYMENT', value: '5', color: 'text-gray-500' }
      ],
      highlight: 'TIER UPGRADES PENDING - REVENUE OPPORTUNITY'
    },
    {
      title: 'AFFILIATE REQUESTS',
      count: '47',
      items: [
        { label: 'NEW APPLICANTS', value: '23', color: 'text-gray-500' },
        { label: 'DOCUMENTATION', value: '15', color: 'text-red-500' },
        { label: 'BACKGROUND CHECK', value: '9', color: 'text-red-500' },
        { label: 'APPROVED PENDING', value: '12', color: 'text-gray-500' }
      ],
      activity: 'AFFILIATE PROGRAM GROWING - REVIEW APPLICATIONS'
    },
    {
      title: 'REFUND REQUESTS',
      count: '3',
      items: [
        { label: 'PRODUCT ISSUES', value: '2', color: 'text-gray-500' },
        { label: 'SERVICE COMPLAINTS', value: '1', color: 'text-red-500' },
        { label: 'PROCESSING TIME', value: '2-3 days', color: 'text-red-500' },
        { label: 'TOTAL AMOUNT', value: '$1,250', color: 'text-gray-500' }
      ],
      highlight: 'REFUND REQUESTS MINIMAL - GOOD QUALITY CONTROL'
    },
    {
      title: 'SYSTEM ALERTS',
      count: '5',
      items: [
        { label: 'INVENTORY LOW', value: '2 items', color: 'text-gray-500' },
        { label: 'PAYMENT FAILED', value: '1 order', color: 'text-red-500' },
        { label: 'SCHEDULE CONFLICT', value: '1 booking', color: 'text-red-500' },
        { label: 'BACKUP OVERDUE', value: '1 system', color: 'text-gray-500' }
      ],
      activity: 'SYSTEM ALERTS ACTIVE - MONITOR CLOSELY'
    }
  ];

  // Handle card click navigation
  const handleCardClick = (cardTitle: string) => {
    switch (cardTitle) {
      case 'PENDING REVIEWS':
        navigate('/admin/reviews');
        break;
      case 'ORDER FORMS':
        navigate('/admin/clients');
        break;
      case 'TIER UPGRADES':
        navigate('/admin/clients');
        break;
      case 'AFFILIATE REQUESTS':
        navigate('/admin/settings');
        break;
      case 'REFUND REQUESTS':
        navigate('/admin/revenue');
        break;
      case 'SYSTEM ALERTS':
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
        <AdminHeader title="PENDING ITEMS" showBack onBack={() => window.history.back()} />
        
        <div className="pb-6 px-4">
          <div className="max-w-md mx-auto">
            <div className="grid grid-cols-2 gap-4">
              {pendingStats.map((stat, index) => (
                <StatsCard key={index} data={stat} onCardClick={handleCardClick} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

