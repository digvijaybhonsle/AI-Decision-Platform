const express = require("express");
const router = express.Router();

const {
  trainModel,
  getModelByDataset
} = require("../controllers/modelController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/train", authMiddleware, trainModel);
router.get("/:datasetId", authMiddleware, getModelByDataset);

module.exports = router;