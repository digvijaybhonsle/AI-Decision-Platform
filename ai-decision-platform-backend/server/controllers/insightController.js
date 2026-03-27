const axios = require("axios");
const Insight = require("../models/Insights");
const Dataset = require("../models/Dataset");
const Model = require("../models/Model");
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");

// 🚀 GENERATE INSIGHTS - FINAL UPDATED VERSION
exports.generateInsights = async (req, res) => {
  try {
    const { datasetId } = req.params;

    console.log("📥 Insights Request for dataset:", datasetId);

    if (!datasetId) {
      return res.status(400).json({ message: "datasetId is required" });
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
    // ✅ CHECK MODEL
    // ============================
    const model = await Model.findOne({ datasetId });
    if (!model) {
      return res.status(400).json({
        message: "Model not trained for this dataset",
      });
    }

    // ============================
    // 📁 BUILD FILE PATH
    // ============================
    const fullPath = path.join(
      __dirname,
      "../uploads",
      dataset.filePath
    );

    console.log("📁 FILE PATH:", fullPath);

    if (!fs.existsSync(fullPath)) {
      return res.status(400).json({
        message: "Dataset file not found on server",
        path: fullPath
      });
    }

    const stats = fs.statSync(fullPath);
    if (stats.size === 0) {
      return res.status(400).json({ message: "Dataset file is empty" });
    }

    console.log("📦 FILE SIZE:", stats.size);

    // ============================
    // 🔥 SEND FILE TO ML SERVICE
    // ============================
    const formData = new FormData();

    formData.append(
      "file",
      fs.createReadStream(fullPath),
      path.basename(fullPath)
    );

    // 🔥 UPDATED URL - Now correctly matches FastAPI route
    const ML_URL = `${process.env.ML_API_URL}/api/insights/${datasetId}`;
    console.log("🚀 Sending to ML:", ML_URL);

    // Remove manual content-length (axios handles it better with FormData)
    const response = await axios.post(ML_URL, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 180000,
    });

    const mlData = response.data;

    console.log("✅ ML RESPONSE STATUS:", response.status);
    console.log("✅ ML RESPONSE:", mlData);

    // ============================
    // ❌ HANDLE ML ERROR
    // ============================
    if (!mlData || mlData.error) {
      return res.status(400).json({
        message: "ML service returned an error",
        error: mlData,
      });
    }

    // ============================
    // 💾 SAVE INSIGHTS
    // ============================
    const insight = new Insight({
      datasetId: dataset._id,
      summary: mlData.summary || mlData.insights || {},
      trend: mlData.trend || [],
      distribution: mlData.distribution || {},
      recommendations: mlData.recommendations || [],
      raw: mlData
    });

    await insight.save();

    return res.status(200).json({
      message: "Insights generated successfully",
      insight,
      mlResponse: mlData,
    });

  } catch (error) {
    console.error("❌ Insight Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    return res.status(500).json({
      message: "Failed to generate insights",
      error: error.response?.data || error.message,
    });
  }
};