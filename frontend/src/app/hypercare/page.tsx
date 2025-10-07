"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
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
import { Context } from "chartjs-plugin-datalabels";


const apiUrl = process.env.NEXT_PUBLIC_API_URL;

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

const timeRanges = [
  "1AM - 8AM",
  "9AM - 10AM",
  "11AM - 2PM",
  "3PM - 5PM",
  "6PM - 9PM",
  "10PM - 12AM",
];

const preferredOrder = ["Edisons", "Mytopia", "eBay", "BigW", "Mydeals", "Kogan", "Bunnings"];
const comboChannels = ["Edisons", "Mytopia"];

export default function PastSalesPage() {
  const [todayData, setTodayData] = useState<Record<string, Record<string, number>>>({});
  const [prevData, setPrevData] = useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState("combo");
  const [collapsed, setCollapsed] = useState(true);

  const chartRef = useRef<Chart<"line", (number | null)[], string> | null>(null);

  // Fetch data from APIs
  const fetchData = async () => {
    try {
      const [todayRes, prevRes] = await Promise.all([
        axios.get(`${apiUrl}/yesterday-sales`),
        axios.get(`${apiUrl}/last-week`),
      ]);
      setTodayData(todayRes.data);
      setPrevData(prevRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Percent difference
  const getPercentDiff = (sales: number, benchmark: number) => {
    if (benchmark === 0) return sales === 0 ? "0.00%" : "";
    let diff = ((sales - benchmark) / benchmark) * 100;
    diff = Math.max(Math.min(diff, 999.99), -999.99);
    return diff.toFixed(2) + "%";
  };

  // Combo totals
  const comboToday: Record<string, number> = {};
  const comboPrev: Record<string, number> = {};
  let comboTodayTotal = 0,
    comboPrevTotal = 0;

  timeRanges.forEach((range) => {
    const today =
      (todayData["Edisons"]?.[range] || 0) +
      (todayData["Mytopia"]?.[range] || 0);
    const prev =
      (prevData["Edisons"]?.[range] || 0) +
      (prevData["Mytopia"]?.[range] || 0);
    comboToday[range] = today;
    comboPrev[range] = prev;
    comboTodayTotal += today;
    comboPrevTotal += prev;
  });

  // Render chart when data changes
  useEffect(() => {
    if (!loading) renderChart(selectedChannel);
  }, [todayData, prevData, selectedChannel, loading]);

  const renderChart = (channelKey: string) => {
    const ctx = (document.getElementById("pastLineChart") as HTMLCanvasElement).getContext("2d");
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const getSalesData = (source: Record<string, Record<string, number>>, channel: string) =>
      channel === "combo"
        ? timeRanges.map((r) => (source["Edisons"]?.[r] || 0) + (source["Mytopia"]?.[r] || 0))
        : timeRanges.map((r) => source[channel]?.[r] || 0);

    const salesToday = getSalesData(todayData, channelKey);
    const salesPrev = getSalesData(prevData, channelKey);

    const below50Flags: (number | null)[] = salesToday.map((v, i) =>
      salesPrev[i] > 0 && v <= salesPrev[i] * 0.5 ? v : null
    );

    // Red flag plugin
    const redFlagPlugin = {
      id: "redFlagEmoji",
      afterDatasetsDraw(chart: Chart<"line", (number | null)[], string>) {
        const datasetIndex = chart.data.datasets.findIndex(d => d.label === "🚩 Below 50%");
        if (datasetIndex === -1) return;

        const meta = chart.getDatasetMeta(datasetIndex);
        meta.data.forEach((point, index) => {
          const val = chart.data.datasets[datasetIndex].data[index];
          if (val != null) {
            const ctx = chart.ctx;
            ctx.save();
            ctx.font = "18px Segoe UI Emoji";
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.fillText("🚩", point.x + 5, point.y - 28);
            ctx.restore();
          }
        });
      }
    };

    const config: ChartConfiguration<"line", (number | null)[], string> = {
      type: "line",
      data: {
        labels: timeRanges,
        datasets: [
          {
            label: channelKey === "combo" ? "Website Orders" : `${channelKey} Orders`,
            data: salesToday,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59,130,246,0.1)",
            pointBackgroundColor: "#3b82f6",
            fill: "origin",
            tension: 0,
            order: 0,
          },
          {
            label: "50% of Benchmark",
            data: salesPrev.map(v => v * 0.5),
            borderDash: [5, 5],
            borderColor: "red",
            borderWidth: 1,
            pointRadius: 0,
            tension: 0,
            order: 1,
          },
          {
            label: channelKey === "combo" ? "Website Benchmark" : `${channelKey} Benchmark`,
            data: salesPrev,
            borderColor: "orange",
            backgroundColor: "rgba(255,213,128,0.4)",
            fill: "origin",
            tension: 0,
            order: 2,
          },
          {
            label: "🚩 Below 50%",
            data: below50Flags,
            showLine: false,
            borderWidth: 0,
            pointRadius: 0,
            order: 3,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: channelKey === "combo" ? "Website" : channelKey },
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.dataset.label || ""}: ${ctx.raw}`,
            },
          },
          datalabels: {
            display: (context: Context) =>
              (context.dataset.label || "").includes("Orders"),
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

  if (loading) return <div className="text-gray-500 dark:text-gray-300">Loading...</div>;

  return (
    <div className="p-4 text-gray-700 dark:text-gray-200">
      <div className="mb-2 font-semibold text-center">Sales Data Table</div>

      {/* Table */}
      <table className="min-w-full border border-gray-400 dark:border-gray-700 text-sm">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th className="border px-2 py-1">Sales Channel</th>
            {timeRanges.map((range) => (
              <React.Fragment key={range}>
                <th className="border px-2 py-1 bg-cyan-100 dark:bg-cyan-800">{range}</th>
                <th className="border px-2 py-1">% Diff</th>
              </React.Fragment>
            ))}
            <th className="border px-2 py-1">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {/* Website combo row */}
          <tr
            className="bg-gray-200 dark:bg-gray-700 cursor-pointer"
            onClick={() => setCollapsed(!collapsed)}
          >
            <td className="border px-2 py-1 font-bold">
              <span className={`inline-block mr-1 transition-transform ${collapsed ? "-rotate-90" : ""}`}>
                ▸
              </span>{" "}
              Website
            </td>
            {timeRanges.map((range) => {
              const today = comboToday[range] || 0;
              const prev = comboPrev[range] || 0;
              const diff = getPercentDiff(today, prev);
              const isBelow50 = prev > 0 && today < prev * 0.5;
              const colorClass = isBelow50
                ? "text-red-600 dark:text-red-400 font-bold"
                : "text-green-600 dark:text-green-400 font-bold";
              return (
                <React.Fragment key={range}>
                  <td className="border px-2 py-1 text-blue-600 dark:text-blue-400 font-semibold">{today}</td>
                  <td className={`border px-2 py-1 ${colorClass}`}>{diff}</td>
                </React.Fragment>
              );
            })}
            <td className="border px-2 py-1 font-bold text-blue-600 dark:text-blue-400">{comboTodayTotal}</td>
          </tr>

          {/* Website child rows */}
          {!collapsed &&
            comboChannels.map((channel) => (
              <tr key={channel} className="even:bg-gray-50 dark:even:bg-gray-800">
                <td className="border px-2 py-1 pl-6 font-semibold">↳ {channel}</td>
                {timeRanges.map((range) => {
                  const today = todayData[channel]?.[range] || 0;
                  return (
                    <React.Fragment key={range}>
                      <td className="border px-2 py-1">{today}</td>
                      <td className="border px-2 py-1"></td>
                    </React.Fragment>
                  );
                })}
                <td className="border px-2 py-1"></td>
              </tr>
            ))}

          {/* Other channels */}
          {preferredOrder.map((channel) => {
            if (comboChannels.includes(channel)) return null;
            if (!todayData[channel] && !prevData[channel]) return null;
            let totalToday = 0,
              totalPrev = 0;
            return (
              <React.Fragment key={channel}>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <td className="border px-2 py-1 font-bold">{channel}</td>
                  {timeRanges.map((range) => {
                    const today = todayData[channel]?.[range] || 0;
                    const prev = prevData[channel]?.[range] || 0;
                    const diff = getPercentDiff(today, prev);
                    const isBelow50 = prev > 0 && today < prev * 0.5;
                    const colorClass = isBelow50
                      ? "text-red-600 dark:text-red-400 font-bold"
                      : "text-green-600 dark:text-green-400 font-bold";
                    totalToday += today;
                    totalPrev += prev;
                    return (
                      <React.Fragment key={range}>
                        <td className="border px-2 py-1 text-blue-600 dark:text-blue-400 font-semibold">{today}</td>
                        <td className={`border px-2 py-1 ${colorClass}`}>{diff}</td>
                      </React.Fragment>
                    );
                  })}
                  <td className="border px-2 py-1 font-bold text-blue-600 dark:text-blue-400">{totalToday}</td>
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {/* Chart */}
      <div className="mt-6">
        <label className="mr-2">Select Channel:</label>
        <select
          value={selectedChannel}
          onChange={(e) => setSelectedChannel(e.target.value)}
          className="border rounded px-2 py-1 dark:bg-gray-800 dark:text-gray-200"
        >
          <option value="combo">Website</option>
          {preferredOrder.map((ch) =>
            comboChannels.includes(ch) ? null : <option key={ch} value={ch}>{ch}</option>
          )}
        </select>
        <div className="h-96 mt-4">
          <canvas id="pastLineChart"></canvas>
        </div>
      </div>
    </div>
  );
}
