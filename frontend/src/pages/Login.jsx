import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const [form, setForm]       = useState({ email: "", password: "" });
  const [show, setShow]       = useState(false);
  const [loading, setLoading] = useState(false);
  const { login }             = useAuth();
  const navigate              = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      navigate("/dashboard");
      toast.success("Welcome back!");
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-surface-50 dark:bg-surface-950">
      {/* Left — branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-surface-900 dark:bg-surface-950 p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 -left-20 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl" />
          <div className="absolute bottom-20 right-0 w-60 h-60 rounded-full bg-brand-500/5 blur-2xl" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}
          />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Zap size={20} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">FlowTrack</span>
        </div>

        <div className="relative space-y-6">
          <h1 className="font-display font-bold text-4xl text-white leading-tight">
            Track time.<br />
            <span className="text-brand-400">Stay focused.</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
            Manage tasks, track time automatically, and understand your productivity with beautiful analytics.
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            {["Real-time timer", "Daily summaries", "Task management", "Analytics charts"].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-600">© 2026 FlowTrack</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-slate-900 dark:text-white">FlowTrack</span>
          </div>

          <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white mb-1">Sign in</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
            Don't have an account?{" "}
            <Link to="/signup" className="text-brand-500 hover:text-brand-600 font-medium">Create one</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Email</label>
              <input
                type="email" required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="input"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"} required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="input pr-10"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-6 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-600 dark:text-slate-300">Demo: </span>
            demo@example.com / password123
          </div>
        </div>
      </div>
    </div>
  );
}
