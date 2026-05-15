import { describe, expect, it } from 'vitest';
import { createToastOrchestrator } from './toastOrchestrator';

describe('toast orchestrator', () => {
  it('keeps at most two non-critical toasts and drops the oldest', () => {
    const orchestrator = createToastOrchestrator();
    orchestrator.push({ id: '1', kind: 'success', message: 'a' });
    orchestrator.push({ id: '2', kind: 'info', message: 'b' });
    orchestrator.push({ id: '3', kind: 'success', message: 'c' });
    expect(orchestrator.visible().map((toast) => toast.id)).toEqual(['2', '3']);
  });

  it('never drops error toasts when a new success toast arrives', () => {
    const orchestrator = createToastOrchestrator();
    orchestrator.push({ id: 'err', kind: 'error', message: 'failed' });
    orchestrator.push({ id: '1', kind: 'success', message: 'a' });
    orchestrator.push({ id: '2', kind: 'info', message: 'b' });
    orchestrator.push({ id: '3', kind: 'success', message: 'c' });
    expect(orchestrator.visible().some((toast) => toast.kind === 'error')).toBe(
      true,
    );
  });
});
