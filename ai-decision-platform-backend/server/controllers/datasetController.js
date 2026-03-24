const Dataset = require("../models/Dataset");
const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");

exports.uploadDataset = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const filePath = path.resolve(req.file.path);

    let columns = [];
    let rows = 0;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("headers", (headers) => {
        columns = headers;
      })
      .on("data", () => {
        rows++;
      })
      .on("end", async () => {
        const dataset = new Dataset({
          userId: req.user,
          datasetName: req.file.originalname,
          columns,
          rows,
          filePath: req.file.filename,
        });

        await dataset.save();
        console.log("File received:", req.file);
        console.log("File path:", req.file?.path);
        res.status(201).json({
          message: "Dataset uploaded successfully",
          datasetId: dataset._id,
          filename: dataset.datasetName,
          columns,
          rows,
        });
      })
      .on("error", (error) => {
        console.error(error);
        res.status(500).json({
          message: "Error processing CSV file",
        });
      });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

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

exports.deleteDatasetById = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.id);

    if (!dataset) {
      return res.status(404).json({ message: "Dataset not Found" });
    }
    if (fs.existsSync(dataset.filePath)) {
      fs.unlinkSync(dataset.filePath);
    }
    await dataset.deleteOne();
    res.status(200).json({
      message: "Dataset deleted succesfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.previewDataset = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.id);

    if (!dataset) {
      return res.status(404).json({ message: "Dataset not found" });
    }

    const filePath = dataset.filePath;

    if (!fs.existsSync(filePath)) {
      return res.status(400).json({
        message: "File not found on server",
      });
    }

    const results = [];
    let count = 0;

    fs.createReadStream(filePath)
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
