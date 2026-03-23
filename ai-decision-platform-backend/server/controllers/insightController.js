const axios = require("axios");
const Insight = require("../models/Insights");
const Dataset = require("../models/Dataset");

exports.generateInsights = async (req, res) => {
  try {

    const { datasetId } = req.params;

    // ✅ Find dataset
    const dataset = await Dataset.findById(datasetId);

    if (!dataset) {
      return res.status(404).json({
        message: "Dataset not found"
      });
    }

    // ✅ Call ML API
    const response = await axios.post(
      `${process.env.ML_API_URL}/insights`,
      {
        filePath: dataset.filePath
      }
    );

    const mlData = response.data;

    // ✅ Save structured insights
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

    console.error(error.response?.data || error.message);

    res.status(500).json({
      message: "ML service error"
    });

  }
};