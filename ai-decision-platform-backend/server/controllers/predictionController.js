const axios = require("axios");
const Prediction = require("../models/Prediction");
const Dataset = require("../models/Dataset");

exports.runPrediction = async (req, res) => {
  try {

    const { datasetId, inputValues } = req.body;

    // ✅ Validate input
    if (!datasetId || !inputValues) {
      return res.status(400).json({
        message: "datasetId and inputValues are required"
      });
    }

    // ✅ Check dataset
    const dataset = await Dataset.findById(datasetId);

    if (!dataset) {
      return res.status(404).json({
        message: "Dataset not found"
      });
    }

    // ✅ Call ML API
    const response = await axios.post(
      `${process.env.ML_API_URL}/predict`,
      inputValues   // send directly
    );

    // ✅ Extract prediction from ML response
    const predictedValue =
      response.data.predicted_revenue ||
      response.data.prediction ||
      response.data.result;

    // ✅ Save prediction
    const prediction = new Prediction({
      datasetId,
      inputValues,
      predictedValue
    });

    await prediction.save();

    res.status(200).json({
      message: "Prediction generated",
      prediction,
      mlResponse: response.data
    });

  } catch (error) {

    console.error(error.response?.data || error.message);

    res.status(500).json({
      message: "ML service error"
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
