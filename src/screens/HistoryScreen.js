import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../theme/ThemeContext";
import { useAuth } from "../hooks/useAuth";
import { useHistory } from "../hooks/useHistory";
import { useGameStatusStore } from "../stores/gameStatusStore";
import { gameResults } from "../constants/gameResult";
import ActionDialog from "../components/ActionDialog";

const PAGE_SIZE = 7;

function formatDate(createdAt) {
  if (!createdAt) return "";
  try {
    return new Date(createdAt).toLocaleString([], {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function HistoryScreen({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { history, clearGameHistory } = useHistory(user);
  const resetGame = useGameStatusStore((s) => s.resetGame);
  const [page, setPage] = useState(1);
  const [dialogState, setDialogState] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
    ]).start();
  }, []);

  const totalPages = Math.ceil(history.length / PAGE_SIZE);
  const pageData = history.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleClear = () => {
    const performClear = async () => {
      resetGame();
      await clearGameHistory();
    };

    setDialogState({
      title: "Clear History",
      message: "Are you sure you want to wipe all your records? This cannot be undone.",
      confirmText: "Clear All",
      cancelText: "Keep",
      showCancel: true,
      destructive: true,
      onConfirm: () => {
        setDialogState(null);
        void performClear();
      },
      onCancel: () => setDialogState(null),
    });
  };

  const renderRow = ({ item, index }) => {
    const isWin = item.result === gameResults.WIN;
    const evenRowBackground = colors.surface;
    const oddRowBackground =
      colors.card === colors.surface ? "rgba(99, 102, 241, 0.06)" : colors.card;

    return (
      <Animated.View
        style={[
          styles.row,
          {
            backgroundColor:
              index % 2 === 0 ? evenRowBackground : oddRowBackground,
            opacity: fadeAnim,
          },
        ]}
      >
        <Text
          style={[
            styles.cell,
            styles.cellRound,
            styles.valueCell,
            { color: colors.text },
          ]}
        >
          {item.round}
        </Text>
        <Text style={[styles.cell, styles.valueCell, { color: colors.text }]}>
          {item.time ?? item.gameTime ?? "-"}s
        </Text>
        <View style={styles.cell}>
          <View
            style={[styles.badge, isWin ? styles.badgeWin : styles.badgeLoss]}
          >
            <Text style={isWin ? styles.badgeIconWin : styles.badgeIconLoss}>
              {isWin ? "✓" : "✕"}
            </Text>
            <Text
              style={[
                styles.badgeText,
                isWin ? styles.badgeTextWin : styles.badgeTextLoss,
              ]}
            >
              {isWin ? "Win" : "Loss"}
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.cell,
            styles.cellDate,
            { color: colors.textSecondary },
          ]}
        >
          {formatDate(item.created_at)}
        </Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>⏱ Game History</Text>
          <View style={{ width: 60 }} />
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {history.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIconWrap}>
                <Text style={styles.emptyIcon}>🕰</Text>
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No games played yet
              </Text>
              <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
                Complete a level to see your history
              </Text>
            </View>
          ) : (
            <>
              {/* Table header */}
              <LinearGradient
                colors={[colors.primary, colors.primaryDark || colors.primary]}
                style={styles.tableHeader}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text
                  style={[styles.cell, styles.cellRound, styles.headerCell]}
                >
                  Round
                </Text>
                <Text style={[styles.cell, styles.headerCell]}>Time</Text>
                <Text style={[styles.cell, styles.headerCell]}>Result</Text>
                <Text style={[styles.cell, styles.cellDate, styles.headerCell]}>
                  Finished
                </Text>
              </LinearGradient>

              <FlatList
                data={pageData}
                keyExtractor={(_, i) => String((page - 1) * PAGE_SIZE + i)}
                renderItem={renderRow}
                scrollEnabled={false}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <View style={styles.pagination}>
                  <TouchableOpacity
                    onPress={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={[
                      styles.pageBtn,
                      page === 1 && styles.pageBtnDisabled,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.pageBtnText}>‹ Prev</Text>
                  </TouchableOpacity>
                  <View style={styles.pageIndicator}>
                    <Text style={styles.pageCurrent}>{page}</Text>
                    <Text style={styles.pageSeparator}>/</Text>
                    <Text style={styles.pageTotal}>{totalPages}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={[
                      styles.pageBtn,
                      page === totalPages && styles.pageBtnDisabled,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.pageBtnText}>Next ›</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Clear history */}
              <View style={[styles.footer, { borderTopColor: colors.border }]}>
                <TouchableOpacity
                  onPress={handleClear}
                  style={styles.clearBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.clearText}>🗑 Clear History</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Animated.View>
      </SafeAreaView>

      <ActionDialog
        visible={Boolean(dialogState)}
        title={dialogState?.title || ""}
        message={dialogState?.message || ""}
        confirmText={dialogState?.confirmText || "OK"}
        cancelText={dialogState?.cancelText || "Cancel"}
        showCancel={dialogState?.showCancel ?? true}
        destructive={dialogState?.destructive ?? false}
        onConfirm={dialogState?.onConfirm || (() => setDialogState(null))}
        onCancel={dialogState?.onCancel || (() => setDialogState(null))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  gradient: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  safeArea: { flex: 1, padding: 16 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backBtn: { width: 60, padding: 8 },
  backText: { color: "rgba(255,255,255,0.9)", fontSize: 15, fontWeight: "600" },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  card: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 30,
    elevation: 10,
    backgroundColor: "rgba(255,255,255,0.95)",
  },

  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  headerCell: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.3,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  cell: { flex: 1, fontSize: 14 },
  cellRound: { flex: 0.6, fontWeight: "600" },
  valueCell: { fontWeight: "600", color: "#1f2937" },
  cellDate: { flex: 1.8, fontSize: 12 },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  badgeWin: { backgroundColor: "rgba(16, 185, 129, 0.15)" },
  badgeLoss: { backgroundColor: "rgba(239, 68, 68, 0.15)" },
  badgeIconWin: {
    color: "#10b981",
    fontSize: 12,
    fontWeight: "700",
    marginRight: 4,
  },
  badgeIconLoss: {
    color: "#ef4444",
    fontSize: 12,
    fontWeight: "700",
    marginRight: 4,
  },
  badgeText: { fontSize: 12, fontWeight: "600" },
  badgeTextWin: { color: "#10b981" },
  badgeTextLoss: { color: "#ef4444" },

  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 20,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  pageBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    borderRadius: 20,
  },
  pageBtnDisabled: { opacity: 0.3 },
  pageBtnText: { fontSize: 14, fontWeight: "600", color: "#6366f1" },
  pageIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  pageCurrent: { fontSize: 16, fontWeight: "700", color: "#6366f1" },
  pageSeparator: { fontSize: 14, color: "#94a3b8", marginHorizontal: 6 },
  pageTotal: { fontSize: 16, fontWeight: "600", color: "#64748b" },

  footer: { borderTopWidth: 1, padding: 16, alignItems: "center" },
  clearBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 20,
  },
  clearText: { color: "#ef4444", fontSize: 14, fontWeight: "600" },

  empty: { alignItems: "center", padding: 50 },
  emptyIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyIcon: { fontSize: 48, opacity: 0.8 },
  emptyTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  emptyHint: { fontSize: 15, textAlign: "center" },
});
