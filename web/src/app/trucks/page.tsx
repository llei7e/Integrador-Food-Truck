"use client";
import Filter from "../components/filter";
import Header from "../components/header";
import Table from "../components/tableTruck";
import Card from "../components/ui/card";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTrucks } from "@/services/trucks";
import { getPedidos, Pedido } from "@/services/pedidos";

const MapTilerView = dynamic(() => import('@/components/map'), { 
  ssr: false,
  loading: () => <p>Carregando mapa...</p>,
});

const ChartTruck = dynamic(() => import('@/components/chartTruck'), {
  ssr: false,
  loading: () => <p>Carregando gráfico...</p>,
});

interface Truck {
  id: number;
  localizacao: string;
  ativo: boolean | number;
  vendas?: number;
  pedidos?: number;
}

export default function Trucks() {
  const router = useRouter();
  const [valorVendas, setValorVendas] = useState("Carregando ...");
  const [numeroPedidos, setNumeroPedidos] = useState("Carregando ...");
  const [statusTruck, setStatusTruck] = useState("Carregando ...");
  const [statusTitle, setStatusTitle] = useState("Status do Truck");

  const [selectedTruck, setSelectedTruck] = useState("");
  const [trucksList, setTrucksList] = useState<Truck[]>([]);
  const [pedidosList, setPedidosList] = useState<Pedido[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isTruckSelected = !!selectedTruck;

  useEffect(() => {
    async function load() {
      try {
        setLoadingList(true);
        setError(null);
        console.log("Iniciando fetch de trucks e pedidos...");
        const [trucksData, pedidosData] = await Promise.all([
          getTrucks(),
          getPedidos(),
        ]);
        console.log("Trucks recebidos:", trucksData);
        console.log("Pedidos recebidos:", pedidosData);

        if (Array.isArray(trucksData) && trucksData.length > 0) {
          const trucksWithMetrics = trucksData.map((truck: Truck) => {
            // 👈 Filter para status "FINALIZADO" (da API)
            const pedidosDoTruck = pedidosData.filter((pedido: Pedido) => 
              pedido.truckId === truck.id && pedido.status === "FINALIZADO"
            );
            console.log(`Pedidos para truck ${truck.id}:`, pedidosDoTruck.length);

            const totalVendas = pedidosDoTruck.reduce((sum: number, pedido: Pedido) => {
              const total = pedido.total || 0;
              return sum + total;
            }, 0);
            const numPedidos = pedidosDoTruck.length;

            console.log(`Truck ${truck.id}: vendas=${totalVendas}, pedidos=${numPedidos}`);

            return {
              ...truck,
              vendas: totalVendas,
              pedidos: numPedidos,
            };
          });

          setTrucksList(trucksWithMetrics);
          setPedidosList(pedidosData);

          // 👈 Cálculos gerais (todos pedidos FINALIZADO)
          const pedidosConcluidos = pedidosData.filter((pedido: Pedido) => 
            pedido.status === "FINALIZADO"  // 👈 Matching API
          );
          console.log("pedidosConcluidos length:", pedidosConcluidos.length);

          const totalVendas = pedidosConcluidos.reduce((sum: number, pedido: Pedido) => {
            const total = pedido.total || 0;
            return sum + total;
          }, 0);
          const totalPedidos = pedidosConcluidos.length;
          const numTrucks = trucksData.length;

          console.log(`Geral: totalVendas=${totalVendas}, totalPedidos=${totalPedidos}, numTrucks=${numTrucks}`);

          setValorVendas(`R$ ${totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
          setNumeroPedidos(totalPedidos.toString());
          setStatusTruck(numTrucks.toString());
          setStatusTitle("Quantidade Truck");
        } else {
          setTrucksList([]);
          setPedidosList([]);
          setValorVendas("Nenhum truck cadastrado");
          setNumeroPedidos("Nenhum truck cadastrado");
          setStatusTruck("Nenhum truck cadastrado");
          setStatusTitle("Status do Truck");
        }
      } catch (error: unknown) {
        console.error("Erro ao carregar dados:", error);
        const errMessage = error instanceof Error ? error.message : "Erro desconhecido";
        if (errMessage === "NO_TOKEN" || errMessage === "TOKEN_INVALID") {
          console.error("Token inválido ou ausente – redirecionando para login");
          localStorage.removeItem('token');
          router.push('/');
          return;
        }
        setError("Erro ao carregar dados. Tente novamente.");
        setValorVendas("Erro ao carregar lista");
        setNumeroPedidos("Erro ao carregar lista");
        setStatusTruck("Erro ao carregar lista");
        setStatusTitle("Status do Truck");
      } finally {
        setLoadingList(false);
      }
    }

    load();
  }, [router]);

  useEffect(() => {
    if (trucksList.length === 0 || loadingList) return;

    if (isTruckSelected) {
      const selectedTruckData = trucksList.find((truck) => truck.id.toString() === selectedTruck);
      if (!selectedTruckData) {
        setValorVendas("Nenhum dado disponível");
        setNumeroPedidos("Nenhum dado disponível");
        setStatusTruck("Nenhum dado disponível");
        setStatusTitle("Status do Truck");
        return;
      }
      setValorVendas(`R$ ${selectedTruckData.vendas?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`);
      setNumeroPedidos((selectedTruckData.pedidos || 0).toString());
      setStatusTruck(selectedTruckData.ativo === 1 || selectedTruckData.ativo === 1 ? "Ativo" : "Inativo");
      setStatusTitle("Status do Truck");
    } else {
      // 👈 Recalcula gerais
      const pedidosConcluidos = pedidosList.filter((pedido: Pedido) => 
        pedido.status === "FINALIZADO"
      );
      const totalVendas = pedidosConcluidos.reduce((sum: number, pedido: Pedido) => {
        const total = pedido.total || 0;
        return sum + total;
      }, 0);
      const totalPedidos = pedidosConcluidos.length;
      const numTrucks = trucksList.length;

      setValorVendas(`R$ ${totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      setNumeroPedidos(totalPedidos.toString());
      setStatusTruck(numTrucks.toString());
      setStatusTitle("Quantidade Truck");
    }
  }, [selectedTruck, trucksList, pedidosList, isTruckSelected, loadingList]);

  const truckOptions = trucksList.map((truck) => ({
    value: truck.id.toString(),
    label: `Truck ${truck.id} - ${truck.localizacao}`,
  }));

  if (loadingList) {
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
          <MapTilerView
            trucksList={trucksList}
            selectedTruckId={selectedTruck}
          />
        </div>
        <div>
          <div className="flex">
            <Card
              Title={"Valor de vendas"}
              iconColor="gray"
              iconImage="tdesign:money"
              API_VALUE={valorVendas}
            />
            <Card
              Title={"Número de pedidos"}
              iconColor="gray"
              iconImage="icon-park-outline:bill"
              API_VALUE={numeroPedidos}
            />
            <Card
              Title={statusTitle}
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