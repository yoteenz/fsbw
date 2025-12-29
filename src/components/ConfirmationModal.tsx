
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  dataAttribute?: string;
  messageTextTransform?: 'uppercase' | 'lowercase' | 'none';
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'CONFIRM',
  cancelText = 'CANCEL',
  dataAttribute = 'confirmation-modal',
  messageTextTransform = 'uppercase'
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      data-attribute={dataAttribute}
      className="fixed z-50 backdrop-blur-md"
      style={{
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        zIndex: 9999999999,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="p-6"
        style={{
          maxWidth: '400px',
          width: '90%',
          border: '1.3px solid black',
          borderRadius: '0',
          transform: 'translateY(-6px)',
          backgroundImage: 'url(/assets/popup-marble.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '16px',
            textTransform: 'uppercase',
            textAlign: 'center',
            color: '#EB1C24'
          }}
        >
          {title}
        </h3>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <p
            style={{
              fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
              fontSize: '10px',
              color: '#000000',
              textTransform: messageTextTransform,
              textAlign: 'center',
              transform: 'translateY(-1px)',
              whiteSpace: 'nowrap',
              margin: 0
            }}
          >
            {message}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-black bg-white font-medium hover:bg-gray-50 transition-colors"
            style={{
              borderWidth: '1.3px',
              fontSize: '11px',
              fontFamily: '"Futura PT Medium"',
              color: '#000000',
              textTransform: 'uppercase'
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 px-4 border border-black font-medium hover:bg-gray-50 transition-colors"
            style={{
              borderWidth: '1.3px',
              fontSize: '11px',
              fontFamily: '"Futura PT Medium"',
              backgroundColor: '#FFFFFF',
              color: '#EB1C24',
              textTransform: 'uppercase'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

