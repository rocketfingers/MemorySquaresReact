# MemorySquares React Native

## Project Overview

A memory and reflex-testing game built with React Native and Expo. Players memorize highlighted squares on a grid during a preview phase, then tap the correct squares from memory within a time limit before advancing to the next level.

This is a port of the original Vue 3 / Quasar web app.

## Tech Stack

- **Framework:** React Native with Expo (managed workflow)
- **Navigation:** React Navigation (Stack navigator)
- **State Management:** Zustand with AsyncStorage persistence
- **Backend/Auth:** Supabase (email/password auth + Postgres for game history)
- **Local Storage:** AsyncStorage (fallback for unauthenticated users)

## Project Structure

```
src/
  screens/          # Full-screen components (Home, Game)
  components/       # Reusable UI components
  hooks/            # Custom React hooks (game board, timer, history)
  stores/           # Zustand stores (game status, settings)
  constants/        # Game constants, level configuration, result enums
  lib/              # External service clients (Supabase)
  theme/            # Colors, typography, theme context
```

## Key Game Constants

- `MAX_ALLOWED_TIME`: 15 seconds per round
- `PREVIEW_DURATION`: 3000ms memorization phase
- 124 levels total (3x3 grid up to 6x6 grid)

## Commit Convention

Follows [Semantic Commit Messages](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716):

```
<type>(<scope>): <subject>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## Supabase Setup

- Create a `games_history` table with columns:
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `round` (int)
  - `time` (int)
  - `total_game_time` (int)
  - `result` (int) — 0 = lose, 1 = win
  - `created_at` (timestamptz, default now())
- Enable Row Level Security and add a policy so users can only read/write their own rows.

## Development

```bash
pnpm start            # Start Expo dev server
pnpm ios              # iOS simulator
pnpm android          # Android emulator
pnpm web              # Web browser
```

> Package manager: **pnpm**. Do not use npm or yarn — `package-lock.json` is gitignored.
