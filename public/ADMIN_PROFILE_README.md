# Admin profile (cross-browser sync)

When you sign in as admin on a **new browser** (e.g. Chrome) that has no stored account, the app bootstraps an admin user and merges in a **canonical profile** from this folder so your name, photo, birthday, and other data match the browser where you already set them (e.g. Safari).

## How to sync Safari → Chrome (or any other browser)

1. **On the browser where your admin profile is already set** (e.g. Safari):  
   Go to **Account** and click **Export admin profile (for Chrome/Safari sync)**.  
   This downloads `admin-profile.json`.

2. **Replace the placeholder file** in the project:  
   Save the downloaded file as `public/admin-profile.json` (overwrite the existing file).

3. **Deploy or run the app** so that `admin-profile.json` is served at `/admin-profile.json`.

4. **On the other browser** (e.g. Chrome):  
   Sign in with your admin email and password. The bootstrap will load the canonical profile and your photo, name, birthday, etc. will match.

## Fields in admin-profile.json

All optional; only set what you want to sync. The sign-in bootstrap merges:  
`firstName`, `lastName`, `phoneNumber`, `birthday`, `profileImage` (URL or data URL),  
`facebook`, `instagram`, `youtube`, `tiktok`, `twitter`, `membershipType`,  
`giftCardBalance`, `hasMadeFirstPurchase`, `loyaltyPoints`, `unlockedDiscounts`,  
`voucherList`, `voucherHistory`, `digitalCashHistory`, `referralCode`, `createdAt`, `id`.

Password is never stored in this file.
