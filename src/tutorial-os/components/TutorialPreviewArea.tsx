const PREVIEW_CHIPS: Record<string, string[]> = {
  welcome: ['LUXURY', 'INTERACTIVE', 'CONCIERGE'],
  navigation: ['SHOP', 'TOOLS', 'BRAND', 'MENU'],
  'build-a-wig': ['TEXTURE', 'COLOR', 'LENGTH', 'LACE'],
  'signature-collection': ['NOIR', 'BLANCO', 'SOFT WAVE', 'BEACH WAVE', 'SOFT CURL', 'OCEAN CURL'],
  'hairstyle-analysis': ['SELFIE', 'INSPO', 'AI MATCH'],
  'lounge-tv': ['FEATURED', 'LEARN', 'SLAY TIPS', 'WATCH + LEARN'],
  rewards: ['POINTS', 'TICKETS', 'VOUCHERS', 'UNLOCKS'],
  account: ['ORDERS', 'MESSAGES', 'MEMBERSHIP', 'SUPPORT'],
  'cart-checkout': ['SNAPSHOT', 'SUMMARY', 'CHECKOUT'],
  finish: ['EXPLORER', 'READY', 'SLAY'],
};

type Props = {
  previewKey?: string;
};

export function TutorialPreviewArea({ previewKey }: Props) {
  const chips = (previewKey && PREVIEW_CHIPS[previewKey]) || ['ONBOARDING TUTORIAL'];
  return (
    <div className="tutorial-os-preview-area" aria-hidden="true">
      <div className="tutorial-os-preview-chip">
        {chips.map((chip, i) => (
          <span key={chip} style={{ animationDelay: `${i * 0.08}s` }}>
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}
