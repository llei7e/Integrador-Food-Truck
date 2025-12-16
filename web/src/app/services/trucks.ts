export interface Truck {
  id: number;
  localizacao: string;
  ativo: number;
  vendas?: number;
  pedidos?: number;
}

export async function getTrucks() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) {
    throw new Error("Token de autenticação não encontrado. Faça login primeiro.");
  }

  const response = await fetch("http://localhost:8080/api/trucks", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error("Sessão expirada. Faça login novamente.");
    }
    throw new Error(`Erro ao buscar trucks: ${response.status}`);
  }

  return await response.json() as Truck[];
}