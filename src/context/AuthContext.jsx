import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { canView as baseCanView } from '../utils/permissions';

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

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

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

async function request({ path, method = 'GET', body, headers = {} }) {
  const init = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include',
  };
  if (body !== undefined) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json().catch(() => ({})) : {};
  if (!response.ok) {
    throw new Error(data.error || 'Request failed.');
  }
  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizedUser = normalizeUser(user);
  const role = normalizedUser?.role || 'guest';

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    request({ path: '/auth/me' })
      .then((data) => {
        if (isMounted) {
          setUser(normalizeUser(data.user));
          setToken('session-cookie');
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
  }, []);

  const startOAuth = useCallback(({ provider } = {}) => {
    const query = provider ? `?provider=${encodeURIComponent(provider)}` : '';
    window.location.href = `${API_BASE_URL}/auth/login${query}`;
  }, []);

  const updateAccount = async ({ username, profilePicture, profile }) => {
    setError(null);
    try {
      const data = await request({
        path: '/auth/me',
        method: 'PUT',
        body: { username, profilePicture, profile },
      });
      setUser(normalizeUser(data.user));
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const signup = async () => startOAuth({});
  const login = async () => startOAuth({});

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch {
      // ignore network errors on logout
    } finally {
      setUser(null);
      setToken(null);
    }
  }, []);

  const refreshUser = async () => {
    const data = await request({ path: '/auth/me' });
    setUser(normalizeUser(data.user));
    setToken('session-cookie');
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
      googleLogin: startOAuth,
      signup,
      logout,
      refreshUser,
      isSecretUnlocked: (secretId) =>
        Array.isArray(normalizedUser?.unlockedSecrets) && normalizedUser.unlockedSecrets.includes(secretId),
      canView: (config) => baseCanView(normalizedUser, config),
    }),
    [normalizedUser, role, token, loading, error, startOAuth, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
