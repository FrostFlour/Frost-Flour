const router = require("express").Router();
const { pay, getStatus, cancel, webhook } = require("../controllers/payment.controller");
const { protect, restrictTo } = require("../middlewares/auth");
const { ROLES } = require("../models/enums");

router.post("/webhook", webhook);

router.use(protect, restrictTo(ROLES.CLIENT));
router.post("/:orderId/pay", pay);
router.get("/:orderId", getStatus);
router.post("/:orderId/cancel", cancel);

module.exports = router;
