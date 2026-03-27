const axios = require("axios");
const Prediction = require("../models/Prediction");
const Dataset = require("../models/Dataset");
const Model = require("../models/Model");

// 🚀 RUN PREDICTION - FINAL FIXED VERSION
exports.runPrediction = async (req, res) => {
  try {
    const { datasetId, inputValues } = req.body;

    console.log("📥 Prediction Request:", { datasetId, inputValues });

    if (!datasetId) {
      return res.status(400).json({ message: "datasetId is required" });
    }

    if (
      !inputValues ||
      typeof inputValues !== "object" ||
      Array.isArray(inputValues)
    ) {
      return res
        .status(400)
        .json({ message: "inputValues must be a valid object" });
    }

    // ============================
    // ✅ CHECK DATASET & MODEL
    // ============================
    const dataset = await Dataset.findById(datasetId);
    if (!dataset) {
      return res.status(404).json({ message: "Dataset not found" });
    }

    const trainedModel = await Model.findOne({ datasetId });
    if (!trainedModel) {
      return res
        .status(400)
        .json({ message: "Model not trained for this dataset" });
    }

    // ============================
    // 🔥 TARGET DETECTION
    // ============================
    const target = trainedModel.target;

    if (!target) {
      return res.status(400).json({
        message: "Model target not found. Please retrain model.",
      });
    }

    const featureColumns = (trainedModel.features || [])
      .map((f) => (typeof f === "string" ? f.trim() : f))
      .filter((f) => f && f.toLowerCase() !== target.toLowerCase())
      .filter((f) => f.toLowerCase() !== "id");

    if (!featureColumns.length) {
      return res.status(400).json({
        message: "No valid features found in model. Please retrain model.",
      });
    }

    console.log(`🎯 Target: ${target}`);
    console.log(`✅ Features:`, featureColumns);

    // ============================
    // 🔥 CLEAN INPUT (SAFE VERSION)
    // ============================
    const cleanedInput = {};

    featureColumns.forEach((col) => {
      let value = inputValues[col];

      if (value === undefined || value === null) return;

      if (typeof value === "string") {
        value = value.trim();
      }

      if (value === "") return;

      // safe conversion
      if (!isNaN(Number(value))) {
        value = Number(value);
      }

      cleanedInput[col] = value;
    });

    // ============================
    // ❗ REMOVE TARGET IF SENT
    // ============================
    if (cleanedInput[target] !== undefined) {
      console.log(`⚠️ Removing target field "${target}" from input`);
      delete cleanedInput[target];
    }

    // ============================
    // ✅ CHECK MISSING FIELDS
    // ============================
    const missingFields = featureColumns.filter(
      (col) => cleanedInput[col] === undefined,
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Missing required input fields",
        requiredFields: featureColumns,
        missingFields,
        targetColumn: target,
        hint: "Fill all fields and DO NOT include target column",
      });
    }

    // ============================
    // 🚀 CALL ML SERVICE
    // ============================
    const ML_URL = `${process.env.ML_API_URL}/predict`;

    console.log("🚀 Sending to ML:", cleanedInput);

    const response = await axios.post(ML_URL, cleanedInput, {
      headers: { "Content-Type": "application/json" },
      timeout: 180000,
      validateStatus: () => true,
    });

    console.log("📡 ML STATUS:", response.status);
    console.log("📡 ML RESPONSE:", response.data);

    const mlData = response.data;

    // ============================
    // ❌ HANDLE ML ERRORS (IMPROVED)
    // ============================
    if (response.status >= 500) {
      return res.status(503).json({
        message: "ML service is temporarily unavailable",
        retry: true,
        detail: mlData?.detail || mlData?.error || "Internal ML error",
      });
    }

    if (response.status === 400) {
      return res.status(400).json({
        message: "Invalid prediction input",
        error: mlData?.detail || mlData?.error || mlData,
        requiredFields: mlData?.required_features,
      });
    }

    if (response.status !== 200) {
      return res.status(response.status).json({
        message: "Unexpected response from ML service",
        error: mlData,
      });
    }

    if (!mlData || mlData.error) {
      return res.status(400).json({
        message: "ML service returned an error",
        error: mlData?.error || mlData?.detail,
      });
    }

    // ============================
    // ✅ EXTRACT PREDICTION
    // ============================
    const predictedValue = mlData.prediction ?? null;

    if (predictedValue === null) {
      return res.status(500).json({
        message: "No prediction value returned from ML service",
      });
    }

    // ============================
    // 💾 SAVE TO DATABASE
    // ============================
    const predictionRecord = new Prediction({
      datasetId,
      inputValues: cleanedInput,
      predictedValue: Number(predictedValue),
      confidence: mlData.confidence,
      range: mlData.range,
      modelType: mlData.model_type,
    });

    await predictionRecord.save();

    // ============================
    // ✅ SUCCESS RESPONSE
    // ============================
    return res.status(200).json({
      message: "Prediction generated successfully",
      features: featureColumns, // 🔥 ADD THIS (frontend fix)
      target: target, // 🔥 ADD THIS
      prediction: {
        _id: predictionRecord._id,
        datasetId,
        inputValues: cleanedInput,
        predictedValue: Number(predictedValue),
        confidence: mlData.confidence,
        range: mlData.range,
        featuresUsed: mlData.features_used || featureColumns,
        modelType: mlData.model_type,
      },
    });
  } catch (error) {
    console.error("❌ Prediction Controller Error:", error);

    return res.status(500).json({
      message: "Failed to process prediction",
      error: error.response?.data || error.message || "Internal server error",
    });
  }
};

exports.getPredictionFeatures = async (req, res) => {
  try {
    const { datasetId } = req.params;

    // 🔥 ONLY USE MODEL (SOURCE OF TRUTH)
    const model = await Model.findOne({ datasetId });

    if (!model) {
      return res.status(404).json({
        message: "Model not trained yet. Please train a model first.",
      });
    }

    // ============================
    // ✅ VALIDATION
    // ============================
    if (!model.features || !Array.isArray(model.features)) {
      return res.status(400).json({
        message: "Model features not found or invalid",
      });
    }

    if (!model.target) {
      return res.status(400).json({
        message: "Model target not found",
      });
    }

    // ============================
    // 🔥 CLEAN FEATURES
    // ============================
    const features = model.features
      .map((f) => (typeof f === "string" ? f.trim() : f))
      .filter((f) => f && f.toLowerCase() !== model.target.toLowerCase())
      .filter((f) => f.toLowerCase() !== "id"); // 🔥 remove ID automatically

    return res.status(200).json({
      features,
      target: model.target,
      totalFeatures: features.length,
    });
  } catch (err) {
    console.error("❌ Feature fetch error:", err);

    return res.status(500).json({
      message: "Failed to fetch features",
      error: err.message,
    });
  }
};

// 🔥 GET PREDICTION HISTORY (unchanged)
exports.getPredictionHistory = async (req, res) => {
  try {
    const predictions = await Prediction.find()
      .populate("datasetId", "datasetName targetColumn")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      count: predictions.length,
      predictions,
    });
  } catch (error) {
    console.error("❌ History Error:", error);
    return res.status(500).json({
      message: "Failed to fetch prediction history",
    });
  }
};
