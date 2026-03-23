const mongoose = require("mongoose");

const insightSchema = new mongoose.Schema({
  datasetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dataset",
    required: true
  },

  summary: {
    type: Object
  },

  trend: [
    {
      Income: Number,
      Total_Spending: Number
    }
  ],

  distribution: {
    type: Object
  },

  recommendations: [
    String
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Insight", insightSchema);