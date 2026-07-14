/**
 * Canonical Navigation master sheet semantic registry — Sprint 02 Phase 1.
 * 10×10 grid · 93 navigation icons · 7 reserved blank cells.
 * Master artwork: studio-world-navigation-master-sheet.png (no labels on sheet).
 */

export type NavigationMasterIconName =
  | 'home'
  | 'dashboard'
  | 'back'
  | 'forward'
  | 'previous'
  | 'next'
  | 'up'
  | 'down'
  | 'expand'
  | 'collapse'
  | 'fullscreen'
  | 'exitFullscreen'
  | 'menu'
  | 'sidebarLeft'
  | 'sidebarRight'
  | 'topPanel'
  | 'bottomPanel'
  | 'commandDock'
  | 'workbench'
  | 'departmentSwitcher'
  | 'search'
  | 'globalSearch'
  | 'quickSearch'
  | 'filter'
  | 'advancedFilter'
  | 'sort'
  | 'refresh'
  | 'sync'
  | 'history'
  | 'recent'
  | 'bookmarks'
  | 'favorite'
  | 'pin'
  | 'unpin'
  | 'location'
  | 'breadcrumb'
  | 'map'
  | 'compass'
  | 'target'
  | 'focus'
  | 'centerView'
  | 'fitView'
  | 'zoomIn'
  | 'zoomOut'
  | 'pan'
  | 'orbit'
  | 'perspective'
  | 'grid'
  | 'list'
  | 'cards'
  | 'columns'
  | 'treeView'
  | 'timeline'
  | 'gallery'
  | 'splitView'
  | 'tabs'
  | 'window'
  | 'newWindow'
  | 'duplicateWindow'
  | 'close'
  | 'open'
  | 'openInNew'
  | 'launch'
  | 'externalLink'
  | 'share'
  | 'copyLink'
  | 'navigateTo'
  | 'jump'
  | 'navReturn'
  | 'anchor'
  | 'bookmarkPosition'
  | 'notification'
  | 'alerts'
  | 'help'
  | 'information'
  | 'settings'
  | 'user'
  | 'profile'
  | 'logout'
  | 'login'
  | 'lock'
  | 'unlock'
  | 'visibilityOn'
  | 'visibilityOff'
  | 'chevronLeft'
  | 'chevronRight'
  | 'chevronUp'
  | 'chevronDown'
  | 'plus'
  | 'minus'
  | 'closeX'
  | 'check'
  | 'warning';

export type NavigationMasterIconEntry = {
  sourceLabel: string;
  row: number;
  column: number;
  intendedUse: string;
  accessibleLabel: string;
  keywords: string[];
};

export const NAVIGATION_MASTER_ICON_GRID = {
  rows: 10,
  columns: 10,
  totalCells: 100,
  iconCount: 93,
  reservedBlankCells: 7,
} as const;

export const NAVIGATION_MASTER_ICON_REGISTRY: Record<NavigationMasterIconName, NavigationMasterIconEntry> = {
  home: { sourceLabel: 'HOME', row: 0, column: 0, intendedUse: 'Primary home / landing navigation', accessibleLabel: 'Home', keywords: ['home', 'landing', 'start'] },
  dashboard: { sourceLabel: 'DASHBOARD', row: 0, column: 1, intendedUse: 'Dashboard / headquarters overview', accessibleLabel: 'Dashboard', keywords: ['dashboard', 'overview', 'hq'] },
  back: { sourceLabel: 'BACK', row: 0, column: 2, intendedUse: 'Navigate back one step', accessibleLabel: 'Back', keywords: ['back', 'history', 'undo'] },
  forward: { sourceLabel: 'FORWARD', row: 0, column: 3, intendedUse: 'Navigate forward one step', accessibleLabel: 'Forward', keywords: ['forward', 'redo'] },
  previous: { sourceLabel: 'PREVIOUS', row: 0, column: 4, intendedUse: 'Previous item in sequence', accessibleLabel: 'Previous', keywords: ['previous', 'prior'] },
  next: { sourceLabel: 'NEXT', row: 0, column: 5, intendedUse: 'Next item in sequence', accessibleLabel: 'Next', keywords: ['next', 'advance'] },
  up: { sourceLabel: 'UP', row: 0, column: 6, intendedUse: 'Move up / scroll up', accessibleLabel: 'Up', keywords: ['up', 'ascend'] },
  down: { sourceLabel: 'DOWN', row: 0, column: 7, intendedUse: 'Move down / scroll down', accessibleLabel: 'Down', keywords: ['down', 'descend'] },
  expand: { sourceLabel: 'EXPAND', row: 0, column: 8, intendedUse: 'Expand panel or section', accessibleLabel: 'Expand', keywords: ['expand', 'open', 'grow'] },
  collapse: { sourceLabel: 'COLLAPSE', row: 0, column: 9, intendedUse: 'Collapse panel or section', accessibleLabel: 'Collapse', keywords: ['collapse', 'shrink'] },

  fullscreen: { sourceLabel: 'FULLSCREEN', row: 1, column: 0, intendedUse: 'Enter fullscreen mode', accessibleLabel: 'Fullscreen', keywords: ['fullscreen', 'immersive'] },
  exitFullscreen: { sourceLabel: 'EXIT FULLSCREEN', row: 1, column: 1, intendedUse: 'Exit fullscreen mode', accessibleLabel: 'Exit fullscreen', keywords: ['exit', 'fullscreen'] },
  menu: { sourceLabel: 'MENU', row: 1, column: 2, intendedUse: 'Open main menu', accessibleLabel: 'Menu', keywords: ['menu', 'hamburger'] },
  sidebarLeft: { sourceLabel: 'SIDEBAR LEFT', row: 1, column: 3, intendedUse: 'Toggle left sidebar', accessibleLabel: 'Sidebar left', keywords: ['sidebar', 'left', 'panel'] },
  sidebarRight: { sourceLabel: 'SIDEBAR RIGHT', row: 1, column: 4, intendedUse: 'Toggle right sidebar', accessibleLabel: 'Sidebar right', keywords: ['sidebar', 'right', 'panel'] },
  topPanel: { sourceLabel: 'TOP PANEL', row: 1, column: 5, intendedUse: 'Toggle top panel', accessibleLabel: 'Top panel', keywords: ['top', 'panel', 'header'] },
  bottomPanel: { sourceLabel: 'BOTTOM PANEL', row: 1, column: 6, intendedUse: 'Toggle bottom panel', accessibleLabel: 'Bottom panel', keywords: ['bottom', 'panel', 'dock'] },
  commandDock: { sourceLabel: 'COMMAND DOCK', row: 1, column: 7, intendedUse: 'Studio World command dock', accessibleLabel: 'Command dock', keywords: ['command', 'dock', 'console'] },
  workbench: { sourceLabel: 'WORKBENCH', row: 1, column: 8, intendedUse: 'Department workbench surface', accessibleLabel: 'Workbench', keywords: ['workbench', 'tools'] },
  departmentSwitcher: { sourceLabel: 'DEPARTMENT SWITCHER', row: 1, column: 9, intendedUse: 'Switch active department', accessibleLabel: 'Department switcher', keywords: ['department', 'switch'] },

  search: { sourceLabel: 'SEARCH', row: 2, column: 0, intendedUse: 'Local search', accessibleLabel: 'Search', keywords: ['search', 'find'] },
  globalSearch: { sourceLabel: 'GLOBAL SEARCH', row: 2, column: 1, intendedUse: 'Global spotlight search', accessibleLabel: 'Global search', keywords: ['search', 'global', 'spotlight'] },
  quickSearch: { sourceLabel: 'QUICK SEARCH', row: 2, column: 2, intendedUse: 'Quick inline search', accessibleLabel: 'Quick search', keywords: ['search', 'quick'] },
  filter: { sourceLabel: 'FILTER', row: 2, column: 3, intendedUse: 'Filter results', accessibleLabel: 'Filter', keywords: ['filter', 'refine'] },
  advancedFilter: { sourceLabel: 'ADVANCED FILTER', row: 2, column: 4, intendedUse: 'Advanced filter panel', accessibleLabel: 'Advanced filter', keywords: ['filter', 'advanced'] },
  sort: { sourceLabel: 'SORT', row: 2, column: 5, intendedUse: 'Sort ordering', accessibleLabel: 'Sort', keywords: ['sort', 'order'] },
  refresh: { sourceLabel: 'REFRESH', row: 2, column: 6, intendedUse: 'Refresh current view', accessibleLabel: 'Refresh', keywords: ['refresh', 'reload'] },
  sync: { sourceLabel: 'SYNC', row: 2, column: 7, intendedUse: 'Synchronize data', accessibleLabel: 'Sync', keywords: ['sync', 'cloud'] },
  history: { sourceLabel: 'HISTORY', row: 2, column: 8, intendedUse: 'View history', accessibleLabel: 'History', keywords: ['history', 'timeline'] },
  recent: { sourceLabel: 'RECENT', row: 2, column: 9, intendedUse: 'Recently used items', accessibleLabel: 'Recent', keywords: ['recent', 'clock'] },

  bookmarks: { sourceLabel: 'BOOKMARKS', row: 3, column: 0, intendedUse: 'Bookmarks collection', accessibleLabel: 'Bookmarks', keywords: ['bookmarks', 'saved'] },
  favorite: { sourceLabel: 'FAVORITE', row: 3, column: 1, intendedUse: 'Mark as favorite', accessibleLabel: 'Favorite', keywords: ['favorite', 'star'] },
  pin: { sourceLabel: 'PIN', row: 3, column: 2, intendedUse: 'Pin item', accessibleLabel: 'Pin', keywords: ['pin', 'sticky'] },
  unpin: { sourceLabel: 'UNPIN', row: 3, column: 3, intendedUse: 'Unpin item', accessibleLabel: 'Unpin', keywords: ['unpin'] },
  location: { sourceLabel: 'LOCATION', row: 3, column: 4, intendedUse: 'Location / place marker', accessibleLabel: 'Location', keywords: ['location', 'pin', 'map'] },
  breadcrumb: { sourceLabel: 'BREADCRUMB', row: 3, column: 5, intendedUse: 'Breadcrumb trail', accessibleLabel: 'Breadcrumb', keywords: ['breadcrumb', 'path'] },
  map: { sourceLabel: 'MAP', row: 3, column: 6, intendedUse: 'Map view', accessibleLabel: 'Map', keywords: ['map', 'world'] },
  compass: { sourceLabel: 'COMPASS', row: 3, column: 7, intendedUse: 'Compass / orientation', accessibleLabel: 'Compass', keywords: ['compass', 'north'] },
  target: { sourceLabel: 'TARGET', row: 3, column: 8, intendedUse: 'Target / aim', accessibleLabel: 'Target', keywords: ['target', 'crosshair'] },
  focus: { sourceLabel: 'FOCUS', row: 3, column: 9, intendedUse: 'Focus mode', accessibleLabel: 'Focus', keywords: ['focus', 'isolate'] },

  centerView: { sourceLabel: 'CENTER VIEW', row: 4, column: 0, intendedUse: 'Center viewport', accessibleLabel: 'Center view', keywords: ['center', 'viewport'] },
  fitView: { sourceLabel: 'FIT VIEW', row: 4, column: 1, intendedUse: 'Fit content to view', accessibleLabel: 'Fit view', keywords: ['fit', 'frame'] },
  zoomIn: { sourceLabel: 'ZOOM IN', row: 4, column: 2, intendedUse: 'Zoom in', accessibleLabel: 'Zoom in', keywords: ['zoom', 'magnify'] },
  zoomOut: { sourceLabel: 'ZOOM OUT', row: 4, column: 3, intendedUse: 'Zoom out', accessibleLabel: 'Zoom out', keywords: ['zoom', 'reduce'] },
  pan: { sourceLabel: 'PAN', row: 4, column: 4, intendedUse: 'Pan viewport', accessibleLabel: 'Pan', keywords: ['pan', 'move'] },
  orbit: { sourceLabel: 'ORBIT', row: 4, column: 5, intendedUse: 'Orbit camera', accessibleLabel: 'Orbit', keywords: ['orbit', '3d'] },
  perspective: { sourceLabel: 'PERSPECTIVE', row: 4, column: 6, intendedUse: 'Perspective view', accessibleLabel: 'Perspective', keywords: ['perspective', 'camera'] },
  grid: { sourceLabel: 'GRID', row: 4, column: 7, intendedUse: 'Grid layout view', accessibleLabel: 'Grid', keywords: ['grid', 'layout'] },
  list: { sourceLabel: 'LIST', row: 4, column: 8, intendedUse: 'List layout view', accessibleLabel: 'List', keywords: ['list', 'rows'] },
  cards: { sourceLabel: 'CARDS', row: 4, column: 9, intendedUse: 'Card layout view', accessibleLabel: 'Cards', keywords: ['cards', 'tiles'] },

  columns: { sourceLabel: 'COLUMNS', row: 5, column: 0, intendedUse: 'Column layout view', accessibleLabel: 'Columns', keywords: ['columns', 'kanban'] },
  treeView: { sourceLabel: 'TREE VIEW', row: 5, column: 1, intendedUse: 'Tree hierarchy view', accessibleLabel: 'Tree view', keywords: ['tree', 'hierarchy'] },
  timeline: { sourceLabel: 'TIMELINE', row: 5, column: 2, intendedUse: 'Timeline view', accessibleLabel: 'Timeline', keywords: ['timeline', 'schedule'] },
  gallery: { sourceLabel: 'GALLERY', row: 5, column: 3, intendedUse: 'Gallery view', accessibleLabel: 'Gallery', keywords: ['gallery', 'media'] },
  splitView: { sourceLabel: 'SPLIT VIEW', row: 5, column: 4, intendedUse: 'Split pane view', accessibleLabel: 'Split view', keywords: ['split', 'dual'] },
  tabs: { sourceLabel: 'TABS', row: 5, column: 5, intendedUse: 'Tabbed interface', accessibleLabel: 'Tabs', keywords: ['tabs', 'switch'] },
  window: { sourceLabel: 'WINDOW', row: 5, column: 6, intendedUse: 'Window surface', accessibleLabel: 'Window', keywords: ['window', 'pane'] },
  newWindow: { sourceLabel: 'NEW WINDOW', row: 5, column: 7, intendedUse: 'Open new window', accessibleLabel: 'New window', keywords: ['window', 'new'] },
  duplicateWindow: { sourceLabel: 'DUPLICATE WINDOW', row: 5, column: 8, intendedUse: 'Duplicate window', accessibleLabel: 'Duplicate window', keywords: ['window', 'duplicate'] },
  close: { sourceLabel: 'CLOSE', row: 5, column: 9, intendedUse: 'Close panel or item', accessibleLabel: 'Close', keywords: ['close', 'dismiss'] },

  open: { sourceLabel: 'OPEN', row: 6, column: 0, intendedUse: 'Open item', accessibleLabel: 'Open', keywords: ['open', 'enter'] },
  openInNew: { sourceLabel: 'OPEN IN NEW', row: 6, column: 1, intendedUse: 'Open in new context', accessibleLabel: 'Open in new', keywords: ['open', 'new'] },
  launch: { sourceLabel: 'LAUNCH', row: 6, column: 2, intendedUse: 'Launch application', accessibleLabel: 'Launch', keywords: ['launch', 'start'] },
  externalLink: { sourceLabel: 'EXTERNAL LINK', row: 6, column: 3, intendedUse: 'External link', accessibleLabel: 'External link', keywords: ['external', 'link'] },
  share: { sourceLabel: 'SHARE', row: 6, column: 4, intendedUse: 'Share content', accessibleLabel: 'Share', keywords: ['share', 'send'] },
  copyLink: { sourceLabel: 'COPY LINK', row: 6, column: 5, intendedUse: 'Copy link to clipboard', accessibleLabel: 'Copy link', keywords: ['copy', 'link'] },
  navigateTo: { sourceLabel: 'NAVIGATE TO', row: 6, column: 6, intendedUse: 'Navigate to destination', accessibleLabel: 'Navigate to', keywords: ['navigate', 'go'] },
  jump: { sourceLabel: 'JUMP', row: 6, column: 7, intendedUse: 'Jump to location', accessibleLabel: 'Jump', keywords: ['jump', 'teleport'] },
  navReturn: { sourceLabel: 'RETURN', row: 6, column: 8, intendedUse: 'Return to previous context', accessibleLabel: 'Return', keywords: ['return', 'back'] },
  anchor: { sourceLabel: 'ANCHOR', row: 6, column: 9, intendedUse: 'Anchor position', accessibleLabel: 'Anchor', keywords: ['anchor', 'fixed'] },

  bookmarkPosition: { sourceLabel: 'BOOKMARK POSITION', row: 7, column: 0, intendedUse: 'Save spatial bookmark', accessibleLabel: 'Bookmark position', keywords: ['bookmark', 'position'] },
  notification: { sourceLabel: 'NOTIFICATION', row: 7, column: 1, intendedUse: 'Notifications', accessibleLabel: 'Notification', keywords: ['notification', 'bell'] },
  alerts: { sourceLabel: 'ALERTS', row: 7, column: 2, intendedUse: 'Alerts center', accessibleLabel: 'Alerts', keywords: ['alerts', 'warning'] },
  help: { sourceLabel: 'HELP', row: 7, column: 3, intendedUse: 'Help / support', accessibleLabel: 'Help', keywords: ['help', 'support'] },
  information: { sourceLabel: 'INFORMATION', row: 7, column: 4, intendedUse: 'Information details', accessibleLabel: 'Information', keywords: ['info', 'details'] },
  settings: { sourceLabel: 'SETTINGS', row: 7, column: 5, intendedUse: 'Settings / preferences', accessibleLabel: 'Settings', keywords: ['settings', 'gear'] },
  user: { sourceLabel: 'USER', row: 7, column: 6, intendedUse: 'User account', accessibleLabel: 'User', keywords: ['user', 'account'] },
  profile: { sourceLabel: 'PROFILE', row: 7, column: 7, intendedUse: 'User profile', accessibleLabel: 'Profile', keywords: ['profile', 'avatar'] },
  logout: { sourceLabel: 'LOGOUT', row: 7, column: 8, intendedUse: 'Sign out', accessibleLabel: 'Logout', keywords: ['logout', 'signout'] },
  login: { sourceLabel: 'LOGIN', row: 7, column: 9, intendedUse: 'Sign in', accessibleLabel: 'Login', keywords: ['login', 'signin'] },

  lock: { sourceLabel: 'LOCK', row: 8, column: 0, intendedUse: 'Lock / secure', accessibleLabel: 'Lock', keywords: ['lock', 'secure'] },
  unlock: { sourceLabel: 'UNLOCK', row: 8, column: 1, intendedUse: 'Unlock', accessibleLabel: 'Unlock', keywords: ['unlock'] },
  visibilityOn: { sourceLabel: 'VISIBILITY ON', row: 8, column: 2, intendedUse: 'Show / visible', accessibleLabel: 'Visibility on', keywords: ['visible', 'show', 'eye'] },
  visibilityOff: { sourceLabel: 'VISIBILITY OFF', row: 8, column: 3, intendedUse: 'Hide / invisible', accessibleLabel: 'Visibility off', keywords: ['hidden', 'hide', 'eye'] },
  chevronLeft: { sourceLabel: 'CHEVRON LEFT', row: 8, column: 4, intendedUse: 'Chevron left', accessibleLabel: 'Chevron left', keywords: ['chevron', 'left'] },
  chevronRight: { sourceLabel: 'CHEVRON RIGHT', row: 8, column: 5, intendedUse: 'Chevron right', accessibleLabel: 'Chevron right', keywords: ['chevron', 'right'] },
  chevronUp: { sourceLabel: 'CHEVRON UP', row: 8, column: 6, intendedUse: 'Chevron up', accessibleLabel: 'Chevron up', keywords: ['chevron', 'up'] },
  chevronDown: { sourceLabel: 'CHEVRON DOWN', row: 8, column: 7, intendedUse: 'Chevron down', accessibleLabel: 'Chevron down', keywords: ['chevron', 'down'] },
  plus: { sourceLabel: 'PLUS', row: 8, column: 8, intendedUse: 'Add / create', accessibleLabel: 'Plus', keywords: ['plus', 'add'] },
  minus: { sourceLabel: 'MINUS', row: 8, column: 9, intendedUse: 'Remove / subtract', accessibleLabel: 'Minus', keywords: ['minus', 'remove'] },

  closeX: { sourceLabel: 'CLOSE X', row: 9, column: 0, intendedUse: 'Close dismiss X', accessibleLabel: 'Close X', keywords: ['close', 'x', 'dismiss'] },
  check: { sourceLabel: 'CHECK', row: 9, column: 1, intendedUse: 'Confirm / checkmark', accessibleLabel: 'Check', keywords: ['check', 'confirm', 'done'] },
  warning: { sourceLabel: 'WARNING', row: 9, column: 2, intendedUse: 'Warning indicator', accessibleLabel: 'Warning', keywords: ['warning', 'alert', 'caution'] },
};

export const NAVIGATION_MASTER_ICON_NAMES = Object.keys(
  NAVIGATION_MASTER_ICON_REGISTRY
) as NavigationMasterIconName[];

/** Reserved blank cells — row 9 columns 3–9 */
export const NAVIGATION_MASTER_BLANK_CELLS: Array<{ row: number; column: number }> = [
  { row: 9, column: 3 },
  { row: 9, column: 4 },
  { row: 9, column: 5 },
  { row: 9, column: 6 },
  { row: 9, column: 7 },
  { row: 9, column: 8 },
  { row: 9, column: 9 },
];

export function navigationMasterIconKeyToFilename(key: NavigationMasterIconName): string {
  return `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}.png`;
}
