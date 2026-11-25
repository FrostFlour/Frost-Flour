require("dotenv").config();

const http = require('node:http');
const { connectDatabase, disconnectDatabase } = require('./src/config/db');
// The app (middlewares + routes) is built in src/app.js
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

async function start() {
  await connectDatabase();

  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`Frost & Flour API listening on port ${PORT}`);
    console.log(`CORS allowed origins: ${app.allowedOrigins.join(', ')}`);
  });

  // Ctrl+C locally (SIGINT) or stop from the hosting service (SIGTERM)
  const shutdown = () => {
    console.log('\nShutting down...');
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((err) => {
  console.error("Failed to start the server:", err.message);
  process.exit(1);
});
