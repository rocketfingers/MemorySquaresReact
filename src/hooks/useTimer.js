import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { timeConstants } from '../constants/gameConstants';

/**
 * Game timer hook — runs a 1-second interval during active gameplay.
 *
 * Mirrors the original timerComposable behaviour:
 * - Pauses when the app goes to the background (AppState !== 'active')
 * - Stops automatically when MAX_ALLOWED_TIME is reached
 * - Calls onTick every second when conditions are met
 * - Calls onTimeout when the time limit is exceeded
 *
 * @param {boolean} gameInProgress
 * @param {number}  currentGameTime
 * @param {Function} onTick - called each second to increment time
 * @param {Function} onTimeout - called when time exceeds MAX_ALLOWED_TIME
 */
export function useTimer(gameInProgress, currentGameTime, onTick, onTimeout) {
  const appStateRef = useRef(AppState.currentState);
  const isActiveRef = useRef(true);
  const gameInProgressRef = useRef(gameInProgress);
  const currentGameTimeRef = useRef(currentGameTime);
  const onTickRef = useRef(onTick);
  const onTimeoutRef = useRef(onTimeout);

  // Keep refs in sync so the interval closure always sees fresh values
  useEffect(() => { gameInProgressRef.current = gameInProgress; }, [gameInProgress]);
  useEffect(() => { currentGameTimeRef.current = currentGameTime; }, [currentGameTime]);
  useEffect(() => { onTickRef.current = onTick; }, [onTick]);
  useEffect(() => { onTimeoutRef.current = onTimeout; }, [onTimeout]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      isActiveRef.current = nextState === 'active';
      appStateRef.current = nextState;
    });

    const interval = setInterval(() => {
      if (
        isActiveRef.current &&
        gameInProgressRef.current &&
        currentGameTimeRef.current <= timeConstants.MAX_ALLOWED_TIME
      ) {
        if (currentGameTimeRef.current >= timeConstants.MAX_ALLOWED_TIME) {
          onTimeoutRef.current?.();
        } else {
          onTickRef.current?.();
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, []); // only runs once — intentional, refs handle fresh values
}
