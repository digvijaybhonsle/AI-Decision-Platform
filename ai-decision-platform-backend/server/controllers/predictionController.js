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
    // ✅ BASIC VALIDATION
    // ============================
    if (!datasetId) {
      return res.status(400).json({
        message: "datasetId is required",
      });
    }

    if (
      !inputValues ||
      typeof inputValues !== "object" ||
      Array.isArray(inputValues)
    ) {
      return res.status(400).json({
        message: "inputValues must be a valid object",
      });
    }

    // ============================
    // ✅ CHECK DATASET
    // ============================
    const dataset = await Dataset.findById(datasetId);

    if (!dataset) {
      return res.status(404).json({
        message: "Dataset not found",
      });
    }

    // ============================
    // ✅ CHECK MODEL EXISTS
    // ============================
    const model = await Model.findOne({ datasetId });

    if (!model) {
      return res.status(400).json({
        message: "Model not trained for this dataset",
      });
    }

    // ============================
    // 🔥 SCHEMA VALIDATION (IMPORTANT)
    // ============================

    const allColumns = dataset.columns || [];
    const target = dataset.targetColumn;

    // remove target column
    const featureColumns = allColumns.filter((col) => col !== target);

    // remove unwanted fields + convert types
    const cleanedInput = {};

    featureColumns.forEach((col) => {
      let value = inputValues[col];

      if (value === undefined) return;

      // convert to number if possible
      if (value !== "" && !isNaN(value)) {
        value = Number(value);
      }

      cleanedInput[col] = value;
    });

    // ❌ check missing fields
    const missingFields = featureColumns.filter(
      (col) =>
        cleanedInput[col] === undefined ||
        cleanedInput[col] === ""
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Missing required input fields",
        missingFields,
      });
    }

    // ============================
    // 🔥 CALL ML SERVICE
    // ============================
    const ML_URL = `${process.env.ML_API_URL}/predict`;

    console.log("🚀 Sending to ML:", cleanedInput);

    const response = await axios.post(ML_URL, cleanedInput, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 180000,
      validateStatus: () => true, // 🔥 prevent crash
    });

    // ============================
    // ❌ HANDLE ML FAILURE
    // ============================
    if (response.status !== 200) {
      console.error("❌ ML STATUS:", response.status);
      console.error("❌ ML DATA:", response.data);

      return res.status(503).json({
        message: "ML service unavailable",
        retry: true,
        status: response.status,
      });
    }

    const mlData = response.data;

    console.log("✅ ML RESPONSE:", mlData);

    if (!mlData || mlData.error) {
      return res.status(400).json({
        message: "ML error",
        error: mlData,
      });
    }

    // ============================
    // ✅ EXTRACT PREDICTION (ROBUST)
    // ============================
    const predictedValue =
      mlData.prediction ??
      mlData.result ??
      mlData.output ??
      mlData.predicted_value ??
      null;

    if (predictedValue === null) {
      return res.status(500).json({
        message: "Prediction not returned from ML service",
        mlResponse: mlData,
      });
    }

    // ============================
    // 💾 SAVE PREDICTION
    // ============================
    const prediction = new Prediction({
      datasetId,
      inputValues: cleanedInput, // ✅ save cleaned version
      predictedValue,
    });

    await prediction.save();

    return res.status(200).json({
      message: "Prediction generated successfully",
      prediction,
      mlResponse: mlData,
    });

  } catch (error) {
    console.error("❌ Prediction Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    return res.status(500).json({
      message: "ML service error",
      error:
        typeof error.response?.data === "string"
          ? "ML returned HTML (likely sleeping/502)"
          : error.response?.data || error.message,
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
      predictions,
    });
  } catch (error) {
    console.error("❌ History Error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};