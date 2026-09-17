import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; full_name: string; password: string; phone?: string }) => Promise<void>;
  demoLogin: (role?: 'CUSTOMER' | 'ADMIN') => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('smartbank_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('smartbank_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('smartbank_token');
      if (storedToken) {
        try {
          const profile = await api.getProfile();
          setUser(profile);
          localStorage.setItem('smartbank_user', JSON.stringify(profile));
        } catch {
          api.clearToken();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await api.login(credentials);
      setUser(res.user);
      setToken(res.access_token);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { email: string; full_name: string; password: string; phone?: string }) => {
    setLoading(true);
    try {
      const res = await api.register(data);
      setUser(res.user);
      setToken(res.access_token);
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role: 'CUSTOMER' | 'ADMIN' = 'CUSTOMER') => {
    setLoading(true);
    try {
      const res = await api.demoLogin(role);
      setUser(res.user);
      setToken(res.access_token);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
    setToken(null);
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const profile = await api.getProfile();
        setUser(profile);
        localStorage.setItem('smartbank_user', JSON.stringify(profile));
      } catch (e) {
        console.error('Failed to refresh user profile', e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === 'ADMIN',
        loading,
        login,
        register,
        demoLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
