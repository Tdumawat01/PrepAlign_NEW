import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { API } from "../lib/constants";

const AuthContext = createContext(null);

/** Paths that never need a session bootstrap. */
const PUBLIC_PATHS = new Set(["/", "/privacy", "/terms", "/waitlist/thanks", "/waitlist"]);

function needsAuthBootstrap() {
  if (typeof window === "undefined") return false;
  if (window.location.hash?.includes("session_id=")) return false;
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  if (PUBLIC_PATHS.has(path)) return false;
  // Admin / login / other app surfaces
  return true;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => needsAuthBootstrap());

  const checkAuth = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/auth/me`, { withCredentials: true });
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!needsAuthBootstrap()) {
      setLoading(false);
      return;
    }
    checkAuth();
  }, [checkAuth]);

  const logout = useCallback(async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    } catch {
      /* noop */
    }
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, setUser, loading, logout, refresh: checkAuth }),
    [user, loading, logout, checkAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
