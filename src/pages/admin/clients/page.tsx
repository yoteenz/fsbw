import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminHeader from '../components/AdminHeader';
import StatsCard from '../components/StatsCard';

export default function AdminClients() {
  const navigate = useNavigate();

  const clientStats = [
    {
      title: 'TOTAL CLIENTS',
      count: '89',
      items: [
        { label: 'ACTIVE CLIENTS', value: '76', color: 'text-gray-500' },
        { label: 'NEW CLIENTS', value: '13', color: 'text-red-500' },
        { label: 'VIP MEMBERS', value: '23', color: 'text-red-500' },
        { label: 'BLACK TIER', value: '8', color: 'text-gray-500' }
      ],
      highlight: 'CLIENT BASE GROWING - HIGH RETENTION RATE',
      tiers: [
        { label: 'VIP', value: '23', color: 'text-red-500' },
        { label: 'PREM', value: '34', color: 'text-red-500' },
        { label: 'BASIC', value: '32', color: 'text-gray-500' }
      ]
    },
    {
      title: 'CLIENT ACTIVITY',
      count: '156',
      items: [
        { label: 'ORDERS THIS MONTH', value: '47', color: 'text-gray-500' },
        { label: 'CONSULTATIONS', value: '23', color: 'text-red-500' },
        { label: 'FOLLOW-UPS', value: '34', color: 'text-red-500' },
        { label: 'REFERRALS', value: '12', color: 'text-gray-500' }
      ],
      activity: 'HIGH CLIENT ENGAGEMENT - STRONG ACTIVITY LEVELS'
    },
    {
      title: 'MEMBERSHIP TIERS',
      count: '3',
      items: [
        { label: 'BLACK TIER', value: '8 clients', color: 'text-gray-500' },
        { label: 'VIP MEMBERS', value: '23 clients', color: 'text-red-500' },
        { label: 'PREMIUM', value: '34 clients', color: 'text-red-500' },
        { label: 'BASIC', value: '32 clients', color: 'text-gray-500' }
      ],
      highlight: 'TIER DISTRIBUTION OPTIMAL - PREMIUM FOCUS'
    },
    {
      title: 'CLIENT SATISFACTION',
      count: '4.8',
      items: [
        { label: 'AVERAGE RATING', value: '4.8/5', color: 'text-gray-500' },
        { label: 'POSITIVE REVIEWS', value: '94%', color: 'text-red-500' },
        { label: 'RETENTION RATE', value: '87%', color: 'text-red-500' },
        { label: 'REFERRAL RATE', value: '23%', color: 'text-gray-500' }
      ],
      activity: 'EXCELLENT CLIENT SATISFACTION - HIGH RETENTION'
    },
    {
      title: 'RECENT ACTIVITY',
      count: '12',
      items: [
        { label: 'NEW SIGNUPS', value: '5 today', color: 'text-gray-500' },
        { label: 'BOOKINGS', value: '8 this week', color: 'text-red-500' },
        { label: 'ORDERS', value: '12 pending', color: 'text-red-500' },
        { label: 'FOLLOW-UPS', value: '6 due', color: 'text-gray-500' }
      ],
      highlight: 'ACTIVE CLIENT INTERACTION - REGULAR ENGAGEMENT'
    },
    {
      title: 'CLIENT VALUE',
      count: '$2.1K',
      items: [
        { label: 'AVERAGE ORDER', value: '$861', color: 'text-gray-500' },
        { label: 'LIFETIME VALUE', value: '$2,100', color: 'text-red-500' },
        { label: 'MONTHLY REVENUE', value: '$45.7K', color: 'text-red-500' },
        { label: 'GROWTH RATE', value: '+15%', color: 'text-gray-500' }
      ],
      activity: 'HIGH CLIENT VALUE - STRONG REVENUE GENERATION'
    }
  ];

  // Handle card click navigation
  const handleCardClick = (cardTitle: string) => {
    switch (cardTitle) {
      case 'TOTAL CLIENTS':
        navigate('/admin/clients/account');
        break;
      case 'CLIENT ACTIVITY':
        navigate('/admin/meetings');
        break;
      case 'MEMBERSHIP TIERS':
    navigate('/admin/clients/account');
        break;
      case 'CLIENT SATISFACTION':
        navigate('/admin/reviews');
        break;
      case 'RECENT ACTIVITY':
        navigate('/admin/meetings');
        break;
      case 'CLIENT VALUE':
        navigate('/admin/revenue');
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
        <AdminHeader title="CLIENTS" showBack onBack={() => window.history.back()} />
        
        <div className="pb-6 px-4">
          <div className="max-w-md mx-auto">
            <div className="grid grid-cols-2 gap-4">
              {clientStats.map((stat, index) => (
                <StatsCard key={index} data={stat} onCardClick={handleCardClick} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}