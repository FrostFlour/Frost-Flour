// US-14: form used by an Agent to create a product (with an optional image).
import { useEffect, useRef, useState } from "react";
import { listCategories } from "../../api/category.api";
import { createProduct } from "../../api/product.api";

const emptyForm = { name: "", description: "", price: "", category: "" };

export default function ProductFormPage() {
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null); // the chosen File, or null
  const [categories, setCategories] = useState([]); // options of the <select>
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInput = useRef(null); // lets us empty the file input after a success

  // When the page appears: load the categories for the <select>
  // (GET /api/categories, added in US-14 task 6)
  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch((err) => setError(`Could not load the categories: ${err.message}`));
  }, []); // [] = run only once

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Called when the agent picks a file. We check type and size right away
  // so the agent sees the problem before sending (the back end checks again).
  const handleImageChange = (e) => {
    const file = e.target.files[0] || null;
    setError("");
    if (file && !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("The image must be a JPG, PNG or WebP file");
    } else if (file && file.size > 2 * 1024 * 1024) {
      setError("The image must be 2 MB or less");
    }
    setImage(file);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImage(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // A file cannot be sent as JSON, so we build a FormData
    // (= the "multipart/form-data" format that multer reads on the server).
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("category", form.category);
    if (image) formData.append("image", image); // same name as upload.single("image")

    try {
      const data = await createProduct(formData);
      setSuccess(`Product "${data.product.name}" created`);
      resetForm();
    } catch (err) {
      // On error we do NOT reset: every field (and the chosen image) is kept,
      // so the agent only fixes the wrong one (backlog rule).
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="agent-page">
      <h1>Create product</h1>
      <p className="agent-subtitle">Bakery workspace</p>

      <div className="agent-columns">
        <div className="agent-card">
          {error && <p className="agent-msg error">{error}</p>}
          {success && <p className="agent-msg success">{success}</p>}

          <form className="agent-form" onSubmit={handleSubmit}>
            <label>
              Product name
              <input name="name" value={form.name} onChange={handleChange} />
            </label>

            <label>
              Description
              <textarea name="description" rows={3} value={form.description} onChange={handleChange} />
            </label>

            <div className="agent-row">
              <label>
                Price
                <input type="number" name="price" step="0.01" value={form.price} onChange={handleChange} />
                <span className="agent-hint">Must be greater than zero</span>
              </label>

              <label>
                Category
                {/* One <option> per category; its value is the category _id */}
                <select name="category" value={form.category} onChange={handleChange}>
                  <option value="">Choose a category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="agent-image-box">
              <label>
                Product image (optional)
                <span className="agent-hint">JPG, PNG or WebP · Up to 2 MB</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  ref={fileInput}
                  onChange={handleImageChange}
                />
              </label>
            </div>

            <div className="agent-buttons">
              <button type="submit" className="agent-btn" disabled={loading}>
                {loading ? "Creating..." : "Create product"}
              </button>
              <button type="button" className="agent-btn agent-btn-light" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>

        <aside className="agent-info">
          <h3>Ready to sell</h3>
          <p>New products are available by default.</p>
          <p>You can add or replace a product image later. Without one, the catalog shows the default pastry image.</p>
        </aside>
      </div>
    </section>
  );
}
