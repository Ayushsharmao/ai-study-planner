const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` 
  : '/api';

// Token Management
export function getAuthToken() {
  return localStorage.getItem('studymind_token') || '';
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('studymind_token', token);
  } else {
    localStorage.removeItem('studymind_token');
  }
}

async function handleResponse(response) {
  if (!response.ok) {
    const errorText = await response.text();
    let errorJson;
    try {
      errorJson = JSON.parse(errorText);
    } catch {
      // not json
    }
    const message = errorJson?.error || `HTTP ${response.status}: ${errorText}`;
    
    // If token expired or unauthorized, trigger auth prompt
    if (response.status === 401 && !window.location.pathname.includes('/login')) {
      setAuthToken('');
    }
    
    throw new Error(message);
  }
  return response.json();
}

function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// --- Public Settings ---
export async function getPublicSettings() {
  const res = await fetch(`${API_BASE}/public-settings`);
  const data = await handleResponse(res);
  return data.data;
}

// --- Authentication ---
export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await handleResponse(res);
  setAuthToken(data.token);
  return data;
}

export async function register(name, email, password, age) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, age: Number(age) || 20 })
  });
  const data = await handleResponse(res);
  setAuthToken(data.token);
  return data;
}

export async function googleAuth(email, name, age) {
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, age: Number(age) || 20 })
  });
  const data = await handleResponse(res);
  setAuthToken(data.token);
  return data;
}

export async function getMe() {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    const data = await handleResponse(res);
    return data.user;
  } catch (err) {
    setAuthToken('');
    return null;
  }
}

export function logout() {
  setAuthToken('');
}

// --- Admin Endpoints ---
export async function getAdminStats() {
  const res = await fetch(`${API_BASE}/admin/stats`, {
    headers: getAuthHeaders()
  });
  const data = await handleResponse(res);
  return data.data;
}

export async function getAdminUsers() {
  const res = await fetch(`${API_BASE}/admin/users`, {
    headers: getAuthHeaders()
  });
  const data = await handleResponse(res);
  return data.data;
}

export async function updateUserRole(userId, role) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ role })
  });
  return handleResponse(res);
}

export async function deleteUser(userId) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export async function getAdminSiteSettings() {
  const res = await fetch(`${API_BASE}/admin/settings`, {
    headers: getAuthHeaders()
  });
  const data = await handleResponse(res);
  return data.data;
}

export async function updateAdminSiteSettings(settings) {
  const res = await fetch(`${API_BASE}/admin/settings`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(settings)
  });
  const data = await handleResponse(res);
  return data.data;
}

// --- Student Study Data ---
// Subjects
export async function getSubjects() {
  const res = await fetch(`${API_BASE}/subjects`, { headers: getAuthHeaders() });
  const data = await handleResponse(res);
  return data.data;
}

export async function createSubject(subject) {
  const res = await fetch(`${API_BASE}/subjects`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(subject)
  });
  const data = await handleResponse(res);
  return data.data;
}

export async function updateSubject(id, updates) {
  const res = await fetch(`${API_BASE}/subjects/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  const data = await handleResponse(res);
  return data.data;
}

export async function deleteSubject(id) {
  const res = await fetch(`${API_BASE}/subjects/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

// Deadlines
export async function getDeadlines() {
  const res = await fetch(`${API_BASE}/deadlines`, { headers: getAuthHeaders() });
  const data = await handleResponse(res);
  return data.data;
}

export async function createDeadline(deadline) {
  const res = await fetch(`${API_BASE}/deadlines`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(deadline)
  });
  const data = await handleResponse(res);
  return data.data;
}

export async function updateDeadline(id, updates) {
  const res = await fetch(`${API_BASE}/deadlines/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  const data = await handleResponse(res);
  return data.data;
}

export async function toggleDeadline(id) {
  const res = await fetch(`${API_BASE}/deadlines/${id}/toggle`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
  const data = await handleResponse(res);
  return data.data;
}

export async function deleteDeadline(id) {
  const res = await fetch(`${API_BASE}/deadlines/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

// Availability
export async function getAvailability() {
  const res = await fetch(`${API_BASE}/availability`, { headers: getAuthHeaders() });
  const data = await handleResponse(res);
  return data.data;
}

export async function updateAvailability(availability) {
  const res = await fetch(`${API_BASE}/availability`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(availability)
  });
  const data = await handleResponse(res);
  return data.data;
}

// Schedule
export async function getSchedule(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = query ? `${API_BASE}/schedule?${query}` : `${API_BASE}/schedule`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  const data = await handleResponse(res);
  return data.data;
}

export async function generateSchedule(options = {}) {
  const res = await fetch(`${API_BASE}/schedule/generate`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(options)
  });
  return handleResponse(res);
}

export async function toggleSession(id, actualMinutesStudied) {
  const res = await fetch(`${API_BASE}/schedule/${id}/toggle`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ actualMinutesStudied })
  });
  const data = await handleResponse(res);
  return data.data;
}

export async function rebalanceSchedule() {
  const res = await fetch(`${API_BASE}/schedule/rebalance`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

export async function deleteSession(id) {
  const res = await fetch(`${API_BASE}/schedule/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return handleResponse(res);
}

// Analytics
export async function getAnalytics() {
  const res = await fetch(`${API_BASE}/analytics`, { headers: getAuthHeaders() });
  const data = await handleResponse(res);
  return data.data;
}
