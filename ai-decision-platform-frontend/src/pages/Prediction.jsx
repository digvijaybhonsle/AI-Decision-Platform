import React, { useEffect, useState } from "react";
import { Brain, PlayCircle, Database, AlertCircle } from "lucide-react";
import api from "../utils/api";

const Prediction = () => {
  const [datasets, setDatasets] = useState([]);
  const [datasetId, setDatasetId] = useState("");
  const [featureColumns, setFeatureColumns] = useState([]);
  const [formData, setFormData] = useState({});

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mlResponse, setMlResponse] = useState(null);

  // ============================
  // FETCH DATASETS
  // ============================
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

  // ============================
  // DATASET CHANGE
  // ============================
  const handleDatasetChange = async (id) => {
    setDatasetId(id);
    setResult(null);
    setError("");
    setMlResponse(null);

    try {
      // 🔥 CALL BACKEND TO GET FEATURES
      const res = await api.get(`/api/predictions/features/${id}`);

      const features = res.data.features || [];

      console.log("🎯 Features from backend:", features);

      setFeatureColumns(features);

      // Initialize form dynamically
      const initialForm = {};
      features.forEach((f) => {
        initialForm[f] = "";
      });

      setFormData(initialForm);
    } catch (err) {
      console.error("❌ Failed to fetch features:", err);
      setError("Failed to load model features");
    }
  };

  // ============================
  // INPUT CHANGE
  // ============================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================
  // 🔥 CLEAN INPUT (IMPROVED)
  // ============================
  const cleanInputData = () => {
    const cleaned = {};

    Object.keys(formData).forEach((key) => {
      let val = formData[key];

      if (val === null || val === undefined) return;

      if (typeof val === "string") {
        val = val.trim();
      }

      if (val === "") return;

      if (!isNaN(Number(val))) {
        val = Number(val);
      }

      cleaned[key] = val;
    });

    return cleaned;
  };

  // ============================
  // PREDICT
  // ============================
  const handlePredict = async () => {
    if (!datasetId) {
      setError("Please select a dataset first");
      return;
    }

    const emptyFields = Object.keys(formData).filter(
      (key) => !formData[key] || formData[key].toString().trim() === "",
    );

    if (emptyFields.length > 0) {
      setError(`Please fill all fields: ${emptyFields.join(", ")}`);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);
      setMlResponse(null);

      const cleanedInput = cleanInputData();

      console.log("🚀 Sending Input:", cleanedInput);

      const res = await api.post("/api/predictions/run", {
        datasetId,
        inputValues: cleanedInput,
      });

      console.log("📡 Backend Response:", res.data);

      const predictionData = res.data.prediction || {};
      setResult(predictionData.predictedValue ?? null);
      setMlResponse(predictionData);

      // 🔥 UPDATE FEATURES FROM BACKEND (BEST FIX)
      if (res.data.features) {
        setFeatureColumns(res.data.features);
      }

      setResult(predictionData.predictedValue ?? null);

      setMlResponse(predictionData);
    } catch (err) {
      console.error("❌ Prediction Error:", err);

      const errorMsg =
        err.response?.data?.error?.message ||
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Failed to generate prediction";

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // UI
  // ============================
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="text-blue-600" />
          Make Prediction
        </h1>
        <p className="text-sm text-gray-500">
          Use your trained model to generate predictions
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle size={20} />
          <div>{error}</div>
        </div>
      )}

      {/* DATASET SELECT */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <label className="block text-sm font-medium mb-2">Select Dataset</label>

        <div className="relative">
          <Database
            className="absolute left-3 top-3.5 text-gray-400"
            size={18}
          />
          <select
            value={datasetId}
            onChange={(e) => handleDatasetChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-xl"
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

      {/* INPUT FIELDS */}
      {featureColumns.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Input Features</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featureColumns.map((col) => (
              <div key={col}>
                <label className="text-sm text-gray-600">{col}</label>
                <input
                  type="text"
                  name={col}
                  value={formData[col] || ""}
                  onChange={handleChange}
                  placeholder={`Enter ${col}`}
                  className="w-full px-4 py-3 border rounded-xl text-sm"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handlePredict}
            disabled={loading}
            className="mt-8 w-full bg-blue-600 text-white py-3 rounded-xl"
          >
            {loading ? "Generating..." : "Generate Prediction"}
          </button>
        </div>
      )}

      {/* RESULT */}
      {result !== null && (
        <div className="bg-blue-50 p-6 rounded-xl">
          <h2 className="text-xl font-bold">
            Prediction:{" "}
            {typeof result === "number" ? result.toFixed(4) : result}
          </h2>

          {mlResponse?.confidence !== undefined && (
            <p>Confidence: {(mlResponse.confidence * 100).toFixed(2)}%</p>
          )}

          {mlResponse?.range && (
            <p>
              Range: {mlResponse.range.min.toFixed(2)} -{" "}
              {mlResponse.range.max.toFixed(2)}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Prediction;
