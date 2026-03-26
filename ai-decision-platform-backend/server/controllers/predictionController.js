const axios = require("axios");
const Prediction = require("../models/Prediction");
const Dataset = require("../models/Dataset");
const Model = require("../models/Model");

// 🚀 RUN PREDICTION
exports.runPrediction = async (req, res) => {
  try {
    const { datasetId, inputValues } = req.body;

    console.log("📥 Prediction Input:", req.body);

    // ============================
    // ✅ VALIDATION
    // ============================
    if (!datasetId) {
      return res.status(400).json({
        message: "datasetId is required"
      });
    }

    if (
      !inputValues ||
      typeof inputValues !== "object" ||
      Array.isArray(inputValues)
    ) {
      return res.status(400).json({
        message: "inputValues must be a valid object"
      });
    }

    // ============================
    // ✅ CHECK DATASET
    // ============================
    const dataset = await Dataset.findById(datasetId);

    if (!dataset) {
      return res.status(404).json({
        message: "Dataset not found"
      });
    }

    // ============================
    // ✅ CHECK MODEL EXISTS
    // ============================
    const model = await Model.findOne({ datasetId });

    if (!model) {
      return res.status(400).json({
        message: "Model not trained for this dataset"
      });
    }

    // ============================
    // 🔥 CALL ML SERVICE (FIXED)
    // ============================
    const ML_URL = `${process.env.ML_API_URL}/predict`;

    console.log("🚀 Sending to ML:", inputValues);

    const response = await axios.post(
      ML_URL,
      inputValues,   // ✅ FIXED (NO "input" wrapper)
      {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 180000
      }
    );

    console.log("✅ ML RESPONSE:", response.data);

    const mlData = response.data;

    // ============================
    // ❌ HANDLE ML ERROR
    // ============================
    if (!mlData || mlData.error) {
      return res.status(400).json({
        message: "ML error",
        error: mlData
      });
    }

    // ============================
    // ✅ EXTRACT PREDICTION (SAFE)
    // ============================
    const predictedValue =
      mlData.prediction ??
      mlData.result ??
      mlData.predicted_revenue ??
      null;

    if (predictedValue === null) {
      return res.status(500).json({
        message: "Prediction not returned from ML service",
        mlResponse: mlData
      });
    }

    // ============================
    // 💾 SAVE PREDICTION
    // ============================
    const prediction = new Prediction({
      datasetId,
      inputValues,
      predictedValue
    });

    await prediction.save();

    return res.status(200).json({
      message: "Prediction generated successfully",
      prediction,
      mlResponse: mlData
    });

  } catch (error) {
    console.error("❌ Prediction Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    return res.status(500).json({
      message: "ML service error",
      error: error.response?.data || error.message
    });
  }
};


// 🔥 GET HISTORY
exports.getPredictionHistory = async (req, res) => {
  try {
    const predictions = await Prediction.find()
      .populate("datasetId", "datasetName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: predictions.length,
      predictions
    });

  } catch (error) {
    console.error("❌ History Error:", error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};