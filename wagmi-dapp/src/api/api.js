// src/api/api.js

const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Global API fetch utility with JWT and error handling.
 */
export const apiCall = async (endpoint, options = {}) => {
  const jwt = localStorage.getItem('jwt');
  const headers = {
    'Content-Type': 'application/json',
    ...(jwt && { 'Authorization': `Bearer ${jwt}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
        localStorage.removeItem('jwt');
        // Optional: window.location.reload() or notify user
    }
    let errorDetail = `API Error: ${response.status} - ${response.statusText}`;
    try {
        const errorBody = await response.json();
        errorDetail = errorBody.detail || JSON.stringify(errorBody);
    } catch {
        // Ignore if body isn't JSON
    }
    throw new Error(errorDetail);
  }
  
  if (response.status === 204 || response.headers.get("Content-Length") === "0") {
    return {};
  }

  return response.json();
};