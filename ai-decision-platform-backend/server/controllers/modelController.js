const Model = require("../models/Model");
const Dataset = require("../models/Dataset");

exports.trainModel = async (req, res) => {
  try {

    const { datasetId, modelType } = req.body;

    const dataset = await Dataset.findById(datasetId);

    if (!dataset) {
      return res.status(404).json({ message: "Dataset not found" });
    }

    // For now we simulate ML training
    const accuracy = (Math.random() * (0.95 - 0.80) + 0.80).toFixed(2);

    const model = new Model({
      datasetId,
      modelType,
      accuracy
    });

    await model.save();

    res.status(201).json({
      message: "Model trained successfully",
      model
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }
};

exports.getModelByDataset = async (req, res) => {
  try {

    const model = await Model.findOne({
      datasetId: req.params.datasetId
    });

    if (!model) {
      return res.status(404).json({
        message: "Model not found"
      });
    }

    res.status(200).json(model);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }
};