import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import { formatPriceUsdPlain } from '../../../utils/currencyFormat';
import { trackActivity } from '../../../utils/activity';
import {
  SLAY_TICKET_DEFAULT_PACK_ID,
  SLAY_TICKET_PACKS,
  SLAY_TICKET_CART_THUMBNAIL_SRC,
  getSlayTicketPackById,
  parseSlayTicketPackId,
  slayTicketPackCartLine,
  type SlayTicketPack,
} from '../../../utils/slayTicketPacks';
import { getSlayTicketBalanceFromUser } from '../../../utils/slayTicketHistoryDisplay';
import { useSlayTickets } from '../../../hooks/useSlayTickets';

const USD_RATES = {
  USD: { symbol: '&#36;', rate: 1.0, name: 'US Dollar' },
};

export default function SlayTicketsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedPackId, setSelectedPackId] = useState(
    () => parseSlayTicketPackId(searchParams.get('pack')) ?? SLAY_TICKET_DEFAULT_PACK_ID
  );
  const [cartCount, setCartCount] = useState(() => parseInt(localStorage.getItem('cartCount') || '0', 10));
  const [userData, setUserData] = useState<Record<string, unknown> | null>(() => {
    try {
      const raw = localStorage.getItem('currentUser');
      return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
    } catch {
      return null;
    }
  });
  const { balance } = useSlayTickets(userData);
  const ticketBalance = typeof balance === 'number' ? balance : getSlayTicketBalanceFromUser(userData);
  const selectedPack = getSlayTicketPackById(selectedPackId) ?? SLAY_TICKET_PACKS[0];
  const formatPrice = (usd: number) => formatPriceUsdPlain(usd, 'USD', USD_RATES);

  useEffect(() => {
    const parsed = parseSlayTicketPackId(searchParams.get('pack'));
    if (parsed) setSelectedPackId(parsed);
  }, [searchParams]);

  useEffect(() => {
    const sync = () => {
      setCartCount(parseInt(localStorage.getItem('cartCount') || '0', 10));
      try {
        const raw = localStorage.getItem('currentUser');
        setUserData(raw ? (JSON.parse(raw) as Record<string, unknown>) : null);
      } catch {
        setUserData(null);
      }
    };
    sync();
    window.addEventListener('cartCountUpdated', sync as EventListener);
    window.addEventListener('signInStateChanged', sync);
    return () => {
      window.removeEventListener('cartCountUpdated', sync as EventListener);
      window.removeEventListener('signInStateChanged', sync);
    };
  }, []);

  const packOptions = useMemo(() => SLAY_TICKET_PACKS, []);

  const addPackToBag = () => {
    const line = slayTicketPackCartLine(selectedPack);
    const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]') as unknown[];
    const next = [
      ...cartItems.filter((item) => {
        const row = item as { slayTicketProduct?: boolean };
        return !row.slayTicketProduct;
      }),
      line,
    ];
    localStorage.setItem('cartItems', JSON.stringify(next));
    localStorage.setItem('cartCount', String(next.length));
    window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: next.length }));
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    trackActivity('add_to_cart', { product: selectedPack.id, slayTicketPackCount: selectedPack.ticketCount });
    navigate('/bag');
  };

  return (
    <div className="min-h-screen bg-white" style={{ paddingBottom: '24px' }}>
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-black"
        style={{ borderWidth: '1.3px' }}
      >
        <button
          type="button"
          onClick={() => navigate('/tools')}
          style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', textTransform: 'uppercase' }}
        >
          ← TOOLS
        </button>
        <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', textTransform: 'uppercase', margin: 0 }}>
          SLAY TICKETS
        </p>
        <DynamicCartIcon count={cartCount} />
      </div>

      <div className="px-4 pt-4">
        <p
          style={{
            fontFamily: '"Covered By Your Grace"',
            fontSize: '22px',
            textTransform: 'uppercase',
            margin: '0 0 8px',
          }}
        >
          BUY SLAY TICKETS
        </p>
        <p
          style={{
            fontFamily: '"Futura PT Medium"',
            fontSize: '10px',
            color: '#808080',
            textTransform: 'uppercase',
            margin: '0 0 16px',
          }}
        >
          UNLOCK LOUNGE TV CONTENT. YOUR BALANCE: {ticketBalance} AVAILABLE
        </p>

        <div className="border border-black bg-white/60 backdrop-blur-sm p-4 mb-4" style={{ borderWidth: '1.3px' }}>
          <div className="flex gap-4 items-start">
            <img
              src={SLAY_TICKET_CART_THUMBNAIL_SRC}
              alt=""
              style={{ width: '72px', height: '72px', objectFit: 'contain' }}
            />
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontFamily: '"Futura PT Medium"',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  margin: '0 0 8px',
                }}
              >
                {selectedPack.label}
              </p>
              <p
                style={{
                  fontFamily: '"Futura PT Book"',
                  fontSize: '10px',
                  color: '#808080',
                  textTransform: 'uppercase',
                  margin: '0 0 12px',
                }}
              >
                DIGITAL ONLY — INSTANT DELIVERY TO YOUR ACCOUNT
              </p>
              <p
                style={{ fontFamily: '"Futura PT Medium"', fontSize: '14px', color: '#EB1C24', margin: 0 }}
                dangerouslySetInnerHTML={{ __html: formatPrice(selectedPack.priceUsd) }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {packOptions.map((pack: SlayTicketPack) => (
              <button
                key={pack.id}
                type="button"
                onClick={() => setSelectedPackId(pack.id)}
                style={{
                  border: selectedPackId === pack.id ? '1.3px solid #EB1C24' : '1.3px solid #9ca3af',
                  background: selectedPackId === pack.id ? 'rgba(235,28,36,0.08)' : 'rgba(255,255,255,0.6)',
                  padding: '10px 8px',
                  fontFamily: '"Futura PT Medium"',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  color: selectedPackId === pack.id ? '#EB1C24' : '#000000',
                }}
              >
                {pack.label}
                <br />
                <span dangerouslySetInnerHTML={{ __html: formatPrice(pack.priceUsd) }} />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={addPackToBag}
            style={{
              width: '100%',
              marginTop: '16px',
              background: '#EB1C24',
              color: '#ffffff',
              border: 'none',
              padding: '12px',
              fontFamily: '"Futura PT Medium"',
              fontSize: '11px',
              textTransform: 'uppercase',
            }}
          >
            ADD TO BAG
          </button>
        </div>

        <p
          style={{
            fontFamily: '"Futura PT Book"',
            fontSize: '9px',
            color: '#808080',
            textTransform: 'uppercase',
            lineHeight: 1.5,
          }}
        >
          EARN 2 SLAY TICKETS FOR EVERY PHYSICAL HAIR PRODUCT PURCHASED. GIFT CARDS, MEMBERSHIPS, DIGITAL CASH, AND
          SLAY TICKET PACKS DO NOT EARN BONUS TICKETS.
        </p>
      </div>
    </div>
  );
}
