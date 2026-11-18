// US-14: all database access for products.
const Product = require("../models/product.model");

// US-14: save a new product
exports.create = (data) => Product.create(data);

// US-14: find a product by name, ignoring upper/lower case
exports.findByName = (name) =>
  Product.findOne({ name }).collation({ locale: "en", strength: 2 });

exports.findAvailableById = (id) => Product.findOne({ _id: id, isAvailable: true });

exports.findAvailableByIds = (ids) =>
  Product.find({ _id: { $in: ids }, isAvailable: true });

exports.findAvailable = () => Product.find({ isAvailable: true }).sort({ createdAt: -1 });
