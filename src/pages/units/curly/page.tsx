import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MouseEvent } from 'react';

function CurlyUnitsPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([
    {
      id: 'soft-curl-curly',
      name: 'SOFT CURL',
      price: 780,
      image: '/assets/NOIR/curl-thumb.png',
      length: '24"',
      hairOrigin: 'VIETNAMESE',
      inCart: false
    },
    {
      id: 'ocean-curl-curly',
      name: 'OCEAN CURL',
      price: 780,
      image: '/assets/NOIR/curl-thumb.png',
      length: '24"',
      hairOrigin: 'VIETNAMESE',
      inCart: false
    }
  ]);

  const formatPrice = (price: number): { __html: string } => {
    if (!price || isNaN(price)) {
      return { __html: '$0 USD' };
    }
    return { __html: '$' + price.toString() + ' USD' };
  };

  const handleAddToCart = (product: any, e?: MouseEvent<HTMLDivElement>) => {
    if (e) {
      e.stopPropagation(); // Prevent card click when clicking cart icon
    }
    console.log('Add to cart clicked for:', product.name);
    // Toggle the inCart state
    setProducts(prevProducts => 
      prevProducts.map(p => 
        p.id === product.id ? { ...p, inCart: !p.inCart } : p
      )
    );
  };

  const handleCardClick = (product: any) => {
    if (product.name === 'NOIR') {
      navigate('/units/noir');
    }
  };

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      {/* Roses Background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/roses.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
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
              <button className="cursor-pointer" style={{ transform: 'translateX(-2px)' }}>
                <img
                  alt="Search icon"
                  width="16"
                  height="15"
                  src="/assets/search-icon.svg"
                />
              </button>
            </div>

            {/* Text in the middle */}
            <p className="text-sm" style={{ fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif' }}>
              <span 
                style={{ fontFamily: '"Futura PT Book", futuristic-pt, Futura, Inter, sans-serif', fontWeight: '400', cursor: 'pointer' }}
                onClick={() => navigate('/build-a-wig')}
              >
                UNITS &gt;
              </span>{' '}
              <span
                style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontWeight: '500' }}
              >
                CURLY
              </span>
            </p>

            {/* Right side icons */}
            <div className="gap-5 flex absolute" style={{ right: '17px' }}>
              <div style={{ position: 'relative', width: '22px', height: '19px' }}>
                <img 
                  src="/assets/inactive cart-icon.svg"
                  alt="Cart"
                  width={22}
                  height={19}
                  style={{ width: '22px', height: '19px' }}
                />
              </div>
              <img
                alt="Menu"
                width="17"
                height="18"
                className="cursor-pointer"
                src="/assets/menu-icon.svg"
              />
            </div>
          </div>

          {/* PRODUCT CARDS GRID */}
          <div 
            style={{ 
              width: '100%', 
              display: 'flex',
              flexWrap: 'wrap',
              gap: '28px',
              paddingTop: '10px',
              justifyContent: 'center'
            }}
          >
            {products && products.length > 0 ? products.map((product, index) => {
              if (!product || !product.id) {
                return null;
              }
              
              const isStaggered = index % 2 === 1; // Stagger every other card (1st, 3rd cards are staggered)
              
              return (
                <div
                  key={product.id}
                  style={{
                    position: 'relative',
                    width: 'calc(50% - 15px)',
                    minWidth: '160px',
                    maxWidth: '300px'
                  }}
                >
                  <div
                    className="relative border border-black"
                    style={{
                      borderWidth: '1.3px',
                      padding: '10px 6px 14px 6px',
                      textAlign: 'center',
                      backgroundColor: '#f5f5f5',
                      backgroundImage: `url('/assets/marble bg.png')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      transform: isStaggered ? 'translateY(20px)' : 'translateY(0px)',
                      transition: 'transform 0.3s ease',
                      cursor: product.name === 'NOIR' ? 'pointer' : 'default'
                    }}
                    onClick={() => handleCardClick(product)}
                  >
                    {/* Shopping Bag Icon */}
                    <div 
                      style={{ 
                        position: 'absolute', 
                        top: '8px',
                        ...(index % 2 === 0 ? { left: '12px' } : { right: '12px' }),
                        cursor: 'pointer',
                        zIndex: 10,
                        width: '20px',
                        height: '23px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onClick={(e) => handleAddToCart(product, e)}
                    >
                      {product.inCart ? (
                        <img
                          src="/assets/card-added.svg"
                          alt="In cart"
                          width={20}
                          height={23}
                          style={{ width: '20px !important', height: '23px !important' }}
                        />
                      ) : (
                        <img
                          src="/assets/card-add.svg"
                          alt="Add to cart"
                          width={20}
                          height={23}
                          style={{ width: '20px !important', height: '23px !important' }}
                        />
                      )}
                    </div>

                    {/* Product Image */}
                    <div style={{ textAlign: 'center', marginTop: '0', marginBottom: '0' }}>
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: 'auto',
                          marginBottom: '10px',
                          marginLeft: '5px',
                          marginTop: '0'
                        }}
                      />
                    </div>

                    {/* Product Name */}
                    <p
                      style={{
                        fontFamily: '"Covered By Your Grace", cursive',
                        fontSize: product.name === 'NOIR' ? '19px' : '18px',
                        color: 'black',
                        textTransform: 'uppercase',
                        margin: '-10px 0 -3px 0',
                        fontWeight: '500'
                      }}
                    >
                      {product.name}
                    </p>

                    {/* Hair Details */}
                    <p
                      style={{
                        fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                        fontSize: '10px',
                        color: '#EB1C24',
                        textTransform: 'uppercase',
                        margin: '0 0 5px 0',
                        fontWeight: '500',
                        lineHeight: '0.84'
                      }}
                    >
                      {product.length} RAW {product.hairOrigin}
                    </p>

                    {/* Price */}
                    <p
                      style={{
                        fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                        fontSize: '12px',
                        color: 'black',
                        textTransform: 'uppercase',
                        margin: '0 0 5px 0',
                        fontWeight: '500',
                        lineHeight: '0.84'
                      }}
                      dangerouslySetInnerHTML={formatPrice(product.price)}
                    />

                    {/* Star Ratings */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginTop: '2px', marginBottom: '0' }}>
                      {[...Array(5)].map((_, index) => (
                        <img
                          key={index}
                          src="/assets/NOIR/star-symbol.png"
                          alt="Star Rating"
                          style={{ 
                            width: '10px', 
                            height: '10px',
                            filter: 'drop-shadow(0 0 0 1px black)',
                            stroke: '1px black'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            }).filter(Boolean) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CurlyUnitsPage;

