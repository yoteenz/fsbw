# Backend Sync Setup — Simple Step-by-Step

You already have a Supabase account and a project. Here’s what each piece is and exactly what to do next.

---

## What’s what (in plain English)

- **Supabase** = Your online database + login system. Your website will save profiles, cart, wishlist, etc. here so they’re the same on every browser/device.
- **SQL Editor** = A page in Supabase where you paste a **script** (a list of commands) that creates the **tables** your app needs. Tables are like spreadsheets: one for profiles, one for cart, one for wishlist, etc.
- **Project URL** and **anon key** = Like a password and address so your website can talk to your Supabase project safely. You put these in a `.env.local` file so the app knows where to connect.

---

## Step 1: Open your Supabase project

1. Go to **[supabase.com](https://supabase.com)** and sign in.
2. On the dashboard you’ll see a list of **projects**. Click the one you use for this website (the one you created earlier).
3. You’re now inside that project.

---

## Step 2: Run the SQL script (create the tables)

**What you’re doing:** Telling Supabase to create the tables (profiles, orders, cart, wishlist, notifications) that the app expects.

1. In the **left sidebar**, click **“SQL Editor”**.
   - If you don’t see it, look for an icon that looks like `</>` or a menu that says **Develop** or **Database**; SQL Editor is often under there.
2. Click **“New query”** (or “New” / “+” so you get a blank box).
3. Open the file **`supabase/migrations/001_initial_schema.sql`** from your project in your code editor (Cursor). Select **all** the text in that file and **copy** it.
4. Go back to the Supabase tab. **Paste** that entire script into the big empty SQL box.
5. Click the green **“Run”** button (or “Run” at the bottom).
6. You should see a success message (e.g. “Success. No rows returned”). That’s normal — it means the tables were created.

**If you get an error** like “relation already exists,” the tables might already be there from a previous run. You can ignore that and go to Step 3.

---

## Step 3: Get your Project URL and anon key

**What you’re doing:** Getting the two values your website needs to connect to this Supabase project.

1. In the **left sidebar**, click the **gear icon** ⚙️ (**“Settings”** or **“Project Settings”**).
2. In the settings menu, click **“API”**.
3. On the API page you’ll see:
   - **Project URL** — something like `https://abcdefghijk.supabase.co`
   - **Project API keys** — a section with two keys:
     - **anon** **public** — a long string like `eyJhbGciOiJIUzI1NiIsInR5cCI6...`
   - Copy **Project URL** and the **anon public** key and keep them somewhere handy (e.g. Notepad). You’ll paste them into your project in Step 4.

---

## Step 4: Put the keys into your website project

**What you’re doing:** Giving your app (and the API) the URL and key so they can talk to Supabase.

1. Open your **build-a-wig** project folder in Cursor.
2. In the root of the project (same folder as `package.json`), find the file **`.env.example`**.  
   If you don’t have a file named **`.env.local`** yet:
   - Copy `.env.example` and paste it in the same folder.
   - Rename the copy to **`.env.local`** (exactly, including the dot).
3. Open **`.env.local`** and fill it in like this (use your real values from Step 3):

   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...your_anon_key_here
   VITE_API_BASE=

   SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...your_anon_key_here
   ```

   - Replace `https://YOUR_PROJECT_REF.supabase.co` with your **Project URL** (same in both places).
   - Replace `eyJ...` with your **anon public** key (same in both places).
   - Leave **`VITE_API_BASE=`** empty (nothing after the `=`).
4. Save the file.  
   **Important:** Don’t commit `.env.local` to git if it’s in `.gitignore` — it should stay local and secret.

---

## Step 5: Run the site with the API (so sync works)

**What you’re doing:** Running both the website and the small “API” that talks to Supabase (profile, cart, wishlist). Normal `npm run dev` only runs the site; you need **Vercel dev** so the API runs too.

1. Open a terminal in your project folder (e.g. in Cursor: Terminal → New Terminal).
2. Run:
   ```bash
   npm install
   npx vercel dev
   ```
3. When it asks (first time only), log in to Vercel or link the project if needed. You can accept the defaults (e.g. link to existing project or skip).
4. When it’s ready, it will say something like **“Ready! Available at http://localhost:3000”** (or another port). Open that URL in your browser.

Now when you **sign in** or **create an account**, the app uses Supabase. After sign-in it will load profile, orders, cart, and wishlist from Supabase and sync them into the app. That’s your backend/API sync.

---

## Quick checklist

- [ ] Supabase project open (the one for this site)
- [ ] SQL Editor → New query → pasted **whole** `001_initial_schema.sql` → Run → success
- [ ] Settings → API → copied **Project URL** and **anon public** key
- [ ] Created **`.env.local`** and pasted URL and anon key in all four places (VITE_ and non-VITE)
- [ ] Ran **`npx vercel dev`** and opened the URL it gives you
- [ ] Signed in or created an account — sync should be working

---

## If something goes wrong

- **“I don’t see SQL Editor”**  
  Look under **Develop** or **Database** in the left menu; it might be under a submenu.

- **“I have more than one project”**  
  Pick the one you made for this build-a-wig site. The name is whatever you gave it when you created it.

- **“Site still doesn’t sync”**  
  Make sure you’re running with **`npx vercel dev`** (not only `npm run dev`), and that `.env.local` has the correct Project URL and anon key with no extra spaces.

- **“I want to deploy to production (e.g. Vercel)”**  
  In your Vercel project → **Settings** → **Environment Variables**, add the same four variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, with the same values as in `.env.local`. Then redeploy.
