const Simulation = require("../models/Simulation");

exports.runSimulation = async (req, res) => {
  try {

    const { marketing_spend, users, price } = req.body;

    if (!marketing_spend || !users || !price) {
      return res.status(400).json({
        message: "All input fields required"
      });
    }

    const predictedRevenue = (users * price) + (marketing_spend * 0.5);

    const simulation = new Simulation({
      inputValues: {
        marketing_spend,
        users,
        price
      },
      predictedRevenue
    });

    await simulation.save();

    res.status(200).json({
      message: "Simulation completed",
      result: simulation
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }
};