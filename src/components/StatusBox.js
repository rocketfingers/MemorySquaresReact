import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { timeConstants } from '../constants/gameConstants';

/**
 * Displays current-game stats: round, round timer, and progress %.
 *
 * Props:
 *   round        {number}  current round number
 *   currentTime  {number}  seconds elapsed this round
 *   totalTime    {number}  cumulative seconds across all rounds
 *   solved       {number}  valid squares clicked so far
 *   total        {number}  total valid squares to click
 *   visible      {boolean} whether any game has ever started
 */
export default function StatusBox({ round, currentTime, totalTime, solved, total, visible }) {
  if (!visible) return null;

  const timeIsRed = currentTime >= timeConstants.MAX_ALLOWED_TIME * 0.8;
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

  // Build a simple arc-like progress indicator using text
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🏁</Text>
        <Text style={styles.headerTitle}>Current Game</Text>
      </View>

      <View style={styles.row}>
        {/* Round time */}
        <View style={styles.tile}>
          <Text style={styles.tileIcon}>⏱</Text>
          <Text style={styles.tileLabel}>Round Time</Text>
          <Text style={[styles.tileValue, timeIsRed && styles.valueRed]}>
            {currentTime}
            <Text style={styles.tileMax}>/{timeConstants.MAX_ALLOWED_TIME}s</Text>
          </Text>
        </View>

        {/* Progress */}
        <View style={styles.progressTile}>
          <View style={styles.progressCircle}>
            <Text style={styles.progressPct}>{pct}%</Text>
          </View>
          <Text style={styles.tileLabel}>Progress</Text>
        </View>

        {/* Round number */}
        <View style={styles.roundTile}>
          <Text style={styles.tileIcon}>🎲</Text>
          <Text style={styles.tileLabel}>Round</Text>
          <Text style={styles.roundValue}>{round}</Text>
        </View>

        {/* Total time */}
        <View style={styles.tile}>
          <Text style={styles.tileIcon}>🕐</Text>
          <Text style={styles.tileLabel}>Total Time</Text>
          <Text style={styles.tileValue}>{totalTime}s</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)' },
  headerIcon: { fontSize: 20, marginRight: 8 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },

  row: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  tile: { alignItems: 'center', flex: 1, minWidth: 60, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 8 },
  tileIcon: { fontSize: 18, marginBottom: 2 },
  tileLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  tileValue: { color: '#fff', fontSize: 16, fontWeight: '700' },
  tileMax: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '400' },
  valueRed: { color: '#ff6b6b' },

  progressTile: { alignItems: 'center', flex: 1, minWidth: 60 },
  progressCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 3, borderColor: 'rgba(255,255,255,0.6)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  progressPct: { color: '#fff', fontSize: 14, fontWeight: '700' },

  roundTile: { alignItems: 'center', flex: 1, minWidth: 60, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 8 },
  roundValue: { color: '#fff', fontSize: 24, fontWeight: '700' },
});
