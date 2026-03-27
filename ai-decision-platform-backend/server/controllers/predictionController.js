const axios = require("axios");
const Prediction = require("../models/Prediction");
const Dataset = require("../models/Dataset");
const Model = require("../models/Model");

// 🚀 RUN PREDICTION - FIXED TARGET EXCLUSION
exports.runPrediction = async (req, res) => {
  try {
    const { datasetId, inputValues } = req.body;

    console.log("📥 Prediction Request:", { datasetId, inputValues });

    if (!datasetId) {
      return res.status(400).json({ message: "datasetId is required" });
    }

    if (!inputValues || typeof inputValues !== "object" || Array.isArray(inputValues)) {
      return res.status(400).json({ message: "inputValues must be a valid object" });
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
      return res.status(400).json({ message: "Model not trained for this dataset" });
    }

    // ============================
    // 🔥 ROBUST FEATURE FILTERING (Fixed)
    // ============================
    const allColumns = dataset.columns || [];
    let target = dataset.targetColumn || "";

    // Normalize target (trim + lowercase)
    target = String(target).trim();

    // Filter out target column properly
    const featureColumns = allColumns.filter((col) => {
      if (typeof col !== "string") return true;
      const normalizedCol = col.trim();
      return normalizedCol.toLowerCase() !== target.toLowerCase();
    });

    console.log(`🎯 Target Column: "${target}"`);
    console.log(`✅ Feature Columns (${featureColumns.length}):`, featureColumns);

    // ============================
    // 🔥 BUILD CLEANED INPUT
    // ============================
    const cleanedInput = {};

    featureColumns.forEach((col) => {
      let value = inputValues[col];

      // Skip if value is missing, empty, or null
      if (value === undefined || value === "" || value === null) {
        return;
      }

      // Convert string numbers to actual numbers
      if (!isNaN(value) && value !== "") {
        value = Number(value);
      }

      cleanedInput[col] = value;
    });

    // Check for missing required features
    const missingFields = featureColumns.filter((col) => cleanedInput[col] === undefined);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Missing required input fields",
        requiredFields: featureColumns,
        missingFields,
        targetColumn: target,           // for debugging
        note: "Make sure you are not sending the target column as input"
      });
    }

    // ============================
    // 🔥 CALL ML SERVICE
    // ============================
    const ML_URL = `${process.env.ML_API_URL}/predict`;

    console.log("🚀 Sending to ML Service:", cleanedInput);

    const response = await axios.post(ML_URL, cleanedInput, {
      headers: { "Content-Type": "application/json" },
      timeout: 180000,
      validateStatus: () => true,
    });

    console.log("📡 ML Status:", response.status);
    console.log("📡 ML Response:", response.data);

    const mlData = response.data;

    // ============================
    // 🔥 ML RESPONSE HANDLING
    // ============================
    if (response.status >= 500) {
      return res.status(503).json({
        message: "ML service is temporarily unavailable",
        retry: true,
        detail: mlData?.detail || "Internal ML server error",
      });
    }

    if (response.status === 400) {
      return res.status(400).json({
        message: "Invalid prediction input",
        error: mlData?.detail || mlData?.error || mlData,
        required_features: mlData?.required_features || null,
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
        error: mlData?.error || mlData?.detail || mlData,
      });
    }

    const predictedValue = mlData.prediction ?? null;

    if (predictedValue === null || predictedValue === undefined) {
      return res.status(500).json({
        message: "No prediction value returned from ML service",
        mlResponse: mlData,
      });
    }

    // ============================
    // 💾 SAVE PREDICTION
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
      mlResponse: mlData,
    });

  } catch (error) {
    console.error("❌ Prediction Controller Error:", {
      message: error.message,
      stack: error.stack,
      responseData: error.response?.data,
      responseStatus: error.response?.status,
    });

    return res.status(500).json({
      message: "Failed to process prediction",
      error: error.response?.data?.detail || error.message || "Internal server error",
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
      message: "Failed to fetch prediction history" 
    });
  }
};