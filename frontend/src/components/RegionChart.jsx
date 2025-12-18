import PropTypes from "prop-types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function RegionChart({ data, theme = "light" }) {
  const isDark = theme === "dark";
  const textColor = isDark ? "#e2e8f0" : "#1e293b";
  const gridColor = isDark ? "rgba(148, 163, 184, 0.18)" : "rgba(148, 163, 184, 0.35)";

  return (
    <>
      <div className="chart-card__header">
        <h2>🏢 Sales by Region</h2>
        <span className="chart-card__meta">Revenue & order mix</span>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ left: -16, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis
            dataKey="region"
            tickLine={false}
            axisLine={false}
            tick={{ fill: textColor }}
          />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: textColor }} />
          <Tooltip
            cursor={{ fill: isDark ? "rgba(99, 102, 241, 0.16)" : "rgba(99, 102, 241, 0.08)" }}
            formatter={(value) => [`$${value.toLocaleString()}`, "Sales"]}
            contentStyle={{
              backgroundColor: isDark ? "#111827" : "#ffffff",
              borderRadius: 12,
              border: "none",
              color: textColor,
            }}
          />
          <Bar dataKey="sales" radius={[8, 8, 0, 0]} fill={isDark ? "#818cf8" : "#6366f1"} />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}

RegionChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      region: PropTypes.string.isRequired,
      sales: PropTypes.number.isRequired,
      orders: PropTypes.number,
      avgOrderValue: PropTypes.number,
    })
  ),
  theme: PropTypes.oneOf(["light", "dark"]),
};

export default RegionChart;
