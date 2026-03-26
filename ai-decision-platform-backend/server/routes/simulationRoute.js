const express = require("express");
const router = express.Router();

const { runSimulation } = require("../controllers/simulationController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/run", authMiddleware, runSimulation);

module.exports = router;