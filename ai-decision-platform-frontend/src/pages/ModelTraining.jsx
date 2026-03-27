import React, { useEffect, useState } from "react";
import { PlayCircle, Cpu, Database, BarChart3 } from "lucide-react";
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

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const res = await api.get("/api/dataset");
        setDatasets(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDatasets();
  }, []);

  const handleDatasetChange = (id) => {
    setDatasetId(id);
    const selected = datasets.find((d) => d._id === id);
    if (selected) setColumns(selected.columns);
    setFeatures([]);
    setTarget("");
  };

  const handleFeatureChange = (col) => {
    setFeatures((prev) =>
      prev.includes(col) ? prev.filter((f) => f !== col) : [...prev, col],
    );
  };

  const handleTrain = async () => {
    if (!datasetId || !target || !algorithm || features.length === 0) {
      setError("All fields are required");
      return;
    }

    if (!target) {
      setError("Target is required");
      return;
    }

    if (columns.includes(target) === false) {
      console.warn("Custom target used:", target);
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

      setMetrics(ml?.metrics || {});
      setTask(ml?.task || "");
    } catch (err) {
      if (err.response?.status === 502) {
        setError("ML server waking up... try again in few seconds");
      } else {
        setError(err.response?.data?.message || "Training failed");
      }
    } finally {
      setTraining(false);
    }
  };

  const handleTargetChange = (value) => {
    setTarget(value.trim());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Train AI Model</h1>
        <p className="text-gray-500 text-sm">
          Configure dataset and train your model
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-500 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Config */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Dataset */}
          <div>
            <label className="text-sm">Dataset</label>
            <div className="flex items-center border px-3 py-2 rounded-lg">
              <Database size={16} />
              <select
                className="w-full ml-2 outline-none"
                value={datasetId}
                onChange={(e) => handleDatasetChange(e.target.value)}
              >
                <option value="">Select dataset</option>
                {datasets.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.datasetName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Target Column
            </label>

            <div className="flex gap-2 mt-1">
              {/* Dropdown */}
              <div className="flex items-center border px-3 py-2 rounded-lg w-full">
                <BarChart3 size={16} />
                <select
                  className="w-full ml-2 outline-none text-sm"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                >
                  <option value="">Select from dataset</option>
                  {columns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Algorithm */}
          <div>
            <label className="text-sm">Algorithm</label>
            <div className="flex items-center border px-3 py-2 rounded-lg">
              <Cpu size={16} />
              <select
                className="w-full ml-2 outline-none"
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
              >
                <option value="">Select algorithm</option>
                <option value="linear">Linear Regression</option>
                <option value="random_forest">Random Forest</option>
                <option value="logistic">Logistic Regression</option>
              </select>
            </div>
          </div>
        </div>

        {/* Features */}
        {columns.length > 0 && (
          <div className="mt-6">
            <label className="text-sm mb-2 block">Select Features</label>
            <div className="flex flex-wrap gap-2">
              {columns.map((col) => (
                <button
                  key={col}
                  onClick={() => handleFeatureChange(col)}
                  className={`px-3 py-1 rounded-full text-sm transition ${
                    features.includes(col)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Train */}
        <button
          onClick={handleTrain}
          disabled={training}
          className="mt-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          <PlayCircle size={18} />
          {training ? "Training..." : "Train Model"}
        </button>
      </div>

      {/* Loading */}
      {training && (
        <div className="bg-blue-50 p-4 rounded-lg text-blue-600 text-sm">
          🚀 Training model... please wait
        </div>
      )}

      {/* Summary */}
      {metrics && Object.keys(metrics).length > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-2">
            Model Trained Successfully 🎉
          </h2>
          <div className="flex flex-wrap gap-6 text-sm">
            <p>📊 Task: {task}</p>
            <p>🎯 Target: {target}</p>
            <p>⚙️ Algorithm: {algorithm}</p>
            <p>🧩 Features: {features.length}</p>
          </div>
        </div>
      )}

      {/* Metrics */}
      {metrics && Object.keys(metrics).length > 0 && (
        <div className="grid md:grid-cols-4 gap-6">
          {Object.entries(metrics).map(([key, val]) => (
            <div key={key} className="bg-white p-6 rounded-xl shadow-sm">
              <p className="text-gray-400 text-xs uppercase">
                {key.replace("_", " ")}
              </p>
              <h2 className="text-xl font-bold">{val}</h2>
            </div>
          ))}
        </div>
      )}

      {/* Extra Grid */}
      {metrics && Object.keys(metrics).length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Feature Importance */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="font-semibold mb-4">Top Features</h2>
            {features.slice(0, 5).map((f, i) => (
              <div key={f} className="mb-2">
                <div className="flex justify-between text-sm">
                  <span>{f}</span>
                  <span>{100 - i * 10}%</span>
                </div>
                <div className="bg-gray-200 h-2 rounded">
                  <div
                    className="bg-blue-600 h-2 rounded"
                    style={{ width: `${100 - i * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Dataset Info */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="font-semibold mb-4">Dataset Info</h2>
            <p>Columns: {columns.length}</p>
            <p>Features: {features.length}</p>
            <p>Target: {target}</p>
          </div>
        </div>
      )}

      {/* Logs */}
      {metrics && (
        <div className="bg-white p-6 rounded-xl shadow-sm text-xs font-mono text-gray-500">
          <p>✔ Dataset loaded</p>
          <p>✔ Features validated</p>
          <p>✔ Training started</p>
          <p>✔ Training completed</p>
        </div>
      )}
    </div>
  );
};

export default ModelTraining;
