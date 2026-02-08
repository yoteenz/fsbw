
interface ThumbBoxProps {
  image: string;
  title: string;
  label: string;
  isSelected?: boolean;
  onClick?: () => void;
  imgSize?: number;
  containerSize?: number;
  className?: string;
  topPosition?: string; // New prop for custom positioning
  colorCode?: string; // New prop for color swatches
  customTransform?: string; // New prop for custom transform
  textDisplay?: string; // New prop for text display instead of image
  isDisabled?: boolean; // New prop for disabled state
}

export default function ThumbBox({
  image,
  title,
  label,
  isSelected = false,
  onClick,
  imgSize = 85,
  containerSize = 60,
  className = '',
  topPosition = '55%', // Original repository positioning
  colorCode,
  customTransform,
  textDisplay,
  isDisabled = false
}: ThumbBoxProps) {
  console.log(`ThumbBox ${label}: isDisabled=${isDisabled}, isSelected=${isSelected}`);
  return (
    <div
      className={`border relative text-center ${
        isDisabled ? 'cursor-not-allowed opacity-30 bg-gray-200' : 'cursor-pointer bg-white'
      } ${
        isDisabled ? 'border-gray-500' : isSelected ? 'border-[#EB1C24]' : 'border-black'
      } ${className}`}
      style={{
        borderWidth: '1.3px',
        width: `${containerSize}px`,
        height: `${containerSize + 20}px`,
        boxSizing: 'border-box',
        padding: '0',
        overflow: 'visible',
        pointerEvents: isDisabled ? 'none' : 'auto'
      }}
      onClick={isDisabled ? undefined : onClick}
    >
      <p
        className="text-[12px] md:text-base text-black absolute top-0 left-1/2 transform -translate-x-1/2 w-full"
        style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif' }}
      >
        {title}
      </p>
      <div
        className="absolute left-1/2 transform -translate-x-1/2 z-[99999] flex items-center justify-center"
        style={{
          width: `${imgSize}px`,
          height: `${imgSize}px`,
          overflow: imgSize > containerSize ? 'hidden' : 'visible',
          top: topPosition,
          transform: customTransform || 'translateX(-50%) translateY(-50%)'
        }}
      >
        {textDisplay ? (
          <div
            className={isSelected ? "styling-text-selected" : "styling-text-display"}
            data-font={isSelected ? "futura-pt-medium" : "futura-pt-book"}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              fontSize: '24px',
              color: isDisabled ? '#9CA3AF' : isSelected ? '#EB1C24' : '#000000'
            }}
          >
            {textDisplay}
          </div>
        ) : colorCode ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#909090',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            <div
              style={{
                width: '81%',
                height: '81%',
                backgroundColor: '#FFFFFF',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div
                style={{
                  width: '76%',
                  height: '76%',
                  backgroundColor: colorCode,
                  borderRadius: '50%'
                }}
              />
            </div>
          </div>
        ) : (
          <img
            alt="Card image"
            src={image}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              position: 'relative'
            }}
          />
        )}
      </div>
        <p
          className={`absolute bottom-[-6.9px] md:bottom-[-10px] left-1/2 transform -translate-x-1/2 text-[9px] w-full md:text-xs font-medium text-center ${
            isDisabled ? 'text-gray-400' : isSelected ? 'text-[#EB1C24]' : 'text-black'
          }`}
          style={{ fontFamily: '"Futura PT Medium"' }}
        >
          {label}
        </p>
    </div>
  );
}










