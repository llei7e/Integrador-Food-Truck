import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { BASE_URL } from "../lib/api";
import { ApiError } from "../lib/api";
import { getAuth, saveAuth, clearAuth } from "../lib/storage";

// Define o tipo do usuário e cargos
type User = { 
  id?: string; 
  name?: string; 
  email: string; 
  cargo: 'CHAPEIRO' | 'USUARIO' | 'ADMIN' | string; 
};

type AuthCtx = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, role?: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  completeSocialLogin: (token: string, userRaw: any) => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper para normalizar o cargo (garante maiúsculo e trata 'user' minúsculo)
  const normalizeCargo = (role?: string) => {
      if (!role) return "USUARIO";
      const upper = role.toUpperCase();
      if (upper === 'USER') return 'USUARIO';
      return upper;
  };

  // Restaura sessão ao abrir o app
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

  // ---------- LOGIN (EMAIL + SENHA) ----------
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

  // ---------- CADASTRO ----------
  // role é opcional, padrão "USUARIO"
  async function signUp(name: string, email: string, password: string, role: string = "USUARIO") {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      // Envia a chave 'cargo' que o DTO do backend espera
      body: JSON.stringify({ 
          name, 
          email, 
          password, 
          cargo: role 
      }), 
    });

    let data: any = null; try { data = await res.json(); } catch {}
    if (!res.ok) throw new ApiError(data?.message || data?.detail || `Erro ${res.status}`, res.status, data);

    await signIn(email, password);
  }

  async function signOut() {
    await clearAuth();
    setUser(null);
  }

  // ---------- GOOGLE (Processamento) ----------
  async function completeSocialLogin(token: string, userRaw: any) {
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

  // ---------- GOOGLE (Início do Fluxo) ----------
  async function signInWithGoogle() {
    // 1. Define a URL de retorno para o App/Web
    const redirectUri = Linking.createURL("/oauth-google");
    
    // Fallback para Web Localhost se necessário (ajuste conforme seu ambiente)
    const finalRedirect = Platform.OS === 'web' 
        ? "http://localhost:8081/oauth-google" 
        : redirectUri;

    // 2. Chama o endpoint do Spring Security para OAuth2
    // IMPORTANTE: NÃO chame /api/auth/google aqui (isso seria POST).
    // Chame o endpoint de autorização GET padrão do Spring.
    const authUrl = `${BASE_URL}/oauth2/authorization/google?redirect_uri=${encodeURIComponent(finalRedirect)}`;

    if (Platform.OS === "web") {
      window.location.href = authUrl;
      return;
    }

    // 3. Abre o navegador
    const result = await WebBrowser.openAuthSessionAsync(authUrl, finalRedirect);

    // 4. Processa o retorno
    if (result.type === "success" && result.url) {
      const parsed = Linking.parse(result.url);
      const qp = parsed.queryParams || {};

      // Tenta ler o payload JSON que o SuccessHandler enviou
      if (qp.payload) {
          try {
              const jsonStr = decodeURIComponent(qp.payload as string);
              const data = JSON.parse(jsonStr);
              const token = data.access_token;
              const userRaw = data.user; 

              if (token && userRaw) {
                  await completeSocialLogin(token, userRaw);
                  return;
              }
          } catch (e) {
              console.error("Erro no parse do payload Google:", e);
          }
      }

      // Fallback antigo (caso o payload falhe)
      let token = (qp.access_token || qp.token) as string | undefined;
      let email = (qp.email as string | undefined) ?? null;

      if (!token) throw new Error("Token ausente no retorno do Google.");
      await completeSocialLogin(token, { email });

    } else {
      // throw new Error("Login com Google cancelado."); // Opcional lançar erro
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