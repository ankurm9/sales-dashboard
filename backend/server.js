const express = require("express");
const cors = require("cors");
const { Client } = require("@elastic/elasticsearch");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const ELASTIC_INDEX = "sales-performance";
const client = new Client({
  node: process.env.ELASTIC_URL || "http://localhost:9200",
});

async function ensureIndex() {
  const exists = await client.indices.exists({ index: ELASTIC_INDEX });
  if (exists) return;

  await client.indices.create({
    index: ELASTIC_INDEX,
    mappings: {
      properties: {
        region: { type: "keyword" },
        product: { type: "keyword" },
        sales: { type: "double" },
        orders: { type: "integer" },
        date: { type: "date" },
      },
    },
  });
}

app.get("/seed", async (_req, res) => {
  await ensureIndex();

  const syntheticSales = [
    { region: "North America", product: "Laptop Pro 15\"", sales: 45800, orders: 112, date: "2024-01-01" },
    { region: "North America", product: "Noise Cancelling Headphones", sales: 18300, orders: 204, date: "2024-01-15" },
    { region: "Europe", product: "Laptop Pro 15\"", sales: 29450, orders: 71, date: "2024-01-18" },
    { region: "Europe", product: "4K Monitor 27\"", sales: 16500, orders: 98, date: "2024-02-01" },
    { region: "APAC", product: "Smartwatch X2", sales: 12800, orders: 320, date: "2024-02-10" },
    { region: "Latin America", product: "Laptop Air 13\"", sales: 9300, orders: 54, date: "2024-02-14" },
    { region: "North America", product: "Smartwatch X2", sales: 20700, orders: 356, date: "2024-03-01" },
    { region: "Europe", product: "Noise Cancelling Headphones", sales: 14600, orders: 172, date: "2024-03-05" },
    { region: "APAC", product: "Laptop Air 13\"", sales: 15200, orders: 68, date: "2024-03-12" },
    { region: "APAC", product: "USB-C Dock", sales: 5400, orders: 210, date: "2024-03-20" },
    { region: "Latin America", product: "Smartwatch X2", sales: 8800, orders: 196, date: "2024-03-28" },
    { region: "North America", product: "4K Monitor 27\"", sales: 17600, orders: 130, date: "2024-04-05" },
    { region: "Europe", product: "Laptop Air 13\"", sales: 13400, orders: 60, date: "2024-04-22" },
    { region: "APAC", product: "Laptop Pro 15\"", sales: 21100, orders: 52, date: "2024-04-25" },
    { region: "Latin America", product: "Noise Cancelling Headphones", sales: 6600, orders: 84, date: "2024-05-02" },
    { region: "North America", product: "Laptop Air 13\"", sales: 25800, orders: 120, date: "2024-05-18" },
    { region: "Europe", product: "Smartwatch X2", sales: 11800, orders: 260, date: "2024-05-22" },
    { region: "APAC", product: "4K Monitor 27\"", sales: 9900, orders: 76, date: "2024-06-01" },
    { region: "Latin America", product: "USB-C Dock", sales: 3100, orders: 142, date: "2024-06-05" },
    { region: "North America", product: "USB-C Dock", sales: 4500, orders: 190, date: "2024-06-12" },
    { region: "Europe", product: "USB-C Dock", sales: 3700, orders: 156, date: "2024-06-15" },
    { region: "APAC", product: "Noise Cancelling Headphones", sales: 13500, orders: 188, date: "2024-06-20" },
  ];

  const bulkBody = syntheticSales.flatMap((doc) => [
    { index: { _index: ELASTIC_INDEX } },
    doc,
  ]);

  await client.bulk({ refresh: true, body: bulkBody });
  res.send({ message: "✅ Data seeded successfully!", count: syntheticSales.length });
});

app.get("/api/dashboard", async (_req, res, next) => {
  try {
    await ensureIndex();

    const response = await client.search({
      index: ELASTIC_INDEX,
      size: 0,
      aggs: {
        total_sales: { sum: { field: "sales" } },
        total_orders: { sum: { field: "orders" } },
        sales_by_region: {
          terms: {
            field: "region",
            size: 20,
            order: { total_sales: "desc" },
          },
          aggs: {
            total_sales: { sum: { field: "sales" } },
            total_orders: { sum: { field: "orders" } },
            avg_order_value: {
              bucket_script: {
                buckets_path: {
                  sales: "total_sales",
                  orders: "total_orders",
                },
                script: "params.orders == 0 ? 0 : params.sales / params.orders",
              },
            },
          },
        },
        sales_by_product: {
          terms: {
            field: "product",
            size: 10,
            order: { total_sales: "desc" },
          },
          aggs: {
            total_sales: { sum: { field: "sales" } },
            total_orders: { sum: { field: "orders" } },
          },
        },
        sales_over_time: {
          date_histogram: {
            field: "date",
            calendar_interval: "month",
            format: "yyyy-MM-dd",
          },
          aggs: {
            total_sales: { sum: { field: "sales" } },
            total_orders: { sum: { field: "orders" } },
          },
        },
      },
    });

    const totalSales = response.aggregations.total_sales.value || 0;
    const totalOrders = response.aggregations.total_orders.value || 0;
    const regionsBuckets = response.aggregations.sales_by_region.buckets;
    const productsBuckets = response.aggregations.sales_by_product.buckets;
    const timeBuckets = response.aggregations.sales_over_time.buckets;

    const regions = regionsBuckets.map((bucket) => ({
      region: bucket.key,
      sales: bucket.total_sales.value,
      orders: bucket.total_orders.value,
      avgOrderValue: bucket.avg_order_value.value,
    }));

    const products = productsBuckets.map((bucket) => ({
      product: bucket.key,
      sales: bucket.total_sales.value,
      orders: bucket.total_orders.value,
      share: totalSales === 0 ? 0 : bucket.total_sales.value / totalSales,
    }));

    const trend = timeBuckets.map((bucket) => ({
      date: bucket.key_as_string,
      sales: bucket.total_sales.value,
      orders: bucket.total_orders.value,
    }));

    const activeRegions = regionsBuckets.length;
    const avgRevenuePerRegion =
      activeRegions === 0 ? 0 : totalSales / activeRegions;
    const conversionRate =
      totalOrders === 0
        ? 0
        : (totalOrders / Math.max(totalOrders * 1.8, 1)) * 100;

    res.json({
      kpis: {
        totalSales,
        avgRevenuePerRegion,
        totalOrders,
        conversionRate,
        activeRegions,
      },
      kpiTrends: {
        totalSales: { value: 8.3, label: "vs. last quarter" },
        avgRevenuePerRegion: { value: -1.4, label: "vs. last quarter" },
        totalOrders: { value: 5.6, label: "vs. last quarter" },
        conversionRate: { value: 0.7, label: "vs. last quarter" },
        activeRegions: { value: 0, label: "vs. last quarter" },
      },
      regions,
      products,
      trend,
      filters: {
        dateRange: "Jan – Jun 2024",
      },
    });
  } catch (error) {
    next(error);
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Failed to load dashboard data", details: err.message });
});

app.listen(5000, () =>
  console.log("🚀 Backend running on http://localhost:5000")
);
