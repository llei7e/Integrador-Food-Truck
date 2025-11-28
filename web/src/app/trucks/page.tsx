"use client";
import Filter from "../components/filter";
import Header from "../components/header";
import Table from "../components/tableTruck";
import Card from "../components/ui/card";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const MapView = dynamic(() => import('@/components/map'), {
  ssr: false,
  loading: () => <p>Carregando mapa...</p>,
});

const ChartTruck = dynamic(() => import('@/components/ChartTruck'), {
  ssr: false,
  loading: () => <p>Carregando gráfico...</p>,
});

// Interface para Truck (com campos opcionais para vendas/pedidos calculados)
interface Truck {
  id: number;
  localizacao: string;
  ativo: boolean;
  vendas?: number; // Calculado da API de pedidos
  pedidos?: number; // Número de pedidos para esse truck
}

export default function Trucks() {
  const [valorVendas, setValorVendas] = useState("Carregando ...");
  const [numeroPedidos, setNumeroPedidos] = useState("Carregando ...");
  const [statusTruck, setStatusTruck] = useState("Carregando ...");

  const [selectedTruck, setSelectedTruck] = useState(""); // ID como string
  const [trucksList, setTrucksList] = useState<Truck[]>([]);
  const [pedidosList, setPedidosList] = useState<any[]>([]); // Lista de pedidos da API
  const [loadingList, setLoadingList] = useState(true);

  const isTruckSelected = !!selectedTruck;

  // Fetch paralelo: Trucks + Pedidos (usa dados de pedidos para calcular vendas/pedidos)
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Iniciando fetch de trucks e pedidos...");
        const [trucksResponse, pedidosResponse] = await Promise.all([
          fetch("http://localhost:8080/api/trucks", {
            headers: {
              Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZXMiOlsiUk9MRV9VU0VSIl0sImlhdCI6MTc2NDExNTg2OSwiZXhwIjoxNzY0MjAyMjY5fQ.BxKpWzWrr-lMiXqac6BPzqM2wJSgPA-8cWq0fB2j2xo",
            },
            cache: "no-store",
          }),
          fetch("http://localhost:8080/api/pedidos", {
            headers: {
              Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZXMiOlsiUk9MRV9VU0VSIl0sImlhdCI6MTc2NDExNTg2OSwiZXhwIjoxNzY0MjAyMjY5fQ.BxKpWzWrr-lMiXqac6BPzqM2wJSgPA-8cWq0fB2j2xo",
            },
            cache: "no-store",
          }),
        ]);

        if (!trucksResponse.ok || !pedidosResponse.ok) {
          throw new Error(`Erro HTTP: ${trucksResponse.status} ou ${pedidosResponse.status}`);
        }

        const trucksData = await trucksResponse.json();
        const pedidosData = await pedidosResponse.json();

        console.log("Trucks recebidos:", trucksData);
        console.log("Pedidos recebidos:", pedidosData);

        if (Array.isArray(trucksData) && trucksData.length > 0) {
          // Mapeia trucks e calcula vendas/pedidos por truck baseado em pedidos
          const trucksWithMetrics = trucksData.map((truck: Truck) => {
            const pedidosDoTruck = (Array.isArray(pedidosData) ? pedidosData : pedidosData.data || []).filter((pedido: any) => pedido.foodtruckId === truck.id);
            const totalVendas = pedidosDoTruck.reduce((sum: number, pedido: any) => sum + (pedido.total || 0), 0);
            const numPedidos = pedidosDoTruck.length;

            return {
              ...truck,
              vendas: totalVendas,
              pedidos: numPedidos,
            };
          });

          setTrucksList(trucksWithMetrics);
          setPedidosList(Array.isArray(pedidosData) ? pedidosData : pedidosData.data || []);
        } else {
          setTrucksList([]);
          setPedidosList([]);
          setValorVendas("Nenhum truck cadastrado");
          setNumeroPedidos("Nenhum truck cadastrado");
          setStatusTruck("Nenhum truck cadastrado");
        }
      } catch (error: any) {
        console.error("Erro ao carregar dados:", error);
        if (error.message.includes("401") || error.message.includes("Unauthorized")) {
          console.error("Token inválido – redirecione para login");
          // Opcional: use next/router para push('/login');
        }
        setValorVendas("Erro ao carregar lista");
        setNumeroPedidos("Erro ao carregar lista");
        setStatusTruck("Erro ao carregar lista");
      } finally {
        setLoadingList(false);
      }
    };
    fetchData();
  }, []);

  // Atualiza dados das cards baseado na seleção
  useEffect(() => {
    if (trucksList.length === 0) {
      setValorVendas("Nenhum truck cadastrado");
      setNumeroPedidos("Nenhum truck cadastrado");
      setStatusTruck("Nenhum truck cadastrado");
      return;
    }

    if (isTruckSelected) {
      // Modo selecionado: valores específicos do truck
      const selectedTruckData = trucksList.find((truck) => truck.id.toString() === selectedTruck);
      if (!selectedTruckData) {
        setValorVendas("Nenhum dado disponível");
        setNumeroPedidos("Nenhum dado disponível");
        setStatusTruck("Nenhum dado disponível");
        return;
      }
      setValorVendas(`R$ ${selectedTruckData.vendas?.toLocaleString() || '0'}`);
      setNumeroPedidos((selectedTruckData.pedidos || 0).toString());
      setStatusTruck(selectedTruckData.ativo ? "Ativo" : "Inativo");
    } else {
      // Modo geral: cálculos agregados de todos os trucks
      const totalVendas = trucksList.reduce((sum: number, truck: Truck) => sum + (truck.vendas || 0), 0);
      const totalPedidos = trucksList.reduce((sum: number, truck: Truck) => sum + (truck.pedidos || 0), 0);
      const numTrucks = trucksList.length;

      setValorVendas(`R$ ${(totalVendas / numTrucks).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      setNumeroPedidos((totalPedidos / numTrucks).toFixed(0));
      setStatusTruck(numTrucks.toString());
    }
  }, [selectedTruck, trucksList, isTruckSelected]);

  // Opções para o filtro (mapeia dos trucks com métricas)
  const truckOptions = trucksList.map((truck) => ({
    value: truck.id.toString(),
    label: `Truck ${truck.id} - ${truck.localizacao}`,
  }));

  if (loadingList) {
    return <div className="mr-4 ml-4"><p>Carregando lista de trucks...</p></div>;
  }

  return (
    <div className="mr-4 ml-4">
      <Header />
      <div className="flex justify-start items-center">
        <Filter
          value={selectedTruck}
          onChange={(value: string) => setSelectedTruck(value)}
          placeholder="Selecione um Truck"
          icon="tabler:search"
          options={truckOptions}
          isSelect={true}
        />
      </div>
      <div className="flex">
        <div className="flex mt-2">
          <MapView selectedTruckId={selectedTruck} trucksList={trucksList} />
        </div>
        <div>
          <div className="flex">
            <Card
              Title={isTruckSelected ? "Valor de vendas" : "Média de vendas"}
              iconColor="gray"
              iconImage="tdesign:money"
              API_VALUE={valorVendas}
            />
            <Card
              Title={isTruckSelected ? "Número de pedidos" : "Média de pedidos"}
              iconColor="gray"
              iconImage="icon-park-outline:bill"
              API_VALUE={numeroPedidos}
            />
            <Card
              Title={isTruckSelected ? "Status do Truck" : "Trucks Cadastrados"}
              iconColor="gray"
              iconImage="streamline-plump:food-truck-event-fair"
              API_VALUE={statusTruck}
            />
          </div>
          <div className="ml-5 mt-4 flex">
            <Table selectedTruckId={selectedTruck} trucksList={trucksList} />
            <div className="ml-5 mt-2">
              <ChartTruck selectedTruckId={selectedTruck} trucksList={trucksList} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}