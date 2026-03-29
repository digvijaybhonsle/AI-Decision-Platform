import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import {
  Lightbulb,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

const Insights = () => {
  const navigate = useNavigate();

  const [datasets, setDatasets] = useState([]);
  const [datasetId, setDatasetId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================
  // LOAD DATASETS
  // ============================
  useEffect(() => {
    const fetchDatasets = async () => {
      const res = await api.get("/api/dataset");
      const ds = res.data.data || [];
      setDatasets(ds);
      if (ds.length > 0) setDatasetId(ds[0]._id);
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

        const res = await api.post(`/api/insights/${datasetId}`);
        const ml = res.data.mlResponse;

        if (ml?.insights?.error) throw new Error(ml.insights.error);

        setData(ml.insights);

      } catch (err) {
        setError(err.message || "Failed");
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [datasetId]);

  // ============================
  // STATES
  // ============================
  if (loading) {
    return <Center msg="Generating AI insights..." />;
  }

  if (!datasets.length) {
    return (
      <Center
        msg="No Dataset Found"
        btn="Upload Dataset"
        action={() => navigate("/upload")}
      />
    );
  }

  if (error) {
    return (
      <Center
        msg="Model not trained"
        btn="Train Model"
        action={() => navigate("/train")}
      />
    );
  }

  if (!data) return <Center msg="Select dataset" />;

  // ============================
  // DATA
  // ============================
  const summary = data.summary || {};
  const trend = data.trend || [];
  const importance = data.feature_importance || {};
  const correlation = data.correlation || {};
  const recommendations = data.recommendations || [];

  const importanceData = Object.entries(importance).map(([k, v]) => ({
    name: k,
    value: v,
  }));

  const correlationData = Object.entries(correlation).map(([k, v]) => ({
    name: k,
    value: v,
  }));

  // ============================
  // UI
  // ============================
  return (
    <div className="space-y-8 p-4 md:p-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">AI Insights</h1>
        <p className="text-gray-500 text-sm">
          ML-powered analytics & recommendations
        </p>
      </div>

      {/* DATASET */}
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

      {/* SUMMARY */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card label="Average" value={summary.mean?.toFixed?.(2)} />
        <Card label="Max" value={summary.max} />
        <Card label="Min" value={summary.min} />
      </div>

      {/* TREND */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-semibold mb-4">Trend Analysis</h3>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trend}>
            <XAxis dataKey={Object.keys(trend[0] || {})[0]} />
            <YAxis />
            <Tooltip />
            <Line
              dataKey={Object.keys(trend[0] || {})[1]}
              stroke="#3B82F6"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* FEATURE IMPORTANCE */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-semibold mb-4">Feature Importance</h3>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={importanceData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#6366F1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* CORRELATION */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-semibold mb-4">Correlation</h3>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={correlationData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* RECOMMENDATIONS */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="font-semibold mb-4">AI Recommendations</h3>

        {recommendations.map((r, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <Lightbulb className="text-blue-600" />
            <p>{r}</p>
          </div>
        ))}
      </div>

    </div>
  );
};

// 🔹 CARD
const Card = ({ label, value }) => (
  <div className="bg-white p-6 rounded-xl shadow">
    <p className="text-sm text-gray-500">{label}</p>
    <h2 className="text-xl font-bold">{value ?? "-"}</h2>
  </div>
);

// 🔹 CENTER UI
const Center = ({ msg, btn, action }) => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4">
    <p className="text-gray-500">{msg}</p>
    {btn && (
      <button
        onClick={action}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg"
      >
        {btn}
      </button>
    )}
  </div>
);

export default Insights;