const Dataset = require("../models/Dataset");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");

// 📁 Upload folder (same as multer)
const UPLOAD_DIR = path.join(__dirname, "../uploads");

// ==============================
// 🚀 UPLOAD DATASET
// ==============================
exports.uploadDataset = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const absolutePath = req.file.path; // full server path
    const filename = req.file.filename;

    let columns = [];
    let rows = 0;

    fs.createReadStream(absolutePath)
      .pipe(csv())
      .on("headers", (headers) => {
        columns = headers;
      })
      .on("data", () => {
        rows++;
      })
      .on("end", async () => {
        try {
          const dataset = new Dataset({
            userId: req.user?._id || req.user,
            datasetName: req.file.originalname,
            columns,
            rows,

            // ✅ STORE ONLY FILENAME (NOT FULL PATH)
            filePath: filename,
          });

          await dataset.save();

          console.log("✅ File uploaded:", absolutePath);
          console.log("✅ Stored filename:", filename);

          res.status(201).json({
            message: "Dataset uploaded successfully",
            datasetId: dataset._id,
            filename: dataset.datasetName,
            columns,
            rows,
          });

        } catch (err) {
          console.error("❌ SAVE ERROR:", err);
          res.status(500).json({
            message: "Error saving dataset",
            error: err.message
          });
        }
      })
      .on("error", (error) => {
        console.error("❌ CSV ERROR:", error);
        res.status(500).json({
          message: "Error processing CSV file",
          error: error.message
        });
      });

  } catch (error) {
    console.error("❌ UPLOAD ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};


// ==============================
// 📦 GET ALL DATASETS
// ==============================
exports.getDataset = async (req, res) => {
  try {
    const datasets = await Dataset.find({ userId: req.user });

    res.status(200).json({
      success: true,
      count: datasets.length,
      data: datasets,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ==============================
// 🔍 GET DATASET BY ID
// ==============================
exports.getDatasetById = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.id);

    if (!dataset) {
      return res.status(404).json({ message: "Dataset not Found" });
    }

    res.status(200).json(dataset);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ==============================
// ❌ DELETE DATASET
// ==============================
exports.deleteDatasetById = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.id);

    if (!dataset) {
      return res.status(404).json({ message: "Dataset not Found" });
    }

    // 🔥 Construct FULL PATH
    const fullPath = path.join(UPLOAD_DIR, dataset.filePath);

    console.log("🗑 Deleting file:", fullPath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    await dataset.deleteOne();

    res.status(200).json({
      message: "Dataset deleted successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ==============================
// 👀 PREVIEW DATASET
// ==============================
exports.previewDataset = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.id);

    if (!dataset) {
      return res.status(404).json({ message: "Dataset not found" });
    }

    // 🔥 IMPORTANT FIX
    const fullPath = path.join(UPLOAD_DIR, dataset.filePath);

    console.log("📁 Preview path:", fullPath);
    console.log("📁 Exists:", fs.existsSync(fullPath));

    if (!fs.existsSync(fullPath)) {
      return res.status(400).json({
        message: "File not found on server",
      });
    }

    const results = [];
    let count = 0;

    fs.createReadStream(fullPath)
      .pipe(csv())
      .on("data", (data) => {
        if (count < 10) {
          results.push(data);
          count++;
        }
      })
      .on("end", () => {
        res.status(200).json({
          datasetName: dataset.datasetName,
          columns: dataset.columns,
          previewRows: results,
        });
      });

  } catch (error) {
    console.error(error);

    res.status(500).json({ message: "Server error" });
  }
};