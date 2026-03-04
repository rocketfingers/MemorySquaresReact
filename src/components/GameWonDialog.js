import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

// Confetti particle component
function ConfettiParticle({ delay, color, startX }) {
  const translateX = useRef(new Animated.Value(startX)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fall = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 500,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: startX + (Math.random() - 0.5) * 100,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    fall.start();
    return () => fall.stop();
  }, []);

  const rotation = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={[
        styles.confetti,
        {
          backgroundColor: color,
          transform: [{ translateX }, { translateY }, { rotate: rotation }],
          opacity,
        },
      ]}
    />
  );
}

/**
 * Victory dialog shown when a round is cleared.
 *
 * Props:
 *   visible      {boolean}
 *   columns      {number}   current grid size — hides Next Level if >= 7
 *   onNextLevel  {Function}
 *   onRestart    {Function}
 *   onGoToMenu   {Function}
 */
export default function GameWonDialog({
  visible,
  columns,
  onNextLevel,
  onRestart,
  onGoToMenu,
}) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Entrance animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 65,
          friction: 10,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Floating animation for trophy
      const floatLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -12,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      );
      floatLoop.start();

      // Glow pulse
      const glowLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
      glowLoop.start();

      return () => {
        floatLoop.stop();
        glowLoop.stop();
      };
    } else {
      scaleAnim.setValue(0.5);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.3],
  });

  const confettiColors = [
    "#fbbf24",
    "#34d399",
    "#60a5fa",
    "#f472b6",
    "#a78bfa",
  ];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        {/* Confetti particles */}
        {visible &&
          confettiColors.map((color, i) => (
            <ConfettiParticle
              key={i}
              color={color}
              delay={i * 200}
              startX={width / 2 + (Math.random() - 0.5) * 200}
            />
          ))}

        <Animated.View
          style={[
            styles.card,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          ]}
        >
          {/* Header with gradient */}
          <LinearGradient
            colors={["#10b981", "#34d399"]}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Glow effect behind trophy */}
            <Animated.View
              style={[
                styles.glowEffect,
                {
                  transform: [{ scale: glowScale }],
                  opacity: glowAnim,
                },
              ]}
            />
            <Animated.Text
              style={[
                styles.trophy,
                { transform: [{ translateY: floatAnim }] },
              ]}
            >
              🏆
            </Animated.Text>
            <Text style={styles.title}>Victory!</Text>
            <Text style={styles.subtitle}>Level Complete</Text>
          </LinearGradient>

          {/* Body */}
          <View style={styles.body}>
            <View style={styles.celebrationRow}>
              <Text style={styles.celebrationIcon}>✨</Text>
              <Text style={styles.bodyTitle}>Excellent work!</Text>
              <Text style={styles.celebrationIcon}>✨</Text>
            </View>
            <Text style={styles.bodyText}>
              You've successfully cleared the board. What would you like to do
              next?
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {columns < 7 && (
              <TouchableOpacity
                style={styles.nextBtn}
                onPress={onNextLevel}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={["#10b981", "#34d399"]}
                  style={styles.nextBtnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.nextBtnText}>→ Next Level</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            <View style={styles.rowBtns}>
              <TouchableOpacity
                style={styles.restartBtn}
                onPress={onRestart}
                activeOpacity={0.8}
              >
                <Text style={styles.restartBtnText}>↺ Restart</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuBtn}
                onPress={onGoToMenu}
                activeOpacity={0.8}
              >
                <Text style={styles.menuBtnText}>⌂ Menu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#10b981",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 15 },
    shadowRadius: 40,
    elevation: 15,
  },

  header: {
    alignItems: "center",
    padding: 36,
    position: "relative",
    overflow: "hidden",
  },
  glowEffect: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    top: 20,
  },
  trophy: {
    fontSize: 72,
    marginBottom: 12,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  title: { color: "#fff", fontSize: 34, fontWeight: "800", letterSpacing: 0.5 },
  subtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 16,
    marginTop: 6,
    fontWeight: "500",
  },

  body: { padding: 24, alignItems: "center", backgroundColor: "#fafafa" },
  celebrationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  celebrationIcon: { fontSize: 20 },
  bodyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e1b4b",
    marginHorizontal: 10,
  },
  bodyText: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
  },

  actions: { padding: 20, paddingTop: 16, backgroundColor: "#fafafa" },
  rowBtns: { flexDirection: "row", gap: 12, marginTop: 12 },
  nextBtn: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#10b981",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 6,
  },
  nextBtnGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  nextBtnText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
  restartBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#6366f1",
    backgroundColor: "rgba(99, 102, 241, 0.05)",
  },
  restartBtnText: { fontSize: 15, fontWeight: "600", color: "#6366f1" },
  menuBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  menuBtnText: { fontSize: 15, fontWeight: "600", color: "#94a3b8" },

  confetti: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 2,
    top: 0,
  },
});
