import { useEffect, useState, useCallback } from "react";
import { Clock, Plus, Trash2, Pencil, Filter } from "lucide-react";
import { timeLogApi }      from "../services/timeLogApi";
import ManualTimeModal     from "../components/ManualTimeModal";
import EditTimeLogModal    from "../components/EditTimeLogModal";
import { formatDurationShort, formatDateTime, formatTime } from "../utils/formatTime";
import toast from "react-hot-toast";

export default function TimeLogs() {
  const [logs,        setLogs]        = useState([]);
  const [pagination,  setPagination]  = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [manualOpen,  setManualOpen]  = useState(false);
  const [editLog,     setEditLog]     = useState(null);   // log object to edit
  const [page,        setPage]        = useState(1);
  const [dateFrom,    setDateFrom]    = useState("");
  const [dateTo,      setDateTo]      = useState("");
  const [source,      setSource]      = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo)   params.dateTo   = dateTo;
      if (source)   params.source   = source;
      const res = await timeLogApi.getAll(params);
      setLogs(res.data.data.logs || []);
      setPagination(res.data.data.pagination);
    } catch {
      toast.error("Failed to load time logs");
    } finally {
      setLoading(false);
    }
  }, [page, dateFrom, dateTo, source]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id) {
    if (!confirm("Delete this time log?")) return;
    try {
      await timeLogApi.delete(id);
      toast.success("Log deleted");
      load();
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    }
  }

  function clearFilters() {
    setDateFrom(""); setDateTo(""); setSource(""); setPage(1);
  }

  const totalSeconds = logs.reduce((a, l) => a + (l.durationSeconds || 0), 0);
  const hasFilters   = dateFrom || dateTo || source;

  return (
    <div className="page space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
            Time Logs
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {pagination ? `${pagination.total} total entries` : ""}
          </p>
        </div>
        <button onClick={() => setManualOpen(true)} className="btn-primary">
          <Plus size={16} /> Manual Entry
        </button>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex items-center gap-2 self-center">
            <Filter size={14} className="text-slate-400" />
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Filter:</span>
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">From</label>
            <input
              type="date" value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="input text-sm py-1.5 w-36"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">To</label>
            <input
              type="date" value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="input text-sm py-1.5 w-36"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Source</label>
            <select
              value={source}
              onChange={(e) => { setSource(e.target.value); setPage(1); }}
              className="input text-sm py-1.5 w-32"
            >
              <option value="">All</option>
              <option value="TIMER">Timer</option>
              <option value="MANUAL">Manual</option>
            </select>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-ghost text-sm text-slate-500 self-end pb-1">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Summary strip ───────────────────────────────────────────────── */}
      {!loading && logs.length > 0 && (
        <div className="flex items-center gap-2 px-1">
          <Clock size={14} className="text-brand-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-900 dark:text-white">
              {formatDurationShort(totalSeconds)}
            </span>{" "}
            across {logs.length} {logs.length === 1 ? "entry" : "entries"} on this page
          </span>
        </div>
      )}

      {/* ── Table ───────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card h-14 animate-pulse bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="card p-16 text-center">
          <Clock size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">No logs found</p>
          <p className="text-sm text-slate-400 mb-4">
            {hasFilters ? "Try adjusting the filters" : "Start a timer on a task or add a manual entry"}
          </p>
          {!hasFilters && (
            <button onClick={() => setManualOpen(true)} className="btn-primary mx-auto">
              <Plus size={16} /> Add Manual Entry
            </button>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Column headers */}
          <div className="hidden sm:grid grid-cols-[1fr_140px_140px_90px_90px_80px] gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            <span>Task</span>
            <span>Start</span>
            <span>End</span>
            <span>Duration</span>
            <span>Source</span>
            <span />
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col sm:grid sm:grid-cols-[1fr_140px_140px_90px_90px_80px] gap-2 px-4 py-3 items-start sm:items-center hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors group"
              >
                {/* Task name */}
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate w-full">
                  {log.task?.title || "Unknown Task"}
                </span>

                {/* Start */}
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">
                  {formatDateTime(log.startTime)}
                </span>

                {/* End */}
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">
                  {log.endTime
                    ? formatTime(log.endTime)
                    : <span className="text-brand-500 font-medium">running…</span>
                  }
                </span>

                {/* Duration */}
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 font-mono whitespace-nowrap">
                  {log.endTime ? formatDurationShort(log.durationSeconds) : "—"}
                </span>

                {/* Source badge */}
                <span className={`badge text-xs whitespace-nowrap ${
                  log.source === "MANUAL"
                    ? "bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
                    : "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"
                }`}>
                  {log.source === "MANUAL" ? "Manual" : "Timer"}
                </span>

                {/* Actions */}
                {log.endTime && (
                  <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditLog(log)}
                      className="btn-ghost p-1.5 text-slate-400 hover:text-brand-500"
                      title="Edit log"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(log.id)}
                      className="btn-ghost p-1.5 text-slate-400 hover:text-red-500"
                      title="Delete log"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Pagination ──────────────────────────────────────────────────── */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="btn-secondary text-sm disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
            disabled={page === pagination.totalPages}
            className="btn-secondary text-sm disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      <ManualTimeModal
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        onSave={load}
      />
      <EditTimeLogModal
        open={!!editLog}
        log={editLog}
        onClose={() => setEditLog(null)}
        onSave={load}
      />
    </div>
  );
}
