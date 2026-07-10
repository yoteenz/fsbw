import { describe, expect, it, beforeEach } from 'vitest';
import { buildEnvironmentShellRecipe } from '../creative-studio-preview/environment-shell';
import {
  clearValidationPreviewSession,
  registerValidationEnvironmentShell,
  getValidationEnvironmentShell,
  getEphemeralLayerRecord,
  verifyEphemeralShellMount,
  resetEphemeralValidationRegistryForTests,
} from './ephemeral-validation-registry';
import { getSceneStackLayerRecord } from './store';
import { resolveShellLockState } from './world-compiler/immutable-shell';
import { diagnoseShellResolution, shellIsMountReady } from './shell-diagnostics';
import { buildPreviewCompileContext, buildPreviewSessionId } from './preview-compile-context';
import {
  setValidationPreviewSession,
  setValidationRenderMode,
} from './validation-render';

function mkShell(
  companyId: 'studio-os' | 'frontal-slayer' | 'ndx',
  conceptId: 'a' | 'b' | 'c',
  projectId: string,
  previewSessionId: string
) {
  const recipe = buildEnvironmentShellRecipe({
    companyId,
    conceptId,
    projectId,
    previewSessionId,
  });
  return {
    ...recipe,
    publicUrl: 'data:image/webp;base64,test',
    generatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 600_000).toISOString(),
    registryScope: 'ephemeral-validation' as const,
    generationMethod: 'preview-canvas' as const,
    canonicalStatus: 'non_canonical' as const,
  };
}

describe('Preview-scoped shell resolution', () => {
  beforeEach(() => {
    resetEphemeralValidationRegistryForTests();
    setValidationRenderMode('production');
    setValidationPreviewSession(null);
  });

  it('single preview: explicit previewSessionId resolves mount-ready shell', () => {
    const sessionId = buildPreviewSessionId({
      companyId: 'studio-os',
      conceptId: 'a',
      departmentId: 'studio-command-center',
      stationId: 'executive-atrium',
      projectId: 'command-center-golden-v1',
    });
    const shell = mkShell('studio-os', 'a', 'command-center-golden-v1', sessionId);
    registerValidationEnvironmentShell(shell);

    const ctx = buildPreviewCompileContext({
      previewSessionId: sessionId,
      departmentId: shell.departmentId,
      projectId: shell.projectId,
      stationId: shell.stationId,
      conceptId: 'a',
      companyId: 'studio-os',
      compileRunId: 'run-test-1',
    });

    const lock = resolveShellLockState(shell.departmentId, shell.projectId, shell.stationId, {
      validationMode: true,
      previewSessionId: sessionId,
    });
    expect(lock.resolution).toBe('validation-draft');
    expect(lock.shellUrl).toBeTruthy();
    expect(shellIsMountReady(shell.departmentId, shell.projectId, shell.stationId, { previewCompileContext: ctx })).toBe(true);

    const diag = diagnoseShellResolution(shell.departmentId, shell.projectId, shell.stationId, {
      previewCompileContext: ctx,
    });
    expect(diag.recoveryPhase).toBe('recovery-complete');
    expect(diag.resolution).toBe('validation-draft');
  });

  it('compare mode: preview A shell not visible to preview B scope', () => {
    const sessionA = buildPreviewSessionId({
      companyId: 'frontal-slayer',
      conceptId: 'a',
      departmentId: 'creative-direction',
      stationId: 'arrival',
      projectId: 'project-001',
    });
    const sessionB = buildPreviewSessionId({
      companyId: 'studio-os',
      conceptId: 'a',
      departmentId: 'studio-command-center',
      stationId: 'executive-atrium',
      projectId: 'command-center-golden-v1',
    });

    registerValidationEnvironmentShell(mkShell('frontal-slayer', 'a', 'project-001', sessionA));
    registerValidationEnvironmentShell(mkShell('studio-os', 'a', 'command-center-golden-v1', sessionB));

    const overlayA = getEphemeralLayerRecord(
      sessionA,
      'creative-direction',
      'project-001',
      'arrival',
      'environment-shell'
    );
    const overlayBWrongSession = getEphemeralLayerRecord(
      sessionB,
      'creative-direction',
      'project-001',
      'arrival',
      'environment-shell'
    );

    expect(overlayA?.publicUrl).toBeTruthy();
    expect(overlayBWrongSession).toBeNull();
    expect(getValidationEnvironmentShell(sessionA)?.shellId).toContain('frontal-slayer');
    expect(getValidationEnvironmentShell(sessionB)?.shellId).toContain('studio-os');
  });

  it('global activePreviewSessionId does not control explicit lookup', () => {
    const sessionA = 'frontal-slayer:a:creative-direction:arrival:project-001';
    const sessionB = 'studio-os:a:studio-command-center:executive-atrium:command-center-golden-v1';
    registerValidationEnvironmentShell(mkShell('frontal-slayer', 'a', 'project-001', sessionA));
    setValidationPreviewSession(sessionB);

    const record = getSceneStackLayerRecord(
      'creative-direction',
      'project-001',
      'arrival',
      'environment-shell',
      { validationMode: true, previewSessionId: sessionA }
    );
    expect(record?.publicUrl).toBeTruthy();
  });

  it('without previewSessionId ephemeral overlay is not read', () => {
    const sessionId = 'studio-os:a:studio-command-center:executive-atrium:command-center-golden-v1';
    registerValidationEnvironmentShell(mkShell('studio-os', 'a', 'command-center-golden-v1', sessionId));
    setValidationRenderMode('experience-lab-validation');
    setValidationPreviewSession(sessionId);

    const record = getSceneStackLayerRecord(
      'studio-command-center',
      'command-center-golden-v1',
      'executive-atrium',
      'environment-shell'
    );
    expect(record).toBeNull();
  });

  it('verifyEphemeralShellMount fails on scope mismatch', () => {
    const sessionId = 'studio-os:a:studio-command-center:executive-atrium:command-center-golden-v1';
    registerValidationEnvironmentShell(mkShell('studio-os', 'a', 'command-center-golden-v1', sessionId));
    const verification = verifyEphemeralShellMount({
      previewSessionId: sessionId,
      departmentId: 'creative-direction',
      projectId: 'project-001',
      stationId: 'arrival',
    });
    expect(verification.ok).toBe(false);
    expect(verification.errorCode).toBe('SHELL_RECOVERY_LOOKUP_MISMATCH');
  });

  it('diagnostics do not report recovery-complete before mount readiness', () => {
    const sessionId = 'studio-os:a:studio-command-center:executive-atrium:command-center-golden-v1';
    registerValidationEnvironmentShell(mkShell('studio-os', 'a', 'command-center-golden-v1', sessionId));
    setValidationPreviewSession(sessionId);

    const diagWrongScope = diagnoseShellResolution(
      'creative-direction',
      'project-001',
      'arrival',
      { validationMode: true, previewSessionId: sessionId }
    );
    expect(diagWrongScope.recoveryPhase).toBe('recovery-failed');
    expect(diagWrongScope.recoveryAction).not.toContain('mount-ready for this preview session');
  });

  it('registration followed by immediate lookup verifies mount', () => {
    const sessionId = 'studio-os:a:studio-command-center:executive-atrium:command-center-golden-v1';
    const shell = mkShell('studio-os', 'a', 'command-center-golden-v1', sessionId);
    registerValidationEnvironmentShell(shell);
    const verification = verifyEphemeralShellMount({
      previewSessionId: sessionId,
      departmentId: shell.departmentId,
      projectId: shell.projectId,
      stationId: shell.stationId,
    });
    expect(verification.ok).toBe(true);
    expect(verification.mountReady).toBe(true);
  });

  it('clearValidationPreviewSession removes only target session', () => {
    const sessionA = 'a-session';
    const sessionB = 'b-session';
    registerValidationEnvironmentShell(mkShell('studio-os', 'a', 'command-center-golden-v1', sessionA));
    registerValidationEnvironmentShell(mkShell('frontal-slayer', 'a', 'project-001', sessionB));
    clearValidationPreviewSession(sessionA);
    expect(getValidationEnvironmentShell(sessionA)).toBeNull();
    expect(getValidationEnvironmentShell(sessionB)).toBeTruthy();
  });
});
