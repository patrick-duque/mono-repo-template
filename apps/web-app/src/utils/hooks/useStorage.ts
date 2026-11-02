import { useCallback } from 'react';

type StorageValue = string | null;

const useStorage = () => {
  const getItem = useCallback((key: string): StorageValue => {
    if (typeof window === 'undefined') return null;

    return window.localStorage.getItem(key);
  }, []);

  const setItem = useCallback((key: string, value: string) => {
    if (typeof window === 'undefined') return;

    window.localStorage.setItem(key, value);
  }, []);

  const removeItem = useCallback((key: string) => {
    if (typeof window === 'undefined') return;

    window.localStorage.removeItem(key);
  }, []);

  return {
    getItem,
    removeItem,
    setItem,
  };
};

export default useStorage;
