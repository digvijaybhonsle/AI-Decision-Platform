const axios = require("axios");
const Model = require("../models/Model");
const FormData = require("form-data");

// 🚀 TRAIN MODEL API (STREAM FILE DIRECTLY)
exports.trainModel = async (req, res) => {
  try {
    const { model_type } = req.body;
    let { features, target } = req.body;

    console.log("📥 RAW BODY:", req.body);

    // ============================
    // ✅ VALIDATION
    // ============================
    if (!model_type) {
      return res.status(400).json({
        message: "model_type is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Dataset file is required",
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
    // 🔥 SEND FILE TO ML SERVICE
    // ============================
    const formData = new FormData();

    formData.append("file", req.file.buffer, req.file.originalname);
    formData.append("model_type", model_type);

    if (features) {
      formData.append("features", JSON.stringify(features));
    }

    if (target) {
      formData.append("target", target);
    }

    const ML_URL = `${process.env.ML_API_URL}/train`;
    console.log("🚀 Sending file to ML:", ML_URL);

    const response = await axios.post(ML_URL, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 180000, // 🔥 important for Render
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
    // 📊 EXTRACT METRICS
    // ============================
    const accuracy =
      response.data?.metrics?.accuracy ??
      response.data?.metrics?.r2_score ??
      null;

    // ============================
    // 💾 SAVE MODEL METADATA
    // ============================
    const model = new Model({
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

// 🔥 GET MODELS
exports.getModelByDataset = async (req, res) => {
  try {
    const models = await Model.find();

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