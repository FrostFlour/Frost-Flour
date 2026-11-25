// Routes for /api/categories (mounted in server.js and app.js)
const router = require("express").Router();
const { create, list, getOne, update, remove } = require("../controllers/category.controller");
const { protect, restrictTo } = require("../middlewares/auth");
const { ROLES } = require("../models/enums");

// US-10 / US-14: GET /api/categories -> public list (no middleware)
router.get("/", list);

// US-12: GET /api/categories/:id -> one category (edit page)
router.get("/:id", getOne);

// US-11: POST /api/categories -> only a logged-in Agent
//   protect    -> 401 if not logged in
//   restrictTo -> 403 if the user is not an Agent
router.post("/", protect, restrictTo(ROLES.AGENT), create);

// US-12: PATCH /api/categories/:id -> only a logged-in Agent
router.patch("/:id", protect, restrictTo(ROLES.AGENT), update);

// US-13: DELETE /api/categories/:id -> only a logged-in Agent
router.delete("/:id", protect, restrictTo(ROLES.AGENT), remove);

module.exports = router;
