import { useNavigate } from 'react-router-dom';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';
import { CREATIVE_DIRECTOR_BRIEFING } from '../../../utils/adminStudioCreativeDirectorDemo';
import { ADMIN_STUDIO_CTA_LIBRARY_DEFAULTS, ADMIN_STUDIO_PRODUCT_KNOWLEDGE_DEFAULTS } from '../../../utils/adminStudioContentBrainCatalogDemo';
import { ADMIN_STUDIO_SHOW_BIBLE_DEFAULTS } from '../../../utils/adminStudioContentBrainShowBibleDemo';

type AdminStudioCreativeBriefingProps = {
  onApplySuggestions: () => void;
};

export function AdminStudioCreativeBriefing({ onApplySuggestions }: AdminStudioCreativeBriefingProps) {
  const navigate = useNavigate();
  const briefing = CREATIVE_DIRECTOR_BRIEFING;
  const show = ADMIN_STUDIO_SHOW_BIBLE_DEFAULTS.find((s) => s.id === briefing.suggestedShowId);
  const cta = ADMIN_STUDIO_CTA_LIBRARY_DEFAULTS.find((c) => c.id === briefing.suggestedCtaId);
  const products = briefing.suggestedProductIds
    .map((id) => ADMIN_STUDIO_PRODUCT_KNOWLEDGE_DEFAULTS.find((p) => p.id === id)?.name)
    .filter(Boolean);

  return (
    <div
      className="p-3 mb-4 border bg-white/80"
      style={{
        borderColor: ADMIN_STUDIO_THEME.panelBorderStrong,
        borderLeft: `3px solid ${ADMIN_STUDIO_THEME.accent}`,
      }}
    >
      <p
        className="text-[12px] mb-1"
        style={{
          fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
          color: ADMIN_STUDIO_THEME.textPrimary,
        }}
      >
        GOOD MORNING, {briefing.greetingName}.
      </p>
      <p
        className="text-[9px] font-futura uppercase mb-3 tracking-widest"
        style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.accent }}
      >
        TODAY'S CREATIVE BRIEFING
      </p>

      <ul className="space-y-1 mb-3">
        {briefing.bullets.map((line) => (
          <li
            key={line}
            className="text-[7px] font-futura uppercase flex gap-1.5"
            style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}
          >
            <span style={{ color: ADMIN_STUDIO_THEME.accent }}>•</span>
            {line}
          </li>
        ))}
      </ul>

      <div
        className="p-2 mb-3 space-y-1"
        style={{ background: ADMIN_STUDIO_THEME.panelBg, border: `1px solid ${ADMIN_STUDIO_THEME.panelBorder}` }}
      >
        <BriefingRow label="SUGGESTED TOPIC" value={briefing.suggestedTopic} accent />
        <BriefingRow label="SUGGESTED SHOW" value={show?.name ?? '—'} />
        <BriefingRow label="SUGGESTED CTA" value={cta?.title ?? '—'} />
        <BriefingRow label="SUGGESTED PRODUCTS" value={products.join(' · ')} />
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <BriefingAction label="APPLY SUGGESTIONS" onClick={onApplySuggestions} primary />
        <BriefingAction label="CONTINUE DRAFT" onClick={() => navigate('/admin/studio/content-packs')} />
        <BriefingAction label="NEW PACK" onClick={() => navigate('/admin/studio/ai-studio')} />
        <BriefingAction label="REVIEW DRAFTS" onClick={() => navigate('/admin/studio/drafts')} />
        <BriefingAction label="PUBLISHING" onClick={() => navigate('/admin/studio/publishing-queue')} className="col-span-2" />
      </div>
    </div>
  );
}

function BriefingRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
        {label}
      </p>
      <p
        className="text-[8px] font-futura uppercase"
        style={{ fontWeight: 515, color: accent ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textPrimary, lineHeight: 1.4 }}
      >
        {value}
      </p>
    </div>
  );
}

function BriefingAction({
  label,
  onClick,
  primary,
  className = '',
}: {
  label: string;
  onClick: () => void;
  primary?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-2 px-2 text-[7px] font-futura uppercase border transition-colors ${className}`}
      style={{
        fontWeight: 515,
        color: primary ? '#FFFFFF' : ADMIN_STUDIO_THEME.accent,
        background: primary ? ADMIN_STUDIO_THEME.accent : 'rgba(255,255,255,0.7)',
        borderColor: ADMIN_STUDIO_THEME.panelBorder,
      }}
    >
      {label}
    </button>
  );
}
