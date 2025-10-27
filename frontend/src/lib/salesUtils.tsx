export const timeRanges = [
  "1AM - 8AM",
  "9AM - 10AM",
  "11AM - 2PM",
  "3PM - 5PM",
  "6PM - 9PM",
  "10PM - 12AM",
];

export const preferredOrder = [
  "Edisons",
  "Mytopia",
  "eBay",
  "BigW",
  "Mydeals",
  "Kogan",
  "Bunnings",
  "Amazon DF",
  "Everyday Market",
];

export const comboChannels = ["Edisons", "Mytopia"];

export function parseHour(timeStr: string) {
  const hour = parseInt(timeStr, 10);
  const isPM = timeStr.toUpperCase().includes("PM");
  if (timeStr.trim().toUpperCase() === "12AM") return 0;
  if (timeStr.trim().toUpperCase() === "12PM") return 12;
  return isPM ? (hour === 12 ? 12 : hour + 12) : hour;
}

export function isFutureRange(range: string) {
  const currentHour = new Date().getHours();
  const startHour = parseHour(range.split(" - ")[0].trim());
  return currentHour < startHour;
}

export function isCurrentRange(range: string) {
  const now = new Date();
  const currentHour = now.getHours();
  const [start, end] = range.split(" - ").map((t) => t.trim());
  const startHour = parseHour(start);
  const endHour = parseHour(end);
  if (endHour < startHour) {
    return currentHour >= startHour || currentHour < endHour;
  }
  return currentHour >= startHour && currentHour < endHour;
}

export function getPercentDiff(sales: number, benchmark: number) {
  if (benchmark === 0) return sales === 0 ? "0.00%" : "";
  let diff = ((sales - benchmark) / benchmark) * 100;
  if (diff > 999.99) diff = 999.99;
  if (diff < -999.99) diff = -999.99;
  return diff.toFixed(2) + "%";
}

export function getRefreshIntervalSummary() {
  const hour = new Date().getHours();
  if (hour < 8) return 5 * 60 * 1000;
  if (hour < 10) return 3 * 60 * 1000;
  if (hour < 14) return 3 * 60 * 1000;
  if (hour < 17) return 3 * 60 * 1000;
  if (hour < 21) return 3 * 60 * 1000;
  return 10 * 60 * 1000;
}
