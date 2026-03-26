const express = require("express");
const router = express.Router();

const { generateInsights } = require("../controllers/insightController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/:datasetId", authMiddleware, generateInsights);

module.exports = router;