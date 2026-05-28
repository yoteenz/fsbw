import { useEffect, useState } from 'react';
import {
  getSignedInUserEmail,
  registerUnitStockNotifyRequest,
} from '../../utils/unitStockNotify';

type StockNotifyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
};

export default function StockNotifyModal({ isOpen, onClose, productName }: StockNotifyModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setSuccess('');
    const signedIn = getSignedInUserEmail();
    setEmail(signedIn);
  }, [isOpen, productName]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    setError('');
    const result = registerUnitStockNotifyRequest(productName, email);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setSuccess(result.message);
  };

  return (
    <div
      className="fixed z-50 backdrop-blur-md"
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999999999,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="p-6 baw-brand-modal-shell"
        style={{
          maxWidth: '400px',
          width: '90%',
          border: '1.3px solid black',
          borderRadius: 0,
          transform: 'translateY(-6px)',
          backgroundImage: 'url(/assets/popup-marble.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            fontFamily: '"Futura PT Medium", Futura, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            marginBottom: '12px',
            textTransform: 'uppercase',
            textAlign: 'center',
            color: '#EB1C24',
          }}
        >
          NOTIFY ME WHEN AVAILABLE
        </h3>
        <p
          style={{
            fontFamily: '"Futura PT Medium", Futura, sans-serif',
            fontSize: '10px',
            color: '#000000',
            textAlign: 'center',
            marginBottom: '16px',
            textTransform: 'uppercase',
            lineHeight: 1.4,
            fontWeight: 500,
          }}
        >
          THIS ITEM IS CURRENTLY OUT OF STOCK. ENTER YOUR EMAIL ADDRESS AND WE&apos;LL LET YOU KNOW ONCE IT&apos;S BACK IN STOCK AGAIN.
        </p>

        {!success ? (
          <>
            <label
              htmlFor="stock-notify-email"
              style={{
                display: 'block',
                fontFamily: '"Futura PT Medium", Futura, sans-serif',
                fontSize: '10px',
                color: '#000',
                marginBottom: '6px',
                textTransform: 'uppercase',
              }}
            >
              EMAIL ADDRESS
            </label>
            <input
              id="stock-notify-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full border border-black bg-white/80 px-3 py-2 uppercase"
              style={{
                borderWidth: '1.3px',
                fontFamily: '"Futura PT Demi", Futura, sans-serif',
                fontSize: '11px',
                color: '#808080',
                marginBottom: error ? '8px' : '16px',
              }}
            />
            {error && (
              <p
                style={{
                  fontFamily: '"Futura PT Medium", Futura, sans-serif',
                  fontSize: '10px',
                  color: '#EB1C24',
                  textAlign: 'center',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                }}
              >
                {error}
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 border border-black py-2 uppercase"
                style={{
                  borderWidth: '1.3px',
                  fontFamily: '"Futura PT Medium", Futura, sans-serif',
                  fontSize: '11px',
                  color: '#EB1C24',
                  backgroundColor: '#fff',
                }}
              >
                NOTIFY ME
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-black py-2 uppercase"
                style={{
                  borderWidth: '1.3px',
                  fontFamily: '"Futura PT Medium", Futura, sans-serif',
                  fontSize: '11px',
                  color: '#000000',
                  backgroundColor: '#fff',
                }}
              >
                CANCEL
              </button>
            </div>
          </>
        ) : (
          <>
            <p
              style={{
                fontFamily: '"Futura PT Demi", Futura, sans-serif',
                fontSize: '10px',
                color: '#000',
                textAlign: 'center',
                marginBottom: '16px',
                textTransform: 'uppercase',
                lineHeight: 1.4,
              }}
            >
              {success}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full border border-black py-2 uppercase"
              style={{
                borderWidth: '1.3px',
                fontFamily: '"Futura PT Medium", Futura, sans-serif',
                fontSize: '11px',
                color: '#EB1C24',
                backgroundColor: '#fff',
              }}
            >
              DONE
            </button>
          </>
        )}
      </div>
    </div>
  );
}
