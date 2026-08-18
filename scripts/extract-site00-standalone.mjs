#!/usr/bin/env node
/**
 * Extract SITE 00 from Frontal Slayer monorepo into a standalone app.
 * Output: /home/ubuntu/site-00 (or SITE00_OUT env)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = process.env.SITE00_OUT || '/home/ubuntu/site-00';
const FS_SRC = path.join(ROOT, 'src');

/** Do not traverse these top-level src segments from shared utils (keeps extraction lean). */
const BLOCKED_PREFIXES = [
  'studio-os-core/',
  'studio-os/',
  'workspaces/',
  'pages/',
  'features/',
  'all-in-one/',
  'tutorial-os/',
  'studio-interactive-manual/',
  'cinematic/',
  'design-system/',
  'motion/',
  'site00/', // copied wholesale separately
];

const SEED_FILES = [
  'routes/Site00Routes.tsx',
  'components/AdminGuard.tsx',
  'hooks/useSignedInFromStorage.ts',
  'platform-stabilization/GuardLoadingRecovery.tsx',
  'platform-stabilization/loadingScreenLock.ts',
  'platform-stabilization/useGuardLoadingTimeout.ts',
  'utils/activity.ts',
  'utils/adminAuth.ts',
  'utils/api.ts',
  'utils/auth/site00SignInActions.ts',
  'utils/desktopPreview.ts',
  'utils/sessionRestore.ts',
  'utils/signInReturnTo.ts',
  'utils/supabase.ts',
  'utils/syncFromApi.ts',
  'components/base/LoadingScreen.tsx',
];

const IMPORT_RE = /(?:import|export)\s+(?:type\s+)?(?:[\w*{}\s,]+\s+from\s+)?['"]([^'"]+)['"]|import\s*\(['"]([^'"]+)['"]\)/g;

function isBlocked(relPath) {
  return BLOCKED_PREFIXES.some((p) => relPath.startsWith(p) || relPath === p.replace(/\/$/, ''));
}

function resolveImport(fromFile, spec) {
  if (!spec.startsWith('.')) return null;
  const base = path.resolve(path.dirname(fromFile), spec);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
    path.join(base, 'index.js'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}

function collectClosure(seedRelPaths) {
  const queue = seedRelPaths.map((r) => path.join(FS_SRC, r));
  const seen = new Set();
  const files = new Set();

  while (queue.length) {
    const file = queue.shift();
    if (!file || seen.has(file) || !fs.existsSync(file)) continue;
    const rel = path.relative(FS_SRC, file).replace(/\\/g, '/');
    if (isBlocked(rel)) continue;

    seen.add(file);
    files.add(file);

    const text = fs.readFileSync(file, 'utf8');
    let m;
    IMPORT_RE.lastIndex = 0;
    while ((m = IMPORT_RE.exec(text)) !== null) {
      const spec = m[1] || m[2];
      if (!spec || !spec.startsWith('.')) continue;
      const resolved = resolveImport(file, spec);
      if (!resolved || !resolved.startsWith(FS_SRC)) continue;
      const rrel = path.relative(FS_SRC, resolved).replace(/\\/g, '/');
      if (!isBlocked(rrel) && !seen.has(resolved)) queue.push(resolved);
    }
  }
  return files;
}

function rimraf(p) {
  if (!fs.existsSync(p)) return;
  fs.rmSync(p, { recursive: true, force: true });
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  let text = fs.readFileSync(src, 'utf8');
  if (/\.(tsx?|jsx?)$/.test(src)) {
    text = text.replace(
      /from ['"](\.\.\/)+studio-os-core\/immune-system\/constants['"]/g,
      (match) => {
        const depth = (match.match(/\.\.\//g) || []).length;
        return `from '${'../'.repeat(depth)}lib/site00-supabase-env'`;
      },
    );
  }
  fs.writeFileSync(dest, text);
}

function copyTree(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  for (const name of fs.readdirSync(srcDir)) {
    const sp = path.join(srcDir, name);
    const dp = path.join(destDir, name);
    if (fs.statSync(sp).isDirectory()) copyTree(sp, dp);
    else copyFile(sp, dp);
  }
}

function copyFiltered(srcDir, destDir, filter) {
  if (!fs.existsSync(srcDir)) return;
  for (const name of fs.readdirSync(srcDir)) {
    const sp = path.join(srcDir, name);
    const dp = path.join(destDir, name);
    if (fs.statSync(sp).isDirectory()) copyFiltered(sp, dp, filter);
    else if (filter(sp)) copyFile(sp, dp);
  }
}

function patchStudioOsImports(outRoot) {
  const configs = [
    'site00/config/origin-panel-icons.ts',
    'site00/config/idnty-framework-icons.ts',
    'site00/config/idnty-brand-state-icons.ts',
    'site00/config/bldr-framework-icons.ts',
    'site00/config/bldr-build-class-icons.ts',
  ];
  for (const cfg of configs) {
    const p = path.join(outRoot, 'src', cfg);
    if (!fs.existsSync(p)) continue;
    let t = fs.readFileSync(p, 'utf8');
    t = t.replace(
      /from ['"]\.\.\/\.\.\/studio-os-core\/immune-system\/constants['"]/,
      "from '../../lib/site00-supabase-env'",
    );
    fs.writeFileSync(p, t);
  }
}

function postProcessStandalone(outRoot) {
  const srcRoot = path.join(outRoot, 'src');

  // Drop tests and monorepo-only folders
  for (const dir of ['types', 'constants', 'shared']) {
    rimraf(path.join(srcRoot, dir));
  }
  for (const f of walkDir(srcRoot)) {
    if (/\.test\.(ts|tsx)$/.test(f)) fs.unlinkSync(f);
  }

  const utilsAllow = new Set([
    'activity.ts',
    'adminAuth.ts',
    'api.ts',
    'authPasswordSanitize.ts',
    'desktopPreview.ts',
    'profileSyncQueue.ts',
    'sessionRestore.ts',
    'signInReturnTo.ts',
    'supabase.ts',
    'syncFromApi.ts',
    'auth/site00SignInActions.ts',
  ]);
  const utilsDir = path.join(srcRoot, 'utils');
  if (fs.existsSync(utilsDir)) {
    for (const name of fs.readdirSync(utilsDir)) {
      const p = path.join(utilsDir, name);
      if (fs.statSync(p).isDirectory()) {
        if (name !== 'auth') rimraf(p);
        continue;
      }
      if (!utilsAllow.has(name)) fs.unlinkSync(p);
    }
    if (fs.existsSync(path.join(utilsDir, 'auth'))) {
      for (const name of fs.readdirSync(path.join(utilsDir, 'auth'))) {
        if (name !== 'site00SignInActions.ts') {
          fs.unlinkSync(path.join(utilsDir, 'auth', name));
        }
      }
    }
  }

  writeSlimApi(outRoot);
  writeSlimSyncFromApi(outRoot);
  writeSlimSite00SignInActions(outRoot);
  writeSlimSignInReturnTo(outRoot);

  fs.writeFileSync(
    path.join(srcRoot, 'platform-stabilization/PlatformErrorScreen.tsx'),
    `import { useEffect, useState } from 'react';

export type PlatformErrorDetails = {
  title: string;
  message: string;
  stack?: string;
  componentStack?: string;
  boundary?: string;
  bootStatus?: string;
  extra?: string;
};

type Props = PlatformErrorDetails & {
  onRetry?: () => void;
  dataAttr?: string;
};

/** Visible platform failure screen — SITE 00 standalone (no Studio OS bootstrap). */
export function PlatformErrorScreen({
  title,
  message,
  stack,
  componentStack,
  boundary,
  bootStatus,
  extra,
  onRetry,
  dataAttr = 'platform-error',
}: Props) {
  const [bootLine, setBootLine] = useState(bootStatus);

  useEffect(() => {
    if (bootStatus) return;
    setBootLine('SITE 00 standalone');
  }, [bootStatus]);

  return (
    <div
      data-platform-error={dataAttr}
      style={{
        minHeight: '100vh',
        padding: 24,
        fontFamily: 'system-ui, sans-serif',
        fontSize: 13,
        color: '#111',
        background: '#fff5f5',
        boxSizing: 'border-box',
      }}
    >
      <h1 style={{ fontSize: 16, margin: '0 0 8px', color: '#eb1c24' }}>{title}</h1>
      <p style={{ margin: '0 0 12px', lineHeight: 1.5 }}>{message}</p>
      {boundary ? <p style={{ margin: '0 0 8px' }}><strong>Boundary:</strong> {boundary}</p> : null}
      {extra ? <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{extra}</pre> : null}
      {bootLine ? <p style={{ margin: '8px 0', fontSize: 12 }}>{bootLine}</p> : null}
      {stack ? <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11 }}>{stack}</pre> : null}
      {componentStack ? <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11 }}>{componentStack}</pre> : null}
      {onRetry ? (
        <button type="button" onClick={onRetry} style={{ marginTop: 16, padding: '6px 10px' }}>
          Retry
        </button>
      ) : null}
    </div>
  );
}
`,
  );

  fs.writeFileSync(
    path.join(srcRoot, 'platform-stabilization/loadingTerminalRegistry.ts'),
    fs
      .readFileSync(path.join(FS_SRC, 'platform-stabilization/loadingTerminalRegistry.ts'), 'utf8')
      .replace(
        /async function bootStatusLine[\s\S]*?\n\}/,
        "async function bootStatusLine(): Promise<string> {\n  return 'SITE 00 standalone';\n}",
      ),
  );

  // vite config: allow .mjs plugin import
  const viteTs = path.join(outRoot, 'vite.config.ts');
  if (fs.existsSync(viteTs)) {
    fs.writeFileSync(
      viteTs,
      fs.readFileSync(viteTs, 'utf8').replace(
        "import { site00AsstsLocalApiPlugin } from './scripts/vite-site00-assts-local-api.mjs';",
        "// @ts-expect-error local dev plugin\nimport { site00AsstsLocalApiPlugin } from './scripts/vite-site00-assts-local-api.mjs';",
      ),
    );
  }
}

function walkDir(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walkDir(p, acc);
    else acc.push(p);
  }
  return acc;
}

function writeSlimApi(outRoot) {
  const slim = `/**
 * SITE 00 standalone API client (profile, activity, authenticated fetch).
 */
const API_BASE =
  (import.meta as unknown as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE ?? '';

function getSupabaseAuthStorageKey(): string | null {
  const url = (import.meta as unknown as { env?: { VITE_SUPABASE_URL?: string } }).env?.VITE_SUPABASE_URL;
  if (!url) return null;
  try {
    const projectRef = new URL(url).hostname.split('.')[0];
    return projectRef ? \`sb-\${projectRef}-auth-token\` : null;
  } catch {
    return null;
  }
}

type SupabaseSessionBlob = {
  access_token?: string;
  refresh_token?: string;
};

function readSupabaseSessionBlobFromStorage(): SupabaseSessionBlob | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  const key = getSupabaseAuthStorageKey();
  if (!key) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SupabaseSessionBlob;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function readAccessTokenFromSupabaseStorage(): string | null {
  const blob = readSupabaseSessionBlobFromStorage();
  const t = typeof blob?.access_token === 'string' ? blob.access_token.trim() : '';
  return t || null;
}

function isAccessTokenLikelyExpired(token: string, skewSeconds = 90): boolean {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return false;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(payload)) as { exp?: number };
    if (typeof json.exp !== 'number') return false;
    return Date.now() / 1000 >= json.exp - skewSeconds;
  } catch {
    return false;
  }
}

async function hydrateSupabaseSessionFromStorageIfNeeded(
  supabase: NonNullable<Awaited<ReturnType<(typeof import('./supabase'))['getSupabase']>>>,
): Promise<void> {
  try {
    const blob = readSupabaseSessionBlobFromStorage();
    const access = typeof blob?.access_token === 'string' ? blob.access_token.trim() : '';
    const refresh = typeof blob?.refresh_token === 'string' ? blob.refresh_token.trim() : '';
    if (!access || !refresh) return;
    const { data: { session } } = await supabase.auth.getSession();
    const mem = session?.access_token?.trim();
    if (mem && !isAccessTokenLikelyExpired(mem)) return;
    await supabase.auth.setSession({ access_token: access, refresh_token: refresh });
  } catch {
    /* ignore */
  }
}

export async function getAccessToken(): Promise<string | null> {
  const supabase = (await import('./supabase')).getSupabase();
  if (!supabase) return readAccessTokenFromSupabaseStorage();

  await hydrateSupabaseSessionFromStorageIfNeeded(supabase);
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token && !isAccessTokenLikelyExpired(session.access_token)) {
    return session.access_token;
  }

  const blob = readSupabaseSessionBlobFromStorage();
  if (blob?.refresh_token) {
    try {
      await supabase.auth.refreshSession({ refresh_token: blob.refresh_token });
      const { data: { session: s2 } } = await supabase.auth.getSession();
      if (s2?.access_token) return s2.access_token;
    } catch {
      /* fall through */
    }
  }

  const stored = readAccessTokenFromSupabaseStorage();
  if (stored && !isAccessTokenLikelyExpired(stored)) return stored;
  return null;
}

type ApiFetchOptions = Omit<RequestInit, 'body'> & { body?: unknown };

export async function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<Response> {
  const token = await getAccessToken();
  const url = \`\${API_BASE.replace(/\\/$/, '')}/\${path.replace(/^\\//, '')}\`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (token) headers.Authorization = \`Bearer \${token}\`;
  const body: BodyInit | null | undefined =
    options.body !== undefined ? JSON.stringify(options.body) : undefined;
  const { body: _omit, ...rest } = options;
  return fetch(url, { ...rest, headers, body });
}

export async function getProfile(): Promise<Record<string, unknown> | null> {
  const res = await apiFetch('/api/profile');
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as Record<string, unknown> | null;
}

export async function patchProfile(profile: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await apiFetch('/api/profile', { method: 'PATCH', body: profile });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as Record<string, unknown>;
}

export async function recordActivity(eventType: string, payload?: Record<string, unknown>): Promise<void> {
  const res = await apiFetch('/api/activity', {
    method: 'POST',
    body: payload ? { eventType, payload } : { eventType },
  });
  if (res.status === 401) return;
  if (!res.ok) throw new Error(await res.text());
}
`;
  fs.writeFileSync(path.join(outRoot, 'src/utils/api.ts'), slim);
}

function writeSlimSignInReturnTo(outRoot) {
  fs.writeFileSync(
    path.join(outRoot, 'src/utils/signInReturnTo.ts'),
    `const MAX_RETURN_LEN = 1024;

export const SITE00_CTRL_ROOM_DEFAULT_PATH = '/control';

function isSafeInternalPath(p: string): boolean {
  if (!p || p.length > MAX_RETURN_LEN) return false;
  if (!p.startsWith('/') || p.startsWith('//')) return false;
  return true;
}

function normalizeReturnToParam(returnToParam: string | null | undefined): string | null {
  if (returnToParam == null || returnToParam === '') return null;
  let raw = returnToParam.trim().slice(0, MAX_RETURN_LEN * 4);
  try {
    raw = decodeURIComponent(raw);
  } catch {
    /* use raw */
  }
  raw = raw.slice(0, MAX_RETURN_LEN);
  return isSafeInternalPath(raw) ? raw : null;
}

export function resolveSite00ReturnToAfterSignIn(
  returnToParam: string | null | undefined,
  state: { from?: string } | null | undefined,
): string {
  const fromQuery = normalizeReturnToParam(returnToParam);
  if (fromQuery) return fromQuery;
  const from = state?.from;
  if (typeof from === 'string') {
    const t = from.trim().slice(0, MAX_RETURN_LEN);
    if (isSafeInternalPath(t)) return t;
  }
  return SITE00_CTRL_ROOM_DEFAULT_PATH;
}
`,
  );
}

function writeSlimSyncFromApi(outRoot) {
  const slim = `/**
 * SITE 00 standalone — profile sync (slimmed from Frontal Slayer commerce sync).
 */
import { getProfile, getAccessToken, patchProfile } from './api';
import { persistAuthBackup, isAdminEmail } from './adminAuth';
import { stripPasswordFromUserRecord } from './authPasswordSanitize';

let lastProfileSyncErrored = false;

export function didLastProfileSyncError(): boolean {
  return lastProfileSyncErrored;
}

export function getLocalUserSnapshotForEmail(email: string): Record<string, unknown> | null {
  const e = (email || '').trim().toLowerCase();
  if (!e) return null;
  try {
    const existingRaw = localStorage.getItem('currentUser');
    if (existingRaw) {
      const cur = JSON.parse(existingRaw) as Record<string, unknown>;
      if (((cur.email as string) || '').trim().toLowerCase() === e) return cur;
    }
  } catch {
    /* ignore */
  }
  try {
    const registeredUsers: unknown[] = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const reg = registeredUsers.find(
      (u: unknown) => (((u as { email?: string }).email || '').trim().toLowerCase() === e),
    ) as Record<string, unknown> | undefined;
    return reg && typeof reg === 'object' ? reg : null;
  } catch {
    return null;
  }
}

export async function syncProfileFromApi(): Promise<Record<string, unknown> | null> {
  try {
    const profile = await getProfile();
    lastProfileSyncErrored = false;
    if (!profile) return null;
    const email = ((profile.email as string) || '').trim().toLowerCase();
    const existing = email ? getLocalUserSnapshotForEmail(email) : null;
    const merged = {
      ...(existing || {}),
      ...stripPasswordFromUserRecord(profile as Record<string, unknown>),
    };
    localStorage.setItem('currentUser', JSON.stringify(merged));
    persistAuthBackup();
    return merged;
  } catch {
    lastProfileSyncErrored = true;
    return null;
  }
}

export async function syncAllFromApi(): Promise<Record<string, unknown> | null> {
  if (!getAccessToken()) return null;
  return syncProfileFromApi();
}

export function buildMinimalUserFromSupabaseSession(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): Record<string, unknown> {
  const email = (user.email || '').trim().toLowerCase();
  return {
    id: user.id,
    email,
    name: (user.user_metadata?.full_name as string) || email.split('@')[0] || 'USER',
    isAdmin: isAdminEmail(email),
  };
}

export function applyMinimalUserToStorage(user: Record<string, unknown>): void {
  localStorage.setItem('currentUser', JSON.stringify(stripPasswordFromUserRecord(user)));
  persistAuthBackup();
}

export function buildProfilePayloadForBackend(user: Record<string, unknown>): Record<string, unknown> {
  return {
    email: user.email,
    name: user.name,
    profile_image: user.profileImage ?? user.profile_image ?? null,
  };
}
`;
  fs.writeFileSync(path.join(outRoot, 'src/utils/syncFromApi.ts'), slim);
}

function writeSlimSite00SignInActions(outRoot) {
  const slim = fs.readFileSync(path.join(FS_SRC, 'utils/auth/site00SignInActions.ts'), 'utf8')
    .replace("import { saveCartAndWishlistToUserKeys } from '../cartWishlistStorage';", '')
    .replace(/try \{[\s\S]*?saveCartAndWishlistToUserKeys[\s\S]*?\} catch \{[\s\S]*?\}/, '');
  fs.writeFileSync(path.join(outRoot, 'src/utils/auth/site00SignInActions.ts'), slim);
}

function main() {
  console.log(`[site00-extract] ROOT=${ROOT}`);
  console.log(`[site00-extract] OUT=${OUT}`);

  rimraf(OUT);
  fs.mkdirSync(path.join(OUT, 'src'), { recursive: true });

  // Full SITE 00 module
  copyTree(path.join(FS_SRC, 'site00'), path.join(OUT, 'src/site00'));

  // Shared closure (bounded)
  const closure = collectClosure(SEED_FILES);
  console.log(`[site00-extract] shared closure files: ${closure.size}`);
  for (const file of closure) {
    const rel = path.relative(FS_SRC, file);
    copyFile(file, path.join(OUT, 'src', rel));
  }

  writeSlimSyncFromApi(OUT);
  writeSlimSite00SignInActions(OUT);

  fs.mkdirSync(path.join(OUT, 'src/lib'), { recursive: true });
  fs.writeFileSync(
    path.join(OUT, 'src/lib/site00-supabase-env.ts'),
    `/** Standalone SITE 00 — production Supabase project ref (shared until split). */\nexport const IMMUNE_PRODUCTION_PROJECT_REF = 'hyycomvcaqxxvyrfupes';\n`,
  );
  patchStudioOsImports(OUT);

  postProcessStandalone(OUT);

  fs.writeFileSync(
    path.join(OUT, 'src/main.tsx'),
    `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
`,
  );

  fs.writeFileSync(
    path.join(OUT, 'src/App.tsx'),
    `import { Routes } from 'react-router-dom';
import { Site00Routes } from './routes/Site00Routes';

/** Standalone SITE 00 application shell */
export default function App() {
  return <Routes>{Site00Routes()}</Routes>;
}
`,
  );

  copyTree(path.join(ROOT, 'public/assets/evolve'), path.join(OUT, 'public/assets/evolve'));
  for (const f of ['site00-assts-boot-gate.js', 'site00-assts-loader-boot.css', 'site00-assts-loader-boot.js']) {
    const sp = path.join(ROOT, 'public', f);
    if (fs.existsSync(sp)) copyFile(sp, path.join(OUT, 'public', f));
  }

  copyFiltered(path.join(ROOT, 'api/admin'), path.join(OUT, 'api/admin'), (p) => /site00/.test(p));
  copyTree(path.join(ROOT, 'api/site00'), path.join(OUT, 'api/site00'));
  copyTree(path.join(ROOT, 'api/_lib/site00Assts'), path.join(OUT, 'api/_lib/site00Assts'));
  copyTree(path.join(ROOT, 'api/_lib/site00Production'), path.join(OUT, 'api/_lib/site00Production'));
  copyFiltered(
    path.join(ROOT, 'supabase/migrations'),
    path.join(OUT, 'supabase/migrations'),
    (p) => /site00/.test(path.basename(p)),
  );

  copyFile(
    path.join(ROOT, 'scripts/vite-site00-assts-local-api.mjs'),
    path.join(OUT, 'scripts/vite-site00-assts-local-api.mjs'),
  );

  fs.writeFileSync(
    path.join(OUT, 'index.html'),
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>SITE 00</title>
    <link rel="stylesheet" href="/site00-assts-loader-boot.css" />
    <script src="/site00-assts-boot-gate.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
  );

  fs.writeFileSync(
    path.join(OUT, 'package.json'),
    JSON.stringify(
      {
        name: 'site-00',
        private: true,
        version: '0.1.0',
        description: 'SITE 00 — standalone digital-place production platform',
        type: 'module',
        scripts: {
          dev: 'vite --port 3002 --host',
          build: 'tsc --noEmit && vite build',
          preview: 'vite preview --port 4173 --host',
          typecheck: 'tsc --noEmit',
        },
        dependencies: {
          '@supabase/supabase-js': '^2.45.0',
          react: '^19.0.0',
          'react-dom': '^19.0.0',
          'react-router-dom': '^6.8.0',
        },
        devDependencies: {
          '@types/node': '^20.0.0',
          '@types/react': '^18.3.12',
          '@types/react-dom': '^18.3.1',
          '@vitejs/plugin-react': '^4.3.3',
          typescript: '~5.6.2',
          vite: '^5.4.10',
          tsx: '^4.19.0',
        },
      },
      null,
      2,
    ) + '\n',
  );

  fs.writeFileSync(
    path.join(OUT, 'vite.config.ts'),
    `import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { site00AsstsLocalApiPlugin } from './scripts/vite-site00-assts-local-api.mjs';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = (env.VITE_DEV_PROXY_TARGET || env.VITE_API_BASE || '').trim();

  return {
    plugins: [react(), site00AsstsLocalApiPlugin()],
    resolve: {
      alias: { '@': path.resolve(__dirname, 'src') },
    },
    build: { outDir: 'dist', sourcemap: true },
    server: {
      port: 3002,
      host: '0.0.0.0',
      strictPort: true,
      proxy: apiTarget
        ? { '/api': { target: apiTarget.replace(/\\/$/, ''), changeOrigin: true } }
        : undefined,
    },
  };
});
`,
  );

  fs.writeFileSync(
    path.join(OUT, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          useDefineForClassFields: true,
          lib: ['ES2022', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          isolatedModules: true,
          moduleDetection: 'force',
          resolveJsonModule: true,
          noEmit: true,
          jsx: 'react-jsx',
          strict: true,
          noUnusedLocals: false,
          noUnusedParameters: false,
          noFallthroughCasesInSwitch: true,
          baseUrl: '.',
          paths: { '@/*': ['src/*'] },
          types: ['vite/client', 'node'],
        },
        include: ['src'],
      },
      null,
      2,
    ) + '\n',
  );

  fs.writeFileSync(path.join(OUT, 'src/vite-env.d.ts'), '/// <reference types="vite/client" />\n');
  fs.writeFileSync(
    path.join(OUT, '.gitignore'),
    `node_modules/\ndist/\n.env\n.env.local\n.env.*.local\n.DS_Store\n`,
  );
  fs.writeFileSync(
    path.join(OUT, '.env.example'),
    `# SITE 00 standalone — copy to .env.local
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE=
VITE_SITE00_ROOT=1
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAILS=
FAL_KEY=
`,
  );
  fs.writeFileSync(
    path.join(OUT, 'README.md'),
    `# SITE 00

Standalone extraction from Frontal Slayer for **site00.com** deployment.

\`\`\`bash
npm install
cp .env.example .env.local
npm run dev
\`\`\`

Set \`VITE_SITE00_ROOT=1\` to mount Origin at \`/\`. See \`docs/DEPLOYMENT.md\`.
`,
  );
  fs.mkdirSync(path.join(OUT, 'docs'), { recursive: true });
  fs.writeFileSync(
    path.join(OUT, 'docs/DEPLOYMENT.md'),
    `# SITE 00 Deployment

- GitHub: https://github.com/yoteenz/SITE00
- Build: \`npm run build\` → deploy \`dist/\`
- API: host \`api/\` on Node or Edge; see Frontal Slayer \`api/site00/*\` handlers
- Supabase: shared project \`hyycomvcaqxxvyrfupes\`; migrations in \`supabase/migrations/\`
`,
  );

  const total = fs.readdirSync(path.join(OUT, 'src'), { recursive: true }).length;
  console.log(`[site00-extract] done (~${total} src entries)`);
}

main();
