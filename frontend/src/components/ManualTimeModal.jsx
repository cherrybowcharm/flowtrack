import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { timeLogApi } from "../services/timeLogApi";
import { taskApi }    from "../services/taskApi";
import toast from "react-hot-toast";

export default function ManualTimeModal({ open, onClose, onSave, defaultTaskId = "" }) {
  const [tasks,   setTasks]   = useState([]);
  const [taskId,  setTaskId]  = useState(defaultTaskId);
  const [start,   setStart]   = useState("");
  const [end,     setEnd]     = useState("");
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    if (!open) return;
    setTaskId(defaultTaskId);
    // Default to current time range (last hour → now)
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    setStart(toLocalInput(oneHourAgo));
    setEnd(toLocalInput(now));

    taskApi.getAll({}).then((res) => setTasks(res.data.data.tasks || [])).catch(() => {});
  }, [open, defaultTaskId]);

  if (!open) return null;

  function toLocalInput(d) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!taskId) return toast.error("Select a task");
    if (!start || !end) return toast.error("Set start and end times");
    if (new Date(end) <= new Date(start)) return toast.error("End must be after start");

    setSaving(true);
    try {
      await timeLogApi.createManual({
        taskId,
        startTime: new Date(start).toISOString(),
        endTime:   new Date(end).toISOString(),
      });
      toast.success("Manual log added");
      onSave?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to add log");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">Add Manual Entry</h2>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Task *</label>
            <select value={taskId} onChange={(e) => setTaskId(e.target.value)} className="input">
              <option value="">Select a task…</option>
              {tasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Start Time *</label>
            <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className="input" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">End Time *</label>
            <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} className="input" />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              {saving ? "Saving…" : "Add Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
