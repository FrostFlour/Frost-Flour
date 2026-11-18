const router = require("express").Router();
const { protect } = require("../middlewares/auth");
const { getCart, addItem, removeItem, clearCart } = require("../controllers/cart.controller");

router.use(protect);
router.get("/", getCart);
router.post("/items/:productId", addItem);
router.delete("/items/:productId", removeItem);
router.delete("/", clearCart);

module.exports = router;
