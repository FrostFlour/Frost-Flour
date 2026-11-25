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

// US-18: the agent list includes archived products. The category name is
// populated so the table can show it without another query per product.
exports.findAll = () => Product.find().populate("category", "name").sort({ createdAt: -1 });

// US-16: one product, including archived ones, for the edit form.
exports.findById = (id) => Product.findById(id).populate("category", "name");

// US-16 / US-17: save the fields edited by the agent (or the new availability).
exports.updateById = (id, data) =>
  Product.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate("category", "name");

// US-10: how many products belong to each category (one query for the whole list)
exports.countByCategory = () =>
  Product.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);

// US-12 / US-13: products linked to one category
exports.countForCategory = (categoryId) => Product.countDocuments({ category: categoryId });

exports.findNamesByCategory = (categoryId, limit = 6) =>
  Product.find({ category: categoryId }).select("name").sort({ name: 1 }).limit(limit);
