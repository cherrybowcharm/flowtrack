import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard, CheckSquare, Clock, BarChart2,
  Settings, LogOut, Menu, X, Zap,
} from "lucide-react";
import { useAuth }  from "../context/AuthContext";
import { useTimer } from "../context/TimerContext";
import { formatTimer } from "../utils/formatTime";
import toast from "react-hot-toast";

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/tasks",     icon: CheckSquare,     label: "Tasks" },
  { to: "/time-logs", icon: Clock,           label: "Time Logs" },
  { to: "/summary",   icon: BarChart2,       label: "Summary" },
  { to: "/settings",  icon: Settings,        label: "Settings" },
];

export default function Layout() {
  const { user, logout }            = useAuth();
  const { isRunning, elapsed, activeTask, stopTimer } = useTimer();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
    toast.success("Logged out");
  }

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
      isActive
        ? "bg-brand-500 text-white shadow-sm shadow-brand-500/30"
        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
    }`;

  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile ? "flex" : "hidden lg:flex"} flex-col w-60 shrink-0 h-full`}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center shadow-sm shadow-brand-500/40">
          <Zap size={16} className="text-white" />
        </div>
        <span className="font-display font-bold text-lg text-slate-900 dark:text-white tracking-tight">
          FlowTrack
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={navLinkClass} onClick={() => setSidebarOpen(false)}>
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Active timer mini-card */}
      {isRunning && (
        <div className="mx-3 mb-3 p-3 rounded-xl bg-brand-500/10 dark:bg-brand-500/10 border border-brand-500/20">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-brand-500 timer-ring" />
            <span className="text-xs font-medium text-brand-700 dark:text-brand-400">Live Timer</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 truncate mb-1.5">
            {activeTask?.title}
          </p>
          <p className="font-mono text-lg font-semibold text-slate-900 dark:text-white">
            {formatTimer(elapsed)}
          </p>
        </div>
      )}

      {/* User info + logout */}
      <div className="border-t border-slate-200 dark:border-slate-700/50 p-3">
        <div className="flex items-center gap-2.5 px-2 py-1.5 mb-1">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-ghost w-full justify-start text-slate-500 hover:text-red-500 dark:hover:text-red-400 text-sm">
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-surface-50 dark:bg-surface-950">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-60 shrink-0 border-r border-slate-200 dark:border-slate-700/50 bg-white dark:bg-surface-900">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-surface-900 border-r border-slate-200 dark:border-slate-700/50 flex flex-col z-10">
            <button className="absolute top-4 right-4 btn-ghost p-1.5" onClick={() => setSidebarOpen(false)}>
              <X size={18} />
            </button>
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700/50 bg-white dark:bg-surface-900">
          <button className="btn-ghost p-1.5" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <span className="font-display font-bold text-slate-900 dark:text-white">FlowTrack</span>
          {isRunning && (
            <span className="font-mono text-sm font-semibold text-brand-500">{formatTimer(elapsed)}</span>
          )}
          {!isRunning && <div className="w-8" />}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
