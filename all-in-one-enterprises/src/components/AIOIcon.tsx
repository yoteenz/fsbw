import type { AioIconKey } from '../config/aioIconRegistry';
import { getAioIconSrc } from '../config/aioIconRegistry';

type Props = {
  icon: AioIconKey;
  size?: number;
  className?: string;
  alt?: string;
};

export function AIOIcon({ icon, size = 24, className = '', alt = '' }: Props) {
  return (
    <img
      src={getAioIconSrc(icon)}
      alt={alt}
      width={size}
      height={size}
      className={className}
      decoding="async"
    />
  );
}
