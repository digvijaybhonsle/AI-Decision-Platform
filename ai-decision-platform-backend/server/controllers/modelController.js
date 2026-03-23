const axios = require("axios");
const Model = require("../models/Model");
const Dataset = require("../models/Dataset");

//  TRAIN MODEL API
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
        filePath: dataset.filePath,
        model_type,
        features,
        target
      }
    );

    // ✅ Extract accuracy
    const accuracy = response.data.accuracy || null;

    // ✅ Save model
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



// 🔥 GET MODEL BY DATASET API
exports.getModelByDataset = async (req, res) => {
  try {

    const { datasetId } = req.params;

    // ✅ Find model
    const model = await Model.findOne({ datasetId });

    if (!model) {
      return res.status(404).json({
        message: "Model not found"
      });
    }

    res.status(200).json({
      message: "Model fetched successfully",
      model
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }
};