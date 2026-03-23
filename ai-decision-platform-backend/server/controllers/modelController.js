const axios = require("axios");
const Model = require("../models/Model");
const Dataset = require("../models/Dataset");

exports.trainModel = async (req, res) => {
  try {

    const { datasetId, model_type, features, target } = req.body;

    // ✅ Validate input
    if (!datasetId || !model_type || !features || !target) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // ✅ Find dataset
    const dataset = await Dataset.findById(datasetId);

    if (!dataset) {
      return res.status(404).json({
        message: "Dataset not found"
      });
    }

    // ✅ Call ML Service
    const response = await axios.post(
      `${process.env.ML_API_URL}/train`,
      {
        filePath: dataset.filePath,   // IMPORTANT
        model_type,
        features,
        target
      }
    );

    // ✅ Extract accuracy (if ML returns it)
    const accuracy = response.data.accuracy || null;

    // ✅ Save model in DB
    const model = new Model({
      datasetId,
      modelType: model_type,
      accuracy
    });

    await model.save();

    res.status(201).json({
      message: "Model trained successfully",
      model,
      mlResponse: response.data
    });

  } catch (error) {

    console.error(error.response?.data || error.message);

    res.status(500).json({
      message: "ML service error"
    });

  }
};