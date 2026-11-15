const userRepository = require("../repositories/userRepository");

exports.getMe = async (req, res, next) => {
  try {
    // req.user is already set by the protect middleware
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
};
