// src/services/authService.ts

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type AuthResponse = {
  token: string;
};

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Email ou senha inválidos");
  }

  const data: AuthResponse = await response.json();

  // 👇 salva o token no navegador
  if (typeof window !== "undefined") {
    localStorage.setItem("token", data.token);
  }

  return data;
}

export async function register(email: string, password: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Erro ao registrar usuário.");
  }
}
