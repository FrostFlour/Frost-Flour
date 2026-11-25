import { apiFetch } from "./client";

export const getMe = async () => {
  return apiFetch("/api/users/me");
};

export const updateMe = async (data) => {
  return apiFetch("/api/users/me", {
    method: "PUT",
    body: data,
  });
};

export const updateClient = async (data) => {
  return apiFetch("/api/users/clients/me", {
    method: "PUT",
    body: data,
  });
};

export const changePassword = async (data) => {
  return apiFetch("/api/users/me/password", {
    method: "PUT",
    body: data,
  });
};

export const listClients = async () => {
  return apiFetch("/api/users/clients");
// US-08: an Agent creates another Agent account.
// data = { firstName, lastName, email, phone, password }
export const createAgent = async (data) => {
  return apiFetch("/api/users/agents", {
    method: "POST",
    body: data, // apiFetch turns this object into JSON
  });
};
