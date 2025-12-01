import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { normalizeContentList } from '../constants/contentConstants';
import fallbackContent from '../data/content.json';

const ContentContext = createContext(null);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export function ContentProvider({ children }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastLoadedAt, setLastLoadedAt] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/content`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load content.');
      }
      const normalized = normalizeContentList(data.entries || []);
      setEntries(normalized);
      setLastLoadedAt(new Date().toISOString());
    } catch (err) {
      const fallback = normalizeContentList(fallbackContent?.entries || []);
      setEntries(fallback);
      setError(err.message || 'Unable to load content.');
      setLastLoadedAt(new Date().toISOString());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getByType = useCallback(
    (type) => {
      if (!type) return entries;
      const normalized = String(type).toLowerCase();
      return entries.filter((entry) => String(entry.type).toLowerCase() === normalized);
    },
    [entries]
  );

  const getById = useCallback(
    (id) => entries.find((entry) => String(entry.id) === String(id)) || null,
    [entries]
  );

  const availableTypes = useMemo(() => {
    const set = new Set();
    entries.forEach((entry) => {
      if (entry.type) {
        set.add(String(entry.type).toLowerCase());
      }
    });
    return Array.from(set);
  }, [entries]);

  const value = useMemo(
    () => ({
      entries,
      loading,
      error,
      lastLoadedAt,
      refresh,
      getByType,
      getById,
      availableTypes,
    }),
    [entries, loading, error, lastLoadedAt, refresh, getByType, getById, availableTypes]
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
}

