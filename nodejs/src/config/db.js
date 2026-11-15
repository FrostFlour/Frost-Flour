const mongoose = require('mongoose');

let wasConnected = false;

// Extra logs if the connection drops after start-up
mongoose.connection.on('disconnected', () => {
  if (wasConnected) console.warn('[MongoDB] Disconnected from Atlas');
});

mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB] Reconnected to Atlas');
});

// Removes any connection string (which contains the password) from a message
function hideUri(text) {
  return String(text).replace(/mongodb(\+srv)?:\/\/\S+/g, '<hidden-uri>');
}

// Connects to MongoDB Atlas using MONGODB_URI from .env (the URI itself is never logged)
async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<')) {
    throw new Error('MONGODB_URI is missing in nodejs/.env (paste your Atlas connection string)');
  }

  try {
    await mongoose.connect(uri);
    wasConnected = true;
    console.log(`[MongoDB] Connected to Atlas (database: "${mongoose.connection.name}")`);
  } catch (err) {
    const safeMessage = hideUri(err.message);
    console.error('[MongoDB] Connection failed:', safeMessage);
    console.error('[MongoDB] Check the user/password in MONGODB_URI and the Atlas Network Access list.');
    throw new Error(`Could not connect to MongoDB (${safeMessage})`);
  }
}

async function disconnectDatabase() {
  await mongoose.disconnect();
}

function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

module.exports = { connectDatabase, disconnectDatabase, isDatabaseConnected };
