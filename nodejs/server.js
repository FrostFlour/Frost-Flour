require('dotenv').config();

const http = require('node:http');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

async function start() {
  if (process.env.MONGO_URI) {
    await mongoose.connect(process.env.MONGO_URI);
  }

  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`Frost & Flour API running on http://localhost:${PORT}`);
  });

  process.on('SIGINT', () => {
    console.log('\nShutting down...');
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  });
}

start().catch((err) => {
  console.error('Failed to start the server:', err.message);
  process.exit(1);
});
