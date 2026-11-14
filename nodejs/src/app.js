const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/authRoute");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoute);

app.use((err, req, res, next) => {
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const status = err.status || 500;
  if (status === 500) console.error(err);

  res.status(status).json({
    message: status === 500 ? "Something went wrong" : err.message,
  });
});

module.exports = app;
