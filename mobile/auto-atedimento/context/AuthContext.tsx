// context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { BASE_URL } from "../lib/api";
import { ApiError } from "../lib/api";
import { getAuth, saveAuth, clearAuth } from "../lib/storage";

type User = { id?: string; name?: string; email: string };

type AuthCtx = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  completeSocialLogin: (token: string, email?: string | null, name?: string | null) => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // restaura sessão ao abrir o app
  useEffect(() => {
    (async () => {
      try {
        const saved = await getAuth();   // pode vir undefined/null
        if (saved && saved.token && saved.user) {
          setUser(saved.user);
        } else {
          await clearAuth();
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ---------- EMAIL/SENHA ----------
  async function signIn(email: string, password: string) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    let data: any = null; try { data = await res.json(); } catch {}
    if (!res.ok) throw new ApiError(data?.message || data?.detail || `Erro ${res.status}`, res.status, data);

    const token: string | undefined = data?.access_token || data?.accessToken || data?.token;
    if (!token) throw new ApiError("Token não retornado pelo login", 500, data);

    const u: User = { email, name: data?.user?.name || "Usuário(a)", id: data?.user?.id };
    await saveAuth(token, u, null);
    setUser(u);
  }

  async function signUp(name: string, email: string, password: string) {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role: "user" }),
    });

    let data: any = null; try { data = await res.json(); } catch {}
    if (!res.ok) throw new ApiError(data?.message || data?.detail || `Erro ${res.status}`, res.status, data);

    await signIn(email, password);
  }

  async function signOut() {
    await clearAuth();
    setUser(null);
  }

  // ---------- GOOGLE ----------
  // agora aceita name também
  async function completeSocialLogin(token: string, email?: string | null, name?: string | null) {
    const u: User = {
      email: email ?? "email@desconhecido.com",
      name: name ?? "Usuário(a)",
    };
    await saveAuth(token, u, null);  // salva no storage
    setUser(u);                      // atualiza contexto
  }

  async function signInWithGoogle() {
    const redirectUri =
      Platform.OS === "web"
        ? `${window.location.origin}/oauth-google`
        : Linking.createURL("/oauth-google");

    const authUrl = `${BASE_URL}/auth/google/login?redirect=${encodeURIComponent(redirectUri)}`;

    if (Platform.OS === "web") {
      window.location.href = authUrl;
      return;
    }

    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === "success" && result.url) {
      const parsed = Linking.parse(result.url);
      const qp = parsed.queryParams || {};

      let token = (qp.access_token || qp.token) as string | undefined;
      let email = (qp.email as string | undefined) ?? null;

      if (!token) throw new Error("Token ausente no retorno do Google.");
      await completeSocialLogin(token, email);
    } else {
      throw new Error("Login com Google cancelado.");
    }
  }

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signOut, signInWithGoogle, completeSocialLogin }),
    [user, loading]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
