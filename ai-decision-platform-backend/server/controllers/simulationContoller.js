const axios = require("axios");
const Simulation = require("../models/Simulation");

exports.runSimulation = async (req, res) => {
  try {
    const inputArray = req.body;

    console.log("📥 Simulation Input:", inputArray);

    // ============================
    // ✅ VALIDATION
    // ============================
    if (!Array.isArray(inputArray) || inputArray.length === 0) {
      return res.status(400).json({
        message: "Input must be a non-empty array"
      });
    }

    // ============================
    // 🔥 CALL ML SERVICE
    // ============================
    const ML_URL = `${process.env.ML_API_URL}/simulate`;

    const response = await axios.post(ML_URL, inputArray, {
      headers: {
        "Content-Type": "application/json"
      },
      timeout: 180000 // 🔥 increased for Render
    });

    console.log("✅ ML RESPONSE:", response.data);

    const results = response.data;

    // ============================
    // ❌ HANDLE ML ERROR
    // ============================
    if (!results || results.error) {
      return res.status(400).json({
        message: "ML error",
        error: results
      });
    }

    if (!Array.isArray(results)) {
      return res.status(500).json({
        message: "Invalid response from ML service",
        data: results
      });
    }

    // ============================
    // 💾 SAVE SIMULATIONS
    // ============================
    const simulationsToSave = results.map(item => ({
      inputValues: item.input,
      predictedRevenue: item.prediction
    }));

    const savedSimulations = await Simulation.insertMany(simulationsToSave);

    return res.status(200).json({
      message: "Simulation completed successfully",
      count: savedSimulations.length,
      results: savedSimulations
    });

  } catch (error) {
    console.error("❌ Simulation Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });

    return res.status(500).json({
      message: "ML service error",
      error: error.response?.data || error.message
    });
  }
};