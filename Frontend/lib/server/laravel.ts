/**
 * Server-only wrapper for calling Laravel.
 * `import 'server-only'` causes a build error if this is accidentally imported
 * in a client component — keeps LARAVEL_URL out of the browser bundle.
 */

import 'server-only';

const LARAVEL_URL = process.env['LARAVEL_URL'] ?? 'http://localhost:8000';

export async function laravelFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${LARAVEL_URL}/api/v1${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...init?.headers,
    },
  });
}
