const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'حدث خطأ غير متوقع، حاول مرة أخرى.');
    err.status = data.status;
    err.httpStatus = res.status;
    throw err;
  }
  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  getTests: (token) => request('/tests', { token }),
  getTest: (id, token) => request(`/tests/${id}`, { token }),
  submitTest: (id, answers, token) =>
    request(`/tests/${id}/submit`, { method: 'POST', body: { answers }, token }),
  getMyResults: (token) => request('/results/me', { token }),
  getPendingUsers: (token) => request('/admin/users/pending', { token }),
  getAllUsers: (token) => request('/admin/users', { token }),
  approveUser: (id, token) => request(`/admin/users/${id}/approve`, { method: 'POST', token }),
  rejectUser: (id, token) => request(`/admin/users/${id}/reject`, { method: 'POST', token }),
};
