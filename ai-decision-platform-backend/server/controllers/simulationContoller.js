const axios = require("axios");
const Simulation = require("../models/Simulation");

exports.runSimulation = async (req, res) => {
  try {

    const inputArray = req.body;

    if (!Array.isArray(inputArray) || inputArray.length === 0) {
      return res.status(400).json({
        message: "Input must be a non-empty array"
      });
    }

    const response = await axios.post(
      `${process.env.ML_API_URL}/simulate`,
      inputArray,
      { timeout: 15000 }
    );

    const results = response.data;

    // ✅ Validate ML response
    if (!Array.isArray(results)) {
      return res.status(500).json({
        message: "Invalid response from ML service"
      });
    }

    // ✅ Bulk insert (FASTER)
    const simulationsToSave = results.map(item => ({
      inputValues: item.input,
      predictedRevenue: item.prediction
    }));

    const savedSimulations = await Simulation.insertMany(simulationsToSave);

    res.status(200).json({
      message: "Simulation completed",
      count: savedSimulations.length,
      results: savedSimulations
    });

  } catch (error) {

    console.error("Simulation Error:", error.response?.data || error.message);

    res.status(500).json({
      message: "ML service error",
      error: error.response?.data || error.message
    });

  }
};