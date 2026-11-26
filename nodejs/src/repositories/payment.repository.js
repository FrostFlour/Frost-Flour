const Payment = require("../models/payment.model");

exports.findByOrder = (orderId) => Payment.findOne({ order: orderId });

exports.findByTransactionId = (transactionId) => Payment.findOne({ transactionId });

exports.create = (data) => Payment.create(data);

exports.updateById = (id, data) => Payment.findByIdAndUpdate(id, data, { new: true });

exports.changeStatus = (id, from, to, extra = {}) =>
  Payment.findOneAndUpdate({ _id: id, status: { $in: from } }, { status: to, ...extra }, { new: true });
