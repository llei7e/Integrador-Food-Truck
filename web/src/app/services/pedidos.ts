export interface Pedido {
  id: number;
  status: string;
  total: number;
  metodoPagamento: string;
  dataCriacao: string;
  truckId: number;
  itens: any[];
}

export async function getPedidos() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (!token) {
    throw new Error("NO_TOKEN");
  }

  const response = await fetch("http://localhost:8080/api/pedidos", {
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
      throw new Error("TOKEN_INVALID");
    }
    throw new Error(`Erro ao buscar pedidos: ${response.status}`);
  }

  return await response.json() as Pedido[];
}