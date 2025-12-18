import PropTypes from "prop-types";

function formatValue(value, formatter, { prefix = "", suffix = "" } = {}) {
  if (value == null) {
    return "—";
  }

  const formatted = formatter ? formatter(value) : value.toLocaleString();
  return `${prefix}${formatted}${suffix}`;
}

function KPICard({ label, value, prefix, suffix, trend, formatter }) {
  const trendValue = trend?.value;
  const trendLabel = trend?.label ?? "vs. previous period";
  const trendIsPositive = typeof trendValue === "number" ? trendValue >= 0 : null;

  return (
    <div className="kpi-card">
      <div className="kpi-card__label">{label}</div>
      <div className="kpi-card__value">
        {formatValue(value, formatter, { prefix, suffix })}
      </div>
      {trendValue != null && (
        <div
          className={`kpi-card__trend ${
            trendIsPositive === null
              ? ""
              : trendIsPositive
              ? "kpi-card__trend--up"
              : "kpi-card__trend--down"
          }`}
        >
          {trendIsPositive === null ? null : trendIsPositive ? "▲" : "▼"}{" "}
          {Math.abs(trendValue).toFixed(1)}%
          <span className="kpi-card__trend-label">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}

KPICard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  prefix: PropTypes.string,
  suffix: PropTypes.string,
  formatter: PropTypes.func,
  trend: PropTypes.shape({
    value: PropTypes.number,
    label: PropTypes.string,
  }),
};

export default KPICard;

