"use client";
import { createContext, useContext, useState, useEffect } from "react";

export type User = { id: number; email: string; fullName: string; avatarUrl?: string; role: string };

type AuthCtx = {
  user: User | null;
  token: string | null;
  ready: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
};

const Ctx = createContext<AuthCtx>({ user: null, token: null, ready: false, login: () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Restore session from localStorage on mount
  useEffect(() => {
    const t = localStorage.getItem("token");
    const u = localStorage.getItem("user");
    if (t && u) {
      setToken(t);
      setUser(JSON.parse(u));
    }
    setReady(true);
  }, []);

  const login = (u: User, t: string) => {
    setUser(u);
    setToken(t);
    localStorage.setItem("token", t);
    localStorage.setItem("user", JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return <Ctx.Provider value={{ user, token, ready, login, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
