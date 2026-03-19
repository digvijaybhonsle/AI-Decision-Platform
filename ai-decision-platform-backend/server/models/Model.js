const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema({
  datasetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dataset",
    required: true
  },
  modelType: {
    type: String,
    default: "RandomForest"
  },
  accuracy: {
    type: Number
  },
  trainedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Model", modelSchema);