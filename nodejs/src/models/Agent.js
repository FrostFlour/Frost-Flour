const mongoose = require("mongoose");
const User = require("./User");
const { ROLES } = require("./enums");

module.exports = User.discriminator(ROLES.AGENT, new mongoose.Schema({}));
