const axios = require("axios");
const Model = require("../models/Model");
const Dataset = require("../models/Dataset");
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");

// 🚀 TRAIN MODEL API
exports.trainModel = async (req, res) => {
  try {
    const { datasetId, model_type, features, target } = req.body;

    // ✅ Validate input
    if (!datasetId || !model_type || !features || !target) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // ✅ Validate features array
    if (!Array.isArray(features) || features.length === 0) {
      return res.status(400).json({
        message: "Features must be a non-empty array"
      });
    }

    // ✅ Find dataset
    const dataset = await Dataset.findById(datasetId);

    if (!dataset) {
      return res.status(404).json({
        message: "Dataset not found"
      });
    }

    // ✅ FIXED PATH (IMPORTANT 🔥)
    const fullPath = path.join(__dirname, "..", "uploads", dataset.filePath);

    // ✅ Check file exists
    if (!fs.existsSync(fullPath)) {
      return res.status(400).json({
        message: "Dataset file not found on server"
      });
    }

    // ✅ Prevent duplicate model training
    const existing = await Model.findOne({ datasetId, modelType: model_type });

    if (existing) {
      return res.status(400).json({
        message: "Model already trained for this dataset"
      });
    }

    // ✅ Create FormData
    const formData = new FormData();

    formData.append("file", fs.createReadStream(fullPath));
    formData.append("model_type", model_type);
    formData.append("features", JSON.stringify(features));
    formData.append("target", target);

    // ✅ Call ML API
    const response = await axios.post(
      `${process.env.ML_API_URL}/train`,
      formData,
      {
        headers: {
          ...formData.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 60000
      }
    );

    // ❌ Handle ML errors properly
    if (response.data?.error) {
      return res.status(400).json({
        message: "ML error",
        error: response.data.error
      });
    }

    // ✅ Extract accuracy
    const accuracy =
      response.data?.accuracy ??
      response.data?.r2_score ??
      null;

    // ✅ Save model
    const model = new Model({
      datasetId,
      modelType: model_type,
      accuracy
    });

    await model.save();

    res.status(201).json({
      message: "Model trained successfully",
      model,
      mlResponse: response.data
    });

  } catch (error) {

    console.error("FULL ERROR:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    res.status(500).json({
      message: "ML service error",
      error: error.response?.data || error.message
    });

  }
};


// 🔥 GET ALL MODELS BY DATASET
exports.getModelByDataset = async (req, res) => {
  try {
    const { datasetId } = req.params;

    const models = await Model.find({ datasetId });

    if (!models.length) {
      return res.status(404).json({
        message: "No models found"
      });
    }

    res.status(200).json({
      message: "Models fetched successfully",
      models
    });

  } catch (error) {

    console.error("Get Model Error:", error);

    res.status(500).json({
      message: "Server error"
    });

  }
};