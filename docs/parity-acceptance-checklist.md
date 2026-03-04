# Parity Acceptance Checklist

## Migration order (impact/risk)

1. **Auth/account actions**
2. **History UX parity**
3. **Gameplay behavior parity**
4. **Visual/animation parity**

## Module acceptance criteria

### 1) Auth/account actions

- Guest can open sign-in modal from home and dismiss login prompt permanently.
- Authenticated user can sign out with confirmation and cleanup.
- Authenticated user can delete account with confirmation via `public.delete_user` RPC.
- Account actions are blocked during active board gameplay.

### 2) History UX parity

- Guest history is persisted locally and cloud history is used for authenticated users.
- History list shows empty state, paginates at 7 rows per page, and formats timestamps.
- Clear history resets local game state and removes guest/cloud records.
- History updates are reflected on other screens without app restart.

### 3) Gameplay behavior parity

- Round preview starts with blocked clicks and transitions to playable state after preview delay.
- Timer stops/pauses correctly and timeout loss triggers at max allowed round time.
- Wrong click triggers loss; completing all valid squares triggers win.
- In-game return-to-menu confirms and records a loss when abandoning active board state.
- `anyGameEverStarted` remains true once gameplay starts (until explicit reset).

### 4) Visual/animation parity

- Home/game/history visual hierarchy and panel behavior match source intent.
- Win/loss dialogs show correct reason text and action buttons.
- Theme toggle is available in home flow and persists.

## Regression gate

- Guest flow pass
- Authenticated flow pass
- Clear history pass
- Round progression pass
- Win/loss dialogs pass
