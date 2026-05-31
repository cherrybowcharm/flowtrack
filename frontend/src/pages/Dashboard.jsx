import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Clock, CheckSquare, ListTodo, Zap, TrendingUp, Square, Play } from "lucide-react";
import { useAuth }  from "../context/AuthContext";
import { useTimer } from "../context/TimerContext";
import { summaryApi } from "../services/summaryApi";
import { timeLogApi }  from "../services/timeLogApi";
import SummaryCard from "../components/SummaryCard";
import { formatDuration, formatDurationShort, formatTimer, formatTime, formatDateTime } from "../utils/formatTime";
import { STATUS_CONFIG } from "../utils/constants";
import toast from "react-hot-toast";

const PIE_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</p>
      <p className="text-brand-500 font-semibold">{formatDurationShort(payload[0].value)}</p>
    </div>
  );
};

export default function Dashboard() {
  const { user }    = useAuth();
  const { isRunning, activeTask, elapsed, stopTimer, timerLoading } = useTimer();
  const navigate    = useNavigate();

  const [daily,    setDaily]    = useState(null);
  const [weekly,   setWeekly]   = useState(null);
  const [recentLogs, setRecent] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [d, w, l] = await Promise.all([
          summaryApi.today(),
          summaryApi.week(),
          timeLogApi.getAll({ limit: 5 }),
        ]);
        setDaily(d.data.data);
        setWeekly(w.data.data);
        setRecent(l.data.data.logs || []);
      } catch {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleStop() {
    const res = await stopTimer();
    if (res.success) {
      toast.success(`Stopped — ${formatDurationShort(res.timeLog?.durationSeconds)} logged`);
      // Reload daily summary to reflect new time
      summaryApi.today().then((r) => setDaily(r.data.data)).catch(() => {});
    } else {
      toast.error(res.message);
    }
  }

  // Prepare weekly chart data
  const chartData = weekly?.dailyBreakdown?.map((d) => ({
    day: new Date(d.date + "T12:00:00").toLocaleDateString([], { weekday: "short" }),
    seconds: d.totalSeconds,
  })) || [];

  const pieData = weekly?.timeByTag?.slice(0, 6).map((t) => ({
    name: t.tag,
    value: t.totalSeconds,
  })) || [];

  if (loading) {
    return (
      <div className="page">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 h-24 animate-pulse bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
          Good {getGreeting()}, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Active timer card */}
      {isRunning && (
        <div className="card p-5 border-brand-400/40 dark:border-brand-500/30 bg-gradient-to-r from-brand-50 dark:from-brand-900/20 to-transparent animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center timer-ring">
                <Zap size={18} className="text-brand-600 dark:text-brand-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-brand-700 dark:text-brand-400 uppercase tracking-wide">Timer Running</p>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{activeTask?.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-3xl font-bold text-brand-600 dark:text-brand-400">
                {formatTimer(elapsed)}
              </span>
              <button onClick={handleStop} disabled={timerLoading} className="btn-danger">
                <Square size={14} fill="currentColor" />
                Stop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Today's Time"
          value={formatDurationShort(daily?.totalTrackedSeconds || 0)}
          sub="tracked today"
          icon={Clock} color="brand"
          className="stagger-1"
        />
        <SummaryCard
          label="This Week"
          value={formatDurationShort(weekly?.totalTrackedSeconds || 0)}
          sub={`avg ${formatDurationShort(weekly?.avgDailySeconds || 0)}/day`}
          icon={TrendingUp} color="blue"
          className="stagger-2"
        />
        <SummaryCard
          label="Completed"
          value={daily?.completedTasks || 0}
          sub="total tasks done"
          icon={CheckSquare} color="brand"
          className="stagger-3"
        />
        <SummaryCard
          label="Pending"
          value={(daily?.pendingTasks || 0) + (daily?.inProgressTasks || 0)}
          sub={`${daily?.inProgressTasks || 0} in progress`}
          icon={ListTodo} color="orange"
          className="stagger-4"
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Weekly trend — takes 2/3 */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-semibold text-slate-900 dark:text-white">Weekly Trend</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Hours tracked per day</p>
            </div>
            <span className="badge bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400">
              {weekly?.weekStart} → {weekly?.weekEnd}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="seconds" stroke="#22c55e" strokeWidth={2} fill="url(#grad)" dot={{ fill: "#22c55e", r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Time by category */}
        <div className="card p-5">
          <div className="mb-5">
            <h2 className="font-display font-semibold text-slate-900 dark:text-white">By Category</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">This week</p>
          </div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-slate-600 dark:text-slate-400">{d.name}</span>
                    </div>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{formatDurationShort(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-32 flex items-center justify-center text-sm text-slate-400">No data yet</div>
          )}
        </div>
      </div>

      {/* Today's tasks + recent logs */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Tasks worked on today */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-slate-900 dark:text-white">Today's Tasks</h2>
            <button onClick={() => navigate("/tasks")} className="text-xs text-brand-500 hover:text-brand-600 font-medium">View all →</button>
          </div>
          {daily?.tasksWorkedOn?.length > 0 ? (
            <div className="space-y-2">
              {daily.tasksWorkedOn.map((t) => {
                const cfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.PENDING;
                return (
                  <div key={t.taskId} onClick={() => navigate(`/tasks/${t.taskId}`)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                      <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{t.title}</span>
                    </div>
                    <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 shrink-0 ml-2">
                      {formatDurationShort(t.timeSpentSeconds)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-slate-400">
              No time tracked today.<br />
              <button onClick={() => navigate("/tasks")} className="text-brand-500 hover:text-brand-600 mt-1">Start a task →</button>
            </div>
          )}
        </div>

        {/* Recent time logs */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-slate-900 dark:text-white">Recent Logs</h2>
            <button onClick={() => navigate("/time-logs")} className="text-xs text-brand-500 hover:text-brand-600 font-medium">View all →</button>
          </div>
          {recentLogs.length > 0 ? (
            <div className="space-y-2">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{log.task?.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatTime(log.startTime)} → {log.endTime ? formatTime(log.endTime) : "running"}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-mono font-semibold text-slate-700 dark:text-slate-200">
                      {formatDurationShort(log.durationSeconds)}
                    </p>
                    <span className={`text-xs ${log.source === "MANUAL" ? "text-violet-500" : "text-brand-500"}`}>
                      {log.source === "MANUAL" ? "Manual" : "Timer"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-slate-400">No recent logs</div>
          )}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
