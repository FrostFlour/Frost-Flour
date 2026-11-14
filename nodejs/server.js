require("dotenv").config();

const http = require("node:http");
const mongoose = require("mongoose");
const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`Frost & Flour API running on http://localhost:${PORT}`);
  });

  process.on("SIGINT", () => {
    console.log("\nShutting down...");
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  });
}

start().catch((err) => {
  console.error("Failed to start the server:", err.message);
  process.exit(1);
});
