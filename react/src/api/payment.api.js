import { apiFetch } from "./client";

export const payOrder = (orderId) =>
  apiFetch(`/api/payments/${orderId}/pay`, { method: "POST" });

export const getPaymentStatus = (orderId) => apiFetch(`/api/payments/${orderId}`);

export const cancelPayment = (orderId) =>
  apiFetch(`/api/payments/${orderId}/cancel`, { method: "POST" });
