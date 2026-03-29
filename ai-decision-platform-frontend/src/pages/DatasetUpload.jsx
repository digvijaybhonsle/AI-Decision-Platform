import React, { useState, useEffect } from "react";
import { UploadCloud, Trash2, FileText } from "lucide-react";
import api from "../utils/api";

const DatasetUpload = () => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [columns, setColumns] = useState([]);
  const [preview, setPreview] = useState([]);
  const [datasets, setDatasets] = useState([]);

  // ============================
  // FETCH DATASETS
  // ============================
  const fetchDatasets = async () => {
    try {
      const res = await api.get("/api/dataset");
      setDatasets(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  // ============================
  // FILE HANDLING
  // ============================
  const validateFile = (selected) => {
    if (!selected.name.endsWith(".csv")) {
      return "Only CSV files allowed";
    }
    if (selected.size > 5 * 1024 * 1024) {
      return "File size must be < 5MB";
    }
    return "";
  };

  const handleFile = (selected) => {
    if (!selected) return;
    const err = validateFile(selected);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setFile(selected);
  };

  const handleFileChange = (e) => {
    handleFile(e.target.files[0]);
  };

  // ============================
  // DRAG & DROP
  // ============================
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files[0]);
  };

  // ============================
  // UPLOAD
  // ============================
  const handleUpload = async () => {
    if (!file) return setError("Please select a file");

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/api/dataset/upload", formData);

      const { datasetId, columns } = res.data;
      setColumns(columns);

      const previewRes = await api.get(`/api/dataset/${datasetId}/preview`);
      setPreview(previewRes.data.previewRows);

      fetchDatasets();
      setFile(null);

    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // DELETE
  // ============================
  const handleDelete = async (id) => {
    await api.delete(`/api/dataset/${id}`);
    fetchDatasets();
  };

  return (
    <div className="space-y-8 p-4 md:p-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Dataset Upload
        </h1>
        <p className="text-gray-500 text-sm">
          Upload CSV files to train your ML models
        </p>
      </div>

      {/* UPLOAD CARD */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`bg-white p-8 rounded-2xl shadow-sm border-2 transition
          ${dragActive ? "border-blue-500 bg-blue-50" : "border-dashed border-gray-300"}
        `}
      >
        <div className="flex flex-col items-center text-center space-y-4">

          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <UploadCloud className="text-blue-600" size={28} />
          </div>

          <h3 className="font-semibold text-lg">
            Drag & Drop your dataset
          </h3>

          <p className="text-sm text-gray-500">
            or click below to browse files
          </p>

          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="fileUpload"
          />

          <label
            htmlFor="fileUpload"
            className="px-5 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition"
          >
            Browse File
          </label>

          {/* FILE INFO */}
          {file && (
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg text-sm">
              <FileText size={16} />
              {file.name}
            </div>
          )}

          {/* ERROR */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* BUTTON */}
          {file && (
            <button
              onClick={handleUpload}
              className={`mt-2 px-6 py-2 rounded-lg text-white cursor-pointer font-medium transition
                ${loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}
              `}
            >
              {loading ? "Uploading..." : "Upload Dataset"}
            </button>
          )}

          <p className="text-xs text-gray-400">
            CSV only • Max 5MB
          </p>
        </div>
      </div>

      {/* PREVIEW */}
      {preview.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h2 className="font-semibold mb-4">Preview</h2>

          <div className="overflow-auto border rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {columns.map((col) => (
                    <th key={col} className="px-4 py-2 text-left">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {columns.map((col) => (
                      <td key={col} className="px-4 py-2">
                        {row[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DATASET LIST */}
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        <h2 className="font-semibold mb-4">Your Datasets</h2>

        {datasets.length === 0 ? (
          <div className="text-center text-gray-400 py-6">
            No datasets uploaded yet
          </div>
        ) : (
          <div className="grid gap-3">
            {datasets.map((d) => (
              <div
                key={d._id}
                className="flex justify-between items-center p-4 rounded-xl border hover:shadow-sm transition"
              >
                <div>
                  <p className="font-medium">{d.datasetName}</p>
                  <p className="text-xs text-gray-500">
                    {d.columns?.length} columns • {d.rows} rows
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(d._id)}
                  className="text-red-500 hover:text-red-700"
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