// The only place in the front end that knows where the API lives.
// Value comes from react/.env.development (npm run dev) or react/.env.production (npm run build).
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

// Usage: apiFetch('/health')  or  apiFetch('/api/categories', { method: 'POST', body: { name: 'Cakes' } })
export async function apiFetch(path, options = {}) {
  const { body, headers, ...rest } = options;
  const isFormData = body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...rest,
    headers: isFormData || body === undefined ? headers : { 'Content-Type': 'application/json', ...headers },
    body: isFormData || body === undefined ? body : JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return data;
}
