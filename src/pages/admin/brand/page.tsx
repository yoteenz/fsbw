
import { useState } from 'react';
import AdminHeader from '../components/AdminHeader';

export default function AdminBrand() {
  const [brandMetrics] = useState({
    retention: '94%',
    referralRate: '23%',
    repeatBookings: '78%',
    growthRate: '+15%',
    brandScore: 94,
    marketPenetration: '15%'
  });

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
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
        <AdminHeader title="BRAND" showBack onBack={() => window.history.back()} />
        
        <div className="pb-6 px-4">
          <div className="max-w-md mx-auto space-y-4">
            <div className="bg-white/60 backdrop-blur-sm border border-black p-4" style={{ borderWidth: '1.4px' }}>
              <h2 className="text-lg font-bold mb-4 font-futura" style={{ color: '#EB1C24' }}>
                BRAND PERFORMANCE
              </h2>
              
              <div className="text-center mb-4">
                <div className="text-4xl font-bold mb-2 font-futura" style={{ color: '#EB1C24' }}>
                  {brandMetrics.brandScore}%
                </div>
                <div className="text-sm font-futura text-gray-600">OVERALL BRAND SCORE</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold font-futura" style={{ color: '#EB1C24' }}>
                    {brandMetrics.retention}
                  </div>
                  <div className="text-xs font-futura text-gray-600">CLIENT RETENTION</div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold font-futura" style={{ color: '#EB1C24' }}>
                    {brandMetrics.referralRate}
                  </div>
                  <div className="text-xs font-futura text-gray-600">REFERRAL RATE</div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold font-futura" style={{ color: '#EB1C24' }}>
                    {brandMetrics.repeatBookings}
                  </div>
                  <div className="text-xs font-futura text-gray-600">REPEAT BOOKINGS</div>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-bold font-futura" style={{ color: '#22c55e' }}>
                    {brandMetrics.growthRate}
                  </div>
                  <div className="text-xs font-futura text-gray-600">GROWTH RATE</div>
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm border border-black p-4" style={{ borderWidth: '1.4px' }}>
              <h3 className="text-sm font-bold mb-3 font-futura" style={{ color: '#EB1C24' }}>RECENT ACHIEVEMENTS</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs font-futura">REVENUE TARGET EXCEEDED</span>
                  <span className="text-xs font-futura text-green-600">✓ ACHIEVED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-futura">94% RETENTION MILESTONE</span>
                  <span className="text-xs font-futura text-green-600">✓ ACHIEVED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs font-futura">15% QUARTERLY GROWTH</span>
                  <span className="text-xs font-futura text-green-600">✓ ACHIEVED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

