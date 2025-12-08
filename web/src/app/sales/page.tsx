"use client";

import { useEffect, useState } from "react";
import { getPedidos } from "../services/pedidos";

import Filter from "../components/filter";
import Header from "../components/header";
import TableSales from "../components/tableSales";
import Card from "../components/ui/card";

export default function Trucks() {
  const [vendasDoDia, setVendasDoDia] = useState(0);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [ticketMedio, setTicketMedio] = useState(0);

  useEffect(() => {
    async function load() {
      const pedidos = await getPedidos();

      // --------- VENDAS DO DIA (dia de hoje) ----------
      const hoje = new Date().toISOString().split("T")[0];

      const pedidosDoDia = pedidos.filter((p: any) =>
        p.dataCriacao.startsWith(hoje)
      );

      setVendasDoDia(pedidosDoDia.length);

      // --------- TOTAL DE PEDIDOS (todos) ----------
      setTotalPedidos(pedidos.length);

      // --------- TICKET MÉDIO ----------
      // soma de todos os valores do campo "total" do backend
      const somaTotal = pedidos.reduce((acc: number, p: any) => acc + p.total, 0);

      const ticket =
        pedidos.length > 0 ? somaTotal / pedidos.length : 0;

      // arredonda pra 2 casas decimais
      setTicketMedio(Number(ticket.toFixed(2)));

      
    }

    load();
  }, []);

  return (
    <div className="mr-4 ml-4">
      <Header />
      <div className="flex justify-start items-center">
        <Filter placeholder="Truck: Truck A" icon="bx:calendar" />
        <Filter placeholder="Data: 10/08/2025 - 20/08/2025" icon="tabler:search" />
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

        <TableSales />
      </div>
    </div>
  );
}
