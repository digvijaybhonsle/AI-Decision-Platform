const axios = require("axios");
const Simulation = require("../models/Simulation");

exports.runSimulation = async (req, res) => {
  try {

    const inputArray = req.body;

    // ✅ Validate input (must be array)
    if (!Array.isArray(inputArray) || inputArray.length === 0) {
      return res.status(400).json({
        message: "Input must be a non-empty array"
      });
    }

    // ✅ Call ML API (batch input)
    const response = await axios.post(
      `${process.env.ML_API_URL}/simulate`,
      inputArray
    );

    const results = response.data;

    // ✅ Save each simulation in DB
    const savedSimulations = [];

    for (let item of results) {

      const simulation = new Simulation({
        inputValues: item.input,
        predictedRevenue: item.prediction
      });

      await simulation.save();
      savedSimulations.push(simulation);
    }

    res.status(200).json({
      message: "Simulation completed",
      count: savedSimulations.length,
      results: savedSimulations
    });

  } catch (error) {

    console.error(error.response?.data || error.message);

    res.status(500).json({
      message: "ML service error"
    });

  }
};