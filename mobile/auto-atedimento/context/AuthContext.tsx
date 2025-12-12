import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { BASE_URL } from "../lib/api";
import { ApiError } from "../lib/api";
import { getAuth, saveAuth, clearAuth } from "../lib/storage";

// Garante que o navegador feche corretamente após o redirecionamento
WebBrowser.maybeCompleteAuthSession();

// Tipos
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

  // Helper para normalizar o cargo
  const normalizeCargo = (role?: string) => {
      if (!role) return "USUARIO";
      const upper = role.toUpperCase();
      if (upper === 'USER') return 'USUARIO';
      return upper;
  };

  // 1. Restaura sessão ao abrir o app
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

  // 2. Login Tradicional (Email + Senha)
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
    const cargo = normalizeCargo(userData?.cargo || userData?.role);

    const u: User = { 
        email, 
        name: userData?.name || "Usuário(a)", 
        id: userData?.id,
        cargo: cargo 
    };

    await saveAuth(token, u, null);
    setUser(u);
  }

  // 3. Cadastro
  async function signUp(name: string, email: string, password: string, role: string = "USUARIO") {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, cargo: role }), 
    });

    let data: any = null; try { data = await res.json(); } catch {}
    if (!res.ok) throw new ApiError(data?.message || data?.detail || `Erro ${res.status}`, res.status, data);

    await signIn(email, password);
  }

  // 4. Logout
  async function signOut() {
    await clearAuth();
    setUser(null);
  }

  // 5. Finalização do Login Social (Chamado pela tela oauth-google)
  async function completeSocialLogin(token: string, userRaw: any) {
    const data = (typeof userRaw === 'object') ? userRaw : { email: userRaw };
    const cargo = normalizeCargo(data?.cargo || data?.role);

    const u: User = {
      email: data?.email ?? "email@desconhecido.com",
      name: data?.name ?? "Usuário(a)",
      id: data?.id ? String(data.id) : undefined,
      cargo: cargo 
    };
    
    await saveAuth(token, u, null);  
    setUser(u);                      
  }

  // 6. Início do Login com Google (Ajustado para AWS + nip.io)
  async function signInWithGoogle() {
    // A) URL que o Backend deve chamar para devolver o usuário para o App
    const redirectUri = Linking.createURL("/oauth-google");
    
    // B) URL Base "Fake" usando nip.io para enganar a validação de IP do Google Cloud
    // Isso aponta para o seu IP da AWS: 54.146.16.231
    const BASE_URL_AUTH = "http://54.146.16.231.nip.io:8080";

    // C) Monta a URL de autorização do Spring Security
    // O parametro redirect_uri aqui diz pro Spring: "Depois de falar com o Google, volte para o App"
    const authUrl = `${BASE_URL_AUTH}/oauth2/authorization/google?redirect_uri=${encodeURIComponent(redirectUri)}`;

    // Se for Web, redireciona direto
    if (Platform.OS === "web") {
      window.location.href = authUrl;
      return;
    }

    // Se for Mobile, abre o navegador interno
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    // D) Processamento do Retorno (Caso o deep link funcione diretamente aqui)
    if (result.type === "success" && result.url) {
      const parsed = Linking.parse(result.url);
      const qp = parsed.queryParams || {};

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