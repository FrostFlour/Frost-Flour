const { User, Client } = require("../models");

exports.findByEmail = (email) => User.findOne({ email });

exports.findByEmailWithPassword = (email) =>
  User.findOne({ email }).select("+password");

exports.findById = (id) => User.findById(id);

exports.existsByEmail = (email) => User.exists({ email });

exports.createClient = (data) => Client.create(data);
