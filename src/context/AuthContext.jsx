import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext({
  user: null,
  role: 'guest',
  token: null,
  loading: false,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  refreshUser: async () => {},
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

  const role = user?.role || 'guest';

  useEffect(() => {
    persistToken(token);
  }, [token]);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    let isMounted = true;
    setLoading(true);
    request({ path: '/auth/me', token })
      .then((data) => {
        if (isMounted) {
          setUser(data.user);
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

  const login = async ({ email, password }) => {
    setError(null);
    try {
      const data = await request({
        path: '/auth/login',
        method: 'POST',
        body: { email, password },
      });
      setUser(data.user);
      setToken(data.token);
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
  };

  const refreshUser = async () => {
    if (!token) return null;
    const data = await request({ path: '/auth/me', token });
    setUser(data.user);
    return data.user;
  };

  const value = useMemo(
    () => ({
      user,
      role,
      token,
      loading,
      error,
      login,
      signup,
      logout,
      refreshUser,
    }),
    [user, role, token, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
