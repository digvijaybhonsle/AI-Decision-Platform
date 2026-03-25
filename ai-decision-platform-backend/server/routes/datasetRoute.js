const express = require("express");
const router = express.Router();

const { uploadDataset, getDataset, getDatasetById, deleteDatasetById, previewDataset } = require("../controllers/datasetController");

const authMiddleware = require("../middleware/authMiddleware");
const { uploadFile } = require("../middleware/uploadMiddleware");

router.post("/upload", authMiddleware, uploadFile.single("file"), uploadDataset);
router.get("/", authMiddleware, getDataset);
router.get("/:id/preview", authMiddleware, previewDataset);
router.get("/:id", authMiddleware, getDatasetById);
router.delete("/:id", authMiddleware, deleteDatasetById);

module.exports = router;