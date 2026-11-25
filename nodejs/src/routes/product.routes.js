// Routes for /api/products (mounted in server.js and app.js)
const router = require("express").Router();
const { create, listAvailable, getProduct } = require("../controllers/product.controller");
const { protect, restrictTo } = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const { ROLES } = require("../models/enums");

router.get("/", listAvailable);
router.get("/:id", getProduct);

// US-14: POST /api/products
//   protect               -> 401 if not logged in
//   restrictTo("Agent")   -> 403 if not an Agent
//   upload.single("image")-> multer reads the form and saves the file sent
//                            in the field called "image" (optional)
//   create                -> checks the fields and saves the product
router.post("/", protect, restrictTo(ROLES.AGENT), upload.single("image"), create);

module.exports = router;
