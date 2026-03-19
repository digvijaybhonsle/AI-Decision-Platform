const express = require("express");
const router = express.Router();

const {
  runPrediction,
  getPredictionHistory
} = require("../controllers/predictionController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/run", authMiddleware, runPrediction);
router.get("/history", authMiddleware, getPredictionHistory);

module.exports = router;