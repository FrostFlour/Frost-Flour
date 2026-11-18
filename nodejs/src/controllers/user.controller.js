const bcrypt = require("bcryptjs");
const AppError = require("../utils/AppError");
const User = require("../models/User");
const Client = require("../models/Client");
const userRepository = require("../repositories/userRepository");
const validateAccount = require("../utils/validateAccount"); // US-08

exports.getMe = async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
};

exports.updateMe = async (req, res, next) => {
  try {
    const { firstName, lastName } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName },
      { new: true, runValidators: false }
    );

    res.json({ user });
  } catch (err) {
    next(err);
  }
};

exports.updateClient = async (req, res, next) => {
  try {
    const { phone, address } = req.body;

    const client = await Client.findByIdAndUpdate(
      req.user._id,
      { phone, address },
      { new: true, runValidators: true }
    );

    const updatedUser = {
      ...req.user.toObject(),
      ...client.toObject(),
      phone,
      address,
    };

    res.json({ user: updatedUser });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body || {};

    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new AppError("All fields are required", 400);
    }

    if (newPassword.length < 8) {
      throw new AppError("New password must be at least 8 characters", 400);
    }

    if (newPassword !== confirmPassword) {
      throw new AppError("Passwords do not match", 400);
    }

    const user = await userRepository.findByEmailWithPassword(req.user.email);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new AppError("Current password is incorrect", 401);
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// US-08: a logged-in Agent creates another Agent account.
// Route: POST /api/users/agents
// (protect + restrictTo("Agent") already ran in the route, so here we know
//  the person calling is a logged-in Agent.)
// ---------------------------------------------------------------------------
exports.createAgent = async (req, res, next) => {
  try {
    // 1. Read the fields sent by the form (req.body is filled by express.json())
    const { firstName, lastName, email, phone, password } = req.body || {};

    // 2. Same rules as registration: required fields, valid email, 8+ chars.
    //    validateAccount throws an AppError (400) if something is wrong.
    validateAccount({ firstName, lastName, email, phone, password });

    // 3. The email must not be used yet (409 = Conflict)
    const cleanEmail = String(email).toLowerCase().trim();
    if (await userRepository.existsByEmail(cleanEmail)) {
      throw new AppError("Email already registered", 409);
    }

    // 4. Save the Agent. The password is hashed automatically by the
    //    pre("save") hook in models/User.js (we never store it in clear).
    const agent = await userRepository.createAgent({
      firstName,
      lastName,
      email: cleanEmail,
      phone,
      password,
    });

    // 5. 201 = "Created". The password is removed by toJSON in models/User.js.
    res.status(201).json({ message: "Agent account created", user: agent });
  } catch (err) {
    next(err); // sends the error to the error handler (middlewares/errorHandler.js)
  }
};
