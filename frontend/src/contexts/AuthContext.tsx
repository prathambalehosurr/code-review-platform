import React, { createContext, useCallback, useEffect, useState } from 'react';
import { authService } from '../services/auth.service';
import type { User } from '../types/user';

type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

type AuthContextType = AuthState & {
  login: () => void;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const fetchUser = useCallback(async () => {
    try {
      const user = await authService.getMe();
      setState({ user, isLoading: false, isAuthenticated: true });
    } catch {
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(() => {
    window.location.href = authService.getGithubLoginUrl();
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setState({ user: null, isLoading: false, isAuthenticated: false });
      window.location.href = '/login';
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refetch }}>
      {children}
    </AuthContext.Provider>
  );
};
