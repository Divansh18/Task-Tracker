/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, getCurrentUser, signIn, signUp } from "@/lib/api-client";
import { AuthResponse, User } from "@/types";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isHydrating: boolean;
  isSubmitting: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (payload: { email: string; password: string; displayName?: string }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_STORAGE_KEY = "task-tracker:token";
const USER_STORAGE_KEY = "task-tracker:user";

interface AuthProviderProps {
  children: ReactNode;
}

function persistAuth(auth: AuthResponse) {
  localStorage.setItem(TOKEN_STORAGE_KEY, auth.accessToken);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(auth.user));
}

function clearPersistedAuth() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        clearPersistedAuth();
      }
    }

    setIsHydrating(false);
  }, []);

  const handleAuthSuccess = (auth: AuthResponse) => {
    persistAuth(auth);
    setToken(auth.accessToken);
    setUser(auth.user);
  };

  const login = async (credentials: { email: string; password: string }) => {
    setIsSubmitting(true);
    try {
      const auth = await signIn(credentials);
      handleAuthSuccess(auth);
      router.replace("/today");
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error("Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const register = async (payload: { email: string; password: string; displayName?: string }) => {
    setIsSubmitting(true);
    try {
      const auth = await signUp(payload);
      handleAuthSuccess(auth);
      router.replace("/today");
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error("Unable to sign up. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = () => {
    clearPersistedAuth();
    setToken(null);
    setUser(null);
    router.replace("/login");
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const profile = await getCurrentUser(token);
      setUser(profile);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout();
      }
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isHydrating,
      isSubmitting,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, token, isHydrating, isSubmitting],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

