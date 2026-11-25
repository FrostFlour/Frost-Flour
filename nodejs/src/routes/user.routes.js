const router = require("express").Router();
const {
  getMe,
  updateMe,
  updateClient,
  changePassword,
  getClients,
} = require("../controllers/user.controller");
const { protect, restrictTo } = require("../middlewares/auth");

router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.put("/me/password", protect, changePassword);
router.put("/clients/me", protect, updateClient);
router.get("/clients", protect, restrictTo("Agent"), getClients);

module.exports = router;
