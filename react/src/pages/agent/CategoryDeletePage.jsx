// US-13: an Agent confirms before a category is deleted.
// A category that still has products cannot be deleted: every product needs one.
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deleteCategory, getCategory } from "../../api/category.api";

export default function CategoryDeletePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;

    getCategory(id)
      .then((data) => {
        if (active) setCategory(data.category);
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

  const handleDelete = async () => {
    setError("");
    setDeleting(true);
    try {
      await deleteCategory(id);
      navigate("/agent/categories");
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const productCount = category?.productCount || 0;
  const blocked = productCount > 0;

  return (
    <section className="agent-page">
      <h1>Delete category</h1>
      <p className="agent-subtitle">
        Bakery workspace · <Link to="/agent/categories">All categories</Link>
      </p>

      {loading && <p>Loading...</p>}

      {!loading && !category && (
        <div className="agent-card">
          <p className="agent-msg error">{error || "Category not found"}</p>
          <Link className="agent-back" to="/agent/categories">
            Back to categories
          </Link>
        </div>
      )}

      {category && (
        <div className="agent-card">
          <h2>Delete “{category.name}”?</h2>

          {blocked ? (
            <p className="agent-warning">
              This category is used by {productCount === 1 ? "1 product" : `${productCount} products`}.
              Move those products to another category before deleting it.
            </p>
          ) : (
            <p>This category has no products. Deleting it cannot be undone.</p>
          )}

          {error && <p className="agent-msg error">{error}</p>}

          <div className="agent-buttons">
            <button type="button" className="agent-btn agent-btn-light" onClick={() => navigate("/agent/categories")}>
              Keep category
            </button>
            <button type="button" className="agent-btn" onClick={handleDelete} disabled={blocked || deleting}>
              {deleting ? "Deleting..." : "Delete category"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
