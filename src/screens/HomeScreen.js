import React, { useEffect, useRef, useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useGameStatusStore } from '../stores/gameStatusStore';
import { useAuth } from '../hooks/useAuth';

// Floating decorative square
function DecoSquare({ style, delay }) {
  const anim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const rot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(anim, { toValue: { x: 20, y: -40 }, duration: 1750, useNativeDriver: true }),
          Animated.timing(rot, { toValue: 1, duration: 1750, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(anim, { toValue: { x: 0, y: -60 }, duration: 875, useNativeDriver: true }),
          Animated.timing(rot, { toValue: 2, duration: 875, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(anim, { toValue: { x: -20, y: -40 }, duration: 875, useNativeDriver: true }),
          Animated.timing(rot, { toValue: 3, duration: 875, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(anim, { toValue: { x: 0, y: 0 }, duration: 1750, useNativeDriver: true }),
          Animated.timing(rot, { toValue: 4, duration: 1750, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const rotate = rot.interpolate({ inputRange: [0, 4], outputRange: ['0deg', '40deg'] });

  return (
    <Animated.View
      style={[
        styles.decoSquare,
        style,
        { transform: [{ translateX: anim.x }, { translateY: anim.y }, { rotate }] },
      ]}
    />
  );
}

// Auth modal (sign-in / sign-up)
function AuthModal({ visible, onClose, colors }) {
  const { signIn, signUp, error } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) return;
    setSubmitting(true);
    const ok = isSignUp ? await signUp(email, password) : await signIn(email, password);
    setSubmitting(false);
    if (ok) {
      setEmail('');
      setPassword('');
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {isSignUp ? 'Create Account' : 'Sign In'}
          </Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
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
          >
            <Text style={styles.primaryBtnText}>
              {submitting ? '...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsSignUp((v) => !v)} style={styles.linkRow}>
            <Text style={[styles.linkText, { color: colors.textSecondary }]}>
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.linkRow}>
            <Text style={[styles.linkText, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const currentRound = useGameStatusStore((s) => s.currentRound);
  const gameInProgress = useGameStatusStore((s) => s.gameInProgress);
  const setGameInProgress = useGameStatusStore((s) => s.setGameInProgress);
  const setIsBoardShown = useGameStatusStore((s) => s.setIsBoardShown);
  const resetGame = useGameStatusStore((s) => s.resetGame);

  const [showResume, setShowResume] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  // Mark abandoned game as loss on mount
  useEffect(() => {
    if (gameInProgress) {
      setGameInProgress(false);
      Alert.alert('Game Ended', 'You exited mid-game. It has been counted as a loss.');
    }
    setIsBoardShown(false);
  }, []);

  const handleStartPress = () => {
    if (currentRound > 1) {
      setShowResume(true);
    } else {
      navigation.navigate('Game');
    }
  };

  const handleContinue = () => {
    setShowResume(false);
    navigation.navigate('Game');
  };

  const handleNewGame = () => {
    setShowResume(false);
    resetGame();
    navigation.navigate('Game');
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.gradientStart }]}>
      {/* Decorative floating squares */}
      <DecoSquare style={{ width: 90, height: 90, top: '15%', left: '8%' }} delay={0} />
      <DecoSquare style={{ width: 70, height: 70, bottom: '20%', left: '15%' }} delay={1200} />
      <DecoSquare style={{ width: 110, height: 110, top: '30%', right: '12%' }} delay={700} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <Animated.View style={[styles.titleWrapper, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.brain}>🧠</Text>
            <Text style={styles.title}>Memory Squares</Text>
            <Text style={styles.subtitle}>Test your memory and reflexes!</Text>
          </Animated.View>

          {/* Buttons */}
          <Animated.View style={[styles.buttonsSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <TouchableOpacity style={[styles.startBtn, { backgroundColor: colors.primary }]} onPress={handleStartPress}>
              <Text style={styles.startBtnText}>▶  Start Game</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.outlineBtn, { borderColor: 'rgba(255,255,255,0.8)' }]}
              onPress={() => navigation.navigate('History')}
            >
              <Text style={[styles.outlineBtnText, { color: 'rgba(255,255,255,0.9)' }]}>⏱  Game History</Text>
            </TouchableOpacity>

            {user ? (
              <TouchableOpacity style={styles.linkRow} onPress={signOut}>
                <Text style={styles.authText}>Sign out ({user.email})</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.linkRow} onPress={() => setShowAuth(true)}>
                <Text style={styles.authText}>Sign in to sync history ☁</Text>
              </TouchableOpacity>
            )}
          </Animated.View>

          {/* How to Play card */}
          <Animated.View style={[styles.infoCard, { opacity: fadeAnim }]}>
            <Text style={styles.infoTitle}>How to Play</Text>
            <Text style={styles.infoLine}>👁  Memorize the highlighted squares</Text>
            <Text style={styles.infoLine}>⏱  You have 3 seconds!</Text>
            <Text style={styles.infoLine}>👆  Tap only the blue (valid) squares</Text>
            <Text style={styles.infoLine}>⏰  Complete in 15 seconds</Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      {/* Resume dialog */}
      <Modal visible={showResume} transparent animationType="fade" onRequestClose={() => setShowResume(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Resume Game?</Text>
            <Text style={[styles.modalMsg, { color: colors.textSecondary }]}>
              You have a game in progress at Round {currentRound}. Would you like to continue?
            </Text>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={handleContinue}>
              <Text style={styles.primaryBtnText}>▶  Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.error, marginTop: 8 }]} onPress={handleNewGame}>
              <Text style={styles.primaryBtnText}>↺  New Game</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <AuthModal visible={showAuth} onClose={() => setShowAuth(false)} colors={colors} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 24, paddingBottom: 40 },

  titleWrapper: { alignItems: 'center', marginTop: 60, marginBottom: 40 },
  brain: { fontSize: 80 },
  title: {
    fontSize: 40, fontWeight: '900', color: '#fff', marginTop: 8,
    textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 12,
  },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginTop: 6, fontWeight: '300' },

  buttonsSection: { width: '100%', alignItems: 'center', marginBottom: 24 },
  startBtn: {
    width: '100%', paddingVertical: 18, borderRadius: 50, alignItems: 'center', marginBottom: 14,
    shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 8 }, shadowRadius: 16, elevation: 8,
  },
  startBtnText: { color: '#fff', fontSize: 18, fontWeight: '700', letterSpacing: 0.5 },
  outlineBtn: { width: '100%', paddingVertical: 14, borderRadius: 50, alignItems: 'center', borderWidth: 2, marginBottom: 14 },
  outlineBtnText: { fontSize: 16, fontWeight: '600' },
  linkRow: { marginTop: 6, alignItems: 'center' },
  authText: { color: 'rgba(255,255,255,0.75)', fontSize: 14, textDecorationLine: 'underline' },

  infoCard: {
    width: '100%', borderRadius: 16, padding: 20, backgroundColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 8 }, shadowRadius: 24, elevation: 4,
  },
  infoTitle: { fontSize: 18, fontWeight: '700', color: '#667eea', marginBottom: 12, textAlign: 'center' },
  infoLine: { fontSize: 14, color: '#444', lineHeight: 28 },

  decoSquare: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: {
    width: '100%', borderRadius: 16, padding: 24,
    shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 8 }, shadowRadius: 24, elevation: 8,
  },
  modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  modalMsg: { fontSize: 15, textAlign: 'center', marginBottom: 20, lineHeight: 22 },

  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12, fontSize: 16 },
  primaryBtn: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  errorText: { color: '#e05252', fontSize: 13, marginBottom: 8, textAlign: 'center' },
});
