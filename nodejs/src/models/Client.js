const mongoose = require("mongoose");
const User = require("./User");
const { ROLES } = require("./enums");

const clientSchema = new mongoose.Schema({
  address: { type: String, trim: true },
});

module.exports = User.discriminator(ROLES.CLIENT, clientSchema);
