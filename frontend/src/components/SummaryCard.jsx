export default function SummaryCard({ label, value, sub, icon: Icon, color = "brand", className = "" }) {
  const colorMap = {
    brand:  "from-brand-400/15 to-brand-300/5 text-brand-600 dark:text-brand-300 border-brand-200/50 dark:border-brand-700/30",
    blue:   "from-mauve-300/20 to-mauve-200/5 text-mauve-600 dark:text-petal-400 border-mauve-200/50 dark:border-mauve-700/30",
    orange: "from-cocoa-300/20 to-cocoa-200/5 text-cocoa-600 dark:text-cocoa-300 border-cocoa-200/50 dark:border-cocoa-700/30",
    violet: "from-petal-300/20 to-petal-200/5 text-brand-600 dark:text-petal-300 border-petal-200/50 dark:border-petal-700/30",
    slate:  "from-cream-300/20 to-cream-200/5 text-cocoa-500 dark:text-cream-400 border-cream-200/50 dark:border-mauve-700/30",
    red:    "from-red-300/20 to-red-200/5 text-red-600 dark:text-red-400 border-red-200/50 dark:border-red-800/30",
  };

  return (
    <div className={`card p-5 animate-fade-in ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="section-label mb-1.5">{label}</p>
          <p className="text-2xl font-display font-bold text-cocoa-900 dark:text-cream-100 leading-tight">
            {value}
          </p>
          {sub && (
            <p className="text-xs text-cocoa-500 dark:text-petal-500 mt-1">{sub}</p>
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
