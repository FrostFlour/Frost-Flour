const fs = require("node:fs/promises");
const path = require("node:path");
const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const productRepository = require("../repositories/product.repository");
const categoryRepository = require("../repositories/category.repository");

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "products");

// The public URL saved in the product, e.g. /uploads/products/<name>.png
function imageUrl(filename) {
  return `/uploads/products/${filename}`;
}

// Delete the previous image after it has been replaced. We never delete an
// image that is still used by the product, and a missing file is not an error.
async function deleteStoredImage(image) {
  if (!image) return;
  await fs.unlink(path.join(UPLOAD_DIR, path.basename(image))).catch(() => {});
}

exports.listAvailable = async (req, res, next) => {
  try {
    const products = await productRepository.findAvailable();
    res.json({ products });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// US-18: the Agent sees every product, archived ones included.
// Route: GET /api/products/all   (protect + Agent only in the router)
// ---------------------------------------------------------------------------
exports.listAll = async (req, res, next) => {
  try {
    const products = await productRepository.findAll();
    res.json({ products });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// US-16: the Agent opens the edit form with the current values filled in.
// Route: GET /api/products/:id   (protect + Agent only in the router)
// ---------------------------------------------------------------------------
exports.getOne = async (req, res, next) => {
  try {
    const product = await loadProduct(req.params.id);
    res.json({ product });
  } catch (err) {
    next(err);
  }
};

// Shared rules for create (US-14) and edit (US-16).
function readFields(body) {
  const name = String(body?.name || "").trim();
  const description = String(body?.description || "").trim();
  const priceText = String(body?.price || "").trim();
  const category = String(body?.category || "").trim();

  // Every required field must be filled; the message names the field
  const required = { name, description, price: priceText, category };
  for (const [field, value] of Object.entries(required)) {
    if (!value) throw new AppError(`${field} is required`, 400);
  }

  // The price must be a number greater than zero ("abc", 0, -5 refused)
  const price = Number(priceText);
  if (!Number.isFinite(price) || price <= 0) {
    throw new AppError("price must be a number greater than zero", 400);
  }

  return { name, description, price, category };
}

// The category must exist (first check that the id has the right format)
async function checkCategory(category) {
  if (!mongoose.isValidObjectId(category) || !(await categoryRepository.findById(category))) {
    throw new AppError("This category does not exist", 400);
  }
}

// Product names are unique. When editing, the product keeps its own name.
async function checkNameAvailable(name, currentId) {
  const existing = await productRepository.findByName(name);
  if (existing && String(existing._id) !== String(currentId)) {
    throw new AppError("A product with this name already exists", 409);
  }
}

// A bad id is the same as a missing product on the agent pages.
async function loadProduct(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Product not found", 404);
  }

  const product = await productRepository.findById(id);
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
}

// ---------------------------------------------------------------------------
// US-14: an Agent creates a product (with an optional image).
// Route: POST /api/products   (multipart/form-data, read by middlewares/upload.js)
// When we get here, multer has already saved the image (if any) and
// req.file describes it; the text fields are in req.body.
// ---------------------------------------------------------------------------
exports.create = async (req, res, next) => {
  try {
    const fields = readFields(req.body);
    await checkCategory(fields.category);
    await checkNameAvailable(fields.name);

    // Save. isAvailable is true by default (see product.model.js).
    // If an image was sent we store its public path, else null.
    const product = await productRepository.create({
      ...fields,
      image: req.file ? imageUrl(req.file.filename) : null,
    });

    res.status(201).json({ message: "Product created", product });
  } catch (err) {
    // The product was NOT saved, so we delete the image multer already wrote
    // on the disk (otherwise it would stay there for nothing).
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    next(err);
  }
};

// ---------------------------------------------------------------------------
// US-16: an Agent edits a product. Same checks as creation, and the image is
// replaced only when a new file was chosen.
// Route: PATCH /api/products/:id   (multipart/form-data)
// ---------------------------------------------------------------------------
exports.update = async (req, res, next) => {
  let imageSaved = false; // true once the new file belongs to the product

  try {
    const current = await loadProduct(req.params.id);
    const fields = readFields(req.body);
    await checkCategory(fields.category);
    await checkNameAvailable(fields.name, current._id);

    const product = await productRepository.updateById(current._id, {
      ...fields,
      image: req.file ? imageUrl(req.file.filename) : current.image,
    });
    imageSaved = true;

    // The old file is not needed any more once the new one is saved
    if (req.file) await deleteStoredImage(current.image);

    res.json({ message: "Product updated", product });
  } catch (err) {
    if (req.file && !imageSaved) await fs.unlink(req.file.path).catch(() => {});
    next(err);
  }
};

// ---------------------------------------------------------------------------
// US-17: an Agent archives a product. Archiving never deletes it, so past
// orders (which keep a copy of the product) stay readable.
// Route: PATCH /api/products/:id/archive   (Agent only)
// ---------------------------------------------------------------------------
exports.archive = async (req, res, next) => {
  try {
    const current = await loadProduct(req.params.id);
    // Already archived? Setting false again changes nothing.
    const product = await productRepository.updateById(current._id, { isAvailable: false });
    res.json({ message: "Product archived", product });
  } catch (err) {
    next(err);
  }
};
