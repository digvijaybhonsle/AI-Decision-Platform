import React, { useState, useEffect } from "react";
import {
  SlidersHorizontal,
  PlayCircle,
  TrendingUp,
  Database,
  AlertCircle,
  Plus,
  Trash2,
} from "lucide-react";
import api from "../utils/api";

const Simulation = () => {
  const [datasetId, setDatasetId] = useState("");
  const [features, setFeatures] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [results, setResults] = useState([]);
  const [datasets, setDatasets] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================
  // FETCH DATASETS
  // ============================
  useEffect(() => {
    const fetchDatasets = async () => {
      const res = await api.get("/api/dataset");
      setDatasets(res.data.data || []);
    };
    fetchDatasets();
  }, []);

  // ============================
  // LOAD FEATURES
  // ============================
  const loadFeatures = async (id) => {
    try {
      setError("");
      const res = await api.get(`/api/predictions/features/${id}`);
      const feats = res.data.features || [];

      setFeatures(feats);

      // create first scenario
      const initial = {};
      feats.forEach((f) => (initial[f] = ""));

      setScenarios([initial]);

    } catch {
      setError("Model not trained for this dataset");
    }
  };

  // ============================
  // HANDLE CHANGE
  // ============================
  const handleChange = (index, name, value) => {
    const updated = [...scenarios];
    updated[index][name] = value;
    setScenarios(updated);
  };

  // ============================
  // ADD SCENARIO
  // ============================
  const addScenario = () => {
    const newScenario = {};
    features.forEach((f) => (newScenario[f] = ""));
    setScenarios([...scenarios, newScenario]);
  };

  // ============================
  // REMOVE SCENARIO
  // ============================
  const removeScenario = (index) => {
    const updated = scenarios.filter((_, i) => i !== index);
    setScenarios(updated);
  };

  // ============================
  // CLEAN INPUT
  // ============================
  const cleanData = (scenario) => {
    const cleaned = {};

    Object.keys(scenario).forEach((k) => {
      let v = scenario[k];
      if (!v) return;

      if (typeof v === "string") v = v.trim();
      if (!isNaN(v)) v = Number(v);

      cleaned[k] = v;
    });

    return cleaned;
  };

  // ============================
  // RUN SIMULATION
  // ============================
  const runSimulation = async () => {
    if (!datasetId) return setError("Select dataset first");

    try {
      setLoading(true);
      setError("");

      const cleanedInputs = scenarios.map(cleanData);

      const res = await api.post("/api/simulations/run", {
        datasetId,
        inputs: cleanedInputs,
      });

      const mlResults = res.data.mlResponse?.results || [];

      setResults(mlResults);

    } catch (err) {
      setError("Simulation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold flex gap-2 items-center">
          <SlidersHorizontal className="text-blue-600" />
          Scenario Simulator
        </h1>
        <p className="text-gray-500 text-sm">
          Compare multiple business scenarios using AI
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex gap-2 text-red-600">
          <AlertCircle /> {error}
        </div>
      )}

      {/* DATASET */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <label className="text-sm mb-2 block">Select Dataset</label>

        <select
          value={datasetId}
          onChange={(e) => {
            const id = e.target.value;
            setDatasetId(id);
            loadFeatures(id);
          }}
          className="w-full border px-4 py-3 rounded-xl"
        >
          <option value="">Choose dataset</option>
          {datasets.map((d) => (
            <option key={d._id} value={d._id}>
              {d.datasetName}
            </option>
          ))}
        </select>
      </div>

      {/* SCENARIOS */}
      {features.length > 0 && (
        <div className="space-y-6">

          {scenarios.map((scenario, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl border shadow-sm"
            >
              <div className="flex justify-between mb-4">
                <h3 className="font-semibold">
                  Scenario {index + 1}
                </h3>

                {scenarios.length > 1 && (
                  <button
                    onClick={() => removeScenario(index)}
                    className="text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((f) => (
                  <input
                    key={f}
                    placeholder={f}
                    value={scenario[f] || ""}
                    onChange={(e) =>
                      handleChange(index, f, e.target.value)
                    }
                    className="px-4 py-3 border rounded-xl"
                  />
                ))}
              </div>
            </div>
          ))}

          {/* ADD BUTTON */}
          <button
            onClick={addScenario}
            className="flex items-center gap-2 text-blue-600"
          >
            <Plus /> Add Scenario
          </button>

          {/* RUN BUTTON */}
          <button
            onClick={runSimulation}
            className="w-full bg-blue-600 text-white py-3 rounded-xl cursor-pointer flex items-center justify-center gap-2"
          >
            <PlayCircle />
            {loading ? "Running..." : "Run Simulation"}
          </button>
        </div>
      )}

      {/* RESULTS */}
      {results.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {results.map((r, i) => (
            <div key={i} className="bg-green-50 p-6 rounded-xl border">
              <h3 className="font-semibold mb-2">
                Scenario {i + 1}
              </h3>

              <p className="text-2xl font-bold">
                {r.prediction?.toFixed(2)}
              </p>

              {r.confidence && (
                <p className="text-sm">
                  Confidence: {(r.confidence * 100).toFixed(1)}%
                </p>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Simulation;