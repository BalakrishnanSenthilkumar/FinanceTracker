/**
 * Authentication Hook
 * Provides easy access to auth state and actions
 */
import { useState, useEffect, useCallback } from 'react';
import {
  getCurrentUser,
  isAuthenticated,
  logoutUser,
  User,
} from '../db/usersDB';

interface AuthState {
  user: Omit<User, 'password' | 'salt'> | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface UseAuthReturn extends AuthState {
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

/**
 * Hook for managing authentication state
 *
 * @example
 * const { user, isAuthenticated, logout } = useAuth();
 *
 * if (!isAuthenticated) {
 *   return <LoginScreen />;
 * }
 */
export const useAuth = (): UseAuthReturn => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const checkAuth = useCallback(async () => {
    try {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        const user = await getCurrentUser();
        setState({
          user,
          isLoading: false,
          isAuthenticated: !!user,
        });
      } else {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    await logoutUser();
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  const refreshUser = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  return {
    ...state,
    logout,
    refreshUser,
  };
};

export default useAuth;

