const bcrypt = require("bcryptjs");
const AppError = require("../utils/AppError");
const userRepository = require("../repositories/userRepository");
const {
  createToken,
  setTokenCookie,
  clearTokenCookie,
} = require("../utils/token");

const normalizeEmail = (email) => String(email).toLowerCase().trim();

exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password, address } =
      req.body || {};

    if (!firstName || !lastName || !email || !phone || !password) {
      throw new AppError("All fields are required", 400);
    }

    if (String(password).length < 8) {
      throw new AppError("Password must have at least 8 characters", 400);
    }

    const cleanEmail = normalizeEmail(email);

    if (await userRepository.existsByEmail(cleanEmail)) {
      throw new AppError("Email already registered", 409);
    }

    const user = await userRepository.createClient({
      firstName,
      lastName,
      email: cleanEmail,
      phone,
      password,
      address,
    });

    res.status(201).json({ message: "Account created", user });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    const user = await userRepository.findByEmailWithPassword(
      normalizeEmail(email)
    );
    const ok = user && (await bcrypt.compare(password, user.password));

    if (!ok) {
      throw new AppError("Invalid email or password", 401);
    }

    setTokenCookie(res, createToken(user._id));
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  clearTokenCookie(res);
  res.json({ message: "Logged out" });
};

exports.getMe = (req, res) => {
  res.json({ user: req.user });
};
