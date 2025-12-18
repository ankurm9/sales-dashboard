import PropTypes from "prop-types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

function TrendChart({ data, theme = "light" }) {
  const isDark = theme === "dark";
  const textColor = isDark ? "#e2e8f0" : "#1e293b";
  const gridColor = isDark ? "rgba(148, 163, 184, 0.18)" : "rgba(148, 163, 184, 0.3)";

  return (
    <>
      <div className="chart-card__header">
        <h2>📅 Sales Trends</h2>
        <span className="chart-card__meta">Revenue & orders over time</span>
      </div>
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={data} margin={{ right: 32 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fill: textColor }}
          />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: textColor }} />
          <Tooltip
            formatter={(value, name) => {
              if (name === "sales") {
                return [`$${value.toLocaleString()}`, "Sales"];
              }
              return [value.toLocaleString(), "Orders"];
            }}
            contentStyle={{
              backgroundColor: isDark ? "#111827" : "#ffffff",
              borderRadius: 12,
              border: "none",
              color: textColor,
            }}
          />
          <Legend
            wrapperStyle={{
              color: textColor,
            }}
          />
          <Line
            type="monotone"
            dataKey="sales"
            stroke={isDark ? "#a855f7" : "#4f46e5"}
            strokeWidth={3}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="orders"
            stroke={isDark ? "#38bdf8" : "#22d3ee"}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}

TrendChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      sales: PropTypes.number.isRequired,
      orders: PropTypes.number,
    })
  ),
  theme: PropTypes.oneOf(["light", "dark"]),
};

export default TrendChart;
