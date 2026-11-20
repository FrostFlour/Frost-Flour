// The Express app: middlewares + routes. This is the ONLY place where routes
// are added. server.js imports this app and just starts it (and the tests
// import it too), so a new route only has to be added here.
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("node:path");
const { isDatabaseConnected } = require("./config/db");
const authRoute = require("./routes/authRoute");
const userRoutes = require("./routes/user.routes");
const categoryRoutes = require("./routes/category.routes"); // US-11 / US-14
const productRoutes = require("./routes/product.routes"); // US-14
const cartRoutes = require("./routes/cart.routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Browser origins allowed to call the API (comma-separated list in .env).
// A GitHub Pages origin is only the domain: https://frostflour.github.io (no repo path).
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173,https://frostflour.github.io")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
// The secret is needed for signed cookies (login token and cart)
app.use(cookieParser(process.env.COOKIE_SECRET || "development-cookie-secret"));

app.get("/health", (req, res) => {
  res.json({ status: "ok", database: isDatabaseConnected() ? "connected" : "disconnected" });
});

app.use("/api/auth", authRoute);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes); // US-11 / US-14
app.use("/api/products", productRoutes); // US-14
app.use("/api/cart", cartRoutes);

// US-14: product images saved by multer are served as static files,
// e.g. http://localhost:3000/uploads/products/<random-name>.png
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Must stay AFTER the routes: every next(err) ends up here (JSON error message)
app.use(errorHandler);

module.exports = app;
module.exports.allowedOrigins = allowedOrigins;
