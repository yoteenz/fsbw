import React, { useState, useEffect, useRef } from 'react';

const USER_LISTS_KEY = 'userLists';

export interface UserList {
  id: string;
  name: string;
  items: any[];
  /** If true, show "SHARED" on view lists page; otherwise "PRIVATE" */
  hasBeenShared?: boolean;
}

interface AddToListModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onSaved?: () => void;
}

function loadUserLists(): UserList[] {
  try {
    const raw = localStorage.getItem(USER_LISTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUserLists(lists: UserList[]) {
  localStorage.setItem(USER_LISTS_KEY, JSON.stringify(lists));
  window.dispatchEvent(new CustomEvent('userListsUpdated'));
}

export default function AddToListModal({
  isOpen,
  onClose,
  item,
  onSaved
}: AddToListModalProps) {
  const [lists, setLists] = useState<UserList[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [listDropdownValue, setListDropdownValue] = useState('');
  const [saveErrorMessage, setSaveErrorMessage] = useState('');
  const [isCreatingNewList, setIsCreatingNewList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const newListInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const loadedLists = loadUserLists();
      setLists(loadedLists);
      setListDropdownValue('');
      setSaveErrorMessage('');
      setIsCreatingNewList(false);
      setNewListName('');
      // Pre-select lists that already contain this item
      if (item?.id) {
        const idsOfListsContainingItem = loadedLists
          .filter((list) => list.items.some((i: any) => i.id === item.id))
          .map((list) => list.id);
        setSelectedIds(new Set(idsOfListsContainingItem));
      } else {
        setSelectedIds(new Set());
      }
    }
  }, [isOpen, item?.id]);

  useEffect(() => {
    if (isCreatingNewList && newListInputRef.current) {
      newListInputRef.current.focus();
    }
  }, [isCreatingNewList]);

  const toggleList = (id: string) => {
    setSaveErrorMessage('');
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleListDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setListDropdownValue(''); // reset so user can select again
    setSaveErrorMessage('');
    if (value === '__create__') {
      setIsCreatingNewList(true);
      setNewListName('');
    } else if (value) {
      setSelectedIds((prev) => new Set(prev).add(value));
    }
  };

  const handleCreateNewListSubmit = () => {
    const trimmed = newListName.trim();
    if (!trimmed) return;
    const newList: UserList = {
      id: `list-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: trimmed,
      items: []
    };
    const updated = [...lists, newList];
    setLists(updated);
    saveUserLists(updated);
    setSelectedIds((prev) => new Set(prev).add(newList.id));
    setNewListName('');
    setIsCreatingNewList(false);
  };

  const handleSave = () => {
    if (!item) {
      onClose();
      return;
    }
    setSaveErrorMessage('');
    const itemId = item.id;
    const updated = lists.map((list) => {
      const alreadyHas = list.items.some((i: any) => i.id === itemId);
      if (selectedIds.has(list.id)) {
        if (alreadyHas) return list;
        const addedFrom = item.addedFrom || (String(item.id || '').startsWith('build-a-wig-') ? 'cart' : 'unit');
        return { ...list, items: [...list.items, { ...item, quantity: item.quantity ?? 1, addedFrom }] };
      }
      if (!alreadyHas) return list;
      return { ...list, items: list.items.filter((i: any) => i.id !== itemId) };
    });
    saveUserLists(updated);
    onSaved?.();
    onClose();
  };

  if (!isOpen) return null;

  const listsContainingItem = item?.id
    ? lists.filter((list) => list.items.some((i: any) => i.id === item.id))
    : [];
  const selectedNotYetContaining = lists.filter(
    (list) => selectedIds.has(list.id) && !list.items.some((i: any) => i.id === item?.id)
  );
  const displayLists = [...selectedNotYetContaining, ...listsContainingItem];

  return (
    <div
      data-attribute="add-to-list-modal"
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
        className="p-6"
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
          ADD TO LIST
        </h3>

        {/* Lists this item is already in (only show these) */}
        <div style={{ marginBottom: '16px' }}>
          {lists.length === 0 ? (
            <p
              style={{
                fontFamily: '"Futura PT Medium"',
                fontSize: '11px',
                color: '#000000',
                marginBottom: '8px',
                textTransform: 'uppercase',
                textAlign: 'center'
              }}
            >
              YOU DON'T HAVE ANY LISTS YET.
            </p>
          ) : displayLists.length > 0 ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {displayLists.map((list) => {
                  const isChecked = selectedIds.has(list.id);
                  return (
                    <div
                      key={list.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                      }}
                      onClick={() => toggleList(list.id)}
                    >
                      <div
                        style={{
                          width: '14px',
                          height: '14px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1.3px solid #000000',
                          backgroundColor: 'transparent',
                          position: 'relative',
                          flexShrink: 0
                        }}
                      >
                        {isChecked && (
                          <img
                            src="/assets/checkbox.svg"
                            alt="checked"
                            style={{ width: '14px', height: '14px', position: 'absolute' }}
                          />
                        )}
                      </div>
                      <span
                        style={{
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '12px',
                          color: '#000000',
                          textTransform: 'uppercase'
                        }}
                      >
                        {list.name}
                        {list.items.length > 0 && (
                          <span style={{ color: '#808080', fontSize: '12px', fontFamily: '"Futura PT Demi"' }}> ({list.items.length})</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>

        {/* List dropdown or create-new-list text field (same box styling) */}
        <div style={{ marginBottom: '20px' }}>
          {isCreatingNewList ? (
            <div style={{ display: 'flex', alignItems: 'stretch', gap: '8px' }}>
              <input
                ref={newListInputRef}
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateNewListSubmit();
                  if (e.key === 'Escape') {
                    setIsCreatingNewList(false);
                    setNewListName('');
                  }
                }}
                style={{
                  flex: 1,
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
              <button
                type="button"
                onClick={handleCreateNewListSubmit}
                style={{
                  height: '36px',
                  padding: '0 14px',
                  border: '1.3px solid #000000',
                  fontFamily: '"Futura PT Medium"',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  backgroundColor: '#FFFFFF',
                  color: '#EB1C24',
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
            </div>
          ) : (
            <select
              value={listDropdownValue}
              onChange={handleListDropdownChange}
              className="add-to-list-modal-select"
              style={{
                width: '100%',
                height: '36px',
                padding: '8px 28px 8px 8px',
                border: '1.3px solid #000000',
                fontFamily: '"Futura PT Demi"',
                fontSize: '11px',
                color: '#808080',
                backgroundColor: '#FFFFFF',
                boxSizing: 'border-box',
                borderRadius: '0',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                backgroundImage: 'url("/assets/dropdown.svg")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
                backgroundSize: '7.2px'
              }}
            >
              <option value="">
                {lists.length === 0 ? 'SELECT A LIST' : 'ADD TO LIST'}
              </option>
              {lists.length === 0 ? (
                <option value="__create__">CREATE A LIST</option>
              ) : (
                <>
                  {lists.map((list) => (
                    <option key={list.id} value={list.id}>
                      {list.name.toUpperCase()}
                      {list.items.length > 0 ? ` (${list.items.length})` : ''}
                    </option>
                  ))}
                  <option value="__create__">CREATE A LIST</option>
                </>
              )}
            </select>
          )}
        </div>

        {/* Invalid selection message */}
        {saveErrorMessage && (
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
            {saveErrorMessage}
          </p>
        )}

        {/* Save & Cancel */}
        <div className="flex space-x-3">
          <button
            onClick={() => {
              if (isCreatingNewList) {
                setIsCreatingNewList(false);
                setNewListName('');
              } else {
                onClose();
              }
            }}
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
          <button
            onClick={handleSave}
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
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export { loadUserLists, saveUserLists, USER_LISTS_KEY };
