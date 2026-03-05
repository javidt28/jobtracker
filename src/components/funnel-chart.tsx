"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = [
  "hsl(174, 58%, 39%)",   // teal
  "hsl(174, 58%, 45%)",
  "hsl(174, 58%, 52%)",
  "hsl(174, 58%, 60%)",
  "hsl(174, 30%, 70%)",
];

const CHART_HEIGHT = 256;

interface FunnelChartProps {
  data: { name: string; value: number }[];
}

export function FunnelChart({ data }: FunnelChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-full" style={{ height: CHART_HEIGHT }} aria-hidden />;
  }

  if (!data?.length) {
    return (
      <div className="flex h-64 w-full items-center justify-center text-sm text-[var(--muted-foreground)]">
        No data to display
      </div>
    );
  }

  return (
    <div className="w-full" style={{ minHeight: CHART_HEIGHT, height: CHART_HEIGHT }}>
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={80}
            tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "var(--foreground)" }}
            formatter={(value: number | undefined) => [value ?? 0, "Applications"]}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={32}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
