import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import KPICard from "./components/KPICard";
import RegionChart from "./components/RegionChart";
import TrendChart from "./components/TrendChart";
import ProductChart from "./components/ProductChart";
import Sidebar from "./components/Sidebar";
import "./App.css";

const KPI_CONFIG = [
  {
    key: "totalSales",
    label: "Total Sales",
    prefix: "$",
    formatter: (value) => value.toLocaleString(),
  },
  {
    key: "avgRevenuePerRegion",
    label: "Avg Revenue / Region",
    prefix: "$",
    formatter: (value) => value.toLocaleString(undefined, { maximumFractionDigits: 0 }),
  },
  {
    key: "totalOrders",
    label: "Total Orders",
    formatter: (value) => value.toLocaleString(),
  },
  {
    key: "conversionRate",
    label: "Conversion Rate",
    suffix: "%",
    formatter: (value) => value.toFixed(1),
  },
  {
    key: "activeRegions",
    label: "Active Regions",
    formatter: (value) => value,
  },
];

function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = isDarkMode ? "dark" : "light";

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/dashboard")
      .then((res) => {
        setDashboardData(res.data);
        setError(null);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark-theme", isDarkMode);
  }, [isDarkMode]);

  const cards = useMemo(() => {
    if (!dashboardData) {
      return [];
    }

    return KPI_CONFIG.map((config) => ({
      ...config,
      value: dashboardData?.kpis?.[config.key] ?? 0,
      trend: dashboardData?.kpiTrends?.[config.key],
    }));
  }, [dashboardData]);

  return (
    <div className={`dashboard ${isDarkMode ? "dashboard--dark" : ""}`}>
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((prev) => !prev)}
        theme={theme}
      />

      <div
        className={`sidebar-overlay ${isSidebarOpen ? "sidebar-overlay--visible" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      <main
        className={`dashboard__content ${
          isSidebarOpen
            ? "dashboard__content--sidebar-open"
            : "dashboard__content--sidebar-collapsed"
        }`}
      >
        <header className="dashboard__header">
          <div>
            <h1>Sales & Product Performance</h1>
            <p className="dashboard__subtitle">
              Real-time view of revenue, demand, and regional momentum.
            </p>
          </div>
          <div className="dashboard__actions">
            <button
              className="dashboard__button dashboard__button--ghost"
              onClick={() => setIsDarkMode((prev) => !prev)}
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>
            <button
              className="dashboard__button"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </div>
        </header>

        <div className="dashboard__meta">
          <span className="dashboard__range">
            {dashboardData?.filters?.dateRange ?? "Last 90 days"}
          </span>
        </div>

        {loading && <div className="dashboard__state">Loading dashboard…</div>}
        {error && (
          <div className="dashboard__state dashboard__state--error">
            Unable to load data. Check the API service.
          </div>
        )}

        {!loading && !error && dashboardData && (
          <>
            <section className="kpi-grid">
              {cards.map((card) => (
                <KPICard
                  key={card.key}
                  label={card.label}
                  value={card.value}
                  prefix={card.prefix}
                  suffix={card.suffix}
                  trend={card.trend}
                  formatter={card.formatter}
                />
              ))}
            </section>

            <section className="charts-grid">
              <article className="chart-card chart-card--wide">
                <TrendChart data={dashboardData.trend} theme={theme} />
              </article>
              <article className="chart-card">
                <RegionChart data={dashboardData.regions} theme={theme} />
              </article>
              <article className="chart-card">
                <ProductChart data={dashboardData.products} theme={theme} />
              </article>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
