import { useStore } from "../store";

/**
 * Custom hook for auth operations
 * Provides convenient access to auth state and methods
 */
export function useAuth() {
  const {
    user,
    isAuthenticated,
    authLoading,
    login,
    signup,
    logout,
    checkAuth,
  } = useStore();

  return {
    // State
    user,
    isAuthenticated,
    authLoading,
    isLoggedIn: isAuthenticated,

    // Methods
    login,
    signup,
    logout,
    checkAuth,
  };
}
