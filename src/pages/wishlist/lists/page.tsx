import { useState, useEffect, useMemo } from 'react';
import { trackActivity } from '../../../utils/activity';
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import DynamicCartIcon from '../../../components/DynamicCartIcon';
import ConfirmationModal from '../../../components/ConfirmationModal';
import BrandMenuLinks from '../../../components/BrandMenuLinks';
import SocialMenuIcons from '../../../components/SocialMenuIcons';
import { loadUserLists, saveUserLists, type UserList } from '../../../components/AddToListModal';
import CreateNewListModal from '../../../components/CreateNewListModal';
import RenameListModal from '../../../components/RenameListModal';
import ShareListLinkModal from '../../../components/ShareListLinkModal';
import { getCurrentUser } from '../../../utils/adminAuth';
import {
  getUserListVisibilityLabel,
  prepareListForShare,
  publishSharedListSnapshot,
  republishSharedSnapshotsForLists,
  syncUserListsSharedStatus,
} from '../../../utils/wishlistListShare';
import { PageActionsBelowCard, pageActionButtonStyle } from '../../../layouts/PageActionsBelowCard';
import { ShopMobileMenuShopTab } from '../../../components/ShopMobileMenuShopTab';
import { ShopMobileMenuToolsTab } from '../../../components/ShopMobileMenuToolsTab';
import { signInHrefWithReturnTo } from '../../../utils/signInReturnTo';
import {
  buildWishlistItemDetailsHtml,
  formatWishlistListItemPrice,
  getWishlistBcfThumbSrc,
  getWishlistItemDisplayName,
  getWishlistItemDisplayPrice,
  getWishlistItemProductName,
  getWishlistItemRedSubtitle,
  getWishlistItemRoute,
  getWishlistUnitThumbImage,
  wishlistItemHasViewDetails,
} from '../../../utils/wishlistListItemDetails';
import { WishlistItemThumb } from '../../../components/wishlist/WishlistItemThumb';
import {
  WISHLIST_EXPANDED_LIST_LINE_PRICE_CLASS,
  WISHLIST_EXPANDED_LIST_LINE_PRICE_LIST_CLASS,
  WISHLIST_EXPANDED_LIST_LINE_PRICE_LAYER_LIST_CLASS,
  WISHLIST_EXPANDED_LIST_LINE_STARS_LIST_CLASS,
  WISHLIST_LISTS_PAGE_LINE_STARS_CLASS,
  WISHLIST_EXPANDED_LIST_VIEW_DETAILS_TOGGLE_CLASS,
  WISHLIST_EXPANDED_LIST_VIEW_DETAILS_TOGGLE_LIST_CLASS,
  WISHLIST_EXPANDED_LIST_VIEW_DETAILS_TOGGLE_LIST_VIEW_ONLY_CLASS,
} from '../wishlistExpandedListLineClasses';
import { WishlistItemCapSizeLine } from '../../../components/wishlist/WishlistItemCapSizeLine';
import { useProductInventorySnapshot } from '../../../hooks/useProductInventorySnapshot';
import { WigLineStockPrice } from '../../../components/shop/WigStockPrice';
import {
  attachStockStatusToLineItem,
  isLineItemOutOfStock,
} from '../../../utils/productInventoryAvailability';
import { CartLineTextLayer } from '../../../components/cart/CartLineProductTextStack';
import { WishlistLineProductTextStack } from '../../../components/wishlist/WishlistLineProductTextStack';
import {
  cartLineLayerInnerStyle,
  cartLineProductNameTextStyle,
  cartLineRedSubtitleTextStyle,
} from '../../../utils/cartLineProductLayers';

function getListOverviewThumbSrc(item: any): string {
  return getWishlistBcfThumbSrc(item) ?? getWishlistUnitThumbImage(item);
}

/** Canonical empty-list thumb (Supabase live-preview). */
const EMPTY_LIST_THUMB_SUPABASE_URL =
  'https://hyycomvcaqxxvyrfupes.supabase.co/storage/v1/object/public/live-preview/3D%20images/6KLNd6QdTtVWqfXcnpOsc_cChNXN8z.jpeg';

/** Thumbnail when a user list has no items (lists overview row only). */
const EMPTY_LIST_THUMB_SRC = EMPTY_LIST_THUMB_SUPABASE_URL;

/** List / expanded line rows: nudge right so thumbs are not clipped by card overflow. */
const LIST_ROW_CONTENT_OFFSET_LEFT_PX = 10;
/** Text column sits this many px higher than the thumb (thumb column gets matching marginTop). */
const EXPANDED_LIST_LINE_TEXT_SHIFT_UP_PX = 8;
/** Gray rule + spacing between overview list rows and expanded line items. */
const LIST_ROW_DIVIDER_BORDER = '1px solid #e5e5e5';
const LIST_ROW_GAP_BELOW_DIVIDER_PX = 18;

function listRowDividerStyles(index: number, total: number, options?: { insetBelowDivider?: boolean }): React.CSSProperties {
  const isLast = index >= total - 1;
  return {
    paddingBottom: '16px',
    ...(options?.insetBelowDivider && index > 0
      ? { paddingTop: `${EXPANDED_LIST_LINE_TEXT_SHIFT_UP_PX}px` }
      : {}),
    marginBottom: isLast ? '16px' : `${LIST_ROW_GAP_BELOW_DIVIDER_PX}px`,
    borderBottom: isLast ? 'none' : LIST_ROW_DIVIDER_BORDER,
  };
}

/** Expanded created-list item thumbs (line/grid); 20% larger than 88×110 overview size. */
const EXPANDED_LIST_ITEM_THUMB_WIDTH_PX = 88 * 1.2;
const EXPANDED_LIST_ITEM_THUMB_HEIGHT_PX = 110 * 1.2;
const EXPANDED_LIST_GRID_MIN_COL_PX = 100 * 1.2;
/** Extra vertical gap between grid rows (added above row 2+; symmetrical between all rows). */
const EXPANDED_LIST_GRID_ROW_GAP_BASE_PX = 20;
const EXPANDED_LIST_GRID_ROW_GAP_EXTRA_PX = 8;
const EXPANDED_LIST_GRID_ROW_GAP_PX = EXPANDED_LIST_GRID_ROW_GAP_BASE_PX + EXPANDED_LIST_GRID_ROW_GAP_EXTRA_PX;
const EXPANDED_LIST_GRID_COL_GAP_PX = 16;

const EXPANDED_LIST_LINE_NAME_FONT_PX = 26;
const EXPANDED_LIST_GRID_NAME_FONT_PX = 22;
const EXPANDED_LIST_LINE_NAME_TEXT_STYLE = (productName: string): React.CSSProperties => ({
  ...cartLineProductNameTextStyle(productName),
  fontSize: `${EXPANDED_LIST_LINE_NAME_FONT_PX}px`,
  color: '#000',
});

const EXPANDED_LIST_LINE_TEXT_MARGIN_TOP_PX = 16;

const EXPANDED_LIST_LINE_TEXT_COLUMN_STYLE: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  marginTop: `${EXPANDED_LIST_LINE_TEXT_MARGIN_TOP_PX}px`,
};

const EXPANDED_LIST_NO_REVIEWS_LABEL = 'NO REVIEWS SUBMITTED';
const EXPANDED_LIST_STAR_STROKE_FILTER = 'drop-shadow(0 0 0 1px black)';

function ExpandedListItemNoReviewStars({
  centered,
  listView,
}: {
  centered?: boolean;
  listView?: boolean;
}) {
  return (
    <div
      className={
        listView
          ? `${WISHLIST_EXPANDED_LIST_LINE_STARS_LIST_CLASS} ${WISHLIST_LISTS_PAGE_LINE_STARS_CLASS}`
          : undefined
      }
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        marginTop: listView ? undefined : '2px',
        marginBottom: '6px',
        ...(centered ? { justifyContent: 'center' } : {}),
      }}
    >
      {[...Array(5)].map((_, idx) => (
        <img
          key={idx}
          src="/assets/NOIR/star-symbol.png"
          alt=""
          style={{
            width: `${EXPANDED_LIST_STAR_SIZE_PX}px`,
            height: `${EXPANDED_LIST_STAR_SIZE_PX}px`,
            filter: EXPANDED_LIST_STAR_STROKE_FILTER,
          }}
        />
      ))}
    </div>
  );
}

const EXPANDED_LIST_LINE_THUMB_COLUMN_STYLE: React.CSSProperties = {
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginTop: `${EXPANDED_LIST_LINE_TEXT_SHIFT_UP_PX}px`,
};

const EXPANDED_LIST_STAR_SIZE_PX = 14 * 0.8;
const EXPANDED_LIST_RATING_FONT_PX = 9;

const EXPANDED_LIST_RAW_TEXT_STYLE: React.CSSProperties = {
  ...cartLineRedSubtitleTextStyle(),
  fontFamily: '"Futura PT Medium", Futura, sans-serif',
  fontSize: '10px',
  fontWeight: 500,
};

/** Grid view only — nudge red RAW line 2px up (line view unchanged). */
const EXPANDED_LIST_GRID_RAW_TEXT_STYLE: React.CSSProperties = {
  ...EXPANDED_LIST_RAW_TEXT_STYLE,
  textAlign: 'center',
  position: 'relative',
  top: -2,
};

const EXPANDED_LIST_RATING_TEXT_STYLE: React.CSSProperties = {
  fontFamily: '"Futura PT Medium", Futura, sans-serif',
  fontSize: `${EXPANDED_LIST_RATING_FONT_PX}px`,
  color: '#000000',
  textTransform: 'uppercase',
};

const EXPANDED_LIST_GRID_REMOVE_STYLE: React.CSSProperties = {
  fontFamily: '"Futura PT Demi", Futura, sans-serif',
  fontSize: '9px',
  color: '#999999',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  textTransform: 'uppercase',
};

const EXPANDED_LIST_LINE_PRICE_FONT_PX = 12;

const EXPANDED_LIST_LINE_PRICE_STYLE: React.CSSProperties = {
  fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
  fontSize: `${EXPANDED_LIST_LINE_PRICE_FONT_PX}px`,
  color: '#808080',
  textTransform: 'uppercase',
  margin: 0,
};

const EXPANDED_LIST_LINE_DETAILS_HTML_STYLE: React.CSSProperties = {
  fontFamily: '"Futura PT Book", Futura, sans-serif',
  color: '#000000',
  textTransform: 'uppercase',
  fontSize: '9px',
  marginTop: '2px',
  marginBottom: '0',
  lineHeight: '1.44',
  wordBreak: 'break-word',
};

function getExpandedListItemKey(item: any, index: number): string {
  if (item?.id != null && item.id !== '') return String(item.id);
  return `expanded-list-item-${index}`;
}

/** Red link under list line thumb — matches CartDropdown EDIT IN BUILD-A-WIG placement. */
const LIST_LINE_BAG_ADD_STYLE: React.CSSProperties = {
  fontFamily: '"Futura PT Medium", Futura, sans-serif',
  color: '#EB1C24',
  textTransform: 'uppercase',
  fontSize: '8.5px',
  marginTop: '8px',
  marginBottom: 0,
  lineHeight: '1.1',
  textAlign: 'center',
  cursor: 'pointer',
  width: `${EXPANDED_LIST_ITEM_THUMB_WIDTH_PX}px`,
};

const LIST_LINE_BAG_REMOVE_STYLE: React.CSSProperties = {
  ...LIST_LINE_BAG_ADD_STYLE,
  fontFamily: '"Futura PT Medium", Futura, sans-serif',
  color: '#999999',
};

function readCartItems(): any[] {
  try {
    const parsed = JSON.parse(localStorage.getItem('cartItems') || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Inset white ring + inner art area (non-empty list thumbs). */
const LIST_THUMB_FRAME_INSET_PX = 3;

/** Empty list thumb white ring (thinner than non-empty). */
const EMPTY_LIST_THUMB_FRAME_INSET_PX = 0.3;

/** Empty-list thumb art sits low in frame; nudge up inside the inner art area. */
const EMPTY_LIST_THUMB_OFFSET_UP_PX = 0;
/** Empty-list thumb scale (10% smaller than prior 0.88 → 0.792). */
const EMPTY_LIST_THUMB_SCALE = 0.792;

const LIST_OVERVIEW_THUMB_WIDTH_PX = 88;
const LIST_OVERVIEW_THUMB_HEIGHT_PX = 110;

/** BCF marble thumbs on `/wishlist/lists` only (not main wishlist or shared list). */
const LISTS_PAGE_BCF_THUMB_SCALE = 0.9;

function listsPageBcfThumbWidthPx(baseWidthPx: number): number {
  return Math.round(baseWidthPx * LISTS_PAGE_BCF_THUMB_SCALE);
}

function listsPageBcfThumbHeightPx(baseHeightPx: number): number {
  return Math.round(baseHeightPx * LISTS_PAGE_BCF_THUMB_SCALE);
}

function listsPageWishlistItemThumbSizePx(
  item: any,
  baseWidthPx: number,
  baseHeightPx: number
): { widthPx: number; heightPx: number } {
  if (getWishlistBcfThumbSrc(item)) {
    return {
      widthPx: listsPageBcfThumbWidthPx(baseWidthPx),
      heightPx: listsPageBcfThumbHeightPx(baseHeightPx),
    };
  }
  return { widthPx: baseWidthPx, heightPx: baseHeightPx };
}

function listLineBagLinkWidthPx(item: any): number {
  if (getWishlistBcfThumbSrc(item)) {
    return listsPageBcfThumbWidthPx(EXPANDED_LIST_ITEM_THUMB_WIDTH_PX);
  }
  return EXPANDED_LIST_ITEM_THUMB_WIDTH_PX;
}
const LISTS_OVERVIEW_GRID_MIN_COL_PX = 100;
const LISTS_OVERVIEW_GRID_ROW_GAP_PX = 20;
const LISTS_OVERVIEW_GRID_COL_GAP_PX = 16;

const LIST_OVERVIEW_NAME_STYLE: React.CSSProperties = {
  fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", cursive',
  fontSize: '18px',
  color: '#000',
  textTransform: 'uppercase',
};

const LIST_OVERVIEW_VISIBILITY_STYLE: React.CSSProperties = {
  fontFamily: '"Futura PT Medium", Futura, sans-serif',
  fontSize: '11px',
  color: '#666',
  margin: '2px 0 0 0',
  textTransform: 'uppercase',
};

/** Lists overview grid — tighter above/below gray PRIVATE/SHARED label (−2px above via margin-top 0). */
const LIST_OVERVIEW_VISIBILITY_GRID_STYLE: React.CSSProperties = {
  ...LIST_OVERVIEW_VISIBILITY_STYLE,
  margin: '0 0 -2px 0',
};

/** Red "EDIT LIST NAME" link below the gray visibility label (list view only).
 * Vertical offset: `.wishlist-lists-overview-edit-list-name-wrap` in index.css only (`margin-top` + `!important`; no margin on inline style). */
const LIST_OVERVIEW_EDIT_NAME_STYLE: React.CSSProperties = {
  fontFamily: '"Futura PT Medium", Futura, sans-serif',
  fontSize: '9px',
  color: '#EB1C24',
  textTransform: 'uppercase',
  cursor: 'pointer',
  margin: 0,
  padding: 0,
  position: 'static',
  top: 'auto',
};

const LIST_OVERVIEW_COUNT_STYLE: React.CSSProperties = {
  fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", cursive',
  fontSize: '12px',
  color: '#000',
  textTransform: 'uppercase',
};

function WishlistViewModeToggle({
  mode,
  onModeChange,
}: {
  mode: 'line' | 'grid';
  onModeChange: (mode: 'line' | 'grid') => void;
}) {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <button
        type="button"
        onClick={() => onModeChange('line')}
        style={{
          padding: '4px',
          border: mode === 'line' ? '1px solid #EB1C24' : '1px solid #ccc',
          background: 'none',
          cursor: 'pointer',
          borderRadius: 0,
          color: mode === 'line' ? '#EB1C24' : '#000',
        }}
        aria-label="Line view"
      >
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '12px', gap: '3px' }}>
          <div style={{ width: '12px', height: '1px', backgroundColor: 'currentColor' }} />
          <div style={{ width: '12px', height: '1px', backgroundColor: 'currentColor' }} />
          <div style={{ width: '12px', height: '1px', backgroundColor: 'currentColor' }} />
        </div>
      </button>
      <button
        type="button"
        onClick={() => onModeChange('grid')}
        style={{
          padding: '4px',
          border: mode === 'grid' ? '1px solid #EB1C24' : '1px solid #ccc',
          background: 'none',
          cursor: 'pointer',
          borderRadius: 0,
          color: mode === 'grid' ? '#EB1C24' : '#000',
        }}
        aria-label="Grid view"
      >
        <div
          style={{
            width: '12px',
            height: '12px',
            border: '1px solid currentColor',
            backgroundColor: 'white',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '50%',
              height: '1px',
              transform: 'translateY(-50%)',
              backgroundColor: 'currentColor',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: '1px',
              transform: 'translateX(-50%)',
              backgroundColor: 'currentColor',
            }}
          />
        </div>
      </button>
    </div>
  );
}

function WishlistListOverviewThumb({
  firstItem,
  thumbSrc,
}: {
  firstItem: any | undefined;
  thumbSrc: string;
}) {
  const bcfThumb = firstItem ? getWishlistBcfThumbSrc(firstItem) : null;
  const frameWidthPx = bcfThumb
    ? listsPageBcfThumbWidthPx(LIST_OVERVIEW_THUMB_WIDTH_PX)
    : LIST_OVERVIEW_THUMB_WIDTH_PX;
  const frameHeightPx = bcfThumb
    ? listsPageBcfThumbHeightPx(LIST_OVERVIEW_THUMB_HEIGHT_PX)
    : LIST_OVERVIEW_THUMB_HEIGHT_PX;
  return (
    <div
      className="relative bg-cover bg-center flex items-center justify-center cursor-pointer"
      style={{
        width: `${frameWidthPx}px`,
        height: `${frameHeightPx}px`,
        position: 'relative',
        boxSizing: 'border-box',
        ...(firstItem
          ? bcfThumb
            ? {
                border: '1.3px solid #000',
                boxShadow: `inset 0 0 0 ${LIST_THUMB_FRAME_INSET_PX}px #fff`,
                overflow: 'hidden',
              }
            : {
                backgroundImage: "url('/assets/leaf-brick-resize.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                border: '1.3px solid #000',
                boxShadow: `inset 0 0 0 ${LIST_THUMB_FRAME_INSET_PX}px #fff`,
                overflow: 'hidden',
              }
          : {
              border: '1.3px solid #000',
              overflow: 'hidden',
            }),
      }}
    >
      {firstItem ? (
        <img
          src={thumbSrc}
          alt=""
          style={
            bcfThumb
              ? {
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center',
                }
              : {
                  position: 'absolute',
                  left: '50%',
                  bottom: LIST_THUMB_FRAME_INSET_PX,
                  transform: 'translateX(-50%)',
                  width: 'auto',
                  height: '96%',
                  maxWidth: '106%',
                  objectFit: 'contain',
                  objectPosition: 'bottom',
                  zIndex: 1,
                }
          }
        />
      ) : (
        <>
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              boxShadow: `inset 0 0 0 ${EMPTY_LIST_THUMB_FRAME_INSET_PX}px #fff`,
              pointerEvents: 'none',
              zIndex: 2,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: EMPTY_LIST_THUMB_FRAME_INSET_PX,
              left: EMPTY_LIST_THUMB_FRAME_INSET_PX,
              right: EMPTY_LIST_THUMB_FRAME_INSET_PX,
              bottom: EMPTY_LIST_THUMB_FRAME_INSET_PX,
              overflow: 'hidden',
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <img
                src={thumbSrc}
                alt=""
                style={{
                  display: 'block',
                  width: `${EMPTY_LIST_THUMB_SCALE * 100}%`,
                  height: `${EMPTY_LIST_THUMB_SCALE * 100}%`,
                  objectFit: 'cover',
                  objectPosition: 'center',
                  transform: EMPTY_LIST_THUMB_OFFSET_UP_PX
                    ? `translateY(-${EMPTY_LIST_THUMB_OFFSET_UP_PX}px)`
                    : undefined,
                  flexShrink: 0,
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ViewListsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [legacySearchParams] = useSearchParams();
  /** Path segment `/wishlist/lists/:listId` — pushes history so browser Back returns to overview. */
  const { listId: expandedListId } = useParams<{ listId?: string }>();

  const openExpandedList = (listId: string) => {
    navigate(`/wishlist/lists/${encodeURIComponent(listId)}`);
  };

  const closeExpandedList = (options?: { replace?: boolean }) => {
    if (options?.replace || !expandedListId) {
      navigate('/wishlist/lists', { replace: true });
      return;
    }
    navigate(-1);
  };

  /** Migrate old `?list=` bookmarks to path-based URLs without an extra back step. */
  useEffect(() => {
    const legacyListId = legacySearchParams.get('list');
    if (legacyListId && !expandedListId) {
      navigate(`/wishlist/lists/${encodeURIComponent(legacyListId)}`, { replace: true });
    }
  }, [legacySearchParams, expandedListId, navigate]);
  const [lists, setLists] = useState<UserList[]>([]);
  const [cartCount, setCartCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('cartCount') || '0', 10);
    } catch (e) {
      return 0;
    }
  });
  const [cartSyncVersion, setCartSyncVersion] = useState(0);
  const cartItems = useMemo(() => readCartItems(), [cartCount, cartSyncVersion]);
  useProductInventorySnapshot();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileMenuActiveTab, setMobileMenuActiveTab] = useState<'SHOP' | 'TOOLS' | 'BRAND'>(() => {
    const pathname = window.location.pathname;
    if (pathname.includes('/tools') || pathname === '/tools/gift-card') return 'TOOLS';
    if (pathname.includes('/brand')) return 'BRAND';
    return 'SHOP';
  });
  const [mobileMenuExpandedItems, setMobileMenuExpandedItems] = useState<string[]>([]);
  const [isSignedIn] = useState(() => {
    try {
      return typeof window !== 'undefined' && localStorage.getItem('isSignedIn') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [showDeleteListConfirm, setShowDeleteListConfirm] = useState(false);
  const [listToDelete, setListToDelete] = useState<string | null>(null);
  const [showRemoveListItemConfirm, setShowRemoveListItemConfirm] = useState(false);
  const [listItemToRemove, setListItemToRemove] = useState<any>(null);
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [listToRename, setListToRename] = useState<UserList | null>(null);
  const [expandedViewMode, setExpandedViewMode] = useState<'grid' | 'line'>('line');
  const [listsOverviewViewMode, setListsOverviewViewMode] = useState<'grid' | 'line'>('line');
  const [viewingDetailsItemKey, setViewingDetailsItemKey] = useState<string | null>(null);
  const [showShareListModal, setShowShareListModal] = useState(false);
  const [shareListUrl, setShareListUrl] = useState('');

  useEffect(() => {
    setViewingDetailsItemKey(null);
  }, [expandedListId]);

  const refreshLists = () => {
    const loaded = loadUserLists();
    const synced = syncUserListsSharedStatus(loaded);
    const ownerEmail = getCurrentUser()?.email;
    if (ownerEmail) republishSharedSnapshotsForLists(synced, ownerEmail);
    if (synced !== loaded) saveUserLists(synced);
    setLists(synced);
  };

  const handleMobileMenuToggle = () => setShowMobileMenu((m) => !m);
  const handleMobileMenuTabClick = (tab: 'SHOP' | 'TOOLS' | 'BRAND') => setMobileMenuActiveTab(tab);
  const handleMobileMenuItemToggle = (label: string) => {
    setMobileMenuExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );
  };
  const handleMobileMenuSignInToggle = () => {
    if (isSignedIn) navigate('/account');
    else navigate(signInHrefWithReturnTo(location));
  };
  const handleDeleteList = () => {
    if (listToDelete) {
      const next = lists.filter((l) => l.id !== listToDelete);
      saveUserLists(next);
      setLists(next);
      setListToDelete(null);
      setShowDeleteListConfirm(false);
      if (expandedListId === listToDelete) closeExpandedList({ replace: true });
    }
  };

  const handleAddToBag = (item: any) => {
    if (isLineItemOutOfStock(item)) return;
    try {
      const existing = cartItems.find((ci: any) => ci.id === item.id);
      let updatedItems;
      if (existing) {
        updatedItems = cartItems.map((ci: any) =>
          ci.id === item.id ? { ...ci, quantity: (ci.quantity || 1) + (item.quantity || 1) } : ci
        );
      } else {
        updatedItems = [attachStockStatusToLineItem({ ...item, quantity: item.quantity || 1 }), ...cartItems];
      }
      localStorage.setItem('cartItems', JSON.stringify(updatedItems));
      const newCount = updatedItems.reduce((sum: number, ci: any) => sum + (ci.quantity || 1), 0);
      localStorage.setItem('cartCount', newCount.toString());
      setCartCount(newCount);
      setCartSyncVersion((v) => v + 1);
      window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      const pname = (item?.name || item?.productName || '').toString();
      trackActivity('add_to_cart', { source: 'wishlist_list', productName: pname || undefined });
    } catch (e) {
      console.error('Error adding to bag:', e);
    }
  };

  const handleRemoveFromBag = (item: any) => {
    try {
      const pname = (item?.name || item?.productName || '').toString().trim();
      const updatedItems = cartItems.filter((ci: any) => ci.id !== item.id);
      localStorage.setItem('cartItems', JSON.stringify(updatedItems));
      const newCount = updatedItems.reduce((sum: number, ci: any) => sum + (ci.quantity || 1), 0);
      localStorage.setItem('cartCount', newCount.toString());
      setCartCount(newCount);
      setCartSyncVersion((v) => v + 1);
      window.dispatchEvent(new CustomEvent('cartCountUpdated', { detail: newCount }));
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      trackActivity('remove_from_cart', {
        source: 'wishlist_list',
        change: 'removed_line',
        productName: pname || undefined,
      });
    } catch (e) {
      console.error('Error removing from bag:', e);
    }
  };

  const removeItemFromExpandedList = (item: any) => {
    if (!expandedListId) return;
    const expandedList = lists.find((l) => l.id === expandedListId);
    if (!expandedList) return;
    const nextItems = (expandedList.items || []).filter((i: any) => i.id !== item.id);
    const ownerEmail = getCurrentUser()?.email;
    const nextLists = lists.map((l) => {
      if (l.id !== expandedList.id) return l;
      let updated: UserList = { ...l, items: nextItems };
      if (updated.shareToken && ownerEmail) {
        updated = publishSharedListSnapshot(updated, ownerEmail);
      }
      return updated;
    });
    saveUserLists(nextLists);
    setLists(nextLists);
    if (nextItems.length === 0) closeExpandedList({ replace: true });
  };

  const handleConfirmRemoveListItem = () => {
    if (!listItemToRemove) return;
    removeItemFromExpandedList(listItemToRemove);
    setShowRemoveListItemConfirm(false);
    setListItemToRemove(null);
  };

  const requestRemoveListItemConfirm = (item: any) => {
    setListItemToRemove(item);
    setShowRemoveListItemConfirm(true);
  };

  const handleShareListClick = () => {
    if (!expandedListId) return;
    const list = lists.find((l) => l.id === expandedListId);
    if (!list) return;
    const ownerEmail = getCurrentUser()?.email;
    if (!ownerEmail) {
      navigate(signInHrefWithReturnTo(location));
      return;
    }
    const { list: updated, shareUrl } = prepareListForShare(list, ownerEmail);
    const next = lists.map((l) => (l.id === updated.id ? updated : l));
    saveUserLists(next);
    setLists(next);
    setShareListUrl(shareUrl);
    setShowShareListModal(true);
  };

  useEffect(() => {
    refreshLists();
    const handleUpdate = () => refreshLists();
    window.addEventListener('userListsUpdated', handleUpdate);
    window.addEventListener('wishlistSharedRegistryUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('userListsUpdated', handleUpdate);
      window.removeEventListener('wishlistSharedRegistryUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (expandedListId && lists.length > 0 && !lists.some((l) => l.id === expandedListId)) {
      closeExpandedList({ replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to URL/list data mismatch
  }, [expandedListId, lists]);

  useEffect(() => {
    const handleCartCountUpdate = (e: CustomEvent) => {
      setCartCount(e.detail);
      setCartSyncVersion((v) => v + 1);
    };
    const handleStorage = () => {
      try {
        setCartCount(parseInt(localStorage.getItem('cartCount') || '0', 10));
      } catch {
        setCartCount(0);
      }
      setCartSyncVersion((v) => v + 1);
    };
    window.addEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
    window.addEventListener('cartUpdated', handleStorage);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('cartCountUpdated', handleCartCountUpdate as EventListener);
      window.removeEventListener('cartUpdated', handleStorage);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ position: 'relative', minHeight: '100vh' }}>
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: `url('/assets/marble-half.png')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          backgroundAttachment: 'fixed'
        }}
      />
      <div className="relative z-10">
        <div className="flex flex-col py-5 px-4" style={{ minWidth: '100%', maxWidth: 'none', overflow: 'visible' }}>
          {/* Nav bar - same pattern as wishlist */}
          <div
            className="border-solid border-black flex justify-center items-center py-3 w-full mb-5 px-5 bg-white/60 backdrop-blur-sm relative"
            style={{ border: '1.3px solid black' }}
          >
            <div className="flex gap-5 absolute left-4">
              {showMobileMenu ? (
                <>
                  <button
                    onClick={() => navigate(isSignedIn ? '/account' : signInHrefWithReturnTo(location))}
                    className="cursor-pointer"
                    style={{ height: '15px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(4px)' }}
                  >
                    <img alt="Account" width="16" height="16" src="/assets/NOIR/account-icon.svg" />
                  </button>
                  <button
                    onClick={() => navigate(isSignedIn ? '/wishlist' : signInHrefWithReturnTo(location))}
                    className="cursor-pointer"
                    style={{ height: '21px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important', transform: 'translateX(2px)' }}
                  >
                    <img alt="Wishlist" width="18" height="18" src="/assets/wishlist-heart.svg" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => (expandedListId ? closeExpandedList() : navigate('/wishlist'))}
                  className="cursor-pointer"
                  style={{ height: '15px !important', width: '21px !important', padding: '0 !important', border: 'none !important', background: 'none !important' }}
                >
                  <img alt="Back" width="21" height="15" src="/assets/back-button.svg" />
                </button>
              )}
            </div>
            <p className="text-sm" style={{ fontFamily: '"Futura PT Book"', transform: 'translateY(1px)' }}>
              {showMobileMenu ? (
                <>
                  <span style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }} onClick={() => navigate('/lobby')}>
                    HOME &gt;
                  </span>{' '}
                  <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>MENU</span>
                </>
              ) : expandedListId ? (
                <>
                  <span style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }} onClick={() => closeExpandedList()}>
                    LISTS &gt;
                  </span>{' '}
                  <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>
                    {(lists.find((l) => l.id === expandedListId)?.name ?? '').toUpperCase()}
                  </span>
                </>
              ) : (
                <>
                  <span style={{ fontFamily: '"Futura PT Book"', fontWeight: '400', cursor: 'pointer' }} onClick={() => navigate('/wishlist')}>
                    WISHLIST &gt;
                  </span>{' '}
                  <span style={{ color: '#EB1C24', fontFamily: '"Futura PT Medium"', fontWeight: '500' }}>LISTS</span>
                </>
              )}
            </p>
            <div className="gap-5 flex absolute" style={{ right: '17px' }}>
              <div style={{ transform: `translateX(${cartCount === 0 ? 7 : 5}px)` }}>
                <DynamicCartIcon count={cartCount} width={22} height={19} variant="nav" />
              </div>
              <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg
                  width="17"
                  height="18"
                  viewBox="0 0 16 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="cursor-pointer"
                  onClick={handleMobileMenuToggle}
                  style={{ marginTop: '2px' }}
                >
                  <path d="M0 0H15.75V0.7H7.875H0V0ZM5.25 6.7H10.5H15.375V7.4H10.5H5.25V6.7ZM0 13.1H15.75V13.8H0V13.1Z" fill="black" />
                </svg>
              </div>
            </div>
          </div>

          {/* Main content box - menu when open, lists when closed */}
          <div
            className={showMobileMenu ? 'menu-toggle-card border border-black flex flex-col pt-6 pb-4 px-5 mb-2 bg-white/60 backdrop-blur-sm' : 'border border-black flex flex-col p-4 mb-2 bg-white/60 backdrop-blur-sm'}
            style={{
              borderWidth: '1.3px',
              minWidth: '100%',
              maxWidth: 'none',
              overflow: showMobileMenu ? 'visible' : 'hidden',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              ...(showMobileMenu
                ? {
                    minHeight: 'calc(100dvh - 80px)',
                    height: 'calc(100dvh - 80px)',
                  }
                : {
                    /* Same proportion as 520px on a 745px-tall viewport */
                    height: 'calc(100vh * 520 / 745)',
                    minHeight: 'calc(100vh * 520 / 745)',
                    maxHeight: 'calc(100vh * 520 / 745)',
                  }),
            }}
          >
            {showMobileMenu ? (
              /* Full menu - same as wishlist */
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', paddingTop: '20px', flex: 1, minHeight: 0, position: 'relative' }}>
                <div className="flex justify-center gap-8" style={{ marginBottom: '30px' }}>
                  {(['SHOP', 'TOOLS', 'BRAND'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => handleMobileMenuTabClick(tab)}
                      style={{
                        fontFamily: mobileMenuActiveTab === tab ? '"Futura PT Medium"' : '"Futura PT Book"',
                        fontSize: '14px',
                        color: mobileMenuActiveTab === tab ? '#EB1C24' : 'black',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        borderBottom: mobileMenuActiveTab === tab ? '1px solid #EB1C24' : 'none',
                        borderTop: 'none',
                        borderLeft: 'none',
                        borderRight: 'none',
                        paddingBottom: '4px',
                        background: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div style={{ flex: '1', overflowY: 'auto', marginBottom: '20px', minHeight: '0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                    {mobileMenuActiveTab === 'TOOLS' ? (

                      <ShopMobileMenuToolsTab

                        navigate={navigate}

                        closeMenu={() => setShowMobileMenu(false)}

                        labelTranslateX="13px"

                      />
                    ) : mobileMenuActiveTab === 'BRAND' ? (
                      <BrandMenuLinks onClose={() => setShowMobileMenu(false)} />
                    ) : (
                                            <ShopMobileMenuShopTab
                                              navigate={navigate}
                                              mobileMenuExpandedItems={mobileMenuExpandedItems}
                                              handleMobileMenuItemToggle={handleMobileMenuItemToggle}
                                              closeSubItemMenu={() => setShowMobileMenu(false)}
                                              labelTranslateX="13px"
                                              duplicateRowClickForStaticLinks
                                            />
                    )}
                  </div>
                </div>
                <div className="flex justify-center" style={{ marginBottom: '20px', marginTop: 'auto' }}>
                  <span onClick={handleMobileMenuSignInToggle} style={{ fontFamily: '"Futura PT Medium"', fontSize: '14px', color: '#EB1C24', fontWeight: '500', textTransform: 'uppercase', cursor: 'pointer' }}>
                    {isSignedIn ? 'SIGN OUT' : 'SIGN IN'}
                  </span>
                </div>
                <div style={{ marginBottom: '20px' }}><SocialMenuIcons /></div>
              </div>
            ) : (
              <>
                {/* Page-specific header: PRIVATE/SHARED when expanded, otherwise LISTS */}
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
                {(() => {
                  const expandedList = expandedListId ? lists.find((l) => l.id === expandedListId) : null;
                  const expandedItemCount = expandedList ? (expandedList.items?.length ?? 0) : 0;
                  const headerLabel =
                    expandedListId && expandedList
                      ? getUserListVisibilityLabel(expandedList)
                      : 'LISTS';
                  const headerCount =
                    expandedListId && expandedList ? expandedItemCount : lists.length;
                  return (
                    <div className="flex items-center justify-between -mt-1 pb-1 border-b border-gray-200" style={{ flexShrink: 0 }}>
                      <span
                        className="text-red-500 font-bold text-lg tracking-wider truncate text-left uppercase"
                        style={{ fontFamily: '"Futura PT Medium"', color: '#EB1C24', fontSize: '12px', fontWeight: '500' }}
                      >
                        {headerLabel}
                      </span>
                      <span
                        className="text-black font-bold text-lg flex-shrink-0 ml-2 uppercase"
                        style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif', fontSize: '17px' }}
                      >
                        {headerCount}
                      </span>
                    </div>
                  );
                })()}

                {/* Scrollable lists/content area */}
                <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {expandedListId ? (
                  (() => {
                    const expandedList = lists.find((l) => l.id === expandedListId);
                    if (!expandedList) return null;
                    const expandedItems: any[] = expandedList.items ?? [];
                    return (
                      <div
                        style={{
                          paddingTop: '8px',
                          flex: 1,
                          minHeight: 0,
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            marginTop: '6px',
                            marginBottom: expandedItems.length === 0 ? 0 : '16px',
                            flexShrink: 0,
                          }}
                        >
                          <WishlistViewModeToggle mode={expandedViewMode} onModeChange={setExpandedViewMode} />
                        </div>
                        {expandedItems.length === 0 ? (
                          <div
                            style={{
                              flex: 1,
                              minHeight: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <p
                              style={{
                                fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif',
                                fontSize: '11px',
                                color: '#808080',
                                textAlign: 'center',
                                textTransform: 'uppercase',
                                margin: 0,
                                padding: '0 20px',
                              }}
                            >
                              THERE ARE NO ITEMS IN THIS LIST.
                            </p>
                          </div>
                        ) : expandedViewMode === 'line' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, paddingTop: '10px' }}>
                            {expandedItems.map((item: any, index: number) => {
                              const itemProductName = getWishlistItemProductName(item);
                              const itemDisplayName = getWishlistItemDisplayName(item);
                              const itemRedSubtitle = getWishlistItemRedSubtitle(item);
                              const itemKey = getExpandedListItemKey(item, index);
                              const isViewingDetails = viewingDetailsItemKey === itemKey;
                              const showViewDetailsLink = wishlistItemHasViewDetails(item);
                              const itemPriceLabel = formatWishlistListItemPrice(
                                getWishlistItemDisplayPrice(item, getWishlistItemProductName(item))
                              );
                              const isInBag = cartItems.some((ci: any) => ci.id === item.id);
                              const isOutOfStock = isLineItemOutOfStock(item);
                              const thumbSize = listsPageWishlistItemThumbSizePx(
                                item,
                                EXPANDED_LIST_ITEM_THUMB_WIDTH_PX,
                                EXPANDED_LIST_ITEM_THUMB_HEIGHT_PX
                              );
                              const bagLinkWidthPx = listLineBagLinkWidthPx(item);
                              return (
                                <div
                                  key={item.id || index}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '16px',
                                    paddingLeft: LIST_ROW_CONTENT_OFFSET_LEFT_PX,
                                    ...listRowDividerStyles(index, expandedItems.length),
                                  }}
                                >
                                  <div style={EXPANDED_LIST_LINE_THUMB_COLUMN_STYLE}>
                                    <WishlistItemThumb
                                      item={item}
                                      widthPx={thumbSize.widthPx}
                                      heightPx={thumbSize.heightPx}
                                      onActivate={() => navigate(getWishlistItemRoute(item))}
                                    />
                                    {isOutOfStock ? (
                                      <p
                                        style={{
                                          ...LIST_LINE_BAG_ADD_STYLE,
                                          width: `${bagLinkWidthPx}px`,
                                          color: '#EB1C24',
                                          cursor: 'default',
                                        }}
                                      >
                                        OUT OF STOCK
                                      </p>
                                    ) : isInBag ? (
                                      <p
                                        className="font-bold hover:opacity-80 transition-opacity"
                                        style={{ ...LIST_LINE_BAG_REMOVE_STYLE, width: `${bagLinkWidthPx}px` }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRemoveFromBag(item);
                                        }}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.stopPropagation();
                                            handleRemoveFromBag(item);
                                          }
                                        }}
                                      >
                                        REMOVE FROM BAG
                                      </p>
                                    ) : (
                                      <p
                                        className="font-bold hover:opacity-80 transition-opacity"
                                        style={{ ...LIST_LINE_BAG_ADD_STYLE, width: `${bagLinkWidthPx}px` }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAddToBag(item);
                                        }}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.stopPropagation();
                                            handleAddToBag(item);
                                          }
                                        }}
                                      >
                                        ADD TO BAG
                                      </p>
                                    )}
                                  </div>
                                  <div style={EXPANDED_LIST_LINE_TEXT_COLUMN_STYLE}>
                                    <WishlistLineProductTextStack>
                                    <CartLineTextLayer slot="name">
                                    <p style={EXPANDED_LIST_LINE_NAME_TEXT_STYLE(itemProductName)}>{itemDisplayName}</p>
                                    </CartLineTextLayer>
                                    <CartLineTextLayer slot="subtitle" productName={itemProductName}>
                                    <p style={EXPANDED_LIST_RAW_TEXT_STYLE}>
                                      {itemRedSubtitle}
                                    </p>
                                    </CartLineTextLayer>
                                    <WishlistItemCapSizeLine item={item} />
                                    {isViewingDetails ? (
                                      <CartLineTextLayer slot="details">
                                      <p
                                        style={EXPANDED_LIST_LINE_DETAILS_HTML_STYLE}
                                        dangerouslySetInnerHTML={{
                                          __html: buildWishlistItemDetailsHtml(item, { omitLength: true }),
                                        }}
                                      />
                                      </CartLineTextLayer>
                                    ) : null}
                                    {!isViewingDetails && (
                                      <CartLineTextLayer
                                        slot="price"
                                        className={`cart-line-text-layer cart-line-text-layer--price ${WISHLIST_EXPANDED_LIST_LINE_PRICE_LAYER_LIST_CLASS}`}
                                      >
                                      <WigLineStockPrice
                                        item={item}
                                        priceHtml={{ __html: itemPriceLabel }}
                                        priceStyle={{ ...EXPANDED_LIST_LINE_PRICE_STYLE, color: '#000000', ...cartLineLayerInnerStyle() }}
                                        priceClassName={`${WISHLIST_EXPANDED_LIST_LINE_PRICE_CLASS} ${WISHLIST_EXPANDED_LIST_LINE_PRICE_LIST_CLASS}`}
                                      />
                                      </CartLineTextLayer>
                                    )}
                                    {!isViewingDetails && (
                                      <CartLineTextLayer slot="meta">
                                      <ExpandedListItemNoReviewStars listView />
                                      </CartLineTextLayer>
                                    )}
                                    {showViewDetailsLink && (
                                      <CartLineTextLayer slot="meta">
                                      <span
                                        role="button"
                                        tabIndex={0}
                                        className={`${WISHLIST_EXPANDED_LIST_VIEW_DETAILS_TOGGLE_CLASS} ${WISHLIST_EXPANDED_LIST_VIEW_DETAILS_TOGGLE_LIST_CLASS}${!isViewingDetails ? ` ${WISHLIST_EXPANDED_LIST_VIEW_DETAILS_TOGGLE_LIST_VIEW_ONLY_CLASS}` : ''}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setViewingDetailsItemKey(isViewingDetails ? null : itemKey);
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setViewingDetailsItemKey(isViewingDetails ? null : itemKey);
                                          }
                                        }}
                                      >
                                        {isViewingDetails ? 'CLOSE DETAILS' : 'VIEW DETAILS'}
                                      </span>
                                      </CartLineTextLayer>
                                    )}
                                    </WishlistLineProductTextStack>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: `repeat(auto-fill, minmax(${EXPANDED_LIST_GRID_MIN_COL_PX}px, 1fr))`,
                              rowGap: `${EXPANDED_LIST_GRID_ROW_GAP_PX}px`,
                              columnGap: `${EXPANDED_LIST_GRID_COL_GAP_PX}px`,
                              paddingLeft: LIST_ROW_CONTENT_OFFSET_LEFT_PX,
                              paddingTop: '10px',
                            }}
                          >
                            {expandedItems.map((item: any, index: number) => {
                              const itemProductName = getWishlistItemProductName(item);
                              const itemDisplayName = getWishlistItemDisplayName(item);
                              const itemRedSubtitle = getWishlistItemRedSubtitle(item);
                              const thumbSize = listsPageWishlistItemThumbSizePx(
                                item,
                                EXPANDED_LIST_ITEM_THUMB_WIDTH_PX,
                                EXPANDED_LIST_ITEM_THUMB_HEIGHT_PX
                              );
                              return (
                                <div key={item.id || index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <WishlistItemThumb
                                    item={item}
                                    widthPx={thumbSize.widthPx}
                                    heightPx={thumbSize.heightPx}
                                    onActivate={() => navigate(getWishlistItemRoute(item))}
                                  />
                                  <p style={{ fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", cursive', fontSize: `${EXPANDED_LIST_GRID_NAME_FONT_PX}px`, color: '#000', margin: '6px 0 -2px 0', textAlign: 'center', textTransform: 'uppercase' }}>{itemDisplayName}</p>
                                  <CartLineTextLayer slot="subtitle" productName={itemProductName} style={{ alignItems: 'center' }}>
                                  <p style={EXPANDED_LIST_GRID_RAW_TEXT_STYLE}>
                                    {itemRedSubtitle}
                                  </p>
                                  </CartLineTextLayer>
                                  <ExpandedListItemNoReviewStars centered />
                                  <p style={{ ...EXPANDED_LIST_RATING_TEXT_STYLE, margin: '0 0 2px 0', textAlign: 'center' }}>
                                    {EXPANDED_LIST_NO_REVIEWS_LABEL}
                                  </p>
                                  <button type="button" onClick={() => requestRemoveListItemConfirm(item)} style={EXPANDED_LIST_GRID_REMOVE_STYLE}>REMOVE</button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                <>
                {lists.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      marginTop: '6px',
                      marginBottom: '16px',
                      flexShrink: 0,
                    }}
                  >
                    <WishlistViewModeToggle
                      mode={listsOverviewViewMode}
                      onModeChange={setListsOverviewViewMode}
                    />
                  </div>
                )}
                {/* List rows or grid: user-created lists only (main wishlist lives on /wishlist) */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0,
                    paddingTop: lists.length > 0 ? '0' : '20.8px',
                    ...(lists.length === 0
                      ? { flex: 1, alignItems: 'center', justifyContent: 'center' }
                      : {}),
                  }}
                >
                  {lists.length === 0 && !showCreateListModal ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#000' }}>
                      <p
                        style={{ fontFamily: '"Futura PT Medium", futuristic-pt, Futura, Inter, sans-serif', fontSize: '11px', color: '#808080', textTransform: 'uppercase', margin: '0' }}
                      >
                        YOU DON&apos;T HAVE ANY LISTS YET.
                      </p>
                    </div>
                  ) : listsOverviewViewMode === 'line' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {lists.map((list, index) => {
                        const firstItem = list.items?.[0];
                        const thumbSrc = firstItem ? getListOverviewThumbSrc(firstItem) : EMPTY_LIST_THUMB_SRC;
                        const count = list.items?.length ?? 0;
                        return (
                          <div
                            key={list.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => openExpandedList(list.id)}
                            onKeyDown={(e) => e.key === 'Enter' && openExpandedList(list.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '16px',
                              paddingLeft: LIST_ROW_CONTENT_OFFSET_LEFT_PX,
                              ...listRowDividerStyles(index, lists.length, { insetBelowDivider: true }),
                              cursor: 'pointer',
                            }}
                          >
                            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openExpandedList(list.id);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.stopPropagation();
                                    openExpandedList(list.id);
                                  }
                                }}
                              >
                                <WishlistListOverviewThumb firstItem={firstItem} thumbSrc={thumbSrc} />
                              </div>
                              <span style={{ ...LIST_OVERVIEW_COUNT_STYLE, marginTop: '6px' }}>
                                {count} {count === 1 ? 'ITEM' : 'ITEMS'}
                              </span>
                            </div>
                            <div
                              style={{ flex: 1, minWidth: 0, paddingTop: '4px' }}
                              onClick={() => openExpandedList(list.id)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => e.key === 'Enter' && openExpandedList(list.id)}
                            >
                              <span style={LIST_OVERVIEW_NAME_STYLE}>{list.name}</span>
                              <p style={LIST_OVERVIEW_VISIBILITY_STYLE}>{getUserListVisibilityLabel(list)}</p>
                              <p className="wishlist-lists-overview-edit-list-name-wrap">
                                <span
                                  role="button"
                                  tabIndex={0}
                                  className="wishlist-lists-overview-edit-list-name"
                                  style={LIST_OVERVIEW_EDIT_NAME_STYLE}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setListToRename(list);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setListToRename(list);
                                    }
                                  }}
                                >
                                  EDIT LIST NAME
                                </span>
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(auto-fill, minmax(${LISTS_OVERVIEW_GRID_MIN_COL_PX}px, 1fr))`,
                        rowGap: `${LISTS_OVERVIEW_GRID_ROW_GAP_PX}px`,
                        columnGap: `${LISTS_OVERVIEW_GRID_COL_GAP_PX}px`,
                        paddingTop: '10px',
                        paddingLeft: `${LIST_ROW_CONTENT_OFFSET_LEFT_PX}px`,
                      }}
                    >
                      {lists.map((list) => {
                        const firstItem = list.items?.[0];
                        const thumbSrc = firstItem ? getListOverviewThumbSrc(firstItem) : EMPTY_LIST_THUMB_SRC;
                        const count = list.items?.length ?? 0;
                        return (
                          <div
                            key={list.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => openExpandedList(list.id)}
                            onKeyDown={(e) => e.key === 'Enter' && openExpandedList(list.id)}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              cursor: 'pointer',
                              minWidth: 0,
                            }}
                          >
                            <WishlistListOverviewThumb firstItem={firstItem} thumbSrc={thumbSrc} />
                            <span
                              style={{
                                ...LIST_OVERVIEW_NAME_STYLE,
                                marginTop: '8px',
                                textAlign: 'center',
                                width: '100%',
                              }}
                            >
                              {list.name}
                            </span>
                            <p
                              style={{
                                ...LIST_OVERVIEW_VISIBILITY_GRID_STYLE,
                                textAlign: 'center',
                                width: '100%',
                              }}
                            >
                              {getUserListVisibilityLabel(list)}
                            </p>
                            <span
                              style={{
                                ...LIST_OVERVIEW_COUNT_STYLE,
                                marginTop: '4px',
                                textAlign: 'center',
                                width: '100%',
                              }}
                            >
                              {count} {count === 1 ? 'ITEM' : 'ITEMS'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                </>
                )}
                </div>
                </div>
              </>
            )}
          </div>

          {/* PAGE ACTIONS: below card only (PAGE_LAYOUT.md) */}
          {!showMobileMenu && (
            <PageActionsBelowCard>
              {expandedListId ? (
                <>
                  <button
                    type="button"
                    onClick={handleShareListClick}
                    className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                    style={pageActionButtonStyle}
                  >
                    SHARE LIST
                  </button>
                  <PageActionsBelowCard.Spacer />
                  <button
                    type="button"
                    onClick={() => { setListToDelete(expandedListId); setShowDeleteListConfirm(true); }}
                    className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                    style={pageActionButtonStyle}
                  >
                    DELETE LIST
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCreateListModal(true)}
                  className="border border-black font-futura w-full max-w-m text-center py-2 text-[11px] font-semibold bg-white cursor-pointer hover:bg-gray-50"
                  style={pageActionButtonStyle}
                >
                  CREATE NEW LIST
                </button>
              )}
            </PageActionsBelowCard>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteListConfirm}
        onClose={() => { setShowDeleteListConfirm(false); setListToDelete(null); }}
        onConfirm={handleDeleteList}
        title="DELETE LIST"
        message="ARE YOU SURE YOU WANT TO DELETE THIS LIST?"
        confirmText="CONFIRM"
        cancelText="CANCEL"
        dataAttribute="delete-list-confirm"
      />
      <ConfirmationModal
        isOpen={showRemoveListItemConfirm}
        onClose={() => { setShowRemoveListItemConfirm(false); setListItemToRemove(null); }}
        onConfirm={handleConfirmRemoveListItem}
        title="REMOVE FROM LIST"
        message="REMOVE THIS ITEM FROM YOUR LIST?"
        confirmText="REMOVE"
        cancelText="CANCEL"
        dataAttribute="remove-list-item-confirm"
      />
      <CreateNewListModal
        isOpen={showCreateListModal}
        onClose={() => setShowCreateListModal(false)}
        onCreated={() => { refreshLists(); setShowCreateListModal(false); }}
      />
      <RenameListModal
        isOpen={listToRename !== null}
        list={listToRename}
        onClose={() => setListToRename(null)}
        onRenamed={() => { refreshLists(); setListToRename(null); }}
      />
      <ShareListLinkModal
        isOpen={showShareListModal}
        onClose={() => setShowShareListModal(false)}
        shareUrl={shareListUrl}
        listName={lists.find((l) => l.id === expandedListId)?.name}
      />
    </div>
  );
}
