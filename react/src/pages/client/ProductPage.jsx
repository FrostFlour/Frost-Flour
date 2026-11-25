import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { addCartItem } from "../../api/cart.api";
import { API_BASE_URL } from "../../api/client";
import { getProduct } from "../../api/product.api";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProduct(id)
      .then((data) => setProduct(data.product))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    setError("");
    setMessage("");
    try {
      await addCartItem(product._id);
      setMessage("Product added to your cart.");
    } catch (requestError) {
      if (requestError.message.includes("log in")) {
        navigate("/login");
        return;
      }
      setError(requestError.message);
    }
  };

  if (loading) return <section className="shop-page"><p className="shop-empty">Loading...</p></section>;

  if (error || !product) {
    return (
      <section className="shop-page">
        <p className="shop-error">{error || "Product not found"}</p>
        <p className="back-link"><Link to="/catalog">← Back to catalog</Link></p>
      </section>
    );
  }

  return (
    <section className="shop-page">
      <div className="shop-heading">
        <p className="shop-eyebrow">FRESH FROM THE OVEN</p>
        <h2>{product.name}</h2>
      </div>
      <article className="product-card product-detail">
        {product.image ? (
          <img src={`${API_BASE_URL}${product.image}`} alt={product.name} />
        ) : (
          <div className="product-placeholder" aria-hidden="true">🧁</div>
        )}
        <p>{product.description}</p>
        <p><strong>{product.price.toFixed(2)} TND</strong></p>
        <p>Category: {product.category?.name || "Uncategorized"}</p>
        {message && <p className="shop-message">{message}</p>}
        {product.isAvailable ? (
          <button type="button" onClick={handleAdd}>Add to cart</button>
        ) : (
          <p className="shop-message">This product is no longer available.</p>
        )}
      </article>
      <p className="back-link"><Link to="/catalog">← Back to catalog</Link></p>
    </section>
  );
}
