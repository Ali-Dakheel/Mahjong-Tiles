# Mahjong Hand Betting Game

A web-based higher-or-lower betting game built with real Mahjong tiles. Bet whether the next hand will score higher or lower than the current one. Survive as long as possible — the honor tile value system and deck limit ensure every run is finite and strategic.

Built as a Senior SWE technical assessment.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript (strict) |
| Styling | Tailwind CSS v4 (CSS-first), custom design system |
| Animation | Motion v12 (`motion/react`) |
| State | Zustand v5 |
| Data Fetching | TanStack Query v5 + Axios |
| Icons | Lucide React |
| Font | Cinzel (Google Fonts) |
| Backend | Laravel 12, PHP 8.2+ |
| Database | SQLite (dev) |
| Testing | Pest v3 |
| Code Style | Laravel Pint |

---

## Project Structure

```
mahjong-bet/
├── Frontend/   ← Next.js 16 App Router
└── Backend/    ← Laravel 12 REST API
```

### Frontend layout

```
app/
  page.tsx              ← Landing page (name input + leaderboard)
  game/page.tsx         ← Game page (phase state machine)
  api/
    scores/route.ts     ← BFF proxy → POST /api/v1/scores
    leaderboard/route.ts← BFF proxy → GET /api/v1/leaderboard
lib/
  engine/tile-engine.ts ← Pure game logic (zero React deps)
  stores/useGameStore.ts← Zustand store — all game state + actions
  hooks/
    useGameState.ts          ← Single shallow store subscription
    usePhaseAutoAdvance.ts   ← Auto-advance timing hook
    useLeaderboard.ts        ← TanStack Query leaderboard hook
  constants/
    phases.ts     ← Phase labels, indicator colors, advance delays
    gameOver.ts   ← Shared game-over reason config
  api/game.ts     ← Client Axios functions (hits BFF routes)
  server/laravel.ts ← Server-only fetch wrapper (hides LARAVEL_URL)
components/game/  ← All 8 game components + barrel export (index.ts)
types/game.ts     ← All shared TypeScript types
```

### Backend layout

```
app/Http/Controllers/Api/V1/ScoreController.php ← Thin controller
app/Http/Requests/StoreScoreRequest.php         ← Validation
app/Http/Resources/ScoreResource.php            ← Response shaping
app/Models/Score.php                            ← Eloquent model
app/Services/ScoreService.php                   ← Business logic
routes/api.php                                  ← POST scores, GET leaderboard
database/migrations/..._create_scores_table.php
```

---

## Setup

### Prerequisites

- Node.js 20+
- PHP 8.2+
- Composer

### Backend

```bash
cd Backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve --port=8000
```

### Frontend

```bash
cd Frontend
npm install
# .env.local already contains LARAVEL_URL=http://localhost:8000
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## API Reference

Base URL: `http://localhost:8000/api/v1`

| Method | Path | Description |
|---|---|---|
| `POST` | `/scores` | Save a game score |
| `GET` | `/leaderboard` | Top 5 scores (desc) |

### POST /scores — Request body

```json
{
  "player_name": "string (max 255)",
  "score": "integer (≥ 0)",
  "rounds_played": "integer (≥ 0)",
  "game_over_reason": "tile_value_zero | tile_value_ten | reshuffle_limit"
}
```

---

## Architecture Decisions

**BFF Proxy Routes** — The Next.js `app/api/` routes proxy all requests to Laravel. This keeps `LARAVEL_URL` server-side only (never sent to the browser), provides a stable same-origin API contract for the client, and means only one origin needs configuring in Laravel CORS.

**Pure Tile Engine** — `lib/engine/tile-engine.ts` contains all game logic as pure functions with no React dependencies. It can be unit tested in complete isolation and extended (new tile types, hand patterns, scoring rules) without touching any UI code.

**Zustand + useShallow** — Game state lives in a single Zustand store. The game page subscribes via `useShallow` so React only re-renders when the selected slice actually changes, not on every store write.

**Phase State Machine** — Five explicit phases (`idle → dealing → betting → revealing → game_over`) drive the entire UI. Timing for auto-advance is centralised in `usePhaseAutoAdvance` and delays are defined in `lib/constants/phases.ts`.

**Shared Constants** — `lib/constants/gameOver.ts` is the single source of truth for game-over reason labels, descriptions, icons, and colors — consumed by both the `GameOverScreen` and `LeaderboardTable` components.

---

## AI Utilisation

This project was built with significant AI assistance (Claude Sonnet 4.6 via Claude Code CLI). The following reflects an honest breakdown:

**AI-assisted (architecture + implementation):**
- Initial project scaffolding (Next.js + Laravel setup, directory structure)
- Component code generation for all 8 game components
- Zustand store (`useGameStore.ts`) — state shape and action logic
- BFF proxy routes and server fetch wrapper
- Laravel backend: migration, model, service, form request, resource, controller
- Tailwind v4 design system (`globals.css`) — CSS variables, 3D flip classes, animations
- Refactoring passes: extracting custom hooks, centralising constants, barrel exports

**Handwritten / human-directed:**
- All game design decisions (scoring formula, honor tile scaling, game-over conditions)
- Architecture decisions (BFF pattern, pure engine, phase state machine, useShallow)
- Component decoupling decisions (BettingControls prop vs store, BetButton extraction)
- All code review and quality decisions (what to refactor, what to remove, naming)
- Debugging (duplicate tile key bug on reshuffle, TypeScript strict type fixes)

The AI was used as a pair programmer — generating implementations from specifications I defined and reviewed, not as an autonomous builder.

---

## Running Tests

```bash
cd Backend
php artisan test
```
