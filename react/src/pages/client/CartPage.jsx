import { useEffect, useState } from "react";
import { clearCart, getCart, removeCartItem } from "../../api/cart.api";

export default function CartPage() {
  const [cart, setCart] = useState({ items: [], expiresAt: null });

  const loadCart = () =>
    getCart()
      .then((data) => setCart(data.cart))
      .catch(() => {});

  useEffect(() => {
    loadCart();
  }, []);

  const handleRemove = async (productId) => {
    try {
      const data = await removeCartItem(productId);
      setCart(data.cart);
    } catch {
      // Keep the current cart if the request fails.
    }
  };

  const handleClear = async () => {
    try {
      const data = await clearCart();
      setCart(data.cart);
    } catch {
      // Keep the current cart if the request fails.
    }
  };

  const total = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  return (
    <section className="shop-page">
      <div className="shop-heading">
        <p className="shop-eyebrow">YOUR SWEET PICKS</p>
        <h2>Your cart</h2>
      </div>
      {cart.items.length === 0 ? (
        <p className="shop-empty">Your cart is empty.</p>
      ) : (
        <div className="cart-list">
          {cart.items.map((item) => (
            <article className="cart-row" key={item.product._id}>
              <div>
                <h3>{item.product.name}</h3>
                <p>{item.product.price.toFixed(2)} TND × {item.quantity}</p>
              </div>
              <button type="button" onClick={() => handleRemove(item.product._id)}>Remove</button>
            </article>
          ))}
          <div className="cart-total">
            <strong>Total: {total.toFixed(2)} TND</strong>
            <button type="button" onClick={handleClear}>Clear cart</button>
          </div>
        </div>
      )}
    </section>
  );
}
