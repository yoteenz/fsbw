/** Loyalty / rewards section header gem — exact brand red (no CSS filter). */
const REWARDS_GEM_PATH =
  'M11.9997 20.212L2.5957 8.923L5.3077 3.5H18.6917L21.4037 8.923L11.9997 20.212ZM8.8167 8.5H15.1827L13.1827 4.5H10.8167L8.8167 8.5ZM11.4997 18.06V9.5H4.3917L11.4997 18.06ZM12.4997 18.06L19.6077 9.5H12.4997V18.06ZM16.2917 8.5H20.0577L18.0577 4.5H14.2917L16.2917 8.5ZM3.9417 8.5H7.7077L9.7077 4.5H5.9417L3.9417 8.5Z';

const BRAND_RED = '#EB1C24';

export default function RewardsHeaderIcon({
  sizePx = 19.76,
  className,
}: {
  sizePx?: number;
  className?: string;
}) {
  return (
    <svg
      width={sizePx}
      height={sizePx}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path d={REWARDS_GEM_PATH} fill={BRAND_RED} />
    </svg>
  );
}
