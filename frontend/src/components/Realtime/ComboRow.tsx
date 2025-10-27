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
  comboToday: Record<string, number>;
  comboPrev: Record<string, number>;
}

export default function ComboRow({ comboToday, comboPrev }: Props) {
  const allTimeRangesCompleted = () =>
    timeRanges.every((range) => !isFutureRange(range));

  return (
    <>
      <tr className="bg-gray-200">
        <td className="px-2 py-1 font-bold">TOTAL (Edisons + Mytopia)</td>
        {timeRanges.map((range) => {
          const today = comboToday[range] || 0;
          const prev = comboPrev[range] || 0;
          const future = isFutureRange(range);
          const diff = getPercentDiff(today, prev);
          const colorClass =
            today < prev * 0.5
              ? "text-red-700 font-extrabold"
              : "text-green-600 font-bold";

          return (
            <React.Fragment key={range}>
              <td
                className={`px-2 py-1 text-blue-500 font-semibold ${
                  future ? "text-gray-400" : isCurrentRange(range) ? "animate-pulse" : ""
                }`}
              >
                {future ? "" : today}
              </td>
              <td className={`px-2 py-1 ${future ? "text-gray-400" : colorClass}`}>
                {future ? "" : diff}
              </td>
            </React.Fragment>
          );
        })}
      </tr>

      <BenchmarkRow data={comboPrev} />
      <AlertRow today={comboToday} prev={comboPrev} allCompleted={allTimeRangesCompleted()} />
      <FiftyPercentRow data={comboPrev} />
    </>
  );
}
