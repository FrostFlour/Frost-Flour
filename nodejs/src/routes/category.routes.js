// Routes for /api/categories (mounted in server.js and app.js)
const router = require("express").Router();
const { create, list } = require("../controllers/category.controller");
const { protect, restrictTo } = require("../middlewares/auth");
const { ROLES } = require("../models/enums");

// US-14: GET /api/categories -> public list (no middleware)
router.get("/", list);

// US-11: POST /api/categories -> only a logged-in Agent
//   protect    -> 401 if not logged in
//   restrictTo -> 403 if the user is not an Agent (this is the "authorize" task)
router.post("/", protect, restrictTo(ROLES.AGENT), create);

module.exports = router;
