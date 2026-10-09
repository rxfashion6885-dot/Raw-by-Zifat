import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getAdminToken, setAdminToken, removeAdminToken } from '../services/api.js';

interface AdminUser {
  username?: string;
  email: string;
  role: string;
}

interface AdminAuthContextType {
  isAdmin: boolean;
  adminUser: AdminUser | null;
  isLoading: boolean;
  login: (username: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    api
      .adminVerifyMe()
      .then((data) => {
        if (data.authenticated && data.user) {
          setIsAdmin(true);
          setAdminUser(data.user);
        } else {
          removeAdminToken();
        }
      })
      .catch(() => {
        removeAdminToken();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (username: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.adminLogin(username, pass);
      if (res.success && res.token) {
        setAdminToken(res.token);
        setIsAdmin(true);
        setAdminUser({ username: 'admin12', email: 'admin12', role: 'SUPER_ADMIN' });
        return { success: true };
      }
      return { success: false, error: 'Invalid username or password' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await api.adminLogout();
    } finally {
      removeAdminToken();
      setIsAdmin(false);
      setAdminUser(null);
    }
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAdmin,
        adminUser,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  return context;
};
