export default function SummaryCard({ label, value, sub, icon: Icon, color = "brand", className = "" }) {
  const colorMap = {
    brand:  "from-brand-500/10 to-brand-400/5 text-brand-600 dark:text-brand-400 border-brand-200/50 dark:border-brand-700/30",
    blue:   "from-blue-500/10 to-blue-400/5 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-700/30",
    orange: "from-orange-500/10 to-orange-400/5 text-orange-600 dark:text-orange-400 border-orange-200/50 dark:border-orange-700/30",
    violet: "from-violet-500/10 to-violet-400/5 text-violet-600 dark:text-violet-400 border-violet-200/50 dark:border-violet-700/30",
    slate:  "from-slate-500/10 to-slate-400/5 text-slate-600 dark:text-slate-400 border-slate-200/50 dark:border-slate-700/30",
    red:    "from-red-500/10 to-red-400/5 text-red-600 dark:text-red-400 border-red-200/50 dark:border-red-700/30",
  };

  return (
    <div className={`card p-5 animate-fade-in ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-2xl font-display font-bold text-slate-900 dark:text-white leading-tight">
            {value}
          </p>
          {sub && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{sub}</p>
          )}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br border flex items-center justify-center shrink-0 ${colorMap[color]}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  );
}
