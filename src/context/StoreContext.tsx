import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { SiteSettings, Category } from '../types/index.js';
import { api } from '../services/api.js';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface StoreContextType {
  settings: SiteSettings | null;
  categories: Category[];
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  isSupportOpen: boolean;
  openSupport: () => void;
  closeSupport: () => void;
  isDevProfileOpen: boolean;
  openDevProfile: () => void;
  closeDevProfile: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isDevProfileOpen, setIsDevProfileOpen] = useState(false);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshSettings = useCallback(async () => {
    try {
      const [sData, cData] = await Promise.all([api.getSettings(), api.getCategories()]);
      setSettings(sData);
      setCategories(cData);
    } catch (e) {
      console.error('Failed to load store settings', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
    api.trackAnalyticsEvent('page_view');
  }, [refreshSettings]);

  return (
    <StoreContext.Provider
      value={{
        settings,
        categories,
        isLoading,
        refreshSettings,
        toasts,
        showToast,
        removeToast,
        isSupportOpen,
        openSupport: () => setIsSupportOpen(true),
        closeSupport: () => setIsSupportOpen(false),
        isDevProfileOpen,
        openDevProfile: () => setIsDevProfileOpen(true),
        closeDevProfile: () => setIsDevProfileOpen(false),
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
