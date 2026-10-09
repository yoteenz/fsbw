import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { resolveBlenderExecutable } from './blender-path';

export type ValidateV2RunResult =
  | { status: 'PASS'; logDir: string; exitCode: 0 }
  | { status: 'FAIL'; logDir: string; exitCode: number; stderrTail: string }
  | { status: 'BLOCKED'; reason: string };

export function dispatchBlenderValidateV2(packageRoot: string, logDir: string): ValidateV2RunResult {
  const script = join(packageRoot, '01_SOURCE/validate_v2.py');
  if (!existsSync(script)) {
    return { status: 'BLOCKED', reason: 'validate_v2.py not found' };
  }
  const high = join(packageRoot, '02_EXPORTS/SITE00_Build_Object_V2_High.glb');
  const fbx = join(packageRoot, '02_EXPORTS/SITE00_Build_Object_V2_DCC.fbx');
  if (!existsSync(high) || !existsSync(fbx)) {
    return {
      status: 'BLOCKED',
      reason: 'Reduced fixture — missing High.glb or FBX required by validate_v2.py',
    };
  }

  const blender = resolveBlenderExecutable();
  if (!blender) return { status: 'BLOCKED', reason: 'Blender 5.2+ not found' };

  mkdirSync(logDir, { recursive: true });
  const stdoutPath = join(logDir, 'validate_v2_stdout.log');
  const stderrPath = join(logDir, 'validate_v2_stderr.log');

  const result = spawnSync(blender.path, ['--background', '--python', script], {
    encoding: 'utf8',
    timeout: 300_000,
    cwd: packageRoot,
  });

  writeFileSync(stdoutPath, result.stdout ?? '');
  writeFileSync(stderrPath, result.stderr ?? '');

  if (result.status === 0) {
    return { status: 'PASS', logDir, exitCode: 0 };
  }
  return {
    status: 'FAIL',
    logDir,
    exitCode: result.status ?? 1,
    stderrTail: (result.stderr ?? '').slice(-2000),
  };
}
