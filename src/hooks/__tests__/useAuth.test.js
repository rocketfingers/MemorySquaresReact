import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useAuth } from "../useAuth";

const mockGetSession = jest.fn();
const mockOnAuthStateChange = jest.fn();
const mockSignUp = jest.fn();
const mockSignInWithPassword = jest.fn();
const mockSignInWithOAuth = jest.fn();
const mockSetSession = jest.fn();
const mockSignOut = jest.fn();
const mockRpc = jest.fn();
const mockUnsubscribe = jest.fn();
const mockOpenAuthSessionAsync = jest.fn();

jest.mock("expo-auth-session", () => ({
  makeRedirectUri: jest.fn(() => "memorysquares://auth/callback"),
}));

jest.mock("expo-web-browser", () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: (...args) => mockOpenAuthSessionAsync(...args),
}));

jest.mock("../../lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: (...args) => mockGetSession(...args),
      onAuthStateChange: (...args) => mockOnAuthStateChange(...args),
      signUp: (...args) => mockSignUp(...args),
      signInWithPassword: (...args) => mockSignInWithPassword(...args),
      signInWithOAuth: (...args) => mockSignInWithOAuth(...args),
      setSession: (...args) => mockSetSession(...args),
      signOut: (...args) => mockSignOut(...args),
    },
    rpc: (...args) => mockRpc(...args),
  },
}));

describe("useAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "u1" } } },
    });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });
    mockSignUp.mockResolvedValue({ error: null });
    mockSignInWithPassword.mockResolvedValue({ error: null });
    mockSignInWithOAuth.mockResolvedValue({
      data: { url: "https://example.com/auth" },
      error: null,
    });
    mockSetSession.mockResolvedValue({ error: null });
    mockSignOut.mockResolvedValue({ error: null });
    mockRpc.mockResolvedValue({ error: null });
    mockOpenAuthSessionAsync.mockResolvedValue({
      type: "success",
      url: "memorysquares://auth/callback#access_token=a&refresh_token=r",
    });
  });

  it("loads current user from session", async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual({ id: "u1" });
  });

  it("returns false and sets error when sign in fails", async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      error: { message: "Bad credentials" },
    });
    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let ok;
    await act(async () => {
      ok = await result.current.signIn("x@test.com", "wrong");
    });

    expect(ok).toBe(false);
    expect(result.current.error).toBe("Bad credentials");
  });

  it("signs out and clears user", async () => {
    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.loading).toBe(false));

    let ok;
    await act(async () => {
      ok = await result.current.signOut();
    });

    expect(ok).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it("signs in with Google OAuth", async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let ok;
    await act(async () => {
      ok = await result.current.signInWithGoogle();
    });

    expect(ok).toBe(true);
    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: "memorysquares://auth/callback",
        skipBrowserRedirect: true,
      },
    });
    expect(mockSetSession).toHaveBeenCalledWith({
      access_token: "a",
      refresh_token: "r",
    });
  });

  it("returns false and sets error when Google OAuth is cancelled", async () => {
    mockOpenAuthSessionAsync.mockResolvedValueOnce({ type: "cancel" });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let ok;
    await act(async () => {
      ok = await result.current.signInWithGoogle();
    });

    expect(ok).toBe(false);
    expect(result.current.error).toBe("Google sign in was cancelled.");
  });

  it("maps missing delete_user function to friendly message", async () => {
    mockRpc.mockResolvedValueOnce({
      error: { message: "Could not find the function public.delete_user" },
    });

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let response;
    await act(async () => {
      response = await result.current.deleteAccount();
    });

    expect(response.ok).toBe(false);
    expect(response.error).toContain("Delete account is not configured yet");
  });
});
