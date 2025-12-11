// components/ChartTruck.tsx (Adicione check de segurança para trucksList undefined)
"use client";
import { useEffect } from "react";
import ApexCharts from "apexcharts";

interface ChartTruckProps {
  selectedTruckId?: string;
  trucksList: { id: number; localizacao: string; ativo: boolean }[];
}

export default function ChartTruck({ selectedTruckId, trucksList }: ChartTruckProps) {
  // Check de segurança: se trucksList undefined, retorne loading
  if (!trucksList || !Array.isArray(trucksList)) {
    return (
      <div className="chart-card max-w-sm w-full bg-white rounded-lg shadow-sm dark:bg-white p-4 md:p-6">
        <p>Carregando gráfico...</p>
      </div>
    );
  }

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Filtra dados para o gráfico
    const filteredTrucks = selectedTruckId 
      ? trucksList.filter((truck) => truck.id.toString() === selectedTruckId)
      : trucksList;

    if (filteredTrucks.length === 0) return;

    const el = document.querySelector(".chart-card");
    const backgroundColor = el ? getComputedStyle(el).backgroundColor : "#ffffff";

    const chartData = filteredTrucks.map((truck) => truck.id);
    const categories = filteredTrucks.map((truck) => `Truck ${truck.id}`);

    const options = {
      chart: {
        type: "bar",
        height: 200,
        toolbar: { show: false },
        background: backgroundColor,
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 10,
        },
      },
      series: [
        {
          name: "Vendas Totais",
          data: chartData,
        },
      ],
      xaxis: {
        categories: categories,
        labels: {
          style: {
            colors: ["#000000"],
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: ["#000000"],
          },
        },
      },
      colors: ["#823430"],
      grid: {
        show: true,
        borderColor: "transparent",
        strokeDashArray: 0,
        yaxis: { lines: { show: false } },
        xaxis: { lines: { show: false } },
      },
    };

    const chart = new ApexCharts(document.querySelector("#bar-chart"), options);
    chart.render();

    return () => {
      chart.destroy();
    };
  }, [selectedTruckId, trucksList]);

  // Agora seguro: trucksList é array
  const title = selectedTruckId ? `Profit - Truck ${selectedTruckId}` : "Profit Geral";
  const profitValue = selectedTruckId 
    ? trucksList.find((t) => t.id.toString() === selectedTruckId)?.id || 0
    : trucksList.reduce((sum, t) => sum + t.id, 0);

  return (
    <div className="chart-card max-w-sm w-full bg-white rounded-lg shadow-sm dark:bg-white p-4 md:p-6">
      <div className="flex justify-between border-gray-200 border-b dark:border-gray-700 pb-3">
        <dl>
          <dt className="text-base font-normal text-gray-500 dark:text-gray-400 pb-1">
            {title}
          </dt>
          <dd className="leading-none text-3xl font-bold text-gray-900 dark:text-gray-900">
            ${profitValue.toLocaleString()}
          </dd>
        </dl>
      </div>

      <div className="grid grid-cols-2"></div>

      <div id="bar-chart"></div>

      <div className="grid grid-cols-1 items-center border-gray-200 border-t dark:border-gray-700 justify-between">
      </div>
    </div>
  );
}