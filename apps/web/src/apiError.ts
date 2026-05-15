export type ApiErrorBody = {
  code?: string;
  message?: string | { message?: string };
};

export function parseApiErrorBody(raw: string): ApiErrorBody | null {
  try {
    return JSON.parse(raw) as ApiErrorBody;
  } catch {
    return null;
  }
}

export function apiErrorCode(body: ApiErrorBody | null): string | undefined {
  return body?.code;
}

export function apiErrorMessage(body: ApiErrorBody | null, fallback: string): string {
  if (!body) {
    return fallback;
  }
  if (typeof body.message === 'string') {
    return body.message;
  }
  if (body.message && typeof body.message === 'object' && body.message.message) {
    return body.message.message;
  }
  return fallback;
}

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function apiErrorFromResponse(res: Response): Promise<ApiRequestError> {
  const raw = await res.text();
  const body = parseApiErrorBody(raw);
  return new ApiRequestError(
    res.status,
    apiErrorMessage(body, res.statusText || 'Request failed'),
    apiErrorCode(body),
  );
}
