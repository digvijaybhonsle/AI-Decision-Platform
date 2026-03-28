import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";
import { Lightbulb, TrendingUp, BarChart3 } from "lucide-react";

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
      try {
        const res = await api.get("/api/dataset");
        const ds = res.data.data || res.data || [];

        setDatasets(ds);

        if (ds.length > 0) {
          setDatasetId(ds[0]._id);
        }
      } catch (err) {
        console.error(err);
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

        const res = await api.post(`/api/insights/${datasetId}`);
        const ml = res.data.mlResponse;

        // ❌ MODEL NOT TRAINED / ERROR
        if (ml?.insights?.error) {
          throw new Error(ml.insights.error);
        }

        setData(ml.insights);

      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load insights");
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

  // ❌ No Dataset Found
  if (!datasets || datasets.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center space-y-4 px-4">
        <h2 className="text-xl font-semibold text-gray-700">
          No Dataset Found
        </h2>

        <p className="text-gray-500">
          Please upload and train a dataset first to view insights.
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
          Please train your dataset before generating insights.
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

  // 📭 No Data Selected Yet
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Select a dataset</p>
      </div>
    );
  }

  // ============================
  // DATA
  // ============================
  const summary = data.summary || {};
  const distribution = data.distribution || {};
  const recommendations = data.recommendations || [];

  const features = Object.entries(distribution).map(([name, value]) => ({
    name,
    value,
  }));

  // ============================
  // UI
  // ============================
  return (
    <div className="min-h-screen space-y-8 p-4 md:p-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Insights</h1>
        <p className="text-sm text-gray-500">
          AI-generated insights from your dataset
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

      {/* SUMMARY */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Card icon={<Lightbulb />} label="Average" value={summary.avg_target?.toFixed?.(2)} color="blue" />
        <Card icon={<TrendingUp />} label="Max" value={summary.max_target} color="green" />
        <Card icon={<BarChart3 />} label="Min" value={summary.min_target} color="purple" />
      </div>

      {/* DISTRIBUTION */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">
          Feature Distribution
        </h3>

        <div className="space-y-4">
          {features.map((f, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span>{f.name}</span>
                <span>{f.value?.toFixed?.(2) || f.value}</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min(f.value, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RECOMMENDATIONS */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">
          Recommendations
        </h3>

        {recommendations.length > 0 ? (
          recommendations.map((rec, i) => (
            <div key={i} className="flex gap-3 mb-3">
              <Lightbulb className="text-blue-600" />
              <p className="text-sm text-gray-700">{rec}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">
            No recommendations available
          </p>
        )}
      </div>

    </div>
  );
};

// 🔹 Reusable Card Component
const Card = ({ icon, label, value, color }) => {
  const bgMap = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex gap-4 items-center">
      <div className={`p-3 rounded-lg ${bgMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <h3 className="text-xl font-semibold">
          {value ?? "-"}
        </h3>
      </div>
    </div>
  );
};

export default Insights;