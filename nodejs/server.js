require("dotenv").config();

const http = require('node:http');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectDatabase, disconnectDatabase, isDatabaseConnected } = require('./src/config/db');
const authRoute = require('./src/routes/authRoute');

const app = express();
const PORT = process.env.PORT || 3000;

// Browser origins allowed to call the API (comma-separated list in .env).
// A GitHub Pages origin is only the domain: https://frostflour.github.io (no repo path).
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,https://frostflour.github.io')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', database: isDatabaseConnected() ? 'connected' : 'disconnected' });
});

app.use('/api/auth', authRoute);

async function start() {
  await connectDatabase();

  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`Frost & Flour API listening on port ${PORT}`);
    console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
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
