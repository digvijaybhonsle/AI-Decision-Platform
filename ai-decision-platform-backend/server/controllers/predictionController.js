const axios = require("axios");
const Prediction = require("../models/Prediction");
const Dataset = require("../models/Dataset");
const Model = require("../models/Model");

// 🚀 RUN PREDICTION - FINAL IMPROVED VERSION
exports.runPrediction = async (req, res) => {
  try {
    const { datasetId, inputValues } = req.body;

    console.log("📥 Prediction Request:", { datasetId, inputValues });

    // ============================
    // ✅ BASIC VALIDATION
    // ============================
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
    // 🔥 FEATURE VALIDATION (Only trained features)
    // ============================
    const allColumns = dataset.columns || [];
    const target = dataset.targetColumn || "";
    const featureColumns = allColumns.filter((col) => col !== target);

    const cleanedInput = {};

    featureColumns.forEach((col) => {
      let value = inputValues[col];

      // Skip if value is missing or empty
      if (value === undefined || value === "" || value === null) {
        return;
      }

      // Convert to number if it's numeric string
      if (!isNaN(value) && value !== "") {
        value = Number(value);
      }

      cleanedInput[col] = value;
    });

    // Check missing required features
    const missingFields = featureColumns.filter((col) => cleanedInput[col] === undefined);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Missing required input fields",
        requiredFields: featureColumns,
        missingFields,
      });
    }

    // ============================
    // 🔥 CALL ML SERVICE
    // ============================
    const ML_URL = `${process.env.ML_API_URL}/predict`;

    console.log("🚀 Sending to ML:", cleanedInput);

    const response = await axios.post(ML_URL, cleanedInput, {
      headers: { "Content-Type": "application/json" },
      timeout: 180000,
      validateStatus: () => true,
    });

    console.log("📡 ML Status:", response.status);
    console.log("📡 ML Response:", response.data);

    const mlData = response.data;

    // ============================
    // 🔥 IMPROVED ML RESPONSE HANDLING
    // ============================

    // ML Service Internal Error (500+)
    if (response.status >= 500) {
      return res.status(503).json({
        message: "ML service is temporarily unavailable",
        retry: true,
        detail: mlData?.detail || "Internal ML server error",
      });
    }

    // ML Validation / Business Error (400)
    if (response.status === 400) {
      return res.status(400).json({
        message: "Invalid prediction input",
        error: mlData?.detail || mlData?.error || mlData,
        required_features: mlData?.required_features || null,   // Helpful for frontend
      });
    }

    // Any other non-200 response
    if (response.status !== 200) {
      return res.status(response.status).json({
        message: "Unexpected response from ML service",
        error: mlData,
      });
    }

    // ML returned logical error
    if (!mlData || mlData.error) {
      return res.status(400).json({
        message: "ML service returned an error",
        error: mlData?.error || mlData?.detail || mlData,
      });
    }

    // Extract prediction safely
    const predictedValue = mlData.prediction ?? 
                           mlData.result ?? 
                           mlData.output ?? 
                           mlData.predicted_value ?? 
                           null;

    if (predictedValue === null || predictedValue === undefined) {
      return res.status(500).json({
        message: "No prediction value returned from ML service",
        mlResponse: mlData,
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

// 🔥 GET PREDICTION HISTORY
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