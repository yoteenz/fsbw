import { useState } from 'react';
import CartDropdown from './CartDropdown';

interface DynamicCartIconProps {
  count: number;
  size?: number;
  width?: number;
  height?: number;
  className?: string;
}

export default function DynamicCartIcon({ count, size = 23, width, height, className = "" }: DynamicCartIconProps) {
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  
  // Use separate width/height if provided, otherwise use size for both
  // For active cart (count > 0), use original size. For inactive cart (count = 0), use provided width/height
  const iconWidth = count > 0 ? size : (width || size);
  const iconHeight = count > 0 ? size : (height || size);
  
  const handleCartClick = () => {
    console.log('Cart icon clicked, current state:', showCartDropdown);
    setShowCartDropdown(!showCartDropdown);
    console.log('Cart dropdown state toggled to:', !showCartDropdown);
  };

  const handleCloseCart = () => {
    setShowCartDropdown(false);
  };
  
  return (
    <>
      <div 
        className={`relative cursor-pointer ${className}`} 
        data-cart-icon="true"
        style={{ 
          width: iconWidth, 
          height: iconHeight, 
          minWidth: iconWidth, 
          minHeight: iconHeight, 
          maxWidth: iconWidth, 
          maxHeight: iconHeight,
          transform: count === 0 ? 'translateY(-2px)' : 'translateY(1px)',
          zIndex: 10
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleCartClick();
        }}
      >
        {/* Cart bag icon - use active-bag-icon.svg when count > 0, inactive cart-icon.svg when count = 0 */}
        <img 
          src={count > 0 ? "/assets/active-bag-icon.svg" : "/assets/inactive cart-icon.svg"}
          alt="Cart"
          width={iconWidth}
          height={iconHeight}
          className="relative"
          style={{ width: iconWidth, height: iconHeight, minWidth: iconWidth, minHeight: iconHeight, maxWidth: iconWidth, maxHeight: iconHeight }}
        />
        
        {/* Dynamic count text - positioned perfectly in the center of the red circle */}
        {count > 0 && (
          <div 
            className="absolute text-white flex items-center justify-center"
            style={{
              fontSize: Math.max(8, Math.min(iconWidth, iconHeight) * 0.3) + 2,
              fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
              fontWeight: '400',
              // Position the text in the center of the red circle on the bag icon
              // The red circle is typically in the bottom-right area of the bag icon
              top: '60%',
              left: '70%',
              transform: 'translate(calc(-50% + 0px), calc(-50% + 3.5px))',
              textShadow: 'none',
              lineHeight: '1',
              width: '12px',
              height: '12px'
            }}
          >
            {count > 99 ? '99+' : count}
          </div>
        )}
      </div>

      {/* Cart Dropdown */}
      <CartDropdown 
        isOpen={showCartDropdown}
        onClose={handleCloseCart}
        cartCount={count}
      />
    </>
  );
}
