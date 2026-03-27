import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { Lightbulb, TrendingUp, BarChart3 } from "lucide-react";

const Insights = () => {
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

        // ❌ handle ML error case
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
  // STATES
  // ============================
  if (loading) return <div>Generating insights...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!data) return <div>Select dataset</div>;

  const summary = data.summary || {};
  const distribution = data.distribution || {};
  const recommendations = data.recommendations || [];

  // convert distribution → array
  const features = Object.entries(distribution).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="min-h-screen space-y-8">

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

      {/* SUMMARY CARDS */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 flex gap-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Lightbulb className="text-blue-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Average</p>
            <h3 className="text-xl font-semibold">
              {summary.avg_target?.toFixed?.(2) || "-"}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 flex gap-4">
          <div className="bg-green-100 p-3 rounded-lg">
            <TrendingUp className="text-green-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Max</p>
            <h3 className="text-xl font-semibold">
              {summary.max_target ?? "-"}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 flex gap-4">
          <div className="bg-purple-100 p-3 rounded-lg">
            <BarChart3 className="text-purple-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Min</p>
            <h3 className="text-xl font-semibold">
              {summary.min_target ?? "-"}
            </h3>
          </div>
        </div>
      </div>

      {/* FEATURE DISTRIBUTION */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">
          Feature Distribution
        </h3>

        <div className="space-y-4">
          {features.map((f, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span>{f.name}</span>
                <span>{f.value.toFixed?.(2) || f.value}</span>
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

export default Insights;