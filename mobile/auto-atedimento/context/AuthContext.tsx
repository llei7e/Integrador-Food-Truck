import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { BASE_URL } from "../lib/api";
import { ApiError } from "../lib/api";
import { getAuth, saveAuth, clearAuth } from "../lib/storage";

// --- 1. Definição do Usuário ---
type User = { 
  id?: string; 
  name?: string; 
  email: string; 
  cargo: 'CHAPEIRO' | 'USUARIO' | 'ADMIN' | string; 
};

// --- 2. Interface do Contexto ---
type AuthCtx = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  // Agora aceita role opcional
  signUp: (name: string, email: string, password: string, role?: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  // Atualizado para ser mais flexível com os dados do usuário (userRaw)
  completeSocialLogin: (token: string, userRaw: any) => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper para normalizar o cargo (garante maiúsculo e trata 'user')
  const normalizeCargo = (role?: string) => {
      if (!role) return "USUARIO";
      const upper = role.toUpperCase();
      if (upper === 'USER') return 'USUARIO';
      return upper;
  };

  // restaura sessão ao abrir o app
  useEffect(() => {
    (async () => {
      try {
        const saved = await getAuth();
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

    const userData = data?.user;

    // Normaliza o cargo vindo do backend
    const rawRole = userData?.cargo || userData?.role;
    const cargo = normalizeCargo(rawRole);

    const u: User = { 
        email, 
        name: userData?.name || "Usuário(a)", 
        id: userData?.id,
        cargo: cargo 
    };

    await saveAuth(token, u, null);
    setUser(u);
  }

  // signUp com role opcional (padrão "user")
  async function signUp(name: string, email: string, password: string, role: string = "user") {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }), // Envia 'role' ou 'cargo' dependendo do seu DTO de registro
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
  // Recebe userRaw que pode conter { email, name, cargo, id }
  async function completeSocialLogin(token: string, userRaw: any) {
    // Garante que userRaw seja um objeto
    const data = (typeof userRaw === 'object') ? userRaw : { email: userRaw };
    
    const rawRole = data?.cargo || data?.role;
    const cargo = normalizeCargo(rawRole);

    const u: User = {
      email: data?.email ?? "email@desconhecido.com",
      name: data?.name ?? "Usuário(a)",
      id: data?.id ? String(data.id) : undefined,
      cargo: cargo 
    };
    
    await saveAuth(token, u, null);  
    setUser(u);                      
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

      // 1. Tenta ler o payload JSON enviado pelo backend novo
      if (qp.payload) {
          try {
              const jsonStr = decodeURIComponent(qp.payload as string);
              const data = JSON.parse(jsonStr);
              const token = data.access_token;
              const userRaw = data.user; // { id, email, cargo: "CHAPEIRO", ... }

              if (token && userRaw) {
                  await completeSocialLogin(token, userRaw);
                  return;
              }
          } catch (e) {
              console.error("Erro no payload Google:", e);
          }
      }

      // 2. Fallback para o método antigo (se não houver payload)
      let token = (qp.access_token || qp.token) as string | undefined;
      let email = (qp.email as string | undefined) ?? null;

      if (!token) throw new Error("Token ausente no retorno do Google.");
      
      // Passa um objeto básico se só tivermos token e email
      await completeSocialLogin(token, { email });

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