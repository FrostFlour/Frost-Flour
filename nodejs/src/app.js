const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/authRoute");
const userRoutes = require("./routes/user.routes");
const categoryRoutes = require("./routes/category.routes"); // US-11 / US-14
const productRoutes = require("./routes/product.routes"); // US-14
const errorHandler = require("./middlewares/errorHandler");
const path = require("node:path");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoutes);

app.use("/api/categories", categoryRoutes); // US-11 / US-14
app.use("/api/products", productRoutes); // US-14

// US-14: serve the uploaded product images
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// The error handler moved to middlewares/errorHandler.js (shared with server.js)
app.use(errorHandler);

module.exports = app;
