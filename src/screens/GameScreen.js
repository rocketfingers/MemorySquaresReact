import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  useWindowDimensions,
  Alert,
  BackHandler,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../theme/ThemeContext";
import { useGameBoard } from "../hooks/useGameBoard";
import { useTimer } from "../hooks/useTimer";
import { useAuth } from "../hooks/useAuth";
import { useHistory } from "../hooks/useHistory";
import { useGameStatusStore } from "../stores/gameStatusStore";
import { timeConstants, typeOfLost } from "../constants/gameConstants";
import { gameResults } from "../constants/gameResult";
import { levelsConfiguration } from "../constants/levelsConfiguration";
import StatusBox from "../components/StatusBox";
import ResultsBox from "../components/ResultsBox";
import GameWonDialog from "../components/GameWonDialog";
import GameLostDialog from "../components/GameLostDialog";

// Margin between squares, keyed by column count
const SQUARE_MARGIN = { 3: 10, 4: 8, 5: 6, 6: 5 };
// Max board size in logical pixels
const MAX_BOARD_SIZE = 480;
const BOARD_BORDER_WIDTH = 4;
const BOARD_PADDING = 8;
const SWAP_ANIMATION_DURATION = 1000;

const getColumnsForRound = (round) => levelsConfiguration[round - 1]?.columns ?? 6;

const shouldSwapOnRound = (round) => {
  if (round < 6) return false;

  const cols = getColumnsForRound(round);
  if (cols <= 4) return round % 6 === 0;
  if (cols === 5) return round % 4 === 0;
  return round % 3 === 0;
};

const getSwapCountForRound = (round) => {
  const cols = getColumnsForRound(round);
  if (cols >= 6) return 3;
  if (cols === 5) return 2;
  return 1;
};

const AnimatedSquare = React.memo(function AnimatedSquare({
  item,
  squareSize,
  margin,
  colors,
  itemsNotClickable,
  onPress,
}) {
  const colorAnim = useRef(new Animated.Value(item.isClicked ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const prevClickedRef = useRef(item.isClicked);

  useEffect(() => {
    Animated.timing(colorAnim, {
      toValue: item.isClicked ? 1 : 0,
      duration: item.isClicked ? 300 : 450,
      useNativeDriver: false,
    }).start();
  }, [item.isClicked, colorAnim]);

  useEffect(() => {
    const becameClicked = !prevClickedRef.current && item.isClicked;

    // Only pop on real player taps (not preview show/hide transitions)
    if (becameClicked && !itemsNotClickable) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.15,
          useNativeDriver: true,
          tension: 100,
          friction: 3,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 5,
        }),
      ]).start();
    } else if (!item.isClicked) {
      scaleAnim.setValue(1);
    }

    prevClickedRef.current = item.isClicked;
  }, [item.isClicked, itemsNotClickable, scaleAnim]);

  // Glow effect for valid squares during preview
  useEffect(() => {
    if (item.isValid && !itemsNotClickable) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
  }, [item.isValid, itemsNotClickable]);

  const activeColor = item.isValid ? colors.squareCorrect : colors.squareWrong;
  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.squareDefault, activeColor],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  return (
    <TouchableOpacity
      activeOpacity={itemsNotClickable ? 1 : 0.85}
      onPress={onPress}
      style={{ width: squareSize, height: squareSize, margin }}
    >
      <Animated.View
        style={[
          styles.square,
          {
            backgroundColor,
            transform: [{ scale: scaleAnim }],
            shadowColor: item.isClicked
              ? item.isValid
                ? "#60a5fa"
                : "#f87171"
              : "#34d399",
            shadowOpacity: item.isClicked ? 0.5 : 0.3,
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 8,
            elevation: item.isClicked ? 8 : 4,
          },
        ]}
      >
        {/* Glow overlay for valid squares */}
        {item.isValid && !itemsNotClickable && (
          <Animated.View
            style={[
              styles.glowOverlay,
              {
                opacity: glowOpacity,
                backgroundColor: colors.squareGlow || "rgba(99, 102, 241, 0.4)",
              },
            ]}
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
});

export default function GameScreen({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { history, addGameToHistory, refreshHistory } = useHistory(user);
  const { width, height } = useWindowDimensions();
  const BOARD_SIZE = Math.min(Math.min(width, height) * 0.85, MAX_BOARD_SIZE);

  const currentRound = useGameStatusStore((s) => s.currentRound);
  const setCurrentRound = useGameStatusStore((s) => s.setCurrentRound);
  const anyGameEverStarted = useGameStatusStore((s) => s.anyGameEverStarted);
  const setAnyGameEverStarted = useGameStatusStore(
    (s) => s.setAnyGameEverStarted,
  );
  const gameInProgress = useGameStatusStore((s) => s.gameInProgress);
  const setGameInProgress = useGameStatusStore((s) => s.setGameInProgress);
  const isBoardShown = useGameStatusStore((s) => s.isBoardShown);
  const setIsBoardShown = useGameStatusStore((s) => s.setIsBoardShown);
  const currentGameTime = useGameStatusStore((s) => s.currentGameTime);
  const setCurrentGameTime = useGameStatusStore((s) => s.setCurrentGameTime);
  const totalGameTime = useGameStatusStore((s) => s.totalGameTime);
  const setTotalGameTime = useGameStatusStore((s) => s.setTotalGameTime);
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
    disableClicking,
    enableClicking,
    swapRandomSquares,
  } = useGameBoard();

  const [lostDialog, setLostDialog] = useState(false);
  const [wonDialog, setWonDialog] = useState(false);
  const [typeLost, setTypeLost] = useState(null);
  const [isBoardRotated, setIsBoardRotated] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapCountLabel, setSwapCountLabel] = useState(0);

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const previewTimerRef = useRef(null);
  const swapTimerRef = useRef(null);
  const boardScaleAnim = useRef(new Animated.Value(0.9)).current;
  const boardOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // Animate board entrance
  useEffect(() => {
    Animated.parallel([
      Animated.spring(boardScaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
      Animated.timing(boardOpacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
    outputRange: ["0deg", "90deg"],
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
    await addGameToHistory(
      currentRound,
      currentGameTime,
      totalGameTime,
      gameResults.LOSE,
    );
    setTypeLost(typeOfLost.TIME_OUT);
    setLostDialog(true);
  }, [
    isBoardShown,
    gameInProgress,
    currentRound,
    currentGameTime,
    totalGameTime,
  ]);

  useTimer(gameInProgress, currentGameTime, handleTick, handleTimeout);

  useEffect(() => {
    if (
      currentGameTime === timeConstants.MAX_ALLOWED_TIME &&
      isBoardShown &&
      gameInProgress
    ) {
      handleTimeout();
    }
  }, [currentGameTime, gameInProgress, handleTimeout, isBoardShown]);

  const startGame = useCallback(() => {
    const startPlayPhase = () => {
      setAnyGameEverStarted(true);
      setGameInProgress(true);
      enableClicking();
    };

    setTypeLost(null);
    setIsBoardRotated(false);
    setIsSwapping(false);
    setSwapCountLabel(0);
    setIsBoardShown(true);
    setGameInProgress(false);
    setCurrentGameTime(0);
    resetBoard(currentRound);
    disableClicking();

    // Show preview then hide after PREVIEW_DURATION
    boardResultsShowOrHide(true, null);

    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    if (swapTimerRef.current) clearTimeout(swapTimerRef.current);

    previewTimerRef.current = setTimeout(() => {
      boardResultsShowOrHide(false, null);
      disableClicking();

      if (shouldSwapOnRound(currentRound)) {
        const swapCount = getSwapCountForRound(currentRound);
        setIsSwapping(true);
        setSwapCountLabel(swapCount);
        LayoutAnimation.configureNext({
          duration: SWAP_ANIMATION_DURATION,
          create: {
            type: LayoutAnimation.Types.easeInEaseOut,
            property: LayoutAnimation.Properties.opacity,
          },
          update: {
            type: LayoutAnimation.Types.easeInEaseOut,
          },
          delete: {
            type: LayoutAnimation.Types.easeInEaseOut,
            property: LayoutAnimation.Properties.opacity,
          },
        });

        swapRandomSquares(swapCount);
        swapTimerRef.current = setTimeout(() => {
          setIsSwapping(false);
          setSwapCountLabel(0);
          startPlayPhase();
        }, SWAP_ANIMATION_DURATION);
      } else {
        startPlayPhase();
      }

      // Apply rotation if this level needs it
      if (shouldRotate(currentRound)) {
        setIsBoardRotated(true);
      }
    }, timeConstants.PREVIEW_DURATION);
  }, [
    currentRound,
    resetBoard,
    boardResultsShowOrHide,
    setAnyGameEverStarted,
    disableClicking,
    enableClicking,
    swapRandomSquares,
    shouldRotate,
  ]);

  // Start game on mount
  useEffect(() => {
    startGame();
    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      if (swapTimerRef.current) clearTimeout(swapTimerRef.current);
    };
  }, []);

  // Keep history-driven stats in sync after returning from History screen.
  useFocusEffect(
    useCallback(() => {
      refreshHistory();
    }, [refreshHistory]),
  );

  const handleExitToMenuPress = useCallback(() => {
    if (!isBoardShown && !gameInProgress) {
      navigation.navigate("Home");
      return;
    }

    Alert.alert(
      "Return to Menu?",
      "Your current game will be counted as a loss. Are you sure?",
      [
        { text: "Keep Playing", style: "cancel" },
        {
          text: "Quit Game",
          style: "destructive",
          onPress: async () => {
            if (previewTimerRef.current) {
              clearTimeout(previewTimerRef.current);
              previewTimerRef.current = null;
            }
            if (swapTimerRef.current) {
              clearTimeout(swapTimerRef.current);
              swapTimerRef.current = null;
            }

            const shouldRecordLoss = isBoardShown && !wonDialog && !lostDialog;

            setGameInProgress(false);
            setIsSwapping(false);
            setSwapCountLabel(0);
            if (shouldRecordLoss) {
              await addGameToHistory(
                currentRound,
                currentGameTime,
                totalGameTime,
                gameResults.LOSE,
              );
            }

            setIsBoardShown(false);
            setWonDialog(false);
            setLostDialog(false);
            navigation.navigate("Home");
          },
        },
      ],
    );
  }, [
    addGameToHistory,
    currentRound,
    currentGameTime,
    gameInProgress,
    isBoardShown,
    lostDialog,
    navigation,
    totalGameTime,
    wonDialog,
  ]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          handleExitToMenuPress();
          return true;
        },
      );

      return () => subscription.remove();
    }, [handleExitToMenuPress]),
  );

  const handleSquareTap = useCallback(
    async (id) => {
      const result = handleItemClick(id);
      if (!result) return;

      setGameInProgress(false);

      if (result.lost) {
        await addGameToHistory(
          currentRound,
          currentGameTime,
          totalGameTime,
          gameResults.LOSE,
        );
        setTypeLost(typeOfLost.WRONG_CLICKED);
        setLostDialog(true);
      } else if (result.won) {
        await addGameToHistory(
          currentRound,
          currentGameTime,
          totalGameTime,
          gameResults.WIN,
        );
        setWonDialog(true);
      }
    },
    [
      handleItemClick,
      currentRound,
      currentGameTime,
      totalGameTime,
      addGameToHistory,
    ],
  );

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
    navigation.navigate("Home");
  };

  // Compute square size from board size, column count, and margins
  const margin = SQUARE_MARGIN[columns] ?? 5;
  const usableBoardSize = BOARD_SIZE - (BOARD_BORDER_WIDTH + BOARD_PADDING) * 2;
  const squareSize = (usableBoardSize - margin * 2 * columns) / columns;

  // Phone: stack vertically (ResultsBox above board, StatusBox below)
  // Tablet/desktop: ResultsBox left, board centre, StatusBox right
  const isWide = width >= 700;

  const board = (
    <View style={styles.boardWrap}>
      <Animated.View
        style={[
          styles.board,
          {
            width: BOARD_SIZE,
            height: BOARD_SIZE,
            backgroundColor: colors.boardBackground,
            transform: [{ rotate: boardRotation }, { scale: boardScaleAnim }],
            opacity: boardOpacityAnim,
            borderColor: colors.boardBorder,
          },
        ]}
      >
        {rectangles.map((item) => (
          <AnimatedSquare
            key={item.id}
            item={item}
            squareSize={squareSize}
            margin={margin}
            colors={colors}
            itemsNotClickable={itemsNotClickable}
            onPress={() => handleSquareTap(item.id)}
          />
        ))}
      </Animated.View>

      {isSwapping && (
        <>
          <View style={styles.swapOverlay} pointerEvents="none" />
          <View style={styles.swapBanner} pointerEvents="none">
            <Text style={styles.swapBannerText}>
              🔀 {swapCountLabel} swap{swapCountLabel === 1 ? "" : "s"} in motion!
            </Text>
          </View>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topActions}>
            <TouchableOpacity
              onPress={handleExitToMenuPress}
              style={styles.menuBackButton}
              activeOpacity={0.8}
            >
              <Text style={styles.menuBackButtonText}>← Menu</Text>
            </TouchableOpacity>
          </View>

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
              <ResultsBox
                history={history}
                visible={anyGameEverStarted}
                horizontal
              />
              <View style={styles.boardCentered}>{board}</View>
              <StatusBox
                round={currentRound}
                currentTime={currentGameTime}
                totalTime={totalGameTime}
                solved={countOfValidClicked}
                total={countOfValid}
                visible={anyGameEverStarted}
                horizontal
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
  gradient: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  safeArea: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  topActions: {
    width: "100%",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  menuBackButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  menuBackButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  // Tablet/desktop layout: side by side
  wideRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    width: "100%",
  },
  sidePanel: {
    flex: 1,
    maxWidth: 260,
  },
  // Phone layout: stacked vertically
  narrowCol: {
    alignItems: "stretch",
    gap: 16,
    width: "100%",
  },
  boardCentered: {
    alignItems: "center",
  },
  boardWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  board: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "center",
    justifyContent: "center",
    borderRadius: 20,
    borderWidth: BOARD_BORDER_WIDTH,
    padding: BOARD_PADDING,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 10,
  },
  swapBanner: {
    position: "absolute",
    top: 12,
    alignSelf: "center",
    backgroundColor: "rgba(254, 240, 138, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#f59e0b",
  },
  swapOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    backgroundColor: "rgba(251, 191, 36, 0.2)",
    borderWidth: 4,
    borderColor: "rgba(245, 158, 11, 0.7)",
  },
  swapBannerText: {
    color: "#7c2d12",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  square: {
    flex: 1,
    borderRadius: 10,
  },
  glowOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
  },
});
