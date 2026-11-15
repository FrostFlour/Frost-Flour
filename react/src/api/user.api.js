import { apiFetch } from "./client";

export const getMe = async () => {
  return apiFetch("/api/users/me");
};
