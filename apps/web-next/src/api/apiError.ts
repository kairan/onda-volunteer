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

export function shellRouteErrorMessage(error: Error): string {
  if (error instanceof ApiRequestError) {
    if (error.status === 404) {
      return 'Event not found';
    }
    return error.message;
  }
  const message = error.message;
  if (message.toLowerCase().includes('not found')) {
    return 'Event not found';
  }
  if (message.includes('fetch')) {
    const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
    return `Cannot reach the API at ${base}. Start Postgres (docker compose up -d), then run pnpm dev:api in another terminal.`;
  }
  return message;
}
