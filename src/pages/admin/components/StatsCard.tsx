import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface StatsItem {
  label: string;
  value: string;
  /** Optional Tailwind colour class (e.g. "text-red-500") */
  color?: string;
}

interface StatsCardData {
  title: string;
  /** The main numeric/value displayed next to the title */
  count: string | number;
  items: StatsItem[];
  /** Optional additional row positioned below the items */
  tiers?: StatsItem[];
  /** Optional highlighted text shown under the items */
  highlight?: string;
  /** Optional activity text shown under the items */
  activity?: string;
  /** Optional actions displayed as buttons – label is displayed, action is an identifier */
  actions?: Array<{ label: string; action: string }>;
}

interface StatsCardProps {
  /** All data required to render the card – see `StatsCardData` */
  data: StatsCardData;
  /** Optional callback for card click */
  onCardClick?: (title: string) => void;
}

/**
 * StatsCard – a compact, scroll‑able information card.
 *
 * The component defensively guards against missing / malformed data
 * and provides minimal, readable error handling.
 */
export default function StatsCard({ data, onCardClick }: StatsCardProps) {
  const navigate = useNavigate();

  // ----- Defensive defaults -------------------------------------------------
  const items: StatsItem[] = Array.isArray(data.items) ? data.items : [];
  const tiers: StatsItem[] = Array.isArray(data.tiers) ? data.tiers : [];
  const actions: Array<{ label: string; action: string }> = Array.isArray(
    data.actions
  )
    ? data.actions
    : [];

  // Refs for auto-scrolling elements
  const highlightRef = useRef<HTMLParagraphElement>(null);
  const activityRef = useRef<HTMLParagraphElement>(null);
  const tiersRef = useRef<HTMLDivElement>(null);
  const itemsContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll effect
  useEffect(() => {
    const scrollElements = [
      { ref: highlightRef, content: data.highlight },
      { ref: activityRef, content: data.activity },
      { ref: tiersRef, content: tiers.length > 0 ? "tiers" : null },
      // Removed meetings card items from auto-scroll
      { ref: itemsContainerRef, content: null }
    ];

    const intervals: NodeJS.Timeout[] = [];

    scrollElements.forEach(({ ref, content }) => {
      if (ref.current && content) {
        const element = ref.current;
        
        // Wait a bit for the element to be fully rendered
        setTimeout(() => {
          const scrollWidth = element.scrollWidth;
          const clientWidth = element.clientWidth;

          // Only scroll if content overflows
          if (scrollWidth > clientWidth) {
            let scrollPosition = 0;
            const scrollSpeed = 1; // pixels per step
            const pauseTime = 2000; // pause at start/end in ms
            const scrollInterval = 50; // ms between scroll steps
            let isPaused = false;
            let pauseCounter = 0;
            let direction = 1; // 1 for right, -1 for left

            // Start with a pause
            isPaused = true;
            pauseCounter = pauseTime / scrollInterval;

            const interval = setInterval(() => {
              if (isPaused) {
                pauseCounter--;
                if (pauseCounter <= 0) {
                  isPaused = false;
                }
                return;
              }

              scrollPosition += scrollSpeed * direction;
              
              // Check if we've reached the end (scrolling right)
              if (direction === 1 && scrollPosition >= scrollWidth - clientWidth) {
                scrollPosition = scrollWidth - clientWidth;
                direction = -1; // Change direction to left
                isPaused = true;
                pauseCounter = pauseTime / scrollInterval;
              }
              // Check if we've reached the beginning (scrolling left)  
              else if (direction === -1 && scrollPosition <= 0) {
                scrollPosition = 0;
                direction = 1; // Change direction to right
                isPaused = true;
                pauseCounter = pauseTime / scrollInterval;
              }
              
              element.scrollLeft = scrollPosition;
            }, scrollInterval);

            intervals.push(interval);
          }
        }, 100); // Small delay to ensure element is rendered
      }
    });

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [data.highlight, data.activity, tiers, items, data.title]);

  // Helper: convert color class to actual color value
  const getColorValue = (colorClass?: string) => {
    if (!colorClass) return "#909090";
    
    if (colorClass === "text-red-500") return "#EB1C24";
    if (colorClass === "text-black") return "#000000";
    if (colorClass === "text-gray-500") return "#909090";
    
    return "#909090"; // default fallback
  };

  // Helper: navigation handler for title clicks
  const handleTitleClick = (title: string) => {
    if (onCardClick) {
      onCardClick(title);
      return;
    }

    const titleLower = title.toLowerCase();
    switch (titleLower) {
      case 'clients':
        navigate('/admin/clients');
        break;
      case 'revenue':
        navigate('/admin/revenue');
        break;
      case 'pending':
        navigate('/admin/pending');
        break;
      case 'meetings':
        navigate('/admin/meetings');
        break;
      case 'reviews':
        navigate('/admin/reviews');
        break;
      case 'brand':
        navigate('/admin/product-editor');
        break;
      default:
        console.log(`No navigation defined for: ${title}`);
    }
  };

  // Helper: click handler for actions (console‑only fallback – replace with real logic)
  const handleActionClick = (actionId: string) => {
    try {
      switch (actionId) {
        case 'preferences':
          navigate('/admin/preferences');
          break;
        case 'settings':
          navigate('/admin/settings');
          break;
        default:
          console.info(`Action clicked: ${actionId}`);
          // Insert real action handling here (e.g. callbacks, router navigation, etc.)
      }
    } catch (err) {
      console.error(`Failed to handle action "${actionId}":`, err);
    }
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm border border-black p-4 min-h-[140px] flex flex-col overflow-hidden shadow-lg transition-all duration-300 ease-out" style={{ borderWidth: '1.4px' }}>
      {/* Header with negative top margin to move even higher */}
      <div className="flex items-center justify-between -mt-1">
        <button
          onClick={() => handleTitleClick(data.title)}
          className="text-red-500 font-bold text-lg tracking-wider truncate hover:text-red-600 transition-colors text-left uppercase"
          style={{ fontFamily: '"Covered By Your Grace", cursive', color: '#EB1C24' }}
        >
          {data.title}
        </button>
        <span
          className="text-black font-bold text-lg flex-shrink-0 ml-2 uppercase"
          style={{ fontFamily: '"Covered By Your Grace", cursive' }}
        >
          {data.title === 'BRAND' ? (
            <>
              {data.count.toString().replace('%', '')}
              <span style={{ fontFamily: 'Futura PT Medium, Arial, sans-serif', fontSize: '14px' }}>%</span>
            </>
          ) : (
            data.count
          )}
        </span>
      </div>

      {/* ---------- Body ------------------------------------------------------ */}
      
      <div className="flex-1 flex flex-col overflow-hidden mt-2">
        {/* Items list – auto-scroll for Meetings and Brand cards only */}
        <div className="flex-1 overflow-hidden">
          <div 
            ref={itemsContainerRef}
            className="space-y-2 overflow-x-auto scrollbar-hide"
            style={{ scrollBehavior: "auto" }}
          >
            {items.map((item, idx) => (
              <div key={idx} className="text-[9px] text-left w-max pr-2">
                <span className="text-black font-medium whitespace-nowrap font-futura uppercase" style={{ fontWeight: "500" }}>
                  {item.label}:{" "}
                  {item.label === 'INVENTORY' ? (
                    <>
                      <span className="font-medium font-futura" style={{ fontWeight: "515", color: parseInt(item.value.split('/')[0]) <= 20 ? '#EB1C24' : '#909090' }}>
                        {item.value.split('/')[0]}
                      </span>
                      <span className="font-medium font-futura" style={{ fontWeight: "515", color: getColorValue(item.color) }}>
                        /{item.value.split('/')[1]}
                      </span>
                    </>
                  ) : (
                    <span
                      className="font-medium font-futura uppercase"
                      style={{ fontWeight: "515", color: getColorValue(item.color) }}
                    >
                      {item.value}
                    </span>
                  )}
                </span>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-futura" style={{ fontWeight: "515", color: "#909090" }}>
                      {(item as any).highlight}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-[8px] font-futura" style={ { fontWeight: "515", color: "#909090" }}>
                      {(item as any).activity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom section – highlight, activity, actions */}
        <div className="mt-2 overflow-hidden">
          {/* Highlight */}
          {data.highlight && (
            <div className="pt-1 border-t border-gray-200">
              <p
                ref={highlightRef}
                className="text-red-500 text-[8px] whitespace-nowrap text-left font-futura overflow-x-auto scrollbar-hide uppercase"
                style={{ fontWeight: "515", scrollBehavior: "auto", color: '#EB1C24' }}
              >
                {data.highlight}
              </p>
            </div>
          )}

          {/* Activity */}
          {data.activity && (
            <div className="pt-1 border-t border-gray-200">
              <p
                ref={activityRef}
                className="text-red-500 text-[8px] whitespace-nowrap text-left font-futura overflow-x-auto scrollbar-hide uppercase"
                style={{ fontWeight: "515", scrollBehavior: "auto", color: '#EB1C24' }}
              >
                {data.activity}
              </p>
            </div>
          )}

          {/* Actions */}
          {actions.length > 0 && (
            <div className="pt-1 border-t border-gray-200">
              <div className="flex justify-between items-center">
                {actions.map((act, i) => (
                  <button
                    key={i}
                    type="button"
                    className={
                      act.label.toLowerCase() === "preferences"
                        ? "text-red-500 hover:text-red-600 text-[8px] whitespace-nowrap font-futura"
                        : "text-black hover:text-gray-700 text-[8px] whitespace-nowrap font-futura"
                    }
                    style={{ fontWeight: "515", color: act.label.toLowerCase() === "preferences" ? '#EB1C24' : '#000000' }}
                    onClick={() => handleActionClick(act.action)}
                  >
                    {act.label.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tiers – optional inline list */}
        {tiers.length > 0 && (
          <div className="mt-1 overflow-hidden">
            <div
              ref={tiersRef}
              className="pt-0.5 border-t border-gray-200 flex items-center justify-between text-[8px] overflow-x-auto scrollbar-hide whitespace-nowrap"
              style={{ scrollBehavior: "auto" }}
            >
              {tiers.map((tier, idx) => (
                <span
                  key={idx}
                  className={`whitespace-nowrap font-futura flex-shrink-0 uppercase`}
                  style={{
                    fontWeight: '515'
                  }}
                >
                  <span style={{ 
                    color: tier.label === 'PREM' ? '#000000' : tier.label === 'STD' ? '#EB1C24' : tier.label === 'BASIC' ? '#909090' : '#909090' 
                  }}>
                    {tier.label === 'PREM' ? 'BLACK' : tier.label === 'STD' ? 'RED' : tier.label === 'BASIC' ? 'SILVER' : tier.label}:
                  </span>
                  <span style={{ color: getColorValue(tier.color) }}> {tier.value}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
