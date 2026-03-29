import React, { useEffect, useState } from "react";
import { Brain, PlayCircle, Database, AlertCircle, Sparkles } from "lucide-react";
import api from "../utils/api";

const Prediction = () => {
  const [datasets, setDatasets] = useState([]);
  const [datasetId, setDatasetId] = useState("");
  const [featureColumns, setFeatureColumns] = useState([]);
  const [formData, setFormData] = useState({});

  const [result, setResult] = useState(null);
  const [mlResponse, setMlResponse] = useState(null);

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
  // DATASET SELECT
  // ============================
  const handleDatasetChange = async (id) => {
    setDatasetId(id);
    setResult(null);
    setError("");
    setMlResponse(null);

    try {
      const res = await api.get(`/api/predictions/features/${id}`);
      const features = res.data.features || [];

      setFeatureColumns(features);

      const initial = {};
      features.forEach((f) => (initial[f] = ""));
      setFormData(initial);

    } catch {
      setError("Model not trained for this dataset");
    }
  };

  // ============================
  // INPUT
  // ============================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const cleanInput = () => {
    const cleaned = {};
    Object.keys(formData).forEach((k) => {
      let v = formData[k]?.trim();
      if (!v) return;
      if (!isNaN(v)) v = Number(v);
      cleaned[k] = v;
    });
    return cleaned;
  };

  // ============================
  // PREDICT
  // ============================
  const handlePredict = async () => {
    if (!datasetId) return setError("Select dataset first");

    const empty = Object.keys(formData).filter((k) => !formData[k]);
    if (empty.length) return setError(`Fill: ${empty.join(", ")}`);

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/api/predictions/run", {
        datasetId,
        inputValues: cleanInput(),
      });

      const data = res.data.prediction;
      setResult(data.predictedValue);
      setMlResponse(data);

    } catch (err) {
      setError(err.response?.data?.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="text-blue-600" />
          Prediction Engine
        </h1>
        <p className="text-gray-500 text-sm">
          Generate predictions using trained ML models
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="flex gap-3 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl">
          <AlertCircle />
          {error}
        </div>
      )}

      {/* STEP 1: DATASET */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        <h2 className="font-semibold mb-3">Step 1: Select Dataset</h2>

        <div className="relative">
          <Database className="absolute left-3 top-3.5 text-gray-400" />
          <select
            value={datasetId}
            onChange={(e) => handleDatasetChange(e.target.value)}
            className="w-full pl-10 py-3 border rounded-xl"
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

      {/* STEP 2: INPUT */}
      {featureColumns.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="font-semibold mb-4">Step 2: Enter Features</h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {featureColumns.map((col) => (
              <input
                key={col}
                name={col}
                value={formData[col] || ""}
                onChange={handleChange}
                placeholder={col}
                className="px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            ))}
          </div>

          <button
            onClick={handlePredict}
            className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl cursor-pointer flex justify-center items-center gap-2"
          >
            {loading ? "Generating..." : <><PlayCircle /> Generate Prediction</>}
          </button>
        </div>
      )}

      {/* RESULT */}
      {result !== null && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="text-blue-600" />
            Prediction Result
          </h2>

          <p className="text-3xl font-bold text-blue-700">
            {typeof result === "number" ? result.toFixed(4) : result}
          </p>

          {mlResponse?.confidence && (
            <p className="text-sm text-gray-600 mt-2">
              Confidence: {(mlResponse.confidence * 100).toFixed(2)}%
            </p>
          )}

          {mlResponse?.range && (
            <p className="text-sm text-gray-600">
              Range: {mlResponse.range.min.toFixed(2)} -{" "}
              {mlResponse.range.max.toFixed(2)}
            </p>
          )}
        </div>
      )}

      {/* EMPTY STATE */}
      {!datasetId && (
        <div className="text-center text-gray-400 py-10">
          Select a dataset to begin prediction
        </div>
      )}

    </div>
  );
};

export default Prediction;