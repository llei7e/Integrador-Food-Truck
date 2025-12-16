"use client";
import StockPieChart from "@/components/chartStocks";
import Header from "../components/header";
import TableProduct from "../components/tableProduct";
import { getProdutos, Produto } from "@/services/produtos";  // 👈 Import service
import { useState, useEffect } from "react";

export default function Stocks() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProdutos() {
      try {
        setLoading(true);
        setError(null);
        const fetchedData = await getProdutos();  // 👈 Usa service (chama 8080/api/produtos)
        setProdutos(fetchedData);
      } catch (error: unknown) {
        console.error("Erro no fetch de produtos:", error);
        const errMessage = error instanceof Error ? error.message : "Erro desconhecido";
        if (errMessage === "NO_TOKEN" || errMessage === "TOKEN_INVALID") {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        setError(errMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchProdutos();
  }, []);

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
        <button onClick={() => window.location.reload()} className="ml-2 text-blue-500 underline">Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="mr-4 ml-4">
      <Header />
      <div className="flex">
        <TableProduct produtos={produtos} />  {/* 👈 Passa para tabela */}
        <div className="pl-5 pt-2">
          <StockPieChart produtos={produtos} />  {/* 👈 Passa para gráfico */}
        </div>
      </div>
    </div>
  );
}