import { useEffect, useState, useCallback, useRef } from "react";
import { Plus, LayoutGrid, List } from "lucide-react";
import { taskApi }   from "../services/taskApi";
import TaskCard      from "../components/TaskCard";
import FilterBar     from "../components/FilterBar";
import TaskModal     from "../components/TaskModal";
import toast         from "react-hot-toast";

const INIT_FILTERS = { search: "", status: "", priority: "", tag: "", filter: "", sortBy: "newest" };

export default function Tasks() {
  const [tasks,     setTasks]     = useState([]);
  const [filters,   setFilters]   = useState(INIT_FILTERS);
  const [loading,   setLoading]   = useState(true);
  const [gridView,  setGridView]  = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const debounceRef = useRef(null);

  const load = useCallback(async (f = filters) => {
    setLoading(true);
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
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search, instant for other filters
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => load(filters), filters.search ? 350 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [filters, load]);

  async function handleCreate(data) {
    const res = await taskApi.create(data);
    await load(filters);
    return res.data.data.task;
  }

  async function handleDelete(id) {
    await taskApi.delete(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="page space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Tasks</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {loading ? "Loading…" : `${tasks.length} task${tasks.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setGridView(true)}  className={`btn-ghost p-2 ${gridView ? "bg-slate-100 dark:bg-slate-800" : ""}`}><LayoutGrid size={16} /></button>
          <button onClick={() => setGridView(false)} className={`btn-ghost p-2 ${!gridView ? "bg-slate-100 dark:bg-slate-800" : ""}`}><List size={16} /></button>
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <FilterBar filters={filters} onChange={setFilters} />

      {/* Task grid / list */}
      {loading ? (
        <div className={`grid gap-3 ${gridView ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card h-40 animate-pulse bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <Plus size={20} className="text-slate-400" />
          </div>
          <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">No tasks found</p>
          <p className="text-sm text-slate-400 mb-4">Try adjusting your filters or create a new task</p>
          <button onClick={() => setModalOpen(true)} className="btn-primary mx-auto">
            <Plus size={16} /> New Task
          </button>
        </div>
      ) : (
        <div className={`grid gap-3 ${gridView ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 max-w-2xl"}`}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              compact={!gridView}
              onDelete={handleDelete}
              onUpdate={() => load(filters)}
            />
          ))}
        </div>
      )}

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleCreate}
      />
    </div>
  );
}
