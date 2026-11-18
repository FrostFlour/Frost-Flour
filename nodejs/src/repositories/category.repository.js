// US-11 / US-14: all database access for categories.
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
