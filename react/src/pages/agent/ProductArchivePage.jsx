// US-17: an Agent confirms before a product is archived.
// Archiving only hides it from the public catalog; nothing is deleted.
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { archiveProduct, getProduct } from "../../api/product.api";

export default function ProductArchivePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState(false);

  useEffect(() => {
    let active = true;

    getProduct(id)
      .then((data) => {
        if (active) setProduct(data.product);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handleArchive = async () => {
    setError("");
    setArchiving(true);
    try {
      await archiveProduct(id);
      navigate("/agent/products");
    } catch (err) {
      setError(err.message);
    } finally {
      setArchiving(false);
    }
  };

  const categoryName = product?.category?.name || "No category";
  const alreadyArchived = product && !product.isAvailable;

  return (
    <section className="agent-page">
      <h1>Archive product</h1>
      <p className="agent-subtitle">
        Bakery workspace · <Link to="/agent/products">Products</Link>
      </p>

      {loading && <p>Loading...</p>}

      {!loading && !product && (
        <div className="agent-card">
          <p className="agent-msg error">{error || "Product not found"}</p>
          <Link className="agent-back" to="/agent/products">
            Back to products
          </Link>
        </div>
      )}

      {product && (
        <div className="agent-card">
          <h2>Archive “{product.name}”?</h2>

          <p className="agent-warning">
            This product will leave the public catalog, search and category results.
            Clients will no longer be able to add it to their cart.
          </p>

          <p className="agent-product-summary">
            {product.name} · {categoryName} · {product.price.toFixed(2)} TND
          </p>

          {alreadyArchived && (
            <p className="agent-msg error">This product is already archived.</p>
          )}
          {error && <p className="agent-msg error">{error}</p>}

          <p>Past orders stay unchanged.</p>
          <p className="agent-hint">
            Archiving never deletes a product. You can restore it later from the Products list.
          </p>

          <div className="agent-buttons">
            <button
              type="button"
              className="agent-btn agent-btn-light"
              onClick={() => navigate("/agent/products")}
            >
              Keep available
            </button>
            <button
              type="button"
              className="agent-btn"
              onClick={handleArchive}
              disabled={archiving || alreadyArchived}
            >
              {archiving ? "Archiving..." : "Archive product"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
