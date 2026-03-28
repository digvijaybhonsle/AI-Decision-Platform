import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();

  const [datasets, setDatasets] = useState([]);
  const [datasetId, setDatasetId] = useState("");
  const [insightData, setInsightData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================
  // LOAD DATASETS
  // ============================
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const res = await api.get("/api/dataset");
        const data = res.data.data || res.data || [];

        setDatasets(data);

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
  // FETCH INSIGHTS
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

        // ❌ MODEL NOT TRAINED
        if (ml?.insights?.error) {
          throw new Error(ml.insights.error);
        }

        setInsightData(ml);

      } catch (err) {
        console.error("❌ Insights error:", err);

        setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to load insights"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [datasetId]);

  // ============================
  // UI STATES
  // ============================

  // ⏳ Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Generating insights...</p>
      </div>
    );
  }

  // ❌ No Dataset
  if (!datasets || datasets.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center space-y-4 px-4">
        <h2 className="text-xl font-semibold text-gray-700">
          No Dataset Found
        </h2>

        <p className="text-gray-500">
          Please upload and train a dataset first.
        </p>

        <button
          onClick={() => navigate("/upload")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Upload Dataset
        </button>
      </div>
    );
  }

  // ❌ Model Not Trained
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center space-y-4 px-4">
        <h2 className="text-xl font-semibold text-red-500">
          Model Not Ready
        </h2>

        <p className="text-gray-500">
          Please train your dataset before viewing insights.
        </p>

        <button
          onClick={() => navigate("/train")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Train Model
        </button>
      </div>
    );
  }

  // 📭 No Data Yet
  if (!insightData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Select dataset to view insights</p>
      </div>
    );
  }

  // ============================
  // SAFE DATA
  // ============================
  const summary = insightData.insights?.summary || {};
  const trend = insightData.insights?.trend || [];
  const recommendations = insightData.insights?.recommendations || [];

  // ============================
  // UI
  // ============================
  return (
    <div className="space-y-8 p-4 md:p-6">

      {/* HEADER */}
      <div>
        <h1 className="font-bold text-2xl md:text-3xl text-gray-800">
          Insights Dashboard
        </h1>
        <p className="text-gray-500 text-sm md:text-base">
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
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Card title="Average Target" value={summary.avg_target?.toFixed?.(2)} />
        <Card title="Max Target" value={summary.max_target} />
        <Card title="Min Target" value={summary.min_target} />
      </div>

      {/* TREND CHART */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
        <h3 className="font-semibold mb-4 text-gray-700">
          Trend ({summary.target_used || "Target"})
        </h3>

        <ResponsiveContainer width="100%" height={250}>
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
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
        <h3 className="font-semibold mb-4 text-gray-700">
          AI Recommendations
        </h3>

        <ul className="space-y-3 text-sm text-gray-600">
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

// 🔹 Reusable Card
const Card = ({ title, value }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm">
    <p className="text-gray-500 text-sm">{title}</p>
    <h2 className="text-xl md:text-2xl font-bold">
      {value ?? "-"}
    </h2>
  </div>
);

export default Dashboard;