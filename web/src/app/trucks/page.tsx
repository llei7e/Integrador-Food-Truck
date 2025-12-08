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

const MapView = dynamic(() => import('@/components/map'), {
  ssr: false,
  loading: () => <p>Carregando mapa...</p>,
});

const ChartTruck = dynamic(() => import('@/components/ChartTruck'), {
  ssr: false,
  loading: () => <p>Carregando gráfico...</p>,
});

interface Truck {
  id: number;
  localizacao: string;
  ativo: boolean;
  vendas?: number;
  pedidos?: number;
}

export default function Trucks() {
  const router = useRouter();
  const [valorVendas, setValorVendas] = useState("Carregando ...");
  const [numeroPedidos, setNumeroPedidos] = useState("Carregando ...");
  const [statusTruck, setStatusTruck] = useState("Carregando ...");

  const [selectedTruck, setSelectedTruck] = useState("");
  const [trucksList, setTrucksList] = useState<Truck[]>([]);
  const [pedidosList, setPedidosList] = useState<Pedido[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const isTruckSelected = !!selectedTruck;

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Iniciando fetch de trucks e pedidos...");
        const [trucksData, pedidosData] = await Promise.all([
          getTrucks(),
          getPedidos(),
        ]);
        console.log("Trucks recebidos:", trucksData);
        console.log("Pedidos recebidos:", pedidosData);

        if (Array.isArray(trucksData) && trucksData.length > 0) {
          const trucksWithMetrics = trucksData.map((truck: Truck) => {
            const pedidosDoTruck = pedidosData.filter((pedido: Pedido) => pedido.truckId === truck.id && pedido.status === "concluido");
            const totalVendas = pedidosDoTruck.reduce((sum: number, pedido: Pedido) => sum + pedido.total, 0);
            const numPedidos = pedidosDoTruck.length;

            return {
              ...truck,
              vendas: totalVendas,
              pedidos: numPedidos,
            };
          });

          setTrucksList(trucksWithMetrics);
          setPedidosList(pedidosData);
        } else {
          setTrucksList([]);
          setPedidosList([]);
          setValorVendas("Nenhum truck cadastrado");
          setNumeroPedidos("Nenhum truck cadastrado");
          setStatusTruck("Nenhum truck cadastrado");
        }
      } catch (error: any) {
        console.error("Erro ao carregar dados:", error);
        if (error.message === "NO_TOKEN" || error.message === "TOKEN_INVALID") {
          console.error("Token inválido ou ausente – redirecionando para login");
          localStorage.removeItem('token');
          router.push('/');
          return;
        }
        setValorVendas("Erro ao carregar lista");
        setNumeroPedidos("Erro ao carregar lista");
        setStatusTruck("Erro ao carregar lista");
      } finally {
        setLoadingList(false);
      }
    };
    fetchData();
  }, [router]);

  useEffect(() => {
    if (trucksList.length === 0) {
      setValorVendas("Nenhum truck cadastrado");
      setNumeroPedidos("Nenhum truck cadastrado");
      setStatusTruck("Nenhum truck cadastrado");
      return;
    }

    if (isTruckSelected) {
      const selectedTruckData = trucksList.find((truck) => truck.id.toString() === selectedTruck);
      if (!selectedTruckData) {
        setValorVendas("Nenhum dado disponível");
        setNumeroPedidos("Nenhum dado disponível");
        setStatusTruck("Nenhum dado disponível");
        return;
      }
      setValorVendas(`R$ ${selectedTruckData.vendas?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`);
      setNumeroPedidos((selectedTruckData.pedidos || 0).toString());
      setStatusTruck(selectedTruckData.ativo ? "Ativo" : "Inativo");
    } else {
      const pedidosConcluidos = pedidosList.filter((pedido: Pedido) => pedido.status === "concluido");
      const totalVendas = pedidosConcluidos.reduce((sum: number, pedido: Pedido) => sum + pedido.total, 0);
      const totalPedidos = pedidosConcluidos.length;
      const numTrucks = trucksList.length;

      setValorVendas(`R$ ${totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      setNumeroPedidos(totalPedidos.toString());
      setStatusTruck(numTrucks.toString());
    }
  }, [selectedTruck, trucksList, pedidosList, isTruckSelected]);

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
              Title={"Status do Truck"}
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