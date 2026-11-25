// Calls to the /api/categories routes of the back end.
import { apiFetch } from "./client";

// US-11: create a category. data = { name, description }
export const createCategory = async (data) => {
  return apiFetch("/api/categories", { method: "POST", body: data });
};

// US-10 / US-14: get all categories (agent list, and the product form <select>)
export const listCategories = async () => {
  const data = await apiFetch("/api/categories");
  return data.categories; // the API answers { categories: [...] }
};

// US-12: one category, with the products that use it
export const getCategory = (id) => apiFetch(`/api/categories/${id}`);

// US-12: edit a category. data = { name, description }
export const updateCategory = (id, data) =>
  apiFetch(`/api/categories/${id}`, { method: "PATCH", body: data });

// US-13: delete a category that has no products
export const deleteCategory = (id) =>
  apiFetch(`/api/categories/${id}`, { method: "DELETE" });
