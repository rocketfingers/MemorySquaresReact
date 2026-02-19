import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useGameBoard } from '../hooks/useGameBoard';
import { useTimer } from '../hooks/useTimer';
import { useAuth } from '../hooks/useAuth';
import { useHistory } from '../hooks/useHistory';
import { useGameStatusStore } from '../stores/gameStatusStore';
import { timeConstants, typeOfLost } from '../constants/gameConstants';
import { gameResults } from '../constants/gameResult';
import StatusBox from '../components/StatusBox';
import ResultsBox from '../components/ResultsBox';
import GameWonDialog from '../components/GameWonDialog';
import GameLostDialog from '../components/GameLostDialog';

// Margin between squares, keyed by column count
const SQUARE_MARGIN = { 3: 8, 4: 7, 5: 5, 6: 4 };
// Max board size in logical pixels
const MAX_BOARD_SIZE = 480;

export default function GameScreen({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { history, addGameToHistory } = useHistory(user);
  const { width, height } = useWindowDimensions();
  const BOARD_SIZE = Math.min(Math.min(width, height) * 0.85, MAX_BOARD_SIZE);

  const currentRound = useGameStatusStore((s) => s.currentRound);
  const setCurrentRound = useGameStatusStore((s) => s.setCurrentRound);
  const gameInProgress = useGameStatusStore((s) => s.gameInProgress);
  const setGameInProgress = useGameStatusStore((s) => s.setGameInProgress);
  const isBoardShown = useGameStatusStore((s) => s.isBoardShown);
  const setIsBoardShown = useGameStatusStore((s) => s.setIsBoardShown);
  const currentGameTime = useGameStatusStore((s) => s.currentGameTime);
  const setCurrentGameTime = useGameStatusStore((s) => s.setCurrentGameTime);
  const totalGameTime = useGameStatusStore((s) => s.totalGameTime);
  const setTotalGameTime = useGameStatusStore((s) => s.setTotalGameTime);
  const anyGameEverStarted = useGameStatusStore((s) => s.gameInProgress || s.currentRound > 1);

  const {
    columns,
    rectangles,
    itemsNotClickable,
    countOfValid,
    countOfValidClicked,
    shouldRotate,
    resetBoard,
    boardResultsShowOrHide,
    handleItemClick,
  } = useGameBoard();

  const [lostDialog, setLostDialog] = useState(false);
  const [wonDialog, setWonDialog] = useState(false);
  const [typeLost, setTypeLost] = useState(null);
  const [isBoardRotated, setIsBoardRotated] = useState(false);

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const previewTimerRef = useRef(null);

  // Animate board rotation
  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isBoardRotated ? 1 : 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [isBoardRotated]);

  const boardRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  // Increment game time each second
  const handleTick = useCallback(() => {
    setCurrentGameTime(currentGameTime + 1);
    setTotalGameTime(totalGameTime + 1);
  }, [currentGameTime, totalGameTime]);

  // Timeout handler
  const handleTimeout = useCallback(async () => {
    if (!isBoardShown || !gameInProgress) return;
    setGameInProgress(false);
    await addGameToHistory(currentRound, currentGameTime, totalGameTime, gameResults.LOSE);
    setTypeLost(typeOfLost.TIME_OUT);
    setLostDialog(true);
  }, [isBoardShown, gameInProgress, currentRound, currentGameTime, totalGameTime]);

  useTimer(gameInProgress, currentGameTime, handleTick, handleTimeout);

  const startGame = useCallback(() => {
    setTypeLost(null);
    setIsBoardRotated(false);
    setIsBoardShown(true);
    setCurrentGameTime(0);
    resetBoard(currentRound);

    // Show preview then hide after PREVIEW_DURATION
    boardResultsShowOrHide(true, null);

    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    previewTimerRef.current = setTimeout(() => {
      // onPlayStart: mark game as in-progress
      boardResultsShowOrHide(false, () => {
        setGameInProgress(true);
      });
      // Apply rotation if this level needs it
      if (shouldRotate(currentRound)) {
        setIsBoardRotated(true);
      }
    }, timeConstants.PREVIEW_DURATION);
  }, [currentRound, resetBoard, boardResultsShowOrHide, shouldRotate]);

  // Start game on mount
  useEffect(() => {
    startGame();
    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, []);

  const handleSquareTap = useCallback(async (id) => {
    const result = handleItemClick(id);
    if (!result) return;

    setGameInProgress(false);

    if (result.lost) {
      await addGameToHistory(currentRound, currentGameTime, totalGameTime, gameResults.LOSE);
      setTypeLost(typeOfLost.WRONG_CLICKED);
      setLostDialog(true);
    } else if (result.won) {
      await addGameToHistory(currentRound, currentGameTime, totalGameTime, gameResults.WIN);
      setWonDialog(true);
    }
  }, [handleItemClick, currentRound, currentGameTime, totalGameTime, addGameToHistory]);

  const handleNextLevel = () => {
    setWonDialog(false);
    const nextRound = currentRound + 1;
    setCurrentRound(nextRound);
    setTimeout(() => startGame(), 50);
  };

  const handleRestart = () => {
    setWonDialog(false);
    setLostDialog(false);
    setTimeout(() => startGame(), 50);
  };

  const handleGoToMenu = () => {
    setWonDialog(false);
    setLostDialog(false);
    setIsBoardShown(false);
    navigation.navigate('Home');
  };

  // Compute square size from board size, column count, and margins
  const margin = SQUARE_MARGIN[columns] ?? 4;
  const squareSize = (BOARD_SIZE - margin * 2 * columns) / columns;

  const getSquareColor = (item) => {
    if (item.isClicked && item.isValid) return colors.squareCorrect;
    if (item.isClicked && !item.isValid) return colors.squareWrong;
    return colors.squareDefault;
  };

  // Phone: stack vertically (ResultsBox above board, StatusBox below)
  // Tablet/desktop: ResultsBox left, board centre, StatusBox right
  const isWide = width >= 700;

  const board = (
    <Animated.View
      style={[
        styles.board,
        {
          width: BOARD_SIZE,
          height: BOARD_SIZE,
          backgroundColor: colors.boardBackground,
          transform: [{ rotate: boardRotation }],
        },
      ]}
    >
      {rectangles.map((item) => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={itemsNotClickable ? 1 : 0.7}
          onPress={() => handleSquareTap(item.id)}
          style={[
            styles.square,
            {
              width: squareSize,
              height: squareSize,
              margin,
              backgroundColor: getSquareColor(item),
            },
          ]}
        />
      ))}
    </Animated.View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.gradientStart }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {isWide ? (
            /* Tablet/desktop: ResultsBox | board | StatusBox */
            <View style={styles.wideRow}>
              <View style={styles.sidePanel}>
                <ResultsBox history={history} visible={anyGameEverStarted} />
              </View>
              {board}
              <View style={styles.sidePanel}>
                <StatusBox
                  round={currentRound}
                  currentTime={currentGameTime}
                  totalTime={totalGameTime}
                  solved={countOfValidClicked}
                  total={countOfValid}
                  visible={anyGameEverStarted}
                  vertical
                />
              </View>
            </View>
          ) : (
            /* Phone: ResultsBox (horizontal) / board / StatusBox (vertical) */
            <View style={styles.narrowCol}>
              <ResultsBox history={history} visible={anyGameEverStarted} horizontal />
              <View style={styles.boardCentered}>{board}</View>
              <StatusBox
                round={currentRound}
                currentTime={currentGameTime}
                totalTime={totalGameTime}
                solved={countOfValidClicked}
                total={countOfValid}
                visible={anyGameEverStarted}
                vertical
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <GameLostDialog
        visible={lostDialog}
        reason={typeLost}
        onRestart={handleRestart}
        onGoToMenu={handleGoToMenu}
      />
      <GameWonDialog
        visible={wonDialog}
        columns={columns}
        onNextLevel={handleNextLevel}
        onRestart={handleRestart}
        onGoToMenu={handleGoToMenu}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  // Tablet/desktop layout: side by side
  wideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    width: '100%',
  },
  sidePanel: {
    flex: 1,
    maxWidth: 260,
  },
  // Phone layout: stacked vertically
  narrowCol: {
    alignItems: 'stretch',
    gap: 16,
    width: '100%',
  },
  boardCentered: {
    alignItems: 'center',
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  square: {
    borderRadius: 4,
  },
});
