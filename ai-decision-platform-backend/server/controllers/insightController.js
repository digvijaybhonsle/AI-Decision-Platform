const axios = require("axios");
const Insight = require("../models/Insights");
const Dataset = require("../models/Dataset");

exports.generateInsights = async (req, res) => {
  try {

    const { datasetId } = req.params;

    const dataset = await Dataset.findById(datasetId);

    if (!dataset) {
      return res.status(404).json({
        message: "Dataset not found"
      });
    }

    // 🚨 FIX: Do NOT send filePath
    const response = await axios.post(
      `${process.env.ML_API_URL}/insights`,
      {
        datasetName: dataset.datasetName,
        columns: dataset.columns,
        rows: dataset.rows
      },
      {
        timeout: 15000
      }
    );

    const mlData = response.data;

    const insight = new Insight({
      datasetId: dataset._id,
      summary: mlData.summary,
      trend: mlData.trend,
      distribution: mlData.distribution,
      recommendations: mlData.recommendations
    });

    await insight.save();

    res.status(200).json({
      message: "Insights generated successfully",
      insight
    });

  } catch (error) {

    console.error("Insight Error:", error.response?.data || error.message);

    res.status(500).json({
      message: "ML service error",
      error: error.response?.data || error.message
    });

  }
};