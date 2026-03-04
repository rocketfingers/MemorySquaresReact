import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { gameResults } from "../constants/gameResult";

/**
 * Displays overall game statistics derived from history.
 *
 * Props:
 *   history     {Array}   array of game records
 *   visible     {boolean} whether any game has ever started
 *   horizontal  {boolean} render stats as a row of tiles (default: false = vertical rows)
 */
export default function ResultsBox({ history, visible, horizontal = false }) {
  if (!visible) return null;

  const maxRound = useMemo(() => {
    if (!history || history.length === 0) return 0;
    return Math.max(...history.map((p) => p.round));
  }, [history]);

  const avgTime = useMemo(() => {
    if (!history || history.length === 0) return "0.0";
    const sum = history.reduce((acc, p) => acc + (p.time ?? 0), 0);
    return (sum / history.length).toFixed(1);
  }, [history]);

  const countWin = useMemo(
    () => history.filter((p) => p.result === gameResults.WIN).length,
    [history],
  );

  const countLost = useMemo(
    () => history.filter((p) => p.result === gameResults.LOSE).length,
    [history],
  );

  const winRate = useMemo(() => {
    const total = countWin + countLost;
    if (total === 0) return "0%";
    return `${Math.round((countWin / total) * 100)}%`;
  }, [countWin, countLost]);

  if (horizontal) {
    return (
      <View style={styles.card}>
        <View style={styles.tilesRow}>
          <StatTile icon="🎲" label="Max Round" value={maxRound} highlight />
          <StatTile icon="⏱" label="Avg Time" value={`${avgTime}s`} />
          <StatTile icon="🏆" label="Win Rate" value={winRate} />
          <StatTile
            icon="👍"
            label="Wins"
            value={countWin}
            valueStyle={styles.winText}
          />
          <StatTile
            icon="👎"
            label="Losses"
            value={countLost}
            valueStyle={styles.lossText}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerIconWrap}>
          <Text style={styles.headerIcon}>📊</Text>
        </View>
        <Text style={styles.headerTitle}>Your Stats</Text>
      </View>

      <StatRow icon="🎲" label="Max Round" value={maxRound} highlight />
      <StatRow icon="⏱" label="Avg Time" value={`${avgTime}s`} />
      <StatRow
        icon="🏆"
        label="Win Rate"
        value={winRate}
        progress={
          countWin + countLost > 0 ? countWin / (countWin + countLost) : 0
        }
      />
      <StatRow
        icon="👍"
        label="Wins"
        value={countWin}
        valueStyle={styles.winText}
        iconBg="rgba(16, 185, 129, 0.25)"
        iconColor="#34d399"
      />
      <StatRow
        icon="👎"
        label="Losses"
        value={countLost}
        valueStyle={styles.lossText}
        iconBg="rgba(239, 68, 68, 0.25)"
        iconColor="#f87171"
      />
    </View>
  );
}

function StatRow({
  icon,
  label,
  value,
  valueStyle,
  iconBg,
  iconColor,
  highlight,
  progress,
}) {
  return (
    <View style={[styles.statItem, highlight && styles.statItemHighlight]}>
      <View
        style={[styles.iconWrap, iconBg ? { backgroundColor: iconBg } : null]}
      >
        <Text style={[styles.statIcon, iconColor && { color: iconColor }]}>
          {icon}
        </Text>
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, valueStyle]}>{value}</Text>
        {progress !== undefined && (
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(progress * 100, 100)}%` },
              ]}
            />
          </View>
        )}
      </View>
    </View>
  );
}

function StatTile({ icon, label, value, valueStyle, highlight }) {
  return (
    <View style={[styles.tile, highlight && styles.tileHighlight]}>
      <Text style={styles.tileIcon}>{icon}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={[styles.tileValue, valueStyle]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.15)",
  },
  headerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerIcon: { fontSize: 18 },
  headerTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Vertical layout (default)
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  statItemHighlight: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  statIcon: { fontSize: 22 },
  statContent: { flex: 1 },
  statLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  statValue: { color: "#fff", fontSize: 24, fontWeight: "700" },

  // Progress bar
  progressBarBg: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 2,
    marginTop: 8,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "rgba(52, 211, 153, 0.8)",
    borderRadius: 2,
  },

  // Horizontal layout (tile mode)
  tilesRow: { flexDirection: "row", justifyContent: "space-between", gap: 6 },
  tile: {
    alignItems: "center",
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 8,
    minWidth: 56,
  },
  tileHighlight: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  tileIcon: { fontSize: 14, marginBottom: 2 },
  tileLabel: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 8,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  tileValue: { color: "#fff", fontSize: 14, fontWeight: "700" },

  winText: { color: "#34d399" },
  lossText: { color: "#f87171" },
});
