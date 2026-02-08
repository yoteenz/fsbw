
import { useState } from 'react';

export default function ActivityFeed() {
  const [showAll, setShowAll] = useState(false);
  const [activities] = useState([
    {
      id: 1,
      type: 'ALERTS',
      title: 'ORDER FORM (24 HOURS)',
      subtitle: 'SARAH M.',
      timestamp: '2 MIN AGO',
      exactTime: '3:45 PM',
      category: 'ALERTS',
      urgency: 'urgent'
    },
    {
      id: 2,
      type: 'ORDERS',
      title: 'RUSH ORDER',
      subtitle: 'ORDER #17',
      timestamp: '5 MIN AGO',
      exactTime: '3:42 PM',
      category: 'ORDERS',
      urgency: 'urgent'
    },
    {
      id: 35,
      type: 'ORDERS',
      title: 'BULK ORDER PROCESSING',
      subtitle: 'ORDER #23',
      timestamp: '8 MIN AGO',
      exactTime: '3:39 PM',
      category: 'ORDERS',
      urgency: 'medium'
    },
    {
      id: 36,
      type: 'ORDERS',
      title: 'ORDER MODIFICATION REQUEST',
      subtitle: 'ORDER #19',
      timestamp: '12 MIN AGO',
      exactTime: '3:35 PM',
      category: 'ORDERS',
      urgency: 'medium'
    },
    {
      id: 3,
      type: 'SALES',
      title: 'CONSULTATION BOOKED',
      subtitle: 'MARIA R.',
      timestamp: '15 MIN AGO',
      exactTime: '3:32 PM',
      category: 'SALES',
      urgency: 'medium'
    },
    {
      id: 37,
      type: 'SALES',
      title: 'PAYMENT RECEIVED',
      subtitle: '$1,250',
      timestamp: '18 MIN AGO',
      exactTime: '3:29 PM',
      category: 'SALES',
      urgency: 'medium'
    },
    {
      id: 38,
      type: 'SALES',
      title: 'QUOTE APPROVED',
      subtitle: 'ENTERPRISE CLIENT',
      timestamp: '22 MIN AGO',
      exactTime: '3:25 PM',
      category: 'SALES',
      urgency: 'medium'
    },
    {
      id: 4,
      type: 'CLIENTS',
      title: 'NEW REFERRAL',
      subtitle: 'ASHLEY K.',
      timestamp: '23 MIN AGO',
      exactTime: '3:24 PM',
      category: 'CLIENTS',
      urgency: 'medium'
    },
    {
      id: 5,
      type: 'BOOKINGS',
      title: 'FOLLOW‑UP SCHEDULED',
      subtitle: 'LISA W.',
      timestamp: '1 HOUR AGO',
      exactTime: '2:47 PM',
      category: 'BOOKINGS',
      urgency: 'low'
    },
    {
      id: 39,
      type: 'BOOKINGS',
      title: 'APPOINTMENT CONFIRMED',
      subtitle: 'MICHAEL T.',
      timestamp: '1 HOUR AGO',
      exactTime: '2:45 PM',
      category: 'BOOKINGS',
      urgency: 'low'
    },
    {
      id: 40,
      type: 'BOOKINGS',
      title: 'BOOKING CANCELLATION',
      subtitle: 'JENNIFER S.',
      timestamp: '1 HOUR AGO',
      exactTime: '2:42 PM',
      category: 'BOOKINGS',
      urgency: 'medium'
    },
    {
      id: 6,
      type: 'REVIEWS',
      title: 'NEW 5‑STAR REVIEW',
      subtitle: 'SAMANTHA: NOIR',
      timestamp: '2 HOURS AGO',
      exactTime: '1:47 PM',
      category: 'REVIEWS',
      urgency: 'low'
    },
    {
      id: 7,
      type: 'SITE_CHANGES',
      title: 'ADMIN SETTINGS',
      subtitle: 'UPDATED',
      timestamp: '3 HOURS AGO',
      exactTime: '12:47 PM',
      category: 'SYSTEM',
      urgency: 'low'
    },
    {
      id: 8,
      type: 'CLIENTS',
      title: 'CLIENT PROFILE UPDATED',
      subtitle: 'JENNIFER D.',
      timestamp: '4 HOURS AGO',
      exactTime: '11:47 AM',
      category: 'CLIENTS',
      urgency: 'low'
    },
    {
      id: 9,
      type: 'ORDERS',
      title: 'ORDER SHIPPED',
      subtitle: '#ORD-2024-089',
      timestamp: '5 HOURS AGO',
      exactTime: '10:47 AM',
      category: 'ORDERS',
      urgency: 'low'
    },
    {
      id: 10,
      type: 'SALES',
      title: 'PAYMENT RECEIVED',
      subtitle: '$850',
      timestamp: '6 HOURS AGO',
      exactTime: '9:47 AM',
      category: 'SALES',
      urgency: 'low'
    }
  ]);

  // Show only first 5 activities when showAll is false
  const displayedActivities = showAll ? activities : activities.slice(0, 5);

  // Get urgency color for left border line
  const getUrgencyLineColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return '#EB1C24'; // Red for urgent
      case 'medium':
        return '#ffa500'; // Orange for medium
      case 'low':
      default:
        return '#909090'; // Gray for low or default
    }
  };

  return (
    <div>
      {/* Activity Feed */}
      <div className="bg-white/60 backdrop-blur-sm border border-black shadow-lg hover:shadow-xl transition-all duration-300 ease-out" style={{ borderWidth: '1.4px' }}>
        {/* Recent Activity Header - inside the card with border bottom */}
        <div className="px-3 pt-3 pb-2 border-b border-gray-200">
          <h2 className="text-black font-futura tracking-wider" style={{ fontWeight: '500', fontSize: '12px' }}>
            RECENT ACTIVITY
          </h2>
        </div>

        <div className="p-3 space-y-3">
          {displayedActivities.map((activity) => {
            const lineColor = getUrgencyLineColor(activity.urgency);
            return (
              
              <div key={activity.id} className="relative">
                {/* Category header ABOVE the colored line, inside the card */}
                <div className="mb-1">
                  <span className="text-red-500 font-futura tracking-wider" style={{ fontWeight: '500', color: '#EB1C24', fontSize: '10px' }}>
                    {activity.category}
                  </span>
                </div>
                
                {/* Content with colored left border and timestamp - aligned on same line */}
                <div className="flex items-center justify-between border-l-2 pl-3" style={{ borderColor: lineColor }}>
                  {/* Left side - Title and subtitle stacked */}
                  <div className="flex-1 min-w-0">
                    <div 
                      className="uppercase text-xs tracking-wider font-futura"
                      style={{ color: '#909090', fontWeight: '600', fontSize: '9px' }}
                    >
                      {activity.title}
                    </div>
                    <div className="text-xs font-covered-by-your-grace" style={{ color: '#000000' }}>
                      {activity.subtitle}
                    </div>
                  </div>

                  {/* Right side - Exact time aligned with title */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-xs font-futura" style={{ color: '#000000', fontSize: '9px', fontWeight: '500' }}>
                      {activity.exactTime.replace(' ', '')}
                    </div>
                    <div className="text-xs font-covered-by-your-grace" style={{ color: '#909090' }}>
                      {activity.timestamp}
                    </div>
                  </div>
                </div>
              </div>
              
            );
          })}
        </div>

        {/* View More/Less Button */}
        {activities.length > 5 && (
          <div className="px-3 pb-1 pt-1">
            <button
              onClick={() => setShowAll(!showAll)}
              className="w-full text-center py-1 border-t border-gray-200 transition-colors font-covered-by-your-grace"
              style={{ color: '#EB1C24', fontWeight: '500', fontSize: '12px' }}
            >
              {showAll ? 'VIEW LESS' : `VIEW MORE (${activities.length - 5} MORE)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
