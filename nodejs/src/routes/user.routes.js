const router = require("express").Router();
const { getMe, updateMe, updateClient, changePassword } = require("../controllers/user.controller");
const { protect } = require("../middlewares/auth");

router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.put("/me/password", protect, changePassword);
router.put("/clients/me", protect, updateClient);

module.exports = router;
