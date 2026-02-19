import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Animated } from 'react-native';

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
export default function GameWonDialog({ visible, columns, onNextLevel, onRestart, onGoToMenu }) {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -10, duration: 1500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Animated.Text style={[styles.trophy, { transform: [{ translateY: floatAnim }] }]}>
              🏆
            </Animated.Text>
            <Text style={styles.title}>Victory!</Text>
            <Text style={styles.subtitle}>Level Complete</Text>
          </View>

          {/* Body */}
          <View style={styles.body}>
            <Text style={styles.bodyTitle}>Excellent work!</Text>
            <Text style={styles.bodyText}>
              You've successfully cleared the board. What would you like to do next?
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {columns < 7 && (
              <TouchableOpacity style={[styles.btn, styles.nextBtn]} onPress={onNextLevel}>
                <Text style={styles.btnText}>→  Next Level</Text>
              </TouchableOpacity>
            )}
            <View style={styles.rowBtns}>
              <TouchableOpacity style={[styles.btn, styles.restartBtn]} onPress={onRestart}>
                <Text style={[styles.btnText, { color: '#667eea' }]}>↺  Restart</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.menuBtn]} onPress={onGoToMenu}>
                <Text style={[styles.btnText, { color: '#888' }]}>⌂  Menu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 400, borderRadius: 24, overflow: 'hidden', backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 10 }, shadowRadius: 40, elevation: 10 },

  header: { backgroundColor: '#56ab2f', backgroundImage: 'linear-gradient(135deg,#a8e063,#56ab2f)', alignItems: 'center', padding: 32 },
  trophy: { fontSize: 64, marginBottom: 8 },
  title: { color: '#fff', fontSize: 32, fontWeight: '700' },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 16, marginTop: 4 },

  body: { padding: 20, alignItems: 'center' },
  bodyTitle: { fontSize: 20, fontWeight: '600', color: '#333', marginBottom: 8 },
  bodyText: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22 },

  actions: { padding: 20, paddingTop: 8 },
  rowBtns: { flexDirection: 'row', gap: 10 },
  btn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 10, flex: 1 },
  nextBtn: { backgroundColor: '#56ab2f' },
  restartBtn: { borderWidth: 1.5, borderColor: '#667eea', backgroundColor: 'transparent' },
  menuBtn: { backgroundColor: 'transparent' },
  btnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
