import { describe, expect, it } from 'vitest';
import { apiErrorCode, apiErrorMessage, parseApiErrorBody } from './apiError';

describe('apiError', () => {
  it('parses Nest-style error bodies', () => {
    const body = parseApiErrorBody(
      JSON.stringify({
        code: 'PROFILE_NOT_LINKED',
        message: 'No Volunteer profile is linked to this authenticated subject.',
      }),
    );
    expect(apiErrorCode(body)).toBe('PROFILE_NOT_LINKED');
    expect(apiErrorMessage(body, 'fallback')).toContain('Volunteer profile');
  });
});
