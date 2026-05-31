import api from "./api";

export const authApi = {
  signup: (data)  => api.post("/api/auth/signup", data),
  login:  (data)  => api.post("/api/auth/login",  data),
  logout: ()      => api.post("/api/auth/logout"),
  me:     ()      => api.get("/api/auth/me"),
};
