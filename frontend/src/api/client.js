import { getItem, removeItem } from '../utils/storage';

const BASE = import.meta.env.VITE_API_URL ?? '';

// const BASE = 'http://localhost:5000'

async function request(endpoint, options = {}) {
  const { skipAuthRedirect, ...fetchOptions } = options;
  const token = getItem('token');
  const headers = { ...fetchOptions.headers };
  if (!(fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${endpoint}`, { ...fetchOptions, headers });

  if (res.status === 401 && !skipAuthRedirect) {
    // session expired/revoked: drop every piece of cached identity
    removeItem('token');
    removeItem('auth');
    removeItem('user');
    window.location.hash = '#/login';
    throw new Error('Unauthorized');
  }

  const data = res.status === 204 ? null : await res.json();
  if (!res.ok) throw data;
  return data;
}

export const api = {
  get:    (url, opts) => request(url, { method: 'GET', ...opts }),
  post:   (url, body, opts) => request(url, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body), ...opts }),
  put:    (url, body, opts) => request(url, { method: 'PUT', body: JSON.stringify(body), ...opts }),
  patch:  (url, body, opts) => request(url, { method: 'PATCH', body: JSON.stringify(body), ...opts }),
  delete: (url, opts) => request(url, { method: 'DELETE', ...opts }),
};
