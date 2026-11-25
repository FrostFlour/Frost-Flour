const fs = require("node:fs/promises");
const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const productRepository = require("../repositories/product.repository");
const categoryRepository = require("../repositories/category.repository");

exports.listAvailable = async (req, res, next) => {
  try {
    const filter = { isAvailable: true };
    const category = String(req.query.category || "").trim();
    const search = String(req.query.search || "").trim();

    if (category) {
      if (!mongoose.isValidObjectId(category)) {
        return res.json({ products: [] });
      }
      filter.category = category;
    }

    if (search) {
      const text = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: text, $options: "i" } },
        { description: { $regex: text, $options: "i" } },
      ];
    }

    const products = await productRepository.findAvailable(filter);
    res.json({ products });
  } catch (err) {
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw new AppError("Product not found", 404);
    }

    const product = await productRepository.findById(req.params.id);
    if (!product) throw new AppError("Product not found", 404);

    res.json({ product });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// US-14: an Agent creates a product (with an optional image).
// Route: POST /api/products   (multipart/form-data, read by middlewares/upload.js)
// When we get here, multer has already saved the image (if any) and
// req.file describes it; the text fields are in req.body.
// ---------------------------------------------------------------------------
exports.create = async (req, res, next) => {
  try {
    // 1. Read the text fields (multer gives us strings)
    const name = String(req.body?.name || "").trim();
    const description = String(req.body?.description || "").trim();
    const priceText = String(req.body?.price || "").trim();
    const category = String(req.body?.category || "").trim();

    // 2. Every required field must be filled; the message names the field
    const required = { name, description, price: priceText, category };
    for (const [field, value] of Object.entries(required)) {
      if (!value) throw new AppError(`${field} is required`, 400);
    }

    // 3. The price must be a number greater than zero ("abc", 0, -5 refused)
    const price = Number(priceText);
    if (!Number.isFinite(price) || price <= 0) {
      throw new AppError("price must be a number greater than zero", 400);
    }

    // 4. The category must exist (first check that the id has the right format)
    if (!mongoose.isValidObjectId(category) || !(await categoryRepository.findById(category))) {
      throw new AppError("This category does not exist", 400);
    }

    // 5. Product names are unique
    if (await productRepository.findByName(name)) {
      throw new AppError("A product with this name already exists", 409);
    }

    // 6. Save. isAvailable is true by default (see product.model.js).
    //    If an image was sent we store its public path, else null.
    const product = await productRepository.create({
      name,
      description,
      price,
      category,
      image: req.file ? `/uploads/products/${req.file.filename}` : null,
    });

    res.status(201).json({ message: "Product created", product });
  } catch (err) {
    // The product was NOT saved, so we delete the image multer already wrote
    // on the disk (otherwise it would stay there for nothing).
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    next(err);
  }
};
