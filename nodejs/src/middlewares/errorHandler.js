const multer = require("multer");

// Error-handling middleware. Express knows it is an error handler because it
// has 4 parameters (err, req, res, next). Every controller does next(err),
// and the error lands here. We turn it into a clean JSON answer.
module.exports = (err, req, res, next) => {
  // 1. Mongoose validation failed (for example: price is not > 0)
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  // 2. Duplicate value on a "unique" field (MongoDB error code 11000)
  //    err.keyValue tells which field: { email: ... } or { name: ... }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    const message =
      field === "email" ? "Email already registered" : `This ${field || "value"} is already used`;
    return res.status(409).json({ message });
  }

  // 3. Upload errors from multer (US-14), for example a file bigger than 2 MB
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "The image must be 2 MB or less" : err.message;
    return res.status(400).json({ message });
  }

  // 4. Our own errors (AppError has a status) or an unexpected bug (500)
  const status = err.status || 500;
  if (status === 500) console.error(err);

  res.status(status).json({
    message: status === 500 ? "Something went wrong" : err.message,
  });
};
