const API_BASE = '/api';

async function handleResponse(response) {
  if (!response.ok) {
    const errorText = await response.text();
    let errorJson;
    try {
      errorJson = JSON.parse(errorText);
    } catch {
      // not json
    }
    throw new Error(errorJson?.error || `HTTP ${response.status}: ${errorText}`);
  }
  return response.json();
}

// Subjects
export async function getSubjects() {
  const res = await fetch(`${API_BASE}/subjects`);
  const data = await handleResponse(res);
  return data.data;
}

export async function createSubject(subject) {
  const res = await fetch(`${API_BASE}/subjects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subject)
  });
  const data = await handleResponse(res);
  return data.data;
}

export async function updateSubject(id, updates) {
  const res = await fetch(`${API_BASE}/subjects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  const data = await handleResponse(res);
  return data.data;
}

export async function deleteSubject(id) {
  const res = await fetch(`${API_BASE}/subjects/${id}`, {
    method: 'DELETE'
  });
  return handleResponse(res);
}

// Deadlines
export async function getDeadlines() {
  const res = await fetch(`${API_BASE}/deadlines`);
  const data = await handleResponse(res);
  return data.data;
}

export async function createDeadline(deadline) {
  const res = await fetch(`${API_BASE}/deadlines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(deadline)
  });
  const data = await handleResponse(res);
  return data.data;
}

export async function updateDeadline(id, updates) {
  const res = await fetch(`${API_BASE}/deadlines/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  const data = await handleResponse(res);
  return data.data;
}

export async function toggleDeadline(id) {
  const res = await fetch(`${API_BASE}/deadlines/${id}/toggle`, {
    method: 'PATCH'
  });
  const data = await handleResponse(res);
  return data.data;
}

export async function deleteDeadline(id) {
  const res = await fetch(`${API_BASE}/deadlines/${id}`, {
    method: 'DELETE'
  });
  return handleResponse(res);
}

// Availability
export async function getAvailability() {
  const res = await fetch(`${API_BASE}/availability`);
  const data = await handleResponse(res);
  return data.data;
}

export async function updateAvailability(availability) {
  const res = await fetch(`${API_BASE}/availability`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(availability)
  });
  const data = await handleResponse(res);
  return data.data;
}

// Schedule
export async function getSchedule(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = query ? `${API_BASE}/schedule?${query}` : `${API_BASE}/schedule`;
  const res = await fetch(url);
  const data = await handleResponse(res);
  return data.data;
}

export async function generateSchedule(options = {}) {
  const res = await fetch(`${API_BASE}/schedule/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options)
  });
  return handleResponse(res);
}

export async function toggleSession(id, actualMinutesStudied) {
  const res = await fetch(`${API_BASE}/schedule/${id}/toggle`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actualMinutesStudied })
  });
  const data = await handleResponse(res);
  return data.data;
}

export async function rebalanceSchedule() {
  const res = await fetch(`${API_BASE}/schedule/rebalance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  return handleResponse(res);
}

export async function deleteSession(id) {
  const res = await fetch(`${API_BASE}/schedule/${id}`, {
    method: 'DELETE'
  });
  return handleResponse(res);
}

// Analytics
export async function getAnalytics() {
  const res = await fetch(`${API_BASE}/analytics`);
  const data = await handleResponse(res);
  return data.data;
}

// Reset Demo Data
export async function resetDemoData() {
  const res = await fetch(`${API_BASE}/reset`, {
    method: 'POST'
  });
  return handleResponse(res);
}
