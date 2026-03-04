import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../theme/ThemeContext";
import { useGameStatusStore } from "../stores/gameStatusStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useAuth } from "../hooks/useAuth";

const { width, height } = Dimensions.get("window");

// Floating decorative square with enhanced animation
function DecoSquare({ style, delay, color = "rgba(255,255,255,0.15)" }) {
  const anim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const rot = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(anim, {
            toValue: { x: 25, y: -50 },
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(rot, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(scale, {
              toValue: 1.1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(anim, {
            toValue: { x: 0, y: -80 },
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(rot, {
            toValue: 2,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(anim, {
            toValue: { x: -25, y: -50 },
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(rot, {
            toValue: 3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(anim, {
            toValue: { x: 0, y: 0 },
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(rot, {
            toValue: 4,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const rotate = rot.interpolate({
    inputRange: [0, 4],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={[
        styles.decoSquare,
        style,
        {
          backgroundColor: color,
          transform: [
            { translateX: anim.x },
            { translateY: anim.y },
            { rotate },
            { scale },
          ],
        },
      ]}
    />
  );
}

// Pulsing glow effect for the title
function GlowEffect({ children }) {
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View style={{ opacity: glowAnim }}>{children}</Animated.View>
  );
}

// Auth modal (sign-in / sign-up) with enhanced design
function AuthModal({ visible, onClose, colors }) {
  const { signIn, signUp, error } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      slideAnim.setValue(300);
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!email || !password) return;
    setSubmitting(true);
    const ok = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);
    setSubmitting(false);
    if (ok) {
      setEmail("");
      setPassword("");
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <Animated.View
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.surface,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View
            style={[styles.modalHeader, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.modalHeaderIcon}>{isSignUp ? "✨" : "👋"}</Text>
            <Text style={styles.modalHeaderText}>
              {isSignUp ? "Create Account" : "Welcome Back"}
            </Text>
          </View>

          <View style={styles.modalBody}>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder="Email address"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>
                {submitting
                  ? "⏳ Please wait..."
                  : isSignUp
                    ? "🚀 Create Account"
                    : "✓ Sign In"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsSignUp((v) => !v)}
              style={styles.linkRow}
            >
              <Text style={[styles.linkText, { color: colors.primary }]}>
                {isSignUp
                  ? "Already have an account? Sign In"
                  : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕ Close</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const { user, loading, signOut, deleteAccount } = useAuth();
  const currentRound = useGameStatusStore((s) => s.currentRound);
  const gameInProgress = useGameStatusStore((s) => s.gameInProgress);
  const isBoardShown = useGameStatusStore((s) => s.isBoardShown);
  const setGameInProgress = useGameStatusStore((s) => s.setGameInProgress);
  const setIsBoardShown = useGameStatusStore((s) => s.setIsBoardShown);
  const resetGame = useGameStatusStore((s) => s.resetGame);
  const dontShowLoginPromptAgain = useSettingsStore(
    (s) => s.dontShowLoginPromptAgain,
  );
  const isDark = useSettingsStore((s) => s.isDark);
  const toggleTheme = useSettingsStore((s) => s.toggleTheme);
  const setDontShowLoginPromptAgain = useSettingsStore(
    (s) => s.setDontShowLoginPromptAgain,
  );

  const [showResume, setShowResume] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authActionInProgress, setAuthActionInProgress] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const hasCheckedLoginPrompt = useRef(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
    ]).start();
  }, []);

  // Mark abandoned game as loss on mount
  useEffect(() => {
    if (gameInProgress) {
      setGameInProgress(false);
      Alert.alert(
        "Game Ended",
        "You exited mid-game. It has been counted as a loss.",
      );
    }
    setIsBoardShown(false);
  }, []);

  useEffect(() => {
    if (loading || hasCheckedLoginPrompt.current) return;
    hasCheckedLoginPrompt.current = true;

    if (!user && !dontShowLoginPromptAgain) {
      Alert.alert(
        "Sync your progress",
        "Sign in to sync your game history across devices.",
        [
          { text: "Sign In", onPress: () => setShowAuth(true) },
          {
            text: "Dismiss",
            style: "cancel",
            onPress: () => setDontShowLoginPromptAgain(true),
          },
        ],
      );
    }
  }, [loading, user, dontShowLoginPromptAgain, setDontShowLoginPromptAgain]);

  const handleStartPress = () => {
    if (currentRound > 1) {
      setShowResume(true);
    } else {
      navigation.navigate("Game");
    }
  };

  const handleContinue = () => {
    setShowResume(false);
    navigation.navigate("Game");
  };

  const handleNewGame = () => {
    setShowResume(false);
    resetGame();
    navigation.navigate("Game");
  };

  const cleanupAfterAccountAction = () => {
    resetGame();
    setIsBoardShown(false);
    setShowResume(false);
  };

  const accountActionsDisabled = authActionInProgress || isBoardShown;

  const handleSignOutPress = () => {
    if (isBoardShown) {
      Alert.alert(
        "Action unavailable",
        "You cannot sign out during the game.",
      );
      return;
    }

    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          setAuthActionInProgress(true);
          const ok = await signOut();
          setAuthActionInProgress(false);

          if (!ok) {
            Alert.alert("Sign Out Failed", "Please try again in a moment.");
            return;
          }

          cleanupAfterAccountAction();
          Alert.alert("Signed Out", "You have been signed out successfully.");
        },
      },
    ]);
  };

  const handleDeleteAccountPress = () => {
    if (isBoardShown) {
      Alert.alert(
        "Action unavailable",
        "You cannot delete your account during the game.",
      );
      return;
    }

    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Forever",
          style: "destructive",
          onPress: async () => {
            setAuthActionInProgress(true);
            const result = await deleteAccount();
            setAuthActionInProgress(false);

            if (!result.ok) {
              Alert.alert("Delete Failed", result.error);
              return;
            }

            cleanupAfterAccountAction();
            Alert.alert("Account Deleted", "Your account has been deleted.");
          },
        },
      ],
    );
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative floating squares */}
      <DecoSquare
        style={{ width: 100, height: 100, top: "10%", left: "5%" }}
        delay={0}
        color="rgba(255,255,255,0.08)"
      />
      <DecoSquare
        style={{ width: 80, height: 80, bottom: "15%", left: "10%" }}
        delay={1500}
        color="rgba(255,255,255,0.06)"
      />
      <DecoSquare
        style={{ width: 120, height: 120, top: "25%", right: "8%" }}
        delay={800}
        color="rgba(255,255,255,0.07)"
      />
      <DecoSquare
        style={{ width: 60, height: 60, bottom: "30%", right: "15%" }}
        delay={2000}
        color="rgba(255,255,255,0.05)"
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title Section */}
          <Animated.View
            style={[
              styles.titleWrapper,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            <GlowEffect>
              <View style={styles.iconContainer}>
                <Text style={styles.brain}>🧠</Text>
              </View>
            </GlowEffect>
            <Text style={styles.title}>Memory Squares</Text>
            <Text style={styles.subtitle}>Test your memory and reflexes!</Text>
          </Animated.View>

          {/* Buttons Section */}
          <Animated.View
            style={[
              styles.buttonsSection,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <TouchableOpacity
              style={styles.startBtn}
              onPress={handleStartPress}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#10b981", "#34d399"]}
                style={styles.startBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.startBtnText}>▶ Start Game</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineBtn}
              onPress={() => navigation.navigate("History")}
              activeOpacity={0.8}
            >
              <Text style={styles.outlineBtnText}>⏱ Game History</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.themeBtn}
              onPress={toggleTheme}
              activeOpacity={0.8}
            >
              <Text style={styles.themeBtnText}>
                {isDark ? "☀️ Light Theme" : "🌙 Dark Theme"}
              </Text>
            </TouchableOpacity>

            {user ? (
              <View style={styles.accountActions}>
                <TouchableOpacity
                  style={[styles.authRow, accountActionsDisabled && styles.actionDisabled]}
                  onPress={handleSignOutPress}
                  activeOpacity={0.7}
                  disabled={accountActionsDisabled}
                >
                  <Text style={styles.authText}>
                    {authActionInProgress
                      ? "⏳ Processing account action..."
                      : `👋 Sign out (${user.email})`}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.deleteAccountBtn,
                    accountActionsDisabled && styles.actionDisabled,
                  ]}
                  onPress={handleDeleteAccountPress}
                  activeOpacity={0.7}
                  disabled={accountActionsDisabled}
                >
                  <Text style={styles.deleteAccountText}>🗑 Delete account</Text>
                </TouchableOpacity>

                {isBoardShown && (
                  <Text style={styles.actionHint}>
                    You cannot manage your account during the game.
                  </Text>
                )}
              </View>
            ) : (
              <TouchableOpacity
                style={styles.authRow}
                onPress={() => setShowAuth(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.authText}>☁️ Sign in to sync history</Text>
              </TouchableOpacity>
            )}
          </Animated.View>

          {/* How to Play card */}
          <Animated.View style={[styles.infoCard, { opacity: fadeAnim }]}>
            <Text style={styles.infoTitle}>How to Play</Text>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>👁</Text>
              <Text style={styles.infoLine}>
                Memorize the highlighted squares
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>⏱</Text>
              <Text style={styles.infoLine}>
                You have 3 seconds to memorize!
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>👆</Text>
              <Text style={styles.infoLine}>
                Tap only the blue (valid) squares
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>⏰</Text>
              <Text style={styles.infoLine}>
                Complete each round in 15 seconds
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      {/* Resume dialog */}
      <Modal
        visible={showResume}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResume(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View
              style={[styles.modalHeader, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.modalHeaderIcon}>🎮</Text>
              <Text style={styles.modalHeaderText}>Resume Game?</Text>
            </View>
            <View style={styles.modalBody}>
              <Text style={[styles.modalMsg, { color: colors.textSecondary }]}>
                You have a game in progress at Round {currentRound}. Would you
                like to continue?
              </Text>
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: "#10b981" }]}
                onPress={handleContinue}
              >
                <Text style={styles.primaryBtnText}>▶ Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { backgroundColor: colors.error, marginTop: 10 },
                ]}
                onPress={handleNewGame}
              >
                <Text style={styles.primaryBtnText}>↺ New Game</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <AuthModal
        visible={showAuth}
        onClose={() => setShowAuth(false)}
        colors={colors}
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
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  titleWrapper: { alignItems: "center", marginTop: 50, marginBottom: 36 },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  brain: { fontSize: 64 },
  title: {
    fontSize: 38,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: "rgba(255,255,255,0.85)",
    marginTop: 8,
    fontWeight: "400",
    letterSpacing: 0.3,
  },

  buttonsSection: { width: "100%", alignItems: "center", marginBottom: 28 },
  startBtn: {
    width: "100%",
    borderRadius: 50,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#10b981",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 24,
    elevation: 12,
  },
  startBtnGradient: {
    paddingVertical: 18,
    alignItems: "center",
  },
  startBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  outlineBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  outlineBtnText: { fontSize: 16, fontWeight: "600", color: "#fff" },
  themeBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.32)",
    marginBottom: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  themeBtnText: { fontSize: 15, fontWeight: "600", color: "#fff" },
  accountActions: { width: "100%", alignItems: "center" },
  authRow: { marginTop: 8, alignItems: "center", padding: 8 },
  authText: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: "500" },
  deleteAccountBtn: { marginTop: 4, alignItems: "center", padding: 8 },
  deleteAccountText: { color: "#fecaca", fontSize: 13, fontWeight: "600" },
  actionDisabled: { opacity: 0.45 },
  actionHint: {
    marginTop: 4,
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    textAlign: "center",
  },

  infoCard: {
    width: "100%",
    borderRadius: 24,
    padding: 24,
    backgroundColor: "rgba(255,255,255,0.95)",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 32,
    elevation: 8,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#6366f1",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  infoDivider: {
    height: 2,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 40,
    marginBottom: 16,
    borderRadius: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoIcon: { fontSize: 20, marginRight: 12, width: 28 },
  infoLine: { fontSize: 15, color: "#475569", lineHeight: 22, flex: 1 },

  decoSquare: { position: "absolute", borderRadius: 16 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 20 },
    shadowRadius: 40,
    elevation: 15,
  },
  modalHeader: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  modalHeaderIcon: { fontSize: 40, marginBottom: 8 },
  modalHeaderText: { color: "#fff", fontSize: 22, fontWeight: "700" },
  modalBody: { padding: 24 },
  modalMsg: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },

  input: {
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    fontSize: 16,
    fontWeight: "500",
  },
  primaryBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 13,
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "500",
  },
  linkRow: { marginTop: 16, alignItems: "center" },
  linkText: { fontSize: 14, fontWeight: "600" },
  closeBtn: { marginTop: 12, alignItems: "center", padding: 8 },
  closeBtnText: { color: "#94a3b8", fontSize: 14, fontWeight: "500" },
});
