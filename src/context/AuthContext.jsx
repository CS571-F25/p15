import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { canView as baseCanView } from '../utils/permissions';
import { supabase, getSupabaseRedirectUrl } from '../lib/supabaseClient';

const AuthContext = createContext({
  user: null,
  role: 'guest',
  token: null,
  loading: false,
  login: async () => {},
  updateAccount: async () => {},
  googleLogin: async () => {},
  signup: async () => {},
  logout: () => {},
  refreshUser: async () => {},
  isSecretUnlocked: () => false,
  canView: () => false,
});

const TOKEN_KEY = 'p15_auth_token';
const PENDING_PROFILE_KEY = 'p15_supabase_profile';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const getStoredToken = () => {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(TOKEN_KEY);
};

const persistToken = (token) => {
  if (!isBrowser()) return;
  if (!token) {
    window.localStorage.removeItem(TOKEN_KEY);
  } else {
    window.localStorage.setItem(TOKEN_KEY, token);
  }
};

const getPendingProfile = () => {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(PENDING_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const setPendingProfile = (profile) => {
  if (!isBrowser()) return;
  if (!profile) {
    window.localStorage.removeItem(PENDING_PROFILE_KEY);
  } else {
    window.localStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify(profile));
  }
};

const normalizeUser = (incoming) => {
  if (!incoming) return null;
  const unlocked = Array.isArray(incoming.unlockedSecrets) ? incoming.unlockedSecrets : [];
  const favorites = Array.isArray(incoming.favorites) ? incoming.favorites : [];
  const featuredCharacter = incoming.featuredCharacter ?? null;
  const friends = Array.isArray(incoming.friends) ? incoming.friends : [];
  const friendRequests = {
    incoming: Array.isArray(incoming.friendRequests?.incoming) ? incoming.friendRequests.incoming : [],
    outgoing: Array.isArray(incoming.friendRequests?.outgoing) ? incoming.friendRequests.outgoing : [],
  };
  const profile = {
    bio: incoming.profile?.bio || '',
    labelOne: incoming.profile?.labelOne || '',
    labelTwo: incoming.profile?.labelTwo || '',
    documents: Array.isArray(incoming.profile?.documents) ? incoming.profile.documents : [],
    viewFavorites: Array.isArray(incoming.profile?.viewFavorites) ? incoming.profile.viewFavorites : [],
  };
  return { ...incoming, unlockedSecrets: unlocked, favorites, featuredCharacter, profile, friends, friendRequests };
};

async function request({ path, method = 'GET', body, headers = {}, token }) {
  const init = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };
  if (body !== undefined) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  if (token) {
    init.headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Request failed.');
  }
  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getStoredToken());
  const [loading, setLoading] = useState(Boolean(getStoredToken()));
  const [error, setError] = useState(null);

  const normalizedUser = normalizeUser(user);
  const role = normalizedUser?.role || 'guest';

  useEffect(() => {
    persistToken(token);
  }, [token]);

  const syncSupabaseSession = useCallback(
    async (session) => {
      if (!session?.access_token) {
        setUser(null);
        setToken(null);
        return;
      }
      setError(null);
      try {
        setLoading(true);
        const pendingProfile = getPendingProfile();
        const data = await request({
          path: '/auth/supabase',
          method: 'POST',
          body: {
            accessToken: session.access_token,
            displayName: pendingProfile?.displayName || '',
          },
        });
        if (pendingProfile) {
          setPendingProfile(null);
        }
        setUser(normalizeUser(data.user));
        setToken(data.token);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!supabase) return undefined;
    let isMounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      if (data?.session) {
        syncSupabaseSession(data.session);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      syncSupabaseSession(session);
    });
    return () => {
      isMounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, [syncSupabaseSession]);

  useEffect(() => {
    if (!token || token === 'local-admin-token') {
      setUser(null);
      setLoading(false);
      if (token === 'local-admin-token') {
        setToken(null);
      }
      return;
    }
    let isMounted = true;
    setLoading(true);
    request({ path: '/auth/me', token })
      .then((data) => {
        if (isMounted) {
          setUser(normalizeUser(data.user));
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
          setToken(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = async ({ email, password } = {}) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }
    if (!email || !password) {
      throw new Error('Email and password are required.');
    }
    setError(null);
    try {
      const { error: supabaseError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (supabaseError) {
        throw supabaseError;
      }
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const startGoogleLogin = async ({ displayName } = {}) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }
    if (displayName) {
      setPendingProfile({ displayName });
    } else {
      setPendingProfile(null);
    }
    const redirectTo = getSupabaseRedirectUrl();
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });
      if (error) {
        throw error;
      }
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Supabase did not provide a login URL.');
      }
    } catch (err) {
      setPendingProfile(null);
      setError(err.message || 'Unable to start Supabase login.');
      throw err;
    }
  };

  const updateAccount = async ({ username, profilePicture, profile }) => {
    if (!token) {
      throw new Error('You must be logged in to update your account.');
    }
    setError(null);
    try {
      const data = await request({
        path: '/auth/me',
        method: 'PUT',
        body: { username, profilePicture, profile },
        token,
      });
      setUser(normalizeUser(data.user));
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const signup = async ({ email, password, displayName } = {}) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.');
    }
    if (!email || !password || !displayName || !displayName.trim()) {
      throw new Error('Email, password, and display name are required.');
    }
    setError(null);
    const trimmedName = displayName.trim();
    setPendingProfile({ displayName: trimmedName });
    try {
      const { error: supabaseError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { display_name: trimmedName },
          emailRedirectTo: getSupabaseRedirectUrl(),
        },
      });
      if (supabaseError) {
        throw supabaseError;
      }
      return true;
    } catch (err) {
      setPendingProfile(null);
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    supabase?.auth.signOut();
    setUser(null);
    setToken(null);
  };

  const refreshUser = async () => {
    if (!token) return null;
    const data = await request({ path: '/auth/me', token });
    setUser(normalizeUser(data.user));
    return data.user;
  };

  const value = useMemo(
    () => ({
      user: normalizedUser,
      role,
      token,
      loading,
      error,
      login,
      updateAccount,
      googleLogin: startGoogleLogin,
      signup,
      logout,
      refreshUser,
      isSecretUnlocked: (secretId) =>
        Array.isArray(normalizedUser?.unlockedSecrets) && normalizedUser.unlockedSecrets.includes(secretId),
      canView: (config) => baseCanView(normalizedUser, config),
    }),
    [normalizedUser, role, token, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
