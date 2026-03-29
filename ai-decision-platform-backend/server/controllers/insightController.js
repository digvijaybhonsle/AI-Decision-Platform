const axios = require("axios");
const Insight = require("../models/Insights");
const Dataset = require("../models/Dataset");
const Model = require("../models/Model");
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");

// 🚀 GENERATE INSIGHTS
exports.generateInsights = async (req, res) => {
  try {
    const { datasetId } = req.params;

    if (!datasetId) {
      return res.status(400).json({ message: "datasetId is required" });
    }

    console.log("📥 Generating insights for:", datasetId);

    // ============================
    // DATASET CHECK
    // ============================
    const dataset = await Dataset.findById(datasetId);
    if (!dataset) {
      return res.status(404).json({ message: "Dataset not found" });
    }

    // ============================
    // MODEL CHECK
    // ============================
    const model = await Model.findOne({ datasetId });
    if (!model) {
      return res.status(400).json({
        message: "Model not trained for this dataset",
      });
    }

    // ============================
    // FILE VALIDATION
    // ============================
    const fullPath = path.join(__dirname, "../uploads", dataset.filePath);

    if (!fs.existsSync(fullPath)) {
      return res.status(400).json({
        message: "Dataset file not found",
      });
    }

    const stats = fs.statSync(fullPath);
    if (stats.size === 0) {
      return res.status(400).json({
        message: "Dataset file is empty",
      });
    }

    // ============================
    // SEND TO ML SERVICE
    // ============================
    const formData = new FormData();
    formData.append("file", fs.createReadStream(fullPath));

    const ML_URL = `${process.env.ML_API_URL}/api/insights/${datasetId}`;

    const response = await axios.post(ML_URL, formData, {
      headers: formData.getHeaders(),
      timeout: 180000,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    const mlData = response.data;

    console.log("🤖 ML Insights Response:", mlData);

    // ============================
    // VALIDATE ML RESPONSE
    // ============================
    if (!mlData || mlData.error || !mlData.insights) {
      return res.status(400).json({
        message: "Invalid ML response",
        error: mlData,
      });
    }

    const insights = mlData.insights;

    // ============================
    // SAFE STRUCTURE
    // ============================
    const formattedInsights = {
      summary: insights.summary || {},
      trend: insights.trend || [],
      feature_importance: insights.feature_importance || {},
      correlation: insights.correlation || {},
      recommendations: insights.recommendations || [],
    };

    // ============================
    // UPSERT INTO DB
    // ============================
    const savedInsight = await Insight.findOneAndUpdate(
      { datasetId: dataset._id },
      {
        datasetId: dataset._id,
        ...formattedInsights,
        raw: mlData,
        updatedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    // ============================
    // RESPONSE
    // ============================
    return res.status(200).json({
      success: true,
      message: "Insights generated successfully",
      insight: savedInsight,
      mlResponse: mlData,
    });

  } catch (error) {
    console.error("❌ Insight Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    return res.status(500).json({
      success: false,
      message: "Failed to generate insights",
      error: error.response?.data || error.message,
    });
  }
};