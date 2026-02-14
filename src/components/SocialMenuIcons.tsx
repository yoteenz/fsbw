import { MENU_SOCIAL_LINKS } from '../constants/socialLinks';
import { recordSocialClick } from '../utils/socialAnalytics';

export default function SocialMenuIcons() {
  return (
    <div className="flex justify-center" style={{ marginBottom: '0' }}>
      <div className="flex" style={{ gap: '19px' }}>
        {MENU_SOCIAL_LINKS.map(({ href, label, icon, platform }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            onClick={() => recordSocialClick(platform, 'menu')}
          >
            <img src={icon} alt="" style={{ width: '20px', height: '20px' }} />
          </a>
        ))}
      </div>
    </div>
  );
}
