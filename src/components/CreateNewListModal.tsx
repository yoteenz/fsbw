import { useState, useEffect, useRef } from 'react';
import {
  clampUserListNameInput,
  loadUserLists,
  saveUserLists,
  USER_LIST_NAME_MAX_LENGTH,
  type UserList,
} from './AddToListModal';

interface CreateNewListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function CreateNewListModal({
  isOpen,
  onClose,
  onCreated
}: CreateNewListModalProps) {
  const [newListName, setNewListName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setNewListName('');
      setErrorMessage('');
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const handleCreate = () => {
    const trimmed = newListName.trim();
    if (!trimmed) {
      setErrorMessage('PLEASE ENTER A LIST NAME.');
      return;
    }
    if (trimmed.length > USER_LIST_NAME_MAX_LENGTH) {
      setErrorMessage('LIST NAME MUST BE 10 CHARACTERS OR FEWER.');
      return;
    }
    const lists = loadUserLists();
    const exists = lists.some((l) => l.name.trim().toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setErrorMessage('A LIST WITH THIS NAME ALREADY EXISTS.');
      return;
    }
    const newList: UserList = {
      id: `list-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: trimmed,
      items: []
    };
    saveUserLists([...lists, newList]);
    onCreated?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      data-attribute="create-new-list-modal"
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
        justifyContent: 'center'
      }}
    >
      <div
        className="p-6 baw-brand-modal-shell"
        style={{
          maxWidth: '400px',
          width: '90%',
          maxHeight: '85vh',
          overflow: 'auto',
          border: '1.3px solid black',
          borderRadius: 0,
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
            fontWeight: 500,
            marginBottom: '16px',
            textTransform: 'uppercase',
            textAlign: 'center',
            color: '#EB1C24'
          }}
        >
          CREATE NEW LIST
        </h3>

        <div style={{ marginBottom: '20px' }}>
          <input
            ref={inputRef}
            type="text"
            value={newListName}
            onChange={(e) => {
              setNewListName(clampUserListNameInput(e.target.value));
              setErrorMessage('');
            }}
            maxLength={USER_LIST_NAME_MAX_LENGTH}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') onClose();
            }}
            style={{
              width: '100%',
              height: '36px',
              padding: '8px 10px',
              border: '1.3px solid #000000',
              fontFamily: '"Futura PT Demi"',
              fontSize: '11px',
              color: '#808080',
              backgroundColor: '#FFFFFF',
              boxSizing: 'border-box',
              borderRadius: '0',
              textTransform: 'uppercase'
            }}
          />
        </div>

        {errorMessage && (
          <p
            style={{
              fontFamily: '"Futura PT Book"',
              fontSize: '10px',
              color: '#EB1C24',
              marginBottom: '12px',
              textAlign: 'center',
              textTransform: 'uppercase'
            }}
          >
            {errorMessage}
          </p>
        )}

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleCreate}
            className="flex-1 py-2 px-4 border border-black font-medium hover:bg-gray-50"
            style={{
              borderWidth: '1.3px',
              fontSize: '11px',
              fontFamily: '"Futura PT Medium"',
              backgroundColor: '#FFFFFF',
              color: '#EB1C24',
              textTransform: 'uppercase',
              cursor: 'pointer'
            }}
          >
            Create
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
              textTransform: 'uppercase'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
