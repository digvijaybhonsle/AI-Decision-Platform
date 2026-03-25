const multer = require("multer");
const fs = require("fs");
const path = require("path");

// 📁 Upload folder (ONLY if disk storage is used)
const uploadPath = path.join(__dirname, "../uploads");

// Ensure folder exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ==============================
// 📄 FILE FILTER (CSV only)
// ==============================
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "text/csv" ||
    file.originalname.endsWith(".csv")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only CSV files are allowed"), false);
  }
};

// ==============================
// 🧠 STORAGE OPTIONS
// ==============================

// 🔥 1. MEMORY STORAGE (BEST for ML streaming)
const memoryStorage = multer.memoryStorage();

// 🧠 2. DISK STORAGE (OPTIONAL - if you still need uploads)
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

// ==============================
// 🚀 MULTER INSTANCES
// ==============================

// ✅ For ML TRAIN (STREAM FILE → NO DISK)
const uploadMemory = multer({
  storage: memoryStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

// ✅ Optional: For dataset upload (if you still use DB + uploads)
const uploadDisk = multer({
  storage: diskStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

// ✅ For form-data without file
const uploadNone = multer().none();

// ==============================
// ❌ ERROR HANDLER
// ==============================
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message: "Multer error",
      error: err.message
    });
  } else if (err) {
    return res.status(400).json({
      message: "Upload error",
      error: err.message
    });
  }
  next();
};

// ==============================
// 📦 EXPORTS
// ==============================
module.exports = {
  uploadMemory,  // 🔥 USE THIS for /train
  uploadDisk,    // optional (upload dataset)
  uploadNone,
  handleMulterError
};