import 'server-only';

const LARAVEL_URL = process.env['LARAVEL_URL'] ?? 'http://localhost:8000';

export async function laravelFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(`${LARAVEL_URL}/api/v1${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...init?.headers,
    },
  });
}
