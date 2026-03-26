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

    // 🔥 FIX 1: SAFE PATH RESOLUTION
    const fullPath = path.resolve(dataset.filePath);

    console.log("📁 FINAL PATH:", fullPath);

    if (!fs.existsSync(fullPath)) {
      return res.status(400).json({
        message: "Dataset file not found",
        debug: {
          storedPath: dataset.filePath,
          resolvedPath: fullPath,
        },
      });
    }

    // 🔥 FIX 2: CHECK EMPTY FILE
    const stats = fs.statSync(fullPath);

    console.log("📦 FILE SIZE:", stats.size);

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
    // 🔥 SEND FILE TO ML SERVICE
    // ============================
    const formData = new FormData();

    // ✅ CLEAN FILE STREAM
    formData.append(
      "file",
      fs.createReadStream(fullPath),
      path.basename(fullPath)
    );

    formData.append("model_type", model_type);

    if (features) {
      formData.append("features", JSON.stringify(features));
    }

    if (target) {
      formData.append("target", target);
    }

    const ML_URL = `${process.env.ML_API_URL}/train`;

    console.log("🚀 Sending to ML:", ML_URL);

    // ✅ SAFE content-length
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

    // ============================
    // ❌ HANDLE ML ERROR
    // ============================
    if (!response.data || response.data.error) {
      return res.status(400).json({
        message: "ML error",
        error: response.data,
      });
    }

    // ============================
    // 📊 METRICS
    // ============================
    const accuracy =
      response.data?.metrics?.accuracy ??
      response.data?.metrics?.r2_score ??
      null;

    // ============================
    // 💾 SAVE MODEL
    // ============================
    const model = new Model({
      datasetId,
      modelType: model_type,
      accuracy,
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
