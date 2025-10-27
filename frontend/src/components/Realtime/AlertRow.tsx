// import React from "react";
// import { timeRanges, isFutureRange } from "@/lib/salesUtils";

// interface Props {
//   today: Record<string, number>;
//   prev: Record<string, number>;
//   allCompleted: boolean;
// }

// export default function AlertRow({ today, prev, allCompleted }: Props) {
//   return (
//     <tr>
//       <td className="px-2 py-1 text-gray-500 italic">
//         Alert below 50% of Benchmark
//       </td>
//       {timeRanges.map((range) => {
//         if (allCompleted) {
//           const todayVal = today[range] || 0;
//           const prevVal = prev[range] || 0;
//           const isRedFlag = prevVal > 0 && todayVal < prevVal * 0.5;
//           return (
//             <td
//               key={range}
//               className="px-2 py-1 text-center font-bold text-red-700"
//               colSpan={2}
//             >
//               {isRedFlag ? "🚩" : ""}
//             </td>
//           );
//         }
//         return <td key={range} className="px-2 py-1" colSpan={2}></td>;
//       })}
//     </tr>
//   );
// }

import React from "react";

interface AlertRowProps {
  today: Record<string, number>;
  prev: Record<string, number>;
  allCompleted: boolean;
}

export default function AlertRow({ today, prev, allCompleted }: AlertRowProps) {
  return (
    <tr>
      <td className="px-2 py-1 text-gray-500 italic">
        Alert below 50% of Benchmark
      </td>
      {Object.keys(prev).map((range) => {
        if (!allCompleted) {
          return (
            <td key={range} className="px-2 py-1" colSpan={2}>
              {/* Empty until all time ranges completed */}
            </td>
          );
        }

        const todayVal = today[range] || 0;
        const prevVal = prev[range] || 0;
        const isRedFlag = prevVal > 0 && todayVal < prevVal * 0.5;

        return (
          <td
            key={range}
            className="px-2 py-1 text-center font-bold text-red-700"
            colSpan={2}
          >
            {isRedFlag ? "🚩" : ""}
          </td>
        );
      })}
    </tr>
  );
}
