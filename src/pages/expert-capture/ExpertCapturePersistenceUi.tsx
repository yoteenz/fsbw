function formatRelativeTime(iso: string | null): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Saved just now';
  if (mins === 1) return 'Last saved 1 minute ago';
  if (mins < 60) return `Last saved ${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  return `Last saved ${hrs} hour${hrs === 1 ? '' : 's'} ago`;
}

export function ExpertCaptureSaveStatusBar({
  status,
  message,
  lastSavedAt,
  lastServerConfirmedAt,
}: {
  status: string;
  message: string;
  lastSavedAt: string | null;
  lastServerConfirmedAt: string | null;
}) {
  if (status === 'idle' && !lastSavedAt) return null;
  const label =
    message ||
    (status === 'uploading'
      ? 'Uploading answer…'
      : status === 'offline_pending'
        ? 'Offline — changes pending'
        : status === 'failed'
          ? 'Save failed'
          : lastServerConfirmedAt
            ? formatRelativeTime(lastServerConfirmedAt)
            : formatRelativeTime(lastSavedAt));

  return (
    <div
      style={{
        fontSize: 12,
        color: status === 'failed' ? '#dc2626' : status === 'offline_pending' ? '#ca8a04' : '#737373',
        marginBottom: 12,
      }}
    >
      {label}
    </div>
  );
}

export function ExpertCaptureSaveExitButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '10px 16px',
        borderRadius: 8,
        border: '1px solid #d4d4d4',
        background: '#fff',
        fontSize: 14,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: 500,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      Save & Exit
    </button>
  );
}
