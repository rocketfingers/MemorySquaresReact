import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const LOCAL_HISTORY_KEY = 'gameHistory';

/**
 * Game history hook — dual-mode storage mirroring historyComposable.
 *
 * - Authenticated users: Supabase (games_history table)
 * - Guest users: AsyncStorage
 *
 * Returns:
 * - history: array of game records
 * - addGameToHistory(round, time, totalGameTime, result): add a record
 * - clearGameHistory(): remove all records
 * - refreshHistory(): manually reload
 */
export function useHistory(user) {
  const [history, setHistory] = useState([]);
  const subscriptionRef = useRef(null);

  // Load local history from AsyncStorage
  const loadLocalHistory = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(LOCAL_HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(Array.isArray(parsed) ? parsed : []);
      } else {
        setHistory([]);
      }
    } catch {
      setHistory([]);
    }
  }, []);

  // Load cloud history from Supabase
  const loadCloudHistory = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('games_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setHistory(data);
    }
  }, []);

  // Subscribe to real-time updates from Supabase
  const subscribeToCloud = useCallback((userId) => {
    // Clean up previous subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    const channel = supabase
      .channel('games_history_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games_history',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadCloudHistory(userId);
        }
      )
      .subscribe();

    subscriptionRef.current = channel;
  }, [loadCloudHistory]);

  // React to auth state changes
  useEffect(() => {
    if (user) {
      loadCloudHistory(user.id);
      subscribeToCloud(user.id);
    } else {
      // Unsubscribe from cloud if logged out
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      loadLocalHistory();
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [user, loadCloudHistory, loadLocalHistory, subscribeToCloud]);

  const addGameToHistory = useCallback(async (round, time, totalGameTime, result) => {
    if (user) {
      await supabase.from('games_history').insert({
        user_id: user.id,
        round,
        time,
        total_game_time: totalGameTime,
        result,
      });
      // Real-time subscription will update history automatically
    } else {
      const newEntry = {
        round,
        time,
        total_game_time: totalGameTime,
        result,
        created_at: new Date().toISOString(),
      };
      const updated = [newEntry, ...history];
      setHistory(updated);
      try {
        await AsyncStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
    }
  }, [user, history]);

  const clearGameHistory = useCallback(async () => {
    if (user) {
      await supabase
        .from('games_history')
        .delete()
        .eq('user_id', user.id);
    }
    // Always clear local storage
    try {
      await AsyncStorage.removeItem(LOCAL_HISTORY_KEY);
    } catch {
      // ignore
    }
    setHistory([]);
  }, [user]);

  const refreshHistory = useCallback(() => {
    if (user) {
      loadCloudHistory(user.id);
    } else {
      loadLocalHistory();
    }
  }, [user, loadCloudHistory, loadLocalHistory]);

  return { history, addGameToHistory, clearGameHistory, refreshHistory };
}
