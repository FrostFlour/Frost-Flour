// US-10: an Agent sees every category, how many products use it, and can edit or delete it.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listCategories } from "../../api/category.api";

function productLabel(count) {
  return count === 1 ? "1 product" : `${count} products`;
}

export default function CategoryListPage() {
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    listCategories()
      .then((rows) => {
        if (active) setCategories(rows);
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
  }, []);

  const search = query.trim().toLowerCase();
  const visible = search
    ? categories.filter((category) =>
        `${category.name} ${category.description || ""}`.toLowerCase().includes(search)
      )
    : categories;

  return (
    <section className="agent-page">
      <div className="agent-page-head">
        <div>
          <h1>Categories</h1>
          <p className="agent-subtitle">Bakery workspace</p>
        </div>
        <Link to="/agent/categories/new" className="agent-btn">
          Create category
        </Link>
      </div>

      {error && <p className="agent-msg error">{error}</p>}

      <div className="agent-toolbar">
        <input
          className="agent-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search categories"
          aria-label="Search categories"
        />
      </div>

      {loading && <p>Loading...</p>}

      {!loading && !error && visible.length === 0 && (
        <p className="agent-empty">
          {categories.length === 0
            ? "No categories yet. Create the first one so products have a home."
            : "No category matches this search."}
        </p>
      )}

      {!loading && visible.length > 0 && (
        <div className="agent-table-wrap">
          <table className="agent-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>Products</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((category) => (
                <tr key={category._id}>
                  <td>{category.name}</td>
                  <td className="agent-cell-desc">
                    {category.description || <span className="agent-muted">No description</span>}
                  </td>
                  <td>{productLabel(category.productCount || 0)}</td>
                  <td>
                    <div className="agent-actions">
                      <Link to={`/agent/categories/${category._id}/edit`}>Edit</Link>
                      <Link className="danger" to={`/agent/categories/${category._id}/delete`}>
                        Delete
                      </Link>
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
