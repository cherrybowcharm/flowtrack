import { Search, SlidersHorizontal, X } from "lucide-react";
import { SORT_OPTIONS, FILTER_OPTIONS, STATUS_CONFIG, PRIORITY_CONFIG, TAG_OPTIONS } from "../utils/constants";

export default function FilterBar({ filters, onChange }) {
  const { search, status, priority, tag, filter, sortBy } = filters;

  function set(key, value) {
    onChange({ ...filters, [key]: value });
  }

  function clear() {
    onChange({ search: "", status: "", priority: "", tag: "", filter: "", sortBy: "newest" });
  }

  const hasActive = search || status || priority || tag || filter || (sortBy && sortBy !== "newest");

  return (
    <div className="space-y-3">
      {/* Search + Sort row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => set("search", e.target.value)}
            placeholder="Search tasks…"
            className="input pl-9"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => set("sortBy", e.target.value)}
          className="input w-44 cursor-pointer"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {hasActive && (
          <button onClick={clear} className="btn-secondary gap-1.5 shrink-0">
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 items-center">
        <SlidersHorizontal size={14} className="text-slate-400 shrink-0" />

        {/* Special filters */}
        {FILTER_OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => set("filter", filter === o.value ? "" : o.value)}
            className={`badge cursor-pointer transition-all duration-150 ${
              filter === o.value
                ? "bg-brand-500 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {o.label}
          </button>
        ))}

        {/* Status chips */}
        {["PENDING","IN_PROGRESS","COMPLETED"].map((s) => {
          const cfg = STATUS_CONFIG[s];
          return (
            <button
              key={s}
              onClick={() => set("status", status === s ? "" : s)}
              className={`badge cursor-pointer transition-all duration-150 ${
                status === s ? "bg-brand-500 text-white" : `${cfg.color} hover:opacity-80`
              }`}
            >
              {cfg.label}
            </button>
          );
        })}

        {/* Priority */}
        {["HIGH","URGENT"].map((p) => {
          const cfg = PRIORITY_CONFIG[p];
          return (
            <button
              key={p}
              onClick={() => set("priority", priority === p ? "" : p)}
              className={`badge cursor-pointer transition-all duration-150 ${
                priority === p ? "bg-brand-500 text-white" : `${cfg.color} hover:opacity-80`
              }`}
            >
              {cfg.label}
            </button>
          );
        })}

        {/* Tags */}
        <select
          value={tag}
          onChange={(e) => set("tag", e.target.value)}
          className="text-xs px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-900 text-slate-600 dark:text-slate-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">All Tags</option>
          {TAG_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
    </div>
  );
}
