
interface DiamondDividerProps {
  className?: string;
  color?: string;
}

export function DiamondDivider({ className = '', color = 'rgba(0,0,0,0.15)' }: DiamondDividerProps) {
  return (
    <div className={`flex items-center w-full ${className}`}>
      <div className="flex-1 h-px" style={{ background: color }} />
      <svg
        className="mx-3 flex-shrink-0"
        width="8"
        height="8"
        viewBox="0 0 8 8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M4 0L8 4L4 8L0 4L4 0Z" fill={color} />
      </svg>
      <div className="flex-1 h-px" style={{ background: color }} />
    </div>
  );
}
