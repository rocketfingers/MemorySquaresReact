# TODO Plan — MemorySquares React Native

## Context

- Port remaining functionality from [`MemorySquares` (Vue/Quasar)](../MemorySquares) to [`MemorySquaresReact`](.).
- Supabase schema work is explicitly deferred to a later phase.

## Completed

- [x] Audit parity between [`../MemorySquares`](../MemorySquares) and [`.`](.)
- [x] Extract Supabase schema requirements from the source app
- [x] Configure Supabase MCP client in [`opencode.json`](opencode.json)

## Next Actions (Implementation Phase)

### 1) Define migration order for app functionality (without Supabase)

- [ ] Prioritize modules by impact/risk:
  1. auth/account actions
  2. history UX parity
  3. gameplay behavior parity
  4. visual/animation parity
- [ ] Create module-by-module acceptance checklist before coding

### 2) Port account management parity

- [x] Add delete-account flow in [`src/hooks/useAuth.js`](src/hooks/useAuth.js)
- [x] Surface delete-account action in [`src/screens/HomeScreen.js`](src/screens/HomeScreen.js)
- [x] Ensure state/session cleanup and user feedback paths
- [ ] Add guest login prompt + dismiss persistence parity from [`../MemorySquares/src/layouts/MainLayout.vue`](../MemorySquares/src/layouts/MainLayout.vue) into [`src/screens/HomeScreen.js`](src/screens/HomeScreen.js) and [`src/stores/settingsStore.js`](src/stores/settingsStore.js)
- [ ] Align authenticated account controls with source UX (identity display and gameplay-time action guards)

### 3) Port history UX parity

- [x] Align clear-history/reset behaviors in [`src/screens/HistoryScreen.js`](src/screens/HistoryScreen.js)
- [ ] Verify pagination/empty-state behavior parity
- [x] Ensure history reflects immediately across screens

### 4) Port gameplay interaction parity

- [x] Reconcile board preview/transition behavior from [`../MemorySquares/src/pages/GamePage.vue`](../MemorySquares/src/pages/GamePage.vue) into [`src/screens/GameScreen.js`](src/screens/GameScreen.js)
- [ ] Verify round flow, timers, click rules, and dialog triggers
- [ ] Add explicit in-game "return to menu" confirmation that records a loss (parity with [`../MemorySquares/src/layouts/MainLayout.vue`](../MemorySquares/src/layouts/MainLayout.vue) home action)
- [ ] Restore `anyGameEverStarted` parity in [`src/stores/gameStatusStore.js`](src/stores/gameStatusStore.js) and consumers

### 5) Port visual/animation details

- [x] Align stats/result panel behavior in [`src/components/ResultsBox.js`](src/components/ResultsBox.js) and [`src/components/StatusBox.js`](src/components/StatusBox.js)
- [ ] Align win/loss dialogs in [`src/components/GameWonDialog.js`](src/components/GameWonDialog.js) and [`src/components/GameLostDialog.js`](src/components/GameLostDialog.js)
- [ ] Reintroduce theme-toggle UX parity from [`../MemorySquares/src/layouts/MainLayout.vue`](../MemorySquares/src/layouts/MainLayout.vue) in React navigation/home flow

### 6) Validate and stabilize

- [ ] Run focused regression checks:
  - guest flow
  - authenticated flow
  - clear history
  - round progression
  - win/loss dialogs
- [ ] Fix discovered regressions

### 7) CI/CD parity with first project

- [ ] Create GitHub workflow in [`/.github/workflows`](.github/workflows) matching the first project setup in [`../MemorySquares/.github/workflows`](../MemorySquares/.github/workflows)
- [ ] Adjust workflow commands for this Expo/React Native project (pnpm scripts, lint/test/build as applicable)
- [ ] Validate workflow file syntax and trigger conditions

## Deferred (Supabase Phase)

- [ ] Add `public.delete_user` RPC (or equivalent secure backend path) used by delete-account flow
- [ ] Apply schema + RLS via MCP/CLI once connection details are provided
- [ ] Add migration files to repo and document rollout/rollback
