/**
 * lib/server/laravel.ts — Server-Only Laravel Fetch Wrapper
 *
 * `import 'server-only'` at the top is a Next.js guard that causes a BUILD ERROR
 * if this file is ever accidentally imported in a client component ('use client').
 * It physically prevents LARAVEL_URL from leaking to the browser bundle.
 *
 * WHY does this exist separately from lib/api/game.ts?
 *   game.ts runs in the browser (calls /api/scores which is our own Next.js route).
 *   THIS file runs on the Next.js SERVER and calls Laravel directly.
 *   They are different execution environments, intentionally separated.
 *
 * How the full request chain works:
 *   Browser → POST /api/scores (Next.js route) → laravelFetch('/scores') → Laravel
 *   Browser → GET  /api/leaderboard (Next.js route) → laravelFetch('/leaderboard') → Laravel
 *
 * The browser only ever sees /api/scores and /api/leaderboard on the same domain.
 * Laravel's real address (LARAVEL_URL) is only ever read on the server.
 */

import 'server-only'; // crash the build if this is imported on the client side

// Read the Laravel base URL from environment. Falls back to localhost for local dev.
const LARAVEL_URL = process.env['LARAVEL_URL'] ?? 'http://localhost:8000';

/**
 * laravelFetch
 *
 * Thin wrapper around the native fetch() that:
 *  - Prepends the Laravel base URL + /api/v1
 *  - Sets JSON Content-Type and Accept headers automatically
 *  - Allows callers to override headers if needed
 *
 * @param path  - The API path, e.g. '/scores' or '/leaderboard'
 * @param init  - Optional fetch options (method, body, headers)
 *
 * Usage:
 *   const res = await laravelFetch('/scores', { method: 'POST', body: JSON.stringify(data) })
 */
export async function laravelFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(`${LARAVEL_URL}/api/v1${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...init?.headers, // caller headers override defaults if provided
    },
  });
}
