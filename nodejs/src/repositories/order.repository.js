const Order = require("../models/order.model");

exports.findById = (id) => Order.findById(id);

exports.findByIdWithClient = (id) => Order.findById(id).populate("client", "firstName lastName email");

exports.changeStatus = (id, from, to) =>
  Order.findOneAndUpdate({ _id: id, status: from }, { status: to }, { new: true });
