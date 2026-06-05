// Backend API bilan bog'lanish funksiyalari
const BASE = process.env.REACT_APP_API_URL || "https://word-bridge-api.onrender.com";

async function request(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    headers,
    ...options,
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) {
      localStorage.removeItem("token"); // logout
      window.location.href = "/login";
    }
    throw new Error(err.detail || `Xatolik: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  register: (data) => request("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data) => request("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),
  getMe: () => request("/api/auth/me"),

  // Reviews & SM2
  getTodayReview: () => request("/api/review/today"),
  submitReview: (wordId, quality) => 
    request("/api/review/submit", { method: "POST", body: JSON.stringify({ wordId, quality }) }),

  // Old functions adapted
  generate: (words) =>
    request("/api/words/generate", {
      method: "POST",
      body: JSON.stringify({ words }),
    }),

  save: (words) =>
    request("/api/words/save", {
      method: "POST",
      body: JSON.stringify({ words }),
    }),

  getWords: (status) =>
    request(`/api/words${status && status !== "all" ? `?status=${status}` : ""}`),

  toggleStatus: (id) =>
    request(`/api/words/${id}/status`, { method: "PATCH" }),

  deleteWord: (id) =>
    request(`/api/words/${id}`, { method: "DELETE" }),

  getProgress: () => request("/api/progress"),
};

