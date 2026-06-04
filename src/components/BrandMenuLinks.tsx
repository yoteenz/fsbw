import { Link } from 'react-router-dom';
import { BRAND_MENU_ITEMS, getBrandMenuLabel } from '../constants/brandMenu';

interface BrandMenuLinksProps {
  onClose?: () => void;
}

export default function BrandMenuLinks({ onClose }: BrandMenuLinksProps) {
  return (
    <>
      {BRAND_MENU_ITEMS.map((item, index) => (
        <Link
          key={index}
          to={item.route}
          onClick={onClose}
          className="flex items-center justify-between cursor-pointer"
          style={{ textDecoration: 'none' }}
        >
          <span
            style={{
              fontFamily: '"Futura PT Book"',
              fontSize: '14px',
              color: 'black',
              fontWeight: '500',
              textTransform: 'uppercase',
              transform: 'translateX(13px)',
            }}
          >
            {getBrandMenuLabel(item)}
          </span>
        </Link>
      ))}
    </>
  );
}
