import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DestructiveConfirmDialog } from './DestructiveConfirmDialog';

describe('DestructiveConfirmDialog', () => {
  it('uses a specific verb for the destructive action label', () => {
    render(
      <DestructiveConfirmDialog
        open
        title="Remove assignment"
        description="This cannot be undone."
        confirmLabel="Remove assignment"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Remove assignment' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^ok$/i })).not.toBeInTheDocument();
  });
});
