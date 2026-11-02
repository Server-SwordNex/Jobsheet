export function getItem(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return localStorage.getItem(key) || null;
  }
}

export function setItem(key, value) {
  const stored = typeof value === 'string' ? value : JSON.stringify(value);
  localStorage.setItem(key, stored);
}

export function removeItem(key) {
  localStorage.removeItem(key);
}

export function clear() {
  localStorage.clear();
}
