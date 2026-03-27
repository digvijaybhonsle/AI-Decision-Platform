const express = require("express");
const router = express.Router();

const {
  runPrediction,
  getPredictionHistory,
  getPredictionFeatures
} = require("../controllers/predictionController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/run", authMiddleware, runPrediction);
router.get("/history", authMiddleware, getPredictionHistory);
router.get("/features/:datasetId", authMiddleware, getPredictionFeatures);

module.exports = router;