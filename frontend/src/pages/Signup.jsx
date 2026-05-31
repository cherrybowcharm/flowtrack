import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Signup() {
  const [form, setForm]       = useState({ name: "", email: "", password: "" });
  const [show, setShow]       = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup }            = useAuth();
  const navigate              = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password.length < 8) return toast.error("Password must be at least 8 characters");
    setLoading(true);
    try {
      await signup(form);
      navigate("/dashboard");
      toast.success("Account created! Welcome to FlowTrack 🚀");
    } catch (err) {
      toast.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-6">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center shadow-sm shadow-brand-500/30">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg text-slate-900 dark:text-white">FlowTrack</span>
        </div>

        <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white mb-1">Create account</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          Already have one?{" "}
          <Link to="/login" className="text-brand-500 hover:text-brand-600 font-medium">Sign in</Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Full Name</label>
            <input
              required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name" className="input" autoComplete="name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Email</label>
            <input
              type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com" className="input" autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"} required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 8 characters" className="input pr-10"
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
