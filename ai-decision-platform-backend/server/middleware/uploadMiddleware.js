const multer = require("multer");
const fs = require("fs");
const path = require("path");

// 📁 Upload folder
const uploadPath = path.join(__dirname, "../uploads");

// ✅ Ensure folder exists (important for deployment)
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ==============================
// 🧠 STORAGE CONFIG (for file upload routes)
// ==============================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

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
// 🚀 MULTER INSTANCES
// ==============================

// ✅ For routes WITH file upload
const uploadFile = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// ✅ For routes WITHOUT file (ONLY form-data fields)
const uploadNone = multer().none();

// ==============================
// ❌ ERROR HANDLER (VERY IMPORTANT)
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
  uploadFile,
  uploadNone,
  handleMulterError
};