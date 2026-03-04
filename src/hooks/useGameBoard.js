import { useState, useCallback, useMemo } from 'react';
import { levelsConfiguration } from '../constants/levelsConfiguration';

/**
 * Game board hook - manages the game grid, squares, and click interactions.
 */
export function useGameBoard() {
  const [columns, setColumns] = useState(3);
  const [rectangles, setRectangles] = useState([]);
  const [itemsNotClickable, setItemsNotClickable] = useState(true);

  const countOfSquares = useMemo(() => columns * columns, [columns]);

  const countOfValid = useMemo(
    () => rectangles.filter((p) => p.isValid).length,
    [rectangles]
  );

  const countOfValidClicked = useMemo(
    () => rectangles.filter((p) => p.isClicked && p.isValid).length,
    [rectangles]
  );

  const isGameWon = useMemo(
    () => rectangles.length > 0 && rectangles.filter((p) => !p.isClicked && p.isValid).length === 0,
    [rectangles]
  );

  const isGameLost = useMemo(
    () => rectangles.some((p) => p.isClicked && !p.isValid),
    [rectangles]
  );

  const calculateColumns = useCallback((round) => {
    const config = levelsConfiguration[round - 1];
    return config ? config.columns : 6;
  }, []);

  const shouldRotate = useCallback((round) => {
    const config = levelsConfiguration[round - 1];
    return config ? config.rotate : false;
  }, []);

  const assignRectangles = useCallback((currentColumns, round) => {
    const total = currentColumns * currentColumns;
    const lvlAdjustment = round % 3 === 0 ? 3 : round % 3;

    let rects = Array.from({ length: total }, (_, i) => ({
      id: i,
      isValid: Math.random() < 0.15 + 0.15 * lvlAdjustment,
      isClicked: false,
    }));

    // Ensure minimum 2 valid
    let validCount = rects.filter((p) => p.isValid).length;
    while (validCount < 2) {
      const nonValid = rects.filter((p) => !p.isValid);
      const idx = Math.floor(Math.random() * nonValid.length);
      nonValid[idx].isValid = true;
      validCount++;
    }

    // Ensure minimum 2 invalid
    while (validCount > total - 2) {
      const valid = rects.filter((p) => p.isValid);
      const idx = Math.floor(Math.random() * valid.length);
      valid[idx].isValid = false;
      validCount--;
    }

    return rects;
  }, []);

  const resetBoard = useCallback((round) => {
    const cols = calculateColumns(round);
    setColumns(cols);
    const rects = assignRectangles(cols, round);
    setRectangles(rects);
    setItemsNotClickable(true);
  }, [calculateColumns, assignRectangles]);

  /**
   * Shows all squares (preview mode) or hides them (play mode).
   * @param {boolean} shown - true = preview, false = play
   * @param {Function} onPlayStart - called when transitioning to play mode
   */
  const boardResultsShowOrHide = useCallback((shown, onPlayStart) => {
    setRectangles((prev) =>
      prev.map((sq) => ({ ...sq, isClicked: shown }))
    );
    if (!shown) {
      setItemsNotClickable(false);
      if (onPlayStart) onPlayStart();
    }
  }, []);

  /**
   * Handles a square tap.
   * @returns {{ won: boolean, lost: boolean } | null}
   */
  const handleItemClick = useCallback((id) => {
    if (itemsNotClickable) return null;

    let result = null;

    setRectangles((prev) => {
      const next = prev.map((sq) =>
        sq.id === id ? { ...sq, isClicked: true } : sq
      );

      const lost = next.some((p) => p.isClicked && !p.isValid);
      const won = !lost && next.filter((p) => !p.isClicked && p.isValid).length === 0;

      if (lost) result = { won: false, lost: true };
      else if (won) result = { won: true, lost: false };

      return next;
    });

    return result;
  }, [itemsNotClickable]);

  const disableClicking = useCallback(() => setItemsNotClickable(true), []);
  const enableClicking = useCallback(() => setItemsNotClickable(false), []);

  const swapRandomSquares = useCallback((swapCount = 1) => {
    setRectangles((prev) => {
      if (prev.length < 2 || swapCount <= 0) return prev;

      const next = [...prev];

      for (let i = 0; i < swapCount; i++) {
        const first = Math.floor(Math.random() * next.length);
        let second = Math.floor(Math.random() * next.length);

        while (second === first) {
          second = Math.floor(Math.random() * next.length);
        }

        const temp = next[first];
        next[first] = next[second];
        next[second] = temp;
      }

      return next;
    });
  }, []);

  return {
    columns,
    rectangles,
    itemsNotClickable,
    countOfSquares,
    countOfValid,
    countOfValidClicked,
    isGameWon,
    isGameLost,
    calculateColumns,
    shouldRotate,
    resetBoard,
    boardResultsShowOrHide,
    handleItemClick,
    disableClicking,
    enableClicking,
    swapRandomSquares,
  };
}
