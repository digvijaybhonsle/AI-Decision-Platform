const Insight = require("../models/Insights");
const Dataset = require("../models/Dataset");

exports.generateInsights = async (req, res) => {
  try {

    const dataset = await Dataset.findById(req.params.datasetId);

    if (!dataset) {
      return res.status(404).json({
        message: "Dataset not found"
      });
    }

    // Example insight logic
    const insightText = "Dataset contains " + dataset.rows + " rows";
    const recommendation = "Consider training ML model for predictions";

    const insight = new Insight({
      datasetId: dataset._id,
      insightText,
      recommendation
    });

    await insight.save();

    res.status(200).json({
      message: "Insights generated",
      insight
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }
};