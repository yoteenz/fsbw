import { useState } from 'react';
import StockNotifyModal from './StockNotifyModal';

type AddToBagState = 'idle' | 'adding' | 'added';

type UnitPdpCartActionsProps = {
  productName: string;
  soldOut: boolean;
  addToBagState: AddToBagState;
  onAddToBag: () => void;
  onCustomize: () => void;
  buttonFontFamily?: string;
};

const defaultFont =
  '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif';

/** Shared ADD TO BAG + CUSTOMIZE / NOTIFY row for unit PDPs. */
export function UnitPdpCartActions({
  productName,
  soldOut,
  addToBagState,
  onAddToBag,
  onCustomize,
  buttonFontFamily = defaultFont,
}: UnitPdpCartActionsProps) {
  const [showNotifyModal, setShowNotifyModal] = useState(false);

  return (
    <>
      <div className="px-0 md:px-0" style={{ marginTop: '2px' }}>
        <button
          type="button"
          onClick={onAddToBag}
          disabled={soldOut || addToBagState === 'adding'}
          className={`border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold ${
            soldOut || addToBagState === 'adding'
              ? 'bg-white cursor-not-allowed'
              : addToBagState === 'added'
                ? 'bg-white cursor-pointer'
                : 'bg-white cursor-pointer hover:bg-gray-50'
          }`}
          style={{
            borderWidth: '1.3px',
            color: soldOut ? '#808080' : '#EB1C24',
            fontFamily: soldOut
              ? '"Futura PT Demi", Futura, sans-serif'
              : buttonFontFamily,
            backgroundColor: '#FFFFFF',
          }}
        >
          {soldOut && 'OUT OF STOCK'}
          {!soldOut && addToBagState === 'idle' && 'ADD TO BAG'}
          {!soldOut && addToBagState === 'adding' && 'ADDING...'}
          {!soldOut && addToBagState === 'added' && (
            <span className="flex items-center justify-center gap-1">
              <img src="/assets/check.svg" alt="Check" width="9" height="9" />
              <span style={{ color: '#808080' }}>IN THE BAG</span>
            </span>
          )}
        </button>
      </div>

      <div className="px-0 md:px-0" style={{ marginTop: '10px' }}>
        <button
          type="button"
          onClick={() => {
            if (soldOut) {
              setShowNotifyModal(true);
              return;
            }
            onCustomize();
          }}
          className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
          style={{
            borderWidth: '1.3px',
            color: '#EB1C24',
            fontFamily: buttonFontFamily,
          }}
        >
          {soldOut ? 'NOTIFY ME WHEN AVAILABLE' : 'CUSTOMIZE IN BUILD-A-WIG'}
        </button>
      </div>

      <StockNotifyModal
        isOpen={showNotifyModal}
        onClose={() => setShowNotifyModal(false)}
        productName={productName}
      />
    </>
  );
}
