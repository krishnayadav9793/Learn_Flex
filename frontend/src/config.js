// Central API configuration that automatically switches between local and production
export const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:3000"
  : "https://learn-flex-2.onrender.com";
