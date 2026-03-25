const express = require("express");
const router = express.Router();

const {
  trainModel,
  getModelByDataset
} = require("../controllers/modelController");

const authMiddleware = require("../middleware/authMiddleware");
const { uploadNone } = require("../middleware/uploadMiddleware");

router.post("/train", authMiddleware, uploadNone, trainModel);
router.get("/:datasetId", authMiddleware, getModelByDataset);

module.exports = router;