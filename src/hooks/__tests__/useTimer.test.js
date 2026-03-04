import { renderHook, act } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { useTimer } from '../useTimer';
import { timeConstants } from '../../constants/gameConstants';

describe('useTimer', () => {
  let appStateChangeHandler;
  let removeListener;

  beforeEach(() => {
    jest.useFakeTimers();
    removeListener = jest.fn();
    appStateChangeHandler = null;

    jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, handler) => {
      appStateChangeHandler = handler;
      return { remove: removeListener };
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('calls onTick every second while active and in progress', () => {
    const onTick = jest.fn();
    const onTimeout = jest.fn();

    renderHook(({ gameInProgress, currentGameTime }) =>
      useTimer(gameInProgress, currentGameTime, onTick, onTimeout),
      {
        initialProps: { gameInProgress: true, currentGameTime: 0 },
      }
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(onTick).toHaveBeenCalledTimes(1);
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it('calls onTimeout at max allowed time', () => {
    const onTick = jest.fn();
    const onTimeout = jest.fn();

    const { rerender } = renderHook(({ gameInProgress, currentGameTime }) =>
      useTimer(gameInProgress, currentGameTime, onTick, onTimeout),
      {
        initialProps: { gameInProgress: true, currentGameTime: 0 },
      }
    );

    rerender({ gameInProgress: true, currentGameTime: timeConstants.MAX_ALLOWED_TIME });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it('pauses when app state is not active', () => {
    const onTick = jest.fn();
    const onTimeout = jest.fn();

    renderHook(() => useTimer(true, 0, onTick, onTimeout));

    act(() => {
      appStateChangeHandler('background');
      jest.advanceTimersByTime(2000);
    });

    expect(onTick).not.toHaveBeenCalled();
  });
});
