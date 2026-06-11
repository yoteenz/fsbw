import { useState, type RefObject } from 'react';
import { toPng } from 'html-to-image';

type DownloadAnalysisButtonProps = {
  targetRef: RefObject<HTMLElement | null>;
  filename: string;
  className?: string;
  label?: string;
};

export async function downloadCardPng(node: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await toPng(node, {
    cacheBust: true,
    pixelRatio: 3,
    backgroundColor: '#ffffff',
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export default function DownloadAnalysisButton({
  targetRef,
  filename,
  className = '',
  label = 'DOWNLOAD PNG',
}: DownloadAnalysisButtonProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDownload = async () => {
    const node = targetRef.current;
    if (!node || busy) return;
    setBusy(true);
    setError(null);
    try {
      await downloadCardPng(node, filename);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'DOWNLOAD FAILED');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => void onDownload()}
        disabled={busy || !targetRef.current}
        className={
          className ||
          'border border-black bg-[#eb1c24] text-white uppercase tracking-[0.18em] text-[10px] px-4 py-3 disabled:opacity-50'
        }
      >
        {busy ? 'EXPORTING…' : label}
      </button>
      {error ? (
        <p className="text-[9px] uppercase tracking-[0.12em] text-[#eb1c24]">{error}</p>
      ) : null}
    </div>
  );
}
