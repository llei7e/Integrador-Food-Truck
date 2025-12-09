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

  const data = await response.json();
  return data;
}

// 👇 AGORA RECEBE name TAMBÉM
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
    body: JSON.stringify({ name, email, password }), // <<--- IMPORTANTÍSSIMO
  });

  if (!response.ok) {
    // você pode ler a mensagem do back aqui se quiser
    throw new Error("Erro ao registrar usuário.");
  }
}
