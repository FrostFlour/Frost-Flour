const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const productRepository = require("../repositories/product.repository");

const CART_COOKIE = "cart";
const CART_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const cookieOptions = {
  httpOnly: true,
  signed: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
};

const emptyCart = (userId) => ({
  userId: userId.toString(),
  items: [],
  expiresAt: Date.now() + CART_MAX_AGE,
});

function readCart(req) {
  const saved = req.signedCookies?.[CART_COOKIE];
  const userId = req.user._id.toString();

  if (!saved || typeof saved !== "object" || saved.userId !== userId) {
    return emptyCart(req.user._id);
  }

  if (!Number.isFinite(saved.expiresAt) || saved.expiresAt <= Date.now()) {
    return emptyCart(req.user._id);
  }

  return {
    userId,
    items: Array.isArray(saved.items) ? saved.items : [],
    expiresAt: saved.expiresAt,
  };
}

function saveCart(res, cart) {
  const maxAge = Math.max(0, cart.expiresAt - Date.now());
  res.cookie(CART_COOKIE, JSON.stringify(cart), {
    ...cookieOptions,
    maxAge,
    expires: new Date(cart.expiresAt),
  });
}

async function displayCart(cart) {
  const ids = cart.items.map((item) => item.productId);
  const products = ids.length ? await productRepository.findAvailableByIds(ids) : [];
  const productsById = new Map(products.map((product) => [product._id.toString(), product]));

  return {
    items: cart.items
      .map((item) => {
        const product = productsById.get(item.productId);
        return product ? { product, quantity: item.quantity } : null;
      })
      .filter(Boolean),
    expiresAt: new Date(cart.expiresAt).toISOString(),
  };
}

exports.getCart = async (req, res, next) => {
  try {
    res.json({ cart: await displayCart(readCart(req)) });
  } catch (err) {
    next(err);
  }
};

exports.addItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) {
      throw new AppError("Invalid product", 400);
    }

    const product = await productRepository.findAvailableById(productId);
    if (!product) throw new AppError("Product is not available", 404);

    const cart = readCart(req);
    const existing = cart.items.find((item) => item.productId === productId);
    if (existing) existing.quantity += 1;
    else cart.items.push({ productId, quantity: 1 });

    saveCart(res, cart);
    res.status(201).json({
      message: "Product added to cart",
      cart: await displayCart(cart),
    });
  } catch (err) {
    next(err);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const quantity = Number(req.body?.quantity);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new AppError("Quantity must be a whole number between 1 and 20", 400);
    }

    const cart = readCart(req);
    const item = cart.items.find((item) => item.productId === productId);
    if (!item) throw new AppError("Product is not in the cart", 404);

    item.quantity = quantity;
    saveCart(res, cart);
    res.json({ message: "Quantity updated", cart: await displayCart(cart) });
  } catch (err) {
    next(err);
  }
};

exports.removeItem = async (req, res, next) => {
  try {
    const cart = readCart(req);
    cart.items = cart.items.filter((item) => item.productId !== req.params.productId);
    saveCart(res, cart);
    res.json({ message: "Product removed from cart", cart: await displayCart(cart) });
  } catch (err) {
    next(err);
  }
};

exports.clearCart = (req, res) => {
  res.clearCookie(CART_COOKIE, cookieOptions);
  res.json({ message: "Cart cleared", cart: { items: [], expiresAt: null } });
};
