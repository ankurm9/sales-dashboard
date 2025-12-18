import PropTypes from "prop-types";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const LIGHT_COLORS = ["#4f46e5", "#22d3ee", "#f97316", "#facc15", "#10b981", "#a855f7"];
const DARK_COLORS = ["#818cf8", "#67e8f9", "#fb923c", "#fde047", "#34d399", "#c084fc"];

function ProductChart({ data, theme = "light" }) {
  const isDark = theme === "dark";
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
  const chartData = [...data]
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 6)
    .map((item) => ({
      product: item.product,
      sales: item.sales,
      share: item.share,
    }));

  return (
    <>
      <div className="chart-card__header">
        <h2>🛍 Top Products</h2>
        <span className="chart-card__meta">Share of revenue by product line</span>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="sales"
            nameKey="product"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={entry.product} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name, props) => [
              `$${Number(value).toLocaleString()}`,
              props.payload.product,
            ]}
            contentStyle={{
              backgroundColor: isDark ? "#111827" : "#ffffff",
              borderRadius: 12,
              border: "none",
              color: isDark ? "#e2e8f0" : "#1f2937",
            }}
          />
          <Legend
            verticalAlign="middle"
            align="right"
            layout="vertical"
            iconType="circle"
            wrapperStyle={{
              paddingLeft: 24,
              color: isDark ? "#cbd5f5" : "#1f2937",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </>
  );
}

ProductChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      product: PropTypes.string.isRequired,
      sales: PropTypes.number.isRequired,
      share: PropTypes.number,
      orders: PropTypes.number,
    })
  ),
  theme: PropTypes.oneOf(["light", "dark"]),
};

export default ProductChart;
