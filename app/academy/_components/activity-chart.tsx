"use client";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Point = { day: string; label: string; n: number };

/** Daily learning activity, last 14 days. Single series: the title names it, so no legend. */
export function ActivityChart({ data }: { data: Point[] }) {
  const total = data.reduce((s, d) => s + d.n, 0);
  return <figure style={{ margin: 0 }}>
    <div style={{ height: 210 }} aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: -22, bottom: 0 }} barCategoryGap={4}>
          <CartesianGrid vertical={false} stroke="rgb(255 255 255 / .06)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#8a94ad", fontSize: 11 }} interval={1} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#8a94ad", fontSize: 11 }} width={40} />
          <Tooltip cursor={{ fill: "rgb(255 255 255 / .05)" }} contentStyle={{ background: "#111827", border: "1px solid rgb(255 255 255 / .16)", borderRadius: 12, color: "#eef1fb", fontSize: 12 }} labelStyle={{ color: "#b7c0d8" }} itemStyle={{ color: "#eef1fb" }} formatter={(v) => [`${v} actions`, "Activity"]} labelFormatter={(_, p) => (p?.[0]?.payload as Point | undefined)?.day ?? ""} />
          <Bar dataKey="n" fill="#9b72f8" radius={[4, 4, 0, 0]} maxBarSize={26} />
        </BarChart>
      </ResponsiveContainer>
    </div>
    <figcaption className="a-muted" style={{ fontSize: ".75rem", marginTop: ".4rem" }}>{total} learning actions in the last 14 days (lessons, stages, studio saves, passport entries).</figcaption>
    <table className="sr-only"><caption>Daily learning activity</caption><thead><tr><th>Day</th><th>Actions</th></tr></thead><tbody>{data.map(d => <tr key={d.day}><td>{d.day}</td><td>{d.n}</td></tr>)}</tbody></table>
  </figure>;
}
