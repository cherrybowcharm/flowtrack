import api from "./api";

export const summaryApi = {
  today: () => api.get("/api/summary/today"),
  week:  () => api.get("/api/summary/week"),
};
