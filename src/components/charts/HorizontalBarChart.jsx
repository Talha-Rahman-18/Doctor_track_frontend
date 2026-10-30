"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { truncate } from "../../lib/utils.js";

/** Horizontal bars keep long category names (doctor names, conditions) readable on phones. */
export default function HorizontalBarChart({ data, categoryKey, valueKey, valueLabel, color = "#0f766e" }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#475569" }} tickLine={false} axisLine={{ stroke: "#cbd5e1" }} />
        <YAxis type="category" dataKey={categoryKey} width={110} tickFormatter={(value) => truncate(value, 16)} tick={{ fontSize: 12, fill: "#334155" }} tickLine={false} axisLine={false} interval={0} />
        <Tooltip cursor={{ fill: "#f1f5f9" }} formatter={(value) => [value, valueLabel]} contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0", fontSize: 13 }} />
        <Bar dataKey={valueKey} name={valueLabel} fill={color} radius={[0, 4, 4, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}
