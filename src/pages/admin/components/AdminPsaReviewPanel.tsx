import { useCallback, useEffect, useState } from 'react';
import { getAdminPsaReviewDetail, getAdminPsaReviewThreads } from '../../../utils/api';

type ThreadRow = {
  id: string;
  userId: string;
  title: string | null;
  updatedAt: string;
  messageCount: number;
  preview: string | null;
  toolsUsed: string[];
};

export default function AdminPsaReviewPanel() {
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof getAdminPsaReviewDetail>> | null>(
    null
  );
  const [detailLoading, setDetailLoading] = useState(false);

  const loadThreads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await getAdminPsaReviewThreads(40);
      setThreads(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load PSA threads');
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    void getAdminPsaReviewDetail(selectedId)
      .then((row) => {
        if (!cancelled) setDetail(row);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load thread');
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  return (
    <div className="space-y-4 text-left" style={{ textTransform: 'uppercase' }}>
      <p className="text-[10px] text-gray-600 leading-relaxed normal-case">
        Review recent PSA threads and which tools fired. Run migration{' '}
        <code className="text-[9px]">20260607140000_psa_tool_events.sql</code> in Supabase if the
        list is empty after chats.
      </p>

      {error ? <p className="text-[10px] text-red-600">{error}</p> : null}

      <button
        type="button"
        className="w-full py-2 border border-black text-[10px] font-medium"
        onClick={() => void loadThreads()}
      >
        REFRESH
      </button>

      {loading ? <p className="text-[10px] text-gray-500">LOADING THREADS…</p> : null}

      {!loading && threads.length === 0 ? (
        <p className="text-[10px] text-gray-500">NO PSA THREADS YET.</p>
      ) : null}

      <ul className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 p-2">
        {threads.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              className={`w-full text-left p-2 border text-[9px] ${
                selectedId === t.id ? 'border-red-600 bg-white/80' : 'border-gray-300'
              }`}
              onClick={() => setSelectedId(t.id)}
            >
              <div className="font-medium">{t.title || 'PSA CHAT'}</div>
              <div className="text-gray-500 truncate">{t.preview || '—'}</div>
              <div className="text-gray-500">
                {t.messageCount} MSG · {t.toolsUsed.length ? t.toolsUsed.join(', ') : 'NO TOOLS LOGGED'}
              </div>
            </button>
          </li>
        ))}
      </ul>

      {selectedId && detailLoading ? <p className="text-[10px] text-gray-500">LOADING TRANSCRIPT…</p> : null}

      {detail ? (
        <div className="space-y-3 border border-black p-3 bg-white/50">
          <div className="text-[10px] font-medium">{detail.thread.title || 'PSA CHAT'}</div>
          {detail.toolSummary.length > 0 ? (
            <div className="text-[9px] text-gray-700">
              <div className="font-medium mb-1">TOOL USAGE</div>
              {detail.toolSummary.map((row) => (
                <div key={row.toolName}>
                  {row.toolName}: {row.count}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[9px] text-gray-500">NO TOOL EVENTS FOR THIS THREAD.</p>
          )}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {detail.messages.map((m) => (
              <div
                key={m.id}
                className={`text-[9px] p-2 border ${
                  m.role === 'user' ? 'border-gray-400' : 'border-red-300'
                }`}
              >
                <div className="text-gray-500 mb-1">{m.role.toUpperCase()}</div>
                <div className="whitespace-pre-wrap normal-case">{m.content}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
