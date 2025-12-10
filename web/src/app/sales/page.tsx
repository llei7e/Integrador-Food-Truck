"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPedidos, Pedido } from "../services/pedidos";

import Filter from "../components/filter";
import Header from "../components/header";
import TableSales from "../components/tableSales";
import Card from "../components/ui/card";

export default function Sales() {
  const router = useRouter();
  const [vendasDoDia, setVendasDoDia] = useState(0);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [ticketMedio, setTicketMedio] = useState(0);
  const [pedidosList, setPedidosList] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const pedidos = await getPedidos();
        setPedidosList(pedidos); // Agora tipado corretamente

        const hoje = new Date().toISOString().split("T")[0];

        const pedidosDoDia = pedidos.filter((p: Pedido) => // Tipado aqui também
          p.dataCriacao.startsWith(hoje)
        );

        setVendasDoDia(pedidosDoDia.length);

        setTotalPedidos(pedidos.length);

        const somaTotal = pedidos.reduce((acc: number, p: Pedido) => acc + p.total, 0);

        const ticket = pedidos.length > 0 ? somaTotal / pedidos.length : 0;

        setTicketMedio(Number(ticket.toFixed(2)));

      } catch (error: any) {
        console.error("Erro ao carregar pedidos:", error);
        if (error.message === "NO_TOKEN" || error.message === "TOKEN_INVALID") {
          console.error("Token inválido ou ausente – redirecionando para login");
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }
        setError("Erro ao carregar pedidos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  if (loading) {
    return (
      <div className="mr-4 ml-4">
        <Header />
        <p>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mr-4 ml-4">
        <Header />
        <p className="text-red-500">{error}</p>
        <button onClick={() => window.location.reload()}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="mr-4 ml-4">
      <Header />
      <div className="flex justify-start items-center">
        <Filter placeholder="Data: 10/08/2025 - 20/08/2025" icon="bx:calendar" />
      </div>

      <div>
        <div className="flex justify-evenly">
          <Card 
            Title="Vendas do Dia" 
            iconColor="gray" 
            iconImage="tdesign:money"
            API_VALUE={vendasDoDia}
          />
          
          <Card 
            Title="Pedidos" 
            iconColor="gray" 
            iconImage="tdesign:list"
            API_VALUE={totalPedidos}
          />

          <Card 
            Title="Ticket Médio" 
            iconColor="gray" 
            iconImage="tdesign:money"
            API_VALUE={`R$ ${ticketMedio}`}
          />
        </div>

        <TableSales pedidosList={pedidosList} />
      </div>
    </div>
  );
}