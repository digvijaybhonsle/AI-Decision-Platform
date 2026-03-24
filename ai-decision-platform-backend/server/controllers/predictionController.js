const axios = require("axios");
const Prediction = require("../models/Prediction");
const Dataset = require("../models/Dataset");

exports.runPrediction = async (req, res) => {
  try {

    const { datasetId, inputValues } = req.body;

    // ✅ Validate input
    if (!datasetId || !inputValues || typeof inputValues !== "object") {
      return res.status(400).json({
        message: "datasetId and valid inputValues are required"
      });
    }

    // ✅ Check dataset
    const dataset = await Dataset.findById(datasetId);

    if (!dataset) {
      return res.status(404).json({
        message: "Dataset not found"
      });
    }

    // ✅ Call ML API (IMPORTANT FIX)
    const response = await axios.post(
      `${process.env.ML_API_URL}/predict`,
      {
        ...inputValues   // ensure correct format
      },
      {
        timeout: 10000 // prevent hanging
      }
    );

    // ✅ Validate ML response
    if (!response.data) {
      return res.status(500).json({
        message: "Invalid response from ML service"
      });
    }

    // ✅ Extract prediction safely
    const predictedValue =
      response.data.predicted_revenue ??
      response.data.prediction ??
      response.data.result ??
      null;

    if (predictedValue === null) {
      return res.status(500).json({
        message: "Prediction not returned from ML service"
      });
    }

    // ✅ Save prediction
    const prediction = new Prediction({
      datasetId,
      inputValues,
      predictedValue
    });

    await prediction.save();

    res.status(200).json({
      message: "Prediction generated successfully",
      prediction,
      mlResponse: response.data
    });

  } catch (error) {

    console.error("Prediction Error:", error.response?.data || error.message);

    res.status(500).json({
      message: "ML service error",
      error: error.response?.data || error.message
    });

  }
};


// 🔥 GET HISTORY (minor improvement)
exports.getPredictionHistory = async (req, res) => {
  try {

    const predictions = await Prediction.find()
      .populate("datasetId", "datasetName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: predictions.length,
      predictions
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }
};