import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { gameResults } from '../constants/gameResult';

/**
 * Displays overall game statistics derived from history.
 *
 * Props:
 *   history  {Array}   array of game records
 *   visible  {boolean} whether any game has ever started
 */
export default function ResultsBox({ history, visible }) {
  if (!visible) return null;

  const maxRound = useMemo(() => {
    if (!history || history.length === 0) return 0;
    return Math.max(...history.map((p) => p.round));
  }, [history]);

  const avgTime = useMemo(() => {
    if (!history || history.length === 0) return '0.0';
    const sum = history.reduce((acc, p) => acc + (p.time ?? 0), 0);
    return (sum / history.length).toFixed(1);
  }, [history]);

  const countWin = useMemo(
    () => history.filter((p) => p.result === gameResults.WIN).length,
    [history]
  );

  const countLost = useMemo(
    () => history.filter((p) => p.result === gameResults.LOSE).length,
    [history]
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>📊</Text>
        <Text style={styles.headerTitle}>Your Stats</Text>
      </View>

      <StatRow icon="🎲" label="Max Round" value={maxRound} />
      <StatRow icon="⏱" label="Avg Time" value={`${avgTime}s`} />
      <StatRow icon="👍" label="Wins" value={countWin} valueStyle={styles.winText} iconBg="rgba(76,175,80,0.3)" />
      <StatRow icon="👎" label="Losses" value={countLost} valueStyle={styles.lossText} iconBg="rgba(244,67,54,0.3)" />
    </View>
  );
}

function StatRow({ icon, label, value, valueStyle, iconBg }) {
  return (
    <View style={styles.statItem}>
      <View style={[styles.iconWrap, iconBg ? { backgroundColor: iconBg } : null]}>
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, valueStyle]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)' },
  headerIcon: { fontSize: 20, marginRight: 8 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },

  statItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 12, marginBottom: 8 },
  iconWrap: { width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  statIcon: { fontSize: 22 },
  statContent: { flex: 1 },
  statLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  statValue: { color: '#fff', fontSize: 26, fontWeight: '700' },
  winText: { color: '#4caf50' },
  lossText: { color: '#f44336' },
});
