import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Square, Pencil, Trash2, Clock, Calendar, AlertCircle } from "lucide-react";
import { useTimer } from "../context/TimerContext";
import { STATUS_CONFIG, PRIORITY_CONFIG, getTagColor } from "../utils/constants";
import { formatDurationShort, formatShortDate, isOverdue, isDueToday, formatTimer } from "../utils/formatTime";
import toast from "react-hot-toast";

export default function TaskCard({ task, onDelete, onUpdate, compact = false }) {
  const navigate = useNavigate();
  const { isRunning, activeLog, activeTask, elapsed, startTimer, stopTimer, timerLoading } = useTimer();

  const isThisTaskActive = isRunning && activeLog?.taskId === task.id;
  const [deleting, setDeleting] = useState(false);

  const status   = STATUS_CONFIG[task.status]   || STATUS_CONFIG.PENDING;
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
  const overdue  = isOverdue(task.dueDate, task.status);
  const dueToday = isDueToday(task.dueDate);

  async function handleTimer(e) {
    e.stopPropagation();
    if (isThisTaskActive) {
      const res = await stopTimer();
      if (res.success) {
        toast.success(`Stopped — ${formatDurationShort(res.timeLog?.durationSeconds)} logged`);
        onUpdate?.();
      } else {
        toast.error(res.message || "Failed to stop timer");
      }
    } else {
      const res = await startTimer(task);
      if (res.success) {
        toast.success("Timer started!");
        onUpdate?.();
      } else {
        toast.error(res.message || "Failed to start timer");
      }
    }
  }

  async function handleDelete(e) {
    e.stopPropagation();
    if (!confirm(`Delete "${task.title}"?`)) return;
    setDeleting(true);
    try {
      await onDelete?.(task.id);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      onClick={() => navigate(`/tasks/${task.id}`)}
      className={`card p-4 cursor-pointer hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 animate-fade-in ${
        isThisTaskActive ? "ring-2 ring-brand-500/50 border-brand-400/50" : ""
      }`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`badge ${status.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
            <span className={`badge ${priority.color}`}>{priority.label}</span>
            {overdue && (
              <span className="badge bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                <AlertCircle size={10} /> Overdue
              </span>
            )}
            {dueToday && !overdue && (
              <span className="badge bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                Due today
              </span>
            )}
          </div>
          <h3 className={`font-semibold text-slate-900 dark:text-white truncate ${compact ? "text-sm" : "text-base"}`}>
            {task.title}
          </h3>
          {!compact && task.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/tasks/${task.id}`); }}
            className="btn-ghost p-1.5 text-slate-400 hover:text-brand-500"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting || isThisTaskActive}
            className="btn-ghost p-1.5 text-slate-400 hover:text-red-500"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Tags */}
      {task.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.map((tag) => (
            <span key={tag} className={`badge ${getTagColor(tag)}`}>{tag}</span>
          ))}
        </div>
      )}

      {/* Bottom row — meta + timer button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          {task.dueDate && (
            <span className={`flex items-center gap-1 ${overdue ? "text-red-500" : ""}`}>
              <Calendar size={12} />
              {formatShortDate(task.dueDate)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatDurationShort(task.totalTimeSeconds)}
          </span>
        </div>

        {/* Timer button */}
        {task.status !== "COMPLETED" && (
          <button
            onClick={handleTimer}
            disabled={timerLoading || (isRunning && !isThisTaskActive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
              isThisTaskActive
                ? "bg-brand-500 text-white shadow-sm animate-pulse-slow"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/30 dark:hover:text-brand-400 disabled:opacity-40 disabled:cursor-not-allowed"
            }`}
          >
            {isThisTaskActive ? (
              <>
                <Square size={11} fill="currentColor" />
                {formatTimer(elapsed)}
              </>
            ) : (
              <>
                <Play size={11} fill="currentColor" />
                Start
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
