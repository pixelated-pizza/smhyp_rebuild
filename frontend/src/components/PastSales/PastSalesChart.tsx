"use client";

import React, { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  LineElement,
  LineController,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  ChartConfiguration,
  Chart,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { timeRanges } from "./usePastSalesData";

ChartJS.register(
  LineElement,
  LineController,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface Props {
  todayData: Record<string, Record<string, number>>;
  prevData: Record<string, Record<string, number>>;
  selectedChannel: string;
}

export default function PastSalesChart({
  todayData,
  prevData,
  selectedChannel,
}: Props) {
  const chartRef = useRef<Chart<"line", (number | null)[], string> | null>(null);

  useEffect(() => {
    renderChart(selectedChannel);
  }, [todayData, prevData, selectedChannel]);

  const renderChart = (channelKey: string) => {
    // const ctx = document
    //   .getElementById("pastLineChart")
    //   ?.getContext("2d") as CanvasRenderingContext2D;
    // if (!ctx) return;

    const canvas = document.getElementById("pastLineChart") as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;


    // destroy existing chart instance if it exists
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Prepare chart data
    const getSalesData = (
      source: Record<string, Record<string, number>>,
      channel: string
    ) =>
      channel === "combo"
        ? timeRanges.map(
            (r) => (source["Edisons"]?.[r] || 0) + (source["Mytopia"]?.[r] || 0)
          )
        : timeRanges.map((r) => source[channel]?.[r] || 0);

    const salesToday = getSalesData(todayData, channelKey);
    const salesPrev = getSalesData(prevData, channelKey);

    // Mark points that are below 50% of the benchmark
    const below50Flags: (number | null)[] = salesToday.map((v, i) =>
      salesPrev[i] > 0 && v <= salesPrev[i] * 0.5 ? v : null
    );

    // 🚩 Custom Plugin — draw red flag emojis on points below 50%
    const redFlagPlugin = {
      id: "redFlagEmoji",
      afterDatasetsDraw(chart: Chart<"line", (number | null)[], string>) {
        const datasetIndex = chart.data.datasets.findIndex(
          (d) => d.label === "🚩 Below 50%"
        );
        if (datasetIndex === -1) return;

        const meta = chart.getDatasetMeta(datasetIndex);
        const ctx = chart.ctx;
        meta.data.forEach((point, index) => {
          const val = chart.data.datasets[datasetIndex].data[index];
          if (val != null) {
            ctx.save();
            ctx.font = "18px Segoe UI Emoji";
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.fillText("🚩", point.x + 5, point.y - 28);
            ctx.restore();
          }
        });
      },
    };

    // Chart configuration
    const config: ChartConfiguration<"line", (number | null)[], string> = {
      type: "line",
      data: {
        labels: timeRanges,
        datasets: [
          {
            label:
              channelKey === "combo" ? "Website Orders" : `${channelKey} Orders`,
            data: salesToday,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59,130,246,0.1)",
            pointBackgroundColor: "#3b82f6",
            fill: "origin",
            tension: 0,
          },
          {
            label: "50% of Benchmark",
            data: salesPrev.map((v) => v * 0.5),
            borderDash: [5, 5],
            borderColor: "red",
            borderWidth: 1,
            pointRadius: 0,
            tension: 0,
          },
          {
            label:
              channelKey === "combo"
                ? "Website Benchmark"
                : `${channelKey} Benchmark`,
            data: salesPrev,
            borderColor: "orange",
            backgroundColor: "rgba(255,213,128,0.4)",
            fill: "origin",
            tension: 0,
          },
          {
            label: "🚩 Below 50%",
            data: below50Flags,
            showLine: false,
            borderWidth: 0,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text:
              channelKey === "combo"
                ? "Website (Edisons + Mytopia)"
                : channelKey,
          },
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label || ""}: ${ctx.raw}`,
            },
          },
        },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "Number of Sales" } },
          x: { title: { display: true, text: "Time Range" } },
        },
      },
      plugins: [ChartDataLabels, redFlagPlugin],
    };

    chartRef.current = new ChartJS(ctx, config);
  };

  return (
    <div className="h-96 mt-4">
      <canvas id="pastLineChart"></canvas>
    </div>
  );
}
