import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, Play, Square, Clock, Calendar, Tag, AlertCircle } from "lucide-react";
import { taskApi }    from "../services/taskApi";
import { timeLogApi } from "../services/timeLogApi";
import { useTimer }   from "../context/TimerContext";
import TaskModal      from "../components/TaskModal";
import ManualTimeModal from "../components/ManualTimeModal";
import { STATUS_CONFIG, PRIORITY_CONFIG, getTagColor } from "../utils/constants";
import { formatDuration, formatDurationShort, formatDateTime, formatTimer, isOverdue } from "../utils/formatTime";
import toast from "react-hot-toast";

export default function TaskDetails() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { isRunning, activeLog, elapsed, startTimer, stopTimer, timerLoading } = useTimer();

  const [task,      setTask]      = useState(null);
  const [logs,      setLogs]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [editOpen,  setEditOpen]  = useState(false);
  const [manualOpen, setManual]   = useState(false);

  const isActive = isRunning && activeLog?.taskId === id;

  async function load() {
    try {
      const [taskRes, logsRes] = await Promise.all([
        taskApi.getOne(id),
        timeLogApi.getAll({ taskId: id }),
      ]);
      setTask(taskRes.data.data.task);
      setLogs(logsRes.data.data.logs || []);
    } catch {
      toast.error("Failed to load task");
      navigate("/tasks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function handleTimer() {
    if (isActive) {
      const res = await stopTimer();
      if (res.success) {
        toast.success(`Stopped — ${formatDurationShort(res.timeLog?.durationSeconds)} logged`);
        load();
      } else toast.error(res.message);
    } else {
      const res = await startTimer(task);
      if (res.success) toast.success("Timer started!");
      else toast.error(res.message);
    }
  }

  async function handleUpdate(data) {
    await taskApi.update(id, data);
    toast.success("Task updated");
    load();
  }

  async function handleDelete() {
    if (!confirm(`Delete "${task.title}"?`)) return;
    if (isActive) {
      await stopTimer();
    }
    await taskApi.delete(id);
    toast.success("Task deleted");
    navigate("/tasks");
  }

  async function handleDeleteLog(logId) {
    if (!confirm("Delete this time log?")) return;
    await timeLogApi.delete(logId);
    toast.success("Log deleted");
    load();
  }

  if (loading) {
    return (
      <div className="page">
        <div className="card h-64 animate-pulse bg-slate-100 dark:bg-slate-800" />
      </div>
    );
  }

  if (!task) return null;

  const status   = STATUS_CONFIG[task.status]   || STATUS_CONFIG.PENDING;
  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.MEDIUM;
  const overdue  = isOverdue(task.dueDate, task.status);
  const totalTime = logs.reduce((a, l) => a + (l.durationSeconds || 0), 0);

  return (
    <div className="page space-y-6">
      {/* Back + actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button onClick={() => navigate("/tasks")} className="btn-ghost">
          <ArrowLeft size={16} /> Back to Tasks
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setEditOpen(true)} className="btn-secondary">
            <Pencil size={14} /> Edit
          </button>
          <button onClick={handleDelete} className="btn-danger">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left — task details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title card */}
          <div className="card p-6">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`badge ${status.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />{status.label}
              </span>
              <span className={`badge ${priority.color}`}>{priority.label}</span>
              {overdue && (
                <span className="badge bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  <AlertCircle size={10} /> Overdue
                </span>
              )}
            </div>
            <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white mb-3">
              {task.title}
            </h1>
            {task.description && (
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{task.description}</p>
            )}

            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              {task.dueDate && (
                <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <Calendar size={14} />
                  <span>Due {new Date(task.dueDate).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <Clock size={14} />
                <span>{formatDuration(totalTime)} tracked</span>
              </div>
            </div>

            {task.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {task.tags.map((t) => (
                  <span key={t} className={`badge ${getTagColor(t)}`}>
                    <Tag size={10} />{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Time logs table */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-slate-900 dark:text-white">Time Logs</h2>
              <button onClick={() => setManual(true)} className="btn-secondary text-xs">
                + Manual Entry
              </button>
            </div>
            {logs.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No time logs yet. Start the timer!</p>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDateTime(log.startTime)}
                        {log.endTime && ` → ${new Date(log.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`badge text-xs ${log.source === "MANUAL" ? "bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" : "bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"}`}>
                        {log.source}
                      </span>
                      <span className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {formatDurationShort(log.durationSeconds)}
                      </span>
                      <button onClick={() => handleDeleteLog(log.id)} className="btn-ghost p-1 text-slate-400 hover:text-red-500">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right — timer + meta */}
        <div className="space-y-4">
          {/* Timer card */}
          {task.status !== "COMPLETED" && (
            <div className={`card p-6 text-center ${isActive ? "border-brand-400/50 dark:border-brand-500/30" : ""}`}>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                {isActive ? "Timer Running" : "Time Tracker"}
              </p>
              <div className={`font-mono text-4xl font-bold mb-5 ${isActive ? "text-brand-500 animate-tick" : "text-slate-300 dark:text-slate-600"}`}>
                {isActive ? formatTimer(elapsed) : "00:00:00"}
              </div>
              <button
                onClick={handleTimer}
                disabled={timerLoading || (isRunning && !isActive)}
                className={`btn w-full justify-center py-3 ${isActive ? "btn-danger" : "btn-primary"}`}
              >
                {isActive ? <><Square size={16} fill="currentColor" /> Stop Timer</> : <><Play size={16} fill="currentColor" /> Start Timer</>}
              </button>
              {isRunning && !isActive && (
                <p className="text-xs text-slate-400 mt-3">Another task's timer is running</p>
              )}
            </div>
          )}

          {/* Stats card */}
          <div className="card p-5 space-y-3">
            <h3 className="font-display font-semibold text-slate-900 dark:text-white text-sm">Statistics</h3>
            {[
              { label: "Total Time", value: formatDuration(totalTime) || "0s" },
              { label: "Sessions", value: `${logs.length}` },
              { label: "Created", value: new Date(task.createdAt).toLocaleDateString() },
              { label: "Updated", value: new Date(task.updatedAt).toLocaleDateString() },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">{label}</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TaskModal open={editOpen} onClose={() => setEditOpen(false)} onSave={handleUpdate} initial={task} />
      <ManualTimeModal open={manualOpen} onClose={() => setManual(false)} onSave={load} defaultTaskId={id} />
    </div>
  );
}
