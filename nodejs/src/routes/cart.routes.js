const router = require("express").Router();
const { protect } = require("../middlewares/auth");
const { getCart, addItem, updateItem, removeItem, clearCart } = require("../controllers/cart.controller");

router.use(protect);
router.get("/", getCart);
router.post("/items/:productId", addItem);
router.patch("/items/:productId", updateItem);
router.delete("/items/:productId", removeItem);
router.delete("/", clearCart);

module.exports = router;
