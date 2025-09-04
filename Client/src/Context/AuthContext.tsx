import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

interface AuthContextType {
  registerUser: (data: any) => Promise<{ ok: boolean; result: any }>;
  loginUser: (data: any) => Promise<{ ok: boolean; result: any }>;
  logoutUser: () => void;
  updateUser: (data: any) => Promise<{ ok: boolean; result: any }>;
  deleteUser: (userId: string) => Promise<{ ok: boolean; result: any }>;
  isLogged: boolean;
  setIsLogged: (v: boolean) => void;
  userId: string | null;
  setUserId: any;
  userRole: string | null;
  setUserRole: (role: string | null) => void;
}


const AuthContext = createContext<AuthContextType | null>(null);
const API_BASE = "http://127.0.0.1:8000";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user_email");
    const storedRole = localStorage.getItem("user_role");
    if (storedUser) {
      setIsLogged(true);
      setUserId(storedUser);
      setUserRole(storedRole);
    }
  }, []);

  const registerUser = useCallback(async (data: any) => {
    try {
      const res = await fetch(`${API_BASE}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json().catch(() => ({}));
      return { ok: res.ok, result };
    } catch (err: any) {
      return { ok: false, result: { detail: err.message || "Network error" } };
    }
  }, []);

  const loginUser = useCallback(async (data: any) => {
    try {
      const res = await fetch(`${API_BASE}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.access_token) {
        return {
          ok: false,
          result: { detail: result.detail || "Invalid email or password" },
        };
      }

      localStorage.setItem("token", result.access_token);
      localStorage.setItem("user_email", result.user.email);
      localStorage.setItem("user_role", result.user.role || "user");
      setIsLogged(true);
      setUserId(result.user.email);
      setUserRole(result.user.role || "user");
      localStorage.setItem("user_id",result.user.id)
      localStorage.setItem("user_name",result.user.name)
      return { ok: true, result };
    } catch (err: any) {
      return { ok: false, result: { detail: err.message || "Network error" } };
    }
  }, []);

  const logoutUser = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_id")
    localStorage.removeItem("user_name")
    setIsLogged(false);
    setUserId(null);
    setUserRole(null);
    const session = localStorage.getItem("session_id") || (() => {
      const newSession =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2);
      localStorage.setItem("session_id", newSession);
      return newSession;
    })();
  }, []);

  // ✅ Update User Info
  const updateUser = useCallback(async (data: any) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/users/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const result = await res.json().catch(() => ({}));
      return { ok: res.ok, result };
    } catch (err: any) {
      return { ok: false, result: { detail: err.message || "Network error" } };
    }
  }, []);

  // ✅ Delete User
  const deleteUser = useCallback(async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/users/delete/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json().catch(() => ({}));

      if (res.ok) {
        logoutUser(); // Logout after deleting account
      }

      return { ok: res.ok, result };
    } catch (err: any) {
      return { ok: false, result: { detail: err.message || "Network error" } };
    }
  }, [logoutUser]);

  return (
    <AuthContext.Provider
      value={{
        registerUser,
        loginUser,
        logoutUser,
        updateUser,
        deleteUser,
        isLogged,
        setIsLogged,
        userId,
        setUserId,
        userRole,
        setUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};



