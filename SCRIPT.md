# Video Walkthrough Script — Mahjong Hand Betting Game
> Target: ~5 minutes. Speak slowly in the architecture section.

---

## [0:00–0:20] Opening

"Hey, I'm [name]. This is my submission for the senior web developer assessment.
I built a Mahjong hand betting game — a higher-or-lower survival game using a
real 136-tile Mahjong deck. The stack is Next.js 16 on the frontend and
Laravel 12 on the backend. I'll walk through the live app first, then explain
the key architecture decisions."

---

## [0:20–1:00] Landing Page

"This is the landing page. It's server-rendered — the leaderboard is fetched
server-side from Laravel and passed as initial data to TanStack Query, so
there's no loading flash on first render. I'll type my name and start a game."

*(type name → click Start Game)*

---

## [1:00–2:30] Gameplay

"The game deals 4 tiles face-down, then flips them face-up. These are a mix of
number tiles — Character 3, Bamboo 7 — and honor tiles — Red Dragon, East Wind.
Number tiles are always worth their face value. Honor tiles start at 5, but
their value shifts up or down each round depending on the outcome."

"My current total is [X]. I'll bet Higher."

*(click Higher — watch reveal)*

"New hand comes in, I got it right — streak starts. Score updates, draw pile
drops by 4. Over here on the left, the live tile value map shows all 7 honor
tiles. The bars turn red as a tile drops toward 0, gold as it climbs toward 10 —
either extreme ends the game. That's what creates tension: you're not just
guessing, you're watching the system drift in real time."

*(play 2–3 more rounds)*

"The history panel shows both hands side by side — previous on the left, new on
the right — so you can see exactly what happened each round. Streak badge appears
when you string wins together."

---

## [2:30–3:15] Game Over

*(play to game over, or describe a scenario)*

"Game over. Three possible endings: an honor tile reached 0 or 10, or the deck
reshuffled 3 times. I'll enter my name and save the score."

*(save — leaderboard updates instantly)*

"TanStack Query invalidates the leaderboard cache on save, so the table
refetches automatically — no page reload needed."

---

## [3:15–4:15] Architecture (slow down here)

"Three decisions worth calling out."

**BFF Proxy:**
"The Next.js app/api/ routes proxy all requests to Laravel. The browser only
ever sees same-origin calls — it never knows Laravel's address. LARAVEL_URL is
a server-side environment variable enforced by an 'import server-only' guard in
the fetch wrapper, which causes a build error if it's ever accidentally imported
in a client component."

**Pure Tile Engine:**
"All game math lives in lib/engine/tile-engine.ts with zero React dependencies.
It's a set of pure functions — build deck, shuffle, deal, calculate values, apply
scaling, check game over. Because there's no UI coupling, you can unit test it
in complete isolation, and adding new features doesn't touch any component code."

**Phase State Machine:**
"The entire UI is driven by five explicit phases. The usePhaseAutoAdvance hook
handles all the timing centrally — delays are defined in a constants file, not
scattered across components. Changing the dealing animation speed is one number
in one place."

---

## [4:15–4:45] Backend

"The Laravel backend is a thin REST API — POST scores and GET leaderboard. Form
Request handles validation, a Service layer handles business logic, and API
Resources shape the response. Tests run with Pest."

*(quick terminal show: php artisan test — all green)*

---

## [4:45–5:00] Close

"Both READMEs have full setup instructions. The AI utilisation section is an
honest breakdown of what was AI-assisted versus what I designed and directed
myself. Thanks for watching."

---

## Tips
- Architecture section: slow down, make eye contact, don't rush
- When clicking buttons: narrate what you're doing one step ahead
- If a tile value gets close to 0 or 10 during the demo, point it out — it demonstrates you understand the system
- Have the terminal ready for the Pest test command
