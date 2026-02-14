/** Base count of mock reviews (shop + tool) shown on the reviews page. Account card uses this + user-submitted count. */
export const MOCK_SHOP_REVIEWS_COUNT = 8;
export const MOCK_TOOL_REVIEWS_COUNT = 3;
export const MOCK_REVIEWS_BASE_COUNT = MOCK_SHOP_REVIEWS_COUNT + MOCK_TOOL_REVIEWS_COUNT;

export const getUserSubmittedReviewsKey = (email: string) => `userSubmittedReviews_${email}`;

/** User submitted a review (leave-review flow); alert clears when they visit reviews page. */
export const getReviewsNewApprovedKey = (email: string) =>
  `reviewsNewApproved_${String(email ?? '').trim().toLowerCase()}`;

/** Last seen mock SHOP count; alert for new shop reviews clears only when they view the Shop tab. */
export const getReviewsLastSeenShopCountKey = (email: string) =>
  `reviewsLastSeenShopCount_${String(email ?? '').trim().toLowerCase()}`;

/** Last seen mock TOOL count; alert for new tool reviews clears only when they view the Tool tab. */
export const getReviewsLastSeenToolCountKey = (email: string) =>
  `reviewsLastSeenToolCount_${String(email ?? '').trim().toLowerCase()}`;

/** @deprecated Use getLastSeenShopCount/getLastSeenToolCount; kept for migration. */
export const getReviewsLastSeenCountKey = (email: string) =>
  `reviewsLastSeenCount_${String(email ?? '').trim().toLowerCase()}`;

export function getMockShopReviewCount(): number {
  return MOCK_SHOP_REVIEWS_COUNT;
}

export function getMockToolReviewCount(): number {
  return MOCK_TOOL_REVIEWS_COUNT;
}

export function getMockReviewCount(): number {
  return MOCK_REVIEWS_BASE_COUNT;
}

export function getTotalReviewCount(email: string | undefined): number {
  if (!email) return MOCK_REVIEWS_BASE_COUNT;
  try {
    const raw = localStorage.getItem(getUserSubmittedReviewsKey(email));
    const list = raw ? JSON.parse(raw) : [];
    return MOCK_REVIEWS_BASE_COUNT + (Array.isArray(list) ? list.length : 0);
  } catch {
    return MOCK_REVIEWS_BASE_COUNT;
  }
}

/** Alert shows until ALL are seen: user-submitted flag cleared, shop tab viewed, tool tab viewed. Does not clear until both shop and tool have been loaded if both have new reviews. */
export function hasNewReviewApproved(email: string | undefined): boolean {
  if (!email || !String(email).trim()) return false;
  const userSubmitted = localStorage.getItem(getReviewsNewApprovedKey(email)) === 'true';
  const shopUnseen = getMockShopReviewCount() > getLastSeenShopCount(email);
  const toolUnseen = getMockToolReviewCount() > getLastSeenToolCount(email);
  return userSubmitted || shopUnseen || toolUnseen;
}

export function setNewReviewApproved(email: string | undefined): void {
  if (!email || !String(email).trim()) return;
  localStorage.setItem(getReviewsNewApprovedKey(email), 'true');
}

export function clearNewReviewApproved(email: string | undefined): void {
  if (!email || !String(email).trim()) return;
  localStorage.removeItem(getReviewsNewApprovedKey(email));
}

export function getLastSeenShopCount(email: string | undefined): number {
  if (!email || !String(email).trim()) return 0;
  try {
    const v = localStorage.getItem(getReviewsLastSeenShopCountKey(email));
    return v != null ? parseInt(v, 10) : 0;
  } catch {
    return 0;
  }
}

export function setLastSeenShopCount(email: string | undefined, count: number): void {
  if (!email || !String(email).trim()) return;
  localStorage.setItem(getReviewsLastSeenShopCountKey(email), String(count));
}

export function getLastSeenToolCount(email: string | undefined): number {
  if (!email || !String(email).trim()) return 0;
  try {
    const v = localStorage.getItem(getReviewsLastSeenToolCountKey(email));
    return v != null ? parseInt(v, 10) : 0;
  } catch {
    return 0;
  }
}

export function setLastSeenToolCount(email: string | undefined, count: number): void {
  if (!email || !String(email).trim()) return;
  localStorage.setItem(getReviewsLastSeenToolCountKey(email), String(count));
}

/** @deprecated Use setLastSeenShopCount/setLastSeenToolCount per tab. */
export function getLastSeenMockCount(email: string | undefined): number {
  if (!email || !String(email).trim()) return 0;
  try {
    const v = localStorage.getItem(getReviewsLastSeenCountKey(email));
    return v != null ? parseInt(v, 10) : 0;
  } catch {
    return 0;
  }
}

/** @deprecated Use setLastSeenShopCount/setLastSeenToolCount per tab. */
export function setLastSeenMockCount(email: string | undefined, count: number): void {
  if (!email || !String(email).trim()) return;
  localStorage.setItem(getReviewsLastSeenCountKey(email), String(count));
}
