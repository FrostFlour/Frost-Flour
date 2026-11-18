// US-14: receives the product image with "multer".
// A form that sends a file uses the "multipart/form-data" format, which
// express.json() cannot read. multer reads it, saves the file on disk,
// puts the file info in req.file and the text fields in req.body.
const path = require("node:path");
const crypto = require("node:crypto");
const multer = require("multer");
const AppError = require("../utils/AppError");

// Allowed image types -> file extension to use
const ALLOWED_TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

// 1. WHERE and UNDER WHICH NAME the file is saved: nodejs/uploads/products/
const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "..", "uploads", "products"),
  filename: (req, file, cb) => {
    // Unique name (date + random part) so two images never overwrite each other
    const name = `${Date.now()}-${crypto.randomInt(1e9)}${ALLOWED_TYPES[file.mimetype]}`;
    cb(null, name);
  },
});

// 2. Only JPG, PNG or WebP are accepted
function fileFilter(req, file, cb) {
  if (ALLOWED_TYPES[file.mimetype]) {
    cb(null, true); // accept the file
  } else {
    cb(new AppError("The image must be a JPG, PNG or WebP file", 400));
  }
}

// 3. 2 MB maximum (too big -> MulterError "LIMIT_FILE_SIZE", see errorHandler.js)
module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});
