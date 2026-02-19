import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Animated } from 'react-native';
import { typeOfLost } from '../constants/gameConstants';

/**
 * Game over dialog shown on wrong tap or timeout.
 *
 * Props:
 *   visible    {boolean}
 *   reason     {number}   typeOfLost.WRONG_CLICKED | typeOfLost.TIME_OUT
 *   onRestart  {Function}
 *   onGoToMenu {Function}
 */
export default function GameLostDialog({ visible, reason, onRestart, onGoToMenu }) {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -4, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [visible]);

  const isTimeout = reason === typeOfLost.TIME_OUT;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Animated.Text style={[styles.heartIcon, { transform: [{ translateX: shakeAnim }] }]}>
              💔
            </Animated.Text>
            <Text style={styles.title}>Game Over</Text>
            <Text style={styles.subtitle}>Don't give up!</Text>
          </View>

          {/* Body */}
          <View style={styles.body}>
            <Text style={styles.bodyTitle}>{isTimeout ? "Time's Up!" : 'Wrong Move'}</Text>
            <Text style={styles.bodyText}>
              {isTimeout
                ? 'You ran out of time to find the squares. '
                : "Oops! That wasn't the right square. "}
              Give it another shot?
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.retryBtn]} onPress={onRestart}>
              <Text style={styles.btnTextWhite}>↺  Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.menuBtn]} onPress={onGoToMenu}>
              <Text style={styles.btnTextGray}>⌂  Return to Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 400, borderRadius: 24, overflow: 'hidden', backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 10 }, shadowRadius: 40, elevation: 10 },

  header: { backgroundColor: '#dd2476', alignItems: 'center', padding: 32 },
  heartIcon: { fontSize: 64, marginBottom: 8 },
  title: { color: '#fff', fontSize: 32, fontWeight: '700' },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 16, marginTop: 4 },

  body: { padding: 20, alignItems: 'center' },
  bodyTitle: { fontSize: 20, fontWeight: '600', color: '#333', marginBottom: 8 },
  bodyText: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22 },

  actions: { padding: 20, paddingTop: 8 },
  btn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  retryBtn: { backgroundColor: '#dd2476' },
  menuBtn: { backgroundColor: 'transparent' },
  btnTextWhite: { fontSize: 16, fontWeight: '600', color: '#fff' },
  btnTextGray: { fontSize: 16, fontWeight: '500', color: '#888' },
});
