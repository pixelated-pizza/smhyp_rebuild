"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export interface SalesData {
  [channel: string]: {
    [range: string]: number;
  };
}

export const timeRanges = [
  "1AM - 8AM",
  "9AM - 10AM",
  "11AM - 2PM",
  "3PM - 5PM",
  "6PM - 9PM",
  "10PM - 12AM",
];

export const comboChannels = ["Edisons", "Mytopia"];
export const preferredOrder = [
  "Edisons",
  "Mytopia",
  "eBay",
  "BigW",
  "Mydeal",
  "Kogan",
  "Bunnings",
];

export function usePastSalesData() {
  const [todayData, setTodayData] = useState<SalesData>({});
  const [prevData, setPrevData] = useState<SalesData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [todayRes, prevRes] = await Promise.all([
          axios.get(`${apiUrl}/yesterday-sales`),
          axios.get(`${apiUrl}/last-week`),
        ]);
        setTodayData(todayRes.data);
        setPrevData(prevRes.data);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { todayData, prevData, loading };
}
