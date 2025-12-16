const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  ativo: boolean;
  categoriaId: number;
}

export async function getProdutos(): Promise<Produto[]> {
  const token = typeof window !== "undefined" ? localStorage.getItem('token') : null;
  if (!token) {
    throw new Error("NO_TOKEN");
  }

  const response = await fetch(`${API_BASE}/api/produtos`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("TOKEN_INVALID");
    }
    throw new Error(`Erro ao buscar produtos: ${response.status}`);
  }

  const data: Produto[] = await response.json();
  console.log("Produtos recebidos:", data);
  return data;
}