// import React from "react";
// import { timeRanges, isFutureRange } from "@/lib/salesUtils";

// interface Props {
//   data: Record<string, number>;
// }

// export default function BenchmarkRow({ data }: Props) {
//   return (
//     <tr>
//       <td className="px-2 py-1 text-gray-500 italic">Benchmark</td>
//       {timeRanges.map((range) => (
//         <td
//           key={range}
//           className="px-2 py-1 text-yellow-800 font-semibold"
//           colSpan={2}
//         >
//           {isFutureRange(range) ? "" : data[range] || 0}
//         </td>
//       ))}
//     </tr>
//   );
// }


import React from "react";

interface BenchmarkRowProps {
  data: Record<string, number>;
}

export default function BenchmarkRow({ data }: BenchmarkRowProps) {
  return (
    <tr>
      <td className="px-2 py-1 text-gray-500 italic">Benchmark</td>
      {Object.keys(data).map((range) => (
        <td
          key={range}
          className="px-2 py-1 text-yellow-800 font-semibold"
          colSpan={2}
        >
          {data[range] || 0}
        </td>
      ))}
    </tr>
  );
}
