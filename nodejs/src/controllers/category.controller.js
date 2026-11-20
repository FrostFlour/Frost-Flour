const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const categoryRepository = require("../repositories/category.repository");
const productRepository = require("../repositories/product.repository");

// Shared rules for create (US-11) and edit (US-12).
function readFields(body) {
  const name = String(body?.name || "").trim();
  const description = String(body?.description || "").trim();

  if (!name) {
    throw new AppError("name is required", 400);
  }
  if (name.length > 50) {
    throw new AppError("name must have at most 50 characters", 400);
  }

  return { name, description };
}

// A bad id is the same as a missing category for the agent pages.
async function loadCategory(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Category not found", 404);
  }

  const category = await categoryRepository.findById(id);
  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return category;
}

// ---------------------------------------------------------------------------
// US-11: an Agent creates a category.
// Route: POST /api/categories   body: { name, description }
// ---------------------------------------------------------------------------
exports.create = async (req, res, next) => {
  try {
    const { name, description } = readFields(req.body);

    // The name must not exist yet (ignoring upper/lower case)
    if (await categoryRepository.findByName(name)) {
      throw new AppError("A category with this name already exists", 409);
    }

    const category = await categoryRepository.create({ name, description });
    res.status(201).json({ message: "Category created", category });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// US-10 / US-14: list all categories.
// Public, because the product form and the catalog filter need it.
// Each category also carries productCount for the agent list (US-10).
// Route: GET /api/categories
// ---------------------------------------------------------------------------
exports.list = async (req, res, next) => {
  try {
    const [categories, counts] = await Promise.all([
      categoryRepository.findAll(),
      productRepository.countByCategory(),
    ]);

    const countById = new Map(counts.map((row) => [String(row._id), row.count]));

    res.json({
      categories: categories.map((category) => ({
        ...category.toObject(),
        productCount: countById.get(String(category._id)) || 0,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// US-12: one category, plus a short list of the products that use it.
// Route: GET /api/categories/:id
// ---------------------------------------------------------------------------
exports.getOne = async (req, res, next) => {
  try {
    const category = await loadCategory(req.params.id);
    const [productCount, products] = await Promise.all([
      productRepository.countForCategory(category._id),
      productRepository.findNamesByCategory(category._id),
    ]);

    res.json({
      category: { ...category.toObject(), productCount },
      products,
    });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// US-12: an Agent edits a category.
// Route: PATCH /api/categories/:id   body: { name, description }
// ---------------------------------------------------------------------------
exports.update = async (req, res, next) => {
  try {
    const current = await loadCategory(req.params.id);
    const { name, description } = readFields(req.body);

    // The new name may belong to this category, but not to another one
    const existing = await categoryRepository.findByName(name);
    if (existing && String(existing._id) !== String(current._id)) {
      throw new AppError("A category with this name already exists", 409);
    }

    const category = await categoryRepository.updateById(current._id, { name, description });
    res.json({ message: "Category updated", category });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// US-13: an Agent deletes a category that has no products.
// A product must always belong to a category, so a used category stays.
// Route: DELETE /api/categories/:id
// ---------------------------------------------------------------------------
exports.remove = async (req, res, next) => {
  try {
    const category = await loadCategory(req.params.id);
    const productCount = await productRepository.countForCategory(category._id);

    if (productCount > 0) {
      throw new AppError(
        "This category still has products. Move them to another category before deleting it.",
        409
      );
    }

    await categoryRepository.deleteById(category._id);
    res.json({ message: "Category deleted" });
  } catch (err) {
    next(err);
  }
};
