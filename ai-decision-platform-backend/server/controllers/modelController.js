const axios = require("axios");
const Model = require("../models/Model");
const Dataset = require("../models/Dataset");
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");

// 🚀 TRAIN MODEL API
exports.trainModel = async (req, res) => {
  try {
    const { datasetId, model_type } = req.body;
    let features = req.body.features;
    const target = req.body.target;

    console.log("RAW BODY:", req.body);

    // ✅ Validate basic fields
    if (!datasetId || !model_type) {
      return res.status(400).json({
        message: "datasetId and model_type are required",
      });
    }

    // ✅ Parse features safely (optional)
    if (features) {
      if (typeof features === "string") {
        try {
          features = JSON.parse(features);
        } catch {
          return res.status(400).json({
            message: "Invalid features format",
          });
        }
      }

      if (!Array.isArray(features)) {
        return res.status(400).json({
          message: "Features must be an array",
        });
      }
    }

    // ✅ Get dataset
    const dataset = await Dataset.findById(datasetId);

    if (!dataset) {
      return res.status(404).json({
        message: "Dataset not found",
      });
    }

    let fullPath;

    if (path.isAbsolute(dataset.filePath)) {
      fullPath = dataset.filePath; 
    } else {
      fullPath = path.resolve(__dirname, "../uploads", dataset.filePath);
    }

    console.log("FINAL PATH:", fullPath);
    console.log("FILE EXISTS:", fs.existsSync(fullPath));

    console.log("📁 DATASET PATH:", fullPath);

    if (!fs.existsSync(fullPath)) {
      return res.status(400).json({
        message: "Dataset file not found on server",
      });
    }

    // ✅ Prevent duplicate model
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
    // 🔥 SEND TO ML SERVICE
    // ============================
    const formData = new FormData();

    formData.append("file", fs.createReadStream(fullPath));
    formData.append("model_type", model_type);

    if (features) {
      formData.append("features", JSON.stringify(features));
    }

    if (target) {
      formData.append("target", target);
    }

    console.log("🚀 Sending request to ML API...");

    const response = await axios.post(
      `${process.env.ML_API_URL}/train`,
      formData,
      {
        headers: formData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 60000,
      },
    );

    console.log("✅ ML RESPONSE:", response.data);

    // ❌ Handle ML error
    if (response.data?.error) {
      return res.status(400).json({
        message: "ML error",
        error: response.data.error,
        details: response.data,
      });
    }

    // ✅ Extract accuracy safely
    const accuracy =
      response.data?.metrics?.accuracy ??
      response.data?.metrics?.r2_score ??
      null;

    // 💾 Save model metadata
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

// 🔥 GET MODELS
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
