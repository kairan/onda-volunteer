import { describe, expect, it } from 'vitest';
import {
  ApiRequestError,
  apiErrorCode,
  apiErrorMessage,
  parseApiErrorBody,
  shellRouteErrorMessage,
} from './apiError';

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

  it('maps ApiRequestError 404 to a roster-friendly message', () => {
    expect(
      shellRouteErrorMessage(new ApiRequestError(404, 'missing')),
    ).toBe('Event not found');
  });
});
