// US-10 / US-11 / US-12 / US-13 / US-14: all database access for categories.
const Category = require("../models/category.model");

// Same "ignore case" rule as the unique index in category.model.js
const IGNORE_CASE = { locale: "en", strength: 2 };

// US-11: save a new category
exports.create = (data) => Category.create(data);

// US-11: find a category by name, ignoring case ("CAKES" finds "Cakes")
exports.findByName = (name) => Category.findOne({ name }).collation(IGNORE_CASE);

// US-14: find one category by its id (to check that it exists)
exports.findById = (id) => Category.findById(id);

// US-14: all categories sorted by name (for the <select> in the product form)
exports.findAll = () => Category.find().sort({ name: 1 });

// US-12: replace the name and description, and return the updated category
exports.updateById = (id, data) =>
  Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });

// US-13: remove one category
exports.deleteById = (id) => Category.findByIdAndDelete(id);
