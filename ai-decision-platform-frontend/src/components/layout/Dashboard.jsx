import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const Dashboard = () => {
  const [datasets, setDatasets] = useState([]);
  const [datasetId, setDatasetId] = useState("");
  const [insightData, setInsightData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const res = await api.get("/api/dataset");

        const data = res.data.data || res.data || [];
        setDatasets(data);

        // auto select first dataset
        if (data.length > 0) {
          setDatasetId(data[0]._id);
        }
      } catch (err) {
        console.error("❌ Dataset fetch error:", err);
      }
    };

    fetchDatasets();
  }, []);

  // ============================
  // FETCH INSIGHTS (POST ONLY)
  // ============================
  useEffect(() => {
    if (!datasetId) return;

    const fetchInsights = async () => {
      try {
        setLoading(true);
        setError("");
        setInsightData(null);

        const res = await api.post(`/api/insights/${datasetId}`);

        const ml = res.data.mlResponse;

        setInsightData(ml);

        console.log("🚀 Insights generated");

      } catch (err) {
        console.error("❌ Insights error:", err);

        setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load insights"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [datasetId]);

  // ============================
  // STATES
  // ============================
  if (loading) return <div>Generating insights...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!insightData) return <div>Select dataset to view insights</div>;

  // ============================
  // SAFE DATA
  // ============================
  const summary = insightData.insights?.summary || {};
  const trend = insightData.insights?.trend || [];
  const recommendations = insightData.insights?.recommendations || [];

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="font-bold text-3xl text-gray-800">Insights Dashboard</h1>
        <p className="text-gray-500">
          AI-powered insights from your dataset
        </p>
      </div>

      {/* DATASET SELECT */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <label className="text-sm text-gray-600 mb-2 block">
          Select Dataset
        </label>

        <select
          value={datasetId}
          onChange={(e) => setDatasetId(e.target.value)}
          className="w-full border px-4 py-2 rounded-lg"
        >
          {datasets.map((d) => (
            <option key={d._id} value={d._id}>
              {d.datasetName}
            </option>
          ))}
        </select>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-gray-500 text-sm">Average Target</p>
          <h2 className="text-2xl font-bold">
            {summary.avg_target?.toFixed?.(2) || "-"}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-gray-500 text-sm">Max Target</p>
          <h2 className="text-2xl font-bold">
            {summary.max_target ?? "-"}
          </h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-gray-500 text-sm">Min Target</p>
          <h2 className="text-2xl font-bold">
            {summary.min_target ?? "-"}
          </h2>
        </div>
      </div>

      {/* TREND CHART */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="font-semibold mb-4 text-gray-700">
          Trend ({summary.target_used || "Target"})
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trend}>
            <XAxis dataKey="ID" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey={summary.target_used}
              stroke="#3B82F6"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* RECOMMENDATIONS */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="font-semibold mb-4 text-gray-700">
          AI Recommendations
        </h3>

        <ul className="space-y-4 text-sm text-gray-600">
          {recommendations.length > 0 ? (
            recommendations.map((rec, i) => (
              <li key={i} className="flex gap-2">
                <span>💡</span>
                {rec}
              </li>
            ))
          ) : (
            <li>No recommendations available</li>
          )}
        </ul>
      </div>

    </div>
  );
};

export default Dashboard;