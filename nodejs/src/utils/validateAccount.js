const AppError = require("./AppError");

// Simple check: "something@something.something", no spaces
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Checks the fields needed to create an account (Client or Agent).
// Throws an AppError (status 400) with a clear message if something is wrong.
module.exports = function validateAccount(data) {
  const { firstName, lastName, email, phone, password } = data;

  // 1. Every required field must be filled, and we name the missing one
  const required = { firstName, lastName, email, phone, password };
  for (const [field, value] of Object.entries(required)) {
    if (!value || String(value).trim() === "") {
      throw new AppError(`${field} is required`, 400);
    }
  }

  // 2. Email must be valid
  if (!EMAIL_REGEX.test(String(email).trim())) {
    throw new AppError("email is not valid", 400);
  }

  // 3. Password: at least 8 characters
  if (String(password).length < 8) {
    throw new AppError("Password must have at least 8 characters", 400);
  }
};
