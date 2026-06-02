import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { timeLogApi } from "../services/timeLogApi";
import { formatDurationShort } from "../utils/formatTime";
import toast from "react-hot-toast";

export default function EditTimeLogModal({ open, onClose, onSave, log }) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && log) {
      setStart(toLocalInput(new Date(log.startTime)));
      setEnd(log.endTime ? toLocalInput(new Date(log.endTime)) : "");
    }
  }, [open, log]);

  if (!open || !log) return null;

  function toLocalInput(d) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  const previewDuration = start && end && new Date(end) > new Date(start)
    ? Math.floor((new Date(end) - new Date(start)) / 1000) : null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!start || !end) return toast.error("Both times are required");
    if (new Date(end) <= new Date(start)) return toast.error("End must be after start");
    setSaving(true);
    try {
      await timeLogApi.update(log.id, { startTime: new Date(start).toISOString(), endTime: new Date(end).toISOString() });
      toast.success("Time log updated ✓");
      onSave?.(); onClose();
    } catch (err) { toast.error(err.message || "Failed to update"); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cocoa-900/40 backdrop-blur-sm">
      <div className="bg-cream-50 dark:bg-surface-900 rounded-3xl shadow-rose-lg w-full max-w-sm animate-slide-up border border-petal-200 dark:border-mauve-800/50">
        <div className="flex items-center justify-between px-6 py-5 border-b border-petal-200 dark:border-mauve-800/40">
          <div>
            <h2 className="font-display font-bold text-xl text-cocoa-900 dark:text-cream-100">Edit Time Log</h2>
            <p className="text-xs text-cocoa-500 dark:text-petal-500 mt-0.5 truncate max-w-[200px]">{log.task?.title}</p>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-full"><X size={17} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-cocoa-600 dark:text-petal-400 mb-1.5 uppercase tracking-wide">Start Time</label>
            <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} className="input" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-cocoa-600 dark:text-petal-400 mb-1.5 uppercase tracking-wide">End Time</label>
            <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} className="input" required />
          </div>
          {previewDuration !== null && (
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gradient-to-r from-petal-50 to-blush-50 dark:from-brand-900/20 dark:to-mauve-900/30 border border-petal-200/80 dark:border-brand-700/30">
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wide">New duration</span>
              <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{formatDurationShort(previewDuration)}</span>
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
