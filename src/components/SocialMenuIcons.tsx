const SOCIAL_LINKS = [
  { href: 'https://www.instagram.com/frontalslayer/', label: 'Instagram @frontalslayer', icon: '/assets/instagram-icon.svg' },
  { href: 'https://x.com/frontalslayer', label: 'X (Twitter) @frontalslayer', icon: '/assets/twitter-icon.svg' },
  { href: 'https://www.facebook.com/bookfrontalslayer', label: 'Facebook @bookfrontalslayer', icon: '/assets/facebook-icon.svg' },
  { href: 'https://www.tiktok.com/@frontalslayer', label: 'TikTok @frontalslayer', icon: '/assets/tiktok-icon.svg' }
] as const;

export default function SocialMenuIcons() {
  return (
    <div className="flex justify-center" style={{ marginBottom: '0' }}>
      <div className="flex" style={{ gap: '19px' }}>
        {SOCIAL_LINKS.map(({ href, label, icon }) => (
          <a key={href} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
            <img src={icon} alt="" style={{ width: '20px', height: '20px' }} />
          </a>
        ))}
      </div>
    </div>
  );
}
