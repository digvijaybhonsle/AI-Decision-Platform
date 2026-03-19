const Prediction = require("../models/Prediction");
const Dataset = require("../models/Dataset");

exports.runPrediction = async (req, res) => {
  try {
    const { datasetId, inputValues } = req.body;

    const dataset = await Dataset.findById(datasetId);

    if (!dataset) {
      return res.status(404).json({
        message: "Dataset not found",
      });
    }

    const predictionValue = Math.random() > 0.5 ? "Yes" : "No";

    const prediction = new Prediction({
      datasetId,
      inputValues,
      predictionValue,
    });

    await prediction.save();

    res.status(200).json({
      message: "Prediction generated",
      prediction,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "server error",
    });
  }
};

exports.getPredictionHistory = async (req, res) => {
  try {
    const predictions = await Prediction.find()
      .populate("datasetId", "datasetName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: predictions.length,
      predictions,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
