import type { AioIconKey } from '../../config/aioIconRegistry';
import { AIOIcon } from '../AIOIcon';

export type FeatureItem = {
  label: string;
  icon?: AioIconKey;
  iconSrc?: string;
};

type Props = {
  items: FeatureItem[];
  className?: string;
};

export function AioFeatureGrid({ items, className = '' }: Props) {
  return (
    <ul className={`aio-ps-features${className ? ` ${className}` : ''}`}>
      {items.map((item) => (
        <li key={item.label} className="aio-ps-features__item">
          <span className="aio-ps-features__icon" aria-hidden="true">
            {item.icon ? (
              <AIOIcon icon={item.icon} size={32} alt="" />
            ) : item.iconSrc ? (
              <img src={item.iconSrc} alt="" width={32} height={32} decoding="async" />
            ) : (
              <span className="aio-ps-features__dot" />
            )}
          </span>
          <span className="aio-ps-features__label">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
