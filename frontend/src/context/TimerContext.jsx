import { createContext, useContext, useEffect, useRef, useState } from "react";
import { timeLogApi } from "../services/timeLogApi";
import { taskApi }    from "../services/taskApi";
import { useAuth }    from "./AuthContext";
import { getElapsedSeconds } from "../utils/formatTime";

const TimerContext = createContext(null);

export function TimerProvider({ children }) {
  const { user } = useAuth();

  // Active timer state
  const [activeLog,    setActiveLog]    = useState(null);   // TimeLog object from API
  const [activeTask,   setActiveTask]   = useState(null);   // Task object
  const [elapsed,      setElapsed]      = useState(0);      // seconds
  const [timerLoading, setTimerLoading] = useState(false);

  const intervalRef = useRef(null);

  // ── Fetch active timer on login / page refresh ───────────────────────────
  useEffect(() => {
    if (!user) {
      clearTimer();
      return;
    }
    fetchActive();
  }, [user]);

  async function fetchActive() {
    try {
      const res = await timeLogApi.getActive();
      const log = res.data.data.activeLog;
      if (log) {
        setActiveLog(log);
        setActiveTask(log.task);
        setElapsed(getElapsedSeconds(log.startTime));
        startInterval();
      }
    } catch {
      // silently ignore — user just has no active timer
    }
  }

  // ── Tick every second ────────────────────────────────────────────────────
  function startInterval() {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setElapsed((s) => s + 1);
    }, 1000);
  }

  function clearTimer() {
    clearInterval(intervalRef.current);
    setActiveLog(null);
    setActiveTask(null);
    setElapsed(0);
  }

  // ── Start ────────────────────────────────────────────────────────────────
  async function startTimer(task) {
    setTimerLoading(true);
    try {
      const res = await taskApi.start(task.id);
      const log = res.data.data.timeLog;
      setActiveLog(log);
      setActiveTask(task);
      setElapsed(getElapsedSeconds(log.startTime));
      startInterval();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setTimerLoading(false);
    }
  }

  // ── Stop ─────────────────────────────────────────────────────────────────
  async function stopTimer() {
    if (!activeLog) return { success: false };
    setTimerLoading(true);
    try {
      const res = await taskApi.stop(activeLog.taskId);
      clearTimer();
      return { success: true, timeLog: res.data.data.timeLog };
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setTimerLoading(false);
    }
  }

  return (
    <TimerContext.Provider
      value={{
        activeLog,
        activeTask,
        elapsed,
        timerLoading,
        isRunning: !!activeLog,
        startTimer,
        stopTimer,
        refreshActive: fetchActive,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export const useTimer = () => useContext(TimerContext);
