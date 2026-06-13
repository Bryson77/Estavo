import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { setOnAuthError } from "../lib/api";

const TOKEN_KEY = "@estavo_token";
const USER_KEY = "@estavo_user";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  unitNumber: string | null;
  accountStanding: "good" | "arrears";
  estateId: string;
  estateName: string;
  estateAddress: string;
  phone?: string;
}

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  isLoaded: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch {
      } finally {
        setIsLoaded(true);
      }
    }
    load();
  }, []);

  const login = useCallback(async (newToken: string, newUser: AuthUser) => {
    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, newToken),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser)),
    ]);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    // Invalidate Supabase session server-side first
    if (token) {
      try {
        const { apiClient } = await import("../lib/api");
        await apiClient.logout(token);
      } catch {
        // Never block logout on API failure
      }
    }
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ]);
    setToken(null);
    setUser(null);
  }, [token]);

  useEffect(() => {
    setOnAuthError(() => {
      Alert.alert("Session Expired", "Your session is invalid or has expired. Please log in again.");
      logout();
    });
  }, [logout]);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const { apiClient } = await import("../lib/api");
      const fresh = await apiClient.getMe(token);
      setUser(fresh);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(fresh));
    } catch {
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{
      token,
      user,
      isLoaded,
      isAuthenticated: !!token && !!user,
      login,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
