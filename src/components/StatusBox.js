import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { timeConstants } from "../constants/gameConstants";

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
 *   vertical     {boolean} render stats as stacked rows
 *   horizontal   {boolean} render stats as compact tiles
 */
export default function StatusBox({
  round,
  currentTime,
  totalTime,
  solved,
  total,
  visible,
  vertical = false,
  horizontal = false,
}) {
  if (!visible) return null;

  const timeIsRed = currentTime >= timeConstants.MAX_ALLOWED_TIME * 0.8;
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

  if (horizontal) {
    return (
      <View style={styles.card}>
        <View style={styles.tilesRow}>
          <StatTile
            icon="⏱"
            label="Round Time"
            value={
              <Text style={[styles.tileValue, timeIsRed && styles.valueRed]}>
                {currentTime}
                <Text style={styles.tileMax}>
                  /{timeConstants.MAX_ALLOWED_TIME}s
                </Text>
              </Text>
            }
          />
          <StatTile icon="📊" label="Progress" value={`${pct}%`} />
          <StatTile icon="🎲" label="Round" value={round} />
          <StatTile icon="🕐" label="Total Time" value={`${totalTime}s`} />
        </View>
      </View>
    );
  }

  if (vertical) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🏁</Text>
          <Text style={styles.headerTitle}>Current Game</Text>
        </View>

        <StatRow
          icon="⏱"
          label="Round Time"
          value={`${currentTime}/${timeConstants.MAX_ALLOWED_TIME}s`}
          valueStyle={timeIsRed && styles.valueRed}
        />
        <StatRow icon="📊" label="Progress" value={`${pct}%`} />
        <StatRow icon="🎲" label="Round" value={round} />
        <StatRow icon="🕐" label="Total Time" value={`${totalTime}s`} />
      </View>
    );
  }

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
            <Text style={styles.tileMax}>
              /{timeConstants.MAX_ALLOWED_TIME}s
            </Text>
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

function StatTile({ icon, label, value, valueStyle }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.tileIcon}>{icon}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
      {React.isValidElement(value) ? (
        value
      ) : (
        <Text style={[styles.tileValue, valueStyle]}>{value}</Text>
      )}
    </View>
  );
}

function StatRow({ icon, label, value, valueStyle }) {
  return (
    <View style={styles.statItem}>
      <View style={styles.iconWrap}>
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
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.2)",
  },
  headerIcon: { fontSize: 20, marginRight: 8 },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },

  // Horizontal layout (default)
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },
  tile: {
    alignItems: "center",
    flex: 1,
    minWidth: 60,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 8,
  },
  tileIcon: { fontSize: 18, marginBottom: 2 },
  tileLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  tileValue: { color: "#fff", fontSize: 16, fontWeight: "700" },
  tileMax: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: "400" },
  valueRed: { color: "#ff6b6b" },

  progressTile: { alignItems: "center", flex: 1, minWidth: 60 },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  progressPct: { color: "#fff", fontSize: 14, fontWeight: "700" },

  roundTile: {
    alignItems: "center",
    flex: 1,
    minWidth: 60,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 8,
  },
  roundValue: { color: "#fff", fontSize: 24, fontWeight: "700" },

  // Vertical layout (stacked rows)
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  statIcon: { fontSize: 22 },
  statContent: { flex: 1 },
  statLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  statValue: { color: "#fff", fontSize: 26, fontWeight: "700" },

  // Tile row (used for compact mode)
  tilesRow: { flexDirection: "row", justifyContent: "space-between", gap: 6 },
});
