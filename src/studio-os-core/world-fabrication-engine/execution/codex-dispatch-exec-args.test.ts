import { describe, expect, it } from 'vitest';
import { buildCodexExecInvocation } from './codex-dispatch-adapter';

describe('Codex exec invocation (non-billable regression)', () => {
  it('uses workspace-write sandbox and stdin prompt without unsupported flags', () => {
    const { argv, useStdin } = buildCodexExecInvocation('test');
    expect(useStdin).toBe(true);
    expect(argv).toContain('workspace-write');
    expect(argv[argv.length - 1]).toBe('-');
    expect(argv.join(' ')).not.toMatch(/\s-a\s|--ask-for-approval/);
    expect(argv).toContain('-s');
  });

  it('inserts -m when model option is provided', () => {
    const { argv } = buildCodexExecInvocation('test', { model: 'gpt-6-astra' });
    const mIdx = argv.indexOf('-m');
    expect(mIdx).toBeGreaterThan(-1);
    expect(argv[mIdx + 1]).toBe('gpt-6-astra');
  });

  it('appends -i paths before stdin prompt flag', () => {
    const { argv } = buildCodexExecInvocation('test', {
      imageInputs: ['/tmp/ref.jpg', '/tmp/overlay.png'],
    });
    expect(argv).toContain('-i');
    const iIdx = argv.lastIndexOf('-i');
    expect(argv[iIdx + 1]).toBe('/tmp/overlay.png');
    expect(argv[argv.length - 1]).toBe('-');
  });
});
