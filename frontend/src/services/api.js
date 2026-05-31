import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Unwrap errors into readable messages
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthPage = ["/login", "/signup"].includes(window.location.pathname);
      if (!isAuthPage) window.location.href = "/login";
    }
    // Attach readable message to error
    error.message = error.response?.data?.message || error.message || "An error occurred";
    return Promise.reject(error);
  }
);

export default api;
