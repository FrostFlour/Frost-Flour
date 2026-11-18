// US-12: an Agent edits the name and description of one category.
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCategory, updateCategory } from "../../api/category.api";

export default function CategoryEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [productCount, setProductCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    getCategory(id)
      .then((data) => {
        if (!active) return;
        setName(data.category.name);
        setDescription(data.category.description || "");
        setProductCount(data.category.productCount || 0);
        setProducts(data.products || []);
        setReady(true);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (name.trim() === "") {
      setError("name is required");
      return;
    }

    setSaving(true);
    try {
      await updateCategory(id, { name, description });
      navigate("/agent/categories");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const hiddenCount = Math.max(productCount - products.length, 0);

  return (
    <section className="agent-page">
      <h1>Edit category</h1>
      <p className="agent-subtitle">
        Bakery workspace · <Link to="/agent/categories">All categories</Link>
      </p>

      {loading && <p>Loading...</p>}

      {!loading && !ready && (
        <div className="agent-card">
          <p className="agent-msg error">{error || "Category not found"}</p>
          <Link className="agent-back" to="/agent/categories">
            Back to categories
          </Link>
        </div>
      )}

      {!loading && ready && (
        <div className="agent-columns">
          <div className="agent-card">
            <h2>Update this category.</h2>
            {error && <p className="agent-msg error">{error}</p>}

            <form className="agent-form" onSubmit={handleSubmit}>
              <label>
                Category name
                <input value={name} onChange={(event) => setName(event.target.value)} maxLength={50} />
                <span className="agent-hint">Maximum 50 characters · Must be unique</span>
              </label>

              <label>
                Description (optional)
                <input value={description} onChange={(event) => setDescription(event.target.value)} />
              </label>

              <div className="agent-buttons">
                <button type="submit" className="agent-btn" disabled={saving}>
                  {saving ? "Saving..." : "Update category"}
                </button>
                <button type="button" className="agent-btn agent-btn-light" onClick={() => navigate("/agent/categories")}>
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <aside className="agent-info">
            <h3>Products in this category</h3>
            {productCount === 0 ? (
              <p>No products use this category yet.</p>
            ) : (
              <>
                <p>
                  {productCount === 1 ? "1 product is" : `${productCount} products are`} linked to it.
                  Changing the name does not move them.
                </p>
                <ul>
                  {products.map((product) => (
                    <li key={product._id}>{product.name}</li>
                  ))}
                </ul>
                {hiddenCount > 0 && <p>{hiddenCount} more not shown.</p>}
              </>
            )}
          </aside>
        </div>
      )}
    </section>
  );
}
