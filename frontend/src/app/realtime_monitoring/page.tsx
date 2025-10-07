"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

const timeRanges = [
  "1AM - 8AM",
  "9AM - 10AM",
  "11AM - 2PM",
  "3PM - 5PM",
  "6PM - 9PM",
  "10PM - 12AM",
];

const preferredOrder = ["Edisons", "Mytopia", "eBay", "BigW", "Mydeals", "Kogan", "Bunnings","Amazon DF", "Everyday Market"];
const comboChannels = ["Edisons", "Mytopia"];

export default function RealTimeMonitoringPage() {
  const [todayData, setTodayData] = useState<any>({});
  const [prevData, setPrevData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, getRefreshIntervalSummary());
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [todayRes, prevRes] = await Promise.all([
        axios.get(`${apiUrl}/today-sales`),
        axios.get(`${apiUrl}/prev-sales`),
      ]);
      setTodayData(todayRes.data);
      setPrevData(prevRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load data", err);
    }
  };

  const getPercentDiff = (sales: number, benchmark: number) => {
    if (benchmark === 0) return sales === 0 ? "0.00%" : "";
    let diff = ((sales - benchmark) / benchmark) * 100;
    if (diff > 999.99) diff = 999.99;
    if (diff < -999.99) diff = -999.99;
    return diff.toFixed(2) + "%";
  };

  const parseHour = (timeStr: string) => {
    const hour = parseInt(timeStr, 10);
    const isPM = timeStr.toUpperCase().includes("PM");
    if (timeStr.trim().toUpperCase() === "12AM") return 0;
    if (timeStr.trim().toUpperCase() === "12PM") return 12;
    return isPM ? (hour === 12 ? 12 : hour + 12) : hour;
  };

  const isFutureRange = (range: string) => {
    const currentHour = new Date().getHours();
    const startHour = parseHour(range.split(" - ")[0].trim());
    return currentHour < startHour;
  };

  const isCurrentRange = (range: string) => {
    const now = new Date();
    const currentHour = now.getHours();
    const [start, end] = range.split(" - ").map((t) => t.trim());
    const startHour = parseHour(start);
    const endHour = parseHour(end);
    if (endHour < startHour) {
      return currentHour >= startHour || currentHour < endHour;
    }
    return currentHour >= startHour && currentHour < endHour;
  };

  const allTimeRangesCompleted = () =>
    timeRanges.every((range) => !isFutureRange(range));

  if (loading) return <div className="text-gray-500 dark:text-gray-300">Loading...</div>;

  const comboToday: Record<string, number> = {};
  const comboPrev: Record<string, number> = {};
  comboChannels.forEach((channel) => {
    timeRanges.forEach((range) => {
      comboToday[range] = (comboToday[range] || 0) + (todayData[channel]?.[range] || 0);
      comboPrev[range] = (comboPrev[range] || 0) + (prevData[channel]?.[range] || 0);
    });
  });

  return (
      <table className="min-w-full border border-gray-300 dark:border-gray-700 text-sm text-left text-gray-700 dark:text-gray-200">
        <thead className="bg-blue-50 dark:bg-blue-900 sticky top-0 z-10">
          <tr>
            <th className=" px-2 py-1 bg-blue-100 dark:bg-blue-800">Sales Channel</th>
            {timeRanges.map((range) => (
              <th key={range} className=" px-2 py-1 bg-cyan-100 dark:bg-cyan-800 text-xs" colSpan={2}>
                {range}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comboChannels.map((channel) => (
            <tr key={channel} className=" even:bg-gray-50 dark:even:bg-gray-800">
              <td className=" px-2 py-1 font-semibold">{channel}</td>
              {timeRanges.map((range) => {
                const today = todayData[channel]?.[range] || 0;
                const future = isFutureRange(range);
                return (
                  <React.Fragment key={range}>
                    <td className={` px-2 py-1 text-blue-500 font-semibold dark:text-blue-400 ${future ? "text-gray-400 dark:text-gray-600" : isCurrentRange(range) ? "animate-pulse" : ""}`}>
                      {future ? "" : today}
                    </td>
                    <td className=" px-2 py-1 text-gray-400 dark:text-gray-600"></td>
                  </React.Fragment>
                );
              })}
            </tr>
          ))}

          <tr className="bg-gray-200 dark:bg-gray-700 ">
            <td className="px-2 py-1 font-bold">TOTAL (Edisons + Mytopia)</td>
            {timeRanges.map((range) => {
              const today = comboToday[range] || 0;
              const prev = comboPrev[range] || 0;
              const future = isFutureRange(range);
              const diff = getPercentDiff(today, prev);
              const colorClass =
                today < prev * 0.5
                  ? "text-red-700 dark:text-red-400 font-extrabold"
                  : "text-green-600 dark:text-green-400 font-bold";
              return (
                <React.Fragment key={range}>
                  <td className={` px-2 py-1 text-blue-500 font-semibold dark:text-blue-400 ${future ? "text-gray-400 dark:text-gray-600" : isCurrentRange(range) ? "animate-pulse" : ""}`}>
                    {future ? "" : today}
                  </td>
                  <td className={` px-2 py-1 ${future ? "text-gray-400 dark:text-gray-600" : colorClass}`}>
                    {future ? "" : diff}
                  </td>
                </React.Fragment>
              );
            })}
          </tr>

          <tr>
            <td className=" px-2 py-1 text-gray-500 dark:text-gray-400 italic">Benchmark</td>
            {timeRanges.map((range) => (
              <td key={range} className="bo px-2 py-1 text-yellow-800 dark:text-yellow-400 font-semibold" colSpan={2}>
                {isFutureRange(range) ? "" : comboPrev[range] || 0}
              </td>
            ))}
          </tr>

          <tr>
            <td className=" px-2 py-1 text-gray-500 dark:text-gray-400 italic">
              Alert below 50% of Benchmark
            </td>
            {timeRanges.map((range) => {
              if (allTimeRangesCompleted()) {
                const today = comboToday[range] || 0;
                const prev = comboPrev[range] || 0;
                const isRedFlag = prev > 0 && today < prev * 0.5;
                return (
                  <td key={range} className=" px-2 py-1 text-center font-bold text-red-700 dark:text-red-400" colSpan={2}>
                    {isRedFlag ? "🚩" : ""}
                  </td>
                );
              }
              return <td key={range} className=" px-2 py-1" colSpan={2}></td>;
            })}
          </tr>

          <tr>
            <td className=" px-2 py-1 text-gray-500 dark:text-gray-400 italic">50% of Benchmark</td>
            {timeRanges.map((range) => {
              const val = comboPrev[range] || 0;
              return (
                <td key={range} className=" px-2 py-1 text-red-700 dark:text-red-400 font-semibold" colSpan={2}>
                  {isFutureRange(range) ? "" : (val / 2).toFixed(0)}
                </td>
              );
            })}
          </tr>

          {preferredOrder.map((channel) => {
            if (comboChannels.includes(channel)) return null;
            if (!todayData[channel] && !prevData[channel]) return null;
            return (
              <React.Fragment key={channel}>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <td className=" px-2 py-1 font-bold">{channel}</td>
                  {timeRanges.map((range) => {
                    const today = todayData[channel]?.[range] || 0;
                    const prev = prevData[channel]?.[range] || 0;
                    const future = isFutureRange(range);
                    const diff = getPercentDiff(today, prev);
                    const colorClass =
                      today < prev * 0.5
                        ? "text-red-700 dark:text-red-400 font-extrabold"
                        : "text-green-600 dark:text-green-400 font-bold";
                    return (
                      <React.Fragment key={range}>
                        <td className={` px-2 py-1 text-blue-500 font-semibold dark:text-blue-400 ${future ? "text-gray-400 dark:text-gray-600" : isCurrentRange(range) ? "animate-pulse" : ""}`}>
                          {future ? "" : today}
                        </td>
                        <td className={` px-2 py-1 ${future ? "text-gray-400 dark:text-gray-600" : colorClass}`}>
                          {future ? "" : diff}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
                <tr>
                  <td className=" px-2 py-1 text-gray-500 dark:text-gray-400 italic">Benchmark</td>
                  {timeRanges.map((range) => (
                    <td key={range} className=" px-2 py-1 text-yellow-800 dark:text-yellow-400 font-semibold" colSpan={2}>
                      {isFutureRange(range) ? "" : prevData[channel]?.[range] || 0}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className=" px-2 py-1 text-gray-500 dark:text-gray-400 italic">
                    Alert below 50% of Benchmark
                  </td>
                  {timeRanges.map((range) => {
                    if (allTimeRangesCompleted()) {
                      const today = todayData[channel]?.[range] || 0;
                      const prev = prevData[channel]?.[range] || 0;
                      const isRedFlag = prev > 0 && today < prev * 0.5;
                      return (
                        <td key={range} className=" px-2 py-1 text-center font-bold text-red-700 dark:text-red-400" colSpan={2}>
                          {isRedFlag ? "🚩" : ""}
                        </td>
                      );
                    }
                    return <td key={range} className=" px-2 py-1" colSpan={2}></td>;
                  })}
                </tr>
                <tr>
                  <td className=" px-2 py-1 text-gray-500 dark:text-gray-400 italic">50% of Benchmark</td>
                  {timeRanges.map((range) => {
                    const val = prevData[channel]?.[range] || 0;
                    return (
                      <td key={range} className=" px-2 py-1 text-red-700 dark:text-red-400 font-semibold" colSpan={2}>
                        {isFutureRange(range) ? "" : (val / 2).toFixed(0)}
                      </td>
                    );
                  })}
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
  );
}

function getRefreshIntervalSummary() {
  const hour = new Date().getHours();
  if (hour < 8) return 5 * 60 * 1000;
  if (hour < 10) return 3 * 60 * 1000;
  if (hour < 14) return 3 * 60 * 1000;
  if (hour < 17) return 3 * 60 * 1000;
  if (hour < 21) return 3 * 60 * 1000;
  return 10 * 60 * 1000;
}
