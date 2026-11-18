// US-11 / US-14: calls to the /api/categories routes of the back end.
import { apiFetch } from "./client";

// US-11: create a category. data = { name, description }
export const createCategory = async (data) => {
  return apiFetch("/api/categories", { method: "POST", body: data });
};

// US-14: get all categories (used by the <select> of the product form)
export const listCategories = async () => {
  const data = await apiFetch("/api/categories");
  return data.categories; // the API answers { categories: [...] }
};
