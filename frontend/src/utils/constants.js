export const STATUS_CONFIG = {
  PENDING:     { label: "Pending",     color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",   dot: "bg-slate-400" },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",     dot: "bg-blue-500" },
  COMPLETED:   { label: "Completed",   color: "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400", dot: "bg-brand-500" },
};

export const PRIORITY_CONFIG = {
  LOW:    { label: "Low",    color: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" },
  MEDIUM: { label: "Medium", color: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  HIGH:   { label: "High",   color: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  URGENT: { label: "Urgent", color: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

export const TAG_COLORS = [
  "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  "bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
];

// Deterministic color per tag name
export function getTagColor(tag) {
  const idx = tag.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % TAG_COLORS.length;
  return TAG_COLORS[idx];
}

export const SORT_OPTIONS = [
  { value: "newest",          label: "Newest first" },
  { value: "oldest",          label: "Oldest first" },
  { value: "priority",        label: "By priority" },
  { value: "due_date",        label: "Due date" },
  { value: "time_spent_desc", label: "Most time spent" },
  { value: "time_spent_asc",  label: "Least time spent" },
  { value: "completed_first", label: "Completed first" },
  { value: "pending_first",   label: "Pending first" },
];

export const FILTER_OPTIONS = [
  { value: "",             label: "All Tasks" },
  { value: "due_today",   label: "Due Today" },
  { value: "overdue",     label: "Overdue" },
  { value: "high_priority", label: "High Priority" },
];

export const STATUS_OPTIONS = ["PENDING", "IN_PROGRESS", "COMPLETED"];
export const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "URGENT"];
export const TAG_OPTIONS = ["College", "Internship", "Coding", "Design", "Personal", "Meeting", "Other"];
