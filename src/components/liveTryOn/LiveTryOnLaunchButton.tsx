import { useNavigate } from 'react-router-dom';
import { LIVE_TRY_ON_ROUTE } from '../../constants/liveTryOnSpikeAssets';

type Props = {
  className?: string;
  returnTo?: { pathname: string; search?: string };
  /** When opening from consult offer, pass quote id for selection-driven assets. */
  quoteId?: string;
};

/** Opens `/tools/live-try-on` with BAW or consult selection context. */
export default function LiveTryOnLaunchButton({ className = '', returnTo, quoteId }: Props) {
  const navigate = useNavigate();

  const handleClick = () => {
    const search = new URLSearchParams();
    if (returnTo?.pathname) {
      search.set('returnTo', returnTo.pathname + (returnTo.search || ''));
    }
    const qid = String(quoteId || '').trim();
    if (qid) search.set('quoteId', qid);
    const q = search.toString();
    navigate(q ? `${LIVE_TRY_ON_ROUTE}?${q}` : LIVE_TRY_ON_ROUTE);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`border border-black font-futura w-full text-center py-2 text-[12px] font-semibold bg-white cursor-pointer hover:bg-gray-50 ${className}`}
      style={{
        borderWidth: '1.3px',
        color: '#EB1C24',
        fontFamily: '"Futura PT Medium", Futura, Inter, sans-serif',
      }}
    >
      LIVE TRY ON
    </button>
  );
}
