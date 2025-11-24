
import { useState } from 'react';
import AdminHeader from '../components/AdminHeader';

export default function AdminReviews() {
  const [reviews] = useState([
    {
      id: 1,
      client: 'SARAH JOHNSON',
      rating: 5,
      product: 'SOFT WAVE 30"',
      review: 'Absolutely love this wig! The quality is amazing and it looks so natural. Installation was perfect and the aftercare instructions were very helpful.',
      date: '2/6/2025',
      status: 'published',
      photos: 2
    },
    {
      id: 2,
      client: 'MARIA RODRIGUEZ',
      rating: 5,
      product: 'NOIR 26"',
      review: 'Best wig experience ever! Professional service and the wig exceeded my expectations. Will definitely be coming back.',
      date: '2/5/2025',
      status: 'published',
      photos: 1
    },
    {
      id: 3,
      client: 'ASHLEY WILLIAMS',
      rating: 4,
      product: 'CURLY 28"',
      review: 'Great quality wig and excellent customer service. The curl pattern is perfect and very natural looking.',
      date: '2/4/2025',
      status: 'published',
      photos: 3
    }
  ]);

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
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
        <AdminHeader title="REVIEWS" showBack onBack={() => window.history.back()} />
        
        <div className="pb-6 px-4">
          <div className="max-w-md mx-auto space-y-4">
            <div className="bg-white/60 backdrop-blur-sm border border-black p-4" style={{ borderWidth: '1.4px' }}>
              <h2 className="text-lg font-bold mb-4" style={{ fontFamily: '"Covered By Your Grace", cursive', color: '#EB1C24' }}>
                REVIEW OVERVIEW
              </h2>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold" style={{ fontFamily: '"Covered By Your Grace", cursive' }}>4.8</div>
                  <div className="text-xs font-futura text-gray-600">AVERAGE RATING</div>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ fontFamily: '"Covered By Your Grace", cursive' }}>247</div>
                  <div className="text-xs font-futura text-gray-600">TOTAL REVIEWS</div>
                </div>
              </div>
            </div>

            {reviews.map((review) => (
              <div key={review.id} className="bg-white/60 backdrop-blur-sm border border-black p-4" style={{ borderWidth: '1.4px' }}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-sm font-futura">{review.client}</h3>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} style={{ color: i < review.rating ? '#EB1C24' : '#ccc' }}>★</span>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 font-futura">{review.date}</span>
                </div>
                
                <p className="text-xs text-gray-700 font-futura mb-2">{review.product}</p>
                <p className="text-sm text-black font-futura mb-2">{review.review}</p>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600 font-futura">{review.photos} photos</span>
                  <span className="text-xs text-green-600 font-futura uppercase">{review.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

