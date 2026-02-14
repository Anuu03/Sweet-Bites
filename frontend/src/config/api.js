// Centralized API configuration
// Uses VITE_BACKEND_URL from environment variables (Vercel) or falls back to localhost
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

export default API_BASE_URL;
