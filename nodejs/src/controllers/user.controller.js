const bcrypt = require("bcryptjs");
const AppError = require("../utils/AppError");
const User = require("../models/User");
const Client = require("../models/Client");
const userRepository = require("../repositories/userRepository");

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
