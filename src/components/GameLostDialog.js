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
import { typeOfLost } from "../constants/gameConstants";

const { width } = Dimensions.get("window");

// Falling tear animation
function FallingTear({ delay, startX }) {
  const translateX = useRef(new Animated.Value(startX)).current;
  const translateY = useRef(new Animated.Value(-30)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fall = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 400,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: startX + (Math.random() - 0.5) * 50,
            duration: 2500,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    );
    fall.start();
    return () => fall.stop();
  }, []);

  return (
    <Animated.Text
      style={[
        styles.fallingTear,
        {
          transform: [{ translateX }, { translateY }],
          opacity,
        },
      ]}
    >
      💧
    </Animated.Text>
  );
}

/**
 * Game over dialog shown on wrong tap or timeout.
 *
 * Props:
 *   visible    {boolean}
 *   reason     {number}   typeOfLost.WRONG_CLICKED | typeOfLost.TIME_OUT
 *   onRestart  {Function}
 *   onGoToMenu {Function}
 */
export default function GameLostDialog({
  visible,
  reason,
  onRestart,
  onGoToMenu,
}) {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
        // Shake animation
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: -10,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -10,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -5,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 5,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 80,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Pulse animation for retry button
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseLoop.start();

      return () => pulseLoop.stop();
    } else {
      scaleAnim.setValue(0.5);
      opacityAnim.setValue(0);
      shakeAnim.setValue(0);
    }
  }, [visible]);

  const isTimeout = reason === typeOfLost.TIME_OUT;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        {/* Falling tears */}
        {visible &&
          [...Array(5)].map((_, i) => (
            <FallingTear
              key={i}
              delay={i * 300}
              startX={width / 2 + (Math.random() - 0.5) * 200}
            />
          ))}

        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ scale: scaleAnim }, { translateX: shakeAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Header with gradient */}
          <LinearGradient
            colors={["#ef4444", "#f87171"]}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Animated.Text style={styles.heartIcon}>💔</Animated.Text>
            <Text style={styles.title}>Game Over</Text>
            <Text style={styles.subtitle}>Don't give up!</Text>
          </LinearGradient>

          {/* Body */}
          <View style={styles.body}>
            <View style={styles.reasonRow}>
              <Text style={styles.reasonIcon}>{isTimeout ? "⏰" : "❌"}</Text>
              <Text style={styles.bodyTitle}>
                {isTimeout ? "Time's Up!" : "Wrong Move"}
              </Text>
            </View>
            <Text style={styles.bodyText}>
              {isTimeout
                ? "You ran out of time to find the squares. Stay focused and try again!"
                : "Oops! That wasn't the right square. Pay close attention next time!"}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Animated.View
              style={{ transform: [{ scale: pulseAnim }], width: "100%" }}
            >
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={onRestart}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={["#ef4444", "#f87171"]}
                  style={styles.retryBtnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.retryBtnText}>↺ Try Again</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
            <TouchableOpacity
              style={styles.menuBtn}
              onPress={onGoToMenu}
              activeOpacity={0.8}
            >
              <Text style={styles.menuBtnText}>⌂ Return to Menu</Text>
            </TouchableOpacity>
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
    shadowColor: "#ef4444",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 15 },
    shadowRadius: 40,
    elevation: 15,
  },

  header: {
    alignItems: "center",
    padding: 36,
  },
  heartIcon: {
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
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  reasonIcon: { fontSize: 24, marginRight: 8 },
  bodyTitle: { fontSize: 22, fontWeight: "700", color: "#1e1b4b" },
  bodyText: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
  },

  actions: {
    padding: 20,
    paddingTop: 16,
    backgroundColor: "#fafafa",
    alignItems: "center",
  },
  retryBtn: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#ef4444",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 6,
  },
  retryBtnGradient: {
    paddingVertical: 16,
    alignItems: "center",
    paddingHorizontal: 40,
  },
  retryBtnText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
  menuBtn: {
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  menuBtnText: { fontSize: 15, fontWeight: "600", color: "#94a3b8" },

  fallingTear: {
    position: "absolute",
    fontSize: 20,
    top: 0,
  },
});
