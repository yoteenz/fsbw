# How to Make Facebook & Google Sign-In Buttons Work

The buttons need two IDs from Facebook and Google. Follow these steps.

---

## Part 1: Add the variables to your project

1. Open the file **`.env.local`** in your project root (same folder as `package.json`).
   - If it doesn’t exist, create it.

2. Add these two lines (you’ll fill in the values in Part 2 and Part 3):

   ```
   VITE_FACEBOOK_APP_ID=
   VITE_GOOGLE_CLIENT_ID=
   ```

3. Save the file.

4. Restart your dev server (stop it with Ctrl+C, then run `npm run dev` again).  
   Vite only reads `.env` when it starts, so a restart is required after changing env vars.

---

## Part 2: Get your Facebook App ID

1. Go to **https://developers.facebook.com** and log in.

2. Click **“My Apps”** (top right) → **“Create App”**.

3. Choose **“Consumer”** (or “Other”) → **Next** → give the app a name (e.g. “Build A Wig”) → **Create App**.

4. On the app dashboard, find **“App ID”** (and “App Secret” – you only need the **App ID** for the sign-in button). Copy the **App ID**.

5. In the left menu go to **“Use cases”** (or **“Products”**) → open **“Facebook Login”** → **“Settings”** (or **“Facebook Login”** → **Settings**).

6. Under **“Valid OAuth Redirect URIs”**, add:
   - For local dev: `http://localhost:3001`
   - For production: your real site URL, e.g. `https://yoursite.com`

7. Under **“App Domains”** (in **Settings** → **Basic**), add:
   - `localhost` (for dev)
   - Your real domain without `https://` (e.g. `yoursite.com`) for production.

8. Save changes.

9. Paste the **App ID** into `.env.local`:

   ```
   VITE_FACEBOOK_APP_ID=your_app_id_here
   ```

   (Replace `your_app_id_here` with the actual number. No quotes.)

---

## Part 3: Get your Google Client ID

1. Go to **https://console.cloud.google.com** and log in.

2. Create or select a project:
   - Top bar: click the project name → **“New Project”** → name it (e.g. “Build A Wig”) → **Create**.

3. Open **“APIs & Services”** → **“Credentials”** (left menu).

4. Click **“+ Create Credentials”** → **“OAuth client ID”**.

5. If asked to configure the consent screen:
   - **User Type**: **External** → **Create**.
   - **App name**: e.g. “Build A Wig”.
   - **User support email**: your email.
   - **Developer contact**: your email.
   - **Save and Continue** through the steps, then go back to **Credentials**.

6. Again: **Create Credentials** → **OAuth client ID**.
   - **Application type**: **Web application**.
   - **Name**: e.g. “Build A Wig Web”.

7. Under **“Authorized JavaScript origins”**, add:
   - For local dev: `http://localhost:3001`
   - For production: your site URL, e.g. `https://yoursite.com`

8. Click **Create**. A popup will show your **Client ID** and **Client Secret**. Copy the **Client ID**.

9. Paste it into `.env.local`:

   ```
   VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
   ```

   (Replace with your full Client ID. No quotes.)

---

## Part 4: Restart and test

1. Save **`.env.local`**. It should look like this (with your real values):

   ```
   VITE_FACEBOOK_APP_ID=1234567890123456
   VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
   ```

2. Restart the dev server (Ctrl+C, then `npm run dev`).

3. Open the sign-in page (e.g. `http://localhost:3001/sign-in`) and click **“SIGN UP WITH FACEBOOK ACCOUNT”** or **“SIGN UP WITH GOOGLE ACCOUNT”**. You should see the provider’s login popup instead of the “not configured” message.

---

## Troubleshooting

- **Still says “not configured”**  
  - Make sure variable names are exactly `VITE_FACEBOOK_APP_ID` and `VITE_GOOGLE_CLIENT_ID`.  
  - No quotes around the values.  
  - Restart the dev server after editing `.env.local`.

- **Facebook: “URL not allowed”**  
  - Add the exact URL you’re using (e.g. `http://localhost:3001`) to **Valid OAuth Redirect URIs** and **App Domains** as above.

- **Google: “redirect_uri mismatch” or “origin not allowed”**  
  - Add `http://localhost:3001` (or your current URL) to **Authorized JavaScript origins** and save.

- **Port is different**  
  - If your app runs on another port (e.g. 5173), use that port in all URLs above (e.g. `http://localhost:5173`).
