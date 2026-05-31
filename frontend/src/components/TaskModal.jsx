import { useState, useEffect } from "react";
import { X, Sparkles, Loader2 } from "lucide-react";
import { taskApi } from "../services/taskApi";
import { STATUS_OPTIONS, PRIORITY_OPTIONS, TAG_OPTIONS } from "../utils/constants";
import toast from "react-hot-toast";

const EMPTY = {
  title: "", description: "", status: "PENDING",
  priority: "MEDIUM", dueDate: "", tags: [],
};

export default function TaskModal({ open, onClose, onSave, initial = null }) {
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);
  const [suggesting, setSugg]   = useState(false);
  const [aiInput, setAiInput]   = useState("");

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              title:       initial.title || "",
              description: initial.description || "",
              status:      initial.status || "PENDING",
              priority:    initial.priority || "MEDIUM",
              dueDate:     initial.dueDate ? initial.dueDate.split("T")[0] : "",
              tags:        initial.tags || [],
            }
          : EMPTY
      );
      setAiInput("");
    }
  }, [open, initial]);

  if (!open) return null;

  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }

  function toggleTag(t) {
    set("tags", form.tags.includes(t) ? form.tags.filter((x) => x !== t) : [...form.tags, t]);
  }

  async function handleAiSuggest() {
    if (!aiInput.trim()) return toast.error("Enter a task description first");
    setSugg(true);
    try {
      const res = await taskApi.suggest(aiInput.trim());
      const s = res.data.data.suggestion;
      set("title", s.title);
      set("description", s.description);
      toast.success("AI suggestion applied — feel free to edit it!");
    } catch (err) {
      toast.error(err.message || "AI suggestion failed");
    } finally {
      setSugg(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");
    setSaving(true);
    try {
      const payload = {
        ...form,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to save task");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
            {initial ? "Edit Task" : "New Task"}
          </h2>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* AI Suggest — only on create */}
          {!initial && (
            <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200/50 dark:border-violet-700/30 space-y-2">
              <p className="text-xs font-medium text-violet-700 dark:text-violet-400 flex items-center gap-1.5">
                <Sparkles size={12} /> AI Title & Description
              </p>
              <div className="flex gap-2">
                <input
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="e.g. follow up with designer"
                  className="input text-sm flex-1"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAiSuggest())}
                />
                <button
                  type="button"
                  onClick={handleAiSuggest}
                  disabled={suggesting || !aiInput.trim()}
                  className="btn-secondary shrink-0"
                >
                  {suggesting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                </button>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Title *</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)}
              placeholder="Task title" className="input" required />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
              placeholder="What needs to be done?" rows={3} className="input resize-none" />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className="input">
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Priority</label>
              <select value={form.priority} onChange={(e) => set("priority", e.target.value)} className="input">
                {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Due Date</label>
            <input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} className="input" />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {TAG_OPTIONS.map((t) => (
                <button key={t} type="button" onClick={() => toggleTag(t)}
                  className={`badge cursor-pointer transition-all ${
                    form.tags.includes(t)
                      ? "bg-brand-500 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : (initial ? "Save Changes" : "Create Task")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
