import { apiFetch } from "./client";

export const getCart = () => apiFetch("/api/cart");

export const addCartItem = (productId) =>
  apiFetch(`/api/cart/items/${productId}`, { method: "POST" });

export const removeCartItem = (productId) =>
  apiFetch(`/api/cart/items/${productId}`, { method: "DELETE" });

export const clearCart = () => apiFetch("/api/cart", { method: "DELETE" });
