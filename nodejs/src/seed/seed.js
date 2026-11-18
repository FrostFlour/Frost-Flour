// US-08 helper. Run with: npm run seed
// Creates the FIRST Agent account. The backlog says this account exists from
// the start (nobody can create it through the app, because creating an Agent
// already needs a logged-in Agent). Running the script twice is safe.

// 1. Read the values from nodejs/.env (MONGODB_URI, SEED_AGENT_EMAIL...)
require("dotenv").config();

const { connectDatabase, disconnectDatabase } = require("../config/db");
const userRepository = require("../repositories/userRepository");

// 2. Email and password of the first Agent (can be changed in .env)
const email = (process.env.SEED_AGENT_EMAIL || "agent@frostflour.tn").toLowerCase();
const password = process.env.SEED_AGENT_PASSWORD || "agent123";

async function seed() {
  // 3. Open the connection to MongoDB
  await connectDatabase();

  // 4. Only create the Agent if this email is not used yet
  if (await userRepository.existsByEmail(email)) {
    console.log(`Agent ${email} already exists, nothing to do.`);
  } else {
    await userRepository.createAgent({
      firstName: "Admin",
      lastName: "Agent",
      email,
      phone: "00000000",
      password, // hashed automatically by the pre("save") hook in models/User.js
    });
    console.log(`First Agent created: ${email} / ${password}`);
  }

  // 5. Close the connection so the script can end
  await disconnectDatabase();
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
