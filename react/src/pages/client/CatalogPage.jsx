import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { addCartItem } from "../../api/cart.api";
import { apiFetch, API_BASE_URL } from "../../api/client";

export default function CatalogPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadingId, setLoadingId] = useState(null);

  const displayProducts = () =>
    apiFetch("/api/products")
      .then((data) => setProducts(data.products))
      .catch((requestError) => setError(requestError.message));

  useEffect(() => {
    displayProducts();
  }, []);

  const handleAdd = async (productId) => {
    setLoadingId(productId);
    setMessage("");
    setError("");
    try {
      await addCartItem(productId);
      setMessage("Product added to your cart.");
    } catch (requestError) {
      if (requestError.message.includes("log in")) {
        navigate("/login");
        return;
      }
      setError(requestError.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <section className="shop-page">
      <div className="shop-heading">
        <p className="shop-eyebrow">FRESH FROM THE OVEN</p>
        <h2>Our treats</h2>
        <p>Choose something sweet and add it to your cart.</p>
      </div>
      {message && <p className="shop-message">{message}</p>}
      {error && <p className="shop-error">{error} <button type="button" onClick={displayProducts}>Retry</button></p>}
      <div className="product-grid">
        {products.map((product) => (
          <article className="product-card" key={product._id}>
            {product.image ? (
              <img src={`${API_BASE_URL}${product.image}`} alt={product.name} />
            ) : (
              <div className="product-placeholder" aria-hidden="true">🧁</div>
            )}
            <h3>{product.name}</h3>
            <Link className="product-details-link" to={`/products/${product._id}`}>View details</Link>
            <strong>{product.price.toFixed(2)} TND</strong>
            <button type="button" onClick={() => handleAdd(product._id)} disabled={loadingId === product._id}>
              {loadingId === product._id ? "Adding..." : "Add to cart"}
            </button>
          </article>
        ))}
      </div>
      {!error && products.length === 0 && <p className="shop-empty">No products are available yet.</p>}
    </section>
  );
}
