# Cross-browser profile sync

## Current behavior

- **Profile data** (name, email, addresses, membership, vouchers, digital cash, etc.) is stored in **localStorage** per browser. Safari and Chrome each have their own copy; they do not sync automatically.
- **Admin-only**: You can **Export** your admin profile on one browser (Account → "Export admin profile") and **Import** it on another (Sign-in page: "Import admin profile from file", or Account → "Import admin profile"). That restores the same profile in the second browser without manual console steps.
- **Sign-in page** also supports a **canonical profile**: if you put an exported file at `public/admin-profile.json` and deploy, the app fetches it when an admin signs in on a new browser and merges it with local data (see sign-in flow and `fetchCanonicalAdminProfile()`).

So today, **automatic** sync does **not** exist for normal users or for admin without using Export/Import or the canonical file.

---

## How to get automatic sync for all users (any browser, no manual import)

To have **every** client’s profile (and optionally orders, preferences) stay in sync across browsers and devices automatically:

1. **Store profile (and related data) on a backend**
   - Add an API or use a BaaS (e.g. Firebase, Supabase, your own API) that stores:
     - User profile by a stable id (e.g. email or user id from auth).
     - Optionally: orders, addresses, preferences, etc.
   - Auth can stay as-is (email/password in localStorage or OAuth); you just need a stable identifier (e.g. email) to key the stored profile.

2. **On sign-in (any browser/device)**
   - After the user is authenticated (email/password or OAuth):
     - Call the backend: “get profile for this user”.
     - Write the returned profile into `currentUser` (and `profileImage`, `registeredUsers` if the app still uses them), or hydrate app state from the API so the UI shows the same data everywhere.

3. **On profile (or related data) change**
   - Whenever the user updates profile, address, or settings:
     - Persist the change to the backend (e.g. PATCH/PUT profile).
   - Optionally keep writing to localStorage for offline/cache, but treat the backend as the source of truth so the next sign-in on another browser gets the latest data.

4. **Result**
   - User signs in on Chrome → app loads profile from backend → same name, photo, addresses, membership, etc.
   - Same user signs in on Safari (or another device) → same flow → **no manual export/import**; profile is already in sync.

**Summary**: Automatic cross-browser sync for all clients requires a **backend** that stores profile (and optionally more) by user. The front end already has Export/Import for admin and canonical-merge on sign-in; for true “sync everywhere for everyone,” add a backend and load/save profile there on sign-in and on profile updates.
