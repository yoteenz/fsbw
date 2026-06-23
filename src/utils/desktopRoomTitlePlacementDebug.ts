import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { isDesktopArtboardLayoutActive } from './desktopPreview';

export const ROOM_TITLE_DEBUG_SESSION_KEY = 'baw_room_title_debug';
export const ROOM_TITLE_EDIT_SESSION_KEY = 'baw_room_title_edit';

export const DESKTOP_ROOM_TITLE_TABLET_MIN_WIDTH = 768;
export const DESKTOP_ROOM_TITLE_DESKTOP_MIN_WIDTH = 1024;

export type DesktopRoomTitleViewportProfile = 'desktop' | 'tablet';

export function isDesktopRoomTitleDebugEnabledFromSearch(search: string): boolean {
  try {
    const params = new URLSearchParams(search);
    if (params.get('roomTitleDebug') === '0') {
      sessionStorage.removeItem(ROOM_TITLE_DEBUG_SESSION_KEY);
      return false;
    }
    const flag = params.get('roomTitleDebug');
    if (flag === '1' || flag === 'true' || flag === 'yes') {
      sessionStorage.setItem(ROOM_TITLE_DEBUG_SESSION_KEY, '1');
      return true;
    }
    return sessionStorage.getItem(ROOM_TITLE_DEBUG_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function isDesktopRoomTitleEditEnabledFromSearch(search: string): boolean {
  if (!isDesktopRoomTitleDebugEnabledFromSearch(search)) return false;
  try {
    const params = new URLSearchParams(search);
    if (params.get('roomTitleEdit') === '0') {
      sessionStorage.removeItem(ROOM_TITLE_EDIT_SESSION_KEY);
      return false;
    }
    const flag = params.get('roomTitleEdit');
    if (flag === '1' || flag === 'true' || flag === 'yes') {
      sessionStorage.setItem(ROOM_TITLE_EDIT_SESSION_KEY, '1');
      return true;
    }
    return sessionStorage.getItem(ROOM_TITLE_EDIT_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function useDesktopRoomTitleDebugEnabled(): boolean {
  const { search } = useLocation();
  return useMemo(() => isDesktopRoomTitleDebugEnabledFromSearch(search), [search]);
}

export function useDesktopRoomTitleEditEnabled(): boolean {
  const { search } = useLocation();
  return useMemo(() => isDesktopRoomTitleEditEnabledFromSearch(search), [search]);
}

/** Native `/desktop/*` layout profile — null on phone artboard or narrow phone viewport. */
export function getDesktopRoomTitleViewportProfile(): DesktopRoomTitleViewportProfile | null {
  if (typeof window === 'undefined') return null;
  if (isDesktopArtboardLayoutActive()) return null;
  const width = window.innerWidth;
  if (width >= DESKTOP_ROOM_TITLE_DESKTOP_MIN_WIDTH) return 'desktop';
  if (width >= DESKTOP_ROOM_TITLE_TABLET_MIN_WIDTH) return 'tablet';
  return null;
}

export function useDesktopRoomTitleViewportProfile(): DesktopRoomTitleViewportProfile | null {
  const [profile, setProfile] = useState<DesktopRoomTitleViewportProfile | null>(() =>
    getDesktopRoomTitleViewportProfile(),
  );

  useEffect(() => {
    const sync = () => setProfile(getDesktopRoomTitleViewportProfile());
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  return profile;
}

export const ROOM_TITLE_PROFILE_LABEL: Record<DesktopRoomTitleViewportProfile, string> = {
  desktop: 'DESKTOP',
  tablet: 'TABLET',
};

export const ROOM_TITLE_PROFILE_DEBUG_COLOR: Record<DesktopRoomTitleViewportProfile, string> = {
  desktop: 'rgba(235, 28, 36, 0.92)',
  tablet: 'rgba(0, 188, 212, 0.92)',
};

export const ROOM_TITLE_PROFILE_DEBUG_FILL: Record<DesktopRoomTitleViewportProfile, string> = {
  desktop: 'rgba(235, 28, 36, 0.14)',
  tablet: 'rgba(0, 188, 212, 0.14)',
};
