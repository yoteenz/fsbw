import { useEffect, useState } from 'react';

interface ShareListLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  listName?: string;
}

export default function ShareListLinkModal({
  isOpen,
  onClose,
  shareUrl,
  listName,
}: ShareListLinkModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) setCopied(false);
  }, [isOpen, shareUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    if (!shareUrl) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div
      data-attribute="share-list-link-modal"
      className="fixed z-50 backdrop-blur-md"
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999999999,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="p-6 baw-brand-modal-shell"
        style={{
          maxWidth: '400px',
          width: '90%',
          border: '1.3px solid black',
          borderRadius: 0,
          transform: 'translateY(-6px)',
          backgroundImage: 'url(/assets/popup-marble.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            marginBottom: '16px',
            textTransform: 'uppercase',
            textAlign: 'center',
            color: '#EB1C24',
          }}
        >
          SHARE LIST
        </h3>
        <p
          style={{
            fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
            fontSize: '10px',
            color: '#000000',
            textTransform: 'uppercase',
            textAlign: 'center',
            margin: '0 0 16px 0',
          }}
        >
          {listName
            ? `COPY THE LINK BELOW TO SHOWCASE "${listName.toUpperCase()}"`
            : 'COPY THE LINK BELOW TO SHOWCASE THIS LIST'}
        </p>
        <input
          type="text"
          readOnly
          value={shareUrl}
          aria-label="Share list link"
          onFocus={(e) => e.target.select()}
          style={{
            width: '100%',
            padding: '8px 10px',
            marginBottom: '16px',
            border: '1.3px solid #000',
            fontFamily: '"Futura PT Book"',
            fontSize: '10px',
            color: '#000',
            backgroundColor: '#fff',
            boxSizing: 'border-box',
            textTransform: 'none',
          }}
        />
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex-1 py-2 px-4 border border-black font-medium hover:bg-gray-50"
            style={{
              borderWidth: '1.3px',
              fontSize: '11px',
              fontFamily: '"Futura PT Medium"',
              backgroundColor: '#FFFFFF',
              color: '#EB1C24',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            {copied ? 'LINK COPIED' : 'COPY LINK'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-black bg-white font-medium hover:bg-gray-50"
            style={{
              borderWidth: '1.3px',
              fontSize: '11px',
              fontFamily: '"Futura PT Medium"',
              color: '#000000',
              textTransform: 'uppercase',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
