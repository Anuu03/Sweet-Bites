// Centralized API configuration
// Automatically detects production mode and uses environment variable or falls back to localhost
const API_BASE_URL =
    import.meta.env.MODE === "production"
        ? import.meta.env.VITE_BACKEND_URL
        : "http://localhost:9000";

export default API_BASE_URL;
