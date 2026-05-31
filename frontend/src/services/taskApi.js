import api from "./api";

export const taskApi = {
  // CRUD
  create:  (data)         => api.post("/api/tasks", data),
  getAll:  (params)       => api.get("/api/tasks", { params }),
  getOne:  (id)           => api.get(`/api/tasks/${id}`),
  update:  (id, data)     => api.patch(`/api/tasks/${id}`, data),
  delete:  (id)           => api.delete(`/api/tasks/${id}`),

  // Timer
  start:   (taskId)       => api.post(`/api/tasks/${taskId}/start`),
  stop:    (taskId)       => api.post(`/api/tasks/${taskId}/stop`),
  timeSummary: (taskId)   => api.get(`/api/tasks/${taskId}/time-summary`),

  // AI
  suggest: (input)        => api.post("/api/tasks/suggest", { input }),
};
