/**
 * EduGuide AI - Frontend API Client
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function handleResponse(res) {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export async function getHealth() {
  const res = await fetch(`${BASE_URL}/health`);
  return handleResponse(res);
}

export async function sendMessage(message, sessionId, conversationHistory = [], studentProfile = null, options = {}) {
  const { modelPreference = 'gemini', attachments = [] } = options;
  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionId, conversationHistory, studentProfile, modelPreference, attachments })
  });
  return handleResponse(res);
}

export async function sendFeedback(data) {
  const res = await fetch(`${BASE_URL}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

export async function getScholarships(filters = {}) {
  const params = new URLSearchParams();
  if (filters.country && filters.country !== 'All') params.append('country', filters.country);
  if (filters.degree && filters.degree !== 'All') params.append('degree', filters.degree);
  if (filters.funding && filters.funding !== 'All') params.append('funding', filters.funding);
  if (filters.field && filters.field !== 'All') params.append('field', filters.field);
  if (filters.search) params.append('search', filters.search);

  const res = await fetch(`${BASE_URL}/scholarships?${params.toString()}`);
  return handleResponse(res);
}

export async function matchScholarships(studentProfile) {
  const res = await fetch(`${BASE_URL}/scholarships/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studentProfile)
  });
  return handleResponse(res);
}

export async function createScholarship(scholarshipData) {
  const res = await fetch(`${BASE_URL}/scholarships`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scholarshipData)
  });
  return handleResponse(res);
}

export async function getUniversities(filters = {}) {
  const params = new URLSearchParams();
  if (filters.country && filters.country !== 'All') params.append('country', filters.country);
  if (filters.search) params.append('search', filters.search);

  const res = await fetch(`${BASE_URL}/universities?${params.toString()}`);
  return handleResponse(res);
}

export async function getPlacements(filters = {}) {
  const params = new URLSearchParams();
  if (filters.country && filters.country !== 'All') params.append('country', filters.country);
  if (filters.university && filters.university !== 'All') params.append('university', filters.university);
  if (filters.search) params.append('search', filters.search);

  const res = await fetch(`${BASE_URL}/placements?${params.toString()}`);
  return handleResponse(res);
}

export async function getCourses(filters = {}) {
  const params = new URLSearchParams();
  if (filters.field && filters.field !== 'All') params.append('field', filters.field);
  if (filters.degree && filters.degree !== 'All') params.append('degree', filters.degree);
  if (filters.country && filters.country !== 'All') params.append('country', filters.country);
  if (filters.search) params.append('search', filters.search);

  const res = await fetch(`${BASE_URL}/courses?${params.toString()}`);
  return handleResponse(res);
}

export async function getExams(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);

  const res = await fetch(`${BASE_URL}/exams?${params.toString()}`);
  return handleResponse(res);
}

export async function getProfile() {
  const res = await fetch(`${BASE_URL}/profile`);
  return handleResponse(res);
}

export async function saveProfile(profile) {
  const res = await fetch(`${BASE_URL}/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });
  return handleResponse(res);
}

export async function getAnalytics() {
  const res = await fetch(`${BASE_URL}/analytics`);
  return handleResponse(res);
}

export async function getUnanswered(status = 'all') {
  const res = await fetch(`${BASE_URL}/unanswered?status=${status}`);
  return handleResponse(res);
}

export async function updateUnanswered(id, status) {
  const res = await fetch(`${BASE_URL}/unanswered/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return handleResponse(res);
}

export async function deleteUnanswered(id) {
  const res = await fetch(`${BASE_URL}/unanswered/${id}`, {
    method: 'DELETE'
  });
  return handleResponse(res);
}

// Authentication API methods
export async function loginWithEmail(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return handleResponse(res);
}

export async function signupWithEmail(name, email, password) {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  return handleResponse(res);
}

export async function loginWithGoogle(data = {}) {
  const res = await fetch(`${BASE_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

export async function loginWithApple(data = {}) {
  const res = await fetch(`${BASE_URL}/auth/apple`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleResponse(res);
}

// Educational Tools Suite APIs
export async function reviewSop(sopData) {
  const res = await fetch(`${BASE_URL}/tools/sop-review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sopData)
  });
  return handleResponse(res);
}

export async function getLivingCosts(currency = 'USD') {
  const res = await fetch(`${BASE_URL}/tools/living-costs?currency=${encodeURIComponent(currency)}`);
  return handleResponse(res);
}

export async function getDeadlines(category = 'All') {
  const res = await fetch(`${BASE_URL}/tools/deadlines?category=${encodeURIComponent(category)}`);
  return handleResponse(res);
}

export async function compareUniversitiesApi(universities = []) {
  const res = await fetch(`${BASE_URL}/tools/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ universities })
  });
  return handleResponse(res);
}

export async function getMockExams(category = 'all') {
  const res = await fetch(`${BASE_URL}/tools/mock-exams?category=${encodeURIComponent(category)}`);
  return handleResponse(res);
}


