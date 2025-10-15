"use client";
import { useEffect } from "react";
import ApexCharts from "apexcharts";

export default function TableChartTruck() {
  useEffect(() => {
    const el = document.querySelector(".chart-card");
    const backgroundColor = el
      ? getComputedStyle(el).backgroundColor
      : "#ffffff";

    const options = {
    chart: {
        type: "bar",
        height: 200,
        toolbar: { show: false },
        background: ["#ffffff"],
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
        data: [400, 300, 500],
        },
    ],
    xaxis: {
        categories: ["Truck A", "Truck B", "Truck C"],
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
  }, []);

  return (
    <div className="chart-card max-w-sm w-full bg-white rounded-lg shadow-sm dark:bg-white p-4 md:p-6">
      <div className="flex justify-between border-gray-200 border-b dark:border-gray-700 pb-3">
        <dl>
          <dt className="text-base font-normal text-gray-500 dark:text-gray-400 pb-1">
            Profit
          </dt>
          <dd className="leading-none text-3xl font-bold text-gray-900 dark:text-gray-900">
            $5,405
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
