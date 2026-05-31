import { useState, useEffect, useCallback, useRef } from "react";
import { taskApi } from "../services/taskApi";

const INIT_FILTERS = {
  search: "", status: "", priority: "",
  tag: "", filter: "", sortBy: "newest",
};

/**
 * Encapsulates all task list state: filters, loading, CRUD helpers.
 * Used by Tasks.jsx and can be reused anywhere a task list is needed.
 */
export function useTasks(initialFilters = {}) {
  const [tasks,   setTasks]   = useState([]);
  const [filters, setFilters] = useState({ ...INIT_FILTERS, ...initialFilters });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const debounceRef = useRef(null);

  const fetch = useCallback(async (f) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (f.search)   params.search   = f.search;
      if (f.status)   params.status   = f.status;
      if (f.priority) params.priority = f.priority;
      if (f.tag)      params.tag      = f.tag;
      if (f.filter)   params.filter   = f.filter;
      if (f.sortBy)   params.sortBy   = f.sortBy;

      const res = await taskApi.getAll(params);
      setTasks(res.data.data.tasks || []);
    } catch (err) {
      setError(err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search input, immediate for other filter changes
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => fetch(filters),
      filters.search ? 350 : 0
    );
    return () => clearTimeout(debounceRef.current);
  }, [filters, fetch]);

  async function createTask(data) {
    const res = await taskApi.create(data);
    await fetch(filters);
    return res.data.data.task;
  }

  async function deleteTask(id) {
    await taskApi.delete(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function updateTask(id, data) {
    const res = await taskApi.update(id, data);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...res.data.data.task } : t)));
    return res.data.data.task;
  }

  function refresh() {
    fetch(filters);
  }

  return {
    tasks, filters, loading, error,
    setFilters, createTask, deleteTask, updateTask, refresh,
  };
}
