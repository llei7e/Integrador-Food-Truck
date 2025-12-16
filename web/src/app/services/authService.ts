const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://54.146.16.231:8080";

type AuthResponse = {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    name: string;
    email: string;
    cargo: string;
  };
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

  if (data.user.cargo !== "ADMIN") {
    throw new Error("Acesso negado: Apenas usuários ADMIN podem fazer login.");
  }

  if (typeof window !== "undefined") {
    localStorage.setItem("token", data.access_token);
    console.log("Token salvo no localStorage:", data.access_token.substring(0, 20) + "...");

    const savedToken = localStorage.getItem("token");
    console.log("Confirmação: Token lido após salvar:", savedToken ? savedToken.substring(0, 20) + "..." : "NULL!");
  }

  return data;
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    throw new Error("Erro ao registrar usuário.");
  }
}