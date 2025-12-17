export interface Pedido {
  id: number;
  status: string;
  total: number;
  metodoPagamento: string;
  dataCriacao: string;
  truckId: number;
  itens: {
    id: number;
    produtoId: number;
    nomeProduto: string;
    quantidade: number;
    precoUnitario: number;
    precoTotalItem: number;
  }[];
}

export async function getPedidos() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  console.log("Token lido do localStorage:", token ? `${token.substring(0, 20)}...` : 'null');

  if (!token) {
    throw new Error("NO_TOKEN");
  }

  const response = await fetch("http://54.146.16.231:8080/api/pedidos", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  console.log("Response status do /api/pedidos:", response.status);
  console.log("Response headers:", response.headers.get('Authorization'));

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      console.log("Token limpo por 401");
      throw new Error("TOKEN_INVALID");
    }
    throw new Error(`Erro ao buscar pedidos: ${response.status}`);
  }

  return await response.json() as Pedido[];
}