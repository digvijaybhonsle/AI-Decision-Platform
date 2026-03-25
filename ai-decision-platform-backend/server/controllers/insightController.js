const axios = require("axios");
const Insight = require("../models/Insights");
const Dataset = require("../models/Dataset");
const Model = require("../models/Model");
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");

// 📁 Upload folder
const UPLOAD_DIR = path.join(__dirname, "../uploads");

// 🚀 GENERATE INSIGHTS
exports.generateInsights = async (req, res) => {
  try {
    const { datasetId } = req.params;

    console.log("📥 Insights Request for dataset:", datasetId);

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
    // ✅ CHECK MODEL (IMPORTANT)
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
    const fullPath = path.join(UPLOAD_DIR, dataset.filePath);

    console.log("📁 FILE PATH:", fullPath);
    console.log("📁 EXISTS:", fs.existsSync(fullPath));

    if (!fs.existsSync(fullPath)) {
      return res.status(400).json({
        message: "Dataset file not found on server",
      });
    }

    // ============================
    // 🔥 SEND FILE TO ML SERVICE
    // ============================
    const formData = new FormData();

    formData.append("file", fs.createReadStream(fullPath), {
      filename: path.basename(fullPath),
      contentType: "text/csv",
    });

    const ML_URL = `${process.env.ML_API_URL}/insights`;

    console.log("🚀 Sending to ML:", ML_URL);

    const response = await axios.post(ML_URL, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 180000,
    });

    const mlData = response.data;

    console.log("✅ ML RESPONSE:", mlData);

    // ============================
    // ❌ HANDLE ML ERROR
    // ============================
    if (!mlData || mlData.error) {
      return res.status(400).json({
        message: "ML error",
        error: mlData,
      });
    }

    // ============================
    // 💾 SAVE INSIGHTS
    // ============================
    const insight = new Insight({
      datasetId: dataset._id,
      summary: mlData.summary || {},
      trend: mlData.trend || [],
      distribution: mlData.distribution || {},
      recommendations: mlData.recommendations || [],
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
      message: "ML service error",
      error: error.response?.data || error.message,
    });
  }
};
