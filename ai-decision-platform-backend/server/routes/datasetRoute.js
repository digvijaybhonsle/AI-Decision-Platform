const express = require("express");
const router = express.Router();

const { uploadDataset, getDataset, getDatasetById, deleteDatasetById, previewDataset } = require("../controllers/datasetController");

const authMiddleware = require("../middleware/authMiddleware");
const { uploadDisk } = require("../middleware/uploadMiddleware");

router.post("/upload", authMiddleware, uploadDisk.single("file"), uploadDataset);
router.get("/", authMiddleware, getDataset);
router.get("/:id/preview", authMiddleware, previewDataset);
router.get("/:id", authMiddleware, getDatasetById);
router.delete("/:id", authMiddleware, deleteDatasetById);

module.exports = router;