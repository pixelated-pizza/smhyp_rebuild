// import React from "react";
// import { timeRanges, isFutureRange } from "@/lib/salesUtils";

// interface Props {
//   data: Record<string, number>;
// }

// export default function FiftyPercentRow({ data }: Props) {
//   return (
//     <tr>
//       <td className="px-2 py-1 text-gray-500 italic">50% of Benchmark</td>
//       {timeRanges.map((range) => {
//         const val = data[range] || 0;
//         return (
//           <td
//             key={range}
//             className="px-2 py-1 text-red-700 font-semibold"
//             colSpan={2}
//           >
//             {isFutureRange(range) ? "" : (val / 2).toFixed(0)}
//           </td>
//         );
//       })}
//     </tr>
//   );
// }

import React from "react";

interface FiftyPercentRowProps {
  data: Record<string, number>;
}

export default function FiftyPercentRow({ data }: FiftyPercentRowProps) {
  return (
    <tr>
      <td className="px-2 py-1 text-gray-500 italic">50% of Benchmark</td>
      {Object.keys(data).map((range) => (
        <td
          key={range}
          className="px-2 py-1 text-center text-blue-600 font-semibold"
          colSpan={2}
        >
          {(data[range] * 0.5).toFixed(0)}
        </td>
      ))}
    </tr>
  );
}
