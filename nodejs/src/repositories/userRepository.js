// Repository = the only place that talks to the database for users.
// Controllers call these small functions instead of using Mongoose directly.
const { User, Client, Agent } = require("../models");

exports.findByEmail = (email) => User.findOne({ email });

exports.findByEmailWithPassword = (email) =>
  User.findOne({ email }).select("+password");

exports.findById = (id) => User.findById(id);

exports.existsByEmail = (email) => User.exists({ email });

exports.createClient = (data) => Client.create(data);
exports.findClients = () => Client.find().sort({ createdAt: -1 });

// US-08: saves a new user with role "Agent".
// Agent is a Mongoose "discriminator" of User (see models/Agent.js), so the
// document goes into the same "users" collection with role: "Agent".
exports.createAgent = (data) => Agent.create(data);
