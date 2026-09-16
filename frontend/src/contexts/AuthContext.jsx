import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api, { setAccessToken as setApiToken, clearAccessToken } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAccessToken = useCallback(async () => {
    try {
      const res = await api.post("/auth/refresh");
      setApiToken(res.data.accessToken);
      setAccessToken(res.data.accessToken);
      if (res.data.user) {
        setUser(res.data.user);
      }
      return res.data.accessToken;
    } catch {
      clearAccessToken();
      setAccessToken(null);
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchAccessToken().finally(() => setLoading(false));
  }, [fetchAccessToken]);

  const login = async (username, password) => {
    const res = await api.post("/auth/login", { username, password });
    setApiToken(res.data.accessToken);
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (data) => {
    const res = await api.post("/auth/register", data);
    setApiToken(res.data.accessToken);
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    clearAccessToken();
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        accessToken,
        setAccessToken,
        loading,
        login,
        register,
        logout,
        fetchAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
