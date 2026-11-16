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
