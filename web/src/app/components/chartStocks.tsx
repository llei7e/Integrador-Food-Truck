"use client";

import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  TooltipItem,
} from "chart.js";
import { useMemo } from "react";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Produto {
  id: number;
  nome: string;
  ativo: boolean;
}

interface EstoquePieChartProps {
  produtos: Produto[];
}

export default function StockPieChart({ produtos = [] }: EstoquePieChartProps) {
  const categorias = useMemo(() => {
    const ativos = produtos.filter((p) => p.ativo === true).length;
    const inativos = produtos.filter((p) => p.ativo === false).length;

    console.log("Categorias por ativo:", { ativos, inativos });

    return {
      labels: ["Ativos", "Inativos"],
      datasets: [{
        label: "Produtos",
        data: [ativos, inativos],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)", 
          "rgba(239, 68, 68, 0.8)",
        ],
        borderColor: [
          "rgba(34, 197, 94, 1)",
          "rgba(239, 68, 68, 1)",
        ],
        borderWidth: 2,
      }],
    };
  }, [produtos]);

  if (produtos.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-50 rounded-lg flex items-center justify-center border">
        <p className="text-gray-500">Nenhum produto no sistema.</p>
      </div>
    );
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'pie'>) => {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="relative h-full w-full bg-white rounded-lg shadow-md p-4">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Status dos Produtos</h2>
      <div className="h-100 w-full">
        <Pie data={categorias} options={options} />
      </div>
    </div>
  );
}