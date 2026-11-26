const router = require("express").Router();
const {
  getMe,
  updateMe,
  updateClient,
  changePassword,
  createAgent,
  getClients,
} = require("../controllers/user.controller");
const { protect, restrictTo } = require("../middlewares/auth");
const { ROLES } = require("../models/enums");

router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.put("/me/password", protect, changePassword);
router.put("/clients/me", protect, updateClient);
router.get("/clients", protect, restrictTo("Agent"), getClients);

// US-08: POST /api/users/agents
// The middlewares run one after the other, from left to right:
//   protect          -> must be logged in (else 401)
//   restrictTo Agent -> must be an Agent (else 403)
//   createAgent      -> does the work
router.post("/agents", protect, restrictTo(ROLES.AGENT), createAgent);

module.exports = router;
