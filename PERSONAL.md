# My Study Guide — Mahjong Hand Betting Game
> Read this top to bottom. By the end you'll be able to explain every part of this project.

---

## 🎮 What Is This Game? (Explain it like I'm 10)

Imagine you have a deck of Mahjong tiles — like a deck of playing cards but with Chinese symbols.

Every round:
1. You're dealt **4 tiles face-up** on screen
2. The tiles add up to a **total number** (e.g. 20)
3. You have to guess: will the **next** 4 tiles add up to something **HIGHER** or **LOWER**?
4. If you guess right → you score points
5. If you guess wrong → no points, and your streak breaks

The game keeps going until one of 3 "game over" events happens (explained later).

That's it. Higher or lower. Like the card game "War" but with strategy.

---

## 🀄 The Tiles — What Are They Worth?

A real Mahjong set has **136 tiles** (34 unique types × 4 copies of each).

We split them into two groups:

### Group 1: Number Tiles (simple — value never changes)

```
Characters:  [1][2][3][4][5][6][7][8][9]   ← always worth their number
Bamboo:      [1][2][3][4][5][6][7][8][9]   ← always worth their number
Circles:     [1][2][3][4][5][6][7][8][9]   ← always worth their number
```

A Character 7 tile is always worth 7. Forever. Simple.

### Group 2: Honor Tiles (complex — value changes every round!)

```
Dragons:  🀄 Red Dragon   ← starts at 5
          🀅 Green Dragon ← starts at 5
          🀆 White Dragon ← starts at 5

Winds:    🀀 East  ← starts at 5
          🀁 South ← starts at 5
          🀂 West  ← starts at 5
          🀃 North ← starts at 5
```

**These tiles start at 5 but their value MOVES UP or DOWN as the game goes on.**

- If an honor tile appears in a **winning hand** → its value goes UP by 1 (next round it's worth 6)
- If an honor tile appears in a **losing hand** → its value goes DOWN by 1 (next round it's worth 4)

Think of it like a stock price — the tile's value responds to whether it's been "lucky" recently.

---

## 🔢 How Is a Hand's Total Calculated?

Just add up all 4 tiles.

Example hand:

```
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│Character│ │ Bamboo  │ │  Red    │ │  East   │
│    3    │ │    7    │ │ Dragon  │ │  Wind   │
│  = 3   │ │  = 7   │ │  = 6   │ │  = 4   │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
     3    +      7    +      6    +      4    =  20
```

The Red Dragon is worth 6 because it appeared in 1 previous winning hand (started at 5, went +1).
The East Wind is worth 4 because it appeared in 1 previous losing hand (started at 5, went -1).

---

## 💰 Scoring — How Do You Earn Points?

**Win a round:**

```
Points = 100 + (streak - 1) × 25
```

| Streak | Points this round |
|--------|-------------------|
| 1st win in a row | 100 |
| 2nd win in a row | 125 |
| 3rd win in a row | 150 |
| 4th win in a row | 175 |
| 5th win in a row | 200 |

**Lose a round:** +0 points. Streak resets to 0.

The longer you stay right, the more each win is worth. This rewards consistency.

---

## 💀 How Does the Game End? (3 Ways)

### Way 1: An honor tile value hits 0 or 10

```
Honor tile values are clamped 1–9 during play.
But the GAME OVER check fires when any value reaches 0 or 10.

Example:
  East Wind: 5 → 4 → 3 → 2 → 1 → GAME OVER  (tile_value_zero)
  Red Dragon: 5 → 6 → 7 → 8 → 9 → GAME OVER  (tile_value_ten)
```

The right sidebar shows live bars for all 7 honor tiles.
**Red bars = danger (near 0). Gold bars = also danger (near 10).**

### Way 2: The deck runs out 3 times

```
You start with 136 tiles.
You use 4 per round.
After ~32 rounds the draw pile runs out.

When the draw pile has fewer than 4 tiles left:
  → We grab a fresh 136-tile deck
  → Mix in the discard pile
  → Shuffle everything together
  → Reshuffle counter goes up by 1

If this happens 3 times → GAME OVER  (reshuffle_limit)
```

### Way 3: You just keep going until one of the above happens

There's no "you win" state. The game is a survival run. Your score at game over is your final score.

---

## 🔄 The Game Flow — Step by Step

Here's exactly what happens each round, visualised:

```
┌─────────────────────────────────────────────────────────────┐
│                        ROUND STARTS                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Phase: DEALING        │
              │                        │
              │  4 tiles animate in    │
              │  face-DOWN (hidden)    │
              │  Buttons are disabled  │
              │                        │
              │  ⏱ Wait 1500ms...      │
              └────────────┬───────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Phase: BETTING        │
              │                        │
              │  Tiles flip face-UP    │
              │  You see the total     │
              │                        │
              │  ┌────────┐ ┌────────┐ │
              │  │HIGHER ↑│ │LOWER ↓ │ │
              │  └────────┘ └────────┘ │
              │                        │
              │  You click one!        │
              └────────────┬───────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Phase: REVEALING      │
              │                        │
              │  New 4 tiles appear    │
              │  WIN or LOSS shown     │
              │  Score updates         │
              │  Honor values update   │
              │                        │
              │  ⏱ Wait 1800ms...      │
              └────────────┬───────────┘
                           │
                    ┌──────┴──────┐
                    │             │
              Game over?       Still alive?
                    │             │
                    ▼             ▼
             ┌──────────┐   Go back to
             │ GAME OVER│   DEALING ↑
             │ overlay  │
             └──────────┘
```

---

## 🗂 How the Code Is Organised

Think of the project as two separate apps in one folder:

```
mahjong-bet/
├── Frontend/   ← Everything the user SEES (Next.js)
└── Backend/    ← Everything that SAVES data (Laravel/PHP)
```

### The Frontend — 4 layers

```
┌─────────────────────────────────────────────────────────┐
│  LAYER 1: PAGES (what the user visits)                  │
│  app/page.tsx      ← the landing page                   │
│  app/game/page.tsx ← the actual game                    │
├─────────────────────────────────────────────────────────┤
│  LAYER 2: COMPONENTS (visual building blocks)           │
│  components/game/                                       │
│    Tile.tsx            ← one tile on screen             │
│    HandDisplay.tsx     ← 4 tiles in a row               │
│    BettingControls.tsx ← the Higher/Lower buttons       │
│    ScoreBar.tsx        ← score, streak, round counter   │
│    HistoryPanel.tsx    ← list of past rounds            │
│    ValueMapDisplay.tsx ← the 7 honor tile bars          │
│    GameOverScreen.tsx  ← end screen with save form      │
│    LeaderboardTable.tsx← top 5 high scores              │
├─────────────────────────────────────────────────────────┤
│  LAYER 3: LOGIC (how the game works)                    │
│  lib/engine/tile-engine.ts  ← pure game math            │
│  lib/stores/useGameStore.ts ← all the game state        │
│  lib/hooks/                 ← reusable React logic      │
│  lib/constants/             ← config values             │
├─────────────────────────────────────────────────────────┤
│  LAYER 4: API (talking to the backend)                  │
│  app/api/scores/route.ts      ← save score proxy        │
│  app/api/leaderboard/route.ts ← leaderboard proxy       │
│  lib/api/game.ts              ← client-side calls       │
│  lib/server/laravel.ts        ← server-side calls       │
└─────────────────────────────────────────────────────────┘
```

---

## 🧠 The Game Brain — tile-engine.ts

This file is the heart of the game. It contains pure math functions — no React, no UI, no side effects.

Think of it like a calculator: you give it numbers, it gives you back numbers.

### What each function does

```
buildFullDeck()
  → Creates all 136 tiles
  → Returns an array of tile objects
  → Each tile has: id, type, suit, rank, unicode symbol, label

shuffle(tiles)
  → Takes an array of tiles
  → Randomly mixes them up (Fisher-Yates algorithm — truly random)
  → Returns a new mixed array
  → Does NOT change the original array

dealHand(pile, count=4)
  → Takes the draw pile
  → Returns the first 4 tiles as "hand"
  → Returns the rest as "remaining"
  → Think: cutting cards off the top of a deck

getInitialValueMap()
  → Returns: { dragon_red: 5, dragon_green: 5, ..., wind_north: 5 }
  → All 7 honor tiles start at 5

calcTileValue(tile, map)
  → Number tile? Return its rank (e.g. 7)
  → Honor tile? Look it up in the map (e.g. dragon_red → 6)

calcHandValue(hand, map)
  → Adds up calcTileValue() for all 4 tiles
  → Returns the total (e.g. 20)

applyValueScaling(map, hand, outcome)
  → For each honor tile in the hand:
     win  → add 1 to its value in the map
     loss → subtract 1 from its value in the map
  → Clamps between 1 and 9
  → Returns a NEW map (doesn't change the old one)

checkGameOver(map, reshuffleCount)
  → reshuffleCount >= 3? → return 'reshuffle_limit'
  → Any value <= 0?      → return 'tile_value_zero'
  → Any value >= 10?     → return 'tile_value_ten'
  → Otherwise            → return null (game continues)
```

**Why keep it separate?**
If the interviewers ask you to add a new feature (like "bonus points for all-same-suit hands"), you add one function here and nothing else in the UI needs to change.

---

## 🏪 The Game Store — useGameStore.ts

This is like the game's "memory". It remembers everything:

```
WHAT IT REMEMBERS:
├── phase            ← "are we dealing, betting, or revealing right now?"
├── currentHand      ← the 4 tiles currently shown
├── currentHandValue ← their total value
├── drawPile         ← tiles left to deal from
├── discardPile      ← tiles already played
├── history          ← list of all past rounds
├── tileValueMap     ← current values for all 7 honor tiles
├── reshuffleCount   ← how many times we reshuffled (max 3)
├── currentRound     ← what round number we're on
├── score            ← player's current score
├── streak           ← how many wins in a row
├── playerName       ← who's playing
└── gameOverReason   ← why the game ended (or null if still going)

WHAT IT CAN DO:
├── startGame()          ← resets everything, deals first hand
├── placeBet(direction)  ← player bets higher/lower, resolves the round
├── advanceToNextBet()   ← called after result animation, next round
└── setPlayerName()      ← saves the player's name
```

**Think of it like a scoreboard in a classroom** — everyone in the room (every component) can look at it and see the current score. When the teacher updates it, everyone sees the new number automatically.

---

## 🔗 How a Bet Actually Works (Inside placeBet)

This is the most complex part. Here's exactly what happens when you click "Higher":

```
Step 1: You click "Higher"
         ↓
Step 2: Phase changes to 'revealing'
        (the animation starts immediately)
         ↓
Step 3: Wait 50ms
        (just enough time for React to paint the animation)
         ↓
Step 4: Check if we need to reshuffle
        drawPile.length < 4?
        YES → build fresh deck + discard pile → shuffle → counter++
        NO  → continue
         ↓
Step 5: Deal 4 new tiles from the top of the draw pile
         ↓
Step 6: Calculate new hand value
        using the current honor tile values (from tileValueMap)
         ↓
Step 7: Was the bet correct?
        You said "Higher" → is new value > old value?
        YES → WIN    NO → LOSS
         ↓
Step 8: Update streak and score
        WIN:  streak = streak + 1
              score  = score + 100 + (streak - 1) × 25
        LOSS: streak = 0
              score  = score + 0
         ↓
Step 9: Update honor tile values
        applyValueScaling(map, newHand, 'win' or 'loss')
        ← any honor tile in the new hand goes ±1
         ↓
Step 10: Check if game is over
         checkGameOver(newMap, reshuffleCount)
         GAME OVER?    → phase = 'game_over', show overlay
         STILL ALIVE?  → phase = 'revealing', show result
         ↓
Step 11: Save this round to history
         (round #, both hands, bet direction, outcome, points earned)
```

---

## 📺 What Each Screen Component Does

### Tile.tsx — One tile on screen

```
┌──────────┐        ┌──────────┐
│  ▓▓▓▓▓▓  │  flip  │          │
│  ▓▓▓▓▓▓  │ ─────► │    🀄    │
│  ▓▓▓▓▓▓  │        │          │
└──────────┘        └──────────┘
  face-down           face-up
  (dealing phase)   (betting phase)
```

Uses a 3D CSS rotation animation (rotateY 180 → 0) to flip from back to front.
Has two sizes: `normal` (big, in the active hand) and `small` (tiny, in history rows).

### HandDisplay.tsx — 4 tiles together

```
        ↓ tiles fall in one by one with 100ms gaps ↓

        🀄    🀅    🀆    🀀
       t=0  t=100 t=200 t=300ms
```

Uses Motion's `staggerChildren` to create the cascade/waterfall effect.

### BettingControls.tsx — The buttons

```
         Current Hand Value
              ┌───┐
              │ 20│  ← big gold number, animates when it changes
              └───┘

  ┌──────────────────┐  ┌──────────────────┐
  │   ↑  HIGHER      │  │   ↓  LOWER       │
  │   gold gradient  │  │   blue gradient  │
  └──────────────────┘  └──────────────────┘
     (only clickable when phase === 'betting')
```

### ScoreBar.tsx — The stats row at the top

```
Score: 1,250    🔥 Streak: 4    Round: 12    Deck: 42    ↺ 1/3
```

- Deck count turns **amber** when < 8 tiles left (warning you're close to reshuffling)
- Reshuffle counter (↺ 1/3) only appears after the first reshuffle

### ValueMapDisplay.tsx — The honor tile bars on the right

```
🀄  ████████░░  8  ●   ← near 10, GOLD warning dot
🀅  █████░░░░░  5
🀆  ███░░░░░░░  3
🀀  ██░░░░░░░░  2  ●   ← near 0, RED warning dot
🀁  █████░░░░░  5
🀂  ██████░░░░  6
🀃  ████░░░░░░  4
```

Bars animate smoothly left/right when values change each round.

### HistoryPanel.tsx — Log of past rounds

```
#12  🀄🀅🀀🀃  = 21   ↑   +125 pts   ← green background (win)
#11  🀆🀂🀁🀄  = 18   ↑    LOSS      ← red background (loss)
#10  🀀🀁🀂🀃  = 19   ↓   +100 pts   ← green background (win)
```

Newest round at the top. Scrollable. The tiny tiles use the `Tile` component at `size="small"`.

---

## 🌐 How the Frontend Talks to the Backend

Here's the full journey when you save your score after a game:

```
[Your Browser]
     │
     │  POST /api/scores
     │  { player_name: "Ahmed", score: 1500, ... }
     ▼
[Next.js Server]   ← app/api/scores/route.ts
     │
     │  Forwards to Laravel
     │  POST http://localhost:8000/api/v1/scores
     ▼
[Laravel]
     │
     ├── routes/api.php
     │     └── ScoreController@store
     │           │
     │           ├── StoreScoreRequest validates the data
     │           │   (is player_name a string? is score a number?)
     │           │   If not valid → returns 422 error automatically
     │           │
     │           ├── ScoreService@store saves to database
     │           │   Score::create($validated)
     │           │
     │           └── ScoreResource shapes the response JSON
     │
     ▼
[SQLite Database]
     scores table:
     id │ player_name │ score │ rounds_played │ game_over_reason │ created_at
      1 │ Ahmed       │  1500 │            15 │ reshuffle_limit  │ 2026-03-08
```

**Why the Next.js middleman?**
The browser never needs to know that Laravel exists. It talks to `/api/scores` on the same website. The Next.js server is the one that knows Laravel's real address (`http://localhost:8000`) — and that address lives in a server-side environment variable, never sent to the browser.

---

## ⚙️ The Custom Hooks — Reusable Logic Pieces

Think of hooks as "helper functions for React components" that can hold state and run timed actions.

### usePhaseAutoAdvance

```
PROBLEM IT SOLVES:
  After dealing animation ends (1500ms) → automatically move to betting phase
  After revealing animation ends (1800ms) → automatically move to next round

BEFORE (messy — two copy-pasted blocks):
  useEffect(() => {
    if (phase === 'dealing') setTimeout(() => advance(), 1500)
  }, [phase])

  useEffect(() => {
    if (phase === 'revealing') setTimeout(() => advance(), 1800)
  }, [phase])

AFTER (clean — one hook call):
  usePhaseAutoAdvance(phase, advanceToNextBet)

  ← one line replaces both useEffects
  ← delays are defined in lib/constants/phases.ts (not hardcoded)
```

### useGameState

```
PROBLEM IT SOLVES:
  The game page needs 12+ pieces of data from the store.

BEFORE (15 separate lines):
  const phase = useGameStore(s => s.phase)
  const currentHand = useGameStore(s => s.currentHand)
  const score = useGameStore(s => s.score)
  ... 12 more lines

AFTER (one line):
  const { phase, currentHand, score, ... } = useGameState()

BONUS — uses useShallow:
  React only re-renders the page when a value ACTUALLY CHANGED.
  Without useShallow, any change to the store (even unrelated)
  would trigger a re-render.
```

### useLeaderboard

```
PROBLEM IT SOLVES:
  LeaderboardTable had data-fetching logic mixed into the component.
  Now the hook handles fetching, the component just displays.

  useLeaderboard() returns { data: entries[], isLoading: boolean }

  - Automatically refreshes every 30 seconds
  - Automatically refreshes after you save a new score
```

---

## 💾 The Backend — Laravel (PHP) Explained Simply

Laravel handles saving and reading scores. Think of it like a filing cabinet:

```
Someone submits a score
          │
          ▼
    routes/api.php
    "POST /scores goes to ScoreController"
          │
          ▼
    StoreScoreRequest
    "Is this data valid?
     - player_name: must be a string, max 255 chars
     - score: must be an integer, 0 or above
     - rounds_played: must be an integer, 0 or above
     - game_over_reason: must be one of the 3 valid strings"
    NOT valid? → error response sent automatically, controller never runs
          │
          ▼
    ScoreController@store
    "OK, data is clean. Service, save this."
          │
          ▼
    ScoreService@store
    Score::create($data)  ← writes one row to the database
          │
          ▼
    ScoreResource
    "Format the saved record as clean JSON before sending back"
          │
          ▼
    JSON response to Next.js → to browser
```

For reading the leaderboard:

```
GET /leaderboard
          │
          ▼
    ScoreService@leaderboard(5)
    Score::orderByDesc('score')->limit(5)->get()
    ← selects the top 5 rows, sorted by score highest first
          │
          ▼
    ScoreResource collection → JSON array of 5 entries
```

---

## 🔧 The Refactoring Story (What I Improved and Why)

If asked "did you refactor anything?" — yes. Here are 6 concrete improvements:

### 1. Removed duplicate timer logic
```
BEFORE: two copy-pasted useEffect blocks in game/page.tsx
AFTER:  one hook → usePhaseAutoAdvance(phase, advance)
WHY:    DRY — Don't Repeat Yourself. One place to change the timing.
```

### 2. Collapsed 15 store subscriptions into one
```
BEFORE: const phase = useGameStore(s => s.phase)
        const hand  = useGameStore(s => s.currentHand)
        const score = useGameStore(s => s.score)
        ... 12 more lines

AFTER:  const { phase, hand, score, ... } = useGameState()
WHY:    Cleaner. useShallow means React does fewer re-renders.
```

### 3. Decoupled BettingControls from the store
```
BEFORE: BettingControls imported useGameStore directly inside itself
AFTER:  BettingControls receives onBet as a prop from the parent page

WHY:    A component that grabs its own data is harder to test and
        harder to reuse. Now it's "dumb" — it shows buttons and
        calls whatever function the parent gives it.
```

### 4. Merged duplicate game-over reason maps
```
BEFORE: GameOverScreen had  { title, icon, color } defined for each reason
        LeaderboardTable had { label } defined for each reason
        → same data written twice in two different files

AFTER:  lib/constants/gameOver.ts has ONE object with ALL properties
        Both components import from the same source

WHY:    Change a label once → it updates everywhere automatically.
```

### 5. Added barrel export (index.ts)
```
BEFORE: import { Tile }            from '@/components/game/Tile'
        import { HandDisplay }     from '@/components/game/HandDisplay'
        import { BettingControls } from '@/components/game/BettingControls'

AFTER:  import { Tile, HandDisplay, BettingControls } from '@/components/game'

WHY:    Cleaner imports. If a file is renamed, only index.ts needs updating,
        not every file that imports it.
```

### 6. Deleted dead code
```
Deleted: components/ui/  (6 shadcn component files — installed but never imported)
Deleted: components/layout/  (empty folder left over from scaffolding)

WHY:    Every unused file misleads the next developer.
        Less code = easier to read = easier to extend.
```

---

## 💬 Word-for-Word Answers to Likely Interview Questions

### "Walk me through what happens when I click Higher"

> "When you click Higher, the store's `placeBet('higher')` function runs. It immediately flips the phase to 'revealing' so the animation starts. After 50 milliseconds — just enough for React to paint the new state — it deals 4 new tiles from the top of the draw pile, calculates their total value using the current honor tile value map, and compares to the previous hand. If the new total is higher, that's a win. The score and streak update, then `applyValueScaling` adjusts the value of any honor tiles that appeared in the new hand. Finally, `checkGameOver` checks if any honor tile hit 0 or 10, or if we've reshuffled 3 times. If game over, the overlay appears. Otherwise, after 1800ms the `usePhaseAutoAdvance` hook calls `advanceToNextBet`, which flips the phase back to 'betting' with the new hand face-up and ready."

### "Why did you use Zustand instead of Redux?"

> "Zustand has almost no boilerplate — you define a store as a plain function, not with actions, reducers, and dispatchers. For a game like this where I need to update many things at once — score, streak, hand, phase, and the value map all change in a single bet — Zustand's direct state setting is much cleaner. I also used `useShallow`, which lets me subscribe to multiple state values at once while only triggering a re-render when something actually changed."

### "What would it take to add bonus points for an all-honor hand?"

> "I'd add one function to `lib/engine/tile-engine.ts` — something like `evaluateHandBonus(hand)` that checks if all 4 tiles are dragons or winds and returns a multiplier. Then inside `placeBet()` in the store, I call that function after calculating the outcome and multiply `pointsEarned` by it. The UI shows the updated score automatically. No component code changes needed — that's the point of keeping the engine pure and separate."

### "Why do you have API routes in Next.js if Laravel already has an API?"

> "The Next.js `app/api/` routes are a BFF — Backend for Frontend. The browser calls `/api/scores` on the same origin as the website. The Next.js server receives that request and forwards it to Laravel at `http://localhost:8000`. The browser never knows Laravel exists. This matters because `LARAVEL_URL` is a server-side environment variable — it must never be sent to the browser bundle. It also means if we move Laravel to a different server, we only update one environment variable and nothing in the frontend code changes."

---

## 🚀 Start Commands (Memorise These)

```bash
# Terminal 1 — Backend
cd Backend
php artisan serve --port=8000

# Terminal 2 — Frontend
cd Frontend
npm run dev
```

Then open: **http://localhost:3000**

---

## ✅ Requirements Checklist

| Requirement from the brief | Where it lives in the code | Done? |
|---|---|---|
| Landing page with New Game entry | `app/page.tsx` | ✅ |
| Leaderboard — top 5 high scores | `LeaderboardTable.tsx` + `ScoreService@leaderboard(5)` | ✅ |
| Mahjong tiles (Dragons, Winds, Numbers) | `TILE_DEFS` in `tile-engine.ts` | ✅ |
| Number tiles = face value | `calcTileValue()` | ✅ |
| Non-number tiles start at value 5 | `getInitialValueMap()` | ✅ |
| Dynamic value scaling ±1 per round | `applyValueScaling()` | ✅ |
| Draw pile count displayed | `ScoreBar` `drawPileCount` prop | ✅ |
| Discard pile count displayed | tracked in store, shown in ScoreBar | ✅ |
| Reshuffle when draw pile empty | inside `placeBet()` in store | ✅ |
| Game over when tile value hits 0 or 10 | `checkGameOver()` | ✅ |
| Game over after 3 reshuffles | `checkGameOver()` | ✅ |
| Button to exit back to landing | ArrowLeft button → `router.push('/')` | ✅ |
| Bet Higher / Bet Lower actions | `BettingControls.tsx` | ✅ |
| Current hand value displayed | `BettingControls` `handValue` prop | ✅ |
| Visual tile representation | `Tile.tsx` with real Unicode Mahjong chars | ✅ |
| History view of previous hand | `HistoryPanel.tsx` | ✅ |
| End-of-game score screen | `GameOverScreen.tsx` | ✅ |
| Score persisted to leaderboard | TanStack mutation → BFF → Laravel → SQLite | ✅ |
| README with setup instructions | `README.md` | ✅ |
| AI utilisation disclosed in README | AI Utilisation section in `README.md` | ✅ |
