import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { canView as baseCanView } from '../utils/permissions';

console.log("Google Client ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);


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
  isLocalAdmin: false,
  toggleLocalAdmin: () => {},
});

const TOKEN_KEY = 'p15_auth_token';
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

const normalizeUser = (incoming) => {
  if (!incoming) return null;
  const unlocked = Array.isArray(incoming.unlockedSecrets) ? incoming.unlockedSecrets : [];
  const favorites = Array.isArray(incoming.favorites) ? incoming.favorites : [];
  const featuredCharacter = incoming.featuredCharacter ?? null;
  const profile = {
    bio: incoming.profile?.bio || '',
    labelOne: incoming.profile?.labelOne || '',
    labelTwo: incoming.profile?.labelTwo || '',
    documents: Array.isArray(incoming.profile?.documents) ? incoming.profile.documents : [],
    viewFavorites: Array.isArray(incoming.profile?.viewFavorites) ? incoming.profile.viewFavorites : [],
  };
  return { ...incoming, unlockedSecrets: unlocked, favorites, featuredCharacter, profile };
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
  const [isLocalAdmin, setIsLocalAdmin] = useState(false);

  const normalizedUser = normalizeUser(user);
  const role = normalizedUser?.role || 'guest';

  useEffect(() => {
    persistToken(token);
  }, [token]);

  useEffect(() => {
    if (!token || isLocalAdmin) {
      setUser(null);
      setLoading(false);
      if (isLocalAdmin) {
        setUser(
          normalizeUser({
            id: 'local-admin',
            name: 'Local Admin',
            email: 'local-admin@example.com',
            role: 'admin',
            favorites: [],
            unlockedSecrets: [],
            profile: {},
          })
        );
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
  }, [token, isLocalAdmin]);

  const login = async ({ email, password }) => {
    setError(null);
    try {
      const data = await request({
        path: '/auth/login',
        method: 'POST',
        body: { email, password },
      });
      setUser(normalizeUser(data.user));
      setToken(data.token);
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const googleLogin = async (credential) => {
    setError(null);
    try {
      const data = await request({
        path: '/auth/google',
        method: 'POST',
        body: { credential },
      });
      setUser(normalizeUser(data.user));
      setToken(data.token);
      return data.user;
    } catch (err) {
      setError(err.message);
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

  const signup = async ({ name, email, password }) => {
    setError(null);
    try {
      await request({
        path: '/auth/signup',
        method: 'POST',
        body: { name, email, password },
      });
      return login({ email, password });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsLocalAdmin(false);
  };

  const refreshUser = async () => {
    if (!token) return null;
    const data = await request({ path: '/auth/me', token });
    setUser(normalizeUser(data.user));
    return data.user;
  };

  const toggleLocalAdmin = () => {
    setIsLocalAdmin((prev) => {
      const next = !prev;
      if (next) {
        setToken('local-admin-token');
        setUser(
          normalizeUser({
            id: 'local-admin',
            name: 'Local Admin',
            email: 'local-admin@example.com',
            role: 'admin',
            favorites: [],
            unlockedSecrets: [],
            profile: {},
          })
        );
        setError(null);
        setLoading(false);
      } else {
        setUser(null);
        setToken(null);
      }
      return next;
    });
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
      googleLogin,
      signup,
      logout,
      refreshUser,
      isSecretUnlocked: (secretId) =>
        Array.isArray(normalizedUser?.unlockedSecrets) && normalizedUser.unlockedSecrets.includes(secretId),
      canView: (config) => baseCanView(normalizedUser, config),
      isLocalAdmin,
      toggleLocalAdmin,
    }),
    [normalizedUser, role, token, loading, error, isLocalAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
