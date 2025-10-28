"use client";
import React from "react";
import {
  comboChannels,
  preferredOrder,
  timeRanges,
} from "@/lib/salesUtils";
import ComboRow from "@/components/Realtime/ComboRow";
import ChannelRow from "@/components/Realtime/ChannelRow";

interface Props {
  todayData: any;
  prevData: any;
}

export default function RealtimeMonitoringTable({ todayData, prevData }: Props) {
  const comboToday: Record<string, number> = {};
  const comboPrev: Record<string, number> = {};

  comboChannels.forEach((channel) => {
    timeRanges.forEach((range) => {
      comboToday[range] = (comboToday[range] || 0) + (todayData[channel]?.[range] || 0);
      comboPrev[range] = (comboPrev[range] || 0) + (prevData[channel]?.[range] || 0);
    });
  });

  return (
    <div className="w-full">
      <div className="w-full overflow-x-auto rounded-lg shadow-sm">
        <table className="min-w-full w-full border-collapse border border-gray-300 text-sm text-left text-gray-700 table-fixed">
          <thead className="bg-blue-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2 bg-blue-100 w-40">Sales Channel</th>
              {timeRanges.map((range) => (
                <th
                  key={range}
                  className="px-4 py-2 bg-cyan-100 text-xs text-center"
                  colSpan={2}
                >
                  {range}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Combo Section */}
            <ComboRow comboToday={comboToday} comboPrev={comboPrev} />

            {/* Other Channels */}
            {preferredOrder.map((channel) => {
              if (comboChannels.includes(channel)) return null;
              if (!todayData[channel] && !prevData[channel]) return null;
              return (
                <ChannelRow
                  key={channel}
                  channel={channel}
                  todayData={todayData}
                  prevData={prevData}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
