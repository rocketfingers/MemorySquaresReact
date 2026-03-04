import React from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
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
            label="Time"
            value={
              <Text style={[styles.tileValue, timeIsRed && styles.valueRed]}>
                {currentTime}
                <Text style={styles.tileMax}>
                  /{timeConstants.MAX_ALLOWED_TIME}s
                </Text>
              </Text>
            }
            highlight
          />
          <StatTile icon="📊" label="Progress" value={`${pct}%`} />
          <StatTile icon="🎲" label="Round" value={round} highlight />
          <StatTile icon="🕐" label="Total" value={`${totalTime}s`} />
        </View>
      </View>
    );
  }

  if (vertical) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerIconWrap}>
            <Text style={styles.headerIcon}>🏁</Text>
          </View>
          <Text style={styles.headerTitle}>Current Game</Text>
        </View>

        <StatRow
          icon="⏱"
          label="Round Time"
          value={`${currentTime}/${timeConstants.MAX_ALLOWED_TIME}s`}
          valueStyle={timeIsRed && styles.valueRed}
          progress={currentTime / timeConstants.MAX_ALLOWED_TIME}
          warning={timeIsRed}
        />
        <StatRow
          icon="📊"
          label="Progress"
          value={`${pct}%`}
          progress={pct / 100}
        />
        <StatRow icon="🎲" label="Round" value={round} highlight />
        <StatRow icon="🕐" label="Total Time" value={`${totalTime}s`} />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerIconWrap}>
          <Text style={styles.headerIcon}>🏁</Text>
        </View>
        <Text style={styles.headerTitle}>Current Game</Text>
      </View>

      <View style={styles.row}>
        {/* Round time */}
        <View style={[styles.tile, styles.tileHighlight]}>
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
        <View style={[styles.tile, styles.tileHighlight]}>
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

function StatTile({ icon, label, value, valueStyle, highlight }) {
  return (
    <View style={[styles.tileCompact, highlight && styles.tileHighlight]}>
      <Text style={styles.tileIconSmall}>{icon}</Text>
      <Text style={styles.tileLabelSmall}>{label}</Text>
      {React.isValidElement(value) ? (
        value
      ) : (
        <Text style={[styles.tileValueSmall, valueStyle]}>{value}</Text>
      )}
    </View>
  );
}

function StatRow({
  icon,
  label,
  value,
  valueStyle,
  progress,
  warning,
  highlight,
}) {
  return (
    <View style={[styles.statItem, highlight && styles.statItemHighlight]}>
      <View
        style={[
          styles.iconWrap,
          warning && styles.iconWrapWarning,
          highlight && styles.iconWrapHighlight,
        ]}
      >
        <Text style={styles.statIcon}>{icon}</Text>
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
                warning && styles.progressBarWarning,
              ]}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backdropFilter: "blur(10px)",
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
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 10,
  },
  tileHighlight: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  tileIcon: { fontSize: 20, marginBottom: 4 },
  tileIconSmall: { fontSize: 16, marginBottom: 2 },
  tileLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 9,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  tileLabelSmall: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 8,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  tileValue: { color: "#fff", fontSize: 17, fontWeight: "700" },
  tileValueSmall: { color: "#fff", fontSize: 14, fontWeight: "700" },
  tileMax: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: "400" },
  valueRed: { color: "#f87171" },

  progressTile: { alignItems: "center", flex: 1, minWidth: 60 },
  progressCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  progressPct: { color: "#fff", fontSize: 13, fontWeight: "700" },

  roundTile: {
    alignItems: "center",
    flex: 1,
    minWidth: 60,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    padding: 10,
  },
  roundValue: { color: "#fff", fontSize: 26, fontWeight: "700" },

  // Vertical layout (stacked rows)
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
  iconWrapWarning: {
    backgroundColor: "rgba(248, 113, 113, 0.25)",
  },
  iconWrapHighlight: {
    backgroundColor: "rgba(99, 102, 241, 0.25)",
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
  progressBarWarning: {
    backgroundColor: "rgba(248, 113, 113, 0.8)",
  },

  // Tile row (used for compact mode)
  tilesRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  tileCompact: {
    alignItems: "center",
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 10,
    minWidth: 70,
  },
});
