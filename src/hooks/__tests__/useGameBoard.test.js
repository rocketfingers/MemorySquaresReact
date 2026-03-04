import { renderHook, act } from '@testing-library/react-native';
import { useGameBoard } from '../useGameBoard';

describe('useGameBoard', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns initial state', () => {
    const { result } = renderHook(() => useGameBoard());

    expect(result.current.columns).toBe(3);
    expect(result.current.rectangles).toEqual([]);
    expect(result.current.itemsNotClickable).toBe(true);
    expect(result.current.countOfSquares).toBe(9);
  });

  it('resets board and ensures at least 2 valid and 2 invalid squares', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.99);
    const { result } = renderHook(() => useGameBoard());

    act(() => {
      result.current.resetBoard(1);
    });

    expect(result.current.rectangles).toHaveLength(9);
    expect(result.current.countOfValid).toBeGreaterThanOrEqual(2);
    expect(result.current.countOfValid).toBeLessThanOrEqual(7);
    expect(result.current.itemsNotClickable).toBe(true);
  });

  it('returns loss when clicking known invalid square', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const { result } = renderHook(() => useGameBoard());

    act(() => {
      result.current.resetBoard(1);
      result.current.boardResultsShowOrHide(false);
    });

    act(() => {
      result.current.handleItemClick(0);
    });

    expect(result.current.isGameLost).toBe(true);
  });

  it('returns win after clicking all known valid squares', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.99);
    const { result } = renderHook(() => useGameBoard());

    act(() => {
      result.current.resetBoard(1);
      result.current.boardResultsShowOrHide(false);
    });

    const validIds = result.current.rectangles.filter((r) => r.isValid).map((r) => r.id);
    validIds.forEach((id) => {
      act(() => {
        result.current.handleItemClick(id);
      });
    });

    expect(result.current.isGameWon).toBe(true);
  });
});
