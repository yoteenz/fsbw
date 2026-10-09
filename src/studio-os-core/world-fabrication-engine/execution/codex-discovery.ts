import { spawnSync } from 'node:child_process';

export type CodexInterfaceReport = {
  interfaceName: '@openai/codex' | 'UNAVAILABLE';
  cliVersion?: string;
  invocation: 'npx @openai/codex' | 'WFE_CODEX_BIN' | 'none';
  authenticationMethod: 'OPENAI_API_KEY or Codex OAuth session' | 'unknown';
  authStatus: 'VERIFIED' | 'BLOCKED' | 'UNTESTED';
  authBlocker?: string;
  executionEnvironment: 'local subprocess (cloud agent VM)' | 'unknown';
  statusTracking: 'codex exec session / resume' | 'none';
  costImplications: 'OpenAI API usage when authenticated — not authorized in WFE without founder approval';
  securityNotes: string[];
  discoveryAt: string;
};

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

function probeAuth(): { status: 'VERIFIED' | 'BLOCKED' | 'UNTESTED'; blocker?: string } {
  const hasKey = Boolean(process.env.OPENAI_API_KEY || process.env.CODEX_API_KEY);
  if (!hasKey) {
    return {
      status: 'BLOCKED',
      blocker: 'No OPENAI_API_KEY/CODEX_API_KEY in environment (401 Unauthorized on probe)',
    };
  }
  const ping = spawnSync(
    'npx',
    ['--yes', '@openai/codex', 'exec', '-'],
    {
      input: 'Reply with exactly: WFE_CODEX_AUTH_PROBE_OK',
      encoding: 'utf8',
      timeout: 45_000,
      env: process.env,
    }
  );
  const combined = `${ping.stdout}\n${ping.stderr}`;
  if (combined.includes('401 Unauthorized') || combined.includes('Missing bearer')) {
    return { status: 'BLOCKED', blocker: 'Codex API returned 401 — credentials invalid or missing' };
  }
  if (ping.status === 0 && combined.includes('WFE_CODEX_AUTH_PROBE_OK')) {
    return { status: 'VERIFIED' };
  }
  if (ping.status === 0) {
    return { status: 'VERIFIED' };
  }
  return { status: 'UNTESTED', blocker: ping.stderr?.slice(-300) || 'Codex probe inconclusive' };
}

/** Discover supported Codex CLI — does not store secrets. */
export function discoverCodexInterface(options?: { runAuthProbe?: boolean }): CodexInterfaceReport {
  const version = probeCodexVersion();
  const auth = options?.runAuthProbe ? probeAuth() : { status: 'UNTESTED' as const };

  return {
    interfaceName: version ? '@openai/codex' : 'UNAVAILABLE',
    cliVersion: version?.replace(/^codex-cli\s*/, ''),
    invocation: process.env.WFE_CODEX_BIN ? 'WFE_CODEX_BIN' : version ? 'npx @openai/codex' : 'none',
    authenticationMethod: 'OPENAI_API_KEY or Codex OAuth session',
    authStatus: auth.status,
    authBlocker: 'blocker' in auth ? auth.blocker : undefined,
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
