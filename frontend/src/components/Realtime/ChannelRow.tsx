import React from "react";
import {
  timeRanges,
  isFutureRange,
  isCurrentRange,
  getPercentDiff,
} from "@/lib/salesUtils";
import BenchmarkRow from "./BenchmarkRow";
import AlertRow from "./AlertRow";
import FiftyPercentRow from "./FiftyPercentRow";

interface Props {
  channel: string;
  todayData: any;
  prevData: any;
}

export default function ChannelRow({ channel, todayData, prevData }: Props) {
  const allTimeRangesCompleted = () =>
    timeRanges.every((range) => !isFutureRange(range));

  const today: Record<string, number> = {};
  const prev: Record<string, number> = {};

  timeRanges.forEach((range) => {
    today[range] = todayData[channel]?.[range] || 0;
    prev[range] = prevData[channel]?.[range] || 0;
  });

  return (
    <>
      <tr className="bg-gray-200">
        <td className="px-2 py-1 font-bold">{channel}</td>
        {timeRanges.map((range) => {
          const todayVal = today[range];
          const prevVal = prev[range];
          const future = isFutureRange(range);
          const diff = getPercentDiff(todayVal, prevVal);
          const colorClass =
            todayVal < prevVal * 0.5
              ? "text-red-700 font-extrabold"
              : "text-green-600 font-bold";

          return (
            <React.Fragment key={range}>
              <td
                className={`px-2 py-1 text-blue-500 font-semibold ${
                  future ? "text-gray-400" : isCurrentRange(range) ? "animate-pulse" : ""
                }`}
              >
                {future ? "" : todayVal}
              </td>
              <td className={`px-2 py-1 ${future ? "text-gray-400" : colorClass}`}>
                {future ? "" : diff}
              </td>
            </React.Fragment>
          );
        })}
      </tr>

      <BenchmarkRow data={prev} />
      <AlertRow today={today} prev={prev} allCompleted={allTimeRangesCompleted()} />
      <FiftyPercentRow data={prev} />
    </>
  );
}
