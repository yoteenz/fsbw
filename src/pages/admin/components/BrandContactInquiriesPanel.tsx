import { useCallback, useEffect, useState } from 'react';
import {
  getAdminBrandContactInquiries,
  patchAdminBrandContactInquiry,
  type AdminBrandContactInquiry,
} from '../../../utils/api';
import {
  loadBrandContactInquiriesLocal,
  type BrandContactInquiryRecord,
} from '../../../utils/brandContactInquiries';

function formatInquiryTime(ts: string): string {
  try {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return ts.toUpperCase();
    return d
      .toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
      .toUpperCase();
  } catch {
    return ts.toUpperCase();
  }
}

function mergeInquiries(
  remote: AdminBrandContactInquiry[],
  local: BrandContactInquiryRecord[]
): AdminBrandContactInquiry[] {
  const byId = new Map<string, AdminBrandContactInquiry>();
  for (const row of remote) byId.set(row.id, row);
  for (const row of local) {
    if (!byId.has(row.id)) {
      byId.set(row.id, {
        id: row.id,
        name: row.name,
        email: row.email,
        isOrderRelated: row.isOrderRelated,
        orderNumber: row.orderNumber,
        message: row.message,
        status: row.status,
        timestamp: row.timestamp,
      });
    }
  }
  return [...byId.values()].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export default function BrandContactInquiriesPanel({
  onStatsChange,
}: {
  onStatsChange?: (stats: { newCount: number; total: number }) => void;
}) {
  const [inquiries, setInquiries] = useState<AdminBrandContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const remote = await getAdminBrandContactInquiries();
      const merged = mergeInquiries(
        remote.inquiries,
        remote.storageAvailable ? [] : loadBrandContactInquiriesLocal()
      );
      setInquiries(merged);
      const newCount = merged.filter((i) => i.status === 'new').length;
      onStatsChange?.({ newCount, total: merged.length });
    } catch {
      const local = loadBrandContactInquiriesLocal();
      const mapped: AdminBrandContactInquiry[] = local.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        isOrderRelated: r.isOrderRelated,
        orderNumber: r.orderNumber,
        message: r.message,
        status: r.status,
        timestamp: r.timestamp,
      }));
      setInquiries(mapped);
      onStatsChange?.({
        newCount: mapped.filter((i) => i.status === 'new').length,
        total: mapped.length,
      });
    } finally {
      setLoading(false);
    }
  }, [onStatsChange]);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener('brandContactInquiriesUpdated', onUpdate);
    return () => window.removeEventListener('brandContactInquiriesUpdated', onUpdate);
  }, [refresh]);

  const markRead = async (id: string) => {
    try {
      await patchAdminBrandContactInquiry(id, 'read');
    } catch {
      /* local-only ids may fail PATCH */
    }
    const local = loadBrandContactInquiriesLocal().map((r) =>
      r.id === id ? { ...r, status: 'read' as const } : r
    );
    localStorage.setItem('adminBrandContactInquiries', JSON.stringify(local));
    window.dispatchEvent(new CustomEvent('brandContactInquiriesUpdated'));
    await refresh();
  };

  if (loading) {
    return (
      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', textTransform: 'uppercase', color: '#808080' }}>
        LOADING…
      </p>
    );
  }

  if (inquiries.length === 0) {
    return (
      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '10px', textTransform: 'uppercase', color: '#808080' }}>
        NO CONTACT INQUIRIES YET.
      </p>
    );
  }

  return (
    <div className="flex flex-col" style={{ gap: '10px' }}>
      {inquiries.map((row) => {
        const isNew = row.status === 'new';
        const expanded = expandedId === row.id;
        return (
          <div
            key={row.id}
            style={{
              border: isNew ? '1.3px solid #EB1C24' : '1.3px solid #000000',
              padding: '12px',
              backgroundColor: '#FFFFFF',
            }}
          >
            <button
              type="button"
              onClick={() => setExpandedId(expanded ? null : row.id)}
              className="w-full text-left bg-transparent cursor-pointer"
              style={{ border: 'none', padding: 0 }}
            >
              <p
                style={{
                  fontFamily: '"Futura PT Medium"',
                  fontSize: '10px',
                  color: isNew ? '#EB1C24' : '#000000',
                  margin: '0 0 4px 0',
                  textTransform: 'uppercase',
                }}
              >
                {row.name} · {row.email}
              </p>
              <p
                style={{
                  fontFamily: '"Futura PT Book"',
                  fontSize: '9px',
                  color: '#808080',
                  margin: 0,
                  textTransform: 'uppercase',
                }}
              >
                {formatInquiryTime(row.timestamp)}
                {row.isOrderRelated === 'yes' && row.orderNumber
                  ? ` · ORDER #${row.orderNumber}`
                  : row.isOrderRelated === 'yes'
                    ? ' · ORDER RELATED'
                    : ''}
              </p>
            </button>
            {expanded ? (
              <div style={{ marginTop: '10px' }}>
                <p
                  style={{
                    fontFamily: '"Futura PT Book"',
                    fontSize: '10px',
                    color: '#000000',
                    margin: '0 0 10px 0',
                    lineHeight: 1.45,
                    textTransform: 'uppercase',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {row.message}
                </p>
                {isNew ? (
                  <button
                    type="button"
                    onClick={() => markRead(row.id)}
                    style={{
                      fontFamily: '"Futura PT Medium"',
                      fontSize: '10px',
                      color: '#EB1C24',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      padding: 0,
                    }}
                  >
                    MARK AS READ
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
