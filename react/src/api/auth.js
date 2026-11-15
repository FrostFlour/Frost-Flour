const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}/api/auth${endpoint}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong. Please try again.');
  }

  return data;
}

export function registerUser(userData) {
  return request('/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export function loginUser(credentials) {
  return request('/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function logoutUser() {
  return request('/logout', { method: 'POST' });
}

export function getCurrentUser() {
  return request('/me');
}
