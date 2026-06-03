import { useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Elements, CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { getStripeJs, isStripePublishableConfigured, confirmProductCheckoutPayment } from '../../utils/productCheckoutStripe';
import type { CheckoutQuoteLinePayload } from '../../utils/checkoutQuote';

export type CheckoutStripeCardHandle = {
  confirmPayment: (args: {
    lines: CheckoutQuoteLinePayload[];
    billingName: string;
    billingEmail: string;
  }) => Promise<{ ok: true; paymentIntentId: string } | { ok: false; error: string }>;
  isReady: () => boolean;
};

type InnerProps = {
  onReadyChange: (ready: boolean) => void;
  handleRef: React.RefObject<CheckoutStripeCardHandle | null>;
};

function CheckoutStripeCardInner({ onReadyChange, handleRef }: InnerProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    onReadyChange(Boolean(stripe && elements && complete));
  }, [stripe, elements, complete, onReadyChange]);

  useImperativeHandle(handleRef, () => ({
    isReady: () => Boolean(stripe && elements && complete),
    confirmPayment: async (args) => {
      if (!stripe || !elements) {
        return { ok: false, error: 'Stripe is still loading. Wait a moment and try again.' };
      }
      const card = elements.getElement(CardElement);
      if (!card) {
        return { ok: false, error: 'Card field not found.' };
      }
      return confirmProductCheckoutPayment({ ...args, card });
    },
  }));

  return (
    <div className="mt-2">
      <label
        style={{
          fontFamily: '"Futura PT Book"',
          fontSize: '10px',
          color: '#000000',
          display: 'block',
          marginBottom: '4px',
          textTransform: 'uppercase',
        }}
      >
        CARD (SECURE STRIPE FIELD)<span style={{ color: '#EB1C24' }}>*</span>
      </label>
      <div
        style={{
          border: '1.3px solid #000000',
          padding: '10px 8px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
        }}
      >
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '14px',
                color: '#000',
                fontFamily: '"Futura PT Book", sans-serif',
                '::placeholder': { color: '#808080' },
              },
            },
          }}
          onChange={(e) => setComplete(e.complete)}
        />
      </div>
    </div>
  );
}

type Props = {
  enabled: boolean;
  handleRef: React.RefObject<CheckoutStripeCardHandle | null>;
  onReadyChange?: (ready: boolean) => void;
};

export default function CheckoutStripeCardSection({ enabled, handleRef, onReadyChange }: Props) {
  const stripePromise = useMemo(() => (enabled && isStripePublishableConfigured() ? getStripeJs() : null), [enabled]);

  if (!enabled || !stripePromise) return null;

  return (
    <Elements stripe={stripePromise}>
      <CheckoutStripeCardInner handleRef={handleRef} onReadyChange={(ready) => onReadyChange?.(ready)} />
    </Elements>
  );
}
