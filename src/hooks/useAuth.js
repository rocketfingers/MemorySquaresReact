import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Auth hook — manages Supabase email/password authentication.
 *
 * Returns:
 * - user: current Supabase user or null
 * - loading: true while the initial session is being resolved
 * - signUp(email, password): creates a new account
 * - signIn(email, password): signs in an existing user
 * - signOut(): signs out the current user
 * - deleteAccount(): deletes the signed-in account (requires delete_user RPC)
 * - error: last auth error message or null
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Resolve initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    setError(null);
    const { error: err } = await supabase.auth.signUp({ email, password });
    if (err) setError(err.message);
    return !err;
  };

  const signIn = async (email, password) => {
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError(err.message);
    return !err;
  };

  const signOut = async () => {
    setError(null);
    const { error: err } = await supabase.auth.signOut();
    if (err) {
      setError(err.message);
      return false;
    }
    setUser(null);
    return true;
  };

  const deleteAccount = async () => {
    setError(null);

    const { error: err } = await supabase.rpc('delete_user');

    if (err) {
      let message = err.message || 'Unable to delete account right now.';
      if (
        message.includes('Could not find the function public.delete_user') ||
        (message.includes('delete_user') && message.toLowerCase().includes('function'))
      ) {
        message =
          'Delete account is not configured yet. Add a public.delete_user RPC in Supabase.';
      }
      setError(message);
      return { ok: false, error: message };
    }

    const signedOut = await signOut();
    if (!signedOut) {
      const message = 'Account was deleted, but signing out failed. Please restart the app.';
      setError(message);
      return { ok: false, error: message };
    }

    return { ok: true, error: null };
  };

  return { user, loading, error, signUp, signIn, signOut, deleteAccount };
}
