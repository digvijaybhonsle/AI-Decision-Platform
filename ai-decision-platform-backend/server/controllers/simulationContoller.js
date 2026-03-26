const axios = require("axios");
const Simulation = require("../models/Simulation");
const Dataset = require("../models/Dataset");
const Model = require("../models/Model");

// 🚀 RUN SIMULATION
exports.runSimulation = async (req, res) => {
  try {
    const { datasetId, inputs } = req.body;

    console.log("📥 Simulation Input:", req.body);

    // ============================
    // ✅ VALIDATION
    // ============================
    if (!datasetId) {
      return res.status(400).json({
        message: "datasetId is required",
      });
    }

    if (!Array.isArray(inputs) || inputs.length === 0) {
      return res.status(400).json({
        message: "inputs must be a non-empty array",
      });
    }

    // ============================
    // ✅ CHECK DATASET
    // ============================
    const dataset = await Dataset.findById(datasetId);

    if (!dataset) {
      return res.status(404).json({
        message: "Dataset not found",
      });
    }

    // ============================
    // ✅ CHECK MODEL
    // ============================
    const model = await Model.findOne({ datasetId });

    if (!model) {
      return res.status(400).json({
        message: "Model not trained for this dataset",
      });
    }

    // ============================
    // 🔥 CALL ML SERVICE (FIXED)
    // ============================
    const ML_URL = `${process.env.ML_API_URL}/simulate`;

    console.log("🚀 Sending to ML:", inputs);

    const response = await axios.post(
      ML_URL,
      inputs, // ✅ FIXED: send array directly
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 180000,
      },
    );

    const mlData = response.data;

    console.log("✅ ML RESPONSE:", mlData);

    // ============================
    // ❌ HANDLE ML ERROR
    // ============================
    if (!mlData || mlData.error) {
      return res.status(400).json({
        message: "ML error",
        error: mlData,
      });
    }

    // ============================
    // ✅ EXTRACT RESULTS (FIXED)
    // ============================
    const results = mlData.results;

    if (!Array.isArray(results)) {
      return res.status(500).json({
        message: "Invalid response from ML service",
        data: mlData,
      });
    }

    // ============================
    // 💾 SAVE SIMULATIONS
    // ============================
    const simulationsToSave = results.map((item) => ({
      datasetId,
      inputValues: item.input,
      predictedRevenue: item.prediction,
    }));

    const savedSimulations = await Simulation.insertMany(simulationsToSave);

    return res.status(200).json({
      message: "Simulation completed successfully",
      count: savedSimulations.length,
      results: savedSimulations,
      mlResponse: mlData,
    });
  } catch (error) {
    console.error("❌ Simulation Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    return res.status(500).json({
      message: "ML service error",
      error: error.response?.data || error.message,
    });
  }
};
