import { spawnSync } from 'node:child_process';

export type CodexInterfaceReport = {
  interfaceName: '@openai/codex' | 'UNAVAILABLE';
  cliVersion?: string;
  invocation: 'npx @openai/codex' | 'WFE_CODEX_BIN' | 'none';
  authenticationMethod:
    | 'ChatGPT login (browser or device-auth) or OPENAI_API_KEY via codex login --with-api-key'
    | 'unknown';
  authStatus: 'VERIFIED' | 'BLOCKED' | 'UNTESTED';
  authBlocker?: string;
  /** Non-billable probe sources used for authStatus */
  authProbeMethod?: 'login_status_and_doctor' | 'none';
  executionEnvironment: 'local subprocess (cloud agent VM)' | 'unknown';
  statusTracking: 'codex exec session / resume' | 'none';
  costImplications: 'OpenAI API usage when authenticated — not authorized in WFE without founder approval';
  securityNotes: string[];
  discoveryAt: string;
};

function runCodex(args: string[], options?: { input?: string; timeoutMs?: number }) {
  const bin = process.env.WFE_CODEX_BIN;
  const cmd = bin ? bin : 'npx';
  const fullArgs = bin ? args : ['--yes', '@openai/codex', ...args];
  return spawnSync(cmd, fullArgs, {
    input: options?.input,
    encoding: 'utf8',
    timeout: options?.timeoutMs ?? 60_000,
    env: process.env,
  });
}

function parseLoginStatus(stdout: string, stderr: string): 'LOGGED_IN' | 'NOT_LOGGED_IN' | 'UNKNOWN' {
  const combined = `${stdout}\n${stderr}`.trim();
  if (/not logged in/i.test(combined)) return 'NOT_LOGGED_IN';
  if (/logged in/i.test(combined)) return 'LOGGED_IN';
  return 'UNKNOWN';
}

function parseDoctorAuth(stdout: string, stderr: string): 'OK' | 'MISSING' | 'UNKNOWN' {
  const combined = `${stdout}\n${stderr}`;
  if (/[✓✔]\s*auth\b/i.test(combined) || /\bauth\s+ok\b/i.test(combined)) return 'OK';
  if (/[✗✘]\s*auth\b/i.test(combined) || /no Codex credentials/i.test(combined)) return 'MISSING';
  return 'UNKNOWN';
}

/** Cost-safe: no codex exec / model calls. */
function probeAuth(): { status: 'VERIFIED' | 'BLOCKED' | 'UNTESTED'; blocker?: string } {
  const apiKey = process.env.OPENAI_API_KEY || process.env.CODEX_API_KEY;
  if (apiKey) {
    runCodex(['login', '--with-api-key'], { input: `${apiKey}\n`, timeoutMs: 45_000 });
  }

  const status = runCodex(['login', 'status'], { timeoutMs: 30_000 });
  const loginState = parseLoginStatus(status.stdout ?? '', status.stderr ?? '');
  if (loginState === 'LOGGED_IN') {
    return { status: 'VERIFIED' };
  }

  const doctor = runCodex(['doctor'], { timeoutMs: 45_000 });
  const doctorAuth = parseDoctorAuth(doctor.stdout ?? '', doctor.stderr ?? '');
  if (doctorAuth === 'OK') {
    return { status: 'VERIFIED' };
  }

  if (!apiKey && loginState === 'NOT_LOGGED_IN') {
    return {
      status: 'BLOCKED',
      blocker:
        'No Codex session (codex login status: Not logged in). Add OPENAI_API_KEY in Cursor Cloud Agent secrets or complete ChatGPT device-auth — see docs/studio-os/world-fabrication-engine/CODEX_AUTHENTICATION_UNBLOCK_V1.md',
    };
  }

  if (apiKey && doctorAuth === 'MISSING') {
    return {
      status: 'BLOCKED',
      blocker:
        'OPENAI_API_KEY present but Codex doctor reports missing credentials — key invalid, expired, or login failed',
    };
  }

  return {
    status: 'UNTESTED',
    blocker: 'Codex auth probe inconclusive (login status / doctor)',
  };
}

function probeCodexVersion(): string | undefined {
  const bin = process.env.WFE_CODEX_BIN;
  if (bin) {
    const r = spawnSync(bin, ['--version'], { encoding: 'utf8', timeout: 30_000 });
    if (r.status === 0) return (r.stdout || r.stderr).trim();
  }
  const r = spawnSync('npx', ['--yes', '@openai/codex', '--version'], {
    encoding: 'utf8',
    timeout: 60_000,
  });
  if (r.status === 0) return (r.stdout || '').trim();
  return undefined;
}

/** Discover supported Codex CLI — does not store secrets. */
export function discoverCodexInterface(options?: { runAuthProbe?: boolean }): CodexInterfaceReport {
  const version = probeCodexVersion();
  const auth = options?.runAuthProbe ? probeAuth() : { status: 'UNTESTED' as const };

  return {
    interfaceName: version ? '@openai/codex' : 'UNAVAILABLE',
    cliVersion: version?.replace(/^codex-cli\s*/, ''),
    invocation: process.env.WFE_CODEX_BIN ? 'WFE_CODEX_BIN' : version ? 'npx @openai/codex' : 'none',
    authenticationMethod:
      'ChatGPT login (browser or device-auth) or OPENAI_API_KEY via codex login --with-api-key',
    authStatus: auth.status,
    authBlocker: 'blocker' in auth ? auth.blocker : undefined,
    authProbeMethod: options?.runAuthProbe ? 'login_status_and_doctor' : 'none',
    executionEnvironment: 'local subprocess (cloud agent VM)',
    statusTracking: version ? 'codex exec session / resume' : 'none',
    costImplications:
      'OpenAI API usage when authenticated — not authorized in WFE without founder approval',
    securityNotes: [
      'Never commit API keys; use Cursor/cloud secrets only',
      'Fabrication jobs must not pass arbitrary shell from client input',
      'Codex exec is general-purpose — WFE uses bounded assignment manifests only',
    ],
    discoveryAt: new Date().toISOString(),
  };
}
