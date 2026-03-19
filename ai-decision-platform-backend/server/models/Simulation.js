const mongoose = require("mongoose");

const simulationSchema = new mongoose.Schema({
  inputValues: {
    type: Object,
    required: true
  },
  predictedRevenue: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Simulation", simulationSchema);