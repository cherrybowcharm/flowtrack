import { useNavigate } from "react-router-dom";
import { Sun, Moon, Monitor, LogOut, User, Mail, Calendar } from "lucide-react";
import { useAuth }  from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";

const THEMES = [
  { value: "light",  label: "Light",  icon: Sun },
  { value: "dark",   label: "Dark",   icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export default function Settings() {
  const { user, logout }    = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate            = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
    toast.success("Logged out successfully");
  }

  return (
    <div className="page max-w-2xl space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Profile card */}
      <div className="card p-6">
        <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
          <User size={16} className="text-brand-500" /> Profile
        </h2>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-brand-500/20">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white text-lg">{user?.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { icon: User,     label: "Full Name", value: user?.name },
            { icon: Mail,     label: "Email",     value: user?.email },
            { icon: Calendar, label: "Member Since", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" }) : "—" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <Icon size={15} className="text-slate-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Theme card */}
      <div className="card p-6">
        <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
          <Sun size={16} className="text-brand-500" /> Appearance
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Choose how FlowTrack looks on your device.</p>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => { setTheme(value); toast.success(`${label} mode activated`); }}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150 ${
                theme === value
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
                  : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <Icon size={22} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="card p-6 border-red-200/50 dark:border-red-800/30">
        <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
          <LogOut size={16} className="text-red-500" /> Account
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Sign out of your account on this device.</p>
        <button onClick={handleLogout} className="btn-danger">
          <LogOut size={15} /> Sign out
        </button>
      </div>

      {/* App info */}
      <div className="text-center py-2">
        <p className="text-xs text-slate-400">FlowTrack v1.0.0 · Built with React + Express</p>
      </div>
    </div>
  );
}
