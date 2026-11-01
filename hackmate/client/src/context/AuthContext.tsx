import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, college: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('hackmate_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize and load user profile on startup
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('hackmate_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data && res.data.success) {
            setUser(res.data.user);
          }
        } catch (error) {
          console.error('Session expired or invalid:', error);
          localStorage.removeItem('hackmate_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data && res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('hackmate_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
    }
  };

  const register = async (name: string, email: string, password: string, college: string) => {
    const res = await api.post('/auth/register', { name, email, password, college });
    if (res.data && res.data.success) {
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('hackmate_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
    }
  };

  const logout = () => {
    localStorage.removeItem('hackmate_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data && res.data.success) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        setUser,
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

