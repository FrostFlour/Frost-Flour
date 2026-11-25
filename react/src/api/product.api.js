// US-14 / US-16 / US-17 / US-18: calls to the /api/products routes.
import { apiFetch } from "./client";

// US-14: create a product.
// formData is a FormData object (not JSON) because it can contain an image file.
// apiFetch sees it is a FormData and lets the browser set the right
// "multipart/form-data" header by itself.
export const createProduct = async (formData) => {
  return apiFetch("/api/products", { method: "POST", body: formData });
};

// US-18: all products, archived ones included (Agent only).
export const listAllProducts = async () => {
  const data = await apiFetch("/api/products/all");
  return data.products;
};

// US-16: one product with its current fields, used to fill the edit form.
export const getProduct = (id) => apiFetch(`/api/products/${id}`);

// US-16: edit a product. formData uses the same fields as createProduct.
export const updateProduct = (id, formData) =>
  apiFetch(`/api/products/${id}`, { method: "PATCH", body: formData });

// US-17: archive a product (available -> archived, without deleting it).
export const archiveProduct = (id) =>
  apiFetch(`/api/products/${id}/archive`, { method: "PATCH" });
