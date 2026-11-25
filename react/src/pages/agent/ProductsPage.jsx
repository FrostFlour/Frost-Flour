// US-18: an Agent sees every product, archived ones included, and can open
// the edit form (US-16) or archive a product (US-17).
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../api/client";
import { listAllProducts } from "../../api/product.api";

const FILTERS = [
  { value: "all", label: "All products" },
  { value: "available", label: "Available" },
  { value: "archived", label: "Archived" },
];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadProducts = () => {
    listAllProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const retry = () => {
    setError("");
    setLoading(true);
    loadProducts();
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const search = query.trim().toLowerCase();
  const visible = products
    .filter((product) => {
      if (filter === "available") return product.isAvailable;
      if (filter === "archived") return !product.isAvailable;
      return true;
    })
    .filter((product) =>
      !search
        ? true
        : `${product.name} ${product.description || ""} ${product.category?.name || ""}`
            .toLowerCase()
            .includes(search)
    );

  return (
    <section className="agent-page">
      <div className="agent-page-head">
        <div>
          <h1>Products</h1>
          <p className="agent-subtitle">Bakery workspace · Products</p>
        </div>
        <Link to="/agent/products/new" className="agent-btn">
          + Create product
        </Link>
      </div>

      {error && (
        <p className="agent-msg error">
          {error}{" "}
          <button type="button" className="agent-retry" onClick={retry}>
            Retry
          </button>
        </p>
      )}

      <div className="agent-toolbar">
        <div className="agent-tabs">
          {FILTERS.map((tab) => (
            <button
              type="button"
              key={tab.value}
              className={`agent-tab ${filter === tab.value ? "active" : ""}`}
              onClick={() => setFilter(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <input
          className="agent-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products"
          aria-label="Search products"
        />
      </div>

      {loading && <p>Loading...</p>}

      {!loading && !error && visible.length === 0 && (
        <p className="agent-empty">
          {products.length === 0 ? (
            <>
              No products yet. <Link to="/agent/products/new">Create the first one</Link>.
            </>
          ) : (
            "No product matches this filter."
          )}
        </p>
      )}

      {!loading && visible.length > 0 && (
        <div className="agent-table-wrap">
          <table className="agent-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((product) => (
                <tr key={product._id}>
                  <td>
                    <div className="agent-product-cell">
                      {product.image ? (
                        <img src={`${API_BASE_URL}${product.image}`} alt="" />
                      ) : (
                        <span className="agent-thumb-placeholder" aria-hidden="true">
                          🧁
                        </span>
                      )}
                      <span>{product.name}</span>
                    </div>
                  </td>
                  <td>{product.category?.name || <span className="agent-muted">No category</span>}</td>
                  <td>{product.price.toFixed(2)} TND</td>
                  <td>
                    <span className={`agent-badge ${product.isAvailable ? "available" : "archived"}`}>
                      {product.isAvailable ? "Available" : "Archived"}
                    </span>
                  </td>
                  <td>
                    <div className="agent-actions">
                      <Link to={`/agent/products/${product._id}/edit`}>Edit</Link>
                      {product.isAvailable ? (
                        <Link to={`/agent/products/${product._id}/archive`}>Archive</Link>
                      ) : (
                        <span className="agent-muted">Archived</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
