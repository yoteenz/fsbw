/** Gift card PDP — single-select balance chips (div-based to avoid mobile button sticky states). */

const OPTIONS = [10, 15, 25, 50, 75, 100, 250, 500] as const;

type GiftCardBalancePickerProps = {
  value: number;
  onChange: (balance: number) => void;
};

export default function GiftCardBalancePicker({ value, onChange }: GiftCardBalancePickerProps) {
  const selected = Number(value);

  return (
    <>
      <style>{`
        .gift-card-balance-option {
          display: inline-block;
          box-sizing: border-box;
          border: 1.3px solid #000000;
          background-color: #ffffff !important;
          padding: 4px 16px;
          min-width: 60px;
          text-align: center;
          font-family: "Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif;
          font-size: 11px;
          font-weight: 500;
          line-height: 1.2;
          color: #000000 !important;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          user-select: none;
        }
        .gift-card-balance-option[data-selected='true'] {
          border: 2px solid #eb1c24 !important;
          color: #eb1c24 !important;
          font-weight: 600;
        }
        .gift-card-balance-option[data-selected='false'] {
          border: 1.3px solid #000000 !important;
          color: #000000 !important;
          font-weight: 500;
        }
        .gift-card-balance-option:active {
          background-color: #ffffff !important;
        }
      `}</style>
      <div
        role="radiogroup"
        aria-label="Select card balance"
        className="flex justify-center gap-3 flex-wrap mb-6"
        style={{ transform: 'translateY(-7px)' }}
      >
        {OPTIONS.map((balance) => {
          const isSelected = selected === balance;
          return (
            <div
              key={`gift-card-balance-${balance}`}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              data-selected={isSelected ? 'true' : 'false'}
              className="gift-card-balance-option"
              onClick={() => onChange(balance)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onChange(balance);
                }
              }}
            >
              ${balance}
            </div>
          );
        })}
      </div>
    </>
  );
}

export { OPTIONS as GIFT_CARD_BALANCE_OPTIONS };
