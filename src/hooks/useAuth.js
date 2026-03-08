import { useState, useEffect } from "react";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "../lib/supabase";

WebBrowser.maybeCompleteAuthSession();

function getAuthParamsFromUrl(url) {
  if (!url) {
    return {
      accessToken: null,
      refreshToken: null,
      providerError: null,
      providerErrorDescription: null,
    };
  }

  const [withoutHash, hash = ""] = url.split("#");
  const query = withoutHash.includes("?") ? withoutHash.split("?")[1] : "";

  const queryParams = new URLSearchParams(query);
  const hashParams = new URLSearchParams(hash);

  const accessToken =
    queryParams.get("access_token") || hashParams.get("access_token");
  const refreshToken =
    queryParams.get("refresh_token") || hashParams.get("refresh_token");
  const providerError = queryParams.get("error") || hashParams.get("error");
  const providerErrorDescription =
    queryParams.get("error_description") || hashParams.get("error_description");

  return { accessToken, refreshToken, providerError, providerErrorDescription };
}

/**
 * Auth hook — manages Supabase email/password authentication.
 *
 * Returns:
 * - user: current Supabase user or null
 * - loading: true while the initial session is being resolved
 * - signUp(email, password): creates a new account
 * - signIn(email, password): signs in an existing user
 * - signInWithGoogle(): signs in via Google OAuth
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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (err) setError(err.message);
    return !err;
  };

  const signInWithGoogle = async () => {
    setError(null);

    const redirectTo = AuthSession.makeRedirectUri({ path: "auth/callback" });

    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      return false;
    }

    if (!data?.url) {
      setError("Unable to start Google sign in. Please try again.");
      return false;
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

    if (result.type !== "success") {
      setError("Google sign in was cancelled.");
      return false;
    }

    const {
      accessToken,
      refreshToken,
      providerError,
      providerErrorDescription,
    } = getAuthParamsFromUrl(result.url);

    if (providerError) {
      const message = providerErrorDescription
        ? decodeURIComponent(providerErrorDescription)
        : "Google sign in failed. Please try again.";
      setError(message);
      return false;
    }

    if (!accessToken || !refreshToken) {
      setError("Unable to complete Google sign in. Please try again.");
      return false;
    }

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError) {
      setError(sessionError.message);
      return false;
    }

    return true;
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

    const { error: err } = await supabase.rpc("delete_user");

    if (err) {
      let message = err.message || "Unable to delete account right now.";
      if (
        message.includes("Could not find the function public.delete_user") ||
        (message.includes("delete_user") &&
          message.toLowerCase().includes("function"))
      ) {
        message =
          "Delete account is not configured yet. Add a public.delete_user RPC in Supabase.";
      }
      setError(message);
      return { ok: false, error: message };
    }

    const signedOut = await signOut();
    if (!signedOut) {
      const message =
        "Account was deleted, but signing out failed. Please restart the app.";
      setError(message);
      return { ok: false, error: message };
    }

    return { ok: true, error: null };
  };

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    deleteAccount,
  };
}
