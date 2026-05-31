import api from "./api";

export const timeLogApi = {
  getActive:    ()          => api.get("/api/time-logs/active"),
  getAll:       (params)    => api.get("/api/time-logs", { params }),
  createManual: (data)      => api.post("/api/time-logs/manual", data),
  update:       (id, data)  => api.patch(`/api/time-logs/${id}`, data),
  delete:       (id)        => api.delete(`/api/time-logs/${id}`),
};
