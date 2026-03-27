import React, { useState, useEffect } from "react";
import { UploadCloud, Trash2 } from "lucide-react";
import api from "../utils/api";

const DatasetUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [columns, setColumns] = useState([]);
  const [preview, setPreview] = useState([]);
  const [datasets, setDatasets] = useState([]);

  // 🔥 FETCH DATASETS
  const fetchDatasets = async () => {
    try {
      const res = await api.get("/api/dataset");
      setDatasets(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  // ✅ File validation
  const handleFileChange = (e) => {
    const selected = e.target.files[0];

    if (!selected) return;

    if (!selected.name.endsWith(".csv")) {
      setError("Only CSV files allowed");
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      setError("File size must be < 5MB");
      return;
    }

    setError("");
    setFile(selected);
  };

  // ✅ Upload dataset
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      // 🔥 Upload API
      const res = await api.post("/api/dataset/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { datasetId, columns } = res.data;

      setColumns(columns);

      // 🔥 Fetch preview
      const previewRes = await api.get(`/api/dataset/${datasetId}/preview`);

      setPreview(previewRes.data.previewRows);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

   // ❌ DELETE DATASET
  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/dataset/${id}`);
      fetchDatasets();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Upload Dataset</h1>
        <p className="text-gray-500">Upload CSV to train models</p>
      </div>

      {/* Upload */}
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 transition flex flex-col items-center justify-center">
          {/* Icon */}
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 mb-4">
            <UploadCloud size={28} className="text-blue-600" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            Upload your dataset
          </h3>

          {/* Subtitle */}
          <p className="text-sm text-gray-500 mb-4">
            Drag & drop your CSV file here or browse from your device
          </p>

          {/* Input */}
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="upload"
          />

          {/* CTA */}
          <label
            htmlFor="upload"
            className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            Browse File
          </label>

          {/* File Info */}
          {file && (
            <div className="mt-5 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700">
              📄 {file.name}
            </div>
          )}

          {/* Error */}
          {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}

          {/* Upload Button */}
          {file && (
            <button
              onClick={handleUpload}
              disabled={loading}
              className={`mt-5 px-6 py-2 rounded-lg text-white font-medium transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 shadow"
              }`}
            >
              {loading ? "Uploading..." : "Upload Dataset"}
            </button>
          )}

          {/* Helper Text */}
          {!file && (
            <p className="text-xs text-gray-400 mt-4">
              Supported format: CSV • Max size: 5MB
            </p>
          )}
        </div>
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Dataset Preview</h2>

          {/* 🔥 Scroll Container Added */}
          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-100 w-full overflow-auto">
              <table className="min-w-150 w-full text-sm">
                {/* Sticky Header */}
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col}
                        className="py-2 px-4 text-left whitespace-nowrap font-medium text-gray-600"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y text-gray-700">
                  {preview.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition">
                      {columns.map((col) => (
                        <td key={col} className="px-4 py-2 whitespace-nowrap">
                          {row[col]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 DATASET LIST */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Your Datasets</h2>

        {datasets.length === 0 ? (
          <p className="text-gray-400 text-sm">No datasets uploaded yet</p>
        ) : (
          <div className="space-y-3">
            {datasets.map((d) => (
              <div
                key={d._id}
                className="flex items-center justify-between border p-4 rounded-lg hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium">{d.datasetName}</p>
                  <p className="text-xs text-gray-500">
                    {d.columns?.length} columns • {d.rows} rows
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(d._id)}
                  className="text-red-500 hover:text-red-700 cursor-pointer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DatasetUpload;
