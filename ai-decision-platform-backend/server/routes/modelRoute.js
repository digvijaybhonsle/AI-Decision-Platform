const express = require("express");
const router = express.Router();

const {
  trainModel,
  getModelByDataset
} = require("../controllers/modelController");

const authMiddleware = require("../middleware/authMiddleware");
const { uploadMemory } = require("../middleware/uploadMiddleware");

router.post("/train", authMiddleware, uploadMemory.single("file"), trainModel);
router.get("/:datasetId", authMiddleware, getModelByDataset);

module.exports = router;