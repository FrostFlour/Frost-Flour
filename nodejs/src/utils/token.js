const jwt = require("jsonwebtoken");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
};

exports.createToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  });

exports.setTokenCookie = (res, token) => {
  const maxAge = Number(process.env.COOKIE_MAX_AGE_MS);

  res.cookie("token", token, {
    ...cookieOptions,
    maxAge: Number.isFinite(maxAge) ? maxAge : 24 * 60 * 60 * 1000,
  });
};

exports.clearTokenCookie = (res) => res.clearCookie("token", cookieOptions);
