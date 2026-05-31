import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../services/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, try to restore session from HTTP-only cookie
  useEffect(() => {
    authApi.me()
      .then((res) => setUser(res.data.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(credentials) {
    const res = await authApi.login(credentials);
    setUser(res.data.data.user);
    return res.data.data.user;
  }

  async function signup(data) {
    const res = await authApi.signup(data);
    setUser(res.data.data.user);
    return res.data.data.user;
  }

  async function logout() {
    await authApi.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
