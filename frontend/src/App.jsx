import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login      from "./pages/Login";
import Signup     from "./pages/Signup";
import Dashboard  from "./pages/Dashboard";
import Tasks      from "./pages/Tasks";
import TaskDetails from "./pages/TaskDetails";
import TimeLogs   from "./pages/TimeLogs";
import Summary    from "./pages/Summary";
import Settings   from "./pages/Settings";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-brand-500 animate-pulse-slow" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login"  element={!user ? <Login />  : <Navigate to="/dashboard" replace />} />
      <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" replace />} />

      {/* Protected routes — all wrapped in Layout (sidebar + navbar) */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard"      element={<Dashboard />} />
        <Route path="/tasks"          element={<Tasks />} />
        <Route path="/tasks/:id"      element={<TaskDetails />} />
        <Route path="/time-logs"      element={<TimeLogs />} />
        <Route path="/summary"        element={<Summary />} />
        <Route path="/settings"       element={<Settings />} />
      </Route>

      {/* Default redirect */}
      <Route path="/"  element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="*"  element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}
