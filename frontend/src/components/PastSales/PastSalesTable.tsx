"use client";

import React, { useState } from "react";
import {comboChannels, preferredOrder, timeRanges } from "@/components/PastSales/usePastSalesData";

interface Props {
  todayData: Record<string, Record<string, number>>;
  prevData: Record<string, Record<string, number>>;
}

export default function PastSalesTable({ todayData, prevData }: Props) {
  const [collapsed, setCollapsed] = useState(true);

  const getPercentDiff = (sales: number, benchmark: number) => {
    if (benchmark === 0) return sales === 0 ? "0.00%" : "";
    let diff = ((sales - benchmark) / benchmark) * 100;
    diff = Math.max(Math.min(diff, 999.99), -999.99);
    return diff.toFixed(2) + "%";
  };

  // Calculate combo totals
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

  return (
    <div className="overflow-x-auto"> 
      <div className="mb-2 font-semibold text-center">Sales Data Table</div>
      <table className="min-w-full border border-gray-400 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Sales Channel</th>
            {timeRanges.map((range) => (
              <React.Fragment key={range}>
                <th className="border px-2 py-1 bg-cyan-100">{range}</th>
                <th className="border px-2 py-1">% Diff</th>
              </React.Fragment>
            ))}
            <th className="border px-2 py-1">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {/* Website combo row */}
          <tr
            className="bg-gray-200 cursor-pointer"
            onClick={() => setCollapsed(!collapsed)}
          >
            <td className="border px-2 py-1 font-bold">
              <span
                className={`inline-block mr-1 transition-transform ${
                  collapsed ? "-rotate-90" : ""
                }`}
              >
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
                ? "text-red-600 font-bold"
                : "text-green-600 font-bold";
              return (
                <React.Fragment key={range}>
                  <td className="border px-2 py-1 text-blue-600 font-semibold">
                    {today}
                  </td>
                  <td className={`border px-2 py-1 ${colorClass}`}>{diff}</td>
                </React.Fragment>
              );
            })}
            <td className="border px-2 py-1 font-bold text-blue-600">
              {comboTodayTotal}
            </td>
          </tr>

          {/* Website child rows */}
          {!collapsed &&
            comboChannels.map((channel) => (
              <tr key={channel} className="even:bg-gray-50">
                <td className="border px-2 py-1 pl-6 font-semibold">
                  ↳ {channel}
                </td>
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
            let totalToday = 0;
            return (
              <tr key={channel} className="bg-gray-200">
                <td className="border px-2 py-1 font-bold">{channel}</td>
                {timeRanges.map((range) => {
                  const today = todayData[channel]?.[range] || 0;
                  const prev = prevData[channel]?.[range] || 0;
                  const diff = getPercentDiff(today, prev);
                  const isBelow50 = prev > 0 && today < prev * 0.5;
                  const colorClass = isBelow50
                    ? "text-red-600 font-bold"
                    : "text-green-600 font-bold";
                  totalToday += today;
                  return (
                    <React.Fragment key={range}>
                      <td className="border px-2 py-1 text-blue-600 font-semibold">
                        {today}
                      </td>
                      <td className={`border px-2 py-1 ${colorClass}`}>
                        {diff}
                      </td>
                    </React.Fragment>
                  );
                })}
                <td className="border px-2 py-1 font-bold text-blue-600">
                  {totalToday}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
