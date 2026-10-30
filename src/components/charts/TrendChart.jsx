"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const COLORS = { doctors: "#0f766e", patients: "#2563eb" };

const tickLabel = (value, interval) => {
  const date = new Date(`${value}T00:00:00Z`);
  return interval === "month"
    ? date.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" })
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
};

export default function TrendChart({ series, interval }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={series} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="date" tickFormatter={(value) => tickLabel(value, interval)} minTickGap={28} tick={{ fontSize: 12, fill: "#475569" }} tickLine={false} axisLine={{ stroke: "#cbd5e1" }} />
        <YAxis allowDecimals={false} width={44} tick={{ fontSize: 12, fill: "#475569" }} tickLine={false} axisLine={false} />
        <Tooltip labelFormatter={(value) => tickLabel(value, interval)} contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0", fontSize: 13 }} />
        <Legend iconType="plainline" wrapperStyle={{ fontSize: 13, paddingTop: 8 }} />
        <Line type="monotone" dataKey="patients" name="New patients" stroke={COLORS.patients} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
        <Line type="monotone" dataKey="doctors" name="New doctors" stroke={COLORS.doctors} strokeWidth={2.5} strokeDasharray="6 3" dot={false} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
