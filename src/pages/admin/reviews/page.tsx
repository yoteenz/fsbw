import { useState } from 'react';
import AdminHeader from '../components/AdminHeader';
import { pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';

const REVIEW_TABS = ['ALL', 'PENDING', 'PUBLISHED'] as const;

export default function AdminReviews() {
  const [activeTab, setActiveTab] = useState<typeof REVIEW_TABS[number]>('ALL');
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
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/marble-half.png')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed',
        }}
      />
      <div className="relative z-10" style={{ textTransform: 'uppercase' }}>
        <AdminHeader
          title="REVIEWS"
          showBack
          onBack={() => window.history.back()}
          breadcrumbParentLabel="ADMIN"
          breadcrumbParentPath="/admin/dashboard"
        />

        <div className="pb-6 px-4">
          <div className="max-w-md mx-auto">
            {/* Main card */}
            <div
              className="bg-white/60 backdrop-blur-sm border border-black overflow-hidden"
              style={{ borderWidth: '1.3px', minHeight: 'calc(100vh * 520 / 745 + 7px)' }}
            >
              <div className="flex items-center justify-between -mt-1 pb-1 px-4 pt-4" style={{ marginBottom: 0 }}>
                <h2
                  className="flex-1"
                  style={{
                    fontFamily: '"Futura PT Medium"',
                    color: '#EB1C24',
                    fontSize: '12px',
                    fontWeight: 500,
                    margin: 0,
                    textTransform: 'uppercase',
                    textAlign: 'left',
                  }}
                >
                  REVIEWS
                </h2>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginLeft: '8px' }}>
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="#EB1C24" />
                </svg>
              </div>
              <div style={{ borderBottom: '1px solid #e5e7eb', marginLeft: '20px', marginRight: '20px', marginBottom: '10px' }} />

              <div className="flex px-5">
                {REVIEW_TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className="flex-1 py-3 font-medium transition-colors"
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '11px',
                      color: activeTab === tab ? '#EB1C24' : '#808080',
                      border: 'none',
                      paddingBottom: '4px',
                      background: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        borderBottom: activeTab === tab ? '1px solid #EB1C24' : '1px solid transparent',
                        paddingBottom: '4px',
                      }}
                    >
                      {tab}
                    </span>
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="px-5 pb-6 overflow-y-auto" style={{ maxHeight: '380px' }}>
                {activeTab === 'ALL' && (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                        <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>4.8</p>
                        <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>AVERAGE RATING</p>
                      </div>
                      <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                        <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>247</p>
                        <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>TOTAL REVIEWS</p>
                      </div>
                    </div>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>RECENT REVIEWS</h3>
                    <div className="space-y-0">
                      {reviews.filter((r) => r.status === 'published' || r.status === 'pending').map((review) => (
                        <div key={review.id} className="py-3" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#EB1C24' }}>{review.client}</p>
                              <div className="flex items-center gap-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} style={{ color: i < review.rating ? '#EB1C24' : '#ccc', fontSize: '10px' }}>★</span>
                                ))}
                              </div>
                            </div>
                            <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#808080' }}>{review.date}</span>
                          </div>
                          <p className="mt-1" style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#808080' }}>{review.product}</p>
                          <p className="mt-1" style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000' }}>{review.review}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#808080' }}>{review.photos} photos</span>
                            <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{review.status.toUpperCase()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {activeTab === 'PENDING' && (
                  <div className="py-6 text-center">
                    <p style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#808080' }}>No pending reviews at this time.</p>
                  </div>
                )}
                {activeTab === 'PUBLISHED' && (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center py-3" style={{ backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: '4px' }}>
                        <p className="font-covered-by-your-grace text-xl" style={{ color: '#EB1C24' }}>{reviews.filter((r) => r.status === 'published').length}</p>
                        <p className="text-xs font-futura" style={{ color: '#808080', marginTop: '4px' }}>PUBLISHED</p>
                      </div>
                    </div>
                    <h3 style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '11px', marginBottom: '8px' }}>PUBLISHED REVIEWS</h3>
                    <div className="space-y-0">
                      {reviews.filter((r) => r.status === 'published').map((review) => (
                        <div key={review.id} className="py-3" style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <div className="flex justify-between items-start">
                            <div>
                              <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#EB1C24' }}>{review.client}</p>
                              <div className="flex items-center gap-1 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} style={{ color: i < review.rating ? '#EB1C24' : '#ccc', fontSize: '10px' }}>★</span>
                                ))}
                              </div>
                            </div>
                            <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#808080' }}>{review.date}</span>
                          </div>
                          <p className="mt-1" style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#808080' }}>{review.product}</p>
                          <p className="mt-1" style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#000' }}>{review.review}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#808080' }}>{review.photos} photos</span>
                            <span style={{ fontFamily: '"Futura PT Book"', fontSize: '11px', color: '#EB1C24' }}>{review.status.toUpperCase()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {}}
              className="w-full py-2 border border-black font-medium cursor-pointer hover:bg-gray-50"
              style={{ ...pageActionButtonStyle, marginTop: '14px' }}
            >
              APPROVE PENDING REVIEWS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

