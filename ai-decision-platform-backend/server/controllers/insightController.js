const axios = require("axios");
const Insight = require("../models/Insights");
const Dataset = require("../models/Dataset");
const fs = require("fs");
const FormData = require("form-data");
const path = require("path");

exports.generateInsights = async (req, res) => {
  try {
    const { datasetId } = req.params;

    const dataset = await Dataset.findById(datasetId);

    if (!dataset) {
      return res.status(404).json({
        message: "Dataset not found"
      });
    }

    // ============================
    // 📁 GET FILE PATH
    // ============================
    const filePath = path.join(__dirname, "../uploads", dataset.filePath);

    console.log("📁 FILE PATH:", filePath);
    console.log("EXISTS:", fs.existsSync(filePath));

    if (!fs.existsSync(filePath)) {
      return res.status(400).json({
        message: "Dataset file not found on server"
      });
    }

    // ============================
    // 🔥 SEND FILE TO ML SERVICE
    // ============================
    const formData = new FormData();

    formData.append("file", fs.createReadStream(filePath));

    const response = await axios.post(
      `${process.env.ML_API_URL}/insights`,
      formData,
      {
        headers: {
          ...formData.getHeaders()
        },
        timeout: 180000
      }
    );

    const mlData = response.data;

    // ============================
    // 💾 SAVE INSIGHTS
    // ============================
    const insight = new Insight({
      datasetId: dataset._id,
      summary: mlData.summary,
      trend: mlData.trend,
      distribution: mlData.distribution,
      recommendations: mlData.recommendations
    });

    await insight.save();

    return res.status(200).json({
      message: "Insights generated successfully",
      insight
    });

  } catch (error) {
    console.error("❌ Insight Error:", error.response?.data || error.message);

    return res.status(500).json({
      message: "ML service error",
      error: error.response?.data || error.message
    });
  }
};