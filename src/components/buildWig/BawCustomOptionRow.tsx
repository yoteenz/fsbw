import ThumbBox from '../ThumbBox';

/** Reserved id for “not listed” option on BAW sub-pages. */
export const BAW_CUSTOM_OPTION_ID = 'CUSTOM';

type BawCustomOptionRowProps = {
  /** Upper ThumbBox caption (e.g. COLOR, LENGTH). */
  categoryLabel: string;
  isSelected: boolean;
  onSelect: () => void;
  /** Whole dollars; used when CUSTOM is selected for pricing. */
  customPriceUsd: number;
  onCustomPriceUsdChange: (usd: number) => void;
};

/** CUSTOM option cell + optional price input. Place inside the same CSS grid as other ThumbBoxes. */
export function BawCustomOptionRow({
  categoryLabel,
  isSelected,
  onSelect,
  customPriceUsd,
  onCustomPriceUsdChange,
}: BawCustomOptionRowProps) {
  return (
    <>
      <ThumbBox
        image=""
        title={categoryLabel}
        label="CUSTOM"
        textDisplay="+"
        isSelected={isSelected}
        onClick={onSelect}
        imgSize={35}
        containerSize={60}
        colorCode="#9CA3AF"
      />
      {isSelected ? (
        <div className="col-span-full w-full max-w-[280px] justify-self-center mb-2 px-1">
          <label
            className="block text-center mb-1"
            style={{
              fontFamily: '"Futura PT Medium", Futura, sans-serif',
              fontSize: '9px',
              color: '#808080',
              letterSpacing: '0.02em',
            }}
          >
            CUSTOM PRICE (USD)
          </label>
          <input
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            value={Number.isFinite(customPriceUsd) ? customPriceUsd : 0}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              onCustomPriceUsdChange(Number.isFinite(v) && v >= 0 ? v : 0);
            }}
            className="w-full border border-black text-center py-2 text-sm bg-white"
            style={{
              borderWidth: '1.3px',
              fontFamily: '"Futura PT Book", Futura, sans-serif',
              color: '#111',
            }}
          />
        </div>
      ) : null}
    </>
  );
}
