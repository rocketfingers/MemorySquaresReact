import { useGameStatusStore } from '../gameStatusStore';

describe('gameStatusStore', () => {
  beforeEach(() => {
    useGameStatusStore.getState().resetGame();
  });

  it('starts with expected defaults', () => {
    const state = useGameStatusStore.getState();
    expect(state.currentRound).toBe(1);
    expect(state.anyGameEverStarted).toBe(false);
    expect(state.gameInProgress).toBe(false);
    expect(state.isBoardShown).toBe(false);
  });

  it('updates values through setters and resets all', () => {
    const state = useGameStatusStore.getState();

    state.setCurrentRound(7);
    state.setAnyGameEverStarted(true);
    state.setGameInProgress(true);
    state.setIsBoardShown(true);
    state.setCurrentGameTime(9);
    state.setTotalGameTime(20);

    expect(useGameStatusStore.getState().currentRound).toBe(7);
    expect(useGameStatusStore.getState().anyGameEverStarted).toBe(true);

    useGameStatusStore.getState().resetGame();

    const reset = useGameStatusStore.getState();
    expect(reset.currentRound).toBe(1);
    expect(reset.anyGameEverStarted).toBe(false);
    expect(reset.currentGameTime).toBe(0);
    expect(reset.totalGameTime).toBe(0);
  });
});
