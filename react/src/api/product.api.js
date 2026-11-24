// US-14: calls to the /api/products routes of the back end.
import { apiFetch } from "./client";

// US-14: create a product.
// formData is a FormData object (not JSON) because it can contain an image file.
// apiFetch sees it is a FormData and lets the browser set the right
// "multipart/form-data" header by itself.
export const createProduct = async (formData) => {
  return apiFetch("/api/products", { method: "POST", body: formData });
};

export const getProduct = (id) => apiFetch(`/api/products/${id}`);
