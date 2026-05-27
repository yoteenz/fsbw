import type { UserList } from '../components/AddToListModal';
import { getCurrentUser } from './adminAuth';

const SHARED_REGISTRY_KEY = 'wishlistSharedListsByToken';

export interface WishlistSharedListSnapshot {
  ownerEmail: string;
  listId: string;
  name: string;
  items: unknown[];
  updatedAt: string;
  /** Set when someone other than the list owner opens the share link. */
  viewedByNonOwner?: boolean;
}

type SharedRegistry = Record<string, WishlistSharedListSnapshot>;

function normalizeEmail(email: string | null | undefined): string {
  return (email || '').trim().toLowerCase();
}

function loadRegistry(): SharedRegistry {
  try {
    const raw = localStorage.getItem(SHARED_REGISTRY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as SharedRegistry;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveRegistry(registry: SharedRegistry): void {
  localStorage.setItem(SHARED_REGISTRY_KEY, JSON.stringify(registry));
  window.dispatchEvent(new CustomEvent('wishlistSharedRegistryUpdated'));
}

function userListsStorageKey(email: string): string {
  const e = normalizeEmail(email);
  return e ? `userLists_${e}` : 'userLists';
}

function readListsFromKey(key: string): UserList[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeListsToKey(key: string, lists: UserList[]): void {
  localStorage.setItem(key, JSON.stringify(lists));
}

function markListSharedInStorage(ownerEmail: string, listId: string): void {
  const e = normalizeEmail(ownerEmail);
  if (!e) return;
  let changed = false;

  const perUserKey = userListsStorageKey(e);
  const perUserLists = readListsFromKey(perUserKey).map((list) => {
    if (list.id !== listId || list.hasBeenShared) return list;
    changed = true;
    return { ...list, hasBeenShared: true };
  });
  if (changed) writeListsToKey(perUserKey, perUserLists);

  try {
    const current = getCurrentUser();
    if (normalizeEmail(current?.email) === e) {
      const globalLists = readListsFromKey('userLists').map((list) => {
        if (list.id !== listId || list.hasBeenShared) return list;
        return { ...list, hasBeenShared: true };
      });
      writeListsToKey('userLists', globalLists);
      window.dispatchEvent(new CustomEvent('userListsUpdated'));
    }
  } catch {
    // ignore
  }
}

export function buildWishlistShareUrl(shareToken: string): string {
  const base = typeof window !== 'undefined' ? window.location.origin : '';
  return `${base}/wishlist/shared/${encodeURIComponent(shareToken)}`;
}

export function ensureListShareToken(list: UserList): string {
  if (list.shareToken) return list.shareToken;
  return `share-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/** Publish / refresh the public snapshot for a list (call when owner opens share). */
export function publishSharedListSnapshot(list: UserList, ownerEmail: string): UserList {
  const email = normalizeEmail(ownerEmail);
  const shareToken = ensureListShareToken(list);
  const registry = loadRegistry();
  registry[shareToken] = {
    ownerEmail: email,
    listId: list.id,
    name: list.name,
    items: Array.isArray(list.items) ? list.items : [],
    updatedAt: new Date().toISOString(),
    viewedByNonOwner: registry[shareToken]?.viewedByNonOwner ?? false,
  };
  saveRegistry(registry);
  return { ...list, shareToken };
}

export function getSharedListByToken(token: string): WishlistSharedListSnapshot | null {
  const registry = loadRegistry();
  return registry[token] ?? null;
}

/** True when the list should show SHARED (viewed by a non-owner after share). */
export function isListMarkedShared(list: UserList): boolean {
  if (list.hasBeenShared) return true;
  if (list.shareToken) {
    const snap = getSharedListByToken(list.shareToken);
    if (snap?.viewedByNonOwner) return true;
  }
  return false;
}

export function getUserListVisibilityLabel(list: UserList): 'SHARED' | 'PRIVATE' {
  return isListMarkedShared(list) ? 'SHARED' : 'PRIVATE';
}

/**
 * When owner loads lists, persist SHARED from the global registry onto their list rows.
 */
export function syncUserListsSharedStatus(lists: UserList[]): UserList[] {
  const registry = loadRegistry();
  let changed = false;
  const next = lists.map((list) => {
    if (!list.shareToken) return list;
    const snap = registry[list.shareToken];
    if (snap?.viewedByNonOwner && !list.hasBeenShared) {
      changed = true;
      return { ...list, hasBeenShared: true };
    }
    return list;
  });
  return changed ? next : lists;
}

/**
 * Call on the public share page. Marks SHARED when the viewer is not the list owner.
 */
export function recordSharedListView(shareToken: string): void {
  const registry = loadRegistry();
  const snap = registry[shareToken];
  if (!snap) return;

  const viewerEmail = normalizeEmail(getCurrentUser()?.email);
  const ownerEmail = normalizeEmail(snap.ownerEmail);
  if (viewerEmail && viewerEmail === ownerEmail) return;

  if (!snap.viewedByNonOwner) {
    registry[shareToken] = { ...snap, viewedByNonOwner: true };
    saveRegistry(registry);
    markListSharedInStorage(snap.ownerEmail, snap.listId);
  }
}

export function prepareListForShare(list: UserList, ownerEmail: string): { list: UserList; shareUrl: string } {
  const updated = publishSharedListSnapshot(list, ownerEmail);
  const shareUrl = buildWishlistShareUrl(updated.shareToken!);
  return { list: updated, shareUrl };
}
