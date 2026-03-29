import React, { useEffect, useState } from "react";
import {
  PlayCircle,
  Cpu,
  Database,
  BarChart3,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import api from "../utils/api";

const ModelTraining = () => {
  const [datasets, setDatasets] = useState([]);
  const [datasetId, setDatasetId] = useState("");
  const [columns, setColumns] = useState([]);

  const [features, setFeatures] = useState([]);
  const [target, setTarget] = useState("");
  const [algorithm, setAlgorithm] = useState("");

  const [training, setTraining] = useState(false);
  const [metrics, setMetrics] = useState({});
  const [task, setTask] = useState("");
  const [error, setError] = useState("");

  // ============================
  // FETCH DATASETS
  // ============================
  useEffect(() => {
    const fetch = async () => {
      const res = await api.get("/api/dataset");
      setDatasets(res.data.data || []);
    };
    fetch();
  }, []);

  // ============================
  // DATASET CHANGE
  // ============================
  const handleDatasetChange = (id) => {
    setDatasetId(id);
    const selected = datasets.find((d) => d._id === id);
    setColumns(selected?.columns || []);
    setFeatures([]);
    setTarget("");
    setMetrics({});
  };

  // ============================
  // FEATURE TOGGLE
  // ============================
  const toggleFeature = (col) => {
    if (col === target) return;

    setFeatures((prev) =>
      prev.includes(col)
        ? prev.filter((f) => f !== col)
        : [...prev, col],
    );
  };

  // ============================
  // TRAIN
  // ============================
  const handleTrain = async () => {
    if (!datasetId || !target || !algorithm || features.length === 0) {
      setError("Please complete all steps");
      return;
    }

    try {
      setTraining(true);
      setError("");
      setMetrics({});

      const res = await api.post("/api/models/train", {
        datasetId,
        model_type: algorithm,
        features,
        target,
      });

      const ml = res.data.mlResponse;

      if (ml?.error) {
        setError(ml.error);
        return;
      }

      setMetrics(ml.metrics || {});
      setTask(ml.task || "");

    } catch (err) {
      setError(err.response?.data?.message || "Training failed");
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Train AI Model</h1>
        <p className="text-gray-500 text-sm">
          Configure your dataset and train ML model
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="flex gap-2 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl">
          <AlertCircle /> {error}
        </div>
      )}

      {/* STEP 1 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <h2 className="font-semibold mb-3">Step 1: Select Dataset</h2>

        <div className="flex items-center border px-3 py-3 rounded-xl">
          <Database size={18} />
          <select
            value={datasetId}
            onChange={(e) => handleDatasetChange(e.target.value)}
            className="w-full ml-2 outline-none"
          >
            <option value="">Choose dataset</option>
            {datasets.map((d) => (
              <option key={d._id} value={d._id}>
                {d.datasetName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* STEP 2 */}
      {columns.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="font-semibold mb-3">Step 2: Select Target</h2>

          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl"
          >
            <option value="">Choose target column</option>
            {columns.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {/* STEP 3 */}
      {target && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="font-semibold mb-3">Step 3: Select Features</h2>

          <div className="flex flex-wrap gap-2">
            {columns.map((col) => (
              <button
                key={col}
                disabled={col === target}
                onClick={() => toggleFeature(col)}
                className={`px-3 py-1 rounded-full text-sm ${
                  col === target
                    ? "bg-gray-300"
                    : features.includes(col)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                {col}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4 */}
      {features.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="font-semibold mb-3">Step 4: Select Model</h2>

          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl"
          >
            <option value="">Choose algorithm</option>
            <option value="linear">Linear Regression</option>
            <option value="random_forest">Random Forest</option>
            <option value="logistic">Logistic Regression</option>
          </select>
        </div>
      )}

      {/* TRAIN BUTTON */}
      {algorithm && (
        <button
          onClick={handleTrain}
          disabled={training}
          className="w-full bg-blue-600 text-white py-3 rounded-xl cursor-pointer flex justify-center items-center gap-2"
        >
          <PlayCircle />
          {training ? "Training..." : "Train Model"}
        </button>
      )}

      {/* TRAINING STATE */}
      {training && (
        <div className="bg-blue-50 p-4 rounded-xl text-blue-600 text-sm">
          🚀 Training in progress...
        </div>
      )}

      {/* RESULT */}
      {metrics && Object.keys(metrics).length > 0 && (
        <div className="bg-green-50 p-6 rounded-xl border">
          <h2 className="font-semibold flex items-center gap-2 mb-3">
            <CheckCircle className="text-green-600" />
            Model Trained Successfully
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(metrics).map(([k, v]) => (
              <div key={k} className="bg-white p-4 rounded-lg">
                <p className="text-xs text-gray-400">{k}</p>
                <h3 className="text-lg font-bold">{v}</h3>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelTraining;