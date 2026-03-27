import React, { useState, useEffect } from "react";
import {
  SlidersHorizontal,
  PlayCircle,
  TrendingUp,
  Database,
  AlertCircle,
} from "lucide-react";
import api from "../utils/api";

const Simulation = () => {
  const [datasetId, setDatasetId] = useState("");
  const [features, setFeatures] = useState([]);
  const [formData, setFormData] = useState({});
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [datasets, setDatasets] = useState([]);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const res = await api.get("/api/dataset");
        setDatasets(res.data.data || res.data || []);
      } catch (err) {
        console.error("Failed to fetch datasets:", err);
      }
    };

    fetchDatasets();
  }, []);

  const loadFeatures = async (id) => {
    try {
      setError("");
      const res = await api.get(`/api/predictions/features/${id}`);
      const feats = res.data.features || [];

      setFeatures(feats);

      const initial = {};
      feats.forEach((f) => (initial[f] = ""));
      setFormData(initial);
    } catch (err) {
      console.error(err);
      setError("Failed to load features");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ============================
  // RUN SIMULATION
  // ============================
  const runSimulation = async () => {
    if (!datasetId) {
      setError("Please select a dataset");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResults([]);

      const cleaned = {};

      Object.keys(formData).forEach((k) => {
        let val = formData[k];

        if (val === "" || val === null) return;

        if (typeof val === "string") val = val.trim();
        if (!isNaN(Number(val))) val = Number(val);

        cleaned[k] = val;
      });

      // 🔥 prevent empty input
      if (Object.keys(cleaned).length === 0) {
        setError("Please fill at least one input field");
        setLoading(false);
        return;
      }

      console.log("🚀 Simulation Input:", cleaned);

      const res = await api.post("/api/simulations/run", {
        datasetId,
        inputs: [cleaned],
      });

      console.log("📊 Simulation Response:", res.data);

      // 🔥 USE ML RESPONSE DIRECTLY
      const mlResults = res.data.mlResponse?.results || [];

      if (!mlResults.length) {
        setError("No simulation results returned");
        return;
      }

      setResults(mlResults);
    } catch (err) {
      console.error("❌ Simulation Error:", err);

      const msg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        err.response?.data?.error ||
        "Simulation failed";

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <SlidersHorizontal className="text-blue-600" />
          Scenario Simulation
        </h1>
        <p className="text-sm text-gray-500">
          Run what-if simulations using your trained model
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex gap-3">
          <AlertCircle size={20} />
          <div>{error}</div>
        </div>
      )}

      {/* DATASET INPUT */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Dataset
        </label>

        <div className="relative">
          <Database
            className="absolute left-3 top-3.5 text-gray-400"
            size={18}
          />

          <select
            value={datasetId}
            onChange={(e) => {
              const id = e.target.value;
              setDatasetId(id);
              loadFeatures(id);
            }}
            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Choose a dataset --</option>

            {datasets.map((d) => (
              <option key={d._id} value={d._id}>
                {d.datasetName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* INPUT FEATURES */}
      {features.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Simulation Inputs</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f}>
                <label className="text-sm text-gray-600 mb-1 block">{f}</label>
                <input
                  name={f}
                  value={formData[f] || ""}
                  onChange={handleChange}
                  placeholder={`Enter ${f}`}
                  className="w-full px-4 py-3 border rounded-xl text-sm"
                />
              </div>
            ))}
          </div>

          <button
            onClick={runSimulation}
            disabled={loading}
            className="mt-8 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
          >
            <PlayCircle size={20} />
            {loading ? "Running Simulation..." : "Run Simulation"}
          </button>
        </div>
      )}

      {/* RESULTS */}
      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((r, i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 p-6 rounded-2xl flex items-center gap-4"
            >
              <div className="bg-white p-3 rounded-xl shadow">
                <TrendingUp className="text-green-600" size={28} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Prediction</p>

                <h2 className="text-2xl font-bold text-gray-900">
                  {r.prediction?.toFixed(2)}
                </h2>

                {r.confidence !== undefined && (
                  <p className="text-md text-gray-800 mt-1">
                    Confidence: {(r.confidence * 100).toFixed(1)}%
                  </p>
                )}

                {r.range && (
                  <p className="text-xs text-gray-400">
                    Range: {r.range.min.toFixed(0)} - {r.range.max.toFixed(0)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!features.length && (
        <div className="text-center py-10 text-gray-400">
          Enter dataset ID to load simulation inputs
        </div>
      )}
    </div>
  );
};

export default Simulation;
