// US-14 / US-16: form used by an Agent to create or edit a product
// (with an optional image). The edit mode is used from the products list.
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../../api/client";
import { listCategories } from "../../api/category.api";
import { createProduct, getProduct, updateProduct } from "../../api/product.api";

const emptyForm = { name: "", description: "", price: "", category: "" };

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null); // the chosen File, or null
  const [product, setProduct] = useState(null); // current product in edit mode
  const [loadedId, setLoadedId] = useState(null); // id whose data has been loaded
  const [categories, setCategories] = useState([]); // options of the <select>
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInput = useRef(null); // lets us empty the file input after a success

  // When the page appears: load the categories for the <select>.
  // In edit mode we also load the product so all fields are pre-filled.
  useEffect(() => {
    let active = true;

    Promise.all([listCategories(), isEdit ? getProduct(id) : Promise.resolve(null)])
      .then(([rows, data]) => {
        if (!active) return;
        setCategories(rows);
        setProduct(data?.product || null);
        if (!data?.product) return;

        const current = data.product;
        setForm({
          name: current.name || "",
          description: current.description || "",
          price: String(current.price ?? ""),
          category:
            (typeof current.category === "object" ? current.category?._id : current.category) || "",
        });
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoadedId(isEdit ? id : null);
      });

    return () => {
      active = false;
    };
  }, [id, isEdit]);

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
    setSaving(true);

    // A file cannot be sent as JSON, so we build a FormData
    // (= the "multipart/form-data" format that multer reads on the server).
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("category", form.category);
    if (image) formData.append("image", image); // same name as upload.single("image")

    try {
      if (isEdit) {
        await updateProduct(id, formData);
        navigate("/agent/products"); // the updated product appears in the list
        return;
      }

      const data = await createProduct(formData);
      setSuccess(`Product "${data.product.name}" created`);
      resetForm();
    } catch (err) {
      // On error we do NOT reset: every field (and the chosen image) is kept,
      // so the agent only fixes the wrong one (backlog rule).
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const pageLoading = isEdit && loadedId !== id;
  const notFound = isEdit && !pageLoading && !product;

  return (
    <section className="agent-page">
      <h1>{isEdit ? "Edit product" : "Create product"}</h1>
      <p className="agent-subtitle">
        Bakery workspace · <Link to="/agent/products">Products</Link>
      </p>

      {pageLoading && <p>Loading...</p>}

      {notFound && (
        <div className="agent-card">
          <p className="agent-msg error">{error || "Product not found"}</p>
          <Link className="agent-back" to="/agent/products">
            Back to products
          </Link>
        </div>
      )}

      {!pageLoading && !notFound && (
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
                <strong>Image</strong>
                <span className="agent-hint">
                  {isEdit && product?.image ? "Image currently uploaded" : "No image currently uploaded"}
                </span>
                <span className="agent-hint">JPG, PNG or WebP · Up to 2 MB</span>
                <label className="agent-file-button">
                  {product?.image ? "Replace image" : "Add image"}
                  <input
                    className="agent-file-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    ref={fileInput}
                    onChange={handleImageChange}
                  />
                </label>
                {isEdit && product?.image && (
                  <div className="agent-current-image">
                    <img src={`${API_BASE_URL}${product.image}`} alt={product.name} />
                    <span className="agent-hint">Leave empty to keep this image.</span>
                  </div>
                )}
              </div>

              <div className="agent-buttons">
                <button type="submit" className="agent-btn" disabled={saving}>
                  {saving
                    ? isEdit ? "Saving..." : "Creating..."
                    : isEdit ? "Save product" : "Create product"}
                </button>
                <button
                  type="button"
                  className="agent-btn agent-btn-light"
                  onClick={() => (isEdit ? navigate("/agent/products") : resetForm())}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <aside className="agent-info">
            <h3>{isEdit ? "Keep the catalog accurate" : "Ready to sell"}</h3>
            <p>
              {isEdit
                ? "Changes appear in the catalog immediately."
                : "New products are available by default."}
            </p>
            {isEdit && <p>Existing orders keep the name and price recorded at purchase.</p>}
            <p>You can add or replace a product image later. Without one, the catalog shows the default pastry image.</p>
          </aside>
        </div>
      )}
    </section>
  );
}
