const axios = require("axios");
const Model = require("../models/Model");
const Dataset = require("../models/Dataset");
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");

// 🚀 TRAIN MODEL API
exports.trainModel = async (req, res) => {
  try {
    let { datasetId, model_type, features, target } = req.body;

    console.log("RAW BODY:", req.body);

    // ✅ FIX: string → array
    if (typeof features === "string") {
      try {
        features = JSON.parse(features);
      } catch {
        return res.status(400).json({
          message: "Invalid features format"
        });
      }
    }

    // ✅ Validate
    if (!datasetId || !model_type || !features || !target) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    if (!Array.isArray(features) || features.length === 0) {
      return res.status(400).json({
        message: "Features must be a non-empty array"
      });
    }

    // ✅ Get dataset
    const dataset = await Dataset.findById(datasetId);

    if (!dataset) {
      return res.status(404).json({
        message: "Dataset not found"
      });
    }

    const fullPath = path.resolve(
      __dirname,
      "../uploads",
      dataset.filePath
    );

    console.log("DATASET PATH FROM DB:", dataset.filePath);
    console.log("FULL PATH:", fullPath);
    console.log("FILE EXISTS:", fs.existsSync(fullPath));

    if (!fs.existsSync(fullPath)) {
      return res.status(400).json({
        message: "Dataset file not found on server"
      });
    }

    // ✅ Prevent duplicate
    const existing = await Model.findOne({
      datasetId,
      modelType: model_type
    });

    if (existing) {
      return res.status(400).json({
        message: "Model already trained for this dataset"
      });
    }

    // ✅ FormData
    const formData = new FormData();

    formData.append("file", fs.createReadStream(fullPath));
    formData.append("model_type", model_type);
    formData.append("features", JSON.stringify(features));
    formData.append("target", target);

    console.log("Sending request to ML API...");

    const response = await axios.post(
      `${process.env.ML_API_URL}/train`,
      formData,
      {
        headers: formData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 60000
      }
    );

    console.log("ML RESPONSE:", response.data);

    if (response.data?.error) {
      return res.status(400).json({
        message: "ML error",
        error: response.data.error
      });
    }

    const accuracy =
      response.data?.accuracy ??
      response.data?.r2_score ??
      null;

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


// 🔥 GET MODELS
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