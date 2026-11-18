const AppError = require("../utils/AppError");
const categoryRepository = require("../repositories/category.repository");

// ---------------------------------------------------------------------------
// US-11: an Agent creates a category.
// Route: POST /api/categories   body: { name, description }
// ---------------------------------------------------------------------------
exports.create = async (req, res, next) => {
  try {
    // 1. Read the form fields and remove extra spaces
    const name = String(req.body?.name || "").trim();
    const description = String(req.body?.description || "").trim();

    // 2. Rules from the backlog
    if (!name) {
      throw new AppError("name is required", 400);
    }
    if (name.length > 50) {
      throw new AppError("name must have at most 50 characters", 400);
    }

    // 3. The name must not exist yet (ignoring upper/lower case)
    if (await categoryRepository.findByName(name)) {
      throw new AppError("A category with this name already exists", 409);
    }

    // 4. Save and answer 201 (Created) with the new category
    const category = await categoryRepository.create({ name, description });
    res.status(201).json({ message: "Category created", category });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// US-14 (task 6): list all categories. Public (no login), because the product
// form and later the catalog filter need it.
// Route: GET /api/categories
// ---------------------------------------------------------------------------
exports.list = async (req, res, next) => {
  try {
    const categories = await categoryRepository.findAll();
    res.json({ categories });
  } catch (err) {
    next(err);
  }
};
