import { useNavigate } from 'react-router-dom';
import type { AdminStudioModule } from '../../../utils/adminStudioNavigation';
import { STUDIO_STATUS_LABELS } from '../../../utils/adminStudioNavigation';

type AdminStudioModuleCardProps = {
  module: AdminStudioModule;
  index?: number;
  compact?: boolean;
};

/**
 * Studio module row — same list pattern as Admin Clients hub rows.
 * White row, gray border, red title, Futura metadata.
 */
export function AdminStudioModuleCard({ module, index }: AdminStudioModuleCardProps) {
  const navigate = useNavigate();
  const statusLabel = STUDIO_STATUS_LABELS[module.status];
  const statusColor = module.status === 'live' ? '#EB1C24' : '#808080';

  return (
    <button
      type="button"
      onClick={() => navigate(module.route)}
      className="w-full text-left bg-white border border-gray-200 px-4 py-3 mb-2 hover:opacity-90 transition-opacity studio-living-card studio-glass-depth"
    >
      <div
        className="grid gap-2 items-start"
        style={{ gridTemplateColumns: '1fr 4.5rem 4.5rem', marginLeft: '-4px' }}
      >
        <div className="min-w-0" style={{ paddingLeft: '8px' }}>
          <span
            className="font-medium block truncate"
            style={{ fontSize: '12px', color: '#EB1C24', fontFamily: '"Futura PT Medium"' }}
          >
            {index != null ? `${index}. ` : ''}
            {module.title}
          </span>
          <span
            className="block truncate"
            style={{
              fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
              fontSize: '13px',
              color: '#808080',
              marginTop: '2px',
            }}
          >
            {module.purpose}
          </span>
        </div>
        <div
          className="flex items-center justify-end w-full"
          style={{
            fontFamily: '"Futura PT Book"',
            fontSize: '11px',
            color: statusColor,
            textAlign: 'right',
            marginRight: '2px',
          }}
        >
          {statusLabel}
        </div>
        <div
          className="flex items-center justify-end w-full"
          style={{
            fontFamily: '"Futura PT Book"',
            fontSize: '12px',
            color: module.metric === '—' ? '#000000' : '#EB1C24',
            textAlign: 'right',
            marginRight: '2px',
          }}
        >
          {module.metric}
        </div>
      </div>
    </button>
  );
}
