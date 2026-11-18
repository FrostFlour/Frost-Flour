// US-11: form used by an Agent to create a category.
import { useState } from "react";
import { Link } from "react-router-dom";
import { createCategory } from "../../api/category.api";

export default function CategoryFormPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Cancel = empty the form and the messages
  const handleCancel = () => {
    setName("");
    setDescription("");
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // no page reload
    setError("");
    setSuccess("");

    // Quick check in the browser (the back end checks again, it is the real rule)
    if (name.trim() === "") {
      setError("name is required");
      return;
    }

    setLoading(true);
    try {
      // POST /api/categories
      const data = await createCategory({ name, description });
      setSuccess(`Category "${data.category.name}" created`);
      setName("");
      setDescription("");
    } catch (err) {
      setError(err.message); // e.g. "A category with this name already exists"
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="agent-page">
      <h1>Create category</h1>
      <p className="agent-subtitle">
        Bakery workspace · <Link to="/agent/categories">All categories</Link>
      </p>

      <div className="agent-columns">
        <div className="agent-card">
          <h2>Give your pastries a home.</h2>
          {error && <p className="agent-msg error">{error}</p>}
          {success && <p className="agent-msg success">{success}</p>}

          <form className="agent-form" onSubmit={handleSubmit}>
            <label>
              Category name
              {/* maxLength stops the user from typing more than 50 characters */}
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={50} />
              <span className="agent-hint">Maximum 50 characters · Must be unique</span>
            </label>

            <label>
              Description (optional)
              <input value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>

            <div className="agent-buttons">
              <button type="submit" className="agent-btn" disabled={loading}>
                {loading ? "Creating..." : "Create category"}
              </button>
              <button type="button" className="agent-btn agent-btn-light" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>

        <aside className="agent-info">
          <h3>Simple organization</h3>
          <p>Create a category, then link products to it from the product form.</p>
        </aside>
      </div>
    </section>
  );
}
