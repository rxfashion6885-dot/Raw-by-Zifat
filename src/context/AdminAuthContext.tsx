import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getAdminToken, setAdminToken, removeAdminToken } from '../services/api.js';

interface AdminUser {
  email: string;
  role: string;
}

interface AdminAuthContextType {
  isAdmin: boolean;
  adminUser: AdminUser | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
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

  const login = async (username: string, pass: string): Promise<boolean> => {
    try {
      const res = await api.adminLogin(username, pass);
      if (res.success && res.token) {
        setAdminToken(res.token);
        setIsAdmin(true);
        setAdminUser({ email: username, role: 'ADMIN' });
        return true;
      }
      return false;
    } catch {
      return false;
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
