import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { useHistory } from '../hooks/useHistory';
import { useGameStatusStore } from '../stores/gameStatusStore';
import { gameResults } from '../constants/gameResult';

const PAGE_SIZE = 7;

function formatDate(createdAt) {
  if (!createdAt) return '';
  try {
    return new Date(createdAt).toLocaleString([], {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function HistoryScreen({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { history, clearGameHistory } = useHistory(user);
  const resetGame = useGameStatusStore((s) => s.resetGame);
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(history.length / PAGE_SIZE);
  const pageData = history.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleClear = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to wipe all your records? This cannot be undone.',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            resetGame();
            await clearGameHistory();
          },
        },
      ]
    );
  };

  const renderRow = ({ item, index }) => {
    const isWin = item.result === gameResults.WIN;
    return (
      <View style={[styles.row, index % 2 === 0 ? { backgroundColor: colors.surface } : { backgroundColor: colors.background }]}>
        <Text style={[styles.cell, styles.cellRound, { color: colors.text }]}>{item.round}</Text>
        <Text style={[styles.cell, { color: colors.text }]}>{item.time ?? item.gameTime ?? '-'}s</Text>
        <View style={styles.cell}>
          <View style={[styles.badge, isWin ? styles.badgeWin : styles.badgeLoss]}>
            <Text style={[styles.badgeText, isWin ? styles.badgeTextWin : styles.badgeTextLoss]}>
              {isWin ? 'Win' : 'Loss'}
            </Text>
          </View>
        </View>
        <Text style={[styles.cell, styles.cellDate, { color: colors.textSecondary }]}>
          {formatDate(item.created_at)}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.gradientStart }]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>⏱  Game History</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {history.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🕰</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No games played yet</Text>
              <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
                Complete a level to see your history
              </Text>
            </View>
          ) : (
            <>
              {/* Table header */}
              <View style={[styles.row, styles.tableHeader, { backgroundColor: colors.primary }]}>
                <Text style={[styles.cell, styles.cellRound, styles.headerCell]}>Round</Text>
                <Text style={[styles.cell, styles.headerCell]}>Time</Text>
                <Text style={[styles.cell, styles.headerCell]}>Result</Text>
                <Text style={[styles.cell, styles.cellDate, styles.headerCell]}>Finished</Text>
              </View>

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
                    style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
                  >
                    <Text style={[styles.pageBtnText, { color: colors.primary }]}>‹ Prev</Text>
                  </TouchableOpacity>
                  <Text style={[styles.pageInfo, { color: colors.textSecondary }]}>
                    {page} / {totalPages}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]}
                  >
                    <Text style={[styles.pageBtnText, { color: colors.primary }]}>Next ›</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Clear history */}
              <View style={[styles.footer, { borderTopColor: colors.border }]}>
                <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
                  <Text style={styles.clearText}>🗑  Clear History</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1, padding: 16 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backBtn: { width: 60 },
  backText: { color: 'rgba(255,255,255,0.9)', fontSize: 15 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },

  card: { borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 6 }, shadowRadius: 20, elevation: 6 },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12 },
  tableHeader: { paddingVertical: 12 },
  headerCell: { color: '#fff', fontWeight: '700', fontSize: 13 },
  cell: { flex: 1, fontSize: 13 },
  cellRound: { flex: 0.6 },
  cellDate: { flex: 1.8, fontSize: 11 },

  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  badgeWin: { backgroundColor: '#e8f5e9' },
  badgeLoss: { backgroundColor: '#ffebee' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  badgeTextWin: { color: '#2e7d32' },
  badgeTextLoss: { color: '#c62828' },

  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 20 },
  pageBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  pageBtnDisabled: { opacity: 0.3 },
  pageBtnText: { fontSize: 15, fontWeight: '600' },
  pageInfo: { fontSize: 14 },

  footer: { borderTopWidth: 1, padding: 12, alignItems: 'flex-end' },
  clearBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  clearText: { color: '#e05252', fontSize: 14, fontWeight: '600' },

  empty: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 60, marginBottom: 12, opacity: 0.5 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 6 },
  emptyHint: { fontSize: 14, textAlign: 'center' },
});
