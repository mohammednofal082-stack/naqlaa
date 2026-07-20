"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { UserRole } from "@careerlink/shared";
import type { SessionPayload } from "@/lib/auth/session";

interface AppContextType {
  user: SessionPayload | null;
  loading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<{ error?: string; redirect?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = async (email: string, password: string, role?: UserRole) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.error };
    setUser(data.user);
    return { redirect: data.redirect };
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  return (
    <AppContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
