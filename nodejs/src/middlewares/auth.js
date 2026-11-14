const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");

exports.protect = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Please log in" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Session expired, please log in again" });
  }

  try {
    const user = await userRepository.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Please log in" });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

exports.restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "You are not allowed to do this" });
  }

  next();
};
