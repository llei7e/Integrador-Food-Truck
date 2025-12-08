// components/tableSales.tsx (Atualizado para integrar com API de pedidos)
import Status from "./ui/status";

interface Pedido {
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
  // Adicione outros campos se necessário (ex: usuarioId para cliente)
}

interface TableSalesProps {
  pedidosList: Pedido[]; // Lista de pedidos da API
  selectedTruckId?: string; // Opcional: filtra por truck se selecionado
}

export default function TableSales({ pedidosList, selectedTruckId }: TableSalesProps) {
  // Filtra pedidos se truck selecionado (por truckId)
  const filteredPedidos = selectedTruckId 
    ? pedidosList.filter((pedido) => pedido.truckId.toString() === selectedTruckId)
    : pedidosList;

  // Função helper para formatar dataCriacao para "DD/MM/YYYY - HH:MM"
  const formatDataHora = (dataCriacao: string): string => {
    const date = new Date(dataCriacao);
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const ano = date.getFullYear();
    const hora = date.getHours().toString().padStart(2, '0');
    const minuto = date.getMinutes().toString().padStart(2, '0');
    return `${dia}/${mes}/${ano} - ${hora}:${minuto}`;
  };

  // Função helper para formatar itens como string (ex: "1x Veggie Burger")
  const formatItens = (itens: Pedido['itens']): string => {
    return itens.map((item) => `${item.quantidade}x ${item.nomeProduto}`).join(', ');
  };

  if (filteredPedidos.length === 0) {
    return (
      <div className="relative overflow-x-auto mt-2 w-full rounded-2xl">
        <p className="text-center py-4 text-gray-500">Nenhum pedido encontrado</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto mt-2 w-full rounded-2xl">
      <table className="w-full text-sm text-left rtl:text-right text-white">
        <thead className="text-xs text-white uppercase bg-gray-50 dark:bg-red-900">
          <tr>
            <th scope="col" className="px-6 py-3 text-center">ID</th>
            <th scope="col" className="px-6 py-3 text-center">Data/Hora</th>
            <th scope="col" className="px-6 py-3 text-center">Cliente</th>
            <th scope="col" className="px-6 py-3 text-center">Itens</th>
            <th scope="col" className="px-6 py-3 text-center">Valor</th>
            <th scope="col" className="px-6 py-3 text-center">Pagamento</th>
            <th scope="col" className="px-6 py-3 text-center">Status</th>
          </tr>
        </thead>

        <tbody>
          {filteredPedidos.map((pedido) => (
            <tr key={pedido.id} className="bg-white border-b border-gray-200 text-black">
              <td className="px-6 py-4 text-center">#{pedido.id}</td>
              <td className="px-6 py-4 text-center">{formatDataHora(pedido.dataCriacao)}</td>
              <td className="px-6 py-4 text-center">N/A</td> {/*  */}
              <td className="px-6 py-4 text-start">{formatItens(pedido.itens)}</td>
              <td className="px-6 py-4 text-center">R$ {pedido.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              <td className="px-6 py-4 text-center">{pedido.metodoPagamento}</td>
              <td className="px-6 py-4 flex items-center justify-center">
                <Status status={pedido.status} /> {/*   */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}