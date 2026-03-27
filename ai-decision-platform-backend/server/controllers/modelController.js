const axios = require("axios");
const Model = require("../models/Model");
const Dataset = require("../models/Dataset");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

// 🚀 TRAIN MODEL API
exports.trainModel = async (req, res) => {
  try {
    const { datasetId, model_type } = req.body;
    let { features, target } = req.body;

    console.log("📥 RAW BODY:", req.body);

    // ============================
    // ✅ VALIDATION
    // ============================
    if (!datasetId || !model_type) {
      return res.status(400).json({
        message: "datasetId and model_type are required",
      });
    }

    // ============================
    // ✅ PARSE FEATURES
    // ============================
    if (features) {
      try {
        if (typeof features === "string") {
          features = JSON.parse(features);
        }

        if (!Array.isArray(features)) {
          throw new Error("Features must be an array");
        }
      } catch (err) {
        return res.status(400).json({
          message: "Invalid features format",
          error: err.message,
        });
      }
    }

    // ============================
    // ✅ GET DATASET
    // ============================
    const dataset = await Dataset.findById(datasetId);

    if (!dataset) {
      return res.status(404).json({
        message: "Dataset not found",
      });
    }

    const allColumns = dataset.columns || [];

    // ============================
    // 🔥 AUTO TARGET DETECTION (SAFE FALLBACK)
    // ============================
    if (!target) {
      if (dataset.targetColumn) {
        target = dataset.targetColumn;
      } else if (allColumns.length > 0) {
        target = allColumns[allColumns.length - 1];
      }
    }

    if (!target) {
      return res.status(400).json({
        message: "Target column is required",
      });
    }

    target = String(target).trim();

    // ============================
    // 🔥 AUTO FEATURE SELECTION
    // ============================
    if (!features || features.length === 0) {
      features = allColumns.filter((col) => {
        if (!col || typeof col !== "string") return false;

        const clean = col.trim().toLowerCase();

        if (clean === target.toLowerCase()) return false;
        if (clean === "id") return false;

        return true;
      });
    }

    // ============================
    // 🔥 CLEAN FEATURES
    // ============================
    features = features
      .map((f) => (typeof f === "string" ? f.trim() : f))
      .filter((f) => f && f.toLowerCase() !== target.toLowerCase())
      .filter((f) => f.toLowerCase() !== "id");

    if (!features.length) {
      return res.status(400).json({
        message: "No valid features selected",
      });
    }

    console.log("🎯 Final Target:", target);
    console.log("✅ Final Features:", features);

    // ============================
    // 🔥 FILE PATH FIX
    // ============================
    const fullPath = path.join(__dirname, "../uploads", dataset.filePath);

    if (!fs.existsSync(fullPath)) {
      return res.status(400).json({
        message: "Dataset file not found",
      });
    }

    const stats = fs.statSync(fullPath);

    if (stats.size === 0) {
      return res.status(400).json({
        message: "Dataset file is empty",
      });
    }

    // ============================
    // ❌ PREVENT DUPLICATE MODEL
    // ============================
    const existing = await Model.findOne({
      datasetId,
      modelType: model_type,
    });

    if (existing) {
      return res.status(400).json({
        message: "Model already trained for this dataset",
      });
    }

    // ============================
    // 🚀 SEND TO ML SERVICE
    // ============================
    const formData = new FormData();

    formData.append("file", fs.createReadStream(fullPath));
    formData.append("model_type", model_type);
    formData.append("features", JSON.stringify(features));
    formData.append("target", target);

    const ML_URL = `${process.env.ML_API_URL}/train`;

    console.log("🚀 Sending to ML:", ML_URL);

    const contentLength = await new Promise((resolve, reject) => {
      formData.getLength((err, length) => {
        if (err) reject(err);
        else resolve(length);
      });
    });

    const response = await axios.post(ML_URL, formData, {
      headers: {
        ...formData.getHeaders(),
        "Content-Length": contentLength,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 300000,
    });

    console.log("✅ ML RESPONSE:", response.data);

    if (!response.data || response.data.error) {
      return res.status(400).json({
        message: "ML error",
        error: response.data,
      });
    }

    const metrics = response.data?.metrics || {};

    // ============================
    // 💾 SAVE MODEL (🔥 MOST IMPORTANT FIX)
    // ============================
    const model = new Model({
      datasetId,
      modelType: model_type,
      metrics,

      // 🔥 ADD THESE (CRITICAL)
      target,
      features,
    });

    await model.save();

    return res.status(201).json({
      message: "Model trained successfully",
      model,
      mlResponse: response.data,
    });

  } catch (error) {
    console.error("❌ FULL ERROR:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    return res.status(500).json({
      message: "ML service error",
      error: error.response?.data || error.message,
    });
  }
};

// 🔥 GET MODELS BY DATASET
exports.getModelByDataset = async (req, res) => {
  try {
    const { datasetId } = req.params;

    const models = await Model.find({ datasetId });

    if (!models.length) {
      return res.status(404).json({
        message: "No models found",
      });
    }

    return res.status(200).json({
      message: "Models fetched successfully",
      models,
    });
  } catch (error) {
    console.error("Get Model Error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
