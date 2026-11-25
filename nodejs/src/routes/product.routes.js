// Routes for /api/products (mounted in server.js and app.js)
const router = require("express").Router();
const {
  create,
  listAvailable,
  listAll,
  getOne,
  update,
  archive,
} = require("../controllers/product.controller");
const { protect, restrictTo } = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const { ROLES } = require("../models/enums");

router.get("/", listAvailable);
router.get("/:id", getProduct);

// US-18: GET /api/products/all -> Agent only, archived products included.
// It must be declared before /:id so "all" is not read as a product id.
router.get("/all", protect, restrictTo(ROLES.AGENT), listAll);

// US-16: GET /api/products/:id -> Agent only, used to fill the edit form.
router.get("/:id", protect, restrictTo(ROLES.AGENT), getOne);

// US-14: POST /api/products
//   protect               -> 401 if not logged in
//   restrictTo("Agent")   -> 403 if not an Agent
//   upload.single("image")-> multer reads the form and saves the file sent
//                            in the field called "image" (optional)
//   create                -> checks the fields and saves the product
router.post("/", protect, restrictTo(ROLES.AGENT), upload.single("image"), create);

// US-17: PATCH /api/products/:id/archive -> Agent only, idempotent
router.patch("/:id/archive", protect, restrictTo(ROLES.AGENT), archive);

// US-16: PATCH /api/products/:id -> Agent only, same multipart form as create
router.patch("/:id", protect, restrictTo(ROLES.AGENT), upload.single("image"), update);

module.exports = router;
