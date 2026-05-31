import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Clock, CheckSquare, ListTodo, Zap, TrendingUp, BarChart2, Award } from "lucide-react";
import { summaryApi } from "../services/summaryApi";
import SummaryCard    from "../components/SummaryCard";
import { formatDuration, formatDurationShort } from "../utils/formatTime";
import { STATUS_CONFIG } from "../utils/constants";
import toast from "react-hot-toast";

const PIE_COLORS = ["#22c55e","#3b82f6","#f59e0b","#8b5cf6","#ec4899","#06b6d4","#f97316"];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-lg text-xs">
      {label && <p className="font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</p>}
      <p className="font-semibold text-brand-500">{formatDurationShort(payload[0].value)}</p>
    </div>
  );
};

export default function Summary() {
  const [tab,    setTab]    = useState("today");
  const [daily,  setDaily]  = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [d, w] = await Promise.all([summaryApi.today(), summaryApi.week()]);
        setDaily(d.data.data);
        setWeekly(w.data.data);
      } catch {
        toast.error("Failed to load summary");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="page grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="card h-24 animate-pulse bg-slate-100 dark:bg-slate-800" />)}
      </div>
    );
  }

  const weeklyChartData = weekly?.dailyBreakdown?.map((d) => ({
    day: new Date(d.date + "T12:00:00").toLocaleDateString([], { weekday: "short" }),
    seconds: d.totalSeconds,
    full: d.date,
  })) || [];

  const pieData = weekly?.timeByTag?.slice(0, 7).map((t) => ({
    name: t.tag,
    value: t.totalSeconds,
  })) || [];

  const taskBarData = weekly?.topTasks?.map((t) => ({
    name: t.title.length > 20 ? t.title.slice(0, 18) + "…" : t.title,
    seconds: t.timeSpentSeconds,
  })) || [];

  return (
    <div className="page space-y-6">
      {/* Header + tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Summary</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Productivity insights</p>
        </div>
        <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-900">
          <button onClick={() => setTab("today")}
            className={`px-5 py-2 text-sm font-medium transition-colors ${tab === "today" ? "bg-brand-500 text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
            Today
          </button>
          <button onClick={() => setTab("week")}
            className={`px-5 py-2 text-sm font-medium transition-colors ${tab === "week" ? "bg-brand-500 text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
            This Week
          </button>
        </div>
      </div>

      {/* ─── TODAY TAB ───────────────────────────────────────────────────────── */}
      {tab === "today" && daily && (
        <div className="space-y-6 animate-fade-in">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard label="Total Tracked" value={formatDurationShort(daily.totalTrackedSeconds)} icon={Clock} color="brand" />
            <SummaryCard label="Completed" value={daily.completedTasks} icon={CheckSquare} color="brand" />
            <SummaryCard label="In Progress" value={daily.inProgressTasks} icon={Zap} color="blue" />
            <SummaryCard label="Pending" value={daily.pendingTasks} icon={ListTodo} color="orange" />
          </div>

          {/* Tasks worked on */}
          <div className="card p-5">
            <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-4">Tasks Worked On Today</h2>
            {daily.tasksWorkedOn?.length > 0 ? (
              <>
                {/* Horizontal bar chart */}
                <ResponsiveContainer width="100%" height={Math.max(100, daily.tasksWorkedOn.length * 44)}>
                  <BarChart layout="vertical" data={daily.tasksWorkedOn.map((t) => ({
                    name: t.title.length > 28 ? t.title.slice(0, 26) + "…" : t.title,
                    seconds: t.timeSpentSeconds,
                  }))}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="seconds" fill="#22c55e" radius={[0, 6, 6, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>

                {/* Detail list */}
                <div className="mt-4 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                  {daily.tasksWorkedOn.map((t) => {
                    const cfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.PENDING;
                    return (
                      <div key={t.taskId} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                          <span className="text-slate-700 dark:text-slate-300">{t.title}</span>
                        </div>
                        <span className="font-mono font-medium text-slate-500 dark:text-slate-400">
                          {formatDurationShort(t.timeSpentSeconds)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-center py-8 text-sm text-slate-400">No tasks tracked today. Start a timer!</p>
            )}
          </div>
        </div>
      )}

      {/* ─── WEEK TAB ────────────────────────────────────────────────────────── */}
      {tab === "week" && weekly && (
        <div className="space-y-6 animate-fade-in">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard label="Week Total" value={formatDurationShort(weekly.totalTrackedSeconds)} icon={Clock} color="brand" />
            <SummaryCard label="Completed" value={weekly.completedTasksThisWeek} sub="this week" icon={CheckSquare} color="brand" />
            <SummaryCard label="Daily Avg" value={formatDurationShort(weekly.avgDailySeconds)} icon={TrendingUp} color="blue" />
            <SummaryCard
              label="Best Day"
              value={weekly.mostProductiveDay?.date ? new Date(weekly.mostProductiveDay.date + "T12:00:00").toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }) : "—"}
              sub={weekly.mostProductiveDay?.totalSeconds ? formatDurationShort(weekly.mostProductiveDay.totalSeconds) : ""}
              icon={Award}
              color="violet"
            />
          </div>

          {/* Weekly trend chart */}
          <div className="card p-5">
            <div className="mb-4">
              <h2 className="font-display font-semibold text-slate-900 dark:text-white">Daily Trend</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{weekly.weekStart} → {weekly.weekEnd}</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weeklyChartData}>
                <defs>
                  <linearGradient id="weekGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="seconds" stroke="#22c55e" strokeWidth={2.5} fill="url(#weekGrad)"
                  dot={{ fill: "#22c55e", r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom row: top tasks bar + category pie */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Top tasks */}
            <div className="card p-5">
              <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-4">Top Tasks This Week</h2>
              {taskBarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={Math.max(120, taskBarData.length * 44)}>
                  <BarChart layout="vertical" data={taskBarData}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="seconds" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">No data yet</p>
              )}
            </div>

            {/* Category breakdown */}
            <div className="card p-5">
              <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-4">By Category</h2>
              {pieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={4}>
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => formatDurationShort(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-1.5 mt-3">
                    {pieData.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-1.5 text-xs">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-slate-600 dark:text-slate-400 truncate">{d.name}</span>
                        <span className="font-medium text-slate-700 dark:text-slate-200 ml-auto shrink-0">{formatDurationShort(d.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-400 text-center py-8">No category data yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
