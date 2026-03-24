const multer = require("multer");
const fs = require("fs");
const path = require("path");

// ✅ Define upload folder properly
const uploadPath = path.join(__dirname, "../uploads");

// ✅ Create folder if not exists (IMPORTANT for Render)
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ✅ Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

// ✅ File filter (optional but good)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "text/csv") {
    cb(null, true);
  } else {
    cb(new Error("Only CSV files allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter
});

module.exports = upload;