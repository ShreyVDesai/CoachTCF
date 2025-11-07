/**
 * Authentication Context Provider
 */

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUser, setUser, removeToken } from './api';

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setAuthUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  setAuthUser: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setAuthUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = getUser();
    if (storedUser) {
      setAuthUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const handleSetUser = (user: User | null) => {
    setAuthUser(user);
    if (user) {
      setUser(user);
    }
  };

  const logout = () => {
    setAuthUser(null);
    removeToken();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, setAuthUser: handleSetUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

